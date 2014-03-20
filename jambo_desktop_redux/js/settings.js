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

var currentWidth;
var currentHeight;

var waiting = 0;
var searching = 0;
var debugEnabled = true;

var originalCoreSettings;
var coreSettings;
var originalApplicationSettings;
var applicationSettings;
var appInfo;
var licenseInfo;
var listOfLocalIp;
var clientType = ClientType.Standalone;
var wizard = false;
var wizardTabHashSequence = ["#generalTab", "#audioTab", "#videoTab", "#codecsTab", "#networkAndProtocolsTab", "#sipTab", "#h323Tab"];
var currentSelectedTabHash = "#generalTab";
var onMicSignalPowerNotificationEnabled = false;
var lineRepository;
var windowsRepository;
var allLineIdle = true;

var iconModifier = "p3-tng-icon-18-on";

var DEFAULT_RING_NOTIFICATION_RESOURCE = "wav/ringtone.wav";
var FLASHER_RING_NOTIFICATION_RESOURCE = "wav/500ms.wav";//KTRUMBLE 09272012 PNG-162 - setting a pattern for the flasher
var DEFAULT_NO_DEVICE = "-";
var MIN_RATE = 64000; // bps used for min upload and download rate values

var IDLE_TIMEOUT_DEFAULT = 10;
var IDLE_TIMEOUT_MIN_VALUE = 1;
var IDLE_TIMEOUT_MAX_VALUE = 60;

var wizardConfirmClose = false;

var geometryChangedTimeout = undefined;

window.onresize = function() {
    var $window = $(window);
    $('#header #tabMenu > div.tabMenu').css('min-width', Math.max($('#menu div.tab').first().outerWidth()-4, 600));
    if ($window.height() !== currentHeight) { setContentHeight($window); }
    if ($window.width() !== currentWidth) { setContentWidth($window); }
    if (typeof currentWidth === 'undefined') { $window.width(); }
    if (typeof currentHeight === 'undefined') { $window.height(); }
    
    if (isDefined(geometryChangedTimeout)) { clearTimeout(geometryChangedTimeout); geometryChangedTimeout = undefined; }
    geometryChangedTimeout = setTimeout("onGeometryChanged()", 500);
};

function __windowMoved() { 
    if (isDefined(geometryChangedTimeout)) { clearTimeout(geometryChangedTimeout); geometryChangedTimeout = undefined; }
    geometryChangedTimeout = setTimeout("onGeometryChanged()", 500);
}

function onGeometryChanged() {
    if (isDefined(geometryChangedTimeout)) { geometryChangedTimeout = undefined; }
    if (isDefined(windowsRepository)) { windowsRepository.onChangedGeometries(window.name, getCurrentGeometry()); }
}

function setContentHeight($window){
    if (!isDefined($window)) { $window = $(window); }
    $('div.tabContent').height($window.height()-($('#header').outerHeight(true)+$('#footer').outerHeight(true)));
}

function setContentWidth($window){
    if (!isDefined($window)) { $window = $(window); }
    var contentWidth = $('#general').width();
    $("#savingMask").width(contentWidth);
}

function initTabs(){
    $('#header #menu div.tab').unbind();
	$('#header #menu div.tab:not(.disabled)').click(function () { // switching tab
	    var $this = $(this);
	    if (currentSelectedTabHash != $this.attr('id')) {
	        if (!isDefined(currentSelectedTabHash) || (validateTabData(currentSelectedTabHash).length==0)) {
	            currentSelectedTabHash = "#"+$this.attr('id');
	            
	            if (wizard) {
    	            prevTabId = getWizardPrevEnabledTabID(currentSelectedTabHash);
    	            nextTabId = getWizardNextEnabledTabID(currentSelectedTabHash);
    	            if (isDefined(prevTabId)) {
    	                $('div.button#prev').removeClass('disabled');
    	            } else {
    	                $('div.button#prev').addClass('disabled');
    	            }
    	            
    	            if (isDefined(nextTabId)) {
                        $('div.button#next').removeClass('disabled');
                        $('div.button#finish').addClass('disabled');
                    } else {
                        $('div.button#next').addClass('disabled');
                        $('div.button#finish').removeClass('disabled');
                    }
	            }
	            
	            $('#header #menu div.tab').removeClass('selected');
	            $this.addClass('selected');	            

	            showTab($this.attr('tab'));
	        }        
	    }
	}).filter(currentSelectedTabHash).click();
}

function uninitTabs() {
    $('#header #menu div.tab').unbind();
}

function showTab(contentDivHash) {
    if (!onMicSignalPowerNotificationEnabled && (contentDivHash == "#audio")) {
        __thisWindowProxy__.enableMicSignalPowerNotification(true, 100);
        onMicSignalPowerNotificationEnabled = true;
    } else if (onMicSignalPowerNotificationEnabled && (contentDivHash != "#audio")) {
        __thisWindowProxy__.enableMicSignalPowerNotification(false);
        onMicSignalPowerNotificationEnabled = false;
    }
    
	$('#contentTop > div').hide().filter(contentDivHash+"Top").show();	
	$('#content > div.tabContent').hide().filter(contentDivHash).show();	
	$('#contentBottom > div').hide().filter(contentDivHash+"Bottom").show();    
	currentSelectedTabHash = contentDivHash+"Tab";
}

function getWizardNextEnabledTabID(tabHash) {
    if (!isDefined(tabHash)) { return undefined; }
    for(var i = 0; i<(wizardTabHashSequence.length-1); i++) {
        if ((wizardTabHashSequence[i] === tabHash)) {
            for(var j=i+1; j<(wizardTabHashSequence.length-1); j++) {
                if ($(wizardTabHashSequence[j]).is(":visible")) { return wizardTabHashSequence[j]; }    	
            }
        }
    }
}

function getWizardPrevEnabledTabID(tabHash) {
    if (!isDefined(tabHash)) { return undefined; }
    for ( var i = 1; i < (wizardTabHashSequence.length); i++) {
        if ((wizardTabHashSequence[i] === tabHash)) {
            for(var j=i-1; j>=0; j--) {
                if ($(wizardTabHashSequence[j]).is(":visible")) { return wizardTabHashSequence[j]; }        
            }
        }
    }
}

$(document).ready(function() {  
    windowsRepository = opener.windowsRepository; 
    var parentWindowData = windowsRepository.getParameters(window.name);
    if (isDefined(parentWindowData.firstRun)) { wizard = parentWindowData.firstRun; }
    if (isDefined(opener.clientType)) { clientType = opener.clientType; }
    if (opener.clientType == ClientType.ClearSea) {
        iconModifier = "clearsea";
    }
    if (!__COMPOSITION_ENABLED__) { $("html").addClass("compatibilityMode"); }
    $("html").addClass(getCurrentOS());
    lineRepository = opener.lineRepository.clone();
    __thisWindow__.ready();
    _i18n_.setLanguageCode(opener._i18n_.getSelectedLanguageCode(), function(){ translate(); });
	initTabs();
	
	$('#microphone_level').    bind('change', function(e) { setMicLevel(parseInt($(this).val())); });	
	$('#speakers_level').      bind('change', function(e) { setSpeakerLevel(parseInt($(this).val())); });	
	$('#notification_level').  bind('change', function(e) { setAudioNotificationPlaybackDeviceLevel(parseInt($(this).val())); });
	$('#videoPercentageH239'). bind('change', function(e) { $('input#videoPercentageH239Value').val(parseInt($(this).val())); });
           
	$('.sectionTrigger').click(function(e) {
	    e.stopImmediatePropagation();
	    var sectionId = $(this).attr('section');
	    var group = $(this).attr('group');
	    var sectionVisible = $('#'+sectionId).is(':visible');
	    if ($(this).is('.expanded')) {
	        $('#'+sectionId).slideUp(300);	        
	    } else {
            if (isDefined(group)) {
                $('div.section.'+group+':visible').each(function() {
                    $('.sectionTrigger:[section='+$(this).attr('id')+']').toggleClass('expanded');
                    $(this).slideUp(300);
                });
                $('#'+sectionId+":not(.disabled)").slideDown(300);
            } else {
                $('#'+sectionId+":not(.disabled)").slideDown(100);
            }
	    }	    
	    $(this).toggleClass('expanded');
    });	
	$('.sectionCheckboxTrigger').click(function(e) {
	    e.stopImmediatePropagation();
	    var sectionId = $(this).attr('section');
	    var group = $(this).attr('group');
	    var sectionVisible = $('#'+sectionId).is(':visible');
	    if ($(this).is('.expanded')) {
	        $('#'+sectionId).slideUp(300);          
	    } else {
	        if (isDefined(group)) {
	            $('div.section.'+group+':visible').each(function() {
	                $('.sectionCheckboxTrigger:[section='+$(this).attr('id')+']').toggleClass('expanded');
	                $('.sectionCheckboxTrigger:[section='+$(this).attr('id')+'] input[type=checkbox]').attr('checked', false);
	                $(this).slideUp(300);
	            });
	            $('#'+sectionId+":not(.disabled)").slideDown(300);
	        } else {
	            $('#'+sectionId+":not(.disabled)").slideDown(100);
	        }
	    }
	    $(this).toggleClass('expanded');
	});
	
    $('.sectionTriggerLabel').click(function(e) { 
        $(this).children('.sectionTrigger').click();
        $(this).children('.sectionCheckboxTrigger').click();
        $(this).find('.sectionCheckboxTrigger input[type=checkbox]').attr('checked', !$(this).find('.sectionCheckboxTrigger input[type=checkbox]').is(':checked'));
    });
    
    if (wizard) {
        __thisWindow__.setShownControls(true, false, false, false, false);
        $("div#wizard.buttonContainer").removeClass("hidden");
        $('div.button#prev:not(.disabled)').live('click', function(e){            
            var prevTabID = getWizardPrevEnabledTabID(currentSelectedTabHash);
            if (isDefined(prevTabID)) { $(prevTabID).click(); }
        });
        $('div.button#next:not(.disabled)').live('click', function(e){            
            var nextTabID = getWizardNextEnabledTabID(currentSelectedTabHash);
            if (isDefined(nextTabID)) { $(nextTabID).click(); }
        });
        $('div.button#finish:not(.disabled)').live('click', function(e){
            if ((validateTabData(currentSelectedTabHash).length==0)) {
                wizardConfirmClose = true;
                showSavingMask();
                performSaveAllWithMask(window.close, hideSavingMask);
            }
        });
    } else {   
        wizardConfirmClose = true;
        $("div#normal.buttonContainer").removeClass("hidden");
        $('div.button#ok:not(.disabled)').live('click', function(e){
            showSavingMask();
            performSaveAllWithMask(window.close, window.close);          
        });
        $('div.button#apply:not(.disabled)').live('click', function(e){
            showSavingMask();
            performSaveAllWithMask(hideSavingMask, hideSavingMask);
        });
        $('div.button#cancel:not(.disabled)').live('click', function(e){
            showSavingMask();
            performRevertAllWithMask(
                    function(){ window.close(); },
                    function(){ window.close(); });
        });
    }
    __thisWindow__.setIcon("img/"+iconModifier+".png");
    if(getCurrentOS() == OSType.Windows) __thisWindow__.setIcon("img/icon.ico");//PNG-276 KTRUMBLE - adjust for windows
    __thisWindow__.setMinimumSize(640, 480);
    loadGeometry(640, 480);    
    __thisWindow__.show();
    $(window).resize();
    
    $(document).keypress(function(event) {
        detectDebugMode(event);
        return true;
    });
});

var inputBuffer = "";
var inputBufferTimeout = undefined;
var DEBUG_MODE_TRIGGER_STRING = "ddt";
var debugMode = false;
function detectDebugMode(event) {
    if (!isDefined(inputBuffer)) { inputBuffer = ""; }
    if (isDefined(inputBufferTimeout)) { clearTimeout(inputBufferTimeout); }
    
    inputBuffer += String.fromCharCode(event.which);        
    if (inputBuffer === DEBUG_MODE_TRIGGER_STRING) {
        debugMode = !debugMode;
        onDebugModeChanged(debugMode);
        inputBuffer = "";
    } else {
        inputBufferTimeout = setTimeout("detectDebugModeTimeout()", 500);
    }
};

function detectDebugModeTimeout() {
    inputBuffer = "";
    inputBufferTimeout = undefined;
};

function onDebugModeChanged(debugMode) {
    setInCall(!allLineIdle);
};

function onLineUpdated(lineNum){
    var tempAllLineIdle = lineRepository.allLineIdle();
    if (tempAllLineIdle !== allLineIdle) {
        allLineIdle = tempAllLineIdle;
        setInCall(!allLineIdle);
    }
};

function setInCall(inCall) {
    if (inCall && !debugMode) {
        // disabling codecs tab changes
        var $audioCodecs = $("#audioCodecs");
        $audioCodecs.find('input[type=checkbox]').attr('disabled', 'disabled');
        $audioCodecs.find('div.label').addClass('disabled');
        var $videoCodecs = $("#videoCodecs");
        $videoCodecs.find('input[type=checkbox]').attr('disabled', 'disabled');
        $videoCodecs.find('div.label').addClass('disabled');
        var $videoFormats = $("#videoFormats");
        $videoFormats.find('input[type=checkbox]').attr('disabled', 'disabled');
        $videoFormats.find('div.label').addClass('disabled');
        var $useH239 = $("#useH239");
        $useH239.attr('disabled', 'disabled');
        if ($useH239.is(":checked")) { disableH239Advanced(); }
        $("#useH224").attr('disabled', 'disabled');
        
        // disabling network and protocols tab changes
        var $networkFieldset = $("#networkFieldset");
        $networkFieldset.find('input').attr('disabled', 'disabled');
        $networkFieldset.find('select').attr('disabled', 'disabled');
        var $protocolsFieldset = $("#protocolsFieldset");
        $protocolsFieldset.find('input').attr('disabled', 'disabled');
        $protocolsFieldset.find('select').attr('disabled', 'disabled');
    } else if (!inCall || debugMode) {
        // enabling codecs tab changes
        var $audioCodecs = $("#audioCodecs");
        $audioCodecs.find('input[type=checkbox]').removeAttr('disabled');
        $audioCodecs.find('div.label').removeClass('disabled');
        var $videoCodecs = $("#videoCodecs");
        $videoCodecs.find('input[type=checkbox]').removeAttr('disabled');
        $videoCodecs.find('div.label').removeClass('disabled');
        var $videoFormats = $("#videoFormats");
        $videoFormats.find('input[type=checkbox]').removeAttr('disabled');
        $videoFormats.find('div.label').removeClass('disabled');
        var $useH239 = $("#useH239");
        $useH239.removeAttr('disabled');
        if ($useH239.is(":checked")) { enableH239Advanced(); }
        $("#useH224").removeAttr('disabled');
        
        // enabling network and protocols tab changes
        var $networkFieldset = $("#networkFieldset");
        $networkFieldset.find('input').removeAttr('disabled');
        $networkFieldset.find('select').removeAttr('disabled').change();
        var $protocolsFieldset = $("#protocolsFieldset");
        $protocolsFieldset.find('input').removeAttr('disabled');
        $protocolsFieldset.find('select').removeAttr('disabled').change();
    }
}

function performSaveAllWithMask(onSuccess, onFailure) {    
    var processedSettings = { // tracking async saves
            applicationSettings : false,
            coreSettings        : false
    };
    saveAll(true, true, true,
        function(settings){ // onSuccess
            __log__.debug("Settings ["+settings+"] applyied!");
            processedSettings[settings] = true;
            if (processedSettings.coreSettings)         { opener.onUpdatedCoreSettings(coreSettings); }
            if (processedSettings.applicationSettings)  { opener.onUpdatedApplicationSettings(applicationSettings); }
            if (processedSettings.applicationSettings && processedSettings.coreSettings) { onSuccess(); }                
        },
        function(settings){ // onFailure
            __log__.error("Error while applying settings ["+settings+"], can't proceed!");
            processedSettings[settings] = true;
            if (processedSettings.applicationSettings && processedSettings.coreSettings) { onFailure(); } 
        });
}

function performRevertAllWithMask(onSuccess, onFailure) {
    var processedSettings = { // tracking async saves
            applicationSettings : false,
            coreSettings        : false
    };
    revertAll(
        function(settings){ // onSuccess
            __log__.debug("Settings ["+settings+"] reverted!");
            processedSettings[settings] = true;
            if (processedSettings.coreSettings)         { opener.onUpdatedCoreSettings(coreSettings); }
            if (processedSettings.applicationSettings)  { opener.onUpdatedApplicationSettings(applicationSettings); }
            if (processedSettings.applicationSettings && processedSettings.coreSettings) { onSuccess(); }                
        },
        function(settings){ // onFailure
            __log__.error("Error while reverting settings ["+settings+"], can't proceed!");
            processedSettings[settings] = true;
            if (processedSettings.applicationSettings && processedSettings.coreSettings) { onFailure(); } 
        });
}

function setSpeakerLevel(level) {
    __thisWindowProxy__.setSpeakerLevel(level, function (response){
        // TODO: deal with errors...
        if (!response.result.returnValue) {
            __log__.error("Error while setting audio conference playback level");
        }
    }, undefined, false);
}

function setAudioNotificationPlaybackDeviceLevel(level) {
    __thisWindowProxy__.setAudioNotificationPlaybackDeviceLevel(level, function (response){
        // TODO: deal with errors...
        if (!response.result.returnValue) {
            __log__.error("Error while setting audio notification playback level");
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

function updateAudioNotificationPlaybackDeviceLevel(level) {
    $("#notification_level").val(level);
}

function updateMicLevel(level) {
    $("#microphone_level").val(level);
}

function updateAudioCaptureMeter(value) {
    var percentage = undefined;
    if (!isDefined(value)) { percentage = 0; }
    else if (value>32768) { percentage = 100; }
    else if (value<0) { percentage = 0; }
    
    if (!isDefined(percentage)) {
        percentage = Math.round((value*100)/32768);    
    }
    
    if (!coreSettings.useAEC && (percentage===100)) {
    	var curLevel = $('#microphone_level').val();
    	var newLevel = Math.floor(curLevel * 0.97);
    	__thisWindowProxy__.setMicLevel(newLevel);
    }
    
    animateMeterBar('#microphone_meter', percentage, 200);
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
    if (tempCoreSettings.enableCfgCodecs) { $.extend(tempCoreSettings, getCodecsSettings()); }
    $.extend(tempCoreSettings, getNetworkAndProtocolsSettings());
    if ((tempCoreSettings.enableSIP && tempCoreSettings.enableCfgSIP) || tempCoreSettings.enableCfgMediaEncryption) { $.extend(tempCoreSettings, getSipSettings()); }
    if ((tempCoreSettings.enableH323 && tempCoreSettings.enableCfgH323) || tempCoreSettings.enableCfgMediaEncryption) { $.extend(tempCoreSettings, getH323Settings()); }
    
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
                    __thisWindow__.setIdleTimeoutSeconds((isDefined(applicationSettings.idleTimeout)) ? applicationSettings.idleTimeout : IDLE_TIMEOUT_DEFAULT*60);
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
    settings.language = getFieldValue("#language");
    settings.autoanswer = getFieldValue("#autoanswer");
    
    var audioNotificationDevice = getFieldValue("#audioNotificationPlaybackDevice");
    if (isDefined(audioNotificationDevice) && audioNotificationDevice.trim().length>0 && (audioNotificationDevice != DEFAULT_NO_DEVICE)) {
        settings.audioNotificationDevice = audioNotificationDevice;
    } else {
        settings.audioNotificationDevice = undefined;
    }
    
    var tempIdleTimeout = 0;
    if ($("#idleEnabled").is(":checked")) {
        tempIdleTimeout = parseInt(getFieldValue("#idleTimeout"))*60;
    }
    
    settings.idleTimeout = tempIdleTimeout;
    return settings;
}

function getGeneralSettings(){
    var settings = {};
    settings.autostart              = getFieldValue("#autostart");
    settings.disableScreensaver     = getFieldValue("#disableScreensaver");
    settings.autoAcceptCallTransfer = getFieldValue("#autoAcceptCallTransfer");
    settings.disableAutoUpdate      = getFieldValue("#disableAutoUpdate");
    return settings;
}

function getAudioSettings(){
    var settings = {};
    settings.micDevice = getFieldValue("#micDevice");
    settings.speakerDevice = getFieldValue("#speakerDevice");
    settings.ringNotifications = getRingNotifications();
    settings.useAEC = getFieldValue("#useAEC");
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

function getCodecsSettings(){
    var settings = {};
    settings.capClassesAudioRxPreference = [];    
    settings.capClassesVideoRxPreference = [];
    settings.videoFormatsRxPreference = [];      
    settings.capClassesH239RxPreference = [];
    $('input.codecCheckbox.rx').each(function(){
        var $this = $(this);
        var codec = $this.attr("codec");
        var codecCategory = $this.attr("codecCategory");
        if ($this.is(":checked")) { 
            switch (codecCategory) {
            	case "audioCodecs"     : settings.capClassesAudioRxPreference.push(codec); break;
            	case "videoCodecs"     : settings.capClassesVideoRxPreference.push(codec); break;
            	case "videoFormats"    : settings.videoFormatsRxPreference.push(codec); break;
            	case "h239VideoCodecs" : settings.capClassesH239RxPreference.push(codec); break;
                default:
                    __log__.warn("Unexpected codec category["+codecCategory+"], discarding codec["+codec+"]");
      		        break;
            }
        }
    });
    
    settings.videoFormatsTxPreference = [];
    settings.capClassesAudioTxPreference = [];
    settings.capClassesVideoTxPreference = [];
    settings.capClassesH239TxPreference = [];
    $('input.codecCheckbox.tx').each(function(){
        var $this = $(this);
        var codec = $this.attr("codec");
        var codecCategory = $this.attr("codecCategory");
        if ($this.is(":checked")) {
            switch (codecCategory) {
                case "audioCodecs"     : settings.capClassesAudioTxPreference.push(codec); break;
                case "videoCodecs"     : settings.capClassesVideoTxPreference.push(codec); break;
                case "videoFormats"    : settings.videoFormatsTxPreference.push(codec); break;
                case "h239VideoCodecs" : settings.capClassesH239TxPreference.push(codec); break;
                default:
                    __log__.warn("Unexpected codec category["+codecCategory+"], discarding codec["+codec+"]");
                    break;
            }
        }
    });

    if (coreSettings.enableH224) { settings.useH224 = getFieldValue("#useH224"); }
    if (coreSettings.enableH239) { 
        settings.useH239 = getFieldValue("#useH239");
        settings.videoPercentageH239 = parseInt(getFieldValue("#videoPercentageH239Value"));
    }
    
    return settings;
}

function getNetworkAndProtocolsSettings(){
    var settings = {};
    if (coreSettings.enableCfgNet) {        
        var selectedIP = $("select#listOfLocalIp").val();
        if (selectedIP == 'auto') {
            settings.autoSelectLocalInterface = true;
        } else {
            settings.autoSelectLocalInterface = false;
            settings.ipLocal = selectedIP;
        }
        settings.ipNAT = getFieldValue("#ipNAT");
        settings.rateUL = getFieldValue("#rateUL")*1000;
        settings.rateDL = getFieldValue("#rateDL")*1000;
        settings.useAutoInBwControl = getFieldValue("#useAutoInBwControl");        
        settings.rtpPortLow = getFieldValue("#rtpPortLow");
        settings.rtpPortHigh = getFieldValue("#rtpPortHigh");
        settings.callControlPortLow = getFieldValue("#callControlPortLow");
        settings.callControlPortHigh = getFieldValue("#callControlPortHigh");
        if (coreSettings.enableQoS) { 
            settings.diffserv = getFieldValue("#diffserv");           
        }
    }
    if (coreSettings.enableRTSP && coreSettings.enableCfgRTSP) {
        settings.useRTSP = getFieldValue("#useRTSP");
    }
    return settings;
}

function getSipSettings(){
    var settings = {};
    if (coreSettings.enableSIP && coreSettings.enableCfgSIP) {
        settings.useSIP = getFieldValue("#useSIP");
        settings.sip_alias = getFieldValue("#sip_alias");
        settings.sip_displayName = getFieldValue("#sip_displayName");
        settings.sip_authUsername = getFieldValue("#sip_authUsername");
        settings.sip_authPassword = getFieldValue("#sip_authPassword");
        settings.sip_localport = getFieldValue("#sip_localport");
        if (coreSettings.enableRegistrar) {
            settings.sip_useRegistrar = getFieldValue("#sip_useRegistrar");
            settings.sip_registrar = getFieldValue("#sip_registrar");
            settings.sip_customportRegistrar = getFieldValue("#sip_customportRegistrar");
            settings.sip_registrar_useTLS = getFieldValue("#sip_registrar_useTLS");
        }
        if (coreSettings.enableOutboundProxy) {
            settings.sip_useOutboundProxy = getFieldValue("#sip_useOutboundProxy");
            settings.sip_outboundProxy = getFieldValue("#sip_outboundProxy");
            settings.sip_customportProxy = getFieldValue("#sip_customportProxy");
            settings.sip_outboundProxy_useTLS = getFieldValue("#sip_outboundProxy_useTLS");
        }
        settings.sip_useUDP = getFieldValue("#sip_useUDP");
        settings.sip_useTCP = getFieldValue("#sip_useTCP");
        settings.sip_useTLS = getFieldValue("#sip_useTLS");
        settings.sip_callEstabTimeout = getFieldValue("#sip_callEstabTimeout");
        settings.sip_enable_RFC3581_UAC = getFieldValue("#sip_enable_RFC3581_UAC");
    }
    if (coreSettings.enableCfgMediaEncryption) {
        settings.sip_mediaEncryption = getFieldValue("#sip_mediaEncryption");
    }
    return settings;
}

function getH323Settings(){
    var settings = {};
    if (coreSettings.enableH323 && coreSettings.enableCfgH323) {
        settings.useH323 = getFieldValue("#useH323");
        settings.disableEarlyH245 = getFieldValue("#disableEarlyH245");
        settings.tunnelingModeH245 = getFieldValue("#tunnelingModeH245");
        settings.h323Name = getFieldValue("#h323Name");
        settings.e164 = getFieldValue("#e164");
        if (coreSettings.enableGK) {
            settings.useGatekeeper = getFieldValue("#useGatekeeper");
            settings.gatekeeper = getFieldValue("#gatekeeper"); 
            if (settings.gatekeeper === '') { settings.gatekeeper = 'Autodiscovery'; }
        }
        if (coreSettings.enableGW) {
            settings.useGateway = getFieldValue("#useGateway");
            settings.gateway = getFieldValue("#gateway");   
        }
    }
    if (coreSettings.enableCfgMediaEncryption) {
        settings.h323_mediaEncryption = getFieldValue("#h323_mediaEncryption");
    }
    return settings;
}

function validateTabData(currentSelectedTabHash) {
    switch (currentSelectedTabHash) {
    	case "#generalTab"             : return validateGeneralSettings(); break;
    	case "#audioTab"               : return validateAudioSettings(); break;
    	case "#videoTab"               : return validateVideoSettings(); break;
    	case "#codecsTab"              : return validateCodecsSettings(); break;
    	case "#networkAdnProtocolsTab" : return validateNetworkAndProtocolsSettings(); break;
    	case "#sipTab"                 : return validateSipSettings(); break;
    	case "#h323Tab"                : return validateH323Settings(); break;
    	default                        : return []; break;
    }
}

function validateGeneralSettings(){ return []; }
function validateAudioSettings(){ return []; }
function validateVideoSettings(){ return []; }
function validateCodecsSettings(){ return []; }
function validateNetworkAndProtocolsSettings(){ return []; }
function validateSipSettings(){ return []; }
function validateH323Settings(){ return []; }

function animateMeterBar(widgetSelector, percentage, duration) {
    var $widget = $(widgetSelector);
    var isMeter = $widget.hasClass('meter');
    if (isMeter) {
        var availableSteps = Math.floor(($widget.width()-2)/6);
        var steps = Math.floor((percentage * availableSteps) / 100);
        percentage = Math.floor((100 * steps) / availableSteps);
    }
    var perc = percentage+'%';    
    $widget.children('.progressBar').css("width",perc);
    if (percentage > 90) {
        $widget.removeClass("green").addClass("red");
    } else {
        $widget.removeClass("red").addClass("green");
    }
}

$(window).load(function() {
    $(window).resize();
    onUpdatedCoreSettings();
    
    __thisWindowProxy__.getApplicationSettings(function(response) {
        originalApplicationSettings = response.result.applicationSettings; // saved for "cancel"
        applicationSettings         = response.result.applicationSettings;        
        initApplicationSettings();
    }, undefined, false);
    
    initAbout();
    
    __thisWindowProxy__.getAppInfo(function(response) {
        appInfo = response.result;
        initAboutProduct();
    }, undefined, false);
    
    if (clientType !== ClientType.ClearSea) {
        __thisWindowProxy__.getLicenseInfo(function(response) {
            licenseInfo = response.result;
            initAboutLicense();
        }, undefined, false);
    }
});

$(window).unload(function(event) { onUnload(); });

function revertAll(onSuccess, onFailure) {    
    // computing core settings changes
    var coreSettingsChanges = $.diff(originalCoreSettings, coreSettings);
    if (!wizard && $.isEmptyObject(coreSettingsChanges.add) && $.isEmptyObject(coreSettingsChanges.mod) && $.isEmptyObject(coreSettingsChanges.del)) {
        __log__.info("|No core settings changes detected, skipping core settings revert.");
        if (isDefinedAsFunction(onSuccess)) { onSuccess("coreSettings"); }
    } else {
        __log__.info("Core settings changes detected ["+$.toJSON(coreSettingsChanges)+"], reverting...");        
        __thisWindowProxy__.setCoreSettings(originalCoreSettings, true, true, true, false, function(response){
            if (response.result.returnValue) {
                coreSettings = originalCoreSettings;
                if (isDefinedAsFunction(onSuccess)) { onSuccess("coreSettings"); }
            } else {
                __log__.warn("Error while saving core settings, reason["+response.result.reason+"]");
                if (isDefinedAsFunction(onFailure)) { onFailure("coreSettings"); }
            }
        }, undefined, true);
    }
    
    // computing application settings changes
    var applicationSettingsChanges = $.diff(originalApplicationSettings, applicationSettings);
    if (!wizard && $.isEmptyObject(applicationSettingsChanges.add) && $.isEmptyObject(applicationSettingsChanges.mod) && $.isEmptyObject(applicationSettingsChanges.del)) {
        __log__.info("No application settings changes detected, skipping application settings save.");
        if (isDefinedAsFunction(onSuccess)) { onSuccess("applicationSettings"); }
    } else {
        __log__.info("Application settings changes detected ["+$.toJSON(applicationSettingsChanges)+"], reverting...");
        __thisWindowProxy__.setApplicationSettings(originalApplicationSettings, function(response) {
            if (response.result.returnValue) {
                applicationSettings = originalApplicationSettings;
                if (_i18n_.getSelectedLanguageCode() !== applicationSettings.language) {
                    _i18n_.setLanguageCode(applicationSettings.language, function(){ translate(); });
                }
//                if (clientType === ClientType.ClearSea) {
                    __thisWindow__.setIdleTimeoutSeconds((isDefined(applicationSettings.idleTimeout)) ? applicationSettings.idleTimeout : IDLE_TIMEOUT_DEFAULT*60);
//                }
                if (isDefinedAsFunction(onSuccess)) { onSuccess("applicationSettings"); }
            } else {
                __log__.warn("Error while saving application settings, reason["+response.result.reason+"]");
                if (isDefinedAsFunction(onFailure)) { onFailure("applicationSettings"); }
            }
        }, undefined, true);
    }
}

function __confirmClose() {
    return wizardConfirmClose;
}

function onUnload(){
    windowsRepository.onUnload(window.name, undefined);
    if (wizard) {
        opener.configuringWithWizard = false;
        opener.setTrayMenu(false, true);
        // due to a critic event sequence, during wizard credentials are not saved properly:
        // when closing we force another setApplicationSettings on index to ensure credential were saved,
        // because we know that in this case authentication was successfully passed
        opener.forceSetApplicationSettings(true); 
        opener.__thisWindow__.show();
    }
    if (onMicSignalPowerNotificationEnabled) {
        __thisWindowProxy__.enableMicSignalPowerNotification(false);
    }
    $("*").unbind(); // remove all listeners to avoid leaks
}

function initApplicationSettings(){
    var options = "";
    for(var languageKey in I18N.availableLanguages) {
        var language = I18N.availableLanguages[languageKey];
        var isSelected = (language.code == _i18n_.getSelectedLanguageCode()) ? ' selected="selected"' : '';
        options += '<option value="'+language.code+'"'+isSelected+'>'+language.label+'</option>';
    }
    $("#language").empty().html(options).bind('change', function(e) {
        var tempApplicationSettings = $.extend(true, {}, applicationSettings);
        tempApplicationSettings["language"] = $("#language").val();

        showSavingMask();
        __thisWindowProxy__.setApplicationSettings(tempApplicationSettings, function(response){
            if (response.result.returnValue) {
                applicationSettings = tempApplicationSettings;
            } else {
                __log__.warn("Error while saving language, restoring previously selected value, reason["+response.result.reason+"]");
                setFieldValue("#language", applicationSettings.language);
            }
            hideSavingMask();
        });
    });
    setFieldValue("#autoanswer", (isDefined(applicationSettings.autoanswer)) ? applicationSettings.autoanswer : false);
    var tempIdleTimeoutMins = IDLE_TIMEOUT_DEFAULT;
    if (isDefined(applicationSettings.idleTimeout)) {
        var tempIdleTimeoutSecs = applicationSettings.idleTimeout;
        if (isNaN(tempIdleTimeoutSecs)) { 
            // error, use default
        } else {
            tempIdleTimeoutMins = Math.floor(tempIdleTimeoutSecs/60);  
        }      
    }
    setFieldValue("#idleTimeout", tempIdleTimeoutMins);
    if (tempIdleTimeoutMins>0) {
        setFieldValue("#idleEnabled", true);
        $("#idleTimeoutConfiguration").show();
    } else {
        setFieldValue("#idleEnabled", false);
        $("#idleTimeoutConfiguration").hide();
    }
    $("#idleEnabled").bind('change', function(e) {
        if ($("#idleEnabled").is(":checked")) {
            var actualTimeout = parseInt(getFieldValue("#idleTimeout"))*60;
            if (isNaN(actualTimeout) || actualTimeout <= 0) {
                setFieldValue("#idleTimeout", IDLE_TIMEOUT_DEFAULT);
            }
            $("#idleTimeoutConfiguration").show();
        } else {
            $("#idleTimeoutConfiguration").hide();
        }
    });
//    if (clientType === ClientType.ClearSea) {
        $("#idleRow").show();
//    } else {
//        $("#idleRow").hide();
//    }
    $("#idleTimeout").keypress(validateNumber).bind('blur', function(e) {
        var $this = $(this);
        var thisVal = $this.val();
        if ((thisVal === "") || isNaN(parseInt(thisVal))) {
            openPopup(
                    "#errorPopup", 
                    _i18n_.getHTML("TITLE_ERROR"), 
                    _i18n_.getHTML("MSG_ERR_IDLE_TIMEOUT_ERROR"),
                    function(){ $this.select().focus(); }
            );
        } else if (((thisVal) < IDLE_TIMEOUT_MIN_VALUE) || ((thisVal) > IDLE_TIMEOUT_MAX_VALUE)) {
            openPopup(
                    "#errorPopup", 
                    _i18n_.getHTML("TITLE_ERROR"), 
                    _i18n_.getHTML("MSG_ERR_IDLE_TIMEOUT_EXCEEDED_ERROR", { "minTimeout":IDLE_TIMEOUT_MIN_VALUE, "maxTimeout":IDLE_TIMEOUT_MAX_VALUE, "timeout":thisVal }), 
                    function(){ $this.val(tempIdleTimeoutMins).select().focus(); }
            );
        }
    });
}

function initGeneral(){
    setFieldValue("#autostart", coreSettings.autostart);
    setFieldValue("#disableScreensaver", coreSettings.disableScreensaver);
    if (clientType === ClientType.ClearSea) {
        $("#autoAcceptCallTransferRow").hide();
        $("#disableAutoUpdateRow").hide();
    } else {
        setFieldValue("#autoAcceptCallTransfer", coreSettings.autoAcceptCallTransfer);
        setFieldValue("#disableAutoUpdate", coreSettings.disableAutoUpdate);
    }
    
};

function initAudio(){
    setFieldValue("#useAEC", coreSettings.useAEC);
    $("#useAEC").change(function(e){
        var settings = {};
        settings["useAEC"] = getFieldValue("#useAEC");
        showSavingMask();
        __thisWindowProxy__.setCoreSettings(settings, false, false, false, false, function(response){
            if (response.result.returnValue) {
                $.extend(coreSettings, settings);
            } else {
                __log__.warn("Error while saving useAEC, restoring previously selected value, reason["+response.result.reason+"]");
            }
            if (coreSettings.useAEC) { $("#microphone_level").attr("disabled","disabled"); }
            else { $("#microphone_level").removeAttr("disabled"); }
            hideSavingMask();
        });
    });
};

function initDeviceSelector(selectorID, coreSettingsPropertyName, list, selected, isAudio, isVideo, onSetSuccess, onSetFailure) {
    var options = "";
    for (var i = 0; i < list.length; i++) {
        var device = list[i];
        var isSelected = (device == selected) ? ' selected="selected"' : '';
        var deviceName = getDeviceName(device);
        options += '<option value="'+device+'"'+isSelected+'>'+deviceName+'</option>';
    }
    $('#'+selectorID).empty().html(options).bind('change', function(e) {
        var settings = {};
        settings[coreSettingsPropertyName] = getFieldValue("#"+selectorID);
        showSavingMask();
        __thisWindowProxy__.setCoreSettings(settings, isAudio, isVideo, false, false, function(response){
            if (response.result.returnValue) {
                jQuery.extend(coreSettings, settings);
                if (isDefinedAsFunction(onSetSuccess)) { onSetSuccess(); }
            } else {
                __log__.warn("Error while saving "+coreSettingsPropertyName+", restoring previously selected value, reason["+response.result.reason+"]");
                setFieldValue("#"+selectorID, coreSettings[coreSettingsPropertyName]);
                if (isDefinedAsFunction(onSetFailure)) { onSetFailure(); }
            }
            hideSavingMask();
        });
  });
    if (isDefinedAsFunction(onSetSuccess)) { onSetSuccess(); }
};

function initRingNotificationDeviceSelector(selectorID, list, selected, isAudio, isVideo, onSetSuccess, onSetFailure) {
    var options = "";
    for (var i = 0; i < list.length; i++) {
        var device = list[i];
        var isSelected = (device == selected) ? ' selected="selected"' : '';
        var deviceName = getDeviceName(device);
        options += '<option value="'+device+'"'+isSelected+'>'+deviceName+'</option>';
    }
    $('#'+selectorID).empty().html(options).bind('change', function(e) {
        var settings = { ringNotifications : getRingNotifications() };
        showSavingMask();
        __thisWindowProxy__.setCoreSettings(settings, isAudio, isVideo, false, false, function(response){
            if (response.result.returnValue) {
                jQuery.extend(coreSettings, settings);
                if (isDefinedAsFunction(onSetSuccess)) { onSetSuccess(); }
            } else {
                __log__.warn("Error while saving "+coreSettingsPropertyName+", restoring previously selected value, reason["+response.result.reason+"]");
                setFieldValue("#"+selectorID, coreSettings[coreSettingsPropertyName]);
                if (isDefinedAsFunction(onSetFailure)) { onSetFailure(); }
            }
            hideSavingMask();
        });
  });
    if (isDefinedAsFunction(onSetSuccess)) { onSetSuccess(); }
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
        __thisWindowProxy__.getMicLevel(function(response){
            if (isDefined(response.result.level)) { updateMicLevel(response.result.level); } 
            else { __log__.error("Error while getting audio capture device level"); }
        });
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
        var selectedCameraDevice = coreSettings.cameraDevice;
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
            $('#test_speakers').removeClass("disabled");
            $('#speakers_level').removeAttr("disabled");
        } else {
            $('#test_speakers').addClass("disabled");
            $('#speakers_level').attr("disabled","disabled");
        }
    });
    
    $('#test_speakers:not(.disabled)').live('click', function(){
        if (isDefined(coreSettings.speakerDevice) && (coreSettings.speakerDevice.trim().length>0) && (coreSettings.speakerDevice != DEFAULT_NO_DEVICE)) {
            __thisWindowProxy__.startNotificationPlayback(coreSettings.speakerDevice, "wav/tone.wav", false);
        }
    });
};

function initAudioNotification(list, selected){
    initRingNotificationDeviceSelector("audioNotificationPlaybackDevice", list, selected, true, false, function(){
        var selectedAudioNotificationDevice = getSelectedNotificationDevice(list);
        saveApplicationSettings();
            
        if (isDefined(selectedAudioNotificationDevice) && (selectedAudioNotificationDevice.trim().length>0) && (selectedAudioNotificationDevice != DEFAULT_NO_DEVICE)) {        
            $('#test_audio_notification').removeClass("disabled");
            $('#notification_level').removeAttr("disabled");            
        } else {
            $('#test_audio_notification').addClass("disabled");
            $('#notification_level').attr("disabled","disabled");
        }
    });
    
    if (wizard) {
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
    });
};

function initFlasherNotification(list, selected){
    initRingNotificationDeviceSelector("flasherDevice", list, selected, false, false, function(){
        var selectedFlasherDevice = getSelectedNotificationDevice(list);
        if (isDefined(selectedFlasherDevice) && (selectedFlasherDevice.trim().length>0) && (selectedFlasherDevice != DEFAULT_NO_DEVICE)) {
            $('#test_flasher_notification').removeClass("disabled");
        } else {
            $('#test_flasher_notification').addClass("disabled");
        }
    });
    
    $('#test_flasher_notification:not(.disabled)').live('click', function(){
        var selectedFlasherDevice = getSelectedNotificationDevice(list);
        if (isDefined(selectedFlasherDevice) && (selectedFlasherDevice.trim().length>0) && (selectedFlasherDevice != DEFAULT_NO_DEVICE)) {
            __thisWindowProxy__.startNotificationPlayback(selectedFlasherDevice, "wav/ringtone_short.wav", false);
        }
    });
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
    $('#open_video_composer').bind('click', function(e) { 
        __thisWindowProxy__.showVideoComposer(true); 
        if ($('#currentVideoCaptureDeviceFormat').html() === "?") {
            $('#currentVideoCaptureDeviceFormat').html("<img src=\"./img/loading_small.gif\"/>");
            setTimeout(refreshVideoCaptureDeviceFormats, 3000);
        }
    });
    
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
    $('#videoCaptureDeviceFormat').empty().html(options).bind('change', function(e) {         
        var $this = $(this);
        var format = getVideoFormatFromValue($this.val());
        var settings = {};
        settings.cameraCaptureWidth         = format.width;
        settings.cameraCaptureHeight        = format.height;
        settings.cameraCaptureNsPerFrame    = format.nsPerFrame;
        settings.cameraCaptureFormat        = format.format;
        showSavingMask();
        __thisWindowProxy__.setCoreSettings(settings, false, true, false, false, function(response){
            if (response.result.returnValue) {
                jQuery.extend(coreSettings, settings);                
                __thisWindowProxy__.getVideoCaptureDeviceFormats(function(response) {
                    if (isDefined(response.result.current)) {                    
                        $('#currentVideoCaptureDeviceFormat').empty().html(getLabelFromVideoFormat(response.result.current));
                    } else {
                        $('#currentVideoCaptureDeviceFormat').empty().html("?");
                    }
                });                
            } else {
                __log__.warn("Error while saving video format, restoring previously selected value, reason["+response.result.reason+"]");                               
                $this.val(getValueFromVideoFormat(configuredFormat));
                $('#currentVideoCaptureDeviceFormat').empty().html(getLabelFromVideoFormat(configuredFormat));
            }
            hideSavingMask();
        });
    });
    
    if (isDefined(selectedFormat)) {
        $('#currentVideoCaptureDeviceFormat').empty().html(getLabelFromVideoFormat(selectedFormat));
    } else {
        $('#currentVideoCaptureDeviceFormat').empty().html("?");
    }
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

function initCodecs(){
    var enableCfgCodecs = coreSettings.enableCfgCodecs;
    if (!enableCfgCodecs) {
        $('#codecsTab').hide();
    } else {
        $('#codecsTab').show();
    }
    
    initAudioCodecs();
    initVideoCodecs();
    initVideoFormats();
    initMiscCodecs();
}

function initAudioCodecs() {
    var rxEnabled       = coreSettings.capClassesAudioRxEnabled;
    var txEnabled       = coreSettings.capClassesAudioTxEnabled;
    var rxPreference    = coreSettings.capClassesAudioRxPreference;
    var txPreference    = coreSettings.capClassesAudioTxPreference;
    if ((rxEnabled.length > 0) || (txEnabled.length > 0)) {
        var html = getRxTxCheckboxHTML('speakers', 'audioCodecs', Codec.audio, rxEnabled, txEnabled, rxPreference, txPreference);
        $('div#audioCodecs').empty().html(html);
        initMultiCheckboxClick('audioCodecs');
    } else {

    }
}

function initVideoCodecs() {
    var rxEnabled       = coreSettings.capClassesVideoRxEnabled;
    var txEnabled       = coreSettings.capClassesVideoTxEnabled;
    var rxPreference    = coreSettings.capClassesVideoRxPreference;
    var txPreference    = coreSettings.capClassesVideoTxPreference;
    if ((rxEnabled.length > 0) || (txEnabled.length > 0)) {
        var html = getRxTxCheckboxHTML('webcam', 'videoCodecs', Codec.video, rxEnabled, txEnabled, rxPreference, txPreference);
        $('div#videoCodecs').empty().html(html);  
        initMultiCheckboxClick('videoCodecs');
    } else {
        
    }
}

function initVideoFormats() {
    var rxEnabled       = coreSettings.videoFormatsRxEnabled;
    var txEnabled       = coreSettings.videoFormatsTxEnabled;
    var rxPreference    = coreSettings.videoFormatsRxPreference;
    var txPreference    = coreSettings.videoFormatsTxPreference;
    if ((rxEnabled.length > 0) || (txEnabled.length > 0)) {
        var html = getRxTxCheckboxHTML('webcam', 'videoFormats', Codec['videoFormat'], rxEnabled, txEnabled, rxPreference, txPreference);
        $('div#videoFormats').empty().html(html);
        initMultiCheckboxClick('videoFormats');
    } else {

    }
}

function initMultiCheckboxClick(category) {
    $('div#'+category+' div.cell.codec.label:not(.disabled)').live('click', function(e) {
        var isMixed = false;
        var checked;
        $('div#'+category+' div.cell.codec:not(.disabled).'+$(e.target).attr('codec')+' input').each(function() {
            if (!isDefined(checked)) {
                checked = $(this).is(':checked');
            } else if (!isMixed && (checked != $(this).is(':checked'))) {
                isMixed = true;
            }
        });
        $('div#'+category+' div.cell.codec:not(.disabled).'+$(e.target).attr('codec')+' input').each(function() {
            $(this).attr('checked', (isMixed) ? true : !$(this).is(':checked'));
        });
    });
    $('div#'+category+' div.cell.codec.label:not(.disabled)').bind('mouseenter', function(e){
        $('div#'+category+' div.cell.codec:not(.disabled).'+$(e.target).attr('codec')).css('background-color', $(e.target).css('background-color'));
    });
    $('div#'+category+' div.cell.codec.label:not(.disabled)').bind('mouseleave', function(e){
        $('div#'+category+' div.cell:not(.disabled).codec.'+$(e.target).attr('codec')).css('background-color', '');
    });
    
    $('div#'+category+' div.cell.codecDirection:not(.disabled)').live('click', function(e) {
        var isMixed = false;
        var checked;
        $('div#'+category+' div.cell.codec:not(.disabled).'+$(e.target).attr('direction')+' input').each(function() {
            if (!isDefined(checked)) {
                checked = $(this).is(':checked');
            } else if (!isMixed && (checked != $(this).is(':checked'))) {
                isMixed = true;
            }
        });
        $('div#'+category+' div.cell.codec:not(.disabled).'+$(e.target).attr('direction')+' input').each(function() {
            $(this).attr('checked', (isMixed) ? true : !$(this).is(':checked'));
        });
    });
    $('div#'+category+' div.cell.codecDirection:not(.disabled)').bind('mouseenter', function(e){
        $('div#'+category+' div.cell.codec:not(.disabled).'+$(e.target).attr('direction')).css('background-color', $(e.target).css('background-color'));
    });
    $('div#'+category+' div.cell.codecDirection:not(.disabled)').bind('mouseleave', function(e){
        $('div#'+category+' div.cell.codec:not(.disabled).'+$(e.target).attr('direction')).css('background-color', '');
    });
}

function getRxTxCheckboxHTML(iconID, codeCategory, codecEnum, rxEnabled, txEnabled, rxPreference, txPreference) {
    var html = '';
    html += getHeaderCodecRowHTML(iconID, codeCategory);
    for (var elem in codecEnum) {
        var rxCodecEnabled = ($.inArray(elem, rxEnabled)>-1);
        var txCodecEnabled = ($.inArray(elem, txEnabled)>-1);
        if (rxCodecEnabled || txCodecEnabled) {
            var rxCodecPreferred = ($.inArray(elem, rxPreference)>-1);
            var txCodecPreferred = ($.inArray(elem, txPreference)>-1);
            html += getCodecRowHTML(elem, codeCategory, codecEnum[elem].label, rxCodecEnabled, txCodecEnabled, rxCodecPreferred, txCodecPreferred);
        }
    }
    return html;
}

function initMiscCodecs() {
    var h224Enabled     = coreSettings.enableH224;
    var h239Enabled     = coreSettings.enableH239;
    var h224Preferred   = coreSettings.useH224;
    var h239Preferred   = coreSettings.useH239;    
    var rxEnabled = coreSettings.capClassesH239RxEnabled;
    var txEnabled = coreSettings.capClassesH239TxEnabled;
    var rxPref    = coreSettings.capClassesH239RxPreference;
    var txPref    = coreSettings.capClassesH239TxPreference;
    if (h224Enabled || h239Enabled) {
        if (h224Enabled) {
            if (h224Preferred) { $('input#useH224').click(); }
        } else {
            $('#enableH224').hide();
        }
        
        if (h239Enabled) {            
            var html = getHeaderCodecRowHTML('presentation', 'h239VideoCodecs');
            for (var h239Codec in Codec.video) {
                var rxCodecEnabled = ($.inArray(h239Codec, rxEnabled)>-1);
                var txCodecEnabled = ($.inArray(h239Codec, txEnabled)>-1);
                if (rxCodecEnabled || txCodecEnabled) {
                    var rxCodecPreferred = ($.inArray(h239Codec, rxPref)>-1);
                    var txCodecPreferred = ($.inArray(h239Codec, txPref)>-1);            
                    html += getCodecRowHTML(h239Codec, 'h239VideoCodecs', Codec.video[h239Codec].label, rxCodecEnabled, txCodecEnabled, rxCodecPreferred, txCodecPreferred);
                }
            }
            $('div#h239VideoCodecs').empty().html(html);
            initMultiCheckboxClick('h239VideoCodecs');
            
            $("#videoPercentageH239").val(coreSettings.videoPercentageH239);
            $("#videoPercentageH239Value").val(coreSettings.videoPercentageH239);
            $("#videoPercentageH239Value").keypress(validateNumber);

            $("#videoPercentageH239Value").change(function(e) {
                var videoPerc = $(this).val();
                if (videoPerc<10) { videoPerc = 10; $(this).val(videoPerc); }
                if (videoPerc>90) { videoPerc = 90; $(this).val(videoPerc); }
                $("#videoPercentageH239").val(videoPerc);
                coreSettings.videoPercentageH239 = videoPerc;
            });
            
            $('input#useH239').change(function(e){
                var checked = $(this).is(":checked");
                if (!checked) {                    
                    disableH239Advanced();
                } else {
                    enableH239Advanced();
                }
            });
            
            if (h239Preferred) { 
                $('input#useH239').attr('checked','checked');
                enableH239Advanced(); 
            } else {
                $('input#useH239').removeAttr('checked');
                disableH239Advanced();
            }
        } else {
            $('#enableH239').hide();
        }
        initMultiCheckboxClick('miscCodecs');
    }
}

function enableH239Advanced() {
    $("#h239VideoCodecs").find('input').removeAttr('disabled');
    $("#videoPercentageH239Value").removeAttr('disabled');
    $("#videoPercentageH239").removeAttr('disabled');
    $("#enableH239").find('div').removeClass('disabled');
}

function disableH239Advanced() {
    $("#h239VideoCodecs").find('input').attr('disabled', 'disabled');
    $("#videoPercentageH239Value").attr('disabled', 'disabled');
    $("#videoPercentageH239").attr('disabled', 'disabled');
    $("#enableH239").find('div').addClass('disabled');
}

function openPopup(popupID, title, message, closeCallback) {
    var $popup = $(popupID);
    $popup.find("div.popupTitle").empty().html(title || "");
    if (isDefined(message)) { $popup.find("div.popupMessage").empty().html(message); }
    $popup.parent('.popupMask').addClass('visible');
    $popup.find("div.close.handler").bind('click', function(event){
        closePopup(popupID);
        if (isDefinedAsFunction(closeCallback)) {
            closeCallback(popupID, event);
        }
    });
}

function closePopup(popupID) {
    var $popup = $(popupID);
    $popup.parent('.popupMask').removeClass('visible');
    $popup.find("div.close.handler").unbind('click');
}

function initNetworkAndProtocols(){
    var enableCfgNet = coreSettings.enableCfgNet;
    if (!enableCfgNet) {
        $('#networkAndProtocolsTab').hide();
    } else {
        $('#networkAndProtocolsTab').show();
    }
    
    // init network
    var rateUL = coreSettings.rateUL;
    var rateDL = coreSettings.rateDL;
    var maxRateUL = coreSettings.maxRateUL;
    var maxRateDL = coreSettings.maxRateDL;
    
    $('select#networkTypes').bind('change', function(e){
        var selected = $(e.target).val();
        allLineIdle = lineRepository.allLineIdle();
        if (selected == 'Custom') {
            if (allLineIdle) { $('input#rateDL').removeAttr('disabled'); }
            $('input#rateDL').val((rateDL / 1000));
            if (allLineIdle) { $('input#rateUL').removeAttr('disabled'); }
            $('input#rateUL').val((rateUL / 1000));
        } else {
            $('input#rateDL').attr('disabled', 'disabled');
            $('input#rateDL').val((Network.type[selected].rx / 1000));
            $('input#rateUL').attr('disabled', 'disabled');
            $('input#rateUL').val((Network.type[selected].tx / 1000));
        }
    });
    
    $("input#rateDL").keypress(validateNumber).bind('blur', function(e) {
        var $this = $(this);
        var thisVal = $this.val();
        if ((thisVal === "") || isNaN(parseInt(thisVal))) {
            openPopup(
                    "#errorPopup", 
                    _i18n_.getHTML("TITLE_ERROR"), 
                    _i18n_.getHTML("MSG_ERR_DL_RATE_EMPTY_ERROR"), 
                    function(){ $this.val(coreSettings.maxRateDL/1000).select().focus(); }
            );
        } else if (((thisVal*1000) < MIN_RATE) || ((thisVal*1000) > coreSettings.maxRateDL)) {
            openPopup(
                    "#errorPopup", 
                    _i18n_.getHTML("TITLE_ERROR"), 
                    _i18n_.getHTML("MSG_ERR_DL_RATE_EXCEEDED_ERROR", { "minRateDL":(MIN_RATE/1000), "maxRateDL":(coreSettings.maxRateDL/1000), "rateDL":thisVal }), 
                    function(){ $this.val(coreSettings.maxRateDL/1000).select().focus(); }
            );
        }
    });
    $("input#rateUL").keypress(validateNumber).bind('blur', function(e) { 
        var $this = $(this);
        var thisVal = $this.val();
        if ((thisVal === "") || isNaN(parseInt(thisVal))) {
            openPopup(
                    "#errorPopup", 
                    _i18n_.getHTML("TITLE_ERROR"), 
                    _i18n_.getHTML("MSG_ERR_UL_RATE_EMPTY_ERROR"), 
                    function(){ $this.val(coreSettings.maxRateUL/1000).select().focus(); }
            );
        } else if (((thisVal*1000) < MIN_RATE) || ((thisVal*1000) > coreSettings.maxRateUL)) {
            openPopup(
                    "#errorPopup", 
                    _i18n_.getHTML("TITLE_ERROR"), 
                    _i18n_.getHTML("MSG_ERR_UL_RATE_EXCEEDED_ERROR", { "minRateUL":(MIN_RATE/1000), "maxRateUL":(coreSettings.maxRateUL/1000), "rateUL":thisVal }), 
                    function(){ $this.val(coreSettings.maxRateUL/1000).select().focus(); }
            );
        }
    });
    

    var networkTypeFound = false;
    for (var networkTypeLabel in Network.type) {
        var networkType = Network.type[networkTypeLabel];
        if ((networkType.rx <= maxRateDL) && (networkType.tx <= maxRateUL)) {
            var selected = '';
            if ((networkType.rx == rateDL) && (networkType.tx == rateUL)) {
                networkTypeFound = true;
                selected = ' selected';
            }
            $('<option value="'+networkTypeLabel+'"'+selected+'>'+networkTypeLabel+'</option>').appendTo('select#networkTypes');
        }
    }
    var customSelected = (networkTypeFound) ? '' : ' selected';
    $('<option value="Custom"'+customSelected+'>Custom</option>').appendTo('select#networkTypes');
    $('select#networkTypes').trigger('change');
    
    var forceAutoInBwControl = coreSettings.forceAutoInBwControl;
    var useAutoInBwControl = coreSettings.useAutoInBwControl;
    setFieldValue('#useAutoInBwControl', useAutoInBwControl);
    if (forceAutoInBwControl) {
        $('input#useAutoInBwControl').attr('disabled', 'disabled');
        setFieldValue('#useAutoInBwControl', true);
    }
    
    // init advanced network
    var autoSelectLocalInterface = coreSettings.autoSelectLocalInterface;
    var ipLocal = coreSettings.ipLocal;
    for (var i = 0; i < listOfLocalIp.length; i++) {
        $('<option value="'+listOfLocalIp[i]+'">'+listOfLocalIp[i]+'</option>').appendTo('select#listOfLocalIp');
    }
    $('<option value="auto">Auto</option>').appendTo('select#listOfLocalIp');
    $('select#listOfLocalIp').val(autoSelectLocalInterface ? 'auto' : ipLocal);    
    
    if ((clientType !== ClientType.StandAlone) && !coreSettings.enableH323) {
        $("div#ipNatRow").hide();
    }
    
    if (clientType === ClientType.ClearSea) {
        $("div#rtpPortRangeRow").hide();
        $("div#callControlPortRangeRow").hide();
    }
    
    if (!coreSettings.enableQoS) {
        $("div#diffservRow").hide();
    }
    $("select#mediaEncryption").val(coreSettings.sip_mediaEncryption);
    if (!coreSettings.enableCfgMediaEncryption) {
        $("select#mediaEncryption").attr('disabled', 'disabled');
    } else {                
        $("select#mediaEncryption").change(function(e){
            var $this = $(this);
            if (coreSettings.enableSIP) { $("input#sip_mediaEncryption").val($this.val()); }
            if (coreSettings.enableH323) { $("input#h323_mediaEncryption").val($this.val()); }
            $this = null;
        });
    }
    
    $('input#ipNAT').val(coreSettings.ipNAT).keypress(validateIp).bind('blur', function(e) { __log__.info("TODO|Validate IP"); });    
    $('input#rtpPortLow').val(coreSettings.rtpPortLow).keypress(validateNumber).bind('blur', function(e) { __log__.info("TODO|Validate port"); });
    $('input#rtpPortHigh').val(coreSettings.rtpPortHigh).keypress(validateNumber).bind('blur', function(e) { __log__.info("TODO|Validate port"); });
    $('input#callControlPortLow').val(coreSettings.callControlPortLow).keypress(validateNumber).bind('blur', function(e) { __log__.info("TODO|Validate port"); });
    $('input#callControlPortHigh').val(coreSettings.callControlPortHigh).keypress(validateNumber).bind('blur', function(e) { __log__.info("TODO|Validate port"); });
    
    $('input#diffserv').val(coreSettings.diffserv).keypress(validateNumber).bind('blur', function(e) { __log__.info("TODO|Validate QoS diffserv"); });
    
    //init protocols
    var SIPEnabled = coreSettings.enableSIP;
    
    var SIPPreferred = coreSettings.useSIP;
    var SIPConfigurable = coreSettings.enableCfgSIP;
    var H323Enabled = coreSettings.enableH323;
    var H323Preferred = coreSettings.useH323;
    var H323Configurable = coreSettings.enableCfgH323;
    var RTSPEnabled = coreSettings.enableRTSP;
    var RTSPPreferred = coreSettings.useRTSP;
    var RTSPConfigurable = coreSettings.enableCfgRTSP;
    
    if ((clientType == ClientType.MCS) || (clientType == ClientType.ClearSea) || (!SIPEnabled && !H323Enabled && !RTSPEnabled)) {
        $('#protocolsFieldset').hide();
    } else {  
        // SIP
        if (SIPEnabled) {           
            $('#useSIP').change(function(e) {
                if ($(this).is(':checked')) { $('#sipTab').removeClass('disabled'); } 
                else { $('#sipTab').addClass('disabled'); }
                initTabs();
            });
            setFieldValue('#useSIP', SIPPreferred);
            $('#useSIP').trigger('change');
        } else { 
            $('#useSIPRow').hide(); 
        }
        // H323
        if (H323Enabled) {
            $('#useH323').change(function(e) {
                if ($(this).is(':checked')) { $('#h323Tab').removeClass('disabled'); } 
                else { $('#h323Tab').addClass('disabled'); }
                initTabs();
            });
            setFieldValue('#useH323', H323Preferred);
            $('#useH323').trigger('change');
        } else { 
            $('#useH323Row').hide(); 
        }
        // RTSP
        if (RTSPEnabled) { 
            setFieldValue('#useRTSP', RTSPPreferred); 
        } else { 
            $('#useRTSPRow').hide(); 
        }
    }
    
};

function initSIP(){
    var SIPEnabled = coreSettings.enableSIP;
    var SIPPreferred = coreSettings.useSIP;
    var SIPConfigurable = coreSettings.enableCfgSIP;
    var enableCfgMediaEncryption = coreSettings.enableCfgMediaEncryption;
    
    if (SIPEnabled && SIPConfigurable) {
        $('#sipTab').show();
        if (SIPPreferred) { 
            $('#sipTab').removeClass('disabled'); 
        } else {
            $('#sipTab').addClass('disabled');
        }
    } else {
        $('#sipTab').hide();
    }
    
    $('div#open_sip_advanced_settings').click(function(e){
        openPopup(
                "#sipAdvancedPopup", 
                _i18n_.getHTML("GUI_CFG_SIPADV_TITLE"), 
                undefined, 
                function(){ }
        );
    });
    
    var enableRegistrar = coreSettings.enableRegistrar;
    if (!enableRegistrar) { $('.sipRegistrar').hide(); }    
    var enableOutboundProxy = coreSettings.enableOutboundProxy;
    if (!enableOutboundProxy) { $('.sipOutboundProxy').hide(); }
    
    $('input#sip_alias').val(coreSettings.sip_alias)
        .bind('blur', function(event){
            var value = $(this).val();
            if (!isDefined(value) || value.trim().length==0) {
                openPopup("#errorPopup", _i18n_.getHTML("TITLE_ERROR"), _i18n_.getHTML("MSG_ERR_SIP_ALIAS_ERROR"), 
                        function(){ $(this).val(coreSettings.sip_alias).select().focus(); }
                );
            }
        })
        .bind('change keyup', function(){ updateLocalSIPURI(); });
    $('input#sip_localport').val(coreSettings.sip_localport)
        .bind('blur', function(event){
            var value = $(this).val();
            if (!isDefined(value) || value.trim().length==0) {
                openPopup("#errorPopup", _i18n_.getHTML("TITLE_ERROR"), _i18n_.getHTML("MSG_ERR_SIP_LOCAL_PORT_ERROR"), 
                        function(){ $(this).val(coreSettings.sip_localPort).select().focus(); }
                );
            }
        })
        .bind('change keyup', function(){ updateLocalSIPURI(); });
    $('input#sip_displayName').val(coreSettings.sip_displayName).keypress(function(event){
        var key = window.event ? event.keyCode : event.which;
        if ((key == 34) || (key == 92)) { return false; }
        return true;
    });
    
    $('input#sip_EnablePresence').attr('checked', coreSettings.sip_EnablePresence);
    $('input#enableIMS').attr('checked', coreSettings.enableIMS);    
    $('input#sip_enable_RFC3581_UAC').attr('checked', coreSettings.sip_enable_RFC3581_UAC);
    $('input#sip_mediaEncryption').val(coreSettings.sip_mediaEncryption);
    
    $('input#sip_callEstabTimeout').val(coreSettings.sip_callEstabTimeout).keypress(validateNumber);

    $('input#sip_useUDP').attr('checked', coreSettings.sip_useUDP).change(function(e){ onSIPTransportsChanged(e); });
    $('input#sip_useTCP').attr('checked', coreSettings.sip_useTCP).change(function(e){ onSIPTransportsChanged(e); });
    $('input#sip_useTLS').attr('checked', coreSettings.sip_useTLS).change(function(e){ onSIPTransportsChanged(e); });
    
    $('input#sip_authUsername').val(coreSettings.sip_authUsername);
    $('input#sip_authPassword').val(coreSettings.sip_authPassword);

    $('input#sip_useRegistrar').change(function(e){
        var checked = $(this).is(":checked");
        if (!checked) { disableSIPRegistrar(); } 
        else { enableSIPRegistrar(); }
        updateLocalSIPURI();
    });
    
    if (coreSettings.sip_useRegistrar) { 
        $('input#sip_useRegistrar').attr('checked','checked');
        enableSIPRegistrar(); 
    } else {
        $('input#sip_useRegistrar').removeAttr('checked');
        disableSIPRegistrar();
    }
    
    $('input#sip_registrar').val(coreSettings.sip_registrar)
        .bind('blur', function(event){
            var value = $(this).val();
            if ($('input#sip_useRegistrar').is(":checked") && (!isDefined(value) || value.trim().length==0)) {
                openPopup("#errorPopup", _i18n_.getHTML("TITLE_ERROR"), _i18n_.getHTML("MSG_ERR_SIP_REGISTRAR_ERROR"), 
                        function(){ $(this).val(coreSettings.sip_registrar).select().focus(); }
                );
            }
        })
        .bind('change keydown', function(){ updateLocalSIPURI(); });
    $('input#sip_customportRegistrar').val(coreSettings.sip_customportRegistrar)
        .keypress(validateNumber)
        .bind('blur', function(event){
            var value = $(this).val();
            if ($('input#sip_useRegistrar').is(":checked") && (!isDefined(value) || value.trim().length==0 || value < 1024 || value > 65535)) {
                openPopup("#errorPopup", _i18n_.getHTML("TITLE_ERROR"), _i18n_.getHTML("MSG_ERR_SIP_REGISTRAR_PORT_ERROR"), 
                        function(){ $(this).val(coreSettings.sip_registrar).select().focus(); }
                );
            }
        });
    $('input#sip_registrar_useTLS').attr('checked', coreSettings.sip_registrar_useTLS);
       
    $('input#sip_useOutboundProxy').change(function(e){
        var checked = $(this).is(":checked");
        if (!checked) { disableSIPOutboundProxy(); } 
        else { enableSIPOutboundProxy(); }
    });
    
    if (coreSettings.sip_useOutboundProxy) { 
        $('input#sip_useOutboundProxy').attr('checked','checked');
        enableSIPOutboundProxy(); 
    } else {
        $('input#sip_useOutboundProxy').removeAttr('checked');
        disableSIPOutboundProxy();
    }
    
    $('input#sip_outboundProxy').val(coreSettings.sip_outboundProxy)
        .bind('blur', function(event){
            var value = $(this).val();
            if ($('input#sip_useOutboundProxy').is(":checked") && (!isDefined(value) || value.trim().length==0)) {
                openPopup("#errorPopup", _i18n_.getHTML("TITLE_ERROR"), _i18n_.getHTML("MSG_ERR_SIP_PROXY_ERROR"), 
                        function(){ $(this).val(coreSettings.sip_outboundProxy).select().focus(); }
                );
            }
        });
    $('input#sip_customportProxy').val(coreSettings.sip_customportProxy)
        .keypress(validateNumber)
        .bind('blur', function(event){
            var value = $(this).val();
            if ($('input#sip_useOutboundProxy').is(":checked") && (!isDefined(value) || value.trim().length==0 || value < 1024 || value > 65535)) {
                openPopup("#errorPopup", _i18n_.getHTML("TITLE_ERROR"), _i18n_.getHTML("MSG_ERR_SIP_PROXY_PORT_ERROR"), 
                        function(){ $(this).val(coreSettings.sip_registrar).select().focus(); }
                );
            }
        });
    $('input#sip_outboundProxy_useTLS').attr('checked', coreSettings.sip_outboundProxy_useTLS);
    
    if (!SIPConfigurable && enableCfgMediaEncryption) {
        $('#sip').find('fieldset#sipRegistrarFieldset').hide();
        $('#sip').find('fieldset#sipOutboundProxyFieldset').hide();
    }    
    
    updateLocalSIPURI();
};

function onSIPTransportsChanged(e) {
    var useUDP = getFieldValue('input#sip_useUDP');
    var useTCP = getFieldValue('input#sip_useTCP');
    var useTLS = getFieldValue('input#sip_useTLS');
    if (!useTLS) {
    	disableSIPRegistrarTLS();
    	$('input#sip_registrar_useTLS').attr('checked', false);
    	disableSIPOutboundProxyTSL();
    	$('input#sip_outboundProxy_useTLS').attr('checked', false);
    } else if (useTLS && !useTCP && !useUDP) {
    	disableSIPRegistrarTLS();
    	$('input#sip_registrar_useTLS').attr('checked', true);
    	disableSIPOutboundProxyTSL();
    	$('input#sip_outboundProxy_useTLS').attr('checked', true);
    } else if (useTLS && (useTCP || useUDP)) {
    	var useRegistrar = getFieldValue('input#sip_useRegistrar');
    	if (useRegistrar) { enableSIPRegistrarTLS(); }
    	var useOutboundProxy = getFieldValue('input#sip_useOutboundProxy');
    	if (useOutboundProxy) { enableSIPOutboundProxyTLS(); }
    }
    updateLocalSIPURI();
};

function enableSIPRegistrar() {
    $('input#sip_registrar').removeAttr('disabled');
    $('input#sip_customportRegistrar').removeAttr('disabled');
    enableSIPRegistrarTLS();
};

function enableSIPRegistrarTLS() {
	var useUDP = getFieldValue('input#sip_useUDP');
    var useTCP = getFieldValue('input#sip_useTCP');
    var useTLS = getFieldValue('input#sip_useTLS');
    if (useTLS && (useTCP || useUDP)) {
    	$('input#sip_registrar_useTLS').removeAttr('disabled');
    	$('span#sip_registrar_useTLS_label').removeClass('disabled');
    }
};

function disableSIPRegistrar() {
    $('input#sip_registrar').attr('disabled', 'disabled');
    $('input#sip_customportRegistrar').attr('disabled', 'disabled');
    disableSIPRegistrarTLS();
};

function disableSIPRegistrarTLS() {
	$('input#sip_registrar_useTLS').attr('disabled', 'disabled');
	$('span#sip_registrar_useTLS_label').addClass('disabled');
};

function enableSIPOutboundProxy() {
    $('input#sip_outboundProxy').removeAttr('disabled');
    $('input#sip_customportProxy').removeAttr('disabled');
    enableSIPOutboundProxyTLS();
};

function enableSIPOutboundProxyTLS() {
	var useUDP = getFieldValue('input#sip_useUDP');
    var useTCP = getFieldValue('input#sip_useTCP');
    var useTLS = getFieldValue('input#sip_useTLS');
    if (useTLS && (useTCP || useUDP)) {
    	$('input#sip_outboundProxy_useTLS').removeAttr('disabled');
    	$('span#sip_outboundProxy_useTLS_label').removeClass('disabled');
    }
}

function disableSIPOutboundProxy() {
    $('input#sip_outboundProxy').attr('disabled', 'disabled');
    $('input#sip_customportProxy').attr('disabled', 'disabled');
    disableSIPOutboundProxyTSL();
};

function disableSIPOutboundProxyTSL() {
	$('input#sip_outboundProxy_useTLS').attr('disabled', 'disabled');
	$('span#sip_outboundProxy_useTLS_label').addClass('disabled');
}

function updateLocalSIPURI() {
	var schema = "sip:";
	var useUDP = getFieldValue('input#sip_useUDP');
    var useTCP = getFieldValue('input#sip_useTCP');
    var useTLS = getFieldValue('input#sip_useTLS');
    if (useTLS && !useTCP && !useUDP) {
    	schema = "sips:";
    } else if (useTLS && (useTCP || useUDP)) {
    	schema = "sip(s):";
    }
    var localIP = coreSettings.ipNAT;
    if (!isDefined(localIP) || (localIP === "0.0.0.0")) { localIP = coreSettings.ipLocal; }
    $("#local_sip_uri", "#sip").val(getLocalSIPURI(
            $('input#sip_alias').val(), 
            localIP, 
            $('input#sip_localport').val(), 
            $('input#sip_useRegistrar').is(":checked") ? $('input#sip_registrar').val() : undefined,
            schema
            ));
    return true;
};

function initH323(){
    var H323Enabled = coreSettings.enableH323;
    var H323Preferred = coreSettings.useH323;
    var H323Configurable = coreSettings.enableCfgH323;
    var enableCfgMediaEncryption = coreSettings.enableCfgMediaEncryption;

    if (H323Enabled && H323Configurable) {
        $('#h323Tab').show();
        if (H323Preferred) { 
            $('#h323Tab').removeClass('disabled'); 
        } else {
            $('#h323Tab').addClass('disabled');
        }
    } else {
        $('#h323Tab').hide();
    }
    
    $('div#open_h323_advanced_settings').click(function(e){
        openPopup(
                "#h323AdvancedPopup", 
                _i18n_.getHTML("GUI_CFG_H323ADV_TITLE"), 
                undefined, 
                function(){ }
        );
    });
    
    $('input#h323Name').val(coreSettings.h323Name)
        .bind('blur', function(event){
            var value = $(this).val();
            if ($('input#useGatekeeper').is(":checked") && (!isDefined(value) || value.trim().length==0)) {
                openPopup("#errorPopup", _i18n_.getHTML("TITLE_ERROR"), _i18n_.getHTML("MSG_ERR_H323_NAME_ERROR"), 
                        function(){ $('input#h323Name').val(coreSettings.h323Name).select().focus(); }
                );
            }
        })
        .bind('change keyup', function(){ updateLocalH323URI(); });
    $('input#e164').val(coreSettings.e164).keypress(validateE164)
        .bind('change keyup', function(){ updateLocalH323URI(); });

    $('input#disableEarlyH245').attr('checked', coreSettings.disableEarlyH245);
    $('select#tunnelingModeH245').val(coreSettings.tunnelingModeH245);
    //$('select#h323_mediaEncryption').val(coreSettings.h323_mediaEncryption);
    $('input#h323_mediaEncryption').val(coreSettings.h323_mediaEncryption);
    
    // gatekeeper
    if (!coreSettings.enableGK) { $('#h323GatekeeperFieldset').hide(); } 
    var useGatekeeper = coreSettings.useGatekeeper;
    if (coreSettings.forceGK) { 
        useGatekeeper = true; 
        $('input#useGatekeeper').attr('disabled', 'disabled');
    }

    var gatekeeperAutodiscovery = false;    
    if (coreSettings.gatekeeper == 'Autodiscovery' ) { gatekeeperAutodiscovery = true; }
    $('input#gatekeeperAutodiscovery').bind('change', function(event) { setH323GatekeeperAutodiscoveryEnable($(event.target).is(':checked')); }); 
    $('input#gatekeeperAutodiscovery').attr('checked', gatekeeperAutodiscovery);    
    setH323GatekeeperAutodiscoveryEnable(gatekeeperAutodiscovery);   
    
    $('input#useGatekeeper').bind('change', function(event){ 
        setH323GatekeeperEnable($(event.target).is(':checked'));
        updateLocalH323URI();
        var h323Name = $('input#h323Name').val();
        if (!isDefined(h323Name) || h323Name.trim().length==0) {
            openPopup("#errorPopup", _i18n_.getHTML("TITLE_ERROR"), _i18n_.getHTML("MSG_ERR_H323_NAME_ERROR"), 
                    function(){ $('input#h323Name').val(coreSettings.h323Name).select().focus(); }
            );
            return;
        }
        var e164 = $('input#e164').val();
        if (!isDefined(e164) || e164.trim().length==0) {
            openPopup("#errorPopup", _i18n_.getHTML("TITLE_ERROR"), _i18n_.getHTML("MSG_ERR_H323_E164_ERROR"), 
                    function(){ $('input#e164').val(coreSettings.e164).select().focus(); }
            );
            return;
        }
    });
    $('input#useGatekeeper').attr('checked', useGatekeeper); 
    setH323GatekeeperEnable(useGatekeeper);
    
    $('input#gatekeeper').val(gatekeeperAutodiscovery ? '' : coreSettings.gatekeeper);
      
    
    // gateway
    if (!coreSettings.enableGW) { $('#h323GatewayFieldset').hide(); }
    var useGateway = coreSettings.useGateway;
    if (coreSettings.forceGW) { 
        useGateway = true; 
        $('input#useGateway').attr('disabled', 'disabled');
    }
    $('input#useGateway').bind('change', function(event){ setH323GatewayEnable($(event.target).is(':checked')); }); 
    $('input#useGateway').attr('checked', useGateway);
    setH323GatewayEnable(useGateway);   
    $('input#gateway').val(coreSettings.gateway);
    
    updateLocalH323URI();
};

function setH323GatekeeperAutodiscoveryEnable(enabled) {
    if (enabled) {
        $('input#gatekeeper').val('');
        $('input#gatekeeper').attr('disabled', 'disabled');
    } else {
        $('input#gatekeeper').removeAttr('disabled');
    }
};

function setH323GatekeeperEnable(enabled) {
    if (enabled) {
        $('input#gatekeeperAutodiscovery').removeAttr('disabled');
        setH323GatekeeperAutodiscoveryEnable($('input#gatekeeperAutodiscovery').is(':checked'));
        $('input#useGateway').attr('checked', false);
        setH323GatewayEnable(false);
    } else {
        $('input#gatekeeperAutodiscovery').attr('disabled', 'disabled');
        $('input#gatekeeper').attr('disabled', 'disabled');
    }
};

function setH323GatewayEnable(enabled) {
    if (enabled) {
        $('input#gateway').removeAttr('disabled');
        $('input#useGatekeeper').attr('checked', false);
        setH323GatekeeperEnable(false);
    } else {
        $('input#gateway').attr('disabled', 'disabled');
    }
};

function updateLocalH323URI() {
    var localIP = coreSettings.ipNAT;
    if (!isDefined(localIP) || (localIP === "0.0.0.0")) { localIP = coreSettings.ipLocal; }
    $("#local_h323_uri", "#h323").val(getLocalH323URI(
            $('input#h323Name').val(), 
            $('input#e164').val(),
            localIP, 
            $('input#useGatekeeper').is(":checked") ? $('input#gatekeeper').val() : undefined
            ));
    return true;
};

function initAbout() {
    if (!wizard) { 
        $("#aboutTab").show();
        $("#aboutLogo").click(function(event){
            __thisWindow__.openInSystemBrowser("http://www.mirial.com");
        });
    }
    
    if (clientType === ClientType.ClearSea) { 
        // hiding licensing info and removing animated gif to save cpu
        $("#aboutLicenseFieldset").hide().find("div.controlDescription").removeClass("loading");
    }
    
    $("#additionalCopyrightsNotices").click(function(event){
        var resourcesPath = __thisWindow__.getResourcesPath();
        __thisWindow__.openInSystemBrowser("file:///"+resourcesPath+"additional_copyrights_notices.txt");
    });
}

function initAboutProduct(){
    var productInfoHTML = "<p class=\"first\">"+_i18n_.getHTML(
            "GUI_CFG_ABOUT_PRODUCT_LABEL", 
            { 
                "license_type" : appInfo.name, 
                "product_version" : appInfo.version,
                "build_number" : appInfo.buildNumber
            })+"</p>";
    productInfoHTML += "<p class=\"last\">"+_i18n_.getHTML("GUI_CFG_ABOUT_COPYRIGHT_LABEL")+"</p>";
    $("div.about.controlDescription", "#aboutProductFieldset").removeClass("loading").empty().html(productInfoHTML);
};

function initAboutLicense(){
    var licenseInfoHTML = "<p class=\"first last\">"+_i18n_.getHTML(
            "GUI_CFG_ABOUT_LICENSE_LABEL", 
            { 
                "license_id" : licenseInfo.id+" - "+licenseInfo.type, 
                "license_owner_string" : licenseInfo.company+" ("+licenseInfo.owner+")"
            })+"</p>";
    $("div.about.controlDescription", "#aboutLicenseFieldset").removeClass("loading").empty().html(licenseInfoHTML);
};


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

function disableButtons() {
    $('div.button#ok').addClass('disabled').removeClass('green');
    $('div.button#apply').addClass('disabled');
    $('div.button#cancel').addClass('disabled');
}

function enableButtons() {
    $('div.button#ok').removeClass('disabled').addClass('green');
    $('div.button#apply').removeClass('disabled');
    $('div.button#cancel').removeClass('disabled');
}

function enableFields() {
    $('input').removeAttr('disabled');
    $('input').removeClass('disabled');
}

function disableFields() {
    $('input').attr('disabled', 'disabled');
    $('input').addClass('disabled');
}

function showSavingMask() {
    $('#savingMask').fadeIn('fast');
    uninitTabs();
    disableButtons();
}

function hideSavingMask() {
    $('#savingMask').fadeOut('fast');
    initTabs();
    enableButtons();
}

function getHeaderCodecRowHTML(iconCellID, codecCategory) {
    var html = '<div class="row header">';
    html += '<div class="header cell"></div>';
    html += '<div direction="rx" codecCategory="'+codecCategory+'" class="content label header cell codecDirection '+codecCategory+'">RX</div>';
    html += '<div direction="tx" codecCategory="'+codecCategory+'" class="content label header cell codecDirection '+codecCategory+'">TX</div>';
    html += '</div>';
    return html;
}

function getCodecRowHTML(codec, codecCategory, codecLabel, rxEnabled, txEnabled, rxPreferred, txPreferred) {
    var html = '<div codec="'+codec+'" class="row codec">';
    html += '<div codec="'+codec+'" class="label cell codec '+codecCategory+'">'+codecLabel+'</div>';
    html += '<div direction="rx" codecCategory="'+codecCategory+'" codec="'+codec+'" class="content cell codec rx '+codec+' checkbox '+codecCategory+'">';
    if (rxEnabled) { 
        html += '<input type="checkbox" class="codecCheckbox rx" codec="'+codec+'" codecCategory="'+codecCategory+'"';
        if (rxPreferred) { html += ' checked'; }
        html += '/>'; 
    }
    html += '</div>';
    html += '<div direction="tx" codecCategory="'+codecCategory+'" codec="'+codec+'" class="content cell codec tx '+codec+' checkbox '+codecCategory+'">';
    if (txEnabled) { 
        html += '<input type="checkbox" class="codecCheckbox tx" codec="'+codec+'" codecCategory="'+codecCategory+'"';
        if (txPreferred) { html += ' checked'; }
        html += '/>'; 
    }
    html += '</div>';
    html += '</div>';
    return html;
}

function onUpdatedCoreSettings() {
    showSavingMask();
    __thisWindowProxy__.getCoreSettings(function(response){ 
        if (isDefined(response.result.coreSettings)) {
            onUpdatedCoreSettings_(response.result.coreSettings);
        } else {
            __log__.error("Can't load coreSettings, reported error ["+response.result.error+"]");
        }
        hideSavingMask();
    });
}

function onUpdatedCoreSettings_(tempCoreSettings) {
    originalCoreSettings = tempCoreSettings; // saved for "cancel"
    coreSettings         = tempCoreSettings;
    initGeneral();
    initAudio();
    updateAudioCaptureDevices();
    updateAudioPlaybackDevices();
    updateVideoDevices();
    updateNotificationDevices();
    initCodecs();
    __thisWindowProxy__.getListOfLocalIp(function(response) {
        listOfLocalIp = response.result.returnValue; 
        initNetworkAndProtocols();
    });
    initSIP();
    initH323();
    
    allLineIdle = lineRepository.allLineIdle();
    setInCall(!allLineIdle); 
}

var Codec = {
    audio: {
            "G7231" : { label: "G.723.1" },
            "G711A" : { label: "G.711A" },
            "G711u" : { label: "G.711&mu;" },
            "G728"  : { label: "G.728" },
            "G729"  : { label: "G.729" },
            "AMR"   : { label: "AMR" },
            "G722"  : { label: "G.722" },
            "G7221" : { label: "G.722.1" },
            "G7221C": { label: "G.722.1/C" }
    },
    video: {
            "H261": { label: "H.261" },
            "H263": { label: "H.263" },
            "H264": { label: "H.264" }
    },
    videoFormat: {
            "SQCIF": { label: "SQCIF (128x96)" },
            "QCIF" : { label: "QCIF (176x144)" },
            "CIF"  : { label: "CIF (352x288)" },
            "CIF4" : { label: "4CIF (704x576)" },
            "QHD"  : { label: "QHD (960x540)" },
            "720P" : { label: "720p (1280x720)" },
            "1080P": { label: "1080p (1920x1080)" }
    },
    misc: {
            "H224": { label: "H.224" },
            "H239": { label: "H.239" }
    }
};

var Network = {
        type: {
            "128k":     { rx:128000,   tx:128000 },
            "256k":     { rx:256000,   tx:256000 },
            "384k":     { rx:384000,   tx:384000 },
            "512k":     { rx:512000,   tx:512000 },
            "768k":     { rx:768000,   tx:768000 },
            "1280k":    { rx:1280000,  tx:1280000 },
            "1472k":    { rx:1472000,  tx:1472000 },
            "1920k":    { rx:1920000,  tx:1920000 },
            "2048k":    { rx:2048000,  tx:2048000 },
            "3072k":    { rx:3072000,  tx:3072000 },
            "4096k":    { rx:4096000,  tx:4096000 }
        }
};

function translate() {
    _i18n_.translate();
//    var documentTitle = _i18n_.get("GUI_PRIMARY_TITLE");
//    if (wizard) {
//        documentTitle += " - " + _i18n_.get("GUI_WIZARD_TITLE");
//    } else {
//        documentTitle += " - " + _i18n_.get("GUI_CFG_TITLE");
//    }
    var documentTitle = "";
    if (wizard) {
        documentTitle += _i18n_.get("GUI_WIZARD_TITLE");
    } else {
        documentTitle += _i18n_.get("GUI_CFG_TITLE");
    }
    document.title = documentTitle;    
    $(window).resize();
}
