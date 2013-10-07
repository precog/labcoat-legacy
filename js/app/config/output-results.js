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
      "app/util/output-table"
    , "app/util/output-json"
    , "app/util/output-chart"
    , "app/util/output-error"
    , "app/util/output-message"

],

function() {
    var formats = arguments,
        empties = [{
            name : "update",
            f : function() {
                return function(_) {  };
            }
        }, {
            name : "panel",
            f : function() {
                return function() { return $("<div></div>"); };
            }
        }, {
            name : "toolbar",
            f : function() {
                return function() { return $("<div></div>"); };
            }
        }, {
            name : "activate",
            f : function() { return function() {}; }
        }, {
            name : "deactivate",
            f : function() { return function() {}; }
        }, {
            name : "display",
            f : function() { return true; }
        }, {
            name : "resize",
            f : function() {
                return function() {  };
            }
        }, {
            name : "preferredDownloadFormat",
            f : function() {
                return function() { return null; }
            }
        }, {
          name : "paginationOptions",
          f : function() {
            return function() { return null; }
          }
        }],
        inited = false;

    return function() {
        if(!inited) {
            for(var i = 0; i < formats.length; i++) {
                var format = formats[i];
                if("function" === typeof format)
                    formats[i] = format = format();

                $.each(empties, function(_, empty) {
                    if("undefined" === typeof format[empty.name]) {
//                console.log("assigning " + empty.name + " to " + format.name);
                        format[empty.name] = empty.f();
                    }
                });
            }
            inited = true;
        }
        return formats;
    };
});