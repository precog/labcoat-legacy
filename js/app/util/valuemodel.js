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

  return function(defaultValue, defaultValidator, defaultFilter) {
    var model,
        value = defaultValue,
        validator = defaultValidator || function() { return null;},
        filter = defaultFilter || function(v) { return v;},
        dispatcher = createDispatcher(),
        lastError
      ;

    return model = {
      set : function(newvalue) {
        if((lastError = validator(newvalue)) !== null) {
          dispatcher.emit(this, "validation.error", lastError, newvalue);
          return false;
        }
        var oldvalue = value;
        value = filter(newvalue);
        dispatcher.emit(this, "value.change", value, oldvalue);
        return true;
      },
      setDefault : function(newvalue) {
        var oldvalue = defaultValue;
        defaultValue = filter(newvalue);
        dispatcher.emit(this, "default.change", defaultValue, oldvalue);
        this.set(newvalue);
        return true;
      },
      reset : function() {
        if(defaultValue === value) return false;
        if(this.set(defaultValue)) {
          dispatcher.emit(this, "value.reset", defaultValue);
          return true;
        }
        return false;
      },
      get : function(alt) {
        return value !== null && typeof value !== "undefined" && value || alt;
      },
      getDefault : function() {
        return defaultValue;
      },
      validate : function(value) {
        return validator(value) == null;
        return result === null;
      },
      lastError : function() {
        return lastError;
      },
      on : function(type, handler) {
        dispatcher.on(type, handler);
      },
      off : function(type, handler) {
        dispatcher.off(type, handler);
      },
      setValidator : function(newvalidator) {
        validator = newvalidator || function() { return null; };
        dispatcher.emit(this, "validator.change", validator);
      },
      setFilter : function(newfilter) {
        filter = newfilter || function() { return null; };
        dispatcher.emit(this, "filter.change", newfilter);
      },
      isDefault : function() {
        return value === defaultValue;
      }
    }
  }
});