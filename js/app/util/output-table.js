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
       "app/util/jsonmodel"


    // JQUERY UI
    , 'libs/jquery/slickgrid/jquery.event.drag-2.0.min'
    , 'libs/jquery/ui/jquery.ui.sortable'
    , 'libs/jquery/slickgrid/slick.core'
    , 'libs/jquery/slickgrid/slick.grid'
    , 'libs/jquery/slickgrid/slick.dataview'
    , 'libs/jquery/slickgrid/slick.pager'
    , 'libs/jquery/slickgrid/slick.columnpicker'
],

function(jsonmodel) {
    return function() {

        var PAGE_SIZE = 20,
            elPanel = $('<div class="ui-widget"><div class="pg-table" style="height:100%;width:100%"></div></div>'),
            elOutput = elPanel.find('.pg-table'),
            dataView = new Slick.Data.DataView(),
            grid,
            gridOptions = {
                  enableCellNavigation: false
                , enableColumnReorder: true
                , autoHeight : false
                , forceFitColumns: true
                , multiColumnSort: true
            },
            wrapper;
        dataView.setPagingOptions({
            pageSize: PAGE_SIZE
        });
        dataView.onRowCountChanged.subscribe(function (e, args) {
            if(!grid) return;
            try {
                grid.updateRowCount();
            } catch(_) {}
            grid.render();
        });
        dataView.onRowsChanged.subscribe(function (e, args) {
            if(!grid) return;
            grid.invalidateRows(args.rows);
            grid.render();
        });

        function transformData(model, data) {
            var result = [];
            if(model.length != 1 || !model[0].pgvalue) {
                for(var i = 0; i < data.length; i++) {
                    var o = $.extend({}, data[i], { "#id" : "#" + i});
                    result.push(o);
                }
            } else {
                for(var i = 0; i < data.length; i++) {
                    result.push({ value : null === data[i] ? "[null]" : data[i], "#id" : "#" + i });
                }
            }
            return result;
        }

        function updateDataView(data, options) {
            dataView.setItems([], "#id"); // forces correct refreshes of data

            if(options && options.table.sort)
                sortData(data, options.table.sort);

            dataView.beginUpdate();
            dataView.setItems(data, "#id");
            if(options && options.table.pager && (("undefined" !== typeof options.table.pager.size) || ("undefined" !== typeof options.table.pager.pageNum)))
            {
                var pager = {};
                if(options.table.pager.size)
                    pager.pageSize = options.table.pager.size;
                if(options.table.pager.page)
                    pager.pageNum = options.table.pager.page;
                dataView.setPagingOptions(pager);
            }
            dataView.endUpdate();
        }

        function reducedResize() {
            clearInterval(this.killReducedResize);
            this.killReducedResize = setTimeout(function() {
                if(grid)
                    grid.resizeCanvas();
            }, 20);
        }

        function sortData(data, cols) {
            data.sort(function (dataRow1, dataRow2) {
                for (var i = 0, l = cols.length; i < l; i++) {
                    var field = cols[i].field;
                    var sign = cols[i].asc ? 1 : -1;
                    var value1 = dataRow1[field], value2 = dataRow2[field];
                    var result = (value1 == value2 ? 0 : (value1 > value2 ? 1 : -1)) * sign;
                    if (result != 0) {
                        return result;
                    }
                }
                return 0;
            });
        }

        var changePagerHandler, options;
        return wrapper = {
            type : "table",
            name : "Table",
            panel : function() { return elPanel; },
            toolbar : function() {
                return $('<div></div>');
            },
            update : function(data, o) {
                options = o;
                if("undefined" === typeof options.table) {
                    options.table = {
                        pager : {}
                    };
                }
                if(changePagerHandler)
                    dataView.onPagingInfoChanged.unsubscribe(changePagerHandler);
                try {
                    if(grid) grid.destroy();
                } catch(e) {}

                var model = (!data || data.length == 0) ? [{
                    id : "empty",
                    name : "No Records Match Your Query",
                    field : "empty"
                }] : jsonmodel.create(data);
                data = transformData(model, data);

                grid = new Slick.Grid(elOutput, dataView, model, gridOptions);

                changePagerHandler = function(e, args) {
                    options.table.pager = { size : args.pageSize, page : args.pageNum };
                    $(wrapper).trigger("optionsChanged", options);
// TODO uncomment when pagination is fully supported
//                    $(wrapper).trigger("paginationChanged", options.table.pager);
                }
                if(options.table.sort && grid) {
                    grid.setSortColumns(options.table.sort.map(function(col){
                        return {
                            columnId : col.field,
                            sortAsc : col.asc
                        };
                    }));
                }

                grid.onSort.subscribe(function (e, args) {
                    options.table.sort = args.sortCols.map(function(def) {
                        return {
                            asc : def.sortAsc,
                            field : def.sortCol.field
                        };
                    });
                    $(wrapper).trigger("optionsChanged", options);
// TODO uncomment when pagination is fully supported
//                    $(wrapper).trigger("sortChanged", options.table.sort);
                    updateDataView(data, options);
                });
                new Slick.Controls.Pager(dataView, grid, this.toolbar);

                updateDataView(data, options);

                dataView.onPagingInfoChanged.subscribe(changePagerHandler);

                reducedResize();
            },
            preferredDownloadFormat : function() {
                return 'csv';
            },
            resize : reducedResize,
            paginationOptions : function() {
              var pager = options && options.table && options.table.pager && options.table.pager || { page : 0, size : PAGE_SIZE };
              var sort  = options && options.table && options.table.sort || null;
              return {
                skip  : pager.page * pager.size,
                limit : pager.size,
                sort  : sort
              }
            }
        };
    };
});