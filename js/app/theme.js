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
    'app/config/themes'
],

function(themes) {
    var UI_BASE_THEME_URL = "css/jquery/ui/",
        map = {},
        groups = {};

    $.each(themes, function() {
        map[this.token] = this;
        groups[this.group] = groups[this.group] || {};
        groups[this.group][this.token] = this;
    });

    function themeUrl(name) {
        return UI_BASE_THEME_URL + name + "/jquery-ui.css";
    }

    function pollCSS(url, callback) {
        function poll() {
            try {
                var sheets = document.styleSheets;
                for(var j=0, k=sheets.length; j<k; j++) {
                    if(sheets[j].href == url) {
                        sheets[j].cssRules;
                    }
                }
                // If you made it here, success!
                setTimeout(callback, 0);
            } catch(e) {
                // Keep polling
                setTimeout(poll, 50);
            }
        };
        poll();
    }

    function setUITheme(name, callback) {
        var url = themeUrl(name),
            cssLink = $('<link href="'+url+'" type="text/css" rel="Stylesheet" class="ui-theme" />');
        if($.browser.safari) {
            // no onload event
            pollCSS(url, callback);
        } else {
            cssLink.on("load", callback);
        }
        $("head").append(cssLink);


        if( $("link.ui-theme").size() > 3){
            $("link.ui-theme:first").remove();
        }
    }
    var theme = {
        current : null,
        set : function(name) {
            if(this.current === name) return;
            this.current = name;
            $(theme).trigger('change', name);
            setUITheme(map[name].ui, function() {
                $(theme).trigger('changed', name);
            });
        },
        list : function() { return themes; },
        map : function() { return map; },
        groups : function() { return groups; },
        getEditorTheme : function(name, editor) {
            return map[name].editor[editor];
        }
    };

    return theme;
});