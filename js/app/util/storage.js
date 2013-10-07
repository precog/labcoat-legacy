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
      "app/util/traverse"
    , "libs/jquery/jstorage/jstorage"
],

function(traverse) {
  var localStorage = window.localStorage || {
        data : {},
        length : 0,
        key : function(index) {
          var i = 0;
          for(var key in this.data) {
            if(index === i)
              return key;
            i++;
          }
        },
        getItem : function(key) {
          return data[key];
        },
        setItem : function(key, data) {
          this.data[key] = data;
        },
        removeItem : function(key) {
          delete this.data[key];
        }
      };
  var store = {
    set : function(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch(e) {
        console.error(e);
      }
    },
    get : function(key) {
      var v = localStorage.getItem(key);
      if(v)
        return JSON.parse(v);
      else
        return null;
    }
  };

  function migrate() {
    var keys = $.jStorage.index(),
        migrated = false;
    keys.map(function(key) {
      if(key.indexOf("labcoat") < 0 && key.indexOf("quirrel") < 0) return;
      var value = $.jStorage.get(key);
      store.set(key, value);
      $.jStorage.deleteKey(key);
      migrated = true;
    });
    if(migrated)
      console.log("MIGRATED LOCAL STORAGE");
    $.jStorage.flush();
  }

  $(migrate);

  return function(key, defaults) {
    var LIMIT_SIZE = 500,
        dirty  = false,
        params = $.extend({}, defaults);

    function cloneLimited(obj, limit) {
      // Handle the 3 simple types, and null or undefined
      if (null == obj || "object" !== typeof obj) return obj;

      // Handle Date
      if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
      }

      // Handle Array
      if (obj instanceof Array) {
        var copy = [],
            len  = obj.length;
        if(len > limit) {
          len = limit;
        }
        for (var i = 0; i < len; ++i) {
          copy[i] = cloneLimited(obj[i], limit);
        }
        return copy;
      }

      // Handle Object
      if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
          if (obj.hasOwnProperty(attr)) copy[attr] = cloneLimited(obj[attr], limit);
        }
        return copy;
      }

      throw new Error("Unable to copy obj! Its type isn't supported.");
    }

    function save() {
      var o = cloneLimited(params, LIMIT_SIZE);
      var result = store.set(key, o);
      dirty = false;
    }

    function load() {
      if(enableDebug)
        console.log("Load Storage Data");
//      $.jStorage.reInit();
      var value = store.get(key);
      $.extend(params, value);
    }

    var delayedSave = function() {
      dirty = true;
      clearInterval(this.killDelayedSave);
      this.killDelayedSave = setTimeout(function() { save(); }, 100);
    };

    load();

    var enableDebug = false;

    function debug(action, key, value) {
      if(!enableDebug) return;
      var s = ((("undefined" !== typeof value) && JSON.stringify(value)) || ""),
          len = 100,
          ellipsis = '...';
      if(s.length > len - ellipsis.length) {
        s = s.substr(0, len - ellipsis.length) + ellipsis;
      }
      console.log(((action && (action + " ")) || "") + key + ((s && ": " + s) || ""));
    }

    var storage = {
          get : function(key, alternative) {
            var v = traverse.get(params, key);

            debug("get", key, v);

            if("undefined" === typeof v)
              return alternative;
            else
              return v;
          },
          set : function(key, value, instant) {
            if(traverse.set(params, key, value))
            {
              debug("set", key, value);
              this.save(instant);
            }
          },
          remove : function(key, instant) {
            debug("del", key);
            traverse.remove(params, key);
            this.save(instant);
          },
          keys : function(key) {
            var ref = traverse.get(params, key);
            if(ref && "object" === typeof ref) {
              var result = [];
              for(var k in ref) {
                if (ref.hasOwnProperty(k)) {
                  result.push(k);
                }
              }
              return result;
            } else {
              return [];
            }
          },
          save : function(instant) {
            if(instant)
              save();
            else
              delayedSave();
          },
          load : function() {
            load();
          },
          toString : function() {
            return JSON.stringify(params);
          },
          all : function() {
            return params;
          },
          dirty : function() {
            return dirty;
          }
      };
    return storage;
  };
});