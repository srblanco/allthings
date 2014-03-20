/*
 * This source  code is  part of  the Mirial  MCS Client  Software Development  Kit
 * (referred here as the "SDK"). SDK is licensed to you subject to the terms of the
 * "Mirial  MCS  Client  SDK  License Agreement"  (referred  here  as  the "License
 * Agreement"). The License Agreement forms a legally binding contract between  you
 * and Mirial in relation to your use of the SDK.
 * 
 * BY USING THIS  SDK, YOU ARE  AGREEING TO BE  BOUND BY THE  TERMS OF THE  LICENSE
 * AGREEMENT. IF YOU  DO NOT AGREE  TO THE TERMS  OF THE LICENSE  AGREEMENT, DO NOT
 * INSTALL OR USE THE SDK.
 * 
 * This source code is provided "as is" and without warranties as to performance or
 * merchantability. The  author and/or  distributors of  this source  code may have
 * made statements about  this source code.  Any such statements  do not constitute
 * warranties and shall  not be relied  on in deciding  whether to use  this source
 * code. This  source code  is provided  without any  express or implied warranties
 * whatsoever. No warranty of fitness for a particular purpose is offered. You  are
 * advised to test the source code thoroughly before relying on it. You must assume
 * the entire risk of using the source code.
 */

ClientType = {
        Standalone : 'Standalone',
        MCS : 'MCS',
        ClearSea : 'ClearSea'
};

PresenceStatus = {
        available:"AVAILABLE",
        unavailable:"NOT_AVAILABLE",
        unknown:"UNKNOWN"
};

function bind(fnThis, fn) {return function(){return fn.apply(fnThis, arguments);};}

function getClass(obj, forceConstructor) {
	  if ( typeof obj == "undefined" ) return "undefined";
	  if ( obj === null ) return "null";
	  if ( forceConstructor == true && obj.hasOwnProperty("constructor") ) delete obj.constructor; // reset constructor
	  if ( forceConstructor != false && !obj.hasOwnProperty("constructor") ) return getFunctionName(obj.constructor);
	  return Object.prototype.toString.call(obj).match(/^\[object\s(.*)\]$/)[1];
}

