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
      "rtext!templates/dialog.confirm.html"
    , "app/util/ui"
    , "app/util/dom"
    , "app/util/numbercaptcha"


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
],

function(tplDialog, ui, dom, createCaptcha) {
    var elDialog, currentHandler, cancelHandler, currentType;

    function reposition() {
        elDialog.dialog("option", "position", "center");
    }

    function init() {
        elDialog = $('body')
            .append(tplDialog)
            .find('.pg-dialog-confirm:last')
            .dialog({
                  modal : true
                , autoOpen : false
                , resizable : false
                , dialogClass : "pg-el"
                , closeOnEscape: true
                , buttons : [{
                    text : "OK",
                    click : function() {
                        elDialog.dialog("close");
                        if(currentHandler)
                            currentHandler();
                        return true;
                    },
                    ref : "ok"
                }, {
                    text : "Cancel",
                    click : function() {
                        $(this).dialog("close");
                        close();
                        if(cancelHandler)
                          cancelHandler();
                    },
                    ref : "cancel"
                }]
            })
        ;

        function close(e, ui) {
          $(window).off("resize", reposition);
        }

        elDialog.bind("dialogopen", function() { $(window).on("resize", reposition); });
        elDialog.bind("dialogclose", close);
    }

    var inited = false,
        oldMessage, oldCaptcha;
    return function(title, message, handler, options) {
        options = options || {};
        if(!inited) {
            init();
            inited = true;
        }

        currentHandler = handler;
        elDialog.dialog("option", "position", "center");
        elDialog.dialog("option", "title", title);

        elDialog.dialog("option", "width", options.width && options.width || 300);
        elDialog.dialog("option", "height", options.height && options.height || "auto");

        elDialog.dialog("open");

        cancelHandler = options.cancel;

        var ok = elDialog.parent().find('button[ref=ok]'),
            el = elDialog.find(".pg-message");
        if(oldMessage)
          oldMessage.detach();
        if(oldCaptcha)
          oldCaptcha.detach();
        oldMessage = message = (!message || "string" === typeof message) ? $('<div>' + (message || "") +'</div>') : message;
        el.append(message);
        if(options.captcha) {
          ok.button("disable");
          var cont = oldCaptcha = $('<div class="captcha"></div>'),
              captcha = createCaptcha(100);
          cont.append('<div class="ui-widget"><div class="ui-state-highlight"><p>Solve this simple problem if you want to delete the data: <b>'+captcha.description+' is equal to?</b></p></div></div>');
          var input = $('<input type="number" step="1">').keyup(function() {
            var val = $(this).attr("value");
            if(val === "" + captcha.result) {
              cont.children("*").remove();
              cont.append('<div class="ui-widget"><div class="ui-state-highlight"><p>Good Job! Now click OK to confirm</p></div></div>');
              ok.button("enable");
            }
          });
          cont.append($('<div class="ui-widget"></div>').append("<p></p>").append(input));
          el.append(cont);
        } else {
          ok.button("enable");
        }
    };
});