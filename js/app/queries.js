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
      "app/util/precog"
    , "app/util/storagemonitor"
    , "app/util/ui"
    , "app/util/utils"
    , "app/config/demo-queries"
    , "app/util/dialog-lineinput"
    , "app/util/dialog-confirm"

    , "rtext!templates/toolbar.folders.html"

    , 'libs/jquery/jstree/vakata'
    , 'libs/jquery/jstree/jstree'
    , 'libs/jquery/jstree/jstree.sort'
    , 'libs/jquery/jstree/jstree.ui'
    , 'libs/jquery/jstree/jstree.themes'
],

function(precog, createStore, ui, utils, demo, openRequestInputDialog, openConfirmDialog, tplToolbar) {
    var list = [],
        DEMO_TOKEN = "5CDA81E8-9817-438A-A340-F34E578E86F8";

    return function(el) {
        var STORE_KEY = "pg-quirrel-queries-"+precog.hash;
        var store = createStore(STORE_KEY, { queries : (DEMO_TOKEN === precog.config.apiKey ? demo : {}), folders : [] });
        var wrapper;

        el.find(".pg-toolbar").append(tplToolbar);
        var elDescription  = el.find(".pg-toolbar-description"),
            elActions      = el.find(".pg-toolbar-actions"),
            elContext      = el.find(".pg-toolbar-context"),
            elMain         = el.find(".pg-queries"),
            elTree         = elMain.append('<div class="pg-tree"></div><div class="pg-message ui-content ui-state-highlight ui-corner-all"><p>You don\'t have saved queries. To save a query use the "disk" button on the editor toolbar.</p></div>').find(".pg-tree"),
            elRoot         = elTree.append('<div class="pg-root"></div>').find(".pg-root"),
            elFolders      = elTree.append('<div class="pg-structure"></div>').find(".pg-structure"),
            contextButtons = [
                {
                    el : ui.button(elContext, {
                        text : false,
                        icon : "ui-icon-new-folder",
                        description : "create folder",
                        handler : function() {
                            var path = $(selectedNode).attr("data-path");
                            if(path === "/") path = "";
                            requestFolderCreationAt(path);
                        }
                    }),
                    groups : ["root", "folder"]
                }, {
                    el : ui.button(elContext, {
                        text : false,
                        icon : "ui-icon-new-query",
                        description : "create query",
                        handler : function() {
                            var folder = selectedNode,
                                path = $(folder).attr("data-path");
                            addQueryToFolder(path === "/" ? -1 : folder, "   ", function(el) {
                                function removeTempNode() {
                                    tree.jstree("delete_node", el);
                                }
                                ui.edit($(el).find("a"), {
                                    handler : function(name, callback) {
                                        if(path.substr(-1) !== "/") path += "/";
                                        var err = utils.validateQueryName(name, path + name, wrapper);
                                        callback(err);
                                        if(!err) {
                                            removeTempNode();
                                            var p = (path + name).substr(1);
                                            wrapper.queryCreate(p, '');
                                        }
                                    },
                                    cancel : function() {
                                        tree.jstree("delete_node", el);
                                    }
                                });
                            });
                        }
                    }),
                    groups : ["root", "folder"]
                }, {
                    el : ui.button(elContext, {
                        text : false,
                        icon : "ui-icon-trash",
                        description : "remove folder/query",
                        handler : function() {
                            var path = $(selectedNode).attr("data-path");
                            if(path.substr(0, 1) === "/")
                                requestFolderRemovalAt(path);
                            else
                                wrapper.queryRemove(path);
                        }
                    }),
                    groups : ["folder", "query"]
                }, {
                    el : ui.button(elContext, {
                        text : false,
                        icon : "ui-icon-rename",
                        description : "rename query",
                        handler : function() {
                            var path = $(selectedNode).attr("data-path");
                            path = path.split("/");
                            var name = path.pop();
                            path = path.length === 0 ? "" : path.join("/")+"/";

                            ui.edit($(selectedNode).find("a"), {
                                handler : function(newname, callback) {
                                    var err = utils.validateQueryName(newname, path + newname, wrapper);
                                    callback(err);
                                    if(!err) {
                                        renameQuery(path + name, path + newname);
                                    }
                                }
                            });
                        }
                    }),
                    groups : ["query"]
                }
            ],
            selectedNode;
        elDescription.html("query manager");

        function renameQuery(oldname, newname) {
            var code = store.get("queries."+utils.normalizeQueryName(oldname)).code;
            wrapper.queryCreate(newname, code);
            wrapper.queryRemove(oldname);
        }

        function refreshActions() {
            var path = selectedNode && $(selectedNode).attr("data-path");
            $.each(contextButtons, function() {
                $(this.el).button("disable");
            });
            if(path) {
                var type = path === "/" ? "root" : (path.substr(0, 1) === "/" ? "folder" : "query");
                $.each(contextButtons, function() {
                    if(this.groups.indexOf(type) >= 0)
                        $(this.el).button("enable");
                });
            }
        }

        refreshActions();

        function requestFolderRemovalAt(path) {
            var title   = "Remove Folder",
                message = "Are you sure you want to remove the folder <i>"+(path || "/")+"</i> and all if its content? The operation cannot be undone!";
            openConfirmDialog(title, message, function() {
                // collect all queries at path and in the subfolders
                var queries = store.get("queries", {}),
                    subqueries = [],
                    parent = path.substr(1) + "/",
                    len = parent.length;
                for(var key in queries) {
                    if(queries.hasOwnProperty(key)) {
                        if(key.substr(0, len) === parent)
                            subqueries.push(key);
                    }
                }
                // collect all of subfolders from "folders"
                var subfolders = [path];
                parent = path + "/";
                len = parent.length;
                for(var i = 0; i < folders.length; i++) {
                    if(folders[i].substr(0, len) === parent)
                        subfolders.push(folders[i]);
                }

                // remove all collected queries
                for(var i = 0; i < subqueries.length; i++) {
                    wrapper.queryRemove(subqueries[i]);
                }

                // remove all collected folders
                for(var i = 0; i < subfolders.length; i++) {
                    utils.arrayRemove(folders, subfolders[i]);
                }
                // save folders
                store.set("folders", folders, true);

                // remove node
                var node = getFolderNodeByPath(path);
                tree.jstree("delete_node", node);
            });
        }

        function requestFolderCreationAt(path) {
            var title   = "Create Folder",
                message = "Create a sub folder at: <i>"+(path || "/")+"</i>";
            openRequestInputDialog(title, message, "folder name", "", function(name) {
                if(null != name && name.match(/^[a-z0-9]+$/i))
                    return null; // OK
                else
                    return "path name cannot be empty and it can only be composed of alpha-numeric characters";
            }, function(name) {
                var p = path +"/"+ name;
                folders.push(p);
                store.set("folders", folders, true);
                whenPathExists(p);
            });
        }

        var tree = elFolders.jstree({
            plugins : [
                "themes", "sort", "ui", "dnd"
            ],
            sort : function (a, b) {
                if($(a).attr("rel") > $(b).attr("rel")) {
                    return 1;
                }
                return $(a).attr("data-path") > $(b).attr("data-path") ? 1 : -1;
            },
            types : {
                query : {
                    valid_children : "none"
                },
                folder : {
                    valid_children : ["folder", "query"]
                }
            },
            ui : {
                  select_limit : 1
                , selected_parent_close : "deselect"
                , select_multiple_modifier : false
                , select_range_modifier : false
            }
        });

        elRoot.html('<div class="jstree jstree-default"><a href="#" data-path="/"><ins class="jstree-icon jstree-themeicon"> </ins>/</a></div>');
        elRoot.find('a')
            .mouseenter(function(){
                $(this).addClass("jstree-hovered");
            })
            .mouseleave(function() {
                $(this).removeClass("jstree-hovered");
            })
            .click(function() {
                tree.jstree("deselect_all");
                $(this).addClass("jstree-clicked");
                selectedNode = this;
                refreshActions();
            });
        tree.bind("click.jstree", function() {
            elRoot.find('a').removeClass("jstree-clicked");
            selectedNode = tree.jstree("get_selected");
            refreshActions();
        });

        function openQuery(id) {
            $(wrapper).trigger("requestopenquery", store.get("queries."+utils.normalizeQueryName(id)));
        }

        function hideMessage() {
            elTree.show();
            elMain.find(".pg-message").hide();
        }

        function showMessage() {
            elTree.hide();
            elMain.find(".pg-message").show();
        }

        function pathFromId(id) {
            if(id.substr(0, 1) === '/') id = id.substr(1);
            var t = id.split("/");
            t.pop(); // discard query name
            if(t.length === 0)
                return "/";
            else
                return "/" + t.join("/");
        }

        function getFolderNodeByPath(path) {
            if(!path || path === "/") return -1;
            var list = tree.find("li[rel=folder]"),
                len  = list.length;
            for(var i = 0; i < len; i++) {
                if($(list.get(i)).attr("data-path") === path) {
                    return list.get(i);
                }
            }
            return null;
        }

        function getQueryNodeByPath(path) {
            if(!path || path === "/") return -1;
            var list = tree.find("li[rel=query]"),
                len  = list.length;
            for(var i = 0; i < len; i++) {
                if($(list.get(i)).attr("data-path") === path) {
                    return list.get(i);
                }
            }
            return null;
        }

        function createNodeCreatedHandler(path, callback) {
            var f = function(e, data) {
                var r = data.rslt, el = $(r.obj[0]);
                if(el.attr("data-path") !== path) return;
                tree.unbind("create_node.jstree", f);
                if(callback)
                    callback(el);
            }
            return f;
        }

        function addQueryToFolder(folder, name, callback) {
            tree.bind("create_node.jstree", createNodeCreatedHandler(name, function(el) {
                tree.jstree("set_icon", el, 'pg-tree-leaf');
                $(el).dblclick(function() {
                    var path = $(this).attr("data-path");
                    openQuery(path);
                });
                if(callback) callback(el);
            }));
            return tree.jstree(
                  "create_node"
                , folder
                , {
                     "title" : name.split("/").pop()
                    , "li_attr" : {
                        "data-path" : name,
                        rel : "query"
                    }
                }
                , "last"
            );
        }

        function addChildFolder(parent, name, callback) {
            if(!parent) parent = -1;
            var path = (parent === -1 ? "" : $(parent).attr("data-path")) + "/" + name;
            tree.bind("create_node.jstree", createNodeCreatedHandler(path, function(el) {
                $(el).find("a:first").dblclick(function(e) {
                    tree.jstree("toggle_node", selectedNode);
                    e.preventDefault(); return false;
                });
                if(callback) callback(el);
            }));

            return tree.jstree(
                  "create_node"
                , parent
                , {
                      "title" : name
                    , "li_attr" : {
                        "data-path" : path,
                        rel : "folder"
                    }
                }
                , "last"
            );
        }

        function whenPathExists(path, handler) {
            handler = handler || function() {};
            var fpath = path, parent;
            while(null === (parent = getFolderNodeByPath(fpath))) {
                var parts = fpath.substr(1).split("/");
                parts.pop();
                fpath = "/" + parts.join("/");
            }
            if(fpath === path) {
                handler(parent);
                return;
            }
            var segment = path.substr(fpath.length).split("/").filter(function(v) { return !!v; }).shift();
            addChildFolder(parent, segment, function(el) {
                whenPathExists(path, handler);
            });
        }

        function addQuery(id, name) {
            var path = pathFromId(id);
            whenPathExists(path, function(el) {
                addQueryToFolder(el, name);
                hideMessage();
            });
        }

        function removeQuery(path) {
            var node = getQueryNodeByPath(path);
            if(!node) return;
            tree.jstree("delete_node", node);
        }

        var queries = store.get("queries");
        for(var id in queries) {
            if(queries.hasOwnProperty(id)) {
                addQuery(id, queries[id].name);
            }
        }

        var folders = store.get("folders", []);
        for(var i = 0; i < folders.length; i++) {
            var path = folders[i];
            whenPathExists(path);
        }
        store.monitor.bind("queries", function(_, q) {
            var names = [];
            for(var query in q) {
                if(q.hasOwnProperty(query))
                    names.push(query);
            }
            var removed = utils.arrayDiff(list, names),
                added   = utils.arrayDiff(names, list);

            store.load();
            for(var i = 0; i < removed.length; i++) {
                removeQuery(utils.normalizeQueryName(removed[i]));
                $(wrapper).trigger("removed", removed[i]);
            }
            for(var i = 0; i < added.length; i++) {
                addQuery(utils.normalizeQueryName(added[i]), added[i]);
            }
            list = names;
        });
        store.monitor.bind("folders", function(_, names) {
            var added   = utils.arrayDiff(names, folders);

            store.load();
            for(var i = 0; i < added.length; i++) {
                whenPathExists(added[i]);
            }
            folders = names;
        });

        return wrapper = {
            queryExist : function(name) {
                var id = utils.normalizeQueryName(name);
                return !!store.get("queries."+id);
            },
            querySave : function(name, code) {
                if(this.queryExist(name))
                    return this.queryUpdate(name, code);
                else
                    return this.queryCreate(name, code);
            },
            queryCreate : function(name, code) {
                var id = utils.normalizeQueryName(name);
                var query = store.get("queries."+id);
                if(query) return false;
                store.set("queries."+id, query = {
                    name : name,
                    code : code
                }, true);
                addQuery(id, name);
                $(wrapper).trigger("created", query);
                return true;
            },
            queryUpdate : function(name, code) {
                var id = utils.normalizeQueryName(name);
                var query = store.get("queries."+id);
                if(!query) return false;
                query.code = code;
                store.set("queries."+id, query, true);
                $(wrapper).trigger("updated", query);
                return true;
            },
            queryRemove : function(name) {
                var id = utils.normalizeQueryName(name);
                var query = store.get("queries."+id);
                if(!query) return false;
                store.remove("queries."+id);
                removeQuery(name);
                $(wrapper).trigger("removed", query.name);
                return true;
            },
            nameAtPath : function(name) {
                if(!selectedNode)
                    return name;
                var path = $(selectedNode).attr("data-path");
                if(!path || path === "/")
                    return name;
                if(path.substr(0, 1) === "/")
                    return path.substr(1) + "/" + name;
                path = path.split("/");
                path.pop();
                return path.join("/")+"/"+name;
            }
        };
    }
});
