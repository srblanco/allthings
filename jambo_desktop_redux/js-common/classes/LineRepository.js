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

function LineRepository(){
    this.cameraPrivacyMode = false;
    this.micMuted = false;
    this.speakerMuted = false;    

    this.presentationEnabled = false;
    this.presentationPresEntryID = undefined;
    this.presentationLines = new Array();
	this.linesCount_ = 0;
    this.lines_ = new Array();
    
    this.enqueuedCalls_ = [];
}

LineRepository.prototype.init = function(linesCount) {
    this.linesCount_ = linesCount;
    for(var i=0; i<this.linesCount_; i++) {
        this.lines_[i] = new Line({
            lineNum         : i,
            idle            : true,
            label           : 'line'+i,
            call            : { remote : {} }
        });
        this.presentationLines[i] = false;
    }
    __thisWindowProxy__.getSoftphoneInfo(function(response) {
        if (isDefined(response.result)) {
            if (isDefined(response.result.cameraPrivacyMode))    { this.cameraPrivacyMode = response.result.cameraPrivacyMode; }
            if (isDefined(response.result.micMuted))                    { this.micMuted                 = response.result.micMuted; }
            if (isDefined(response.result.speakerMuted))                { this.speakerMuted             = response.result.speakerMuted; }
        }
    });
    __log__.info("Line repository initialized, ["+this.linesCount_+"] available(s).");
};

LineRepository.prototype.forEachLine = function(callback) {
    if (!isDefinedAsFunction(callback)) { return; }
    for(var i=0; i<this.linesCount_; i++) { callback(this.lines_[i]); }
};

LineRepository.prototype.getAvailableLine = function() {
    for(var i=0; i<this.linesCount_; i++) {
        if (this.lines_[i].idle){ return this.lines_[i]; }
    }
    return undefined;
};

LineRepository.prototype.allLineIdle = function() {
    var allLineIdle = true;
    for(var i=0; i<this.linesCount_; i++) {
        if (!this.lines_[i].idle){
            allLineIdle = false;
            break;
        }
    }
    return allLineIdle;
};

LineRepository.prototype.hasConnectedCalls = function() {
    var hasConnectedCalls = false;
    for(var i=0; i<this.linesCount_; i++) {
        if (!this.lines_[i].idle && (this.lines_[i].call.status === Line.CallStatus.CONNECTED)){
            hasConnectedCalls = true;
            break;
        }
    }
    return hasConnectedCalls;
};

LineRepository.prototype.setLineOccupied = function(lineNum) {
    if (isDefined(this.lines_[lineNum])) {
        this.lines_[lineNum].setOccupied();
    }
};

LineRepository.prototype.setLineIdle = function(lineNum) {
    if (isDefined(this.lines_[lineNum])) {
        this.lines_[lineNum].setIdle();
    }
};

LineRepository.prototype.getLine = function(lineNum) {
	return this.lines_[lineNum];
};

LineRepository.prototype.getLinesCount = function() {
    return this.linesCount_;
};

LineRepository.prototype.getLines = function() {
    return this.lines_;  
};

LineRepository.prototype.getLineInCallWithDialString = function(dialString) {
    if (!isDefined(dialString)) { return false; }
    for(var i=0; i<this.linesCount_; i++) {
        if (this.lines_[i].isDialStringInCall(dialString)) { return true; }
    }
    return false;
};

LineRepository.prototype.isContactinCall = function(contact) {
    if (!isDefined(contact)) { return false; }
    for(var i=0; i<this.linesCount_; i++) {
        if (this.lines_[i].isContactInCall(contact)) { return true; }
    }
    return false;
};

LineRepository.prototype.forEachLine = function(callback) {
    if (!isDefinedAsFunction(callback)) { return; }
    for(var i=0; i<this.linesCount_; i++) {
        callback(this.lines_[i]);
    }
};

