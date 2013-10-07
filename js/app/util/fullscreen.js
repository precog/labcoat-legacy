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
    var isfullscreen,
        requestFullScreen,
        exitFullScreen;
    if(document.documentElement.requestFullscreen) {
        requestFullScreen = function(el) { el.requestFullscreen(); };
    } else if(document.documentElement.mozRequestFullScreen) {
        requestFullScreen = function(el) { el.mozRequestFullScreen(); };
    } else if (document.documentElement.webkitRequestFullScreen) {
        requestFullScreen = function(el) {
            el.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            if (!document.webkitCurrentFullScreenElement) {
                el.webkitRequestFullScreen();
            }
        };
    } else {
        setTimeout(function() { $('.pg-precog-labcoat .pg-fullscreen').hide(); }, 20);
        requestFullScreen = function() { console.log("your browser doesn't support the FullScreen option"); };
    }
    if(document.exitFullscreen) {
        exitFullScreen = function() { document.exitFullscreen(); };
    } else if(document.mozCancelFullScreen) {
        exitFullScreen = function() { document.mozCancelFullScreen(); };
    } else if (document.webkitCancelFullScreen) {
        exitFullScreen = function(el) {
            el.webkitRequestFullScreen(); // chrome doesn't behave correctly when the app is started fullscreen
            document.webkitCancelFullScreen();
        };
    } else {
        exitFullScreen = function() { console.log("your browser doesn't support the FullScreen option"); };
    }
    function toggle() {
        isfullscreen = (!window.screenTop && !window.screenY);
        $('.pg-precog-labcoat .pg-fullscreen span.k-link').text(isfullscreen ? "reduce" : "fullscreen");
    }
    if(document.addEventListener) {
        document.addEventListener("fullscreenchange", toggle, false);
        document.addEventListener("mozfullscreenchange", toggle, false);
        document.addEventListener("webkitfullscreenchange", toggle, false);
    }
    toggle();
    return {
        toggle : function(n) {
            n = n || document.documentElement;
            if(isfullscreen) {
                exitFullScreen(n);
            } else {
                requestFullScreen(n);
            }
        },
        isFullScreen : function() { return isfullscreen; }
    };
});