function getFunctionName(func) {
  if ( typeof func == "function" || typeof func == "object" )
  var fName = (""+func).match(/^function\s*([\w\$]*)\s*\(/);
  if ( fName !== null ) return fName[1];
}
function bool(obj) {
	if (typeof obj === 'undefined') { return undefined; }
	if (typeof obj === 'boolean') { return obj; }
	if (typeof obj === 'string') { return obj.bool(); }
	return undefined;
}

String.prototype.contains       = function(it) { return this.indexOf(it) != -1; };
String.prototype.startsWith     = function(str){ return (this.match("^"+str)==str); };
String.prototype.endsWith       = function(str) { return (this.match(str+"$")==str); };
String.prototype.trim           = function(){ return (this.replace(/^[\s\xA0]+/, "").replace(/[\s\xA0]+$/, "")); };
String.prototype.bool           = function() { return (/^true$/i).test(this); };
String.prototype.removeHTMLTags = function(){ var str = this.replace(/&(lt|gt);/g, function (strMatch, p1){ return (p1 == "lt")? "<" : ">"; }); return str.replace(/<\/?[^>]+(>|$)/g, ""); };
String.prototype.htmlEntities   = function() { return String(this).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };

Date.prototype.format = function(format){var returnStr='';var replace=Date.replaceChars;for(var i=0;i<format.length;i++){var curChar=format.charAt(i);if(replace[curChar]){returnStr+=replace[curChar].call(this);}else{returnStr+=curChar;}}return returnStr;};Date.replaceChars={shortMonths:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],longMonths:['January','February','March','April','May','June','July','August','September','October','November','December'],shortDays:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],longDays:['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],d:function(){return(this.getDate()<10?'0':'')+this.getDate();},D:function(){return Date.replaceChars.shortDays[this.getDay()];},j:function(){return this.getDate();},l:function(){return Date.replaceChars.longDays[this.getDay()];},N:function(){return this.getDay()+1;},S:function(){return(this.getDate()%10==1&&this.getDate()!=11?'st':(this.getDate()%10==2&&this.getDate()!=12?'nd':(this.getDate()%10==3&&this.getDate()!=13?'rd':'th')));},w:function(){return this.getDay();},z:function(){return"Not Yet Supported";},W:function(){return"Not Yet Supported";},F:function(){return Date.replaceChars.longMonths[this.getMonth()];},m:function(){return(this.getMonth()<9?'0':'')+(this.getMonth()+1);},M:function(){return Date.replaceChars.shortMonths[this.getMonth()];},n:function(){return this.getMonth()+1;},t:function(){return"Not Yet Supported";},L:function(){return(((this.getFullYear()%4==0)&&(this.getFullYear()%100!=0))||(this.getFullYear()%400==0))?'1':'0';},o:function(){return"Not Supported";},Y:function(){return this.getFullYear();},y:function(){return(''+this.getFullYear()).substr(2);},a:function(){return this.getHours()<12?'am':'pm';},A:function(){return this.getHours()<12?'AM':'PM';},B:function(){return"Not Yet Supported";},g:function(){return this.getHours()%12||12;},G:function(){return this.getHours();},h:function(){return((this.getHours()%12||12)<10?'0':'')+(this.getHours()%12||12);},H:function(){return(this.getHours()<10?'0':'')+this.getHours();},i:function(){return(this.getMinutes()<10?'0':'')+this.getMinutes();},s:function(){return(this.getSeconds()<10?'0':'')+this.getSeconds();},e:function(){return"Not Yet Supported";},I:function(){return"Not Supported";},O:function(){return(-this.getTimezoneOffset()<0?'-':'+')+(Math.abs(this.getTimezoneOffset()/60)<10?'0':'')+(Math.abs(this.getTimezoneOffset()/60))+'00';},P:function(){return(-this.getTimezoneOffset()<0?'-':'+')+(Math.abs(this.getTimezoneOffset()/60)<10?'0':'')+(Math.abs(this.getTimezoneOffset()/60))+':'+(Math.abs(this.getTimezoneOffset()%60)<10?'0':'')+(Math.abs(this.getTimezoneOffset()%60));},T:function(){var m=this.getMonth();this.setMonth(0);var result=this.toTimeString().replace(/^.+ \(?([^\)]+)\)?$/,'$1');this.setMonth(m);return result;},Z:function(){return-this.getTimezoneOffset()*60;},c:function(){return this.format("Y-m-d")+"T"+this.format("H:i:sP");},r:function(){return this.toString();},U:function(){return this.getTime()/1000;}};
Date.prototype.prettyDate = function(){
    var date = this,
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
            
    if ( isNaN(day_diff) || day_diff < 0 ) { return; }
            
    return day_diff == 0 &&
        (    
            diff < 60       && _i18n_.getHTML("COMMON_NOW") ||
            diff < 120      && _i18n_.getHTML("COMMON_ONE_MINUTE_AGO") ||
            diff < 3600     && _i18n_.getHTML("COMMON_MINUTES_AGO", {minutes_ago : Math.floor( diff / 60 )+""}) ||
            diff < 7200     && _i18n_.getHTML("COMMON_ONE_HOUR_AGO") ||
            diff < 86400    && _i18n_.getHTML("COMMON_HOURS_AGO", {hours_ago : Math.floor( diff / 3600 )+""})
        ) ||        
        day_diff == 1   && _i18n_.getHTML("COMMON_YESTERDAY") ||
        day_diff < 7    && _i18n_.getHTML("COMMON_DAYS_AGO", {days_ago : day_diff+""}) ||
        day_diff < 31   && _i18n_.getHTML("COMMON_WEEKS_AGO", {weeks_ago : Math.ceil( day_diff / 7 )+""}) ||
        day_diff >= 31  && _i18n_.getHTML("COMMON_OLDER");
};

Date.prototype.lessPrecisePrettyDate = function(){
    
    var date = this,
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
            
    if ( isNaN(day_diff) || day_diff < 0 ) { return; }
    
    return day_diff == 0 && 
        (diff < 86400   && _i18n_.getHTML("COMMON_TODAY")) ||
        day_diff == 1   && _i18n_.getHTML("COMMON_YESTERDAY") ||
        day_diff < 7    && _i18n_.getHTML("COMMON_DAYS_AGO", {days_ago : day_diff+""}) ||
        day_diff < 31   && _i18n_.getHTML("COMMON_WEEKS_AGO", {weeks_ago : Math.ceil( day_diff / 7 )+""}) ||
        day_diff >= 31  && _i18n_.getHTML("COMMON_OLDER");
};

/**
 * add (or subtracts) days to this date
 */
Date.prototype.addDays = function(days) {
    this.setDate(this.getDate()+days);
};

Date.prototype.dayDiff = function(date) {
    var d= Math.abs(this-date);
    return Math.floor(d/(24*60*60*1000));
};

Date.prototype.isSameDayAs = function(date) {
    if (isDefined(date)) {
        if (    
            (this.getFullYear() == date.getFullYear()) &&
            (this.getMonth() == date.getMonth()) &&  
            (this.getDate() == date.getDate())) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

Date.prototype.isToday = function() {
    return this.isSameDayAs(new Date());
};

Date.prototype.isYesterday = function() {
    var yesterday = new Date();
    yesterday.addDays(-1);
    return this.isSameDayAs(yesterday);
};

Date.prototype.dayDiffFromToday = function() {
    return this.dayDiff(new Date());
};

Object.size = function(obj) {
    var size = 0, key;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) { size++; }
    }
    return size;
};

function getQueryStringParameter(paramName) { // search in window.location after the questione mark '?' character, comma '&' separated, equals '=' mapped 
	var queryString = window.location.search.substring(1, location.search.length);
	return getParameter(queryString, '&', '=', paramName);
};

function getHashParameter(paramName) { // search in window.location after the hash '#' character, comma ',' separated, equals '=' mapped 
	var hash = window.location.hash.substring(1, location.hash.length);
	return getParameter(hash, ',', '=', paramName);
};
function getParameter(string, separator, mapper, paramName) {
	var paramValue = false;
	var params = string.split(separator);
	for (i=0; i<params.length;i++) {
		parameter = params[i].substring(0,params[i].indexOf(mapper));
		if (paramName == parameter) {
			paramValue = params[i].substring(params[i].indexOf(mapper)+1);
	    }
	}
	if (paramValue) {
		return paramValue;
	} else {
	    return undefined;
	}
}

CTRL  = false; 
SHIFT = false; 
ALT   = false;
function detectModifierKeys(keyCode, isKeyDown) {
    switch (keyCode) {
        case 16: SHIFT = isKeyDown; break;
        case 17: CTRL  = isKeyDown; break;
        case 18: ALT   = isKeyDown; break;
        default: break;
    }
}

function debugElement(element) {
    var debugString = '';
    if (!isDefined(element)) { debugString = 'undefined'; }
    else { debugString = '#'+element.attr('id')+'.'+element.attr('class'); }
    return debugString;
}

jQuery.fn.singleDoubleClick = function(singleClickCallback, doubleClickCallback, timeout) {
    return this.each(function(){
        var clicks = 0;
        var self = this;
        $(this).click(function(event){
            clicks++;
            if (clicks == 1) {
                setTimeout(function(){
                    if(clicks == 1) { singleClickCallback.call(self, event); } 
                    else            {
                        if (isDefinedAsFunction(doubleClickCallback)) {
                            doubleClickCallback.call(self, event); 
                        } else {
                            singleClickCallback.call(self, event);
                        }                        
                    }
                    clicks = 0;
                }, timeout || 300);
            }
        });
    });
};

jQuery.fn.extend({ 
        disableSelection : function() { 
                this.each(function() { 
                        this.onselectstart = function() { return false; }; 
                        this.unselectable = "on";
                }); 
        } 
}); 

jQuery.fn.extend({ 
        enableSelection : function() { 
                this.each(function() { 
                        this.onselectstart = function() { return true; }; 
                        this.unselectable = "off";
                }); 
        } 
});

jQuery.fn.aPosition = function() {
    var thisLeft = this.offset().left;
    var thisTop = this.offset().top; 
    var thisParent = this.parent();
    var parentLeft = thisParent.offset().left;
    var parentTop = thisParent.offset().top;
    return {
        left: thisLeft-parentLeft, 
        top: thisTop-parentTop
    };
};

/* Compares a with b at the given direction, dealing with undefined values
 * @param {number} a the first number
 * @param {number} b the second number
 * @param {int} the comparing direction, 1 = ASC, -1 = DESC
 * @return 1*direction if a > b, 0 if a == b, -1*direction if a < b 
 */
function compareNumbers(a, b, direction) {
    if ((typeof a === 'undefined') && (typeof b === 'undefined')) { return 0; }
    if (typeof a === 'undefined') { return 1*direction; }
    if (typeof b === 'undefined') { return -1*direction; }
    if (a < b) { return -1*direction; }
    else {
        if (a > b) {return 1*direction; }
        else { return 0; }
    }
};

/* Compares a with b case insensitively at the given direction, dealing with undefined values
 * @param {String} a the first string
 * @param {String} b the second string
 * @param {int} the comparing direction, 1 = ASC, -1 = DESC
 * @return 1*direction if a > b, 0 if a == b, -1*direction if a < b 
 */
function compareString(a, b, direction) {
    if ((typeof a === 'undefined') && (typeof b === 'undefined')) { return 0; }
    if (typeof a === 'undefined') { return 1*direction; }
    if (typeof b === 'undefined') { return -1*direction; }
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a < b) { return -1*direction; }
    else {
        if (a > b) { return 1*direction; }
        else { return 0; }
    }
};

