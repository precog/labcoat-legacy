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
      "rtext!templates/dialog.export.html"
    , "app/util/uiconfig"
    , "app/util/ui"
    , "app/util/dom"
    , "app/util/precog"
    , "app/util/notification"



    // FORCE INCLUSION?
    , 'libs/jquery/ui/jquery.ui.core'
    , 'libs/jquery/ui/jquery.ui.position'
    , 'libs/jquery/ui/jquery.ui.widget'
    , 'libs/jquery/ui/jquery.ui.mouse'
    , 'libs/jquery/ui/jquery.ui.resizable'
    , 'libs/jquery/ui/jquery.ui.button'
    , 'libs/jquery/ui/jquery.ui.sortable'
    , 'libs/jquery/ui/jquery.ui.draggable'
    , "libs/jquery/ui/jquery.ui.dialog"
    , "libs/jquery/zclip/jquery.zclip"
],

function(tplDialog, uiconfig, ui, dom, precog, notification) {
    var downloadQueryService = "http://api.reportgrid.com/services/viz/proxy/download-code.php",
        elText, elDialog, elActions, elForm, clip, formCallback, exportCallback, currentAction;

    function selectCode() {
        setTimeout(function() { dom.selectText(elText.get(0)); }, 100);
    }

    function reposition() {
        elDialog.dialog("option", "position", "center");
    }

    function init() {
        var buttons = [{
          text : "Copy",
          click : function() {
//            setTimeout(function() {
              elDialog.dialog("close");
              if(exportCallback) exportCallback();
//            }, 2000);
            return true;
          }
        }];
        if(!uiconfig.disableDownload) {
          buttons.push({
            text : "Download",
            click : function() {
              notification.quick("code downloaded");
              elForm.submit();
              if(exportCallback) exportCallback();
              elDialog.dialog("close");
            }
          });
        }
        elDialog = $('body')
            .append(tplDialog)
            .find('.pg-dialog-export')
            .dialog({
                  modal : true
                , autoOpen : false
                , resizable : false
                , width : 820
                , height : 480
                , dialogClass : "pg-el"
                , closeOnEscape: true
                , buttons : buttons
            }),
        elActions = elDialog.find(".pg-actions"),
        elOptions = elDialog.find(".pg-options"),
        elText = elDialog.find(".pg-export textarea"),
        elForm = elDialog.find("form");

        elForm.attr("action", downloadQueryService);
        elForm.submit(function(e) {
          if(formCallback)
            return formCallback.call(this, elText.text(), currentAction);
          else
            return true;
        });

        elText.click(function() {
            selectCode();
        });

        elDialog.bind("dialogopen", function() { $(window).on("resize", reposition); });
        elDialog.bind("dialogclose", function() { $(window).off("resize", reposition); });
    }

    var inited = false;
    return function(title, actions, code, selected, callback, exportHandler) {
        formCallback = callback;
        exportCallback = exportHandler;
        if(!inited) {
            init();
            inited = true;
        }
        elActions.find("*").remove();
        elOptions.find("*").remove();

        function execute(action) {
            elDialog.find("input[name=name]").val("precog." + action.token);
            elOptions.find("*").remove();
            if(action.buildOptions) {
                action.buildOptions(elOptions, function() {
                    elText.text(action.handler(code, action.options));
                    selectCode();
                });
            }
            elText.text(action.handler(code, action.options));
            selectCode();
        }

        selected = selected || actions[0].token;
        ui.radios(elActions, $(actions).map(function(i, action) {
            if(action.token === selected)
              currentAction = action;
            return {
                  label : action.name
                , handler : function() {
                    currentAction = action;
                    execute(action);
                    return true;
                }
                , group : "actions"
                , checked : action.token === selected
            };
        }));

        elActions.find(".ui-button:first").click();

        elDialog.dialog("option", "position", "center");
        elDialog.dialog("option", "title", title);
        elDialog.dialog("open");

        if(clip) {
            $(window).trigger("resize"); // triggers reposition of the Flash overlay
        } else {
            clip = elDialog.dialog("widget").find('.ui-dialog-buttonpane button.ui-button:first')
                .css({ zIndex : 1000000 })
                .zclip({
                    path:'js/libs/jquery/zclip/ZeroClipboard.swf',
                    copy:function(){
                        var text = ""+elText.val();
                        return text;
                    },
                    afterCopy : function() {
                        notification.quick("copied to clipboard");
                    }
                });
        }
    };
});