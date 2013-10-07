/*
 *  _       _                     _   
 * | |     | |                   | |  
 * | | __ _| |__   ___ ___   __ _| |_               Labcoat (R)
 * | |/ _` | '_ \ / __/ _ \ / _` | __|              Powerful development environment for Quirrel.
 * | | (_| | |_) | (_| (_) | (_| | |_               Copyright (C) 2010 - 2013 SlamData, Inc.
 * |_|\__,_|_.__/ \___\___/ \__,_|\__|              All Rights Reserved.
 *
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the 
 * GNU Affero General Public License as published by the Free Software Foundation, either version 
 * 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; 
 * without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See 
 * the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this 
 * program. If not, see <http://www.gnu.org/licenses/>.
 *
 */
define([
      "app/util/querystring"
    , "app/util/md5"
    , "app/util/guid"
	  , "app/util/ie"
    , "app/util/config"
//	, "app/util/uploadservice"
    , "libs/precog/precog"
//    , "https://api.reportgrid.com/js/precog.js"
//    , "http://localhost/rg/js/precog.js"
],

function(qs, md5, guid, ie, localConfig /*, upload*/){
    var config   = window.Precog.$.Config,
        params   = ["apiKey", "analyticsService", "basePath", "limit", "theme"],
        contexts = [null],
        reprecog = /(require|precog|quirrel)[^.]*.js[?]/i;

	if(!ie.isIE() /*|| ie.greaterOrEqualTo(10)*/)
		window.Precog.$.Http.setUseJsonp(window.Precog.$.PageConfig.useJsonp === "true");


    var precog = ".precog.com",
        host   = window.location.host;
    if(host.substr(host.length - precog.length) === precog) {
      config.analyticsService = window.location.protocol + "//" + host + "/";
    }

    $('script').each(function() {
        if(!this.src || !reprecog.test(this.src)) return;
        contexts.push(this.src);
    });

    function appendConfig(ctx) {
        for(var i = params.length-1; i >= 0; i--) {
            var param = params[i],
                value = qs.get(param, ctx);
            if(value !== "") {
                config[param] = value;
                params.splice(i, 1);
            }
        }
    }

    while(contexts.length > 0 && params.length > 0) {
        appendConfig(contexts.shift());
    }

    if(!config.limit)
      config.limit = localConfig.get("queryLimit");

    $(localConfig).on("queryLimit", function(_, value) {
      config.limit = value;
    });

    var map = {},
        q = {
          ingest : function(path, data, type, progress, complete, error) {
  //          if(config.useJsonp) {
  //            upload.ingest(path, data, type, progress, complete, error);
  //          } else {
              window.Precog.ingest(path, data, type, complete, error, { progress : progress });
  //          }
          },
          deletePath : function(path, recursive, callback) {
            window.Precog.deletePath(path,
              function(r) {
                callback && callback(true);
              },
              function(code, e) {
                if(callback)
                   callback(false);
                else
                  throw "Unable To Delete Path";
              }, {
              recursive : recursive
            });
          },
          query : function(text, options) {
              var params = {},
                  id = guid(),
                  limit = config.limit;
              options = options || {};
              params.limit = options.limit && options.limit < config.limit ? options.limit : config.limit;
              if(options.skip)
                params.offset = options.skip; // TODO UPDATE TO SKIP
              if(options.sort) {
                params.sortOn = options.sort.map(function(v) { return v.field; });
                params.sortOrder = options.sort[0].asc ? "asc" : "desc";
              }
              params.format = "detailed";
              $(q).trigger("execute", [text, this.lastExecution, id]);
              var me = this,
                  start = new Date().getTime();
              map[id] = window.Precog.query(text, function(data, result, headers) {
                  if(!map[id]) {
                    return;
                  }
                  var errors   = result.errors,
                      warnings = result.warnings;

                  if(result.serverErrors && result.serverErrors.length)
                    errors = errors.concat(result.serverErrors);
                  if(result.serverWarnings && result.serverWarnings.length)
                    warnings = warnings.concat(result.serverWarnings);

                  me.lastExecution = new Date().getTime() - start;
                  var extra = null;
                  if("undefined" !== typeof options.skip) {
                    extra = {
                      skip : options.skip,
                      limit : options.limit,
                      count : headers["X-Quirrel-Count"] || 1000
                    };
                  }
                  delete map[id];
                  $(q).trigger("completed", [id, data, errors, warnings, extra]);
              }, function(code, e) {
                  if(!map[id]) {
                    return;
                  }
                  if("string" == typeof e) e = { message : e };
                  delete map[id];
                  $(q).trigger("failed", [id, e]);
              }, params) || true;
          },
          paths : function(parent, callback) {
              window.Precog.retrieveMetadata(parent, function(r) {
                 var paths = r.children.map(function(path) {
                               path = path.substr(-1) === '/' && path.substr(0, path.length-1) || path;
                               if(path.substr(0, 1) !== '/')
                                  path = '/' + path;
                               return path;
                             }).sort(),
                     has_records = r.size || r.structure && r.structure.children && r.structure.children.length > 0;
                  callback(paths, has_records, r.size);
              }, function(code, e) {
                throw "Unable To Query Path API";
              });
          },
          is_demo : function() {
            var domains = ["labcoat.precog.com", "demo.precog.com"],
                service = config.analyticsService;
            for(var i = 0; i < domains.length; i++) {
              if(service.indexOf("http://"+domains[i]+"/") === 0 || service.indexOf("https://"+domains[i]+"/") === 0) {
                return true;
              }
            }
            return false;
          },
          config : config,
          lastExecution : 2000,
          cache : window.Precog.cache,
          calculateHash : function() {
            q.hash = md5(config.apiKey || "");
          }
        };

    $(q).on("abort", function(_, id) {
      if("undefined" === map[id]) return;
      var xhr = (map[id] && map[id].abort) ? map[id] : null;
      delete map[id];
      if(xhr) xhr.abort();
      $(q).trigger("aborted", id);
    });

    q.calculateHash();
    return q;
});