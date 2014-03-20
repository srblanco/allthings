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

function __IndexCoreListener__() {
    __CoreListener__.call(this);
}
__IndexCoreListener__.prototype = new __CoreListener__();

//@Override
__IndexCoreListener__.prototype.processResponse = function(response) {
    switch (response.command) {
        case (Command.type.getAppInfo)              : this.onGetAppInfoResponse(response); break;
        //case (Command.type.getLicenseInfo)          : this.onGetLicenseInfoResponse(response); break;
        //case (Command.type.performUpdate)           : this.onPerformUpdateResponse(response); break;
        default:
            __log__.debug(__APP_ID__+"|RES|"+response.seqN+"|"+response.appID+"|"+response.command+"|Unhandled response");
            break;
    }
};

// @Override
__IndexCoreListener__.prototype.processEvent = function(event) {
    switch (event.event) {
        case (Event.type.startupLicenseNotification)            : this.onStartupLicenseNotificationEvent(event); break;
        case (Event.type.coreSettingsNotification)              : this.onCoreSettingsNotification(event); break;
        case (Event.type.applicationSettingsNotification)       : this.onApplicationSettingsNotification(event); break;
        case (Event.type.softwareUpdateNotification)            : this.onSoftwareUpdateNotification(event); break;
        case (Event.type.softwareUpdateProgress)                : this.onSoftwareUpdateProgress(event); break;
        case (Event.type.applicationNotification)               : this.onApplicationNotification(event); break;
        case (Event.type.callNotification)                      : this.onCallNotification(event); break;
        case (Event.type.callOnHoldNotification)                : this.onCallNotification(event); break;
        case (Event.type.onRedirectRequest)                     : this.onCallNotification(event); break;
        case (Event.type.endpointNotification)                  : this.onEndpointNotification(event); break;
        case (Event.type.contactNotification)                   : this.onContactNotification(event); break;
        /*case (Event.type.historyEntryNotification)              : this.onHistoryEntryNotification(event); break;
        case (Event.type.deletedHistoryNotification)            : this.onDeletedHistoryNotification(event); break;*/
        case (Event.type.onInstantMsgReceived)                  : this.onInstantMsgReceived(event); break;//PNG-186 KTRUMBLE 10302012 - Add P2PChat
        case (Event.type.authenticationNotification)            : this.onAuthenticationNotification(event); break;
        /*case (Event.type.recordingCallNotification)             : this.onRecordingCallNotification(event); break;*/
        case (Event.type.presentationNotification)              : this.onPresentationNotification(event); break;
        case (Event.type.micMutedNotification)                  : this.onMicMutedNotification(event); break;
        //case (Event.type.speakerMutedNotification)              : this.onSpeakerMutedNotification(event); break;
        case (Event.type.cameraPrivacyModeNotification)         : this.onCameraPrivacyModeNotification(event); break;
        case (Event.type.externalCommandLineNotification)       : this.onExternalCommandLineNotification(event); break;
        /*case (Event.type.provisioningError)   				    : this.onProvisioningError(event); break;
        case (Event.type.transcodingRecordedCallNotification)   : this.onTranscodingRecordedCallNotification(event); break;*/
        case (Event.type.systemError)                           : this.onSystemError(event); break;
        case (Event.type.systemWarning)                         : this.onSystemWarning(event); break;
        //WKRASKO from settings - In our case, we'll be doing all settings within main window
        case (Event.type.speakerLevelNotification)                          : this.speakerLevelNotification(event); break;
        case (Event.type.micLevelNotification)                              : this.micLevelNotification(event); break;
        case (Event.type.audioCaptureDevicesChangedNotification)            : this.audioCaptureDevicesChangedNotification(event); break;
        case (Event.type.audioPlaybackDevicesChangedNotification)           : this.audioPlaybackDevicesChangedNotification(event); break;
        case (Event.type.videoDevicesChangedNotification)                   : this.videoDevicesChangedNotification(event); break;
        case (Event.type.flasherDevicesChangedNotification)                 : this.flasherDevicesChangedNotification(event); break;
        //End Settings events
        default:
            __log__.debug(__APP_ID__+"|EVT|"+event.seqN+"|"+event.event+"|Unhandled event");
            break;
    }
};

// response callbacks
__IndexCoreListener__.prototype.onGetAppInfoResponse = function(response) {
    onGetAppInfo(response.result); 
};

__IndexCoreListener__.prototype.onGetApplicationSettingsResponse = function(response) {
	onGetApplicationSettings(response.result);
};

__IndexCoreListener__.prototype.onSetApplicationSettingsResponse = function(response) {
    if (response.result.returnValue) {
    	__log__.debug("Application settings saved successfully");
    } else {
    	__log__.error("Application settings not saved");
    }
};

