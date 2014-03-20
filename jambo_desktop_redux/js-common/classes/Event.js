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

function Event(json) {
    $.extend(this, json);
}

Event.type = {
        startupNotification                                 : "startupNotification",
        startupLicenseNotification                          : "startupLicenseNotification",
        coreSettingsNotification                            : "coreSettingsNotification",
        applicationSettingsNotification                     : "applicationSettingsNotification",
        softwareUpdateNotification                          : "softwareUpdateNotification", 
        softwareUpdateProgress                              : "softwareUpdateProgress",
        externalCommandLineNotification                     : "externalCommandLineNotification",
        systemError                                         : "systemError",
        systemWarning                                       : "systemWarning",
        provisioningError                                   : "provisioningError",
        authenticationNotification                          : "authenticationNotification",
        callNotification                                    : "callNotification",
        endpointNotification                                : "endpointNotification",
        applicationNotification                             : "applicationNotification",
        syncRecordedCallsNotification                       : "syncRecordedCallsNotification",
        recordedCallNotification                            : "recordedCallNotification",
        deletedRecordedCallsNotification                    : "deletedRecordedCallsNotification", 
        recordingCallNotification                           : "recordingCallNotification",
        playbackRecordedCallNotification                    : "playbackRecordedCallNotification",
        transcodingRecordedCallNotification                 : "transcodingRecordedCallNotification",
        syncContactsNotification                            : "syncContactNotification",
        contactNotification                                 : "contactNotification",
        syncHistoryNotification                             : "syncHistoryNotification",
        historyEntryNotification                            : "historyEntryNotification",
        deletedHistoryNotification                          : "deletedHistoryNotification",
        onInstantMsgReceived                                : "onInstantMsgReceived",
        micSignalPowerNotification                          : "micSignalPowerNotification",
        micLevelNotification                                : "micLevelNotification",
        speakerLevelNotification                            : "speakerLevelNotification",
        audioConferencePlaybackDeviceMutedNotification      : "audioConferencePlaybackDeviceMutedNotification",
        audioNotificationPlaybackDeviceLevelNotification    : "audioNotificationPlaybackDeviceLevelNotification",
        audioNotificationPlaybackDeviceMutedNotification    : "audioNotificationPlaybackDeviceMutedNotification", 
        audioCaptureDevicesChangedNotification              : "audioCaptureDevicesChangedNotification",
        audioCaptureDevicesMutedNotification                : "audioCaptureDevicesMutedNotification",
        audioPlaybackDevicesChangedNotification             : "audioPlaybackDevicesChangedNotification",
        videoDevicesChangedNotification                     : "videoDevicesChangedNotification",
        flasherDevicesChangedNotification                   : "flasherDevicesChangedNotification",
        presEntryNotification                               : "presEntryNotification",
        presentationNotification                            : "presentationNotification",
        callOnHoldNotification                              : "callOnHoldNotification",
        onRedirectRequest                                   : "onRedirectRequest",
        micMutedNotification                                : "micMutedNotification",
        speakerMutedNotification                            : "speakerMutedNotification",
        cameraPrivacyModeNotification                       : "cameraPrivacyModeNotification",
        mediaEncryptionNotification                         : "mediaEncryptionNotification",
        //transitNotification                                 : "transitNotification",
        onRawEvent                                          : "onRawEvent",
        conferenceNotification                              : "conferenceNotification"
};

Event.startupNotificationError = {
        alreadyRunning : "alreadyRunning"
};

Event.recordingCallNotificationStatus = {
        STARTED : "STARTED",
        STOPPED : "STOPPED"  
};

Event.playbackRecordedCallNotificationStatus = {
        STARTED     : "STARTED",
        STOPPED     : "STOPPED",
        COMPLETED   : "COMPLETED" 
};

Event.transcodingRecordedCallNotificationStatus = {
        STARTED     : "STARTED",
        STOPPED     : "STOPPED",
        COMPLETED   : "COMPLETED"
};

Event.softwareUpdateProgressStatus = {
        STARTED : "STARTED",
        DOWNLOAD_COMPLETED : "DOWNLOAD_COMPLETED",
        FAILED : "FAILED",
        IN_PROGRESS : "IN_PROGRESS",
        STOPPED_BY_USER : "STOPPED_BY_USER"  
};

Event.coreSettingsNotification = {
        missing_mandatory_configuration : "missing_mandatory_configuration",
        available : "available",
        updated : "updated"
};

Event.applicationSettingsNotification = {
        updated : "updated"
};

Event.endpointNotificationEndpoint = {
        sip     : "sip",
        h323    : "h323",
        rtsp    : "rtsp"
};

