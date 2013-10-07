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
      "app/util/ui"
    , "rtext!templates/toolbar.main.html"
    , "app/util/fullscreen"
    , "app/theme"
    , "app/util/dialog-confirm"
    , "rtext!templates/dialog.global.settings.html"
    , "app/util/valuemodel"
    , "app/util/objectmodel"
    , "app/util/precog"
    , "app/util/config"
], function(ui, tplToolbar, fullscreen, theme, openDialog, tplGlobalSettings, valueModel, objectModel, precog, config) {
    var ABOUT_LINK  = "http://precog.com/products/labcoat",
        BRAND_LINK  = "http://precog.com/products/labcoat",
        BRAND_CLASS = "pg-precog";

    return function(el) {
      var wrapper = {
        hideWizard : function() {
          wizardBtn.hide();
        }
      };
    switch(document.location.host)
    {
//        case "localhost":
        case "labcoat.gridgain.com":
            BRAND_LINK  = "http://www.gridgain.com/";
            BRAND_CLASS = "pg-gridgain";
            break;
    }

    function updateBrand(anchor) {
        anchor.attr("href", BRAND_LINK);
        anchor.find(".pg-logo").addClass(BRAND_CLASS);
    }

    function extractFromConfig() {
      return precog.config[this.name];
    }

    function intValidator(min, max) {
      return function(value) {
        value = trimFilter(value);
        if(""+parseInt(value) !== ""+value)
          return "must be an integer value";
        value = parseInt(value);
        if(min && value < min)
          return "must be greater than " + min;
        if(max && value > max)
          return "must be less than " + max;
        return null;
      }
    }

    function trimFilter(value) {
      return (""+value).trim();
    }

    function onlyTrailingSlash(value) {
      value = trimFilter(value);
      var ext = value.split(".").pop().toLowerCase();
      if(value.substr(-1) !== "/" && ext !== "htm" && ext !== "html")
      {
        value += "/";
      }
      if(value.length === 1)
        return value;
      while(value.substr(0, 1) === "/")
        value = value.substr(1);
      return value;
    }

    function ensureSlashes(value) {
      value = trimFilter(value);
      if(value.substr(0, 1) !== "/")
        value = "/" + value;
      if(value.length === 1)
        return value;
      if(value.substr(-1) !== "/")
        value += "/";
      return value;
    }

    function toUpper(value) {
      return trimFilter(value).toUpperCase();
    }

  function urlValidator(value) {
    if (!!value.match(/^((\/?[a-z0-9_\-.]+)+)\/?$/i)) {
      return null;
    } else {
      return "invalid url";
    }
  }

  function uriValidator(value) {
    if (!!value.match(/^((\/?[a-z0-9_\-.:]+)+)\/?$/i)) {
      return null;
    } else {
      return "invalid url";
    }
  }

    // add global settings
    var message = $(tplGlobalSettings),
        qsSettings = [{
            name      : "analyticsService",
            extract   : function() {
              var url = extractFromConfig.call(this);
              url = url.split("://").pop();
              return onlyTrailingSlash(url);
            },
            filter    : onlyTrailingSlash,
            validator : urlValidator
          }, {
            name      : "apiKey",
            extract   : extractFromConfig,
            filter    : toUpper,
            validator : function (value) {
                if (!!value.match(/^([A-F0-9]{8})(-[A-F0-9]{4}){3}-([A-F0-9]{12})$/)) {
                  return null;
                } else {
                  return "invalid token pattern";
                }
              }
          }, {
            name         : "basePath",
            extract      : extractFromConfig,
            defaultValue : "/",
            filter       : ensureSlashes,
            validator : function (value) {
              if (!!value.match(/^(\/?([a-z0-9_\-]+)(\/[a-z0-9_\-]+)*\/?)$/i)) {
                return null;
              } else {
                return "invalid path pattern";
              }
            }
          }, {
            name      : "labcoatHost",
            extract   : function() { return window.location.hostname + window.location.pathname; },
            filter    : onlyTrailingSlash,
            validator : uriValidator
          }],
        userSettings = [{
            name      : "limit",
            extract   : extractFromConfig,
            validator : intValidator(1, null),
            filter    : trimFilter
          }, {
            name      : "theme",
            extract   : function() { return theme.current || extractFromConfig.call(this); },
            validator : function(value) {
              return theme.list().map(function(el) { return el.token; }).indexOf(value) >= 0 ? null : "invalid theme";
            },
            callback : function(value) {
              theme.set(value);
            }
         }];

    var qsModel = objectModel(),
        userModel = objectModel(),
        output = message.find(".labcoatUrl");

    var $theme = message.find("#theme");
    $.each(theme.groups(), function(group) {
      var optgroup = $('<optgroup label="'+group+' themes"></optgroup>').appendTo($theme);
      $.each(this, function() {
        optgroup.append($('<option value="'+this.token+'">'+this.name+'</option>'));
      })
    });

    function changeUrlSuccess() {
      var url = buildUrlSuccess();
      output.attr("href", url);
      output.text(url);
      message.find(".output").show();
    }

    function buildUrlSuccess() {
      var labcoat = "https://" + qsModel.get("labcoatHost");
      var params = [], t;

      params.push("apiKey=" + encodeURIComponent(qsModel.get("apiKey")));

      t = "https://" + qsModel.get("analyticsService");
      if(t !== labcoat)
        params.push("analyticsService=" + encodeURIComponent(t));
      t = qsModel.get("basePath");
      if(t != "/")
        params.push("basePath=" + encodeURIComponent(t));
      return labcoat + "?" + params.join("&");
    }

    function changeUrlError() {
      message.find(".output").hide();
      output.attr("href", "#");
      output.text("");
    }

    function wireValueModel(objectModel) {
      return function(index, info) {
        var model = valueModel(info.extract() || info.defaultValue, info.validator, info.filter);
        objectModel.addField(info.name, model);
        var input = message.find("#"+info.name);
        input.val(model.get());
        input.on("change", function() {
          model.set(input.val());
        });
        model.on("validation.error", function(error, newvalue) {
          input.parent().find(".input-error").html(error).show();
        });
        model.on("value.change", function(newvalue, oldvalue) {
          input.val(newvalue);
          input.parent().find(".input-error").hide();
          if(info.callback) {
            info.callback(newvalue);
          }
        });
      }
    }

    $(qsSettings).each(wireValueModel(qsModel));
    qsModel.on("validation.error", changeUrlError);
    qsModel.on("validation.success", changeUrlSuccess);

    $(userSettings).each(wireValueModel(userModel));

    if(qsModel.isValid())
      changeUrlSuccess();
    else
      changeUrlError();

//    return function(el) {

        el.append(tplToolbar);
        var right = el.find(".pg-toolbar-context");

        updateBrand(el.find("a.pg-brand"));

        var email = precog.config.email;
      // TODO add logout here
        if(email) {
          right.append('<span class="user">'+email+' (<a href="#" class="logout">logout</a>)</span>');
          right.find("a.logout").click(function(e) {
            e.preventDefault();
            window.location.reload(false);
            return false;
          });
        }

        var wizardBtn = ui.button(right, {
          icon : "ui-icon-star",
          description : "Getting Started Tutorial"
        }).click(function() {
          $(wrapper).trigger("startWizard");
        });

        ui.button(right, {
            icon : "ui-icon-info",
            description : "about Labcoat"
        }).click(function() {
            window.open(ABOUT_LINK);
        });

        ui.button(right, {
            icon : "ui-icon-gear",
            description : "application settings"
        }).click(function() {
            var currentTheme = theme.current,
                title   = "Application Settings",
                handler = function() {
                  if(!userModel.getField("limit").isDefault()) {
                    var value = parseInt(userModel.get("limit"));
                    config.set("queryLimit", value, true);
                    $(config).trigger("queryLimit", value);
                  }
                  if(qsModel.isValid() && qsModel.hasChanged()) {
                    window.location = buildUrlSuccess();
                  }
                },
                options = {
                    width  : 500
                  , height : 440
                  , cancel : function() {
                    if(theme.current !== currentTheme) {
                      theme.set(currentTheme);
                    }
                  }
                };
            userModel.getField("theme").setDefault(theme.current);
            userModel.getField("limit").setDefault(config.get("queryLimit"));
            openDialog(title, message, handler, options);
          });

        ui.button(right, {
            icon : fullscreen.isFullScreen() ? "ui-icon-newwin" : "ui-icon-arrow-4-diag",
            description : "toggle fullscreen",
            handler : function() {
                fullscreen.toggle();
                if(fullscreen.isFullScreen()) {
                    $(this).find('.pg-icon').removeClass("ui-icon-newwin").addClass("ui-icon-arrow-4-diag");
                } else {
                    $(this).find('.pg-icon').removeClass("ui-icon-arrow-4-diag").addClass("ui-icon-newwin");
                }
            }
        });
        return wrapper;
      };
});