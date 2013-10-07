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

require("ace/lib/fixoldbrowsers");
var AsyncTest = require("asyncjs").test;
var async = require("asyncjs");

var passed = 0
var failed = 0
var log = document.getElementById("log")

var testNames = [
    "ace/anchor_test",
    "ace/background_tokenizer_test",
    "ace/commands/command_manager_test",
    "ace/config_test",
    "ace/document_test",
    "ace/edit_session_test",
    "ace/editor_change_document_test",
    "ace/editor_highlight_selected_word_test",
    "ace/editor_navigation_test",
    "ace/editor_text_edit_test",
    "ace/ext/static_highlight_test",
    "ace/incremental_search_test",
    "ace/keyboard/emacs_test",
    "ace/keyboard/keybinding_test",
    "ace/layer/text_test",
    "ace/lib/event_emitter_test",
    "ace/mode/coffee/parser_test",
    "ace/mode/coldfusion_test",
    "ace/mode/css_test",
    "ace/mode/css_worker",
    "ace/mode/html_test",
    "ace/mode/javascript_test",
    "ace/mode/javascript_worker_test",
    "ace/mode/logiql_test",
    "ace/mode/python_test",
    "ace/mode/text_test",
    "ace/mode/xml_test",
    "ace/mode/folding/cstyle_test",
    "ace/mode/folding/html_test",
    "ace/mode/folding/pythonic_test",
    "ace/mode/folding/xml_test",
    "ace/mode/folding/coffee_test",
    "ace/multi_select_test",
    "ace/occur_test",
    "ace/range_test",
    "ace/range_list_test",
    "ace/search_test",
    "ace/selection_test",
    "ace/snippets_test",
    "ace/token_iterator_test",
    "ace/tokenizer_test",
    "ace/virtual_renderer_test"
];

var html = ["<a href='?'>all tests</a><br>"];
for (var i in testNames) {
    var href = testNames[i];
    html.push("<a href='?", href, "'>", href.replace(/^ace\//, "") ,"</a><br>");
}

var nav = document.createElement("div");
nav.innerHTML = html.join("");
nav.style.cssText = "position:absolute;right:0;top:0";
document.body.appendChild(nav);

if (location.search)
    testNames = location.search.substr(1).split(",")

require(testNames, function() {
    var tests = testNames.map(function(x) {
        var module = require(x);
        module.href = x;
        return module;
    });

    async.list(tests)
        .expand(function(test) {
            return AsyncTest.testcase(test)
        }, AsyncTest.TestGenerator)
        .run()
        .each(function(test, next) {
            if (test.index == 1 && test.context.href) {
                var href = test.context.href;
                var node = document.createElement("div");
                node.innerHTML = "<a href='?" + href + "'>" + href.replace(/^ace\//, "") + "</a>";
                log.appendChild(node);
            }
            var node = document.createElement("div");
            node.className = test.passed ? "passed" : "failed";

            var name = test.name
            if (test.suiteName)
                name = test.suiteName + ": " + test.name

            var msg = "[" + test.count + "/" + test.index + "] " + name + " " + (test.passed ? "OK" : "FAIL")
            if (!test.passed) {
                if (test.err.stack)
                    var err = test.err.stack
                else
                    var err = test.err

                console.error(msg);
                console.error(err);
                msg += "<pre class='error'>" + err + "</pre>";
            } else {
                console.log(msg);
            }

            node.innerHTML = msg;
            log.appendChild(node);

            next()
        })
        .each(function(test) {
            if (test.passed)
                passed += 1
            else
                failed += 1
        })
        .end(function() {
            log.innerHTML += [
                "<div class='summary'>",
                "<br>",
                "Summary: <br>",
                "<br>",
                "Total number of tests: " + (passed + failed) + "<br>",
                (passed ? "Passed tests: " + passed + "<br>" : ""),
                (failed ? "Failed tests: " + failed + "<br>" : "")
            ].join("")
            console.log("Total number of tests: " + (passed + failed));
            console.log("Passed tests: " + passed);
            console.log("Failed tests: " + failed);
        })
});

});
