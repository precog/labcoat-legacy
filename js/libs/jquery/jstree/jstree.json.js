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
/* File: jstree.json.js 
This plugin makes it possible for jstree to use JSON data sources.
*/
/* Group: jstree json plugin */
(function ($) {
	$.jstree.plugin("json", {
		__construct : function () {
			this.get_container()
				.bind("__after_close.jstree", $.proxy(function (e, data) {
						var t = $(data.rslt.obj);
						if(this.get_settings(true).json.progressive_unload) {
							t.data('jstree').children = this.get_json(t)[0].children;
							t.children("ul").remove();
						}
					}, this));
		},
		defaults : {
			data	: false,
			ajax	: false, 
			progressive_render : false, // get_json, data on each node
			progressive_unload : false
		},
		_fn : { 
			parse_json : function (node) {
				var s = this.get_settings(true).json;
				if($.isArray(node.children)) {
					if(s.progressive_render) {
						if(!node.data) { node.data = {}; }
						if(!node.data.jstree) { node.data.jstree = {}; }
						node.data.jstree.children = node.children;
						node.children = true;
					}
				}
				return this.__call_old(true, node);
			},
			_append_json_data : function (dom, data) {
				dom = this.get_node(dom);
				if(dom === -1) { dom = this.get_container(); }
				data = this.parse_json(data);
				if(!data || !dom.length) { return false; }
				if(!dom.children('ul').length) { dom.append('<ul />'); }
				dom.children('ul').empty().append(data.children('li'));
				return true;
			},
			_load_node : function (obj, callback) {
				var d = false,
					s = this.get_settings().json;
				obj = this.get_node(obj);
				if(!obj) { return false; }

				switch(!0) {
					// root node with data
					case (obj === -1 && this.get_container().data('jstree') && $.isArray(this.get_container().data('jstree').children)):
						d = this.get_container().data('jstree').children;
						this.get_container().data('jstree').children = null;
						return callback.call(this, this._append_json_data(obj, d));
					// normal node with data
					case (obj !== -1 && obj.length && obj.data('jstree') && $.isArray(obj.data('jstree').children)):
						d = obj.data('jstree').children;
						obj.data('jstree').children = null;
						return callback.call(this, this._append_json_data(obj, d));
					// no settings
					case (!s.data && !s.ajax): 
						throw "Neither data nor ajax settings supplied.";
					// data is function
					case ($.isFunction(s.data)):
						return s.data.call(this, obj, $.proxy(function (d) {
							return callback.call(this, this._append_json_data(obj, d));
						}, this));
					// data is set, ajax is not set, or both are set, but we are dealing with root node
					case ((!!s.data && !s.ajax) || (!!s.data && !!s.ajax && obj === -1)):
						return callback.call(this, this._append_json_data(obj, s.data));
					// data is not set, ajax is set, or both are set, but we are dealing with a normal node
					case ((!s.data && !!s.ajax) || (!!s.data && !!s.ajax && obj !== -1)):
						s.ajax.success = $.proxy(function (d, t, x) { 
							var s = this.get_settings().json.ajax;
							if($.isFunction(s.success)) {
								d = s.success.call(this, d, t, x) || d;
							}
							callback.call(this, this._append_json_data(obj, d));
						}, this);
						s.ajax.error = $.proxy(function (x, t, e) { 
							var s = this.get_settings().json.ajax;
							if($.isFunction(s.error)) {
								s.error.call(this, x, t, e);
							}
							callback.call(this, false);
						}, this);
						if(!s.ajax.dataType) { s.ajax.dataType = "json"; }
						if($.isFunction(s.ajax.url))	{ s.ajax.url	= s.ajax.url.call(this, obj); }
						if($.isFunction(s.ajax.data))	{ s.ajax.data	= s.ajax.data.call(this, obj); }
						return $.ajax(s.ajax);
				}
			}
		}
	});
	// include the json plugin by default
	// $.jstree.defaults.plugins.push("json");
})(jQuery);