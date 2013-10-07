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
/* File: jstree.html.js 
This plugin makes it possible for jstree to use HTML data sources (other than the container's initial HTML).
*/
/* Group: jstree html plugin */
(function ($) {
	$.jstree.plugin("html", {
		defaults : {
			data	: false,
			ajax	: false
		},
		_fn : { 
			_append_html_data : function (dom, data) {
				data = $(data);
				if(!data || !data.length || !data.is('ul, li')) { return false; }
				dom = this.get_node(dom);
				if(dom === -1) { dom = this.get_container(); }
				if(!dom.length) { return false; }
				if(!dom.children('ul').length) { dom.append('<ul />'); }
				dom.children('ul').empty().append(data.is('ul') ? data.children('li') : data);
				return true;
			},
			_load_node : function (obj, callback) {
				var d = false,
					s = this.get_settings().html;
				obj = this.get_node(obj);
				if(!obj) { return false; }

				switch(!0) {
					// no settings - user original html
					case (!s.data && !s.ajax): 
						if(obj === -1) {
							this._append_html_data(-1, this.data.core.original_container_html.clone(true));
						}
						return callback.call(this, true);
					// data is function
					case ($.isFunction(s.data)):
						return s.data.call(this, obj, $.proxy(function (d) {
							return callback.call(this, this._append_html_data(obj, d));
						}, this));
					// data is set, ajax is not set, or both are set, but we are dealing with root node
					case ((!!s.data && !s.ajax) || (!!s.data && !!s.ajax && obj === -1)):
						return callback.call(this, this._append_html_data(obj, s.data));
					// data is not set, ajax is set, or both are set, but we are dealing with a normal node
					case ((!s.data && !!s.ajax) || (!!s.data && !!s.ajax && obj !== -1)):
						s.ajax.success = $.proxy(function (d, t, x) { 
							var s = this.get_settings().html.ajax;
							if($.isFunction(s.success)) {
								d = s.success.call(this, d, t, x) || d;
							}
							callback.call(this, this._append_html_data(obj, d));
						}, this);
						s.ajax.error = $.proxy(function (x, t, e) { 
							var s = this.get_settings().html.ajax;
							if($.isFunction(s.error)) {
								s.error.call(this, x, t, e);
							}
							callback.call(this, false);
						}, this);
						if(!s.ajax.dataType) { s.ajax.dataType = "html"; }
						if($.isFunction(s.ajax.url))	{ s.ajax.url	= s.ajax.url.call(this, obj); }
						if($.isFunction(s.ajax.data))	{ s.ajax.data	= s.ajax.data.call(this, obj); }
						return $.ajax(s.ajax);
				}
			}
		}
	});
	// include the html plugin by default
	$.jstree.defaults.plugins.push("html");
})(jQuery);