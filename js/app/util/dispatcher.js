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

],

function() {

  function skipArgs(args, skip) {
    var len = args.length,
      result = [];
    for(var i = skip; i < len; i++) {
      result.push(args[i]);
    }
    return result;
  }

  return function() {
    var map = {}, wrapper;
    return wrapper = {
      emit : function(emitter, type){
        var listeners = map[type] || [];
        for(var i = 0; i < listeners.length; i++) {
          if(listeners[i].apply(emitter, skipArgs(arguments, 2)) === false)
            break;
        }
      },
      on : function(type, handler) {
        var list = map[type] || (map[type] = []);
        if(list.indexOf(handler) >= 0) return false;
        list.push(handler);
        return true;
      },
      off : function(type, handler) {
        var list = map[type], pos;
        if(!list || (pos = list.indexOf(handler)) < 0) false;
        list.splice(pos, 1);
        return true;
      }
    };
  }
});