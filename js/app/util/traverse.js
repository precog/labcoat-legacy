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
    function splitPath(key) {
        return key.split(/\./g);
    }

    return {
        get : function(o, key) {
            var path = splitPath(key),
                ref = o,
                segment = path.shift();
            while(segment && ref) {
                ref = ref[segment];
                segment = path.shift();
            }
            if("undefined" === typeof ref)
                return ref;
            else
                return JSON.parse(JSON.stringify(ref)); // prevents object reference
        },
        set : function (o, key, value) {
            var path = splitPath(key),
                ref = o,
                segment = path.shift();
            while(path.length > 0) {
                if("undefined" === typeof ref[segment]) {
                    ref[segment] = {};
                }
                ref = ref[segment];
                segment = path.shift();
            }
            var svalue = JSON.stringify(value);
            if(JSON.stringify(ref[segment]) !== svalue) {
                ref[segment] = JSON.parse(svalue); // prevents object reference
                return true;
            } else {
                return false;
            }
        },
        remove : function(o, key) {
            var path = splitPath(key),
                ref = o,
                segment = path.shift(),
                next;
            while(path.length > 0) {
                next = path.shift();
                ref = ref[segment];
                if("undefined" === typeof ref)
                {
                    return;
                }
                segment = next;
            }
            delete ref[segment];
        }
    };
});