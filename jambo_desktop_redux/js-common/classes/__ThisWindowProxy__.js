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

/**
 * __ThisWindowPProxy__ is an abstraction layer for CORE API that enables, in conjunction with the __CoreListener__
 * object present in the global namespace, every command's response to be linked directly to the command execution namespace,
 * avoiding to take care of saving data for an asynchronous response processing.
 * 
 * It also expose a functional translation of the API to make them more recognizable in the code.
 * 
 * @returns {__ThisWindowProxy__}
 */
function __ThisWindowProxy__(){
    this.lines = {};
    this.currentSearch = {};
    this.currentSearch.results = {};
    
    this.language = undefined;
    this.languageMap = undefined;
    _seqN = 1;
}

__ThisWindowProxy__.prototype.getCoreSettings = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getCoreSettings, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.setUserSettings = function(userSettings, save, callback, appData, broadcast) {
    var doSave = save;
    if (!isDefined(save)) { doSave = false; }
    var params = {
            "userSettings":userSettings,
            "save":doSave            
        };
    this.processStandardCommand(Command.type.setUserSettings, params, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.setCoreSettings = function(coreSettings, reinitAudioSubsystem, reinitVideoSubsystem, reinitEndpoints, continueInitCore, callback, appData, broadcast) {
    var doReinitEndpoints = reinitEndpoints;
    if (!isDefined(reinitEndpoints)) { doReinitEndpoints = false; }
    var doReinitAudioSubsystem = reinitAudioSubsystem;
    if (!isDefined(reinitAudioSubsystem)) { doReinitAudioSubsystem = false; }
    var doReinitVideoSubsystem = reinitVideoSubsystem;
    if (!isDefined(reinitVideoSubsystem)) { doReinitVideoSubsystem = false; }
    var doContinueInitCore = continueInitCore;
    if (!isDefined(continueInitCore)) { doContinueInitCore = false; }
    var params = {
            "coreSettings":coreSettings,
            "reinitAudioSubsystem":doReinitAudioSubsystem,
            "reinitVideoSubsystem":doReinitVideoSubsystem,
            "reinitEndpoints":doReinitEndpoints/*,
            "continueInitCore":doContinueInitCore*/
        }; 
    this.processStandardCommand(Command.type.setCoreSettings, params, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.setApplicationSettings = function(applicationSettings, callback, appData, broadcast) {
    var params = {
            "applicationSettings":applicationSettings
        }; 
    this.processStandardCommand(Command.type.setApplicationSettings, params, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getApplicationSettings = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getApplicationSettings, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.registerEndpoint = function(endpoint, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.registerEndpoint, {"endpoint":endpoint}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.replaceLicense = function(licensePath, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.replaceLicense, {"filePath":licensePath}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getListOfLocalIp = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getListOfLocalIp, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getVideoCaptureDevices = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getVideoCaptureDevices, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getVideoCaptureDeviceFormats = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getVideoCaptureDeviceFormats, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getAudioCaptureDevices = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getAudioCaptureDevices, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getAudioPlaybackDevices = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getAudioPlaybackDevices, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getNotificationDevices = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getNotificationDevices, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getFlasherDevices = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getFlasherDevices, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getSeqN = function() {
    return _seqN++; 
};

__ThisWindowProxy__.prototype.syncContacts = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.syncContacts, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getContacts = function(contactsConfiguration, callback, appData, broadcast) {
    var seqN = this.getSeqN(); 
    
    var orderBy = {};
    orderBy.order = "ASC";
    orderBy.fields = [];
    if (contactsConfiguration.groupByStatus) { orderBy.fields.push("presenceStatus"); }
    if (contactsConfiguration.groupByGroup) { orderBy.fields.push("group"); }
    if (isDefined(clientType) && (clientType === ClientType.ClearSea)) {
        orderBy.fields.push("name");
        orderBy.fields.push("sip_id");
    } else {
        orderBy.fields.push("name");
        orderBy.fields.push("surname");
        orderBy.fields.push("h323_id");
        orderBy.fields.push("sip_id");
    }    
    
    var filter = [];
    if (isDefined(clientType) && (clientType === ClientType.ClearSea)) {
        filter.push({"presenceStatus":PresenceStatus.available});
        filter.push({"presenceStatus":PresenceStatus.unknown});
        if (contactsConfiguration.showUnavailable) { filter.push({"presenceStatus":PresenceStatus.unavailable}); }
    }
    
    var search = undefined;
    
    var broadcastResponse = broadcast;
    if (!isDefined(broadcast)) { broadcastResponse = true; }
    
    var command = new Command({
        "appID":__APP_ID__,
        "seqN":seqN,
        "broadcast":broadcastResponse,
        "command":Command.type.getContacts,
        "params":{
            "orderBy":orderBy,
            "filter":filter
        },
        "appData":appData
    }); 
    
    this.processCommand(command, callback);
};

__ThisWindowProxy__.prototype.sendInstantMsg = function(toUri, message, callback, appData, broadcast) {
    var params = {
            "destinationUri":toUri,
            "contentType":"text/plain; charset=utf-8",
            "message":message
        };
    var timestamp = new Date().getTime();
    var seqN = this.getSeqN(); 
    var broadcastResponse = broadcast;
    if (!isDefined(broadcast)) { broadcastResponse = true; }
    var paramsObj = params;
    if (!isDefined(params)) { paramsObj = {}; }
    var command = new Command({
        "appID":__APP_ID__,
        "seqN":seqN,
        "broadcast":broadcastResponse,
        "command":Command.type.sendInstantMsg,
        "params":paramsObj,
        "appData":appData
    });
    this.processCommand(command, function(response) {
        if(onCall && P2PChatEnabled){//PNG-186 KTRUMBLE 10302012 - Add P2PChat
            handleInstantMsg({
                "timestamp": timestamp,
                "destinationUri": toUri,
                "message": message,
                "failed": !response.result.returnValue
            });
            if (isDefined(callback)) {
                callback(response);
            }
        }
    });
};

__ThisWindowProxy__.prototype.getContact = function(contactID, callback, appData, broadcast) {    
    this.processStandardCommand(Command.type.getContact, {"id":contactID}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getContactByUri = function(uri, callback, appData, broadcast) {    
    this.processStandardCommand(Command.type.getContactByUri, {"uri":uri}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.deleteContact = function(contactID, callback, appData, broadcast) {    
    this.processStandardCommand(Command.type.deleteContact, {"id":contactID}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.saveContact = function(contactID, contactData, callback, appData, broadcast) {    
    var params = {
            "id":contactID,
            "contact":contactData
        }; 
    this.processStandardCommand(Command.type.saveContact, params, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.syncHistory = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.syncHistory, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getHistory = function(historyConfiguration, callback, appData, broadcast) {
    var seqN = this.getSeqN(); 
    
    var orderBy = {};
    orderBy.order = "DESC";
    orderBy.fields = [];
    orderBy.fields.push("start_date");
    
    var filter = [];
    if (historyConfiguration.showMissed)    { filter.push({"call_type":"missed"});   }
    if (historyConfiguration.showInbound)   { filter.push({"call_type":"incoming"}); }
    if (historyConfiguration.showOutbound)  { filter.push({"call_type":"outgoing"}); }
    if (filter.length==0) { filter.push({"call_type":"unknown"}); }
    
    var broadcastResponse = broadcast;
    if (!isDefined(broadcast)) { broadcastResponse = true; }
    
    var command = new Command({
        "appID":__APP_ID__,
        "seqN":seqN,
        "broadcast":broadcastResponse,
        "command":Command.type.getHistory,
        "params":{
            "orderBy":orderBy,
            "filter":filter
        },
        "appData":appData
    }); 
    
    this.processCommand(command, callback);
};

__ThisWindowProxy__.prototype.getHistoryEntry = function(historyEntryID, callback, appData, broadcast) {    
    this.processStandardCommand(Command.type.getHistoryEntry, {"id":historyEntryID}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.deleteHistoryEntry = function(historyEntryID, callback, appData, broadcast) {    
    this.processStandardCommand(Command.type.deleteHistoryEntry, {"id":historyEntryID}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.deleteHistory = function(callback, appData, broadcast) {    
    this.processStandardCommand(Command.type.deleteHistory, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.saveRecordedCall = function(recordedCallID, recordedCallData, callback, appData, broadcast) {    
    var params = {
            "id":recordedCallID,
            "recordedCall":recordedCallData
        }; 
    this.processStandardCommand(Command.type.saveRecordedCall, params, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.syncRecordedCalls = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.syncRecordedCalls, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getRecordedCalls = function(callback, appData, broadcast) {
    var seqN = this.getSeqN(); 
    
    var orderBy = {};
    orderBy.order = "DESC";
    orderBy.fields = [];
    orderBy.fields.push("start_date");  
    
    var filter = [];
    
    var broadcastResponse = broadcast;
    if (!isDefined(broadcast)) { broadcastResponse = true; }
    
    var command = new Command({
        "appID":__APP_ID__,
        "seqN":seqN,
        "broadcast":broadcastResponse,
        "command":Command.type.getRecordedCalls,
        "params":{
            "orderBy":orderBy,
            "filter":filter
        },
        "appData":appData
    }); 
    
    this.processCommand(command, callback);
};

__ThisWindowProxy__.prototype.getRecordedCall = function(recordedCallID, callback, appData, broadcast) {    
    this.processStandardCommand(Command.type.getRecordedCall, {"id":recordedCallID}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.deleteRecordedCall = function(recordedCallID, callback, appData, broadcast) {    
    this.processStandardCommand(Command.type.deleteRecordedCall, {"id":recordedCallID}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.openTestCaseWindow = function(){
    __thisWindow__.openWindow($.toJSON({
        "url":"testcase.html",
        "title":"Test case",
        "width":300,
        "height":600,
        "min-width":300,
        "min-height":400,
        "icon":"./img/toolbar_recorded.png",
        "minimized":false,
        "windowData":{
            "clientType":clientType
        }
    }));
};

__ThisWindowProxy__.prototype.getSearchResults = function(entryType) {
    var results = new Array();
    if (isDefined(entryType) && isDefined(this.currentSearch.results[entryType])) {
        var len = this.currentSearch.results[entryType].length;
        for ( var i = 0; i < len; i++) {
            results.push(this.currentSearch.results[entryType][i]);
        }
    } else {        
        for (var type in this.currentSearch.results) {
            results.push(this.getSearchResults(type));
        }
    }
    return results;
};

__ThisWindowProxy__.prototype.initializeSearch = function(searchString, onQuickCallResultsReady) {
    this.currentSearch.string = searchString;
    this.currentSearch.results = {};
};

__ThisWindowProxy__.prototype.clearSearch = function() {
    this.currentSearch = {};
};

__ThisWindowProxy__.prototype.getContactFromSipUri = function(sipUri, callback, appData, broadcast) {
    var seqN = this.getSeqN(); 
    
    var params = {
            "filter":[{"sip_id":sipUri}],
            "start":0,
            "limit":1
    };
    
    this.processStandardCommand(Command.type.getContacts, params, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.searchContacts = function(searchString, callback) {
    var seqN = this.getSeqN(); 
    
    var fields = [];
    if (isDefined(clientType) && (clientType == ClientType.ClearSea)) {
        fields = ["name", "sip_id"];
    } else {
        fields= ["name", "surname", "h323_id", "sip_id"];
    } 
    
    var orderBy = {};
    orderBy.order = "ASC";
    orderBy.fields = fields;    
    
    var filter = [];
    
    var search = {};
    search.text = searchString;
    search.fields = fields;
    
    var command = new Command({
        "appID":__APP_ID__,
        "seqN":seqN,
        "broadcast":false,
        "command":Command.type.getContacts,
        "params":{
            "orderBy":orderBy,
            "filter":filter,
            "search":search
        }
    }); 

    this.processCommand(command, bind(window, function(response){
        if (isDefined(__thisWindowProxy__.currentSearch.string)) {
            __thisWindowProxy__.currentSearch.results[Contact.thisClass] = new Array();
            for(var i=0; i<response.result.contacts.length; i++) {
                __thisWindowProxy__.currentSearch.results[Contact.thisClass].push(response.result.contacts[i]);
            }
            if (isDefined(callback)) {
                eval("window."+callback+"()");
            }
        }
    }));
};

__ThisWindowProxy__.prototype.searchServerContacts = function(searchString, start, limit, callback) {
    var seqN = this.getSeqN(); 
    
    var command = new Command({
        "appID":__APP_ID__,
        "seqN":seqN,
        "broadcast":false,
        "command":Command.type.searchServerContacts,
        "params":{
            "search":searchString,
            "start":start,
            "limit":limit
        }
    });
    
    this.processCommand(command, bind(window, function(response){
        if (isDefined(__thisWindowProxy__.currentSearch.string)) {
            __thisWindowProxy__.currentSearch.results[ServerContact.thisClass] = new Array();
            if (isDefined(response.result.contacts)) {
                for(var i=0; i<response.result.contacts.length; i++) {
                    __thisWindowProxy__.currentSearch.results[ServerContact.thisClass].push(response.result.contacts[i]);
                }
            }
            if (isDefined(callback)) {
                eval("window."+callback+"()");
            }
        }
    }));
};

__ThisWindowProxy__.prototype.searchHistory = function(searchString, callback) {
    var seqN = this.getSeqN(); 
    
    var orderBy = {};
    orderBy.order = "DESC";
    orderBy.fields = ["start_date"];  
    
    var filter = [];
    
    var search = {};
    search.text = searchString;
    search.field = ["displayName", "remote_party"];
    
    var command = new Command({
        "appID":__APP_ID__,
        "seqN":seqN,
        "broadcast":false,
        "command":Command.type.getHistory,
        "params":{
            "orderBy":orderBy,
            "filter":filter,
            "search":search
        }
    }); 
    
    this.processCommand(command, bind(window, function(response){
        if (isDefined(__thisWindowProxy__.currentSearch.string)) {
            __thisWindowProxy__.currentSearch.results[HistoryEntry.thisClass] = new Array();
            for(var i=0; i<response.result.history.length; i++) {
                __thisWindowProxy__.currentSearch.results[HistoryEntry.thisClass].push(response.result.history[i]);
            }
            if (isDefined(callback)) {
                eval("window."+callback+"()");
            }
        }
    }));
};

__ThisWindowProxy__.prototype.makeCall = function(lineNum, callerDisplayString, calledDisplayString, calledDialString, callback, appData, broadcast) {   
    var params = {
            "lineNum":lineNum,
            "callerDisplayString":callerDisplayString,
            "calledDisplayString":calledDisplayString,
            "dialString":calledDialString
        };
    this.processStandardCommand(Command.type.makeCall, params, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.makeRedirectCall = function(lineNum, callerDisplayString, requestedBy, destinationAliases, destination, ctx, callback, appData, broadcast) {   
    var params = {
            "lineNum":lineNum,
            "callerDisplayString":callerDisplayString,
            "dialString":destination,
            "ctx":ctx
        };
    this.processStandardCommand(Command.type.makeCall, params, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.openWindow = function(url, name) {
    return window.open(url, name);
};

__ThisWindowProxy__.prototype.getAppInfo = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getAppInfo, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getLicenseInfo = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getLicenseInfo, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.performUpdate = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.performUpdate, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.stopUpdate = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.stopUpdate, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.skipUpdate = function(versionToSkip, callback, appData, broadcast) {
    var params ={
            "version":versionToSkip
        };
    this.processStandardCommand(Command.type.skipUpdate, params, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.performAuthentication = function(username, password, server, realm, authType, callback, appData, broadcast) {
    var params ={
            "username":username,
            "password":password,
            "server":server,
            "realm":realm,
            "authType":authType
        };
    this.processStandardCommand(Command.type.performAuthentication, params, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getRemotePartyInfo = function(lineNum, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getRemotePartyInfo, {"lineNum":lineNum}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.setCallOnHold = function(lineNum, onHold, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.setCallOnHold, {"lineNum":lineNum,"onHold":onHold}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.setCameraPrivacyMode = function(privacyMode, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.setCameraPrivacyMode, {"privacyMode":privacyMode}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.setMicMuted = function(micMuted, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.setMicMuted, {"micMuted":micMuted}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.setSpeakerMuted = function(speakerMuted, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.setSpeakerMuted, {"speakerMuted":speakerMuted}, callback, appData, broadcast);
};
//PNG-471 KTRUMBLE 10052012 - incall dialer
__ThisWindowProxy__.prototype.sendDTMF = function(lineNum, dtmf, dtmfMode, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.sendDTMF, {"lineNum":lineNum, "dtmf":dtmf, "dtmfMode":dtmfMode}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getCallInfo = function(lineNum, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getCallInfo, {"lineNum":lineNum}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getSoftphoneInfo = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getSoftphoneInfo, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.answerCall = function(lineNum, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.answerCall, {"lineNum":lineNum}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.dropCall = function(lineNum, reason, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.dropCall, {"lineNum":lineNum, "reason":reason}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getChatHistory = function(remotePartyUri, chatHistoryTimeFrame, callback, appData, broadcast) {
    // this command is overridden due to lacking core implementation: the chat history is implemented via javascript,
    // thus broadcast parameter is always false
    var seqN = this.getSeqN(); 
    var command = new Command({
        "appID":__APP_ID__,
        "seqN":seqN,
        "broadcast":false,
        "command":Command.type.getChatHistory,
        "params":{
            "remotePartyUri":remotePartyUri,
            "chatHistoryTimeFrame":chatHistoryTimeFrame
        },
        "appData":appData
    });
    
    // building response
    var chatHistory = opener.getChatHistory(remotePartyUri);
    var response = new Response({
        "appID":command.appID,
        "seqN":command.seqN,
        "broadcast":command.broadcast,
        "command":command.command,
        "result":{
            "chatHistory":chatHistory
        },
        "appData":command.appData
    });
    
    if (isDefinedAsFunction(callback)) { __coreListener__.setCallback(command, callback); }
    __coreListener__.onResponse(response);
};

__ThisWindowProxy__.prototype.getPresEntries = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getPresEntries, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.startPresentation = function(lineNum, presEntryID, mode) {
    this.processStandardCommand(Command.type.startPresentation, {"lineNum":lineNum, "presEntryID":presEntryID, "mode":mode}, undefined, undefined, false);
};

__ThisWindowProxy__.prototype.stopPresentation = function(lineNum) {
    this.processStandardCommand(Command.type.stopPresentation, {"lineNum":lineNum}, undefined, undefined, false);
};

__ThisWindowProxy__.prototype.startNotificationPlayback = function(device, resource, loop, callback, appData, broadcast) {
    var doLoop = loop;
    if (!isDefined(doLoop)) { doLoop = false; }
    this.processStandardCommand(Command.type.startNotificationPlayback, {"device":device, "resource":resource, "loop":doLoop}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.stopNotificationPlayback = function(device, resource, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.stopNotificationPlayback, {"device":device, "resource":resource}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.startRecordingCall = function(lineNum) {
    this.processStandardCommand(Command.type.startRecordingCall, {"lineNum":lineNum}, undefined, undefined, false);
};

__ThisWindowProxy__.prototype.stopRecordingCall = function(lineNum) {
    this.processStandardCommand(Command.type.stopRecordingCall, {"lineNum":lineNum}, undefined, undefined, false);
};

__ThisWindowProxy__.prototype.startPlaybackRecordedCall = function(id) {
    this.processStandardCommand(Command.type.startPlaybackRecordedCall, {"id":id}, undefined, undefined, false);
};

__ThisWindowProxy__.prototype.stopPlaybackRecordedCall = function(id) {
    this.processStandardCommand(Command.type.stopPlaybackRecordedCall, {"id":id}, undefined, undefined, false);
};

__ThisWindowProxy__.prototype.startTranscodingRecordedCall = function(id, filepath) {
    this.processStandardCommand(Command.type.startTranscodingRecordedCall, {"id":id, "filepath":filepath}, undefined, undefined, false);
};

__ThisWindowProxy__.prototype.stopTranscodingRecordedCall = function(id) {
    this.processStandardCommand(Command.type.stopTranscodingRecordedCall, {"id":id}, undefined, undefined, false);
};

__ThisWindowProxy__.prototype.enableMicSignalPowerNotification = function(enabled, period) {
    this.processStandardCommand(Command.type.enableMicSignalPowerNotification, {"enabled": enabled,"intervalMs":period}, undefined, undefined, false);
};

__ThisWindowProxy__.prototype.openVideoCaptureDriverSettings = function() {
    this.processStandardCommand(Command.type.openVideoCaptureDriverSettings, {}, undefined, undefined, false);
};

__ThisWindowProxy__.prototype.showVideoComposer = function(show) {
    var doShow = show;
    if (!isDefined(doShow)) { doShow = true; }
    this.processStandardCommand(Command.type.showVideoComposer, {"shown":doShow}, undefined, undefined, false);
};

__ThisWindowProxy__.prototype.getVideoComposerLayoutsForState = function(state, callback) {
    this.processStandardCommand(Command.type.getVideoComposerLayoutsForState, {"state":state}, callback, undefined, false);
};

__ThisWindowProxy__.prototype.getVideoComposerCurrentState = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getVideoComposerCurrentState, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.setVideoComposerLayout = function(layout, callback) {
    this.processStandardCommand(Command.type.setVideoComposerLayout, {"layout":layout}, callback, undefined, false);
};

__ThisWindowProxy__.prototype.getVideoComposerCurrentLayout = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getVideoComposerCurrentLayout, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.setSpeakerLevel = function(level, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.setSpeakerLevel, {"level":level}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.setAudioNotificationPlaybackDeviceLevel = function(level, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.setAudioNotificationPlaybackDeviceLevel, {"level":level}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.setMicLevel = function(level, callback, appData, broadcast) {
    this.processStandardCommand(Command.type.setMicLevel, {"level":level}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getSpeakerLevel = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getSpeakerLevel, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getAudioNotificationPlaybackDeviceLevel = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getAudioNotificationPlaybackDeviceLevel, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.getMicLevel = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.getMicLevel, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.quit = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.quit, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.logout = function(callback, appData, broadcast) {
    this.processStandardCommand(Command.type.logout, {}, callback, appData, broadcast);
};

__ThisWindowProxy__.prototype.sendPublish = function(destinationUri, eventType, contentType, content, callback, appData, broadcast) {
    var publish = {
            "destinationUri":   (isDefined(destinationUri)  ? destinationUri    : "*"),
            "eventType":        (isDefined(eventType)       ? eventType         : "x-mirial-generic"),
            "contentType":      (isDefined(contentType)     ? contentType       : "application/json; charset=utf-8"),
            "content":          (isDefined(content)         ? content           : {})
    };
    this.processStandardCommand(Command.type.sendPublish, publish, callback, appData, broadcast);
};

/**
 * Main command execution method; 
 * 
 * @param command the string defining the command to be executed
 * @param params the object defining command's parameters
 * @param callback optional, the function called when the command's response is received by the __coreListener__ GUI API; if not present
 * the response, if provided, will be dispatched via the defined __coreListener__ onResponse path 
 * @param appData optional, the object retaining some contextual information that can be passed to the code that will handler the command's response
 * @param broadcast deprecated
 */
__ThisWindowProxy__.prototype.processStandardCommand = function(command, params, callback, appData, broadcast) {    
    var seqN = this.getSeqN(); 
    var broadcastResponse = broadcast;
    if (!isDefined(broadcast)) { broadcastResponse = true; }
    var paramsObj = params;
    if (!isDefined(params)) { paramsObj = {}; }
    var jsonCommand = new Command({
        "appID":__APP_ID__,
        "seqN":seqN,
        "broadcast":broadcastResponse,
        "command":command,
        "params":paramsObj,
        "appData":appData
    }); 
    this.processCommand(jsonCommand, callback);
};

__ThisWindowProxy__.prototype.processCommand = function(jsonCommand, callback) {
    var start = new Date().getTime();
    var jsonCommandString = $.toJSON(jsonCommand);
    if (isDefinedAsFunction(callback)) { __coreListener__.setCallback(jsonCommand, callback); }
    __thisWindow__.processCommand(jsonCommandString);
    __log__.info(__APP_ID__+"|CMD|"+jsonCommand.seqN+"|"+jsonCommand.appID+"|"+jsonCommand.command+"|"+(new Date().getTime() - start)+"ms|Sent");
};

// adding the object to global namespace
var __thisWindowProxy__ = new __ThisWindowProxy__(); 

/**
 * Abstraction layer for logging pourposes
 */
var __log__ = {};
__log__.debug = function(message) { __thisWindow__.logDebug(sourceFile_()+"|"+message); };
__log__.info  = function(message) { __thisWindow__.logInfo(sourceFile_()+"|"+message); };
__log__.warn  = function(message) { __thisWindow__.logWarn(sourceFile_()+"|"+message); };
__log__.error = function(message) { __thisWindow__.logError(sourceFile_()+"|"+message); };