Event.endpointNotificationType = {
        STATUS_NOTREGISTERED        : "STATUS_NOTREGISTERED",
        STATUS_REGISTERING          : "STATUS_REGISTERING",
        STATUS_REGISTERED           : "STATUS_REGISTERED",
        STATUS_DISCOVERED           : "STATUS_DISCOVERED",
        STATUS_OK_NO_GK             : "STATUS_OK_NO_GK",
        STATUS_UNREGISTERING        : "STATUS_UNREGISTERING",
        FINAL_REGISTRATION_FAILURE  : "FINAL_REGISTRATION_FAILURE",
        UNINIT                      : "UNINIT",
        UNKNOWN                     : "UNKNOWN"
};

Event.endpointNotificationSubtype = {
        MCS_ADMIN               : "MCS_ADMIN",
        MCS_SEIZED              : "MCS_SEIZED",
        MCS_SERVER_SHUTDOWN     : "MCS_SERVER_SHUTDOWN",
        REGISTRATION_REFRESHED  : "REGISTRATION_REFRESHED"
};

Event.authenticationNotification = {
        credentialNotValid          : "credentialNotValid",
        invalidServerVersion        : "invalidServerVersion",
        invalidServerPlatform       : "invalidServerPlatform",
        serverConnectionFailure     : "serverConnectionFailure",
        unreachableDNS              : "unreachableDNS",
        networkFailure              : "networkFailure",
        authenticationSuccessful    : "authenticationSuccessful",
        missingUsernameParameter    : "missingUsernameParameter",
        wrongUsernameParameter      : "wrongUsernameParameter",
        missingPasswordParameter    : "missingPasswordParameter",
        wrongPasswordParameter      : "wrongPasswordParameter",
        missingAuthTypeParameter    : "missingAuthTypeParameter",
        wrongAuthTypeParameter      : "wrongAuthTypeParameter",
        missingServerParameter      : "missingServerParameter",
        wrongServerParameter        : "wrongServerParameter",
        genericError                : "genericError"
};

Event.authenticationNotificationRequiredAuthType = {
        sip         : "sip",
        mcs         : "mcs",
        clearsea    : "clearsea"
};

Event.contactNotificationType = {
        created : "created",
        updated : "updated",
        deleted : "deleted"
};

Event.recordedCallNotificationType = {
        created : "created",
        updated : "updated",
        deleted : "deleted"
};

Event.historyEntryNotificationType = {
        created : "created",
        updated : "updated",
        deleted : "deleted"
};

Event.presEntryNotificationType = {
        created : "created",
        updated : "updated",
        deleted : "deleted"         
};

Event.presentationNotificationStatus = {
        STARTED : "STARTED",
        STOPPED : "STOPPED"      
};

Event.historyEntryNotification = {};

Event.startupLicenseNotification = {
        loadSuccessful  : "loadSuccessful",
        notFound        : "notFound",
        notValid        : "notValid",
        expired         : "expired",
        unsupported     : "unsupported",
        banned          : "banned",
        invalidPlatform : "invalidPlatform",
        errorCreatingPath	: "errorCreatingPath"
};

Event.provisioningErrorError = {
		unlicensedPlatform 		: "unlicensedPlatform",
		missingServerSDKLicense : "missingServerSDKLicense",
		serverConnectionFailure : "serverConnectionFailure"
};

Event.systemErrorError = {
        unreachableDNS      :"unreachableDNS",
        networkFailure      :"networkFailure",
        unsupportedDirectX  :"unsupportedDirectX",
        unsupportedCPU      :"unsupportedCPU",
        unlicensedDevice    :"unlicensedDevice",
        unsupportedOS       :"unsupportedOS",
        generic             :"generic"
};

Event.systemWarningWarning = {
        unsupportedDevice       :"unsupportedDevice",
        audioCaptureFailure     :"audioCaptureFailure",
        audioPlaybackFailure    :"audioPlaybackFailure",
        audioNotificationFailure	:"audioNotificationFailure",
        videoCaptureFailure     :"videoCaptureFailure",
        lastStartupFailure      :"lastStartupFailure"
};

Event.applicationNotification = {
        requestUserSettings : "requestUserSettings",
        initCompleted       : "initCompleted",
        quitting            : "quitting",
        hidden              : "hidden",
        shown               : "shown",
        videoComposerAvailale : "videoComposerAvailable"
};

