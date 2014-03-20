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

function __SettingsCoreListener__() {
    __CoreListener__.call(this);
}
__SettingsCoreListener__.prototype = new __CoreListener__();

//@Override
__SettingsCoreListener__.prototype.processResponse = function(response) {
    switch (response.command) {
        default:
            __log__.debug(__APP_ID__+"|RES|"+response.seqN+"|"+response.appID+"|"+response.command+"|Unhandled response");
            break;
    }
};

// @Override
__SettingsCoreListener__.prototype.processEvent = function(event) {
    switch (event.event) {
        case (Event.type.micSignalPowerNotification)                        : this.micSignalPowerNotification(event); break;
        case (Event.type.speakerLevelNotification)                          : this.speakerLevelNotification(event); break;
        case (Event.type.audioNotificationPlaybackDeviceLevelNotification)  : this.audioNotificationPlaybackDeviceLevelNotification(event); break;
        case (Event.type.micLevelNotification)                              : this.micLevelNotification(event); break;
        case (Event.type.audioCaptureDevicesChangedNotification)            : this.audioCaptureDevicesChangedNotification(event); break;
        case (Event.type.audioPlaybackDevicesChangedNotification)           : this.audioPlaybackDevicesChangedNotification(event); break;
        case (Event.type.videoDevicesChangedNotification)                   : this.videoDevicesChangedNotification(event); break;
        case (Event.type.flasherDevicesChangedNotification)                 : this.flasherDevicesChangedNotification(event); break;
        case (Event.type.callNotification)                                  : this.onCallNotification(event); break;
        default:
            __log__.debug(__APP_ID__+"|RES|"+event.seqN+"|"+event.event+"|Unhandled event");
            break;
    }
};

__SettingsCoreListener__.prototype.micSignalPowerNotification = function(event) {
    if (!isDefined(event.details.power)) {
        __log__.error("'power' parameter is undefined, can't parse event");
        return undefined;
    }
    updateAudioCaptureMeter(event.details.power);
};

__SettingsCoreListener__.prototype.speakerLevelNotification = function(event) {
     if (!isDefined(event.details.level)) {
        __log__.error("'level' parameter is undefined, can't parse event");
        return undefined;
    }
    updateSpeakerLevelNotification(event.details.level);
};

__SettingsCoreListener__.prototype.audioNotificationPlaybackDeviceLevelNotification = function(event) {
    if (!isDefined(event.details.level)) {
        __log__.error("'level' parameter is undefined, can't parse event");
        return undefined;
    }
    updateAudioNotificationPlaybackDeviceLevel(event.details.level);
};

__SettingsCoreListener__.prototype.micLevelNotification = function(event) {
    if (!isDefined(event.details.level)) {
        __log__.error("'level' parameter is undefined, can't parse event");
        return undefined;
    }
    updateMicLevel(event.details.level);
};

__SettingsCoreListener__.prototype.audioCaptureDevicesChangedNotification = function(event) {
    updateAudioCaptureDevices();
};

__SettingsCoreListener__.prototype.audioPlaybackDevicesChangedNotification = function(event) {
    updateAudioPlaybackDevices();
    updateNotificationDevices(); // forcing notification devices update due to lacking specific notification event
};

__SettingsCoreListener__.prototype.videoDevicesChangedNotification = function(event) {
    updateVideoDevices();
};

__SettingsCoreListener__.prototype.flasherDevicesChangedNotification = function(event) {
    updateFlasherDevices();
};

__SettingsCoreListener__.prototype.onCallNotification = function(event) {
    lineRepository.handleCallNotification(event, onLineUpdated);
};

__SettingsCoreListener__.prototype.onCoreSettingsNotification = function(event) {
    if (!isDefined(event.details.notification)) {
        __log__.error("'notification' parameter is undefined, can't parse event");
        return undefined;
    }
    switch (event.details.notification) {
        case (Event.coreSettingsNotification.updated)                           : onUpdatedCoreSettings(); break;
        default:
            __log__.debug("'notification' parameter has an unsupported value ["+event.details.notification+"], skipping event");
            break;
    }
};

var __coreListener__ = new __SettingsCoreListener__();