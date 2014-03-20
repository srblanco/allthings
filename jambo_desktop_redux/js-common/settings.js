/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

var wizard = false;

var DEFAULT_RING_NOTIFICATION_RESOURCE = "wav/ringtone.wav";
var FLASHER_RING_NOTIFICATION_RESOURCE = "wav/500ms.wav";//KTRUMBLE 09272012 PNG-162 - setting a pattern for the flasher
var DEFAULT_NO_DEVICE = "-";

function setSpeakerLevel(level) {
    __thisWindowProxy__.setSpeakerLevel(level, function (response){
        // TODO: deal with errors...
        if (!response.result.returnValue) {
            __log__.error("Error while setting audio conference playback level");
        }
    }, undefined, false);
}

function setMicLevel(level) {
    __thisWindowProxy__.setMicLevel(level, function (response){
        // TODO: deal with errors...
        if (!response.result.returnValue) {
            __log__.error("Error while setting audio capture level");
        }
    }, undefined, false);
}

function updateSpeakerLevelNotification(level) {
    $("#speakers_level").val(level);
}

function updateMicLevel(level) {
    $("#microphone_level").val(level);
}

function saveAll(reinitVideoSubsystem, reinitAudioSubsystem, reinitEndpoints, onSuccess, onFailure) {    
    saveCoreSettings(reinitVideoSubsystem, reinitAudioSubsystem, reinitEndpoints, onSuccess, onFailure);    
    saveApplicationSettings(onSuccess, onFailure);
}

function saveCoreSettings(reinitVideoSubsystem, reinitAudioSubsystem, reinitEndpoints, onSuccess, onFailure) {
    // getting core settings
    var tempCoreSettings = jQuery.extend(true, {}, coreSettings);
    $.extend(tempCoreSettings, getGeneralSettings());
    $.extend(tempCoreSettings, getAudioSettings());
    $.extend(tempCoreSettings, getVideoSettings());
    //EXAMPLE APP
    //if (tempCoreSettings.enableCfgCodecs) { $.extend(tempCoreSettings, getCodecsSettings()); }
    //$.extend(tempCoreSettings, getNetworkAndProtocolsSettings());
    //if ((tempCoreSettings.enableSIP && tempCoreSettings.enableCfgSIP) || tempCoreSettings.enableCfgMediaEncryption) { $.extend(tempCoreSettings, getSipSettings()); }
    //if ((tempCoreSettings.enableH323 && tempCoreSettings.enableCfgH323) || tempCoreSettings.enableCfgMediaEncryption) { $.extend(tempCoreSettings, getH323Settings()); }
    
    // computing core settings changes
    var coreSettingsChanges = $.diff(coreSettings, tempCoreSettings);
    if (!wizard && $.isEmptyObject(coreSettingsChanges.add) && $.isEmptyObject(coreSettingsChanges.mod) && $.isEmptyObject(coreSettingsChanges.del)) {
        __log__.info("No core settings changes detected, skipping core settings save.");
        if (isDefinedAsFunction(onSuccess)) { onSuccess("coreSettings"); }
    } else {
        __log__.info("Core settings changes detected ["+$.toJSON(coreSettingsChanges)+"], saving...");
        if (wizard) { __log__.info("Saving wizard, asking Core to continue initialization..."); }
        __thisWindowProxy__.setCoreSettings(tempCoreSettings, reinitAudioSubsystem, reinitVideoSubsystem, reinitEndpoints, wizard, function(response){
            if (response.result.returnValue) {
                coreSettings = tempCoreSettings;
                if (isDefinedAsFunction(onSuccess)) { onSuccess("coreSettings"); }
            } else {
                __log__.warn("Error while saving core settings, reason["+response.result.reason+"]");
                if (isDefinedAsFunction(onFailure)) { onFailure("coreSettings"); }
            }
        }, undefined, true);
    }
}

