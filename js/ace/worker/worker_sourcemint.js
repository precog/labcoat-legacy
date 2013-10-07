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

define(function(require, exports, module) {

    "no use strict";

    exports.main = function()
    {
        var console = {
            log: function(msg) {
                postMessage({type: "log", data: msg});
            }
        };

        // NOTE: This sets the global `window` object used by workers.
        // TODO: Pass into worker what it needs and don't set global here.
        window = {
            console: console
        };

        function initSender() {

            var EventEmitter = require("ace/lib/event_emitter").EventEmitter;
            var oop = require("ace/lib/oop");
            
            var Sender = function() {};
            
            (function() {
                
                oop.implement(this, EventEmitter);
                        
                this.callback = function(data, callbackId) {
                    postMessage({
                        type: "call",
                        id: callbackId,
                        data: data
                    });
                };
            
                this.emit = function(name, data) {
                    postMessage({
                        type: "event",
                        name: name,
                        data: data
                    });
                };
                
            }).call(Sender.prototype);
            
            return new Sender();
        }

        var main;
        var sender;

        onmessage = function(e) {
            var msg = e.data;
            if (msg.command) {
                main[msg.command].apply(main, msg.args);
            }
            else if (msg.init) {        
                require("ace/lib/fixoldbrowsers");
                sender = initSender();
                require.async(msg.module, function(WORKER) {
                    var clazz = WORKER[msg.classname];
                    main = new clazz(sender);
                });
            } 
            else if (msg.event && sender) {
                sender._emit(msg.event, msg.data);
            }
        };
    }
});
