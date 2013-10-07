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
define(function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;
var RubyExports = require("./ruby_highlight_rules");
var RubyHighlightRules = RubyExports.RubyHighlightRules;

var HamlHighlightRules = function() {

    // regexp must not have capturing parentheses. Use (?:) instead.
    // regexps are ordered -> the first match is used

    this.$rules = 
        {
    "start": [
        {
            token : "punctuation.section.comment",
            regex : /^\s*\/.*/
        },
        {
            token : "punctuation.section.comment",
            regex : /^\s*#.*/
        },
        {
            token: "string.quoted.double",
            regex: "==.+?=="
        },
        {
            token: "keyword.other.doctype",
            regex: "^!!!\\s*(?:[a-zA-Z0-9-_]+)?"
        },
        RubyExports.qString,
        RubyExports.qqString,
        RubyExports.tString,
        {
            token: ["entity.name.tag.haml"],
            regex: /^\s*%[\w:]+/,
            next: "tag_single"
        },
        {
            token: [ "meta.escape.haml" ],
            regex: "^\\s*\\\\."
        },
        RubyExports.constantNumericHex,
        RubyExports.constantNumericFloat,
        
        RubyExports.constantOtherSymbol,
        {
            token: "text",
            regex: "=|-|~",
            next: "embedded_ruby"
        }
    ],
    "tag_single": [
        {
            token: "entity.other.attribute-name.class.haml",
            regex: "\\.[\\w-]+"
        },
        {
            token: "entity.other.attribute-name.id.haml",
            regex: "#[\\w-]+"
        },
        {
            token: "punctuation.section",
            regex: "\\{",
            next: "section"
        },
        
        RubyExports.constantOtherSymbol,
        
        {
            token: "text",
            regex: /\s/,
            next: "start"
        },
        {
            token: "empty",
            regex: "$|(?!\\.|#|\\{|\\[|=|-|~|\\/)",
            next: "start"
        }
    ],
    "section": [
        RubyExports.constantOtherSymbol,
        
        RubyExports.qString,
        RubyExports.qqString,
        RubyExports.tString,
        
        RubyExports.constantNumericHex,
        RubyExports.constantNumericFloat,
        {
            token: "punctuation.section",
            regex: "\\}",
            next: "start"
        } 
    ],
    "embedded_ruby": [ 
        RubyExports.constantNumericHex,
        RubyExports.constantNumericFloat,
        {
                token : "support.class", // class name
                regex : "[A-Z][a-zA-Z_\\d]+"
        },    
        {
            token : new RubyHighlightRules().getKeywords(),
            regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
        },
        {
            token : ["keyword", "text", "text"],
            regex : "(?:do|\\{)(?: \\|[^|]+\\|)?$",
            next  : "start"
        }, 
        {
            token : ["text"],
            regex : "^$",
            next  : "start"
        }, 
        {
            token : ["text"],
            regex : "^(?!.*\\|\\s*$)",
            next  : "start"
        }
    ]
}

};

oop.inherits(HamlHighlightRules, TextHighlightRules);

exports.HamlHighlightRules = HamlHighlightRules;
});
