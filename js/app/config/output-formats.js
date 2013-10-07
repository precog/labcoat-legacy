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
    , "app/util/ui"
],

function(convert, ui) {
    return [{
        token: "json",
        name : "Json",
        handler : function(json, options) {
            if(options.compact)
                return JSON.stringify(json);
            else
                return JSON.stringify(json, null, 2);
        },
        options : { compact : false },
        buildOptions : function(el, handler) {
            var action = this;
            ui.checks(el, [{
                name : "options",
                checked : this.options.compact,
                label : "compact json",
                description : "format json output with no newlines and minimal spacing",
                handler : function() {
                    action.options.compact = $(this).prop("checked");
                    handler();
                }
            }]);
        }

    }, {
        token: "csv",
        name : "CSV",
        handler : function(json) {
            return convert.jsonToCsv(json);
        }
    }];
});