__IndexCoreListener__.prototype.onGetLicenseInfoResponse = function(response) {
    onGetLicenseInfo(response.result); 
};

__IndexCoreListener__.prototype.onEndpointNotification = function(event) {
    if (!isDefined(event.details.endpoint)) {
        __log__.error("'endpoint' parameter is undefined, can't parse event");
        return undefined;
    }
    if (!isDefined(event.details.type)) {
        __log__.error("'type' parameter is undefined, can't parse event");
        return undefined;
    }
    switch (event.details.endpoint) {
        case (Event.endpointNotificationEndpoint.sip):
            switch (event.details.type) {
                case Event.endpointNotificationType.STATUS_UNREGISTERING:
                case Event.endpointNotificationType.STATUS_REGISTERING:
                    setAuthenticatedUserConnecting();
                    break;               
                case Event.endpointNotificationType.UNINIT:
                case Event.endpointNotificationType.FINAL_REGISTRATION_FAILURE:
                    setAuthenticatedUserUnavailable();
                    break;
                case Event.endpointNotificationType.STATUS_REGISTERED:
                    if (!isDefined(event.details.subtype) || (event.details.subtype != Event.endpointNotificationSubtype.REGISTRATION_REFRESHED)) {
                        setAuthenticatedUserAvailable();
                    }
                    break;
                case Event.endpointNotificationType.STATUS_NOTREGISTERED:
                    if (isDefined(event.details.subtype)) {
                        switch(event.details.subtype) {
                            case Event.endpointNotificationSubtype.MCS_ADMIN:
                            case Event.endpointNotificationSubtype.MCS_SEIZED:
                                serverForcedQuit(event.details.subtype);
                            case Event.endpointNotificationSubtype.MCS_SERVER_SHUTDOWN:
                                setAuthenticatedUserUnavailable(event.details.subtype);
                                break;                            
                        }
                    } else {
                        setAuthenticatedUserUnavailable();
                    }
                    //break;
                default:
                    __log__.error("'type' parameter has an unsupported value ["+event.details.type+"], can't parse event");
                    break;
            }
            break;
        case (Event.endpointNotificationEndpoint.h323):
            //break;
        case (Event.endpointNotificationEndpoint.rtsp):
            //break;
        default:
            __log__.error("'endpoint' parameter has an unsupported value ["+event.details.endpoint+"], can't parse event");
            break;
    }
    processEndpointNotification(event.details.endpoint, event.details.type, event.details.subtype, event.details.server);
};

// event callbacks
__IndexCoreListener__.prototype.onStartupLicenseNotificationEvent = function(event) {
    if (!isDefined(event.details.notification)) {
        __log__.error("'notification' parameter is undefined, can't parse event");
        return undefined;
    }
    switch (event.details.notification) {
        case (Event.startupLicenseNotification.loadSuccessful)  : 
            __thisWindowProxy__.getLicenseInfo(bind(window, function(response){
                onGetLicenseInfo(response.result);
            })); 
        break;
        case (Event.startupLicenseNotification.notFound)        : showLicenseFileSelector("License not found"); break;
        case (Event.startupLicenseNotification.notValid)        : showLicenseFileSelector("License not valid"); break;
        case (Event.startupLicenseNotification.expired)         : showLicenseFileSelector("License expired"); break;
        case (Event.startupLicenseNotification.unsupported)     : showLicenseFileSelector("License unsupported"); break;
        case (Event.startupLicenseNotification.banned)          : showLicenseFileSelector("License banned"); break;
        case (Event.startupLicenseNotification.invalidPlatform) : showLicenseFileSelector("License not valid for this platform"); break;
        case (Event.startupLicenseNotification.errorCreatingPath)	: 
            showLicenseFileSelector(event.details.notification); 
            break;
        default:
            __log__.error("'notification' parameter has an unsupported value ["+event.details.notification+"], can't parse event");
            break;
    }
};

__IndexCoreListener__.prototype.onApplicationSettingsNotification = function(event) {
    if (!isDefined(event.details.notification)) {
        __log__.error("'notification' parameter is undefined, can't parse event");
        return undefined;
    }
    switch (event.details.notification) {
        case (Event.applicationSettingsNotification.updated) : onUpdatedApplicationSettings(); break;
        default:
            __log__.error("'notification' parameter has an unsupported value ["+event.details.notification+"], can't parse event");
            break;
    }
};

__IndexCoreListener__.prototype.onCoreSettingsNotification = function(event) {
    if (!isDefined(event.details.notification)) {
        __log__.error("'notification' parameter is undefined, can't parse event");
        return undefined;
    }
    switch (event.details.notification) {
        case (Event.coreSettingsNotification.available)                         : break;
        case (Event.coreSettingsNotification.missing_mandatory_configuration)   : onMissingMandatoryConfiguration(); break;
        case (Event.coreSettingsNotification.updated)                           : onUpdatedCoreSettings(); break;
        default:
            __log__.error("'notification' parameter has an unsupported value ["+event.details.notification+"], can't parse event");
            break;
    }
};

