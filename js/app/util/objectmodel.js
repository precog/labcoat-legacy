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
  "app/util/dispatcher"
],

function(createDispatcher) {

  return function() {
    var map = {},
        dispatcher = createDispatcher(),
        model,
        validMap = {},
        isValid = true;
    
    function validate() {
      for(key in validMap)
        if(validMap.hasOwnProperty(key))
          return false;
      return true;
    }

    return model = {
      addField : function(name, field) {
        this.removeField(name);
        map[name] = field;
        field.on("value.change", function() {
          dispatcher.emit(this, "value.change", name, field);
          if(!isValid) {
            delete validMap[name];
            isValid = validate();
          }
          if(isValid) {
            dispatcher.emit(this, "validation.success", name, field);
          }
          dispatcher.emit(this, "object.change", name, field);
        });
        field.on("validation.error", function() {
          isValid = false;
          validMap[name] = true;
          dispatcher.emit(this, "validation.error", name, field);
        });
        dispatcher.emit(this, "field.add", name, field);
      },
      removeField : function(name) {
        if(!this.hasField(name)) return false;
        var field = map[name];
        delete map[name];
        dispatcher.emit(this, "field.remove", name, field);
      },
      hasField : function(name) {
        return !!map[name];
      },
      getField : function(name) {
        return map[name];
      },
      get : function(name) {
        var field = this.getField(name);
        if(null == field)
          return null;
        return field.get();
      },
      on : function(type, handler) {
        dispatcher.on(type, handler);
      },
      off : function(type, handler) {
        dispatcher.off(type, handler);
      },
      isValid : function() {
        return isValid;
      },
      reset : function() {
        for(name in map) {
          if(map.hasOwnProperty(name)) {
            map[name].reset();
          }
        }
      },
      hasChanged : function() {
        for(name in map) {
          if(map.hasOwnProperty(name) && !map[name].isDefault()) {
            return true;
          }
        }
        return false;
      }
    };
  }
});