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
define(
function(require, exports, module) {
    "use strict";

    var oop = require("../lib/oop");
    var lang = require("../lib/lang");
    var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

    var QuirrelHighlightRules = function() {

        var keywords = lang.arrayToMap(
            ("difference|else|solve|if|import|intersect|new|then|union|where|with").split("|")
        );

        var builtinConstants = lang.arrayToMap(
            ("true|false|undefined|null").split("|")
        );

        var builtinFunctions = lang.arrayToMap(
            ("count|distinct|load|max|mean|geometricMean|sumSq|variance|median|min|mode|stdDev|sum").split("|")
        );

        var identifier = "[A-Za-z_][A-Za-z0-9_']*";
 
        var start = [
            {
              token : "constant.language",
              regex : "import",
              next  : "import"
            },
            {
              token : "comment",
              regex : "--.*$"
            }, {
              token : "comment",
              regex  : '\\(-',
              merge : true,
              next : "comment"
            }, {
              token : "variable",
              regex : "['][A-Za-z][A-Za-z_0-9]*"
            }, {
              token : "identifier",
              regex : '["](?:(?:\\\\.)|(?:[^"\\\\]))*?["]\\s*(?=:[^=])'
            }, {
              token : "identifier",
              regex : '[`](?:(?:\\\\.)|(?:[^`\\\\]))*?[`]\\s*(?=:[^=])'
            }, {
              token : "string",
              regex : '"(?:\\\\"|[^"])*"'
            }, {
              token : "string",
              regex : '`[^`]*`'
            }, {
              token : "string",
              regex : "/(?:/[a-zA-Z_0-9-]+)+\\b"
            }, {
              token : "constant.numeric", // float
              regex : "[0-9]+(?:\\\\.[0-9]+)?(?:[eE][0-9]+)?"
            }, {
              token : "keyword.operator",
              regex : "~|:=|\\+|\\/|\\-|\\*|&|\\||<|>|<=|=>|!=|<>|=|!|neg|union\\b"
            }, {
              token : ["support.function", "paren.lparen"],
              regex : "("+identifier + ")(\\s*[(])"
            }, {
              token : function(value) {
                if (keywords.hasOwnProperty(value))
                  return "keyword";
                else if (builtinConstants.hasOwnProperty(value))
                  return "constant.language";
                else if (builtinFunctions.hasOwnProperty(value))
                  return "support.function";
                else
                  return "identifier";
              },
              regex : "(?:[a-zA-Z]['a-zA-Z_0-9]*\\b)"
            }, {
              token : "paren.lparen",
              regex : "[([{]"
            }, {
              token : "paren.rparen",
              regex : "[)}\\]]"
            }, {
              token: "punctuation.operator",
              regex: "[,]"
            }
        ];
        this.$rules = {
          "start" : start,
          "import" : [
            {
              token : "support.function",
              regex : "\\s*(?:[*]|[a-z0-9_]+)(?:\\s*$|\\s+)",
              next  : "start"
            }, {
              token : "support.function",
              regex : "\\s*[a-z0-9_]+\\s*"
            }, {
              token : "keyword.operator",
              regex : "[:]{2}"
            }
          ],
          "comment" : [
            {
              token : "comment", // closing comment
              regex : ".*?-\\)",
              next : "start"
            }, {
              token : "comment", // comment spanning whole line
              merge : true,
              regex : ".+"
            }
          ]
      };
    };

    oop.inherits(QuirrelHighlightRules, TextHighlightRules);

    exports.QuirrelHighlightRules = QuirrelHighlightRules;
});
