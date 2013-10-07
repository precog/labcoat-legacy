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
//  "libs/jquery/opentip/opentip-jquery-min.js"
  "app/util/notification"
],

function(notification) {
  var REFERENCE_URL = "reference.json",
      reference;

  function extractFunctionName(header) {
    return (/^\s*([^\s]+)/).exec(header)[1];
  }

  $.get(REFERENCE_URL).then(function(data) {
    // avoid issues when the header Content-Type: application/json is missing
    if("string" === typeof data)
      data = JSON.parse(data);
    reference = {};
    data.forEach(function(item) {
      if(item.type)
        return;
      var key = extractFunctionName(item.header);

      reference[key] = item;
    });

  });

  function extractImports(code) {
    var p = /import\s+((?:\w+\:\:)+)/g,
        match,
        r = [];
    while((match = p.exec(code)) != null) {
      r.push(match[1]);
    }
    return r;
  }

  function isSymbol(c) {
    var i = c.charCodeAt(0);
    return !((i>=97&&i<=122)||(i>=65&&i<=90)||(i>=48&&i<=57)||i==95);
  }

  function extractFunction(code, row, column)
  {
    var line = code.split("\n")[row];
    if(!line) return null;
    var char = line[column];
    if(!char) return null;

    // set type
    var issymbol = isSymbol(char);
    if(issymbol)
      return null;

    // capture after
    var len = line.length;
    cursor = column;
    while(++cursor < len && isSymbol(line[cursor]) === issymbol) {
      char += line[cursor];
    }
    // discard whitespaces
    while(cursor < len && line[cursor] === " ") { cursor++; }
    if(line[cursor] !== "(")
      return null;

    // capture before
    var cursor = column;
    while(--cursor >= 0 && isSymbol(line[cursor]) === issymbol) {
      char = line[cursor] + char;
    }

    return char;
  }

  return function() {
    var noti,
        wrapper = {
        displayTip : function(coords, pos, code) {
          if(!reference)
            return;
          var word = extractFunction(code, pos.row, pos.column);

          var imports = [""].concat(extractImports(code));
          for(var i = 0; i < imports.length; i++) {
            var key = imports[i]+word,
                item = reference[key];
            if(item) {
              if(noti) noti.remove();
              noti = notification.tip(item.header, {
                x : coords.x,
                y : coords.y,
                voffset : 10,
                hoffset : 100,
                text : item.body,
                after_open : function() {
                  var f = function f() {
                    noti.remove();
                    $("body").off("mousemove", f);
                  }
                  $("body").mousemove(f);
                }
              });
              break;
            }
          }
        }
      };
/*
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
 var pos = $(el).offset(),
 vw  = $(el).outerWidth(),
 ww  = n.outerWidth();

 var left = (vw - ww) / 2 + pos.left;
 if(left < o.hoffset)
 left = o.hoffset;
 else if(left + ww + o.hoffset > $(window).width())
 left = $(window).width() - o.hoffset - ww;
 n.css({
 left : left+"px",
 top  : (pos.top + o.voffset)+"px"
 });
 }

 $(window).on("resize", position);

 function remove_resize() {
 $(window).off("resize", position);
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
 */
    return wrapper;
  };
});