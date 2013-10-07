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
/* File: jstree.unique.js 
Does not allow the same name amongst siblings (still a bit experimental).
*/
/* Group: jstree drag'n'drop plugin */
(function ($) {
	$.jstree.plugin("unique", {
		// TODO: think about an option to work with HTML or not?
		_fn : { 
			check : function (chk, obj, par, pos) {
				if(!this.__call_old()) { return false; }

				par = par === -1 ? this.get_container() : par;
				var n = chk === "rename_node" ? $('<div />').html(pos).text() : this.get_text(obj, true), 
					c = [],
					t = this;
				par.children('ul').children('li').each(function () { c.push(t.get_text(this, true)); });
				switch(chk) {
					case "delete_node":
						return true;
					case "rename_node":
					case "copy_node":
						return ($.inArray(n, c) === -1);
					case "move_node":
						return (par.children('ul').children('li').index(obj) !== -1 || $.inArray(n, c) === -1);
				}
				return true;
			}
		}
	});
	// include the unique plugin by default
	$.jstree.defaults.plugins.push("unique");
})(jQuery);
//*/