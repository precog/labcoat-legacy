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
      'app/util/dom'
    , 'app/util/notification'
    , 'jquery'
    , 'libs/jquery/ui/jquery.ui.core'
    , 'libs/jquery/ui/jquery.ui.position'
    , 'libs/jquery/ui/jquery.ui.widget'
    , 'libs/jquery/ui/jquery.ui.mouse'
    , 'libs/jquery/ui/jquery.ui.resizable'
    , 'libs/jquery/ui/jquery.ui.button'
//    , 'libs/jquery/ui/jquery.ui.sortable'
//    , 'libs/jquery/ui/jquery.ui.draggable'
//    , 'libs/jquery/ui/jquery.ui.dialog'
//    , 'libs/jquery/ui/jquery.ui.position'
    , 'libs/jquery/ui/jquery.ui.progressbar'
    , 'libs/jquery/ui/jquery.ui.tabs'
    , 'libs/jquery/ui/jquery.ui.menu'
],

function(dom, notification) {
    var wrapper, uid = 0;

    $.fn.outerHTML = function(){

        // IE, Chrome & Safari will comply with the non-standard outerHTML, all others (FF) will have a fall-back for cloning
        return (!this.length) ? this : (this[0].outerHTML || (
            function(el){
                var div = document.createElement('div');
                div.appendChild(el.cloneNode(true));
                var contents = div.innerHTML;
                div = null;
                return contents;
            })(this[0]));

    }

    return wrapper = {
        clickOrDoubleClick : function(el, clickHandler, dblClickHandler) {
            var sequence = 0;
            el.click(function(e) {
                sequence++;
                if(sequence === 1) {
                    setTimeout(function() {
                        if(sequence !== 1) {
                            sequence = 0;
                            return;
                        }
                        sequence = 0;
                        clickHandler.call(this, e);
                    }, 200);
                } else {
                    sequence = 0;
                    dblClickHandler.call(this, e);
                }
            });
        },
        button : function(el, o) {
            el = $(el);
            o = $.extend({
                disabled : false,
                label : "",
                text : false,
                handler : function() {},
                icons : null
            }, o);

            var options = {
                disabled : o.disabled,
                text: o.text,
                label: o.label,
                icons: o.icon ? { primary : o.icon } : o.icons
            };

            if(!options.icons) delete options.icons;

            var button = el.append('<button></button>')
                .find('button:last')
                .button(options)
                .click(function(e) {
                    o.handler.apply(button.get(0));
                    e.preventDefault(); return false;
                });
            if(o.description)
                wrapper.tooltip(button, o.description);
            return button;
        },
        menu : function(el, o) {
            el = $(el);
            o = $.extend({
                disabled : false
            }, o);
            return el.menu({
                disabled: o.disabled
            });
        },
        contextmenu : function(el, o) {
            if("string" === typeof el) {
                el = $("body").append(el).find("div:last ul");
            } else {
                el = $(el);
            }
            var parent = el.parent(),
                o = this.menu(el, o);
            parent.hide();
            parent.mouseleave(function() {
                parent.hide();
            }).click(function() {
                parent.hide();
            });
            return parent;
        },
        tabs : function(el, o) {
            el = $(el);
            return el.tabs(o);
        },
        radios : function(el, actions) { /* group, label, handler */
            var current;
            el = $(el);
            if(actions) {
                el.find("*").remove();
                uid++;
                $(actions).each(function(i, action) {
                    var name = action.group,
                        id = "pg-buttonset-" + uid + "-" + i,
                        label = action.label;
                    action.btn = el.append('<input type="radio" id="'+id+'" name="'+name+'" '+(action.checked ? 'checked="checked" ' : '')+'/><label for="'+id+'">'+label+'</label>').find("#"+id);
                    action.btn.click(function() {
                        $(actions).each(function(i, a) {
                            a.checked = a.token === action.token;
                        });
                        action.handler(action);
                    });
                    if(action.checked)
                        current = action.btn;
                    if(action.description)
                        wrapper.tooltip(btn, action.description);
                });
            }
            var buttons = el.buttonset();
            if(current) {
                setTimeout(function() {
                    current.click();
                }, 100);
            }
            return buttons;
        },
        checks : function(el, actions) { /* group, label, handler */
            el = $(el);
            if(actions) {
                el.find("*").remove();
                uid++;
                $(actions).each(function(i, action) {
                    var name = action.name || "",
                        checked = action.checked || false,
                        id = "pg-buttonset-" + uid + "-" + i,
                        label = action.label;
                    var btn = el.append('<input type="checkbox" id="'+id+'" name="'+name+'" '+(checked ? 'checked="checked" ' : "")+'/><label for="'+id+'">'+label+'</label>').find("#"+id);
                    btn.click(function(e) {
                        action.checked = !!btn.attr("checked");
                        if(action.handler)
                            action.handler.call(btn, e, action);
                    });
                    if(action.description)
                        wrapper.tooltip(btn, action.description);
                });
            }
            return el.buttonset();
        },
        buttonset : function(el) {
            el = $(el);
            return el.buttonset();
        },
        progressbar : function(el) {
            el = $(el);
            return el.progressbar();
        },
        tooltip : function(el, html) {
            var f = "function" === typeof html ? html : function() { return html; };
            $(el).attr("title", f.apply($(el), []));
            return el;
        },
        edit : function(el, options) {
            el = $(el);
            options = $.extend({
                handler : function(t) { return null; },
                cancel : function() { }
            }, options);
            var text = options.text || el.text().trim(),
                html = el.html(),
                edit = el.html('<input type="text" name="pg-editable" id="pg-editable" value="'+text+'" />').find("#pg-editable"),
                tip;

            function exit() {
                if(tip) tip.remove();
                el.html(html);
                options.cancel();
            }

            $(document.body).one("mousedown", function() { exit(); });
            edit.change(function() {
                    var newtext = edit.val();
                    if(newtext === text) {
                        return exit();
                    }
                    options.handler(newtext, function(error) {
                        if(tip) tip.remove();
                        if(error) {
                            tip = notification.tip("invalid value", {
                                target : el,
                                text : error,
                                type : "error"
                            })
                            return;
                        } else {
                            el.html(newtext);
                        }
                    });
                })
                .keyup(function(e) {
                    switch(e.which) {
                        case 9:
                        case 13:
                            edit.trigger("change");
                            break;
                        case 27:
                            exit();
                            break;
                    }
                });
            edit.focus();
            var selectable = el.get(0);
            if(!dom.canSelect(selectable))  // firefox doesn't like selecting text this way
                selectable = edit.get(0);
            dom.selectText(selectable, 0, text.length);
        }
    };
});