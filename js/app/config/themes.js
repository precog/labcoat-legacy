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
// solarized_light
// clouds_midnight idle_fingers monokai pastel_on_dark   kr_theme merbivore merbivore_soft mono_industrial
// solarized_dark cobalt


// clouds_midnight cobalt idle_fingers kr_theme merbivore merbivore_soft mono_industrial
// monokai solarized_dark
define([], function() {
    return [{
        token : "gray",
        name : "gray",
        ui : "gray",
        group : "light",
        editor : {
            ace : "tomorrow"
        }
    }, {
        token : "blue",
        name : "blue",
        ui : "blue",
        group : "light",
        editor : {
            ace : "idle_fingers"
        }
    }, {
        token : "dark",
        name : "dark",
        ui : "dark",
        group : "dark",
        editor : {
            ace : "solarized_dark"
        }
    }, {
        token : "black",
        name : "black",
        ui : "black",
        group : "dark",
        editor : {
            ace : "merbivore"
        }
    }];
});

//tomorrow_night_blue, tomorrow_night_bright, tomorrow_night_eighties, twilight vibrant_ink