LineRepository.prototype.clone = function() {
    var clone = new LineRepository();
    clone.cameraPrivacyMode = this.cameraPrivacyMode;
    clone.micMuted = this.micMuted;
    clone.speakerMuted = this.speakerMuted;
    
    clone.presentationEnabled = this.presentationEnabled;
    clone.presentationPresEntryID = this.presentationPresEntryID;
    clone.presentationLines = this.presentationLines;
    clone.linesCount_ = this.linesCount_;
    for(var i=0; i<clone.linesCount_; i++) {
        clone.lines_[i] = new Line({
            lineNum         : this.lines_[i].lineNum,
            idle            : this.lines_[i].idle,
            label           : this.lines_[i].label,
            call            : { 
                    remote      : (isDefined(this.lines_[i].call) ? this.lines_[i].call.remote      : {}),
                    status      : (isDefined(this.lines_[i].call) ? this.lines_[i].call.status      : undefined),   
                    onHold      : (isDefined(this.lines_[i].call) ? this.lines_[i].call.onHold      : undefined),                    
                    audioRx     : (isDefined(this.lines_[i].call) ? this.lines_[i].call.audioRx     : undefined),
                    audioTx     : (isDefined(this.lines_[i].call) ? this.lines_[i].call.audioTx     : undefined),
                    videoRx     : (isDefined(this.lines_[i].call) ? this.lines_[i].call.videoRx     : undefined),
                    videoTx     : (isDefined(this.lines_[i].call) ? this.lines_[i].call.videoTx     : undefined),
                    videoH239Rx : (isDefined(this.lines_[i].call) ? this.lines_[i].call.videoH239Rx : undefined),
                    videoH239Tx : (isDefined(this.lines_[i].call) ? this.lines_[i].call.videoH239Tx : undefined),
                    dataRx      : (isDefined(this.lines_[i].call) ? this.lines_[i].call.dataRx      : undefined),
                    dataTx      : (isDefined(this.lines_[i].call) ? this.lines_[i].call.dataTx      : undefined),
                    encryption  : (isDefined(this.lines_[i].call) ? this.lines_[i].call.encryption  : undefined)
            }
        });
    }
    return clone;
};

LineRepository.prototype.setMicMuted = function(muted) {
    if (isDefined(muted)) {
        __thisWindowProxy__.setMicMuted(muted, function(response) {
            if (response.result.returnValue) {                
                this.micMuted = muted; 
            }
        });
    }
};

LineRepository.prototype.setSpeakerMuted = function(muted) {
    if (isDefined(muted)) {
        __thisWindowProxy__.setSpeakerMuted(muted, function(response) {
            if (response.result.returnValue) { 
                this.speakerMuted = muted; 
            }
        });
    }
};

LineRepository.prototype.setCameraPrivacyMode = function(enabled) {
    if (isDefined(enabled)) {
        __thisWindowProxy__.setCameraPrivacyMode(enabled, function(response) {
            if (response.result.returnValue) {                 
                this.cameraPrivacyMode = enabled; 
            }
        });
    }
};

LineRepository.prototype.enqueueCall = function(callback) {
    this.enqueuedCalls_.push(callback);
};

LineRepository.prototype.startPresentation = function(presEntryID) {
    this.forEachLine(bind(this, function(line){
        if (!line.idle && (line.call.status === Line.CallStatus.CONNECTED)) {
            __thisWindowProxy__.startPresentation(line.lineNum, presEntryID, "Auto");
            this.presentationPresEntryID = presEntryID;
        }
    }));
};

LineRepository.prototype.stopPresentation = function(presEntryID) {
    this.forEachLine(function(line){
        __thisWindowProxy__.stopPresentation(line.lineNum);            
        this.presentationPresEntryID = undefined;
    });
};

LineRepository.prototype.getPresentationPresEntryID = function() {
	return this.presentationPresEntryID;
};

