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
      "app/util/precog"
    , "app/util/storage"
    , "app/util/md5"
],
function(precog, createStorage, md5) {
    var wrapper,
        DEFAULT_MAX_VALUES = 20;

    function encode(name) {
//        if(name.substr(0,1) === "*")
//            name = name.substr(1);
        var map = this.map || (this.map = {});
        if(!map[name]) {
            map[name] = md5(name);
        }
        return map[name];
    }
    return function() {
      var STORAGE_KEY = "pg-quirrel-history-"+precog.hash,
          store = createStorage(STORAGE_KEY);
      return wrapper = {
          revisions : function(name) {
              var id = encode(name),
                  history = store.get("history."+id, []);
              return history.slice(0);
          },
          save : function(name, code, data) {
              var id = encode(name),
                  history = store.get("history."+id, []);
              code = code.trim();
              if(code === (history[0] && history[0].code)) return;
              var value  = (data && "undefined" !== typeof data[0]) ? data[0] : null,
                  length = (data && data.length) || 0,
                  timestamp = +new Date();
              history.unshift({
                  timestamp : timestamp,
                  code : code,
                  sample : {
                      first  : value,
                      length : length
                  }
              });
              store.set("result."+id+"."+timestamp, data);
              var values = this.getHistoryLength();
              while(history.length > values) {
                  var removed = history.pop();
                  store.remove("result."+id+"."+removed.timestamp);
              }
              store.set("history."+id, history, true);
          },
          load : function(name, index) {
              var history = this.revisions(name),
                  rev = history[index];
              if(!rev) return null;

              var id = encode(name);
              return {
                  index : index,
                  timestamp : rev.timestamp,
                  code: rev.code,
                  data : store.get("result."+id+"."+rev.timestamp)
              };
          },
          setHistoryLength : function(values) {
              store.set("max_values", +values);
          },
          getHistoryLength : function() {
              return store.get("max_values", DEFAULT_MAX_VALUES);
          },
          remove : function(name) {
              var id = encode(name);
          },
          rename : function(oldname, newname) {
              var oldid = encode(oldname),
                  newid = encode(newname),
                  history = store.get("history."+oldid),
                  results = store.get("result."+oldid);

              store.remove("history."+oldid);
              store.remove("result."+oldid);
              store.set("history."+newid, history);
              store.set("result."+newid, results, true);
          }
      };
    };
});