function saveApplicationSettings(onSuccess, onFailure) {
    // getting application settings
    var tempApplicationSettings = $.extend(true, {}, applicationSettings);
    $.extend(tempApplicationSettings, getApplicationSettings());
    
    // computing application settings changes
    var applicationSettingsChanges = $.diff(applicationSettings, tempApplicationSettings);
    if (!wizard && $.isEmptyObject(applicationSettingsChanges.add) && $.isEmptyObject(applicationSettingsChanges.mod) && $.isEmptyObject(applicationSettingsChanges.del)) {
        __log__.info("No application settings changes detected, skipping application settings save.");
        if (isDefinedAsFunction(onSuccess)) { onSuccess("applicationSettings"); }
    } else {
        __log__.info("Application settings changes detected ["+$.toJSON(applicationSettingsChanges)+"], saving...");
        __thisWindowProxy__.setApplicationSettings(tempApplicationSettings, function(response) {
            if (response.result.returnValue) {
                applicationSettings = tempApplicationSettings;
                if (_i18n_.getSelectedLanguageCode() !== applicationSettings.language) {
                    _i18n_.setLanguageCode(applicationSettings.language, function(){ translate(); });
                }
//                if (clientType === ClientType.ClearSea) {
                    //EXAMPLE APP
                    //__thisWindow__.setIdleTimeoutSeconds((isDefined(applicationSettings.idleTimeout)) ? applicationSettings.idleTimeout : IDLE_TIMEOUT_DEFAULT*60);
//                }
                if (isDefinedAsFunction(onSuccess)) { onSuccess("applicationSettings"); }
            } else {
                __log__.warn("Error while saving application settings, reason["+response.result.reason+"]");
                if (isDefinedAsFunction(onFailure)) { onFailure("applicationSettings"); }
            }
        }, undefined, true);
    }
}

function getApplicationSettings(){
    var settings = {};
    //WKRASKO 092012 - PNG-441
    //settings.language = getFieldValue("#language");
    //EXAMPLE APP
    //settings.autoanswer = getFieldValue("#autoanswer");
    
    var audioNotificationDevice = getFieldValue("#audioNotificationPlaybackDevice");
    if (isDefined(audioNotificationDevice) && audioNotificationDevice.trim().length>0 && (audioNotificationDevice != DEFAULT_NO_DEVICE)) {
        settings.audioNotificationDevice = audioNotificationDevice;
    } else {
        settings.audioNotificationDevice = undefined;
    }
    
    //EXAMPLE APP
    /*var tempIdleTimeout = 0;
    if ($("#idleEnabled").is(":checked")) {
        tempIdleTimeout = parseInt(getFieldValue("#idleTimeout"))*60;
    }
    
    settings.idleTimeout = tempIdleTimeout;*/
    return settings;
}

function getGeneralSettings(){
    var settings = {};
    //TODO settings.autostart              = getFieldValue("#autostart");
    settings.disableScreensaver     = true;//getFieldValue("#disableScreensaver");
    settings.autoAcceptCallTransfer = false//getFieldValue("#autoAcceptCallTransfer");
    settings.disableAutoUpdate      = false//getFieldValue("#disableAutoUpdate");
    return settings;
}

function getAudioSettings(){
    var settings = {};
    settings.micDevice = getFieldValue("#micDevice");
    settings.speakerDevice = getFieldValue("#speakerDevice");
    settings.ringNotifications = getRingNotifications();
    //settings.useAEC = false;//getFieldValue("#useAEC");
    return settings;
}

function getVideoSettings(){
    var settings = {};
    settings.cameraDevice = getFieldValue("#videoCaptureDevice");
    var selectedFormat = getVideoFormatFromValue(getFieldValue("#videoCaptureDeviceFormat"));
    if (isDefined(selectedFormat)) {
        settings.cameraCaptureWidth         = selectedFormat.width;
        settings.cameraCaptureHeight        = selectedFormat.height;
        settings.cameraCaptureFormat        = selectedFormat.format;
        settings.cameraCaptureNsPerFrame    = selectedFormat.nsPerFrame;
    }
    settings.denoiseValue = -1; // (getFieldValue("#videoDenoise")?1:-1);
    return settings;
}

