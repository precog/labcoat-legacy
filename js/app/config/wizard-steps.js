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

],

function() {

  return function createWizardSteps() {
    var select_folder = {
          name   : "select_folder",
          target : '.pg-labcoat .pg-folders .pg-tree li[data]:last-child a',
          text   : "Now select your newly created folder.",
          width: 300,
          init : function (goto, step, value) {
            $(step.target).closest("a").one("click", function() {
              goto("upload_file")
            });
          },
          position : ["left center", "right center"]
        },
        load_data = {
          name   : "load_data",
          target : '.pg-labcoat .pg-folders .pg-tree li[data]:last-child a',
          text   : "Double click on a data file to load its content.<br>You can also select it and click on the 'lightning bolt' button above.",
          width: 300,
          init : function (goto, step, value) {
            $(step.ctx.folders).one("querypath", function() {
              goto("look_at_results");
            });
          },
          position : ["left center", "right center"]
        };
    return [
      {
        name : "welcome",
        target : ".pg-labcoat",
        text : 'Welcome to Labcoat! This Getting Started Tutorial will show you how to load your data in Labcoat and run your first query.<br><a href="#">Start now!</a>',
        position : ["center", "center"],
        width: 300,
        init : function(goto, step) {
          $(this).find("a").click(function (e) {
            e.preventDefault();
            goto("select_root");
            return false;
          });
        }
      }, {
        name   : "select_root",
        target : ".pg-labcoat .pg-folders .pg-tree .pg-root .jstree.jstree-default:first-child ins",
        text   : "Let's start by creating a folder where you will store your data.<br>Click on the root path.",
        width: 250,
        position : ["left+10 center", "right center"],
        init : function (goto, step) {
          $('.pg-labcoat .pg-folders .pg-root a').one("click", function() {
            goto("create_folder")
          });
        }
      }, {
        name   : "create_folder",
        target : ".pg-labcoat .pg-folders .ui-icon-new-folder",
        text   : 'Click on the "create new folder" button.',
        width: 300,
        init : function (goto, step) {
          $(step.target).closest("button").one("click", function() {
            goto("#hide");

            function poll() {
              if(!$('.pg-el.ui-dialog').length) {
                setTimeout(poll, 100);
                return;
              }
              $('.pg-el.ui-dialog').one("dialogclose", function() {
                var value = ($(this).find(".pg-error:visible").length) ? null : $(this).find("#pg-input-lineinput").val();
                if(!value) {
                  goto("create_folder");
                } else {
                  var li = $('.pg-labcoat .pg-folders li').filter(function() {
                    return value == $(this).attr("data").split("/").pop();
                  });
                  select_folder.target = '.pg-labcoat .pg-folders .pg-tree li[data="'+li.attr("data")+'"] a';
                  load_data.target = '.pg-labcoat .pg-folders .pg-tree li[data="'+li.attr("data")+'/[records]"] a';
                  goto("select_folder");
                }
              });
            }

            poll();
          });
        },
        position : ["left-36 top", "right bottom"]
      },
      select_folder,
      {
        name : "upload_file",
        target : ".pg-labcoat .pg-folders .ui-icon-arrowthickstop-1-n",
        text : "Click on the upload file button and choose one of your files to upload.",
        width : 250,
        position : ["center top", "center bottom"],
        init : function(goto, step, value) {
          $(step.target).closest("button").one("click", function() {
            goto("#hide");

            var started = false;
            function start() {
              started = true;
            }
            $(step.ctx.folders).on("uploadStart", start);
            function poll() {
              if(!$('.pg-el.ui-dialog').length) {
                setTimeout(poll, 100);
                return;
              }
              var o = $(step.ctx.folders);
              o.one("uploadStart", start);
              o.one("uploadComplete", complete);
              o.one("uploadError", error);

              function clear() {
                o.off("uploadStart", start);
                o.off("uploadComplete", complete);
                o.off("uploadError", error);
              }
              function complete() {
                clear();
                goto("upload_success");
              }
              function error() {
                clear();
                goto("upload_failure");
              }

              $('.pg-el.ui-dialog').one("dialogclose", function() {

                if(!started) {
                  clear();
                  goto("upload_file");
                  return;
                }
              });
            }

            poll();

          });
        }
      }, {
        name   : "upload_success",
        target : ".pg-labcoat .pg-results",
        text   : 'Great, it seems like your data was successfully uploaded! Have a look at the results below and <a href="#">click here</a> to continue.',
        width: 300,
        position : ["center bottom", "center top"],
        init : function (goto, step) {
          $(this).find("a").click(function(e) {
            e.preventDefault();
            goto("load_data");
            return false;
          });
        }
      }, {
        name   : "upload_failure",
        target : ".pg-labcoat .pg-results",
        text   : 'Oh nooo! Something went wrong uploading your data. Be sure that the file you tried to upload is a valid CSV (with headers) or JSON file. Have a look at the results below and <a href="#">click here</a> to try uploading your data again.',
        width: 280,
        position : ["center bottom", "center top"],
        init : function (goto, step) {
          $(this).find("a").one("click", function(e) {
            e.preventDefault();
            goto("upload_file");
            return false;
          });
        }
      },
      load_data, {
        name   : "look_at_results",
        target : ".pg-labcoat .pg-output-formats label",
        text   : 'Congratulations, you just executed your first query!<br>In the panel below you can have a look at the results. Note that you can look at your data in a table, in JSON format or in a nice chart.<br><a href="#">Continue.</a>',
        width: 360,
        position : ["center bottom", "center top"],
        init : function (goto, step) {
          $(this).find("a").one("click", function(e) {
            e.preventDefault();
            goto("save_query");
            return false;
          });
        }
      }, {
        name   : "save_query",
        target : ".pg-labcoat .pg-editor .ui-icon-disk",
        text   : 'Click on the "save query" button to store your Quirrel query in the query manager so that you can easily reload it the next time you visit Labcoat.',
        width: 300,
        position : ["center top", "center bottom"],
        init : function (goto, step) {
          $(step.target).closest("button").one("click", function() {
            goto("the_end");
            return false;
          });
        }
      }, {
        name   : "the_end",
        target : ".pg-labcoat",
        text   : 'Congrats, you completed our Labcoat Tutorial! Take a look at our resources on the right and start writing your custom queries to analyze your data.<br><a href="#">Close tutorial.</a>',
        width: 300,
        position : ["center center", "center center"],
        init : function (goto, step) {
          $(this).find("a").one("click", function(e) {
            e.preventDefault();
            goto("#end");
            return false;
          });
        }
      }
    ];
  };
});