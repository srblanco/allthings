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

function Command(json) {
    $.extend(this, json);
}

Command.type = {
        // app
        getAppInfo              : "getAppInfo",
        getLicenseInfo          : "getLicenseInfo",
        skipUpdate              : "skipUpdate",
        performUpdate           : "performUpdate",
        stopUpdate              : "stopUpdate",
        replaceLicense          : "replaceLicense",
        performAuthentication   : "performAuthentication",
        quit                    : "quit",
        logout                  : "logout",
        // call
        makeCall                    : "makeCall",
        dropCall                    : "dropCall",
        answerCall                  : "answerCall",
        getRemotePartyInfo          : "getRemotePartyInfo",
        getCallInfo                 : "getCallInfo",
        setCallOnHold               : "setCallOnHold",
        getSoftphoneInfo            : "getSoftphoneInfo",
        setCameraPrivacyMode        : "setCameraPrivacyMode",
        setMicMuted                 : "setMicMuted",
        setSpeakerMuted             : "setSpeakerMuted",
        sendDTMF                    : "sendDTMF",//PNG-471 KTRUMBLE 10052012 - incall dialer
        // chat
        sendInstantMsg      : "sendInstantMsg",
        getChatHistory      : "getChatHistory",
        // contact
        syncContacts        : "syncContacts",
        getContacts         : "getContacts",
        saveContact         : "saveContact",
        getContact          : "getContact",
        getContactByUri     : "getContactByUri",
        deleteContact       : "deleteContact",
        searchServerContacts: "searchServerContacts",
        // history
        syncHistory         : "syncHistory",
        getHistory          : "getHistory",
        getHistoryEntry     : "getHistoryEntry",
        deleteHistoryEntry  : "deleteHistoryEntry",
        deleteHistory       : "deleteHistory",
        // contact
        syncRecordedCalls               : "syncRecordedCalls",
        getRecordedCalls                : "getRecordedCalls",
        saveRecordedCall                : "saveRecordedCall",
        getRecordedCall                 : "getRecordedCall",
        deleteRecordedCall              : "deleteRecordedCall",
        deleteRecordedCalls             : "deleteRecordedCalls",
        startRecordingCall              : "startRecordingCall",
        stopRecordingCall               : "stopRecordingCall",
        startPlaybackRecordedCall       : "startPlaybackRecordedCall",
        stopPlaybackRecordedCall        : "stopPlaybackRecordedCall",
        startTranscodingRecordedCall    : "startTranscodingRecordedCall",
        stopTranscodingRecordedCall     : "stopTranscodingRecordedCall",
        // video composer
        showVideoComposer: "showVideoComposer",
        getVideoComposerLayoutsForState : "getVideoComposerLayoutsForState",
        getVideoComposerCurrentState    : "getVideoComposerCurrentState",
        setVideoComposerLayout          : "setVideoComposerLayout",
        getVideoComposerCurrentLayout   : "getVideoComposerCurrentLayout",
        // application sharing
        getPresEntries    : "getPresEntries",
        startPresentation : "startPresentation",
        stopPresentation  : "stopPresentation",
        // settings
        setUserSettings                         : "setUserSettings",
        getCoreSettings                         : "getCoreSettings",
        setCoreSettings                         : "setCoreSettings",
        getApplicationSettings                  : "getApplicationSettings",
        setApplicationSettings                  : "setApplicationSettings",
        getListOfLocalIp                        : "getListOfLocalIp",
        getVideoCaptureDevices                  : "getVideoCaptureDevices",
        getVideoCaptureDeviceFormats            : "getVideoCaptureDeviceFormats",
        getAudioCaptureDevices                  : "getAudioCaptureDevices",
        getAudioPlaybackDevices                 : "getAudioPlaybackDevices",
        getNotificationDevices                  : "getNotificationDevices",
        getFlasherDevices                       : "getFlasherDevices",
        startNotificationPlayback               : "startNotificationPlayback",
        stopNotificationPlayback                : "stopNotificationPlayback",
        enableMicSignalPowerNotification        : "enableMicSignalPowerNotification",
        getMicLevel                             : "getMicLevel",
        setMicLevel                             : "setMicLevel",
        getSpeakerLevel                         : "getSpeakerLevel",
        setSpeakerLevel                         : "setSpeakerLevel",
        setAudioConferencePlaybackDeviceMuted   : "setAudioConferencePlaybackDeviceMuted",
        setAudioNotificationPlaybackDeviceLevel : "setAudioNotificationPlaybackDeviceLevel",
        setAudioNotificationPlaybackDeviceMuted : "setAudioNotificationPlaybackDeviceMuted",        
        setAudioCaptureDeviceMuted              : "setAudioCaptureDeviceMuted",
        getAudioNotificationPlaybackDeviceLevel : "getAudioNotificationPlaybackDeviceLevel",
        
        openVideoCaptureDriverSettings          : "openVideoCaptureDriverSettings",
        registerEndpoint                        : "registerEndpoint",
        // generic publish
        sendPublish     : "sendPublish"
};

Command.notificationDeviceClass = {
        RendererAudio       : "RendererAudio",
        RendererVideo       : "RendererVideo",
        CapturerAudio       : "CapturerAudio",
        CapturerVideo       : "CapturerVideo",
        ResourcePlayerAudio : "ResourcePlayerAudio",
        MixerRendererAudio  : "MixerRendererAudio",
        MixerCapturerAudio  : "MixerCapturerAudio",
        Flasher             : "Flasher",
        Vibrator            : "Vibrator",
        Ringer              : "Ringer",
        Unknown             : "Unknown"
};

Command.getUID = function(command) {
    var uid = (typeof command.appID !== 'undefined') ? command.appID+'-' : '-1-';
    uid += (typeof command.seqN !== 'undefined') ? command.seqN : uid += '-1';
    return uid;
};


Command.chatHistoryTimeFrame = {
        thisRun: "thisRun",
        last24hours: "last24hours",
        last7days: "last7Days",
        last30days: "last30days"
};