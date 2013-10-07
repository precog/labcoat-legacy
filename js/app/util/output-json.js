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
    "app/util/ui"
],

function(ui) {
    var wrapper,
        elPanel = $('<div class="ui-widget"><pre class="json ui-content"></pre></div>'),
        elOutput = elPanel.find('.json');

    var spaces = 2,
        toolbar, options, currentData;

    return wrapper = {
        type : "json",
        name : "Json",
        panel : function() { return elPanel; },
        update : function(data, o) {
            if(data) {
                currentData = data;
            } else {
                data = currentData;
            }
            options = o;
            if(!options.json)
                options.json = { compact : false };
            var json = options.json.compact ? JSON.stringify(data) : JSON.stringify(data, null, spaces);
            toolbar.find('input[type="checkbox"]').attr("checked", options.json.compact).button("refresh");
            elOutput.text(json);
        },
        activate : function() {
            if(!toolbar) {
                toolbar = $(this.toolbar).append("<div></div>").find("div:last");
                ui.checks(toolbar, {
                    label : "compact",
                    handler : function(action) {
                        if(options.json.compact === action.checked) return;
                        options.json.compact = action.checked;
                        wrapper.update(null, options);
                        $(wrapper).trigger("optionsChanged", options);
                    }
                });
            }
            toolbar.show();
        },
        deactivate : function() {
            toolbar.hide();
        },
        preferredDownloadFormat : function(options) {
            return 'json';
        }
    };
});