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
/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2010, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

define(function(require, exports, module) {
"use strict";

var event = require("../lib/event");

var DragdropHandler = function(mouseHandler) {
    var editor = mouseHandler.editor;
    var dragSelectionMarker, x, y;
    var timerId, range;
    var dragCursor, counter = 0;

    var mouseTarget = editor.container;
    event.addListener(mouseTarget, "dragenter", function(e) {
        if (editor.getReadOnly())
            return;
        var types = e.dataTransfer.types;
        if (types && Array.prototype.indexOf.call(types, "text/plain") === -1)
            return;
        if (!dragSelectionMarker)
            addDragMarker();
        counter++;
        return event.preventDefault(e);
    });

    event.addListener(mouseTarget, "dragover", function(e) {
        if (editor.getReadOnly())
            return;
        var types = e.dataTransfer.types;
        if (types && Array.prototype.indexOf.call(types, "text/plain") === -1)
            return;
        if (onMouseMoveTimer !== null)
            onMouseMoveTimer = null;
        x = e.clientX;
        y = e.clientY;
        return event.preventDefault(e);
    });

    var onDragInterval =  function() {
        dragCursor = editor.renderer.screenToTextCoordinates(x, y);
        editor.moveCursorToPosition(dragCursor);
        editor.renderer.scrollCursorIntoView();
    };

    event.addListener(mouseTarget, "dragleave", function(e) {
        counter--;
        if (counter <= 0 && dragSelectionMarker) {
            clearDragMarker();
            return event.preventDefault(e);
        }
    });

    event.addListener(mouseTarget, "drop", function(e) {
        if (!dragSelectionMarker)
            return;
        range.end = editor.session.insert(dragCursor, e.dataTransfer.getData('Text'));
        range.start = dragCursor;
        clearDragMarker();
        editor.focus();
        return event.preventDefault(e);
    });

    function addDragMarker() {
        range = editor.selection.toOrientedRange();
        dragSelectionMarker = editor.session.addMarker(range, "ace_selection", editor.getSelectionStyle());
        editor.clearSelection();
        clearInterval(timerId);
        timerId = setInterval(onDragInterval, 20);
        counter = 0;
        event.addListener(document, "mousemove", onMouseMove);
    }
    function clearDragMarker() {
        clearInterval(timerId);
        editor.session.removeMarker(dragSelectionMarker);
        dragSelectionMarker = null;
        editor.selection.fromOrientedRange(range);
        counter = 0;
        event.removeListener(document, "mousemove", onMouseMove);
    }
    // sometimes other code on the page can stop dragleave event leaving editor stuck in the drag state
    var onMouseMoveTimer = null;
    function onMouseMove() {
        if (onMouseMoveTimer == null) {
            onMouseMoveTimer = setTimeout(function() {
                if (onMouseMoveTimer != null && dragSelectionMarker)
                    clearDragMarker();
            }, 20);
        }
    }
};

exports.DragdropHandler = DragdropHandler;
});
