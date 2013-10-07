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
       arrayDiff : function(a1, a2) {
           return a1.filter(function(i) {return !(a2.indexOf(i) > -1);});
       },
       guid : function() {
           var S4 = function() {
               return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
           };
           return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
       },
       sortNodes: function(els, comparator) {
           var arr = $(els).map(function() { return this; });
           arr.sort(comparator);
           var parent = arr[0] && arr[0].parentNode;
           $(arr).each(function(i) {
               parent.appendChild(arr[i]);
           });
       },
       truncate : function(value, maxlen, ellipsis) {
           maxlen = maxlen || 25;
           ellipsis = ellipsis || "...";
           if(value.length >= maxlen)
               value = value.substr(0, maxlen-ellipsis.length)+ellipsis;
           return value;
       },
       normalizeQueryName : function (value) {
           value = value.trim().toLowerCase();
           if(value.substr(0, 1) === "/")
           value = value.substr(1);
           value.replace(/[ \-.]+/g, "_");
           return value;
       },
       arrayRemove : function(arr, el) {
           var index = arr.indexOf(el);
           if(index < 0) return arr;
           arr.splice(index, 1);
           return arr;
       },
       // return null if it is valid, an error message if it is not
       validateQueryName : function(query, path, queries) {
           if(query.match(/^[a-z0-9][a-z0-9 ]*[a-z0-9]$/i)) {
               if(queries.queryExist(path))
                   return "a query with this identifier already exists";
               else
                   return null;
           } else
               return "the name can only include alpha-numeric characters, white spaces (but not in the beginning and at the end) and must be at least 2 characters long.";
       }
   }
});