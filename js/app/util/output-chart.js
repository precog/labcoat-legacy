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
    , "app/util/ui"
    , "app/util/notification"
    , "rtext!templates/panel.options.chart-output.html"



    , "libs/precog/reportgrid-charts"
//    , "https://api.reportgrid.com/js/reportgrid-core.js"
//    , "https://api.reportgrid.com/js/reportgrid-charts.js?authCode=r59uh0XNfjFqI1M%2ByxJK33KGZ0Mm82UqEme9ShK7g12KlIHBhCZK1rFV7KdOHgZ7GAePArW%2FT4EuOgzCPCbZB%2BAGlqH7I8OeRMwxKJA5lSRO1GTNp5IkXcrS4rKVj0KT3jnc%2Fkc6gJBjzZPBwwX10Xgdg2%2B%2FKI1QnoOCVhDJ8Hg%3D"
//    , "http://localhost/rg/js/reportgrid-charts.js?authCode=IGLBxMA3vSoTDWz%2BFu3cjPZNmdpS%2BfYSlwyN7LvpssTRTRpE4Lt%2BhqO9nX6LaLf2SZZBVf7vFDTyUID1uWUdoPC73kAA9HVzsOZwxO5jY%2BNdazmeBwK64oD5vRkxth5vO3ejfjx0nkh7mgaoSwde0zri1V%2Bb%2BSVHR92RidT5Isk%3D"
//    , "http://localhost/rg/js/reportgrid-charts.js?authCode=WUfNPIu3l%2Fqz50AUSnj8Uh0pzTe3IzePQpV5m2TAmKAujD%2FE187KOndEUq6AhSEd9NbQBHCOkSDQuyie1vSB6VwFjJ1vFDNPBrnKA%2FacAJhQGrTFEsR%2B15tPFk8RqWG9hcHH8y7XFxXIrobj49huCjIEs0mZISPuSwgIe5bSwvo%3D"
],