LineRepository.prototype.handleMicMutedNotification = function(event, updatedMicMutedCallback) {
    if (event.event === Event.type.micMutedNotification) { 
        this.micMuted = event.details.micMuted;
        if (isDefinedAsFunction(updatedMicMutedCallback)) { updatedMicMutedCallback(this.micMuted); } 
    } 
};

LineRepository.prototype.handleSpeakerMutedNotification = function(event, updatedSpeakerMutedCallback) {
    if (event.event === Event.type.speakerMutedNotification) {
        this.speakerMuted = event.details.speakerMuted;
        if (isDefinedAsFunction(updatedSpeakerMutedCallback)) { updatedSpeakerMutedCallback(this.speakerMuted); } 
    }
};

LineRepository.prototype.handleCameraPrivacyModeNotification = function(event, updatedCameraPrivacyModeCallback) {
    if (event.event === Event.type.cameraPrivacyModeNotification) {
        this.cameraPrivacyMode = event.details.privacyMode;
        if (isDefinedAsFunction(updatedCameraPrivacyModeCallback)) { updatedCameraPrivacyModeCallback(this.cameraPrivacyMode); } 
    }    
};

LineRepository.prototype.handlePresentationNotification = function(event, presentationNotificationCallback) {
    if (event.event === Event.type.presentationNotification) {
        
        switch (event.details.status) {
            case Event.presentationNotificationStatus.STARTED:
                this.presentationEnabled = true;
                //this.presentationPresEntryID = event.details.presEntryID;// avoid to use this info from the event because it is not reliable
                this.presentationLines[event.details.lineNum] = true;
                if (isDefinedAsFunction(presentationNotificationCallback)) { 
                    presentationNotificationCallback(event.details.lineNum, event.details.status, this.presentationPresEntryID); 
                }  
                break;
            case Event.presentationNotificationStatus.STOPPED:
                if (this.presentationEnabled && this.presentationLines[event.details.lineNum]) {
                    // avoiding STOPPED events when not started
                    this.presentationEnabled = false;
                    this.presentationPresEntryID = undefined; // avoid to reset presentation entry ID because the Core issues a wrong STOPPED event when starting a presentation
                    this.presentationLines[event.details.lineNum] = false;
                    presentationNotificationCallback(event.details.lineNum, event.details.status, this.presentationPresEntryID);
                }
                break;
            default:
                break;
        }
    }
};