Event.callNotificationType = {
        STATE_DIALTONE          : "STATE_DIALTONE", // from now the line is occupied (outbound call)
        STATE_INCOMING          : "STATE_INCOMING", // from now the line is occupied (inbound call)
        STATE_REMOTE_RINGING    : "STATE_REMOTE_RINGING",
        STATE_LOCAL_RINGING     : "STATE_LOCAL_RINGING",
        STATE_EARLYMEDIA        : "STATE_EARLYMEDIA",
        STATE_CONNECTED         : "STATE_CONNECTED",
        STATE_DISCONNECTED      : "STATE_DISCONNECTED",
        STATE_TERMINATED        : "STATE_TERMINATED", // from now the line is available
        TRANSFERRING_LOCAL      : "TRANSFERRING_LOCAL",
        TRANSFERRING_REMOTE     : "TRANSFERRING_REMOTE",
        LICENSE_DUP             : "LICENSE_DUP",
        AUDIO_RX                : "AUDIO_RX",
        AUDIO_RX_END            : "AUDIO_RX_END",
        AUDIO_TX                : "AUDIO_TX",
        AUDIO_TX_PAUSED         : "AUDIO_TX_PAUSED",
        AUDIO_TX_END            : "AUDIO_TX_END",
        VIDEO_RX                : "VIDEO_RX",
        VIDEO_RX_END            : "VIDEO_RX_END",
        VIDEO_TX                : "VIDEO_TX",
        VIDEO_TX_PAUSED         : "VIDEO_TX_PAUSED",
        VIDEO_TX_END            : "VIDEO_TX_END",
        VIDEO_H239_RX           : "VIDEO_H239_RX",
        VIDEO_H239_RX_END       : "VIDEO_H239_RX_END",
        VIDEO_H239_TX           : "VIDEO_H239_TX",
        VIDEO_H239_TX_PAUSED    : "VIDEO_H239_TX_PAUSED",
        VIDEO_H239_TX_END       : "VIDEO_H239_TX_END",
        DATA_TX                 : "DATA_TX",
        DATA_TX_END             : "DATA_TX_END",
        DATA_RX                 : "DATA_RX",
        DATA_RX_END             : "DATA_RX_END",
        MEDIA_RX_TIMEOUT        : "MEDIA_RX_TIMEOUT"
};

Event.callNotificationSubtype = {
        "undefined"                                 : "undefined",
        DISCONNECTED_BUSY                           : "DISCONNECTED_BUSY",
        DISCONNECTED_NORMAL                         : "DISCONNECTED_NORMAL",
        DISCONNECTED_REJECT                         : "DISCONNECTED_REJECT",
        DISCONNECTED_UNREACHABLE                    : "DISCONNECTED_UNREACHABLE",
        DISCONNECTED_UNKNOWN                        : "DISCONNECTED_UNKNOWN",
        DISCONNECTED_LOCAL                          : "DISCONNECTED_LOCAL",
        DISCONNECTED_INCOMPLETEADDRESS              : "DISCONNECTED_INCOMPLETEADDRESS",
        DISCONNECTED_UNANSWERED                     : "DISCONNECTED_UNANSWERED",
        DISCONNECTED_UNAUTHORIZED                   : "DISCONNECTED_UNAUTHORIZED",
        DISCONNECTED_MEDIA_ENCRYPTION_REQUIRED      : "DISCONNECTED_MEDIA_ENCRYPTION_REQUIRED", // We require media encryption but the remote endpoint doesn't support it.
        DISCONNECTED_UNSUPPORTED_MEDIA              : "DISCONNECTED_UNSUPPORTED_MEDIA",  // Remote party doesn't support our media.
        TRANSFERRING_NOTRANSFER                     : "TRANSFERRING_NOTRANSFER", // No transfer in progress.
        REDIRECTING                                 : "REDIRECTING", // Redirect (transfer) proceeding.
        TRANSFERRING_PROCEEDING                     : "TRANSFERRING_PROCEEDING", // Transfer proceeding.
        TRANSFERRING_RINGBACK                       : "TRANSFERRING_RINGBACK", // Transfer destination ringback.
        TRANSFERRING_CONNECTED                      : "TRANSFERRING_CONNECTED", // Transfer destination connected (final).
        TRANSFERRING_FAILED                         : "TRANSFERRING_FAILED", // Transfer failed (final).
        TERMINATED_WAS_NOT_REGISTERED_TO_MCS        : "TERMINATED_WAS_NOT_REGISTERED_TO_MCS",
        DISCONNECTED_UNREACHABLE_MEDIA_ENCRYPTION   : "DISCONNECTED_UNREACHABLE_MEDIA_ENCRYPTION" // Same as CALL_EVENT_DETAIL_DISCONNECTED_UNREACHABLE but we required media encryption.
};

Event.mediaEncryptionNotificationDirection = {
        TX : "TX",
        RX : "RX"
};

Event.mediaEncryptionNotificationMedium = {
        AUDIO       : "AUDIO",
        VIDEO       : "VIDEO",
        VIDEO_H239  : "VIDEO_H239",
        DATA        : "DATA"
};