function initDeviceSelector(selectorID, coreSettingsPropertyName, list, selected, isAudio, isVideo, onSetSuccess, onSetFailure) {
    var options = "";
    if (applicationSettings.mode == "kiosk" || getPlatform() == "VRI") { //display web devices without "mute"
        for (var i = 0; i < list.length; i++) {
            var device = list[i];
            var isSelected = (device == selected) ? ' selected="selected"' : '';
            var deviceName = getDeviceName(device);
            var changeVideo = false;

            if (list.length == 1) {
                options += '<option value="' + device + '"' + isSelected + '>' + deviceName + '</option>';
            } else {
                if (device != '-') {
                    options += '<option value="' + device + '"' + isSelected + '>' + deviceName + '</option>';
                }
                if (device == '-' && isSelected != '') {
                    changeVideo = true;
                }
            }
        }
    } else {
        for (var i = 0; i < list.length; i++) {
            var device = list[i];
            var isSelected = (device == selected) ? ' selected="selected"' : '';
            var deviceName = getDeviceName(device);
            options += '<option value="' + device + '"' + isSelected + '>' + deviceName + '</option>';
        }
    }

    $('#'+selectorID).empty().html(options).bind('change', function(e) {
        var settings = {};
        settings[coreSettingsPropertyName] = getFieldValue("#"+selectorID);
        //EXAMPLE APP
        //showSavingMask();
        __thisWindowProxy__.setCoreSettings(settings, isAudio, isVideo, false, false, function(response){
            if (response.result.returnValue) {
                jQuery.extend(coreSettings, settings);
                if (isDefinedAsFunction(onSetSuccess)) { onSetSuccess(); }
            } else {
                __log__.warn("Error while saving "+coreSettingsPropertyName+", restoring previously selected value, reason["+response.result.reason+"]");
                setFieldValue("#"+selectorID, coreSettings[coreSettingsPropertyName]);
                if (isDefinedAsFunction(onSetFailure)) { onSetFailure(); }
            }
            //EXAMPLE APP
            //hideSavingMask();
        });
    });
    if(isDefinedAsFunction(onSetSuccess)) { onSetSuccess(); }
};

function initRingNotificationDeviceSelector(selectorID, list, selected, isAudio, isVideo, onSetSuccess, onSetFailure) {
    var options = "";
    for (var i = 0; i < list.length; i++) {
        var device = list[i];
        var isSelected = (device == selected) ? ' selected="selected"' : '';
        var deviceName = getDeviceName(device);
        options += '<option value="'+device+'" title="'+device+'"'+isSelected+'>'+deviceName+'</option>';
    }
    $('#'+selectorID).empty().html(options).bind('change', function(e) {
        var settings = { ringNotifications : getRingNotifications() };
        //EXAMPLE APP
        //showSavingMask();
        __thisWindowProxy__.setCoreSettings(settings, isAudio, isVideo, false, false, function(response){
            if (response.result.returnValue) {
                jQuery.extend(coreSettings, settings);
                if (isDefinedAsFunction(onSetSuccess)) { onSetSuccess(); }
            } else {
                __log__.warn("Error while saving "+coreSettingsPropertyName+", restoring previously selected value, reason["+response.result.reason+"]");
                setFieldValue("#"+selectorID, coreSettings[coreSettingsPropertyName]);
                if (isDefinedAsFunction(onSetFailure)) { onSetFailure(); }
            }
            //EXAMPLE APP
            //hideSavingMask();
        });
  });
    if (isDefinedAsFunction(onSetSuccess)) { onSetSuccess(); }
  if(selectorID=="flasherDevice" && list.length<=1 && getDeviceName(list[0])==_i18n_.getHTML("STR_NO_DEVICE"))
      $('#flasherDevice').attr('disabled','disabled');
};

function getRingNotifications() {
    var ringNotifications = [];
    var flasherDevice = getFieldValue("#flasherDevice");
    if (isDefined(flasherDevice) && flasherDevice.trim().length>0 && (flasherDevice != DEFAULT_NO_DEVICE)) {
        ringNotifications.push({
            "device":flasherDevice,
            "deviceClass":Command.notificationDeviceClass.Flasher,
            "resource":FLASHER_RING_NOTIFICATION_RESOURCE//KTRUMBLE 09272012 PNG-162 - setting a separate pattern for the flasher
        });
    }
    var audioNotificationDevice = getFieldValue("#audioNotificationPlaybackDevice");
    if (isDefined(audioNotificationDevice) && audioNotificationDevice.trim().length>0 && (audioNotificationDevice != DEFAULT_NO_DEVICE)) {
        ringNotifications.push({
            "device":audioNotificationDevice,
            "deviceClass":Command.notificationDeviceClass.RendererAudio,
            "resource":DEFAULT_RING_NOTIFICATION_RESOURCE
        });
    }
    return ringNotifications;
};

