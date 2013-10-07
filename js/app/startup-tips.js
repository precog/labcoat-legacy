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
      "app/util/notification"
    , "app/util/ui"
    , "app/util/storage"
    , "rtext!templates/content.tip.main.html"
    , "rtext!templates/content.tip.codepane.html"
    , "rtext!templates/content.tip.filesystem.html"
    , "rtext!templates/content.tip.querybrowser.html"
    , "rtext!templates/content.tip.resultspane.html"
    , "rtext!templates/content.tip.supportpane.html"
],
function(notification, ui, createStore, tplMain, tplCode, tplFileSystem, tplQueryBrowser, tplResultsPane, tplSupportPane) {
    var STORE_KEY = "pg-quirrel-tips",
        store = createStore(STORE_KEY, {
            main : true,
            editor : true,
            system : true,
            queries : true,
            results : true,
            support : true
        });

    var tips = [{
          title  : "Quirrel Editor"
        , target : function(layout) { return layout.getInput(); }
        , text   : tplCode
        , store  : "editor"
    }, {
        title  : "Virtual File System"
        , target : function(layout) { return layout.getSystem(); }
        , text   : tplFileSystem
        , store  : "system"
    }, {
        title  : "Query Browser"
        , target : function(layout) { return layout.getQueries(); }
        , text   : tplQueryBrowser
        , store  : "queries"
    }, {
        title  : "Results"
        , target : function(layout) { return layout.getOutput(); }
        , text   : tplResultsPane
        , store  : "results"
    }, {
        title  : "Support"
        , target : function(layout) { return layout.getSupport(); }
        , text   : tplSupportPane
        , store  : "support"
    }]

    function disableTip(name) {
        return function() {
            store.set(name, false);
        };
    }

    function displayPaneTips(layout) {
        for(var i = 0; i < tips.length; i++) {
            var tip = tips[i];
            if(store.get(tip.store)) {
                notification.tip(tip.title, {
                      target : tip.target(layout)
                    , text : tip.text
                    , after_close : disableTip(tip.store)
                });
            }
        }
    }

    return function(layout) {
        setTimeout(function(){
            if(store.get("main")) {
                var n = notification.main("Welcome to Labcoat!", {
                    text : '<div class="pg-content">'+tplMain+'</div><div class="pg-actions"><label>display panel tips<input type="checkbox" name="pg-display-tips" checked></label></div>'
                    , after_close : function() {
                        store.set("main", false);
                        if(n.find('input[type="checkbox"]').attr("checked"))
                            displayPaneTips(layout);
                        else {
                            for(var i = 0; i < tips.length; i++) {
                                store.set(tips[i].store, false)
                            }
                        }
                    }
                });

                ui.button(n.find('.pg-actions'), {
                    label : "close",
                    text : true,
                    icon : "ui-icon-close",
                    handler : function() {
                        n.pnotify_remove();
                    }
                });
            } else {
                displayPaneTips(layout);
            }
        }, 1000);
    }
});