LineRepository.prototype.handleCallNotification = function(event, updatedLineCallback) {
    var lineNum = event.details.lineNum;
    var line = this.getLine(lineNum);
    if (event.event === Event.type.callNotification) {
        if (!isDefined(event.details.type)) {
            __log__.error("'type' parameter is undefined, can't parse event");
            return undefined;
        }
        __log__.info(event.event+"|"+event.details.lineNum+"|"+event.details.type+"|"+event.details.subtype);
        
        switch (event.details.type) {
            case Event.callNotificationType.STATE_DIALTONE : 
                line.setOccupied();
                line.call.status = Line.CallStatus.DIALING;
                line.getRemotePartyInfo(function(line) { if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); } });
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }         
                break;
            case Event.callNotificationType.STATE_INCOMING : 
                line.setOccupied();
                line.call.status = Line.CallStatus.INCOMING;
                //line.updateCallRemotePartyInfo(event.details.remotePartyInfo, function(line) { if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); } });
                line.getRemotePartyInfo(function(line) { if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); } });
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
                break;
            case Event.callNotificationType.STATE_REMOTE_RINGING:
                line.call.status = Line.CallStatus.REMOTE_RINGING;
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
                break;
            case Event.callNotificationType.STATE_LOCAL_RINGING:
                // doing nothing since incoming call event is enough
                break;
            case Event.callNotificationType.STATE_EARLYMEDIA :
                line.call.status = Line.CallStatus.EARLYMEDIA;
                updatedLineCallback(lineNum);
                break;
            case Event.callNotificationType.STATE_CONNECTED : 
                line.call.status = Line.CallStatus.CONNECTED;
                if (!isDefined(line.call.startTimestamp)) { 
                    // initialized on first connected event if not already initialized on call dial
                    line.call.startTimestamp = new Date().getTime();
                    if (this.presentationEnabled && !this.presentationLines[line.lineNum]) {
                        // presentation is already enabled on another line, propagate the current presentation to newly connected line
                        this.startPresentation(this.presentationPresEntryID); 
                    } 
                }
                //line.updateCallRemotePartyInfo(event.details.remotePartyInfo, updatedLineCallback);
                line.updateCallRemotePartyInfo(event.details, updatedLineCallback);
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
                JamboSocket.isRedirecting=false;
                break;
            case Event.callNotificationType.STATE_DISCONNECTED : 
                line.call.onHold = false;
                line.call.status = Line.CallStatus.DISCONNECTED;
                line.call.disconnectReason = event.details.subtype;
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
                break;
            case Event.callNotificationType.STATE_TERMINATED    :
                line.setIdle();
                line.call.isEncrypted = false;
                line.call.encryptionSuite = undefined;
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
                if ((line.call.disconnectReason === "REDIRECTING") && isDefined(line.call.redirectRequest)) {
                    
                	__log__.info("Performing redirect with data: "+$.toJSON(line.call.redirectRequest));                	
                	
                	var requestedBy = line.call.redirectRequest.requestedBy;
                	if (isDefined(requestedBy)) { requestedBy = '"' + requestedBy.replace(/\"/g, '\\"') + '"'; }
                	
                	var destination = line.call.redirectRequest.destination;
                	if (isDefined(destination)) { destination = '"' + destination.replace(/\"/g, '\\"') + '"'; }
                	
                	var ctx = line.call.redirectRequest.ctx;
                	if (isDefined(ctx)) { ctx = '"' + ctx.replace(/\"/g, '\\"') + '"'; }
                	
                	var scheduledRedirectCall = '__thisWindowProxy__.makeRedirectCall(undefined, undefined, '+requestedBy+', undefined, '+destination+','+ctx+')';
                	
                	__log__.info('Scheduling redirect call '+scheduledRedirectCall);
                	
                	setTimeout(scheduledRedirectCall, 1000);
                }
                line.clean();
                if (this.enqueuedCalls_.length > 0) {
                    var callback = this.enqueuedCalls_.shift();
                    while (!isDefinedAsFunction(callback)) {
                        callback = this.enqueuedCalls_.shift();
                    }
                    if (isDefinedAsFunction(callback)) { callback(); }
                }
                break;
            case Event.callNotificationType.TRANSFERRING_LOCAL  : break;
            case Event.callNotificationType.TRANSFERRING_REMOTE : break;
            case Event.callNotificationType.LICENSE_DUP         : break;
            case Event.callNotificationType.AUDIO_RX            : line.call.audioRx = true; break;
            case Event.callNotificationType.AUDIO_TX            : line.call.audioTx = true; break;
            case Event.callNotificationType.AUDIO_RX_END        : line.call.audioRx = false; break;        
            case Event.callNotificationType.AUDIO_TX_PAUSED     : break;
            case Event.callNotificationType.AUDIO_TX_END        : line.call.audioTx = false; break;
            case Event.callNotificationType.VIDEO_RX            : line.call.videoRx = true;
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
                break;
            case Event.callNotificationType.VIDEO_TX            : line.call.videoTx = true;
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
                break;
            case Event.callNotificationType.VIDEO_RX_END        : line.call.videoRx = false; break;        
            case Event.callNotificationType.VIDEO_TX_PAUSED     : break;
            case Event.callNotificationType.VIDEO_TX_END        : line.call.videoTx = false; break;
            case Event.callNotificationType.VIDEO_H239_RX       : line.call.videoH239Rx = true; 
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
                break;
            case Event.callNotificationType.VIDEO_H239_RX_END   : line.call.videoH239Rx = false; break;
            case Event.callNotificationType.VIDEO_H239_TX       : line.call.videoH239Tx = true; 
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
                break;
            case Event.callNotificationType.VIDEO_H239_TX_PAUSED: break;
            case Event.callNotificationType.VIDEO_H239_TX_END   : line.call.videoH239Tx = false; break;
            case Event.callNotificationType.DATA_RX             : line.call.dataRx = true; break;
            case Event.callNotificationType.DATA_RX_END         : line.call.dataRx = false; break;
            case Event.callNotificationType.DATA_TX             : line.call.dataTx = true; break;
            case Event.callNotificationType.DATA_TX_END         : line.call.dataTx = false; break;
            case Event.callNotificationType.MEDIA_RX_TIMEOUT    : break;
            default:
                __log__.error("'type' parameter has an unsupported value ["+event.details.type+"], can't parse event");
                break;
        }
    } else if (event.event === Event.type.onRedirectRequest) {
        JamboSocket.isRedirecting=true;
        isRedirect=true;
        /*
         * "details":{ 
         * "lineNum":number, // mandatory 
         * "requestedBy":string, // The entity requesting the redirection. 
         * "destinationAliases":array, // Array of strings, in preferred order. 
         * "destination":string, // Primary redirect destination. 
         * "ctx":string // Stack context to be used to dial the new redirected call. 
         * }
         */
        if (!isDefined(event.details.ctx)) {
            __log__.error("'ctx' parameter is undefined, can't parse event");
            return undefined;
        }
        
        line.call.redirectRequest = event.details;
        if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
        
    } else if (event.event === Event.type.callOnHoldNotification) {
        if (!isDefined(event.details.onHold)) {
            __log__.error("'onHold' parameter is undefined, can't parse event");
            return undefined;
        }
        
        line.call.onHold = event.details.onHold;
        if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
    } else if (event.event === Event.type.mediaEncryptionNotification) {
        if (!isDefined(event.details.direction)) {
            __log__.error("'direction' parameter is undefined, can't parse event");
            return undefined;
        }
        
        if (!isDefined(event.details.medium)) {
            __log__.error("'medium' parameter is undefined, can't parse event");
            return undefined;
        }
        
        if (!isDefined(event.details.encryptionSuite)) {
            __log__.error("'encryptionSuite' parameter is undefined, can't parse event");
            return undefined;
        }
        
        if (!isDefined(line.call.encryption)) { line.call.encryption = {}; }
        line.call.encryption[event.details.medium+"."+event.details.direction] = event.details.encryptionSuite;
        
        if (!isDefined(line.call.isEncrypted)) { line.call.isEncrypted = false; }
        
        if (line.call.isEncrypted) {
            var encSuiteFound = false; 
            for (var mediumDir in line.call.encryption) {
                if ((mediumDir === "AUDIO.RX") || (mediumDir === "AUDIO.TX") || (mediumDir === "VIDEO.RX") || (mediumDir === "VIDEO.TX")) {
                    var encSuite = line.call.encryption[mediumDir];
                    if (encSuite !== "NONE") { encSuiteFound = true; }
                }
            }
            if (!encSuiteFound) {
                line.call.isEncrypted = false;
                line.call.encryptionSuite = undefined;
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
            }
        } else {
            for (var mediumDir in line.call.encryption) {
                if ((mediumDir === "AUDIO.RX") || (mediumDir === "AUDIO.TX") || (mediumDir === "VIDEO.RX") || (mediumDir === "VIDEO.TX")) {
                    var encSuite = line.call.encryption[mediumDir];
                    if (encSuite !== "NONE") { 
                        line.call.isEncrypted = true;
                        line.call.encryptionSuite = encSuite;
                        break;
                    }
                }
            }
            if (line.call.isEncrypted) {
                if (isDefinedAsFunction(updatedLineCallback)) { updatedLineCallback(lineNum); }
            }
        } 
    }
};