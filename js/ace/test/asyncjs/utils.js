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
/*!
 * async.js
 * Copyright(c) 2010 Fabian Jakobs <fabian.jakobs@web.de>
 * MIT Licensed
 */

define(function(require, exports, module) {

var async = require("asyncjs/async")

async.plugin({
    delay: function(delay) {
        return this.each(function(item, next) {
            setTimeout(function() {
                next();
            }, delay)
        })
    },
    
    timeout: function(timeout) {
        timeout = timeout || 0
        var source = this.source
        
        this.next = function(callback) {
            var called            
            var id = setTimeout(function() {
                called = true
                callback("Source did not respond after " + timeout + "ms!")
            }, timeout)
            
            source.next(function(err, value) {
                if (called)
                    return

                called = true
                clearTimeout(id)
                
                callback(err, value)
            })
        }
        return new this.constructor(this)
    },
    
    get: function(key) {
        return this.map(function(value, next) {
            next(null, value[key])
        })
    },
    
    inspect: function() {
        return this.each(function(item, next) {
            console.log(JSON.stringify(item))
            next()
        })
    },
    
    print: function() {
        return this.each(function(item, next) {
            console.log(item)
            next()
        })
    }    
})

})
