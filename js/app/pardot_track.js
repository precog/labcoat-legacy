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
  // TODO needs cookie for email
    "app/util/iframesubmit"
  , "app/util/dialog-support"
  , "libs/jquery/jquery.cookie/jquery.cookie"
],

function(submit, displaySupport) {
  var PAGE_ACTION = "https://labcoat.precog.com/actions/",
      FORM_ACTION = "http://www2.precog.com/l/",
      wrapper,
      queue = [],
      email = $.cookie("Precog_eMail"),
      action_map = {
        "quirrel_failure_default" : "17892/2013-01-14/29k3q",
        "quirrel_failure_custom"  : "17892/2013-01-14/29k52",
        "generic_error"           : "17892/2013-01-14/29k5d"
      };

  var onprecog = Precog.$.Config.analyticsService.indexOf(".precog.com") >= 0;

  if(onprecog) {
    wrapper = {
      track_page : function(action) {
        submit({
          action : PAGE_ACTION + (action_map[action] || action),
          method : "get",
          complete : function() {
//          console.log("Page Action Done: " + PAGE_ACTION + action);
          }
        });
      }
    }
  } else {
    wrapper = {
      track_page : function(action) { }
    }
  }
  wrapper.track_error = function(action, params, user_message) {
    params = params || {};
    if(!email) {
      displaySupport("report error", user_message, null, params.error_message, false, function(e, r) {
        email = e;
        $.cookie("Precog_eMail", email);
        params.error_message = r;
        wrapper.track_error(action, params, user_message);
      });
      return false;
    } else {
      params.email = email;
      submit({
        action : FORM_ACTION + (action_map[action] || action),
        method : "post",
        data : params,
        complete : function() {
//            console.log("Form Submit: " + action);
        }
      });
      return true;
    }
  };

  wrapper.submit_form = function(url, params, callback) {
    submit({
      action : url,
      method : "get",
      data : params,
      complete : function() {
        if(callback) callback();
      }
    });
  };

  return wrapper;
});
