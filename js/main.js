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
requirejs.config({
    waitSeconds : 20,
    baseUrl: "./js/",
    shim : {
        // JQUERY UI
          'libs/jquery/ui/jquery.ui.core'  : ['jquery']
        , 'libs/jquery/ui/jquery.ui.position' : ['libs/jquery/ui/jquery.ui.core']
        , 'libs/jquery/ui/jquery.ui.widget' : ['libs/jquery/ui/jquery.ui.core']
        , 'libs/jquery/ui/jquery.ui.mouse' : ['libs/jquery/ui/jquery.ui.widget']
        , 'libs/jquery/ui/jquery.ui.resizable' : ['libs/jquery/ui/jquery.ui.mouse']
        , 'libs/jquery/ui/jquery.ui.button' : ['libs/jquery/ui/jquery.ui.widget']
        , 'libs/jquery/ui/jquery.ui.sortable' : ['libs/jquery/ui/jquery.ui.widget', 'libs/jquery/ui/jquery.ui.mouse', 'libs/jquery/ui/jquery.ui.core']
        , 'libs/jquery/ui/jquery.ui.draggable' : ['libs/jquery/ui/jquery.ui.mouse']
        , 'libs/jquery/ui/jquery.ui.droppable' : ['libs/jquery/ui/jquery.ui.draggable']
        , 'libs/jquery/ui/jquery.ui.dialog' : [
              'libs/jquery/ui/jquery.ui.widget'
            , 'libs/jquery/ui/jquery.ui.draggable'
            , 'libs/jquery/ui/jquery.ui.button'
            , 'libs/jquery/ui/jquery.ui.position'
            , 'libs/jquery/ui/jquery.ui.resizable'
        ]
        , 'libs/jquery/ui/jquery.ui.progressbar' : ['libs/jquery/ui/jquery.ui.widget']
        , 'libs/jquery/ui/jquery.ui.tabs' : ['libs/jquery/ui/jquery.ui.widget']
        , 'libs/jquery/ui/jquery.ui.menu' : ['libs/jquery/ui/jquery.ui.widget']

        , 'libs/jquery/slickgrid/jquery.event.drag-2.0.min' : ['jquery', 'libs/jquery/ui/jquery.ui.sortable']
        , 'libs/jquery/slickgrid/slick.core' : ['libs/jquery/slickgrid/jquery.event.drag-2.0.min', 'libs/jquery/ui/jquery.ui.sortable']
        , 'libs/jquery/slickgrid/slick.grid' : ['libs/jquery/slickgrid/slick.core']
        , 'libs/jquery/slickgrid/slick.dataview' : ['libs/jquery/slickgrid/slick.grid']
        , 'libs/jquery/slickgrid/slick.pager' : ['libs/jquery/slickgrid/slick.dataview']
        , 'libs/jquery/slickgrid/slick.columnpicker' : ['libs/jquery/slickgrid/slick.pager']
        , 'app/util/output-table' : ['libs/jquery/slickgrid/slick.columnpicker', 'libs/jquery/ui/jquery.ui.sortable']

        , 'app/util/ui' : ['libs/jquery/ui/jquery.ui.menu', 'libs/jquery/ui/jquery.ui.tabs', 'libs/jquery/ui/jquery.ui.progressbar', 'app/util/dom']
        , 'libs/jquery/layout/jquery.layout' : ['libs/jquery/ui/jquery.ui.draggable']
        , 'libs/jquery/jstree/jstree' : ['libs/jquery/jstree/vakata']
        , 'libs/jquery/jstree/jstree.sort' : ['libs/jquery/jstree/jstree']
        , 'libs/jquery/jstree/jstree.types' : ['libs/jquery/jstree/jstree']
        , 'libs/jquery/jstree/jstree.themes' : ['libs/jquery/jstree/jstree']
        , 'libs/jquery/jstree/jstree.ui' : ['libs/jquery/jstree/jstree']
        , 'app/folders' : ['libs/jquery/jstree/jstree.themes']
    }
});

