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
    var params = {};

    function getCtx(ctx) {
        if(!ctx) {
            ctx = window.location.search.substr(1);
        } else if(ctx.substr(0, "http://".length) === "http://" || ctx.substr(0, "https://".length) === "https://") {
            var arr = ctx.split("?");
            arr.shift();
            ctx = arr.join("?");
        } else if(ctx.substr(0, 1) === "?") {
            ctx = ctx.substr(1);
        }
        ctx = ctx.split("#");
        return ctx[0];
    }

    function getParameterByName(name, ctx)
    {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "(?:^|&)" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(ctx);
        if(results == null)
            return "";
        else
            return decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    function getAll(ctx) {
        var values = {},
            e,
            a = /\+/g,  // Regex for replacing addition symbol with a space
            r = /([^&=]+)=?([^&]*)/g,
            d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
            q = ctx;

        while (e = r.exec(q))
            values[d(e[1])] = d(e[2]);

        return values;
    }

    return {
        get : function(name, ctx) {
            ctx = getCtx(ctx);
            return getParameterByName(name, ctx);
        },

        all : function(ctx) {
            ctx = getCtx(ctx);
            if(!params[ctx])
            {
                params[ctx] = getAll(ctx);
            }

            return params[ctx];
        }
    }
});