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
define(["jquery"],
function($) {
  $.iframeSubmit = function(method) {
    var uid = "ifr_"+Math.floor(Math.random() * 214783647),
      settings = {
        action : "",
        method : "post",
        window : window,
        data   : {},
        complete : function() {},
        remove_after : 10000
      },
      methods = {
        init : function(options) {
          settings = $.extend(settings, options);
          var $iframe = $('<iframe name="'+uid+'" style="display:none"></iframe>').appendTo("body"),
              $form   = $('<form action="'+settings.action+'" method="'+settings.method.toUpperCase()+'" target="'+uid+'" style="display:none"></form>').appendTo("body");
          for(var key in settings.data) {
            if(!settings.data.hasOwnProperty(key)) continue;
            $('<input type="hidden" name="'+key+'" value="'+settings.data[key]+'">').appendTo($form);
          }
          $iframe.on("load", function() {
            $form.remove();
            setTimeout(function() {
              $iframe.remove();
            }, settings.remove_after);
            settings.complete();
          });
          $form.submit();
          return this;
        }
      };

    if ( methods[method] ) {
      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.iframeSubmit' );
    }
  };

  return $.iframeSubmit;
});