function isDefined(obj) { return (typeof obj !== 'undefined'); }
function isDefinedAsFunction(obj) { return (typeof obj === 'function'); }

function isChar(keyCode) {
    return ($.inArray(keyCode, NonCharKeyCodes)==-1) ? true : false;
}
NonCharKeyCodes = [0,9,13,16,17,18,19,20,27,33,34,35,36,37,38,39,40,45,44,91,92,93,112,113,114,115,116,117,118,119,120,121,122,123,144,145];

function validateNumber(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 13 || event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 37 || event.keyCode == 39) {
        return true;
    } else if ( key < 48 || key > 57 ) {
        return false;
    }
    return true;
};

function validateE164(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 13 || event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 190 || event.keyCode == 189 || event.keyCode == 188 || event.keyCode == 107) {
        return true;
    } else if ( key < 48 || key > 57 ) {
        return false;
    }
    return true;
};

function validateIp(event) {
    var key = window.event ? event.keyCode : event.which;
    if (event.keyCode == 13 || event.keyCode == 8 || event.keyCode == 46 || event.keyCode == 37 || event.keyCode == 39 || event.keyCode == 190) {
        return true;
    } else if ( key < 48 || key > 57 ) {
        return false;
    }
    return true;
};

function sourceFile_() {
    var url=location.href;
    if (isDefined(url)) {
        return url.substring(url.lastIndexOf('/')+1);   
    } else {
        return "undefined";
    }
}