function updateAudioCaptureDevices() {
    __thisWindowProxy__.getAudioCaptureDevices(function(response) {
        //EXAMPLE APP
        /*__thisWindowProxy__.getMicLevel(function(response){
            if (isDefined(response.result.level)) { updateMicLevel(response.result.level); } 
            else { __log__.error("Error while getting audio capture device level"); }
        });*/
        initMicDevice(response.result.list, coreSettings.micDevice);            
    });  
};

function updateAudioPlaybackDevices() {
    __thisWindowProxy__.getAudioPlaybackDevices(function(response) {
        __thisWindowProxy__.getSpeakerLevel(function(response){
            if (isDefined(response.result.level)) { updateSpeakerLevelNotification(response.result.level); } 
            else { __log__.error("Error while getting audio conference playback device level"); }
        });
        initSpeakerDevice(response.result.list, coreSettings.speakerDevice);
    });
};

function updateVideoDevices() {
    __thisWindowProxy__.getVideoCaptureDevices(function(response) {
        var videoCaptureDevices = response.result.list;
        var selectedCameraDevice = null;
        if(isDefined(coreSettings) && isDefined(coreSettings.cameraDevice))
            selectedCameraDevice = coreSettings.cameraDevice;
        __thisWindowProxy__.getVideoCaptureDeviceFormats(function(response) {
            var videoCaptureDeviceFormats = response.result.modes;
            var currentVideoCaptureDeviceFormat = response.result.current;
            initVideo(videoCaptureDevices, selectedCameraDevice, videoCaptureDeviceFormats, currentVideoCaptureDeviceFormat);  
        });
    });
};

function updateNotificationDevices() {
    __thisWindowProxy__.getNotificationDevices(function(response) {
        var flasherDevices = [DEFAULT_NO_DEVICE];
        var audioNotificationDevices = [DEFAULT_NO_DEVICE];
        if (isDefined(response.result.list)) {
            for (var i=0; i<response.result.list.length; i++) {
                var device = response.result.list[i];
                if (device.deviceClass === Command.notificationDeviceClass.Flasher) {
                    flasherDevices.push(device.device);
                } else if (device.deviceClass === Command.notificationDeviceClass.RendererAudio) {
                    audioNotificationDevices.push(device.device);
                }
            }
        }        
        
        var selectedFlasherDevice = getSelectedNotificationDevice(flasherDevices);        
        initFlasherNotification(flasherDevices, selectedFlasherDevice); 

        var selectedAudioNotificationDevice = getSelectedNotificationDevice(audioNotificationDevices); 
        initAudioNotification(audioNotificationDevices, selectedAudioNotificationDevice);
    });
};

function getSelectedNotificationDevice(availableDevices) {
    var selectedDevice = undefined;
    if (isDefined(coreSettings.ringNotifications)) {
        for (var i=0; i<coreSettings.ringNotifications.length; i++) {
            var ringNotification = coreSettings.ringNotifications[i];            
            if (isDefined(ringNotification.device) && ($.inArray(ringNotification.device, availableDevices)>-1)) {
                selectedDevice = ringNotification.device;
                break;
            }
        }
    }
    return selectedDevice;
}

function initMicDevice(list, selected){
    initDeviceSelector("micDevice", "micDevice", list, selected, true, false, function(){
        if (isDefined(coreSettings.micDevice) && (coreSettings.micDevice.trim().length>0) && (coreSettings.micDevice != DEFAULT_NO_DEVICE)) {            
            if (coreSettings.useAEC) { $("#microphone_level").attr("disabled","disabled"); }
            else { $("#microphone_level").removeAttr("disabled"); }
        } else {
            $('#microphone_level').attr("disabled", "disabled");
        }
    });
};

function initSpeakerDevice(list, selected){
    initDeviceSelector("speakerDevice", "speakerDevice", list, selected, true, false, function(){
        if (isDefined(coreSettings.speakerDevice) && (coreSettings.speakerDevice.trim().length>0) && (coreSettings.speakerDevice != DEFAULT_NO_DEVICE)) {
            //EXAMPLE APP
            //$('#test_speakers').removeClass("disabled");
            $('#speakers_level').removeAttr("disabled");
        } else {
            //EXAMPLE APP
            //$('#test_speakers').addClass("disabled");
            $('#speakers_level').attr("disabled","disabled");
        }
    });
    
    //EXAMPLE APP
    /*$('#test_speakers:not(.disabled)').live('click', function(){
        if (isDefined(coreSettings.speakerDevice) && (coreSettings.speakerDevice.trim().length>0) && (coreSettings.speakerDevice != DEFAULT_NO_DEVICE)) {
            __thisWindowProxy__.startNotificationPlayback(coreSettings.speakerDevice, "wav/tone.wav", false);
        }
    });*/
};