require([
      'app/util/config'
    , 'app/layout'
    , "app/util/dialog-account"
    , 'app/editors'
    , 'app/history'
    , 'app/bar-main'
    , 'app/bar-editor'
    , 'app/bar-status'
    , 'app/theme'
    , 'app/editor/editor.ace'
    , 'app/editorsync'
    , 'app/output'
    , 'app/folders'
    , 'app/queries'
    , 'app/support'
    , 'app/startup-wizard'
    , 'app/results'
    , 'app/util/precog'
    , 'app/util/querystring'
    , 'app/eggmanager'
    , "app/util/converters"
    , "app/util/notification"
    , "app/editortips"
    , "app/util/uiconfig"
],

function(config, createLayout, openAccountDialog, createEditors, createHistory, buildBarMain, buildBarEditor, buildBarStatus, theme, buildEditor, sync, buildOutput, buildFolders, buildQueries, buildSupport, buildWizard, buildResults, precog, qs, eastereggs, convert, notification, editortips, uiconfig) {
  function buildUrl(query) {
    var version  = precog.config.version,
        basePath = precog.config.basePath,
        service  = precog.config.analyticsService,
        apiKey   = precog.config.apiKey;

    if(!basePath) {
      basePath = "";
    } else {
      if(basePath.substring(-1) === "/")
        basePath = basePath.substr(0, basePath.length - 1);
      if(basePath.substring(0, 1) === "/")
        basePath = basePath.substr(1);
    }

    return service
      + "analytics/"
      + (version && version !== false && version !== "false" ? "v" + version + "/" : "")
      + "fs/"
      + basePath
      + "?apiKey=" + encodeURIComponent(apiKey)
      + "&q=" + encodeURIComponent(convert.minifyQuirrel(query))
      ;
  }
  $(function() {

    precog.cache.disable();

    var layout = createLayout(config.get('ioPanesVertical'));

    layout.getContainer().hide();

    $(theme).on('changed', function() {
        // refreshes the panes layout after theme changing
        layout.refresh();
    });

    $(theme).on('change', function(e, name) {
        config.set('theme', name);
    });

    function init() {
      var queries,
          editors = createEditors(),
          history = createHistory();

      var barmain = buildBarMain(layout.getBarMain());
      precog.calculateHash();

      var editor = buildEditor(layout.getCodeEditor(), config.get('ioPanesVertical'));
      editor.setTabSize(config.get('tabSize'));
      editor.setUseSoftTabs(config.get('softTabs'));

      $(layout).on('resizeCodeEditor', function() {
        editor.resize();
      });

      $(layout).on('ioOrientationChanged', function(_, vertical) {
        config.set('ioPanesVertical', vertical);
        editor.orientButton(vertical);
      });

      $(theme).on('change', function(e, name) {
        editor.setTheme(theme.getEditorTheme(name, editor.engine()));
      });

      $(editor).on('useSoftTabsChanged', function(_, value) {
        config.set('softTabs', value);
      });

      $(editor).on('tabSizeChanged', function(_, value) {
        config.set('tabSize', value);
      });



      (function() {
        var tips = editortips();
        $(editor).on("mouseovertext", function(_, coords, pos) {
          tips.displayTip(coords, pos, editor.get());
        });
      })();

      var status = buildBarStatus(layout.getStatusBar(), editor, layout);

      var output = buildOutput(layout.getOutput(), editors); // TODO editors should not be passed here

      var support = buildSupport(layout.getSupport());

      $(layout).on('resizeCodeEditor', function() {
        output.resize();
        support.resize();
        results.resize();
      });

      $(output).on('syntaxError', function(_, pos) {
        editor.resetHighlightSyntax();
        editor.highlightSyntax(pos.line - 1, pos.column - 1, pos.text, 'error');
      });

      $(output).on('requestCursorChange', function(_, pos) {
        editor.setCursorPosition(pos.line - 1, pos.column - 1);
      });

      $(output).on('typeChanged', function(_, type) {
        editors.setOutputType(type);
      });

      $(output).on('exportToBuilder', function() {
        var code = editor.get(),
          path = "/labcoat/" + editors.getName();
        window.open("http://builder.reportgrid.com/?data-name="+encodeURIComponent(path)+"&data-source="+encodeURIComponent(buildUrl(code)));
      });

      var results = buildResults(layout.getResults());

      $(results).on('resetHighlightSyntax', function() {
        editor.resetHighlightSyntax();
      });

      $(results).on('highlightSyntax', function(_, pos) {
        editor.highlightSyntax(pos.line - 1, pos.column - 1, pos.text, pos.type);
      });

      $(results).on('goto', function(_, pos) {
        editor.setCursorPosition(pos.line - 1, pos.column - 1);
      });

      var executions = {};
      $(precog).on("execute", function(_, query, lastExecution, id) {
        var workingid;
        for(var key in executions) {
          if(!executions.hasOwnProperty(key)) continue;
          if(executions[key].name === editors.getName())
          {
            workingid = key;
            break;
          }
        }
        if(workingid) {
          $(precog).trigger("abort", workingid);
        }

        executions[id] = { query : query, name : editors.getName() };
        status.startRequest();
      });

      function is_example_query(name) {
        return (/^examples\//).test(name);
      }

      function is_custom_query(info) {
        var is_query_load = function(q) {
          var path = /^\s*\/(\/[a-z0-9-_.]+)+\s*$/i,
            load = /^\s*load\s*\(\s*"[^"]+"\s*\)\s*$/i;
          return path.test(q) || load.test(q);
        };

        if(precog.is_demo()) {
          return !(is_example_query(info.name) || is_query_load(info.query));
        } else {
          return !is_query_load(info.query);
        }
      }

      $(precog).on("completed", function(_, id, data, errors, warnings, extra) {
        var execution = executions[id];
        history.save(execution.name, execution.query, data); // TODO CHECK HOW PAGINATION AFFECTS THE BEHAVIOR OF HISTORY
        status.endRequest(true);
        if(editors.getName() === execution.name) {
          output.setOutput(data, null, editors.getOutputOptions()); // TODO ADD HERE OUTPUT OPTIONS AND REMOVE REFERENCES TO DEFAULT TABLE
          results.setEditorMessages(errors, warnings);
          // TODO SET OUTPUT OPTIONS FOR PAGINATION
          editors.setOutputData(data);
          editors.setOutputResults({ errors : errors, warnings : warnings });
          if(editorbar.historyPanelIsOpen()) {
            refreshHistoryList();
          }
        } else {
          var index = editors.getIndexByName(execution.name);
          if(index >= 0) {
            var currenttype = editors.getOutputType(index);
            if(currenttype === "message" || currenttype === "error")
              editors.setOutputType("table", index);
            // TODO SET OUTPUT OPTIONS FOR PAGINATION
            editors.setOutputData(data, index);
            editors.setOutputResults({ errors : errors, warnings : warnings }, index);
          }
        }
      });

      function convertErrorToResultErrors(e) {
        var t = e.detail;
        e.detail = e.message;
        e.message = t;
        return [{
          message : "error",
          position : e,
          timestamp : +new Date()
        }];
      }

      $(precog).on('failed', function(_, id, data) {
        data = data instanceof Array ? data[0] : data;
        var execution = executions[id];
        delete executions[id];
        status.endRequest(false);


        var errors = convertErrorToResultErrors(data);
        if(editors.getName() === execution.name) {
          output.setOutput(data, 'error', editors.getOutputOptions());
          results.update(errors, []);
          editors.setOutputData(data);
          editors.setOutputResults({ errors : errors, warnings : [] });
        } else {
          var index = editors.getIndexByName(execution.name);
          if(index >= 0) {
            editors.setOutputData(data, index);
            editors.setOutputResults({ errors : errors, warnings : warnings }, index);
          }
        }
      });

      (function() {
        var old = window.onerror;
        window.onerror = function(e) {
          var msg;
          try {
            msg = JSON.stringify(e);
          } catch(e) {
            msg = "" + e;
          }
          if(old)
            old(e);
        };
      })();

      $(precog).on('aborted', function(_, id) {
        var execution = executions[id];
        delete executions[id];
        status.endRequest(false);
      });

      var execTimer;
      $(editor).on("execute", function(_, code) {
        if(eastereggs.easterEgg(code)) return;

        clearInterval(execTimer);
        execTimer = setTimeout(function() {
          var pagination = output.paginationOptions();
          //        precog.query(code, pagination);
          precog.query(code);
        }, 0);
      });
      /*
       $(output).on("paginationChanged", function(_) {
       clearInterval(execTimer);
       execTimer = setTimeout(function() {
       var pagination = output.paginationOptions();
       console.log(JSON.stringify(pagination));
       precog.query(editor.get(), pagination);
       }, 0);
       });
       */
      $(editors).on('activated', function(_, index) {
        var data     = editors.getOutputData(),
          type     = editors.getOutputType(),
          options  = editors.getOutputOptions(),
          oresults = editors.getOutputResults() || { errors : [], warnings : []};
        output.setOutput(data, type, options);

         if(results)
          results.setEditorMessages(oresults.errors, oresults.warnings);
      });

      $(editors).on('saved', function(_, data) {
        queries.querySave(data.name, data.code);
      });

      sync(editor, editors, config);

      var folders = buildFolders(layout.getSystem());

      $(folders).on('querypath', function(e, path) {
        if(path.substr(0, 1) !== "/")
          path = "/" + path;
        var q = '/' + path.replace(/"/g, '\"');
        if(q === "//")
          q = 'load("/")';
        if(editors.getCode().trim() == '') {
          editor.set(q);
        } else {
          editors.add({ code : q });
          editors.activate(editors.count()-1);
        }
        editor.triggerExecute();
      });

      $(folders).on("uploadComplete", function(_, e) {
        results.setMessages([{
          type : "upload",
          detail : "ingested " + e.ingested + " events"
        }]);
      });

      $(folders).on("uploadError", function(_, e) {
        var messages = [],
            maxerrors = 10;
        if(e.ingested) {
          messages.push({
            type : "upload",
            detail : "ingested " + e.ingested + " events"
          });
        }
        if(e.skipped) {
          messages.push({
            type : "warning",
            detail : "skipped ingest of " + e.skipped + " events"
          });
        }
        for(var i = 0; i < Math.min(maxerrors, e.failed); i++) {
          var err = e.errors[i];
          messages.push({
            type : "error",
            detail : "ingestion error",
            nline : err.line,
            line : err.reason
          });
        }
        if(maxerrors < e.failed) {
          messages.push({
            type : "error",
            detail : "... other " + (e.failed - maxerrors) + " events failed ingesting "
          });
        }
        results.setMessages(messages);
      });


      queries = buildQueries(layout.getQueries());
      $(queries).on('requestopenquery', function(_, data) {
        editors.open(data.name, data.code);
      });
      $(queries).on('removed', function(_, name) {
        var index = editors.getIndexByName(name);
        if(index >= 0) {
          editorbar.invalidateTab(index);
        }
      });

      var editorbar = buildBarEditor(layout.getBarEditor(), queries, editors);

      $(editors).on('saved', function(e, editor){
        var index = editors.getIndexById(editor.id);
        if(index < 0) return;
        editorbar.changeTabName(index, editor.name);
      });

      $(editors).on("added", function(e, editor) {
        editorbar.addTab(editor.name, !!editor.dirty);
      });

      $(editors).on('removed', function(e, name) {
        editorbar.removeTabByName(name);
      });

      var invalidationSuspended = true;
      function currentTabInvalidator() {
        if(invalidationSuspended) return;
        editors.setDirty();
        editorbar.invalidateTab(editors.current());
      }

      $(editor).on('change', currentTabInvalidator);

      $(editors).on('activated', function(e, index) {
        editorbar.activateTab(index);
        clearInterval(this.k);
        this.k = setTimeout(function() {
          invalidationSuspended = false;
        }, 1000);
        if(editorbar.historyPanelIsOpen()) {
          refreshHistoryList();
        }
      });

      function refreshHistoryList() {
        var data = history.revisions(editors.getName());
        editorbar.displayHistoryList(data);
      }

      $(editors).on('deactivated', function(e, index) {
        invalidationSuspended = true;
      });

      $(editors).on('removed', function(e, name) {
        if(!queries.queryExist(name))
          history.remove(name);
      });

      $(editorbar).on('requesthistorylist', refreshHistoryList);

      $(editorbar).on('requestopenrevision', function(e, info) {
        var name = editors.getName(),
          data = history.load(name, info.index);
        if(info.usenewtab) {
          editors.add({ code : data.code, output : { result : data.data } });
          editors.activate(editors.count()-1);
        } else {
          editor.set(data.code);
        }
        output.setOutput(data.data, null, editors.getOutputOptions());
      });

      $(editorbar).on('tabrenamed', function(e, data) {
        history.rename(data.oldname, data.newname);
        if(editorbar.historyPanelIsOpen()) {
          refreshHistoryList();
        }
      });

      if(uiconfig.disableUpload) {
        barmain.hideWizard();
      } else {
        var wizard = buildWizard({
          folders : folders
        });
        $(barmain).on("startWizard", function() {
          wizard.start();
        });

      }

      editors.load();

      var query = qs.get('q');

      function editorcontains(q) {
        for(var i = 0; i < editors.count(); i++) {
          if(editors.getCode(i) === q)
            return true;
        }
        return false
      }

      if(!editors.count() || (query && !editorcontains(query))) {
        editors.add(query && { code : query });
      }
      setTimeout(function() {
        editors.activate(editors.count()-1); // prevents bug in safari

        $(output).on('optionsChanged', function(_, options) {
          editors.setOutputOptions(options);
        });

        theme.set(precog.config.theme || config.get('theme', 'gray'));

        config.monitor.bind('theme', function(e, name) {
          theme.set(name);
        });

        config.monitor.bind('softTabs', function(_, value) {
          editor.setUseSoftTabs(value);
        });

        config.monitor.bind('tabSize', function(_, value) {
          editor.setTabSize(value);
        });

        layout.getContainer().show();

        layout.refresh();
      }, 150);
    }


    // AUTHENTICATION
    theme.set(precog.config.theme || config.get('theme', 'gray'));
    if(precog.config.apiKey)
      init();
    else
      openAccountDialog(precog, function() {
        if(!precog.config.apiKey) {
          precog.config.apiKey = "5CDA81E8-9817-438A-A340-F34E578E86F8";
          precog.config.analyticsService = "https://labcoat.precog.com/";
//          window.Precog.$.Http.setUseJsonp(true);
        }
        init();
      });
  });
});