__IndexCoreListener__.prototype.onAuthenticationNotification = function(event) {
    if (!isDefined(event.details.notification)) {
        __log__.error("'notification' parameter is undefined, can't parse event");
        return undefined;
    }
    
    switch (event.details.notification) {
	    case (Event.authenticationNotification.authenticationSuccessful) :
	        serverAuthorizationSuccessful(event.details.authenticatedContact);
	        break;
	    case (Event.authenticationNotification.credentialNotValid)       :
	    case (Event.authenticationNotification.invalidServerVersion)     :
	    case (Event.authenticationNotification.invalidServerPlatform)    :
	    case (Event.authenticationNotification.serverConnectionFailure)  :
	    case (Event.authenticationNotification.unreachableDNS)           :
	    case (Event.authenticationNotification.networkFailure)           :
	        serverAuthorizationRequest(event.details.notification, event.details.requiredAuthType, event.details.isServerRequired, event.details.realm);
	        break;
	    default:                    
	        __log__.error("'notification' parameter has an unsupported value ["+event.details.notification+"], can't parse event");
	        break;
    }
};

__IndexCoreListener__.prototype.onApplicationNotification = function(event) {
    if (!isDefined(event.details.notification)) {
        __log__.error("'notification' parameter is undefined, can't parse event");
        return undefined;
    }
    switch (event.details.notification) {
        case (Event.applicationNotification.initCompleted)       : initialized(); break;
        case (Event.applicationNotification.requestUserSettings) : requestedUserSettings(); break;
        case (Event.applicationNotification.videoComposerAvailale) : composerReady = true; break;
        case (Event.applicationNotification.quitting)            : break;
        case (Event.applicationNotification.hidden)              : break;
        case (Event.applicationNotification.shown)               : break;
        default:
            __log__.error("'notification' parameter has an unsupported value ["+event.details.notification+"], can't parse event");
            break;
    }
};

__IndexCoreListener__.prototype.onSoftwareUpdateNotification = function(event) {
    showSoftwareUpdate(event.details);
};

__IndexCoreListener__.prototype.onSoftwareUpdateProgress = function(event) {
    if (!isDefined(event.details.status)) {
        __log__.error("'status' parameter is undefined, can't parse event");
        return undefined;
    }
    softwareUpdateProgress(event.details.status, event.details.downloaded, event.details.total);
};

__IndexCoreListener__.prototype.onContactNotification = function(event) {
    if (!isDefined(event.details.type)) {
        __log__.error("'type' parameter is undefined, can't parse event");
        return undefined;
    }
    switch (event.details.type) {
        case Event.contactNotificationType.created: 
        case Event.contactNotificationType.deleted:
        case Event.contactNotificationType.updated: 
            reloadContactsWithChanges({
                type : event.details.type,
                id : event.details.id,
                contact : event.details.contact
            });
            break;
        default:
            __log__.error("'type' parameter has an unsupported value ["+event.details.type+"], can't parse event");
            break;
    }
};

__IndexCoreListener__.prototype.onHistoryEntryNotification = function(event) {
    if (!isDefined(event.details.type)) {
        __log__.error("'type' parameter is undefined, can't parse event");
        return undefined;
    }
    switch (event.details.type) {
        case Event.historyEntryNotificationType.created: 
        case Event.historyEntryNotificationType.deleted:
        case Event.historyEntryNotificationType.updated: 
            reloadHistoryWithChanges(
                    {
                        type : event.details.type,
                        id : event.details.id,
                        historyEntry : event.details.historyEntry
                    });
            break;
        default:
            __log__.error("'type' parameter has an unsupported value ["+event.details.type+"], can't parse event");
            break;
    }
};

__IndexCoreListener__.prototype.onDeletedHistoryNotification = function(event) {
 	syncHistory();
};

__IndexCoreListener__.prototype.onRecordingCallNotification = function(event) {
    if (!isDefined(event.details.lineNum)) {
        __log__.error("'lineNum' parameter is undefined, can't parse event");
        return undefined;
    }
    if (!isDefined(event.details.status)) {
        __log__.error("'status' parameter is undefined, can't parse event");
        return undefined;
    }
    if (isDefined(event.details.errorMsg)) {
        __log__.error("Error on recording call notification ["+event.details.lineNum+"|"+event.details.status+"|"+event.details.errorMsg+"]");
    }
    var lineNum = event.details.lineNum;
    var line = lineRepository.getLine(lineNum);
    switch (event.details.status) {
    	case Event.recordingCallNotificationStatus.STARTED:
    		line.call.recording = true;
    		break;
        case Event.recordingCallNotificationStatus.STOPPED:
            line.call.recording = false;
            break;
    	default:
    		break;
    }
    onLineUpdated(lineNum); 
};