function initAudioNotification(list, selected){
    initRingNotificationDeviceSelector("audioNotificationPlaybackDevice", list, selected, true, false, function(){
        //EXAMPLE APP
        //var selectedAudioNotificationDevice = getSelectedNotificationDevice(list);
        saveApplicationSettings();
            
        //EXAMPLE APP
        /*if (isDefined(selectedAudioNotificationDevice) && (selectedAudioNotificationDevice.trim().length>0) && (selectedAudioNotificationDevice != DEFAULT_NO_DEVICE)) {        
            $('#test_audio_notification').removeClass("disabled");
            $('#notification_level').removeAttr("disabled");            
        } else {
            $('#test_audio_notification').addClass("disabled");
            $('#notification_level').attr("disabled","disabled");
        }*/
    });
    
    //EXAMPLE APP
    /*if (wizard) {
        var audioNotificationDevice = $("#audioNotificationPlaybackDevice").val();
        if (!isDefined(audioNotificationDevice) || (audioNotificationDevice.trim().length==0) || (audioNotificationDevice == DEFAULT_NO_DEVICE)) {
            console.info("audioNotificationDevice", audioNotificationDevice);
            $("#audioNotificationPlaybackDevice").val(coreSettings.speakerDevice).change();
        }
    } 

    $('#test_audio_notification:not(.disabled)').live('click', function(){
        var selectedAudioNotificationDevice = getSelectedNotificationDevice(list);
        if (isDefined(selectedAudioNotificationDevice) && (selectedAudioNotificationDevice.trim().length>0) && (selectedAudioNotificationDevice != DEFAULT_NO_DEVICE)) {  
            __thisWindowProxy__.startNotificationPlayback(selectedAudioNotificationDevice, "wav/ringtone_short.wav", false);
        }
    });*/
};

function initFlasherNotification(list, selected){
    initRingNotificationDeviceSelector("flasherDevice", list, selected, false, false, function(){
        //EXAMPLE APP
        /*var selectedFlasherDevice = getSelectedNotificationDevice(list);
        if (isDefined(selectedFlasherDevice) && (selectedFlasherDevice.trim().length>0) && (selectedFlasherDevice != DEFAULT_NO_DEVICE)) {
            $('#test_flasher_notification').removeClass("disabled");
        } else {
            $('#test_flasher_notification').addClass("disabled");
        }*/
    });
    
    //EXAMPLE APP
    /*$('#test_flasher_notification:not(.disabled)').live('click', function(){
        var selectedFlasherDevice = getSelectedNotificationDevice(list);
        if (isDefined(selectedFlasherDevice) && (selectedFlasherDevice.trim().length>0) && (selectedFlasherDevice != DEFAULT_NO_DEVICE)) {
            __thisWindowProxy__.startNotificationPlayback(selectedFlasherDevice, "wav/ringtone_short.wav", false);
        }
    });*/
};

function refreshVideoCaptureDeviceFormats() {
    __thisWindowProxy__.getVideoCaptureDeviceFormats(function(response) {            
        initVideoCaptureDeviceFormats(response.result.modes, response.result.current);
    });  
};