function(jsonmodel, ui, notification, tplOptionsPanel) {
    ReportGrid.authCode = "r59uh0XNfjFqI1M+yxJK33KGZ0Mm82UqEme9ShK7g12KlIHBhCZK1rFV7KdOHgZ7GAePArW/T4EuOgzCPCbZB+AGlqH7I8OeRMwxKJA5lSRO1GTNp5IkXcrS4rKVj0KT3jnc/kc6gJBjzZPBwwX10Xgdg2+/KI1QnoOCVhDJ8Hg=";
    var wrapper,
        elPanel  = $('<div class="ui-widget ui-content pg-overflow-hidden"><div class="pg-chart"></div></div>'),
        elChart  = elPanel.find('.pg-chart');

    var spaces = 2,
        toolbar, options, currentData;

    var noti, model, optionButton, builderButton, params;

    function delayedRender() {
        clearInterval(this.k);
        this.k = setTimeout(render, 50);
    }

    function render() {
        try {
            elChart.find("*").remove();
            ReportGrid.chart(elChart.get(0), params);
        } catch(e) {}
    }

    function formatLabel(value, axis) {
        if(axis.type.substr(0, 5) === "time:") {
            return ReportGrid.format(typeof value === "number" ? new Date(value) : ReportGrid.date.parse(value), "DT");
        } else {
            return ReportGrid.humanize(value);
        }
    }

    function refresh() {
        clear();
        if(ReportGrid.tooltip) ReportGrid.tooltip.hide();
        if(!options.chart.x || !options.chart.y || options.chart.x === options.chart.y) return;

        if(!options.chart.samplesize)
            options.chart.samplesize = 100;

        var x = jsonmodel.axis(model, options.chart.x),
            y = jsonmodel.axis(model, options.chart.y);

        if(!x || !y) return;

        var datapoints = currentData.slice(0);
        if(x.transformer) {
            datapoints = x.transformer(datapoints);
        }
        if(y.transformer) {
            datapoints = y.transformer(datapoints);
        }
        datapoints = dataSort(datapoints, options.chart.x);
        if(datapoints.length > options.chart.samplesize) {
            datapoints = datapoints.slice(0, options.chart.samplesize);
        }

        params = {
            axes : [x, y],
            data : datapoints,
            options : {
//                download : true,
                displayrules : true,
                visualization : (x.type.substr(0, 5) === "time:") ? "linechart" : "barchart", // "scattergraph",
                label : {
                    axis : function(axis) {
                        return axis;
                    },
                    datapointover : function(dp, stats) {
                        return formatLabel(dp[options.chart.x], x) + ": " + formatLabel(dp[options.chart.y], y);
                    }
                }
            }
        };
        if(params.options.visualization === "linechart")
            params.options.effect = "dropshadow";
        if(options.chart.segment)
            params.options.segmenton = options.chart.segment;
        delayedRender();
    }

    function dataSort(data, x) {
        data = data.splice(0);
        data.sort(function(a, b) {
            return ReportGrid.compare(a[x], b[x]);
        });
        return data;
    }

    function selectOption(title) {
        function filterMultivalue(column) {
            return !!column.multivalue;
        }

        function filterNumbersAndMultivalue(column) {
            return (
                   (!!column.multivalue)
                || (column.type === "number")
                || (column.subtype === "datetime")
                || (options && options.chart.x === column.field)
                || (options && options.chart.y === column.field)
            );
        }

        function feed(select, columns, current, optional, filter) {
            select.find("option").remove();
            if(optional)
                select.append('<option value="">[none]</option>')
            for(var i = 0; i < columns.length; i++) {
                var value = filter(columns[i]);
                if(value) continue;
                select.append('<option value="'+columns[i].field+'"'+(current === columns[i].field ? " selected" : "")+'>'+columns[i].name+'</option>')
            }
            if(select.find("option").length === (optional ? 1 : 0)) {
                select.closest(".pg-selection").hide();
            } else {
                select.closest(".pg-selection").show();
            }
            return select;
        }

        function resetSegmentAndChangeOption(name) {
            return function() {
                options.chart[name] = $(this).val();
                if(options.chart.segment === options.chart[name])
                    options.chart.segment = null;
                feed(noti.find(".pg-segment"), model, options.chart.segment, true, filterNumbersAndMultivalue);
                $(wrapper).trigger("optionsChanged", options);
                refresh();
            };
        }

        function changeOption(name) {
            return function() {
                options.chart[name] = $(this).val();
                $(wrapper).trigger("optionsChanged", options);
                refresh();
            };
        }

        return function() {
            if(noti) noti.remove();
            noti = notification.context(title, {
                width: "264px",
                text : tplOptionsPanel,
                target : this,
                before_open : function() {
                    if(ReportGrid.tooltip) ReportGrid.tooltip.hide();
                },
                after_open : function() {
                    var x = feed(noti.find(".pg-x"), model, options.chart.x, false, filterMultivalue).change(resetSegmentAndChangeOption("x"));
                    feed(noti.find(".pg-y"), model, options.chart.y, false, filterMultivalue).change(resetSegmentAndChangeOption("y"));
                    feed(noti.find(".pg-segment"), model, options.chart.segment, true, filterNumbersAndMultivalue).change(changeOption("segment"));
                    noti.find(".pg-sample").val(options.chart.samplesize).change(changeOption("samplesize"));
                    options.chart.x = noti.find(".pg-x").val();
                    options.chart.y = noti.find(".pg-y").val();
                    refresh();
                }
            })
        };
    }

    function clear() {
        elChart.find("*").remove().removeClass("rg");
        elChart.append('<div class="pg-message ui-content ui-state-highlight ui-corner-all"><p>Please select the chart axis using the options button above.</p></div>')
    }

    wrapper = {
        type : "chart",
        name : "Chart",
        panel : function() { return elPanel; },
        update : function(data, o) {
            if(noti) noti.remove();

            if("undefined" == typeof o.chart)
                o.chart = { samplesize : 200 };
            options = o;

            if(data) {
                currentData = data;
            } else {
                data = currentData;
            }
            if(!data || data.length <= 1) {
                model = [];
                // print out message
                elChart.html('<div class="pg-message ui-content ui-state-highlight ui-corner-all">The dataset doesn\'t contain enough values to build a chart.</div>');
                // disable options
                if(optionButton) optionButton.button("disable");
                if(builderButton) builderButton.button("disable");
                return;
            }

            // create model
            model = jsonmodel.create(data);
            // enable options
            if(optionButton) optionButton.button("enable");
            if(builderButton) builderButton.button("enable");

            refresh();
        },

        resize : function() {
            elChart.css({
                width  : elPanel.innerWidth() + "px",
                height : elPanel.innerHeight() + "px"
            });
            refresh();
        },

        activate : function() {
            if(!toolbar) {
                toolbar = $(this.toolbar);

                optionButton = ui.button(toolbar, {
                    label : "options",
                    text : true,
                    handler : selectOption("Chart Options"),
                    disabled : true
                });

                builderButton = ui.button(toolbar, {
                  label : "export to ReportGrid",
                  text : true,
                  handler : function() {
                    $(wrapper).trigger("exportToBuilder");
                  },
                  disabled : true
                });
/*
                ui.button(toolbar, {
                    label : 'powered by ReportGrid <img src="http://api.reportgrid.com/css/images/reportgrid-clear.png" title="Powered by ReportGrid" height="29" width="194">',
                    text : true,
                    handler : function() {
                        window.open("http://reportgrid.com/", "_blank");
                    }
                }).addClass("pg-rg-logo");
*/
            }
            toolbar.show();
        },
        deactivate : function() {
            if(ReportGrid.tooltip) ReportGrid.tooltip.hide();
            if(noti) noti.remove();
            clear();
            toolbar.hide();
        }
    };

    return wrapper;
});