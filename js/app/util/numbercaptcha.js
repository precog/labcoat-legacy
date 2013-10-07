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
  function rand(min, max) {
    return min + Math.floor(Math.random() * (1 + max - min));
  };
  return function(max) {
    var imax   = Math.round(max),
        operator   = ["+", "-", "/", "*"][rand(0, 3)],
        second = rand(1, imax),
        first,
        result;
    switch(operator) {
      case "+":
        first  = rand(1, imax);
        result = first + second;
        break;
      case "-":
        first  = rand(1, imax);
        if(first < second) {
          var t = first;
          first = second;
          second = t;
        }
        result = first - second;
        break;
      case "*":
        first  = rand(2, 10);
        result = first * second;
        if(rand(0,1)) {
          var t = first;
          first = second;
          second = t;
        }
        break;
      case "/":
        first  = second * rand(2, 10);
        result = first / second;
        break;
    }
    return {
      first       : first,
      second      : second,
      operator    : operator,
      result      : result,
      description : first + " " + operator + " " + second
    }
  }
});