function initVideo(list, selected, formats, selectedFormat){
    initDeviceSelector("videoCaptureDevice", "cameraDevice", list, selected, false, true, function(){
        __thisWindowProxy__.getVideoCaptureDeviceFormats(function(response) {            
            initVideoCaptureDeviceFormats(response.result.modes, response.result.current);
        });      
    });
    
    initVideoCaptureDeviceFormats(formats, selectedFormat);
    
    if (getCurrentOS() !== OSType.MacOS) {
        $('#open_webcam_driver_settings').bind('click', function(e) { __thisWindowProxy__.openVideoCaptureDriverSettings(); });
    } else {
        $('#open_webcam_driver_settings').hide();
    }
    //EXAMPLE APP
    /*$('#open_video_composer').bind('click', function(e) { 
        __thisWindowProxy__.showVideoComposer(true); 
        if ($('#currentVideoCaptureDeviceFormat').html() === "?") {
            $('#currentVideoCaptureDeviceFormat').html("<img src=\"./img/loading_small.gif\"/>");
            setTimeout(refreshVideoCaptureDeviceFormats, 3000);
        }
    });*/
    
//    var denoiseValue = coreSettings.denoiseValue;
//    $('#videoDenoise').attr("checked", (denoiseValue>-1)?true:false);
//    $('#videoDenoise').bind('change', function(e) {
//        showSavingMask();
//        var denoise = -1; 
//        if ($('#videoDenoise').is(":checked")) { denoise = 1; }
//        var settings = {};
//        settings.denoiseValue = denoise;        
//        __thisWindowProxy__.setCoreSettings(settings, false, true, false, false, function(response){
//            if (response.result.returnValue) {
//                jQuery.extend(coreSettings, settings);
//            } else {
//                __log__.warn("Error while saving video denoise value, restoring previous value, reason["+response.result.reason+"]"); 
//                var denoiseValue = coreSettings.denoiseValue;
//                $('#videoDenoise').attr("checked", (denoiseValue>-1)?true:false);                
//            }
//            hideSavingMask();
//        });
//    });
};

function initVideoCaptureDeviceFormats(formats, selectedFormat) {
     var configuredFormat = {
        width       : coreSettings.cameraCaptureWidth,
        height      : coreSettings.cameraCaptureHeight,
        nsPerFrame  : coreSettings.cameraCaptureNsPerFrame,
        format      : coreSettings.cameraCaptureFormat
    }; 
    if ((configuredFormat.width == 0) && (configuredFormat.height == 0) && (configuredFormat.nsPerFrame == 0)) {
        configuredFormat.auto = true;
    } else {
        configuredFormat.auto = false;
    }
    var options = '<option value="auto"'+(configuredFormat.auto?' selected="selected"':'')+'>Auto</div>';
    if (isDefined(formats) && $.isArray(formats)) {
        for ( var i = 0; i < formats.length; i++) {
            var format = formats[i];
            var isSelected = '';
            //WKRASKO 031213 - Support for lesser cpus, like netwbooks
            //Lets limit available formats to what the server is set for. Not point in letting the user select a format if the server will not relay it
            var stringRes = format.width+"x"+format.height;
            if( stringRes in videoFormatMap && $.inArray(videoFormatMap[stringRes], coreSettings.videoFormatsTxEnabled)>=0 ){
                if (    
                        !configuredFormat.auto && (
                        (configuredFormat.width         == format.width) && 
                        (configuredFormat.height        == format.height) && 
                        (configuredFormat.nsPerFrame    == format.nsPerFrame) &&
                        (configuredFormat.format        == format.format))) 
                {
                    isSelected = ' selected="selected"';
                }
                options += '<option value="'+getValueFromVideoFormat(format)+'"'+isSelected+'>'+getLabelFromVideoFormat(format)+'</div>';
            }
        }
    }
    $('#videoCaptureDeviceFormat').empty().html(options).bind('change', function(e) {         
        var $this = $(this);
        var format = getVideoFormatFromValue($this.val());
        var settings = {};
        settings.cameraCaptureWidth         = format.width;
        settings.cameraCaptureHeight        = format.height;
        settings.cameraCaptureNsPerFrame    = format.nsPerFrame;
        settings.cameraCaptureFormat        = format.format;
        //EXAMPLE APP
        //showSavingMask();
        __thisWindowProxy__.setCoreSettings(settings, false, true, false, false, function(response){
            if (response.result.returnValue) {
                jQuery.extend(coreSettings, settings);                
                __thisWindowProxy__.getVideoCaptureDeviceFormats(function(response) {
                    //EXAMPLE APP
                    /*if (isDefined(response.result.current)) {                    
                        $('#currentVideoCaptureDeviceFormat').empty().html(getLabelFromVideoFormat(response.result.current));
                    } else {
                        $('#currentVideoCaptureDeviceFormat').empty().html("?");
                    }*/
                });                
            } else {
                __log__.warn("Error while saving video format, restoring previously selected value, reason["+response.result.reason+"]");                               
                $this.val(getValueFromVideoFormat(configuredFormat));
                //EXAMPLE APP
                //$('#currentVideoCaptureDeviceFormat').empty().html(getLabelFromVideoFormat(configuredFormat));
            }
            //EXAMPLE APP
            //hideSavingMask();
        });
    });
    
    //EXAMPLE APP
    /*if (isDefined(selectedFormat)) {
        $('#currentVideoCaptureDeviceFormat').empty().html(getLabelFromVideoFormat(selectedFormat));
    } else {
        $('#currentVideoCaptureDeviceFormat').empty().html("?");
    }*/
}

