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
    , "app/config/output-results"
    , "app/config/output-formats"
    , "app/util/dialog-export"
    , "rtext!templates/toolbar.output.html"
],

function(ui, loadFormats, exportLanguages, openDialog, tplToolbar) {
    var radioIndex = 0;
    return function(el, editors) {
        var map = {},
            formats = loadFormats();
        $.each(formats, function(_, format) {
            map[format.type] = format;
        });

        radioIndex++;

        var wrapper,
            last = {
                result : null,
                type : null,
                current : null
            },
            elToolbar = el.find('.pg-toolbar').append(tplToolbar),
            elToolbarTypeContext = el.find('.pg-toolbar-context .pg-toolbar-result-type'),
            elToolbarMainContext = el.find('.pg-toolbar-context .pg-toolbar-result-general'),
            elOutputs = elToolbar.find('.pg-output-formats'),
            elResult  = el.find('.pg-result'),
            lastOptions;

        function downloadCallback(data, action) {
          return true;
        }

        var downloadButton = ui.button(elToolbarMainContext, {
            icon : "ui-icon-arrowthickstop-1-s",
            description : "download query result",
            handler : function() {
                var format = last && map[last.current].preferredDownloadFormat(lastOptions);
                openDialog("Download Results", exportLanguages, editors.getOutputData(), format, downloadCallback);
            }
        });

        $.each(formats, function(i, format) {
            if(format.display)
            {
                var id = "pg-output-type-radio-" + radioIndex + "-" + (++i);
                format.display = elOutputs.append('<input type="radio" id="'+ id
                    + '" name="radio" data-format="'
                    + format.type
                    + '" /><label for="'+id+'">'
                    + format.name
                    + '</label>').find("#"+id);
                format.display.click(function() {
                    if(format.type === last.type)
                    {
                        last.current = format.type;
                        return;
                    }
                    wrapper.setOutput(last.result, format.type, lastOptions);
                });
            }

            format.panel = format.panel();
            elResult.append(format.panel);
            format.toolbar = format.toolbar();
            elToolbarTypeContext.append(format.toolbar);

            $(format.toolbar).hide();
            $(format.panel).hide();
            $(format).on("update", function() {
                wrapper.setOutput(null, null, lastOptions);
            });
            $(format).on("optionsChanged", function(_, options) {
                $(wrapper).trigger("optionsChanged", options);
            });
          $(format).on("paginationChanged", function(_, pager) {
console.log("INTERCEPT PAGINATION");
            $(wrapper).trigger("paginationChanged", pager);
          });
          $(format).on("sortChanged", function(_, sort) {
console.log("INTERCEPT SORT");
            $(wrapper).trigger("sortChanged", sort);
          });

          $(format).on("exportToBuilder", function() {
            $(wrapper).trigger("exportToBuilder");
          });
        });


        ui.buttonset(elOutputs);

        function resize() {
            if(map[last.type]) {
                var el = map[last.type].panel;
                el.css({
                    width  : el.parent().width() + "px",
                    height : el.parent().height() + "px"
                });
                map[last.type].resize();
            }
        }
/*
        function paginationChanged() {
console.log("INTERMEDIATE TRIGGERING");
          $(wrapper).trigger("paginationChanged");
        }
*/
        function activatePanel(result, type, options) {
            if(type !== last.type) {
                if(last.type && map[last.type])
                {
//                    $(map[last.type]).off("paginationChanged");
                    map[last.type].deactivate();
                    $(map[last.type].toolbar).hide();
                    $(map[last.type].panel).hide();
                }
                $(map[type].toolbar).show();
                $(map[type].panel).show();
                map[type].activate();
                clearTimeout(this.killActivatePanel);
                this.killActivatePanel = setTimeout(resize, 0);
            }
            if(map[type].display) {
//                $(map[type]).on("paginationChanged");
                map[type].display[0].checked = true;
                map[type].display.button("refresh");
            }
            map[type].update(result, options, wrapper);
        }

        return wrapper = {
            setOutput : function(result, type, options) {
                if("undefined" === typeof result)
                    result = result || last.result || null;
                type = type || 'table';
                if(!options) {
                    options = {};
                }
                lastOptions = options;

                var enabled = false;
                if(result == null) {
                    activatePanel({ message : "please, type and execute a query" }, type = "message", options);
                } else if(result instanceof Array && result.length == 0) {
                    activatePanel({ message : "empty dataset" }, type = "message", options);
                } else if(map[type]) {
                    enabled = map[type].display;
                    activatePanel(result, type, options);
                } else {
                    enabled = false;
                    activatePanel({ message : "invalid result type: " + type }, type = "error", options);
                }

                if(result) last.result = result;
                if(last.type != type) {
                    last.type = type;
                    $(wrapper).trigger("typeChanged", type);
                }
                if(map[type] && map[type].display) {
                    last.current = type;
                }

                elOutputs.find("input[type=radio]").each(function() {
                    $(this).attr("checked", $(this).attr("data-format") === type);
                });
                if(enabled) {
                    elOutputs.buttonset("enable");
                    downloadButton.button("enable");
                } else {
                    elOutputs.buttonset("disable");
                    downloadButton.button("disable");
                }
                elOutputs.buttonset("refresh");
            },
            paginationOptions : function() {
              return map[last.current || "table"].paginationOptions();
            },
            last : last,
            resize : resize
        };
    }
});