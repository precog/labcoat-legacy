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
      "app/util/converters"
    , "app/util/precog"
    , "app/util/ui"
],

function(convert, precog, ui) {
  return function() {
    var apiKey   = precog.config.apiKey,
        service  = precog.config.analyticsService,
        basePath = (precog.config.basePath || "").trim(),
        version  = precog.config.version
    ;

    if(basePath.substr(-1) === "/")
      basePath = basePath.substr(0, basePath.length - 1);
    if(basePath.substr(0, 1) === "/")
      basePath = basePath.substr(1);
    function escapeQuotes(s) {
        return s.replace(/"/g, '\\"');
    }

    function urlEncode(query) {
      return service
        + "analytics/"
        + (version && version !== false && version !== "false" ? "v" + version + "/" : "")
        + "fs/"
        + basePath
        + "?apiKey=" + encodeURIComponent(apiKey)
        + "&q=" + encodeURIComponent(convert.minifyQuirrel(query))
      ;
    }

    function removeProtocol(url) {
      url = url.split("//").pop();
      if(url.substr(-1) === "/")
        url = url.substr(0, url.length - 1);
      return url;
    }

    return [{
        token: "qrl",
        name : "Quirrel",
        handler : function(code, options) {
            if(options.compact)
                return convert.minifyQuirrel(code);
            else
                return "-- Quirrel query generated with Labcoat by Precog\n\n" + code.trim();
        },
        options : { compact : false },
        buildOptions : function(el, handler) {
            var action = this;
            ui.checks(el, [{
                name : "options",
                checked : this.options.compact,
                label : "compact",
                description : "remove newlines and comments from query",
                handler : function() {
                    action.options.compact = $(this).prop("checked");
                    handler();
                }
            }]);
        }
    }, {
        token: "html",
        name : "HTML",
        handler : function(code) {
            code = escapeQuotes(convert.minifyQuirrel(code));
            var url = 'http://api.reportgrid.com/js/precog.js?apiKey='+apiKey+(version === false || version === "false" ? "&version=false" : "")+(basePath?"&basePath="+encodeURIComponent(basePath):"")+'&analyticsService='+service;
            return '<!DOCTYPE html>\n<html>\n<head>\n<title>Quirrel Query</title>\n<script src="'+url+'"></script>\n' +
                "<script>\n" +
                "function init() {\n" +
                "  // Quirrel query in JavaScript generated with Labcoat by Precog\n" +
                '  Precog.query("'+code+'",\n    function(data) {\n      /* do something with the data */\n      console.log(data);\n    },\n    function(error) { console.log(error); }\n  );\n' +
                "}\n" +
                "</script>\n</head>\n<body onload=\"init()\">\n</body>\n</html>";
        }
    }, {
      token: "js",
      name : "JavaScript",
      handler : function(code) {
        code = escapeQuotes(convert.minifyQuirrel(code));
        return "// Quirrel query in JavaScript generated with Labcoat by Precog\n\n" +
          'Precog.query("'+code+'",\n  function(data) { /* do something with the data */ },\n  function(error) { console.log(error); }\n);';
      }
    }, {
      token: "php",
      name : "PHP",
      handler : function(code) {
        code = escapeQuotes(convert.minifyQuirrel(code));
        return '<?php\n\n' +
          "// Quirrel query in PHP generated with Labcoat by Precog\n\n" +
          'require_once("Precog.php");\n\n' +
          '' +
          '$precog = new PrecogAPI("'+apiKey+'", "/'+(basePath?basePath+"/":"")+'", "'+service+'");\n$result = $precog->query("'+code+'");\n' +
          'if(false === $precog) {\n' +
          '  die($precog->errorMessage());\n' +
          '} else {\n' +
          '  // do something with $result here\n' +
          '}\n?>'
          ;
      }
    }, {
      token: "python",
      name : "Python",
      handler : function(code) {
        code = escapeQuotes(convert.minifyQuirrel(code));
        var s = removeProtocol(service);
        return 'api = precog.Precog("'+apiKey+'", "'+s+'", 443)\n' +
          'response = api.query("/'+basePath+'", "'+code+'")'
          ;
      }
    }, {
      token: "ruby",
      name : "Ruby",
      handler : function(code) {
        code = escapeQuotes(convert.minifyQuirrel(code));
        var s = removeProtocol(service);
        return 'api = Precog::Precog.new("'+apiKey+'", "'+s+'", 443)\n' +
          'response = api.query("/'+basePath+'", "'+code+'")'
          ;
      }
    }, {
      token: "java",
      name : "Java",
      handler : function(code) {
        code = escapeQuotes(convert.minifyQuirrel(code));
        var s = removeProtocol(service);
        return  '// import com.precog.api.Client;\n' +
                '// import com.precog.api.Path;\n' +
                '// import com.precog.api.ServiceBuilder;\n\n' +
                'Client testClient = new Client(ServiceBuilder.service("'+s+'"), "'+apiKey+'");\n' +
                'String result = testClient.query(new Path("/'+basePath+'"), "'+code+'");'
                ;
      }
    }, {
      token: "cs",
      name : "C#",
      handler : function(code) {
        code = escapeQuotes(convert.minifyQuirrel(code));
        return  '// using Precog.Client;\n\n' +
                'PrecogClient api = ServiceStack.CreatePrecogClient(new Uri("'+service+'"), "'+apiKey+'");\n' +
                'string[] result = api.Query<string[]>("/'+basePath+'", "'+code+'");'
                ;
      }
    }, {
      token : "url",
      name : "URL",
      handler : function(code) {
        return urlEncode(code);
      }
    }, {
      token : "curl",
      name : "cURL",
      handler : function(code) {
        return 'curl "'+escapeQuotes(urlEncode(code))+'"';
      }
    }];
  };
});