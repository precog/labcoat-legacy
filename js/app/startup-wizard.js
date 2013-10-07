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
      "app/util/notification"
    , "app/util/ui"
    , "app/util/storage"
    , "app/config/wizard-steps"
    , "rtext!templates/content.tip.main.html"
    , "rtext!templates/content.tip.codepane.html"
    , "rtext!templates/content.tip.filesystem.html"
    , "rtext!templates/content.tip.querybrowser.html"
    , "rtext!templates/content.tip.resultspane.html"
    , "rtext!templates/content.tip.supportpane.html"
],
function(notification, ui, createStore, createSteps, tplMain, tplCode, tplFileSystem, tplQueryBrowser, tplResultsPane, tplSupportPane) {
    return function(ctx) {
      var STORE_KEY = "pg-quirrel-wizard",
          store = createStore(STORE_KEY, {
            dismissed : false
          }),
          current;

      var steps = createSteps();

      var $tip = $('<div class="pg-el pg-wizard"><div class="pg-frame"><div class="close"><a href="#" title="close wizard"><span class="ui-icon ui-icon-closethick"></span></a></div><div class="pg-content"></div></div><div class="pg-arrow"></div></div>').appendTo("body");
      $tip.hide();

      function displayStep(step, value) {
        var content = $tip.find(".pg-content"),
            arrow   = $tip.find(".pg-arrow"),
            closer  = $tip.find(".close");

        closer.css("opacity", 0.35);
        $tip.mouseenter(function() {
          closer.css("opacity", 1);
        });
        $tip.mouseleave(function() {
          closer.css("opacity", 0.35);
        });

        $tip.find(".pg-frame").css({
          "width" : ((step && step.width) || 200)+"px"
        });
        closer.find("a").click(function() {
          goTo("#end");
        });

        content.html(step.text);

        var position = {
          my : (step.position[0] || "left top"),
          at : (step.position[1] || "right bottom"),
          of : step.target
        };

        $tip.position(position);
        arrow.removeClass("fade");
        var cls = position.my.replace(/[+-]\d+[%]?/g, '').split(" ").join("-");
        arrow.attr("class", "pg-arrow " + cls);
        if(cls != "center-center") {
          setTimeout(function() {
            arrow.addClass("fade");
          }, 500);
        }

        if(step.init) {
          step.ctx = ctx;
          step.init.call(content, goTo, step, value);
        }
      }

      function goTo(name, value) {
        if(name === null) {
          store.set("dismissed", true);
          $tip.remove();
          current = null;
          return;
        }
        if(name === "#hide") {
          $tip.hide();
          return;
        } else if(name === "#end") {
          $tip.hide();
          store.set("dismissed", true);
          return;
        }
        $tip.show();
        current = steps.filter(function(step) { return step.name == name; })[0];
        displayStep(current, value);
      }

      if(!store.get("dismissed"))
      {
        setTimeout(function() {
          $tip.show();
          goTo("welcome");
          setTimeout(function() { $tip.addClass("transition"); }, 0);
        }, 1000);
      }

      return {
        start : function() {
          store.set("dismissed", false);
          goTo("welcome");
          setTimeout(function() { $tip.addClass("transition"); }, 0);
        }
      }
    }
});