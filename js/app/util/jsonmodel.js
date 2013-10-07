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

    function formatCell(row, cell, value, columnDef, dataContext, subordinate) {
        if("undefined" === typeof value) {
            return "[undefined]";
        } else if(value === null) {
            return "[null]";
        } else if(value instanceof Array) {
            var result = [];
            for(var i = 0; i < value.length; i++)
            {
                result.push(formatCell(row, cell, value[i], columnDef, dataContext, true));
            }
            return result.join("; ");
        } else if("object" === typeof value) {
            var result = [];
            for(var key in value) {
                if(value.hasOwnProperty(key)) {
                    var pair = key + ": " + formatCell(row, cell, value[key], columnDef, dataContext, true);
                    result.push(pair);
                }
            }
            return result.join(", ");
        } else if(value === "") {
            return "[empty]";
        } else if(isNaN(value)) {
            value = value.toString().replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
            return '"' + value.replace(/"/g, '\\"') + '"';
        } else {
            return value;
        }
    }

    var now = new Date(),
        mindate = +new Date(now.getFullYear() - 10, now.getMonth(), now.getDay(), 0, 0, 0),
        maxdate = +new Date(now.getFullYear() + 10, now.getMonth(), now.getDay(), 0, 0, 0);

    function canParse(d) {
        try {
            ReportGrid.date.parse(d);
            return true;
        } catch(e) {
            return false;
        }
    }

    function periodicity(t1, t2) {
        var delta = t2 - t1;
        if(delta >= 3 * 1000 * 60 * 60 * 24 * 365)
            return "year";
        else if(delta >= 3 * 1000 * 60 * 60 * 24 * 31)
            return "month";
        else if(delta >= 7 * 1000 * 60 * 60 * 24)
            return "day";
        else
            return "minute";
    }

    return {
        create : function(data) {
            var value = data[0],
                columns = [];
            if(value !== null && "object" === typeof value) {
                for(var key in value) {
                    var v = value[key];
                    if(!value.hasOwnProperty(key) || key === "#id")
                        continue;
                    var params = {
                          id : key
                        , name : key
                        , field : key
                        , sortable: true
                        , formatter : formatCell
                        , pgvalue : false
                        , type : typeof v
                        , multivalue : v instanceof Array || "object" === this.type
                    };
                    if(!params.multivalue) {
                        if(params.field.match(/time|date|created/i)
                            && (
                                   (params.type === "number" && v > mindate && v < maxdate)
                                || (params.type === "string" && null !== canParse(v))
                                )
                            ) {
                            params.subtype = "datetime";
                        }
                        if(params.subtype === "datetime" && data.length > 1) {
                            data.sort(function(a, b) {
                                return ReportGrid.compare(a[key], b[key]);
                            });
                            try {
                                var t1 = params.type === "number" ? data[0][key] : ReportGrid.date.parse(data[0][key]),
                                    t2 = params.type === "number" ? data[data.length-1][key] : ReportGrid.date.parse(data[data.length-1][key]);
                                params.periodicity = periodicity(t1, t2);
                            } catch(e) {

                            }
                        }
                    }
                    columns.push(params);
                }
            } else {
                columns.push({
                      id : "value"
                    , name : "Value"
                    , field : "value"
                    , pgvalue : true
                    , sortable: true
                    , multivalue : false
                });
            }
            return columns;
        },
        find : function(model, field) {
            for(var i = 0; i < model.length; i++)
                if(model[i].field === field)
                    return model[i];
            return null;
        },
        axis : function(model, field) {
            var column = this.find(model, field);
            if(!column) return null;
            var axis = { type : field };
            if(column.subtype === "datetime" && column.periodicity) {
                axis.type = "time:" + column.periodicity;
                axis.transformer = function(data) {
                    if(column.type === "number") {
                        for(var i = 0; i < data.length; i++) {
                            data[i][axis.type] = data[i][column.field];
                        }
                    } else {
                        for(var i = 0; i < data.length; i++) {
                            data[i][axis.type] = ReportGrid.date.parse(data[i][column.field]);
                        }
                    }
                    return data;
                }
            };

            return axis;
        }
    };
});