function formatMillis(elapsedMillis){
    var elapsedSecs = Math.floor(elapsedMillis/1000);
    var elapsedMins = Math.floor(elapsedSecs/60);
    var elapsedHours = Math.floor(elapsedMins/60);
    
    elapsedSecs = elapsedSecs % 60;
    if (elapsedSecs<10) { elapsedSecs = '0'+elapsedSecs; }
    
    elapsedMins = elapsedMins % 60;
    if (elapsedMins<10) { elapsedMins = '0'+elapsedMins; }
    
    if (elapsedHours<10) { elapsedHours = '0'+elapsedHours; }
    
    if(elapsedHours>0)//WKRASKO 041812 - Modifed this Mirial function to not return hours if hours are 00
        return elapsedHours+':'+elapsedMins+':'+elapsedSecs;
    else
        return elapsedMins+':'+elapsedSecs;
}

function formatBytes(bytes) {
    var s = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    var e = Math.floor(Math.log(bytes)/Math.log(1024));
    return (bytes/Math.pow(1024, Math.floor(e))).toFixed(2)+" "+s[e];
}

var Utf8 = {
        // public method for url encoding
        encode : function (string) {
            string = string.replace(/\r\n/g,"\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },

        // public method for url decoding
        decode : function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while ( i < utftext.length ) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                } else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
};

var Base64 = {		 
		// private property
		_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
	 
		// public method for encoding
		encode : function (input) {
			var output = "";
			var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
			var i = 0;
	 
			input = Utf8.encode(input);
	 
			while (i < input.length) {	 
				chr1 = input.charCodeAt(i++);
				chr2 = input.charCodeAt(i++);
				chr3 = input.charCodeAt(i++);	 
				enc1 = chr1 >> 2;
				enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
				enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
				enc4 = chr3 & 63;	 
				if (isNaN(chr2)) {
					enc3 = enc4 = 64;
				} else if (isNaN(chr3)) {
					enc4 = 64;
				}	 
				output = output +
				this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
				this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);	 
			}	 
			return output;
		},
	 
		// public method for decoding
		decode : function (input) {
			var output = "";
			var chr1, chr2, chr3;
			var enc1, enc2, enc3, enc4;
			var i = 0;	 
			input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");	 
			while (i < input.length) {	 
				enc1 = this._keyStr.indexOf(input.charAt(i++));
				enc2 = this._keyStr.indexOf(input.charAt(i++));
				enc3 = this._keyStr.indexOf(input.charAt(i++));
				enc4 = this._keyStr.indexOf(input.charAt(i++));	 
				chr1 = (enc1 << 2) | (enc2 >> 4);
				chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
				chr3 = ((enc3 & 3) << 6) | enc4;	 
				output = output + String.fromCharCode(chr1);	 
				if (enc3 != 64) {
					output = output + String.fromCharCode(chr2);
				}
				if (enc4 != 64) {
					output = output + String.fromCharCode(chr3);
				}	 
			}	 
			output = Utf8.decode(output);	 
			return output;	 
		}	 
};

function getCurrentOS() {
    var os="Unknown OS";
    if (navigator.appVersion.indexOf("Win")!=-1)    { os = OSType.Windows; }
    if (navigator.appVersion.indexOf("Mac")!=-1)    { os = OSType.MacOS; }
    if (navigator.appVersion.indexOf("X11")!=-1)    { os = OSType.UNIX; }
    if (navigator.appVersion.indexOf("Linux")!=-1)  { os = OSType.Linux; }
    return os;
};

var OSType = {
		Windows : "Windows",
		MacOS : "MacOS",
		UNIX : "UNIX",
		Linux : "Linux"
}; 