__IndexCoreListener__.prototype.onPresentationNotification = function(event) {
    lineRepository.handlePresentationNotification(event, function(lineNum, status, presEntryID){
        presentationNotification();
    });
};

__IndexCoreListener__.prototype.onMicMutedNotification = function(event) {
    lineRepository.handleMicMutedNotification(event,micChecker);   
};

__IndexCoreListener__.prototype.onSpeakerMutedNotification = function(event) {
    lineRepository.handleSpeakerMutedNotification(event);    
};

__IndexCoreListener__.prototype.onCameraPrivacyModeNotification = function(event) {
    lineRepository.handleCameraPrivacyModeNotification(event,cameraPrivacyChecker); 
};

__IndexCoreListener__.prototype.onExternalCommandLineNotification = function(event) {
    if (!isDefined(event.details.commandLine)) {
        __log__.error("'commandLine' parameter is undefined, can't parse event");
        return undefined;
    }
    processCommandLine(event.details.commandLine);
};

__IndexCoreListener__.prototype.onProvisioningError = function(event) {
    if (!isDefined(event.details.error)) {
        __log__.error("'error' parameter is undefined, can't parse event");
        return undefined;
    }
    processProvisioningError(event.details.error);
};

__IndexCoreListener__.prototype.onSystemError = function(event) {
    console.info(event);
    if (!isDefined(event.details.error)) {
        __log__.error("'error' parameter is undefined, can't parse event");
        return undefined;
    }
    processSystemError(event.details.error);
};

__IndexCoreListener__.prototype.onSystemWarning = function(event) {
    console.info(event);
    if (!isDefined(event.details.warning)) {
        __log__.error("'warning' parameter is undefined, can't parse event");
        return undefined;
    }
    processSystemWarning(event.details.warning);
};

__IndexCoreListener__.prototype.onTransitNotification = function(event) {
    //transit.handleTransitNotification(event, onTransitUpdated);
};

__IndexCoreListener__.prototype.onConferenceNotification = function(event) {
//    console.info(JSON.stringify(event, undefined, 2));
    conferenceRepository.handleConferenceNotification(event, onConferenceUpdated);
};

__IndexCoreListener__.prototype.onCallNotification = function(event) {
    lineRepository.handleCallNotification(event, onLineUpdated);
};

__IndexCoreListener__.prototype.onInstantMsgReceived= function(event) {
    handleInstantMsg(event.details);
};

__IndexCoreListener__.prototype.onTranscodingRecordedCallNotification = function(event) {
    if (!isDefined(event.details.id)) {
        __log__.error("'id' parameter is undefined, can't parse event");
        return undefined;
    }
    switch (event.details.status) {
        case Event.transcodingRecordedCallNotificationStatus.STARTED: break;
        case Event.transcodingRecordedCallNotificationStatus.COMPLETED:
        case Event.transcodingRecordedCallNotificationStatus.STOPPED:
            transcodingFinished(event.details.id, event.details.errorMsg, event.details.status);
            break;
        default:
            __log__.error("'status' parameter has an unsupported value ["+event.details.type+"], can't parse event");
            break;
    }
};

//WKRASKO - Adding settings stuff, we do all settings within main window
__IndexCoreListener__.prototype.speakerLevelNotification = function(event) {
     if (!isDefined(event.details.level)) {
        __log__.error("'level' parameter is undefined, can't parse event");
        return undefined;
    }
    updateSpeakerLevelNotification(event.details.level);
};

__IndexCoreListener__.prototype.micLevelNotification = function(event) {
    if (!isDefined(event.details.level)) {
        __log__.error("'level' parameter is undefined, can't parse event");
        return undefined;
    }
    updateMicLevel(event.details.level);
};

__IndexCoreListener__.prototype.audioCaptureDevicesChangedNotification = function(event) {
    updateAudioCaptureDevices();
};

__IndexCoreListener__.prototype.audioPlaybackDevicesChangedNotification = function(event) {
    updateAudioPlaybackDevices();
    updateNotificationDevices(); // forcing notification devices update due to lacking specific notification event
};

__IndexCoreListener__.prototype.videoDevicesChangedNotification = function(event) {
    updateVideoDevices();
};

__IndexCoreListener__.prototype.flasherDevicesChangedNotification = function(event) {
    if(typeof updateFlasherDevices === 'function')
        updateFlasherDevices();
};
//END settings stuff.

var __coreListener__ = new __IndexCoreListener__();