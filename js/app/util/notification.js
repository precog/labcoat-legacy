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
      "app/util/dom"
    , "libs/jquery/pnotify/jquery.pnotify"
],

function(dom) {
    var timeout = 5000,
        shorttimeout = 2500,
        longtimeout  = 10000;

    function defaultHandler(v) { return v; };

    var map = [
          { src : "text", dst : "text", handler : defaultHandler }
        , { src : "type", dst : "type", handler : defaultHandler }
        , { src : "icon", dst : "notice_icon", handler : function(v) { return "ui-icon "+v; } }
        , { src : "timeout", dst : "delay", handler : defaultHandler }
        , { src : "hide", dst : "hide", handler : defaultHandler }
        , { src : "before_open", dst : "before_open", handler : defaultHandler }
        , { src : "before_close", dst : "before_close", handler : defaultHandler }
        , { src : "after_open",  dst : "after_open", handler : defaultHandler }
        , { src : "after_close", dst : "after_close", handler : defaultHandler }
        , { src : "history", dst : "history", handler : defaultHandler }
        , { src : "sticker", dst : "sticker", handler : defaultHandler }
        , { src : "width", dst : "width", handler : defaultHandler }
        , { src : "min_height", dst : "min_height", handler : defaultHandler }
        , { src : "opacity", dst : "opacity", handler : defaultHandler }
        , { src : "stack", dst : "stack", handler : defaultHandler }
        , { src : "shadow", dst : "shadow", handler : defaultHandler }
    ];

    function applyOptions(src, dst, map) {
        for(var i = 0; i < map.length; i++) {
            if("undefined" !== typeof src[map[i].src]) {
                dst[map[i].dst] = map[i].handler(src[map[i].src]);
            }
        }
    }

    return {
        error : function(title, o) {
          o = o || {};
          o.type = "error";
          return this.success(title, o);
        },
        success : function(title, o) {
            o = o || {};

            var options = {
                  title : title
                , history : false
                , shadow : true
                , delay : timeout
                , sticker : false
                , insert_brs : false
                , styling : "jqueryui"
                , title_escape : false
                , text_escape : false
            };

            applyOptions(o, options, map);

            if(!options.text) options.text = "";
            options.text += '\n<div class="pg-clear"></div>';

            return $.pnotify(options);
        },

        context : function(title, o) {
            o = o || {};
            o.voffset = o.voffset || 25;
            o.width = o.width || '420px';

            var n = this.tip(title, o);

            var close = function() {
              $('body').off("mousedown", close);
              n.remove();
            };

            n.mousedown(function(e) {
              e.stopPropagation();
            });

            $('body').on("mousedown", close);
            return n;
        },

        copier : function(title, o) {
            o = o || {};

            var keycombo = navigator.userAgent.indexOf("Mac OS X") != -1 ? "CMD+C" : "CTRL+C";
            o.text = '<div class="pg-message">'+ o.text+'</div><div class="pg-textarea"><textarea>'+ o.copy+'</textarea></div><div class="pg-footer">'+keycombo+' to copy the link</div>';

            var n = this.context(title, o),
                area = n.find("textarea");

            area.click(function() {
                dom.selectText(area.get(0));
            });

            setTimeout(function() {
                dom.selectText(area.get(0));
            }, 500);

            return n;
        },

        tip : function(title, o) {
            o = o || {};
            o.history = false;
            o.sticker = false;
            o.hide = false;
            o.stack = false;
            o.shadow = true;
            o.type = o.type || "info";
            o.opacity = 0.95;
            o.voffset = o.voffset || 40;
            o.hoffset = o.hoffset || 10;

            var el = o.target || document.body,
                n = this.success(title, o);

            function position() {
                var left, top;
                if(o.x) {
                  left = o.x - n.outerWidth() / 2 + o.hoffset;
                  top  = o.y;
                } else {
                  var pos = $(el).offset(),
                      vw  = $(el).outerWidth(),
                      ww  = n.outerWidth();
                  left = (vw - ww) / 2 + pos.left;
                  top = pos.top;
                }

                if(left < o.hoffset)
                  left = o.hoffset;
                else if(left + ww + o.hoffset > $(window).width())
                  left = $(window).width() - o.hoffset - ww;

                n.css({
                  left : left+"px",
                  top : (top + o.voffset)+"px"
                });
            }

            if(!o.x) {
              $(window).on("resize", position);

              function remove_resize() {
                $(window).off("resize", position);
              }
            }

            var old = o.before_close;
            o.before_close = function(e) {
                console.log(old);
                if(old)
                    old.apply(this, e);
                remove_resize(this, e);
            };

            setTimeout(position, 0);
            return n;
        },

        main : function(title, o) {
            o = o || {};
            o.history = false;
            o.sticker = false;
            o.width = '500px';
            if(!o.min_height) o.min_height = '300px';
            o.hide = false;
            o.stack = false;
            o.shadow = true;
            o.type = "info";
            o.opacity = 0.95;

            var old = o.before_close;
            o.before_close = function(e) {
                if(old)
                    old.apply(this, e);
                remove_resize(this, e);
            };

            var n = this.success(title, o);

            function center() {
                var vw = $(window).width(),
                    vh = $(window).height(),
                    ww = n.outerWidth(),
                    wh = n.outerHeight();
                n.css({
                    left : ((vw-ww)/2)+"px",
                    top  : ((vh-wh)/2)+"px"
                });
            }

            $(window).on("resize", center);

            function remove_resize() {
                $(window).off("resize", center);
            }

            setTimeout(center, 0);
            return n;
        },
        quick : function(title, o) {
            o = o || {};
            o.timeout = shorttimeout;
            return this.success(title, o);
        },
        progress : function(title, o) {
            var cur_value = 1,
                pnotify,
                $progress,
                $message,
                text = o.text || "";
            // progress
            // complete

            var k;

            o.hide = false;
            o.text = '<div class="pg-message">'+text+'</div><div class="pg-progress-bar"></div>';
            o.before_open = function(pn) {
                pnotify = pn;
                $progress = pn.find("div.pg-progress-bar");
                $message = pn.find("div.pg-message");
            };

            o.progressStart = function(message) {
                clearInterval(k);
                pnotify.show();
                $message.removeClass("ui-state-error")
                $message.html(message);
                $progress.show();
                $progress.progressbar({
                    value : 0
                });
            };

            o.progressStep = function(value) {
                var v = value * 100;
                if(v > 100) v = 100;
                $progress.progressbar({
                    value : v
                });
            };

            o.progressComplete = function(message) {
                $message.html(message);
                $progress.hide();
                k = setTimeout(function() {
                    pnotify.hide();
                }, longtimeout);
            };

            o.progressError = function(err) {
                $progress.hide();
                $message.addClass("ui-state-error").html(err);
                k = setTimeout(function() {
                    pnotify.hide();
                }, longtimeout);
            };

            return o.el = this.success(title, o);
        }
    }
});