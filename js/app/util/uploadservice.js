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
	var UPLOAD_SERVICE = "upload.php";
	
/*
progressHandlingFunction
beforeSendHandler
completeHandler
errorHandler
formData
*/
	function upload(path, file, type, complete, progress, error) {
		var reader = new FileReader();
		reader.onload = function(e) {
			console.log("file has been readed", e.target.result);
		};
		reader.readAsText(file);
		/*
		$.ajax({
			url: UPLOAD_SERVICE,  //server script to process data
			type: 'POST',
			xhr: function() {  // custom xhr
				var myXhr = $.ajaxSettings.xhr();
				if(myXhr.upload){ // check if upload property exists
					myXhr.upload.addEventListener('progress',progressHandlingFunction, false); // for handling the progress of the upload
				}
				return myXhr;
			},
			//Ajax events
			beforeSend: beforeSendHandler,
			success: completeHandler,
			error: errorHandler,
			// Form data
			data: formData,
			headers : {
//                          "Content-Type"     : "multipart/form-data"
				  "X-File-Name"      : filename
				, "X-File-Size"      : file.fileSize || file.size
				, "X-File-Type"      : file.type
				, "X-Precog-Path"    : path
				, "X-Precog-UUID"    : id
				, "X-Precog-Apikey"  : precog.config.apiKey
				, "X-Precog-Version" : precog.config.version
				, "X-Precog-Service" : precog.config.analyticsService
			},
			//Options to tell JQuery not to process data or worry about content-type
			cache: false,
			contentType: false,
			processData: false
		});
		*/
	}
	
	return {
		ingest : function(path, data, type, complete, progress, error) {
			upload(path, file, type, complete, progress, error);
		}
	}
});