(function($){
    var _priv = {
        cyclicCheck: null, // needed to check for cyclic references

        diff: function(obj1, obj2) {
            if (typeof obj1 === 'undefined') { obj1 = {}; }
            if (typeof obj2 === 'undefined') { obj2 = {}; }
            // starting diff
            var val1, val2, mod = {}, add = {}, del = {}, ret;
            jQuery.each(obj2, function(key, val2){
                val1 = obj1[key];
                bDiff = false;
                if (typeof val1 === 'undefined') { // value not present, key is added
                    add[key] = val2;
                } else if (typeof val1 != typeof val2) { // value type is different, key is changed
                    mod[key] = val2;
                } else if (val1 !== val2) { // value is different   
                    if (typeof val2 === 'object') {
                        if (_priv.cyclicCheck.indexOf(val2) >= 0) { return false; } // break the $.each() loop                                 
                        ret = _priv.diff(val1, val2); // going deeper
                        if (!$.isEmptyObject(ret.mod)) { mod[key] = $.extend(true, {}, ret.mod); }
                        if (!$.isEmptyObject(ret.add)) { add[key] = $.extend(true, {}, ret.add); }
                        if (!$.isEmptyObject(ret.del)) { del[key] = $.extend(true, {}, ret.del); }
                        _priv.cyclicCheck.push(val2);
                    } else { // value is different, no need to go deeper, key is changed
                        mod[key] = val2;
                    }
                }
            });

            jQuery.each(obj1, function(key, val1) { // searching for deleted keys
                if (typeof obj2[key] === 'undefined') {
                    del[key] = true;
                }
            });

            return {"mod": mod, "add": add, "del": del};
        }
    };
    
    // public method
    jQuery.diff = function(obj1, obj2) {
        _priv.cyclicCheck = [];
        return _priv.diff(obj1, obj2);
    };
})(jQuery);

function loadGeometry(defaultWidth, defaultHeight, defaultX, defaultY) {       
    var width = isDefined(defaultWidth) ? defaultWidth : 300;
    var height = isDefined(defaultHeight) ? defaultHeight : 300;
    var x = isDefined(defaultX) ? defaultX : 100;
    var y = isDefined(defaultY) ? defaultY : 100;
    
    var savedGeometry = windowsRepository.getSavedGeometry(window.name); 
    if (isDefined(savedGeometry)) {
        if (isDefined(savedGeometry.width)) { width = savedGeometry.width; }
        if (isDefined(savedGeometry.height)){ height = savedGeometry.height; }
        if (isDefined(savedGeometry.x))     { x = savedGeometry.x; }
        if (isDefined(savedGeometry.y))     { y = savedGeometry.y; }
    }

    if (isDefined(x) && isDefined(y)) { __thisWindow__.move(x, y); }
    __thisWindow__.resize(width, height);    
}

function getCurrentGeometry(){
    return $.extend({}, __thisWindow__.getPosition(), __thisWindow__.getSize()); 
}

function insertAtCaret(areaId, text) {
    var txtarea = document.getElementById(areaId);
    var scrollPos = txtarea.scrollTop;
    var strPos = txtarea.selectionStart;
    var front = (txtarea.value).substring(0,strPos);  
    var back = (txtarea.value).substring(strPos,txtarea.value.length); 
    txtarea.value=front+text+back;
    strPos = strPos + text.length;
    txtarea.selectionStart = strPos;
    txtarea.selectionEnd = strPos;
    txtarea.focus();
    txtarea.scrollTop = scrollPos;
}

/* Return the address part of the given uri without the "sip:" protocol.
 * Example for the following uri
 *   "\"Mark%20White\"<sip:mark@domain.com>"
 * will return
 *   mark@domain.com
 */
function getAddressPart(uri) {
    if (!isDefined(uri)) { return ""; }
    var start = uri.indexOf("<");
    var end = uri.lastIndexOf(">");
    if (end <= start) { return uri; }
    var addressPart = uri.substring(start+1, end);
    if (addressPart.startsWith("sip:")) { 
        // we are dealing with a ClearSea / MCS user 
        // so we strip sip protocol to avoid redundancy
        // and to match the expected dialstring format        
        addressPart = addressPart.substring(4);
    }
    return addressPart;
}

/* Return the display name part of the given uri.
 * Example for the following uri
 *   "\"Mark%20White\"<sip:mark@domain.com>"
 * will return
 *   "Mark White"
 * If no display name is found it falls back to the uri part 
 */
function getDisplayNamePart(uri) {
    var displayNamePart = _getDisplayNamePart(uri);
    if (displayNamePart === "") { return getAddressPart(uri); } // falling back to cleaned address part
    return Utf8.decode(unescape(displayNamePart));
}

function _getDisplayNamePart(uri) { 
    if (!isDefined(uri)) { return ""; }    
    var start = uri.indexOf("<");
    var end = uri.lastIndexOf(">");
    if (end <= start) { return uri; }
    var displayNamePart = uri.substring(0, start).trim();
    if (displayNamePart.startsWith("\"") && displayNamePart.endsWith("\"")) {
        displayNamePart = displayNamePart.substring(1, (displayNamePart.length-1)).trim();
    }
    return displayNamePart;
}

function getDisplayName(uri) {
    var displayName = _getDisplayNamePart(uri);
    if (displayName === "") {
        displayName = getAddressPart(uri);
        var at = displayName.indexOf("@");
        if (at > 0) { // stripping the domain to make the displayname more readable
            displayName = displayName.substring(0, at).trim();
        }
    }
    return Utf8.decode(unescape(displayName));
}

function getLocalSIPURI(user, localIP, localPort, registrar) {
    var localSIPURI = "sip:";
    
    var cleanUser = isDefined(user) ? user.trim() : undefined;
    var cleanLocalIP = isDefined(localIP) ? localIP.trim() : undefined;
    var cleanLocalPort = isDefined(localPort) ? localPort.trim() : undefined;
    var cleanRegistrar = isDefined(registrar) ? registrar.trim() : undefined;
    
    var hostPart = undefined;
    
    if (isDefined(cleanUser)) {
        var at = cleanUser.indexOf("@");
        if (at > 0) { 
            hostPart = cleanUser.substring(at+1, cleanUser.length); 
            cleanUser = cleanUser.substring(0, at);
        }
        localSIPURI += cleanUser;
    }
    
    if (!isDefined(hostPart)) {
        if (isDefined(cleanRegistrar)) {
            hostPart = cleanRegistrar;
        } else if (isDefined(cleanLocalIP)) {
            hostPart = cleanLocalIP;
        }
    }
    
    if (isDefined(hostPart)) { localSIPURI += "@"+hostPart; }
    
    if (isDefined(cleanLocalPort) && !isNaN(cleanLocalPort)) {
        var cleanLocalPort = trimNumber(cleanLocalPort);
        if (cleanLocalPort !== "5060") { localSIPURI += ":"+cleanLocalPort; }
    }
    return localSIPURI;
}

function getLocalH323URI(alias, extension, localIP, gatekeeper) {
    var localH323URI = "h323:";
    
    var cleanAlias = isDefined(alias) ? alias.trim() : undefined;
    var cleanExtension = isDefined(extension) ? extension.trim() : undefined;
    var cleanLocalIP = isDefined(localIP) ? localIP.trim() : undefined;
    var cleanGatekeeper = isDefined(gatekeeper) ? gatekeeper.trim() : undefined;
    
    if (isDefined(cleanGatekeeper) && (cleanGatekeeper.length>0)) {
        if (isDefined(cleanAlias) && (cleanAlias.length>0)) {
            localH323URI += cleanAlias;
        } else if (isDefined(cleanExtension) && (cleanExtension.length>0)) {
            localH323URI += cleanExtension;
        } else {
            localH323URI += localIP;
        }
        localH323URI += "@" + cleanGatekeeper;
    } else {
        localH323URI += localIP;
    }
    
    return localH323URI;
}

function trimNumber(s) {
    while (s.substr(0,1) == '0' && s.length>1) { s = s.substr(1,9999); }
    return s;
}

function sanitize(badString) {
	if (isDefined(badString)) { 
		return badString.htmlEntities().trim();
	} else {
		return "";
	}
}

//PURPLE UTILS
var sipIPPurpReg = /([1-9][0-9]{0,2})+\.([1-9][0-9]{0,2})+\.([1-9][0-9]{0,2})+\.([1-9][0-9]{0,2})+/;
var sipPhonePurpReg = /[2-9]\d{9}/;
var dnsPurpReg = /^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$/;
var passwordReg = /(?!^[0-9]*$)(?!^[a-zA-Z]*$)^([a-zA-Z0-9]{5,15})$/;
var validEmailReg = /^[A-Z0-9._%+-]+@[A-Z0-9-]+\.(?:[A-Z]{2}|com|org|net|edu|gov|mil|biz|info|mobi|name|aero|asia|jobs|museum)$/i;

function getKeyByValue( object, value ) {
    for(var key in object) {
        if(object.key === value) {
            return key;
        }
    }

    return null;
}

function format10D(the10D){
    if(typeof the10D != 'object'){//PNG-655 KTRUMBLE - fringe cases, sometimes an object comes through (specifically: VSknar's contact list prior to adjusting for apostrophies). we shouldn't try to perform operations on those
        if(the10D=="")
            return "";
        if(the10D!=null)
            return "("+the10D.substr(0,3)+") "+the10D.substr(3,3)+"-"+the10D.substr(6,4);
        else
            return null;
    }
}

function cleanDisplayString(uri) {//TODO: Make sure we cover all possible uri's
    if (!isDefined(uri)) { return ""; }
    if(sipPhonePurpReg.test(uri))
        return uri.match(sipPhonePurpReg)[0];
    if(sipIPPurpReg.test(uri))
        return uri.match(sipIPPurpReg)[0];
    return "unknown";
}

function checkPurplePass(pass) {
    if(passwordReg.test(pass))
        return true;
    else
        return false;
}

var states = {
	AL: "Alabama", 
	AK: "Alaska", 
	AZ: "Arizona", 
	AR: "Arkansas", 
	CA: "California", 
	CO: "Colorado", 
	CT: "Connecticut", 
	DE: "Delaware", 
	DC: "District Of Columbia", 
	FL: "Florida", 
	GA: "Georgia", 
	HI: "Hawaii", 
	ID: "Idaho", 
	IL: "Illinois", 
	IN: "Indiana", 
	IA: "Iowa", 
	KS: "Kansas", 
	KY: "Kentucky", 
	LA: "Louisiana", 
	ME: "Maine", 
	MD: "Maryland", 
	MA: "Massachusetts", 
	MI: "Michigan", 
	MN: "Minnesota", 
	MS: "Mississippi", 
	MO: "Missouri", 
	MT: "Montana",
	NE: "Nebraska",
	NV: "Nevada",
	NH: "New Hampshire",
	NJ: "New Jersey",
	NM: "New Mexico",
	NY: "New York",
	NC: "North Carolina",
	ND: "North Dakota",
	OH: "Ohio", 
	OK: "Oklahoma", 
	OR: "Oregon", 
	PA: "Pennsylvania", 
        PR: "Puerto Rico",
	RI: "Rhode Island", 
	SC: "South Carolina", 
	SD: "South Dakota",
	TN: "Tennessee", 
	TX: "Texas", 
	UT: "Utah", 
	VT: "Vermont", 
	VA: "Virginia", 
	WA: "Washington", 
	WV: "West Virginia", 
	WI: "Wisconsin", 
	WY: "Wyoming"
};

var viLanguages = {
    eng: {
        english: "English",
        spanish: "Spanish"
    },
    span: {
        english: "Ingles",
        spanish: "Español"//PNG-1107 KTRUMBLE 05062013
    }
};

//takes a string
//if valid: returns {status:true,dialString:dialStr,type:ip/10d/sip_h323}
//if invalid: returns {status:false,error:badStringMessage}
validateDialString=function(ds){
    if(ds != undefined){//PNG-655 KTRUMBLE - fringe cases, sometimes an object comes through undefined (specifically: VSknar's contact list prior to adjusting for apostrophies). we shouldn't try to perform operations on those
        var enteredString = ds;
        var badStringMessage = _i18n_.get('NUMBER_VALIDATION_NOTVALID');//Default message. We have to return right away from a valid case, or all checks are done even if one was valid.
        var dialStr = '';
        if(enteredString.length>=7){
            function hasNonNumbers(str){
                var reg = new RegExp(/[^0-9]/);
                return reg.test(str)
            }
            function hasNonSIPH323Chars(str){
                var reg = new RegExp(/[^a-zA-Z0-9@:\-\.]/);
                return reg.test(str)
            }
            function sipH323(str){
                var isSipH323Address=false;

                if(str.substring(0,4).search('sip:')!=-1) isSipH323Address=true;
                else if(str.substring(0,5).search('h323:')!=-1) isSipH323Address=true;

                return isSipH323Address;
            }

            //DNS validation
            if(dnsPurpReg.test(enteredString)){
                dialStr=enteredString;
                return {status:true,dialString:dialStr,type:"dns"};
            }

            // IP VALIDATION [three periods, four sets of up to three digits (no blanks, no non-digit characters, no leading zeros)]
            if(enteredString.length>=7 && enteredString.split(".").length-1==3 && !sipH323(enteredString)){
                console.log("Entered IP validation...");
                 var enteredStringArray=enteredString.split('.');
                 var malformedIPMessage = '';
                 $.each(enteredStringArray,function(i){
                     if(malformedIPMessage == ''){
                        if(enteredStringArray[i]=='') malformedIPMessage+='IP must not include blanks.';
                        else if(enteredStringArray[i].length>=2 && enteredStringArray[i].charAt(0)==0) malformedIPMessage+='IP must not contain leading zeros.';
                        else if(hasNonNumbers(enteredStringArray[i])) malformedIPMessage+='IP must contain only numbers.';
                        else if(enteredStringArray[i].length>=4) malformedIPMessage+='Max three digits per section.';
                     }
                 });
                 if(malformedIPMessage!=''){
                    badStringMessage=malformedIPMessage;
                } else {
                    dialStr=enteredString;
                    return {status:true,dialString:dialStr,type:"ip"};
                }
            }

            // 10D VALIDATION [10 digits (no blanks, no non-digit characters)]
            var trimmedString = enteredString.replace(/[\(\) .-]/g,'');//WKRASKO 110112 - PNG-355. Can't just strip non-digits. "Test SupposedToBeP2P 916.698.1234" is not a valid number to begin with, and if all non-digits are stripped, it turns to 29166981234 which is a valid international
            if(trimmedString.length==10 && enteredString.split(".").length-1!=3 && !sipH323(enteredString)){ //is 10D and not IP and not SIP/H323
                //console.log("Entered US Phone validation...");
                if(!sipPhonePurpReg.test(trimmedString)){
                    badStringMessage='Invalid phone number entered.';
                } else {
                    dialStr=trimmedString;
                    return {status:true,dialString:dialStr,type:"10d"};
                }
            }

            // INTERNATIONAL VALIDATION [between 11 & 20 digits (no blanks, no non-digit characters); if 11 digits starting with 1, dial 10d]
            if((trimmedString.length>=11 && trimmedString.length<=20) && enteredString.split(".").length-1!=3 && !sipH323(enteredString)){ //is international and not IP and not SIP/H323
                console.log("Entered International Phone validation...");
                if(hasNonNumbers(trimmedString)){
                    badStringMessage='No non-digit characters.';
                } else if(trimmedString.charAt(0)==1 && trimmedString.length==11) {
                    dialStr=trimmedString.substring(1);
                    return {status:true,dialString:dialStr,type:"10d"};
                } else if(trimmedString.charAt(0)!=1) {
                    dialStr=trimmedString;
                    return {status:true,dialString:dialStr,type:"international"};
                }
            }

            // SIP / H323 VALIDATION [longer than six characters, starts with 'sip:' or 'h323:', can include '@']
            if(enteredString.length>=6 && sipH323(enteredString)){
                console.log("Entered SIP/H323 validation...");
                if(hasNonSIPH323Chars(enteredString)){
                    badStringMessage='SIP/H323 address contains bad characters.';
                } else {
                    dialStr=enteredString;
                    return {status:true,dialString:dialStr,type:"sip_h323"};
                }
            }

        } else if(enteredString=="911"){
            dialStr=enteredString;
            return {status:true,dialString:dialStr,type:"911"};
        }
    }
    console.log("Dialstring failed all valid scenarios...");
    return {status:false,error:badStringMessage};
}

//WKRASKO - Implementing an ActionScript like sortOn method for sub sorting of arrays (of objects), PNG-211
//NOTE: I made this case insensitive, AS2's is not, but for names like we're dealing with it has to be
Array.prototype.sortOn = function(){
    var dup = this.slice();
    if(!arguments.length)
        return dup.sort();
    var args = Array.prototype.slice.call(arguments);
    return dup.sort(function(a,b){
        var props = args.slice();
        var prop = props.shift();
        while(a[prop].toUpperCase() == b[prop].toUpperCase() && props.length)
            prop = props.shift();
        return a[prop].toUpperCase() == b[prop].toUpperCase() ? 0 : a[prop].toUpperCase() > b[prop].toUpperCase() ? 1 : -1;
    });
};

isValidEmailAddress = function(str){//PNG-313 KTRUMBLE 08072012
    if (validEmailReg.test(str)){
        var emailUser = str.split('@')[0];
        if(emailUser.search(/[A-Za-z0-9]/) != -1) return true; //PNG-313 KTRUMBLE 09102012 adding some additional checking for the username to require alphanumerics
        else return false;
    }
    else return false;
}

function findClass(a,b){//a=class array, b=class name to find
    var hasClass = false;
    $.each(a,function(i){
        if(a[i]==b) hasClass=true;
    });
    return hasClass;
}

dialingDots = function(numDots){
    var dots = $('.dialingDots:first').text();
    if(dots.length<=(numDots-1)) dots=dots+'.';
    else dots='';
    $('.dialingDots').text(dots);
}
//PNG-471 KTRUMBLE 10052012 - incall dialer
playDTMF = function(val){
    var castVal = String(val);
    var playVal = castVal;
    if(castVal=="*") playVal = "star";
    if(castVal=="#") playVal = "pound";
    playVal = "wav/dtmf/Dtmf-"+playVal+".wav";
    //WKRASKO 121212 - PNG-727, turning off local playback of DTMF.
    //__thisWindowProxy__.startNotificationPlayback(coreSettings.speakerDevice, playVal, false);
    //WKRASKO 111912 - PNG-727, need to also send to ss or VI never gets them.
    if(lineRepository.getLine(0).idle)
        __thisWindowProxy__.sendDTMF(1, castVal, "auto");
    else
        __thisWindowProxy__.sendDTMF(0, castVal, "auto");
    if(!P2PChatEnabled && JamboSocket.socketReady) JamboSocket.sendSSDTMF(castVal);//PNG-781 KTRUMBLE 01272013 - only attempt to send dtmf across socket if connected
}

//PNG-869 KTRUMBLE 02212013 - truncate caller name in tab
visualLength = function(str){
    var ruler = $("#textRuler").html(str);
    return ruler.width();
}

trimToPx = function(str,px){
    var trimmed=str;
    if (visualLength(str) > px){
        str += '...';
        while (visualLength(str) > px){
            str = str.substring(0,str.length-1);
            trimmed = str + "...";
        }
    }
    return trimmed;
}
//END PNG-869
//PNG-1053 KTRUMBLE 04022013 - check for scrollbar
$.fn.hasScrollBar = function() {
    return this.get(0).scrollHeight > this.innerHeight();
}

popCheck = function(pop){
    //PNG-1057 KTRUMBLE 04082013 - check to see if any popups are open, returning true/false accordingly
    var popOpen = false;
    $.each($('.rndpop'),function(i){
        if($(this).is(':visible') && $(this).attr('id')!=pop) popOpen = true;
    });
    return popOpen;
}