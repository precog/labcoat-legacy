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
    return {
        jsonToCsv : function(json) {
            if(!json) return "";
            var rows = [],
                o = json[0],
                values, key, keys = [],
                requote = /[",\n\r]/g,
                ren = /\n/g,
                rer = /\r/g,
                req = /"/g,
                i;

            function escape(s) {
                return s
                    .replace(ren, "\\n")
                    .replace(rer, "\\r")
                    .replace(req, '""')
                    ;
            }

            function value(v) {
                if("string" == typeof v) {
                    if(v.match(requote)) {
                        return '"' + escape(v) + '"';
                    } else {
                        return v;
                    }
                } else if(v instanceof Array || v instanceof Object) {
                    return value(JSON.stringify(v));
                } else {
                    return "" + v;
                }
            }

            values = [];
            if(o instanceof Object) {
                for(key in o) {
                    if(o.hasOwnProperty(key)) {
                        keys.push(key);
                        values.push(value(key));
                    }
                }
                rows.push(values.join(","));
                for(i = 0; i<json.length; i++) {
                    values = [];
                    o = json[i];
                    for(var j = 0; j < keys.length; j++) {
                        values.push(value(o[keys[j]]));
                    }
                    rows.push(values.join(","));
                }
            } else {
                rows.push(value("value"));
                for(i = 0; i<json.length; i++) {
                    rows.push(value(json[i]));
                }
            }

            return rows.join("\n");
        },

        minifyQuirrel : function(code) {
            var stringcontexts = [{
                        open : '"',  close : '"',  escape : '\\', start : -1, end : -1, handler : function(s) { return '"' + s + '"'; }
                    }],
                allcontexts = stringcontexts.concat([{
                        open : '--', close : '\n', escape : false, start : -1, end : -1, handler : function(s) { return ' '; }
                    }, {
                        open : '(-', close : '-)', escape : false, start : -1, end : -1, handler : function(s) { return ' '; }
                    }]),
                defaultHandler = function(s) {
                    return s.replace(/(\s+)/g, ' ');
                };

            function findEnd(s, ctx, pos) {
                if(ctx.escape) {
                    var elen = ctx.escape.length, npos;
                    while(true) {
                        npos = s.indexOf(ctx.close, pos);
                        if(npos < 0) return npos;
                        pos = npos + ctx.close.length;
                        if(s.substr(npos - elen, elen) === ctx.escape) {
                            continue;
                        } else {
                            break;
                        }
                    }
                    return npos;
                } else {
                    return s.indexOf(ctx.close, pos);
                }
            }

            function selectContext(contexts, s, pos) {
                var minpos = s.length, npos, ctx;
                for(var i = 0; i < contexts.length; i++) {
                    npos = s.indexOf(contexts[i].open, pos);
                    if(npos >= 0 && npos < minpos) {
                        ctx = contexts[i];
                        ctx.start = minpos = npos;
                    }
                }
                if(!ctx) return null;
                ctx.end = findEnd(s, ctx, ctx.start + ctx.open.length);
                return ctx;
            }

            function process(contexts, s) {
                var result = "", ctx, pos = 0;

                var guard = 20;
                do {
                    ctx = selectContext(contexts, s, pos);
                    if(!ctx) break;
                    if(ctx.start > pos) {
                        result += defaultHandler(s.substr(pos, ctx.start - pos));
                    }
                    if(ctx.end >= 0) {
                        result += ctx.handler(s.substr(ctx.start + ctx.open.length, ctx.end - (ctx.start + ctx.open.length)));
                        pos = ctx.end + ctx.close.length;
                    } else {
                        pos = -1;
                    }

                    guard--;
                    if(guard < 0) {
                        console.log("GUARD REACHED", s);
                        break;
                    }
                } while(ctx && pos < s.length && pos >= 0);
                if(ctx) {
                    result += ctx.handler(s.substr(ctx.start + ctx.open.length));
                } else {
                    result += defaultHandler(s.substr(pos));
                }
                return result.trim();
            }

            return process(stringcontexts, process(allcontexts, code));
        }
    }
});