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
/* Icelandic initialisation for the jQuery UI date picker plugin. */
/* Written by Haukur H. Thorsson (haukur@eskill.is). */
jQuery(function($){
	$.datepicker.regional['is'] = {
		closeText: 'Loka',
		prevText: '&#x3C; Fyrri',
		nextText: 'N&#xE6;sti &#x3E;',
		currentText: '&#xCD; dag',
		monthNames: ['Jan&#xFA;ar','Febr&#xFA;ar','Mars','Apr&#xED;l','Ma&iacute','J&#xFA;n&#xED;',
		'J&#xFA;l&#xED;','&#xC1;g&#xFA;st','September','Okt&#xF3;ber','N&#xF3;vember','Desember'],
		monthNamesShort: ['Jan','Feb','Mar','Apr','Ma&#xED;','J&#xFA;n',
		'J&#xFA;l','&#xC1;g&#xFA;','Sep','Okt','N&#xF3;v','Des'],
		dayNames: ['Sunnudagur','M&#xE1;nudagur','&#xDE;ri&#xF0;judagur','Mi&#xF0;vikudagur','Fimmtudagur','F&#xF6;studagur','Laugardagur'],
		dayNamesShort: ['Sun','M&#xE1;n','&#xDE;ri','Mi&#xF0;','Fim','F&#xF6;s','Lau'],
		dayNamesMin: ['Su','M&#xE1;','&#xDE;r','Mi','Fi','F&#xF6;','La'],
		weekHeader: 'Vika',
		dateFormat: 'dd/mm/yy',
		firstDay: 0,
		isRTL: false,
		showMonthAfterYear: false,
		yearSuffix: ''};
	$.datepicker.setDefaults($.datepicker.regional['is']);
});