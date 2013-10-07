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
/* File: jstree.sort.js 
Sorts items alphabetically (or using any other function)
*/
/* Group: jstree sort plugin */
(function ($) {
	$.jstree.plugin("sort", {
		__construct : function () {
			this.get_container()
				.bind("load_node.jstree", $.proxy(function (e, data) {
						var obj = this.get_node(data.rslt.obj);
						obj = obj === -1 ? this.get_container_ul() : obj.children("ul");
						this._sort(obj, true);
					}, this))
				.bind("rename_node.jstree create_node.jstree", $.proxy(function (e, data) {
						this._sort(data.rslt.obj.parent(), false);
					}, this))
				.bind("move_node.jstree copy_node.jstree", $.proxy(function (e, data) {
						var m = data.rslt.parent === -1 ? this.get_container_ul() : data.rslt.parent.children('ul');
						this._sort(m, false);
					}, this));
		},
		defaults : function (a, b) { return this.get_text(a, true) > this.get_text(b, true) ? 1 : -1; },
		_fn : { 
			_sort : function (obj, deep) {
				var s = this.get_settings(true).sort,
					t = this;
				obj.append($.makeArray(obj.children("li")).sort($.proxy(s, t)));
				obj.children('li').each(function () { t.correct_node(this, false); });
				if(deep) {
					obj.find("> li > ul").each(function() { t._sort($(this)); });
					t.correct_node(obj.children('li'), true);
				}
			}
		}
	});
	// include the sort plugin by default
	$.jstree.defaults.plugins.push("sort");
})(jQuery);