Event.mediaEncryptionNotificationEncryptionSuite = {
        NONE                        : "NONE",
        AES_CM_128_HMAC_SHA1_80     : "AES_CM_128_HMAC_SHA1_80",
        AES_CM_128_HMAC_SHA1_32     : "AES_CM_128_HMAC_SHA1_32",
        F8_128_HMAC_SHA1_80         : "F8_128_HMAC_SHA1_80",
        SEED_CTR_128_HMAC_SHA1_80   : "SEED_CTR_128_HMAC_SHA1_80",
        SEED_128_CCM_80             : "SEED_128_CCM_80",
        SEED_128_GCM_96             : "SEED_128_GCM_96",
        AES_192_CM_HMAC_SHA1_80     : "AES_192_CM_HMAC_SHA1_80",
        AES_192_CM_HMAC_SHA1_32     : "AES_192_CM_HMAC_SHA1_32",
        AES_256_CM_HMAC_SHA1_80     : "AES_256_CM_HMAC_SHA1_80",
        AES_256_CM_HMAC_SHA1_32     : "AES_256_CM_HMAC_SHA1_32",
        AES_CBC_128                 : "AES_CBC_128",
        AES_CBC_192                 : "AES_CBC_192",
        AES_CBC_256                 : "AES_CBC_256"
};
/*
Event.transitNotificationState = {
		NOT_RUNNING 	: "NOT_RUNNING",
		UDP_CONNECTED 	: "UDP_CONNECTED",
		CONNECTING 		: "CONNECTING",
		CONNECTED 		: "CONNECTED",
		FAILED 			: "FAILED",
		NO_STATE_CHANGE	: "NO_STATE_CHANGE",
		STARTED         : "STARTED",
		STOPPED         : "STOPPED"
};

Event.transitNotificationSubstate = {
		NO_FAILURE 							: "NO_FAILURE",
		TCP_CONNECTION_LOST 				: "TCP_CONNECTION_LOST",
		TCP_BIND_FAILED 					: "TCP_BIND_FAILED",
		KEEP_ALIVE_MISSING 					: "KEEP_ALIVE_MISSING",
		AUTH_DATA_MISSING 					: "AUTH_DATA_MISSING",
		AUTH_REJECT 						: "AUTH_REJECT",
		UNEXPECTED_AUTH_RESP 				: "UNEXPECTED_AUTH_RESP",
		UNEXPECTED_AUTH_RESP_PROXY 			: "UNEXPECTED_AUTH_RESP_PROXY",
		UNSUPPORTED_PROXY_AUTH_REQUESTED	: "UNSUPPORTED_PROXY_AUTH_REQUESTED",
		NOT_CONNECTED 						: "NOT_CONNECTED",
		HTTPS_FAILED 						: "HTTPS_FAILED",
		HTTP_PROXY_CONNECT_FAILED 			: "HTTP_PROXY_CONNECT_FAILED",
		HTTP_PROXY_AUTH_DATA_MISSING 		: "HTTP_PROXY_AUTH_DATA_MISSING",
		HTTP_PROXY_SERVICE_UNAVAILABLE 		: "HTTP_PROXY_SERVICE_UNAVAILABLE",
		HTTP_PROXY_BAD_REQUEST 				: "HTTP_PROXY_BAD_REQUEST",
		HTTP_PROXY_METHOD_NOT_ALLOWED 		: "HTTP_PROXY_METHOD_NOT_ALLOWED",
		CONFIG_UPDATED 						: "CONFIG_UPDATED",
		DISABLED_BY_SIGNALLING_SERVER 		: "DISABLED_BY_SIGNALLING_SERVER",
		SIP_PORT_UNAVAILABLE 				: "SIP_PORT_UNAVAILABLE",
		BAD_SERVER_ADDRESS 					: "BAD_SERVER_ADDRESS",
		STUN_FAILED 						: "STUN_FAILED",
		HTTP_PROXY_BAD_ADDRESS 				: "HTTP_PROXY_BAD_ADDRESS",
		INVALID_CERTIFICATE 				: "INVALID_CERTIFICATE",
		INTERFACE_DOWN 						: "INTERFACE_DOWN",
		UNRESOLVABLE_SERVER_ADDR 			: "UNRESOLVABLE_SERVER_ADDR",
		FIREWALL_DETECTION_COMPLETE 		: "FIREWALL_DETECTION_COMPLETE",
		FIREWALL_DETECTION_COMPLETE 		: "FIREWALL_DETECTION_COMPLETE"
};

Event.transitNotificationFirewallType = {
		UDP_BLOCKED 			: "UDP_BLOCKED",
		OPEN_INTERNET 			: "OPEN_INTERNET",
		SYMMETRIC_UDP_FIREWALL	: "SYMMETRIC_UDP_FIREWALL",
		FULL_CONE_NAT 			: "FULL_CONE_NAT",
		SYMMETRIC_NAT 			: "SYMMETRIC_NAT",
		RESTRICTED_NAT 			: "RESTRICTED_NAT",
		PORT_RESTRICTED_NAT 	: "PORT_RESTRICTED_NAT",
		UNKNOWN 				: "UNKNOWN"
};
*/