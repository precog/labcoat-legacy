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
      "app/config/eggs"
    , "app/util/notification"
],

function(eggs, notification) {
    function normalize(content) {
        return content.toLowerCase().replace(/\W+/, ' ').replace(/\s+/gm, ' ').trim();
    }

    function cleanQuery(q) {
        if(q.split("\n").length > 1) return null;
        q = q.trim();
        if(q.substr(0, 2) === '--')
            return q.substr(2);
        if(q.substr(0, 2) === "(*" && q.substr(q.length-2) === "*)")
            return q.substr(2, q.length-4);
        return null;
    }

    for(var i = 0; i < eggs.length; i++) {
        eggs[i].normalized = normalize(eggs[i].question);
    }

    return {
        findEgg : function(content) {
            var normalized = normalize(content);
            for(var i = 0; i < eggs.length; i++) {
                if(normalized === eggs[i].normalized) {
                    return i;
                }
            }
            return -1;
        },
        isEgg : function(content) {
            return this.findEgg(content) >= 0;
        },
        displayEgg : function(index, question) {
            if(index < 0) return;
            notification.main(question, {
                text : '<div class="pg-easter">' + eggs[index].answer + '</div>',
                min_height : '100px'
            });
        },
        easterEgg : function(question) {
            var q = cleanQuery(question);
            if(null === q) return false;
            var index = this.findEgg(q);
            if(index < 0) return false;
            this.displayEgg(index, q);
            return true;
        }
    }
})