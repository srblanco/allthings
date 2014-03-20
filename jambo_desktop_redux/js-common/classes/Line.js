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

function Line(json){
    $.extend(this, json);
    /**
     * expected members:
     *      lineNum : incremental id
     *      label : mnemonic label
     *      object call
     */
}

Line.prototype.setOccupied = function() {    
    if (this.idle) {
        this.idle = false;
//        this.call.startTimestamp = new Date().getTime(); // enable this to obtain consistency between displayed time counter and history entry 
    }
};

Line.prototype.setIdle = function() {    
    if (!this.idle) { 
        this.callDropped = false;
        this.idle = true;
    }
};

Line.prototype.clean = function() {
    this.call = { remote : {} };
    //this.conferenceID = undefined;
    this.isMultipoint = false;
};

Line.prototype.setCallOnHold = function(onHold, onSuccess, onFailure) {
    if (!this.idle) {
        __thisWindowProxy__.setCallOnHold(this.lineNum, onHold, bind(this, function(response) {
            if (response.result.returnValue && isDefinedAsFunction(onSuccess)) {
                this.call.onHold = onHold;
                onSuccess(this.lineNum);
            } else if (!response.result.returnValue && isDefinedAsFunction(onFailure)) {
                onFailure(this.lineNum);
            }
        }), undefined, false);
    }
};

Line.prototype.answerCall = function() {
    if (!this.idle) {
        __thisWindowProxy__.answerCall(this.lineNum, undefined, undefined, false);
    }
};

Line.prototype.dropCall = function(onSuccess, onFailure) {
    if (!this.idle) {
        var reason = undefined;
        if (this.call.status === Line.CallStatus.INCOMING) { reason = "busy"; }
        this.callDropped = true;
        __thisWindowProxy__.dropCall(this.lineNum, reason, bind(this, function(response) {
            if (response.result.returnValue && isDefinedAsFunction(onSuccess)) {
                onSuccess(this.lineNum);
            } else if (!response.result.returnValue && isDefinedAsFunction(onFailure)) {
                onFailure(this.lineNum);
            }
        }), undefined, false);
    }
};

Line.prototype.getCallInfo = function(onSuccess, onFailure) {
    if (!this.available) {
        __thisWindowProxy__.getCallInfo(this.lineNum, bind(this, function(response) {
            if (isDefined(response.result.call)) {
                this.call.onHold    = response.result.call.onHold;
                this.call.uptime    = response.result.call.uptime;
                if (isDefinedAsFunction(onSuccess)) { onSuccess(this.lineNum); }
            } else if (!response.result.returnValue && isDefinedAsFunction(onFailure)) {
                onFailure(this.lineNum);
            }
        }), undefined, false);
    }
};

Line.prototype.getRemotePartyInfo = function(onSuccess, onFailure) {
    if (!this.available) {
        __thisWindowProxy__.getRemotePartyInfo(this.lineNum, bind(this, function(response) {
            if (response.result.returnValue) {
                this.updateCallRemotePartyInfo(response.result, onSuccess, onFailure);
                if (isDefinedAsFunction(onSuccess)) { onSuccess(this.lineNum); }
            } else {
                if (isDefinedAsFunction(onFailure)) { onFailure(this.lineNum); }
            }
        }), undefined, false);
    }
};

function infoIsEmpty_(info) {
    if (!isDefined(info) || (info.trim()=="")) {
        return true;
    } else {
        return false;
    }
}

Line.prototype.getCssConfID = function() {
    var cssConfID = undefined;
    if (!this.idle) {
        if (isDefined(this.call.remote.dialStringParams)) {
            return this.call.remote.dialStringParams["cssconfid"];
        }
    }
    return cssConfID;
};

/**
 * Update the line's active call with provided remote party infos; if non contact is already linked to the call, searches
 * for a contact that can match the remote dialString (if a dialString is present). Callbacks can be provided to track
 * async updates to remote party info in case this search will take place: these callbacks will be called with as follow
 *   onContactLoadSuccess(lineNum)
 *   onContactLoadFailure(lineNum) 
 */