function getValueFromVideoFormat(format) {
    return format.width+"$$$"+format.height+"$$$"+format.nsPerFrame+"$$$"+format.format;
}

function getVideoFormatFromValue(value) {
    try {
        var format = {};
        if (value == "auto") {            
            format.width = 0;
            format.height = 0;
            format.nsPerFrame = 0;
            format.format = 'INVALID';
        } else {
            var tokens = value.split('$$$', 4);
            format.width = parseInt(tokens[0]);
            format.height = parseInt(tokens[1]);
            format.nsPerFrame = parseInt(tokens[2]);
            format.format = tokens[3];
        }
        return format;
    } catch (e) {
        __log__.error("Can't obtain video format from value["+value+"] "+e.name+", "+e.message+", "+e.sourceURL+":"+e.line);
        return undefined;
    }
}

function getLabelFromVideoFormat(format) {
    var hz = ""+getHzFromNsPerFrame(format.nsPerFrame);
    var dotPosition = hz.lastIndexOf(".");
    if (dotPosition == -1) { hz += ".00"; }
    if (dotPosition == hz.length-2) { hz += "0"; }
    return format.width+"x"+format.height+" "+hz+"Hz "+format.format;
}

function getHzFromNsPerFrame(nsPerFrame) {
    return Math.round((1000000000/nsPerFrame)*100)/100;
}

function getDeviceName(deviceString) {
    var deviceName = deviceString;
    if (deviceName == '-') {
        deviceName = _i18n_.getHTML("STR_NO_DEVICE");
    } else {
        var separatorIndex = deviceName.lastIndexOf("\u001b");
        if (separatorIndex > -1) {
            deviceName = deviceName.substring(separatorIndex+1);
        }
    }
    return deviceName;
}

function setFieldValue(fieldID, fieldValue) {
    var $field = $(fieldID);
    if (!isDefined($field) && !isDefined($field.get(0))) {
        __log__.error("Can't set value ["+fieldValue+"], field["+fieldID+"] not exists.");
        return;
    }
    var tagName = $field.get(0).tagName;
    if (!isDefined(tagName)) {
        __log__.error("Can't set value ["+fieldValue+"], field["+fieldID+"] TAG name not exists.");
        return;
    }
    switch (tagName) {
        case 'INPUT':
            var inputType = $field.attr('type');
            switch (inputType) {
                case 'checkbox':
                    $field.attr('checked', fieldValue);
                    break;
                case 'text':
                case 'password':
                    $field.val(fieldValue);
                    break;
                default:
                    break;
            }
            break;
        case 'SELECT':
            $field.val(fieldValue);
            break;
        default:
            __log__.error("Can't set value ["+fieldValue+"], field["+fieldID+"] TAG["+tagName+"] unsupported.");
            break;
    }
}

function getFieldValue(fieldID) {
    var $field = $(fieldID);
    if (!isDefined($field) || !isDefined($field.get(0))) {
        __log__.error("Can't set value ["+fieldValue+"], field["+fieldID+"] not exists.");
        return;
    }
    var tagName = $field.get(0).tagName;
    if (!isDefined(tagName)) {
        __log__.error("Can't set value ["+fieldValue+"], field["+fieldID+"] TAG name not exists.");
        return;
    }
    var fieldValue = undefined;
    switch (tagName) {
        case 'INPUT':
            var inputType = $field.attr('type');
            switch (inputType) {
                case 'checkbox':
                    fieldValue = $field.is(':checked');
                    break;
                case 'text':
                case 'hidden':
                case 'password':
                    fieldValue = $field.val();
                    break;
                default:
                    break;
            }
            break;
        case 'SELECT':
            fieldValue = $field.val();
            break;
        default:
            __log__.error("Can't set value ["+fieldValue+"], field["+fieldID+"] TAG["+tagName+"] unsupported.");
            break;
    }
    return fieldValue;
}

var videoFormatMap = {
    "128x96": "SQCIF",
    "176x144": "QCIF",
    "352x288": "CIF",
    "704x576": "CIF4",
    "960x540": "QHD",
    "1280x720": "720P",
    "1920x1080": "1080P"
};