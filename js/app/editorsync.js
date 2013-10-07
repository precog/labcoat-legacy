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

    return function(editor, editors, config) {
        function change(_, code) {
            editors.setCode("" + code);
        }

        function monitor(_, code) {
            editor.set("" + code);
        }

        $(editors).on("deactivated", function(_, index) {
            editors.monitor.unbind(editors.getKey(index)+".code", monitor);
            $(editor).off("change", change);
            editors.setCode(editor.get(), index);
        });

        $(editors).on("activated", function(_, index) {
            editor.set("" + editors.getCode(index));
            $(editor).on("change", change);
            editor.focus();

            editors.monitor.bind(editors.getKey(index)+".code", monitor);
        });
    }
});