Line.prototype.updateCallRemotePartyInfo = function(remotePartyInfo, onContactLoadSuccess, onContactLoadFailure) {
    if (!this.available && isDefined(remotePartyInfo)) {
        if (infoIsEmpty_(this.call.remote.contact))                                                  { this.call.remote.contact        = undefined; }
        if (infoIsEmpty_(this.call.remote.dialString)   && !infoIsEmpty_(remotePartyInfo.id))        { this.call.remote.rawDialString  = remotePartyInfo.id; }
        if (infoIsEmpty_(this.call.remote.dialString)   && !infoIsEmpty_(remotePartyInfo.id))        { this.call.remote.dialString     = remotePartyInfo.id; }
        if (infoIsEmpty_(this.call.remote.alias)  && !infoIsEmpty_(remotePartyInfo.alias))           { this.call.remote.alias          = remotePartyInfo.alias; }
        if (infoIsEmpty_(this.call.remote.displayName)  && !infoIsEmpty_(remotePartyInfo.alias))     { this.call.remote.displayName    = remotePartyInfo.display; }
        if (infoIsEmpty_(this.call.remote.product)      && !infoIsEmpty_(remotePartyInfo.productID)) { this.call.remote.product        = remotePartyInfo.productID; }
        if (infoIsEmpty_(this.call.remote.version)      && !infoIsEmpty_(remotePartyInfo.versionID)) { this.call.remote.version        = remotePartyInfo.versionID; }
        if (infoIsEmpty_(this.call.remote.ipAddress)    && !infoIsEmpty_(remotePartyInfo.ipAddress)) { this.call.remote.ipAddress      = remotePartyInfo.IPAddress; }
        if (infoIsEmpty_(this.call.remote.aliasList)  && !infoIsEmpty_(remotePartyInfo.aliasList))           { this.call.remote.aliasList      = remotePartyInfo.aliasList; }
        /*
        if (isDefinedNotEmptyString(this.call.remote.rawDialString)) {
            var parsedDialString = Line.parseRawDialString(this.call.remote.rawDialString);
            this.call.remote.dialString = parsedDialString.dialString;
            // adding or updating existing params, will not delete existing params to preserve line data
            if (!isDefined(this.call.remote.dialStringParams)) { this.call.remote.dialStringParams = {}; } 
            for (var paramKey in parsedDialString.params) {
                this.call.remote.dialStringParams[paramKey] = parsedDialString.params[paramKey];
            }
        }
        
        if (isDefinedNotEmptyString(this.call.remote.dialString)) {        
            var tempDialstring = this.call.remote.dialString.trim();
            if (tempDialstring.startsWith("contact:")) {
                this.call.remote.contact = getLocalContact(tempDialstring.substring(8));   
                if (isDefined(this.call.remote.contact)) {
                    this.call.remote.displayName = this.call.remote.contact.getDisplayName();
                    if (isDefinedAsFunction(onContactLoadSuccess)) { onContactLoadSuccess(this.lineNum); }
                } else {
                    __thisWindowProxy__.getContact(tempDialstring.substring(8), bind(this, function(response){
                        if (isDefined(response.result.contact)) {
                            this.call.remote.contact = new Contact(response.result.contact);
                            if (isDefined(this.call.remote.contact)) {
                                this.call.remote.displayName = this.call.remote.contact.getDisplayName();                                
                                if (isDefinedAsFunction(onContactLoadSuccess)) { onContactLoadSuccess(this.lineNum); }
                            } else {
                                if (isDefinedAsFunction(onContactLoadFailure)) { onContactLoadFailure(this.lineNum); }
                            }
                        } else {
                            if (isDefinedAsFunction(onContactLoadFailure)) { onContactLoadFailure(this.lineNum); }
                        }
                    }));
                }
            } else {*/
                __thisWindowProxy__.getContactByUri(this.call.remote.dialString, bind(this, function(response){
                    if (isDefined(response.result.contact)) {
                        this.call.remote.contact = new Contact(response.result.contact);
                        this.call.remote.displayName = this.call.remote.contact.getDisplayName();
                        if (isDefinedAsFunction(onContactLoadSuccess)) {
                            onContactLoadSuccess(this.lineNum); }
                    } else if (isDefinedAsFunction(onContactLoadFailure)) {
                        onContactLoadFailure(this.lineNum);
                    }
                }), undefined, false);
            }
        }
    //}
//};

Line.parseRawDialString = function(rawDialString) {
    var result = {
            "dialString":rawDialString,
            "params":{}
    };
    if (isDefined(rawDialString)) {
        var tokens = rawDialString.split(";");
        if (tokens.length > 1) {
            var dialString = tokens[0];
            var params = {};
            for (var i = 1; i < tokens.length; i++) {
                var paramTokens = tokens[i].split("=");
                var paramKey = paramTokens[0];
                var paramValue = (paramTokens.length > 1) ? paramTokens[1] : undefined;
                params[paramKey] = paramValue;
            }
            result["dialString"] = dialString;
            result["params"] = params;
        } 
    }
    return result;
};

Line.prototype.isContactInCall = function(contact) {
    if (!isDefined(contact)) { return false; }
    if (line.idle) { return false; }
    if (contact.getDialString() == line.call.remote.dialString) { return true; }
    return false;
};

Line.prototype.isDialStringInCall = function(dialString) {
    console.info(dialString, this.call.remote.dialString);
    if (!isDefinedNotEmptyString(dialString)) { return false; }
    if (this.idle) { return false; }
    if (dialString.trim().toLowerCase() === this.call.remote.dialString.trim().toLowerCase()) { return true; }
    return false;
};

Line.CallStatus = {
        DIALING         : "DIALING",
        DIALTONE        : "DIALTONE", 
        INCOMING        : "INCOMING",
        REMOTE_RINGING  : "REMOTE_RINGING",
        LOCAL_RINGING   : "LOCAL_RINGING",
        EARLYMEDIA      : "EARLYMEDIA",
        CONNECTED       : "CONNECTED",
        DISCONNECTED    : "DISCONNECTED",
        TERMINATED      : "TERMINATED"
};