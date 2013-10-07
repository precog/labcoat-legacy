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
      "require"
    , "ace/ace"
    , "app/util/ui"
    , "ace/mode/quirrel"
],

function(require, ace, ui) {
    return function(el, vertical) {
        var wrapper,
            sess,
            editor = ace.edit($(el).get(0));

        function execute() {
            $(wrapper).trigger("execute", wrapper.get());
        }

        function executeSelected() {
            $(wrapper).trigger("execute", editor.session.getTextRange(editor.getSelectionRange()));
        }

        editor.commands.addCommand({
			      name : "executeSelection",
            bindKey: {
                win: 'Shift-Ctrl-Return',
                mac: 'Shift-Ctrl-Return|Command-Ctrl-Return',
                sender: 'editor|cli'
            },
            exec: executeSelected
        });

        editor.commands.addCommand({
			      name : "executeAll",
            bindKey: {
                win: 'Shift-Return',
                mac: 'Shift-Return|Command-Return',
                sender: 'editor|cli'
            },
            exec: execute
        });

        editor.setShowPrintMargin(false);
        sess = editor.getSession();
        sess.setUseWrapMode(true);
        sess.setMode(new (require("ace/mode/quirrel").Mode)());
        sess.getSelection().on("changeCursor", function() {
            $(wrapper).trigger("changeCursor", editor.getCursorPosition());
        });
        sess.getSelection().on("changeSelection", function(e) {
            $(wrapper).trigger("changeSelection", editor.getSelection());
            if(editor.getSelection().isEmpty())
                runselected.hide();
            else
                runselected.show();
        });
        sess.on("change", (function() {
            var killChange;

            function trigger() {
                $(wrapper).trigger("change", wrapper.get());
            };

            return function() {
                clearInterval(killChange);
                killChange = setTimeout(trigger, 250);
            };
        })());

        var run = ui.button(el, {
                label : "run",
                text : true,
                icons : { primary : "ui-icon-circle-triangle-s" },
                handler : execute
            }),
            runselected = ui.button(el, {
                label : "run selected",
                text : true,
                icons : { primary : "ui-icon-circle-triangle-s" },
                handler : executeSelected
            });

        function orientButton(vertical) {
            run.css({
                display: "block",
                position: "absolute",
                right: "25px",
                bottom: vertical ? "10px" : "25px",
                zIndex: 100
            });
            runselected.css({
                display: "block",
                position: "absolute",
                right: "100px",
                bottom: vertical ? "10px" : "25px",
                zIndex: 100
            });
            if(vertical) {
                run.find(".ui-icon-circle-triangle-e").removeClass("ui-icon-circle-triangle-e").addClass("ui-icon-circle-triangle-s");
                runselected.find(".ui-icon-circle-triangle-e").removeClass("ui-icon-circle-triangle-e").addClass("ui-icon-circle-triangle-s");
            } else {
                run.find(".ui-icon-circle-triangle-s").removeClass("ui-icon-circle-triangle-s").addClass("ui-icon-circle-triangle-e");
                runselected.find(".ui-icon-circle-triangle-s").removeClass("ui-icon-circle-triangle-s").addClass("ui-icon-circle-triangle-e");
            }
        }

        orientButton(vertical);
        runselected.hide();

        var annotations = [];
        function removeAnnotations() {
          annotations = [];
          sess.setAnnotations(annotations);
          sess.removeListener("change", removeAnnotations);
        }

        // TOOLTIP LOGIC
        (function() {
          var timer,
              renderer = editor.renderer,
              $content = $(el).find(".ace_content"),
              coords = {};

          function findWord() {
            var pos = $.extend({}, renderer.screenToTextCoordinates(coords.x, coords.y));
            $(wrapper).trigger("mouseovertext", [coords, pos]);
          }

          $content.on("mousemove", function(e) {
            coords.x = e.clientX;
            coords.y = e.clientY;
            clearInterval(timer);
            timer = setTimeout(findWord, 500);
          });

          $content.on("mouseexit", function() {
            clearInterval(timer);
          })
        })();

        wrapper = {
            get : function() {
                return sess.getValue(); //editor.getSession()
            },
            set : function(code) {
                sess.setValue(code);
            },
            setTabSize : function(size) {
                if(size === sess.getTabSize()) return;
                sess.setTabSize(size);
                $(wrapper).trigger("tabSizeChanged", size);
            },
            setUseSoftTabs : function(toogle) {
                if(toogle === sess.getUseSoftTabs()) return;
                sess.setUseSoftTabs(toogle);
                $(wrapper).trigger("useSoftTabsChanged", toogle);
            },
            getTabSize : function() {
                return sess.getTabSize();
            },
            getUseSoftTabs : function(toogle) {
                return sess.getUseSoftTabs();
            },
            setTheme : function(theme) {
                var path = "ace/theme/" + theme;
                require([path], function() {
                    editor.setTheme(path);
                });
            },
            resize : function() {
                editor.resize();
            },
            engine : function() {
                return "ace";
            },
            focus : function() {
                editor.focus();
            },
            highlightSyntax : function(row, column, text, type) {
                // https://github.com/ajaxorg/ace/blob/master/lib/ace/mode/javascript.js
                // https://groups.google.com/forum/?fromgroups#!topic/ace-discuss/joAFrXwWLX8

                if(annotations.length == 0)
                    sess.on("change", removeAnnotations);
                annotations.push({
                  row : row,
                  column : column,
                  text : text,
                  type : type
                });
                sess.setAnnotations(annotations);
            },
            resetHighlightSyntax : function() {
              removeAnnotations();
            },
            setCursorPosition : function(row, column) {
                editor.navigateTo(row, column);
                editor.focus();
            },
            triggerExecute : execute,
            orientButton : orientButton
        };

        return wrapper;
    }
});