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
// LuaPage implements the LuaPage markup as described by the Kepler Project's CGILua
// documentation: http://keplerproject.github.com/cgilua/manual.html#templates
define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var HtmlHighlightRules = require("./html_highlight_rules").HtmlHighlightRules;
var LuaHighlightRules = require("./lua_highlight_rules").LuaHighlightRules;

var LuaPageHighlightRules = function() {
    this.$rules = new HtmlHighlightRules().getRules();
    
    for (var i in this.$rules) {
        this.$rules[i].unshift({
            token: "keyword",
            regex: "<\\%\\=?",
            next: "lua-start"
        }, {
            token: "keyword",
            regex: "<\\?lua\\=?",
            next: "lua-start"
        });
    }
    this.embedRules(LuaHighlightRules, "lua-", [
        {
            token: "keyword",
            regex: "\\%>",
            next: "start"
        },
        {
            token: "keyword",
            regex: "\\?>",
            next: "start"
        }
    ]);
};

oop.inherits(LuaPageHighlightRules, HtmlHighlightRules);

exports.LuaPageHighlightRules = LuaPageHighlightRules;

});