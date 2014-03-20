/*MIRIAL VARS*/
var UiStatus = {
        unknown : "unknown",
        initializing : "initializing",
        initialized : "initialized",
        quitting : "quitting"        
};
var currentUiStatus = UiStatus.unknown;
var consoleWindow = undefined;
var waiting = 0;
var currentWidth = undefined;
var currentHeight = undefined;
var availableLines = undefined;
var remotePartiesInfo = {};
var lines = {};
var clientType = ClientType.Standalone;
var isServerRequired = false;
var lineRepository = new LineRepository();
var windowsRepository;
var contactsNeedSync = false;
var historyNeedSync = false;
var purpleMailNeedsSync = true; //PNG-297 KTRUMBLE 09062012 we always want purplemail to refresh when accessed, for now.
var settingsNeedSync = true;//PNG-1029 KTRUMBLE 04182013 - auto sync settings with server on a timer
var coreSettingsAvailable = false;
var coreSettings = undefined;
var appInfo = undefined;
var licenseInfo = undefined;
var defaultApplicationSettings = {
    "enableMessageEnhancing": true,
    "autoanswer":false,
    "contacts":{ 
        "groupByStatus":true, 
        "showUnavailable":false 
    },
    "history":{ "showMissed":true, "showInbound":true, "showOutbound":true},
    "language":"en_US",
    "windowsGeometries":{},
    "videoonlyGeometries": {
        "x":0,
        "y":0,
        "width":400,
        "height":400
    },
    "composerSizeIndex": 6,
    "alwaysOnTopDuringCall": false,
    "minimizeOnLogon": false
};
var applicationSettings = defaultApplicationSettings;
var bodyScrollbarWidth = 5;
var authenticatedUserStatus = 'unknown';
var clearseaAuthenticatedUserStatus = 'unknown';
var chatWithUnreadMessages = {};
var enqueuedCall = [];
var idleSince = new Date();
var isIdle = false;
var iconModifier = undefined;
var currentPopUpId = undefined;
var canConfirmClose = false;
var closeForRealTimeout = undefined;
var updateWasForced = false;
var configuringWithWizard = false;
var firstAuth = true;
var callLockTimeout = undefined;
var switchToDialingTimeout = undefined;
var callsLocked = false;
var transcodingInProgressPopupOpen = false;
var logoutAvailable = false;
var realCloseIssued = false;
var savingApplicationSettingsForQuit = false;
var geometryChangedTimeout = undefined;
var sAuthType = "";

/*PURPLE VARS*/
var animateFuelBarInterval = null;
var composerReady = false;
var menuState = 'open';
var setupNetID = null;
var nav = "Call";
var format = "default";
var numberToBlock = null;
var numberToUnblock = null;
//(From settings)
var originalCoreSettings;
var originalApplicationSettings;
var avatarFileSizeLimit = 51200;//WKRASKO 082212 - PNG-306, old value: 102400;
var avatarDimensionLimit = 256;//WKRASKO 082212 - PNG-306, new limit
var avatarOldSrc = null;
var avatarOldWidth = null
var avatarOldHeight = null;
var oldUserProfile = null;
//session call vars
var terpLang = "english";
var announceRelay = false;
var spInstructions = "";
var vcoNumber = "";
var vcoExt = "";
var onCall = false;
var fullScreen = false;//WKRASKO 103012 - PNG-380, Purple implemented full screen mode. Involves added button in index, styles in global.css, and changes using var below.
//Checkup intervals
var checkContactsInterval = null;
var checkPMInterval = null;
var checkHistoryInterval = null;
var CHECK_CONTACTS_INTERVAL = 180000;
var CHECK_PM_INTERVAL = 180000;
var CHECK_HISTORY_INTERVAL = 300000;
var CHECK_SETTINGS_INTERVAL = 180000;//PNG-1029 KTRUMBLE 04182013 - auto sync settings with server on a timer
var MAX_NUMBERS_PER_CONTACT = 7;
//Temporary line storage for missed calls dialog, I know the line class has this info, but it's whiped at the point of a missed call!
var lineInfo = {
    "0": null,
    "1": null
};
var isMin = "false";
var callMinimized;
var recordEditMenuTimeout = null;
var regStatus = null;
var shortTruncLength=0;
var longTruncLength=0;
var fullFirst=null;
var fullLast=null;
var fullLongName=null;
var vrs10D = "8774674877";
var vri10D = "8552523398";
var isRedirect = false;
var offCallToggle=false; //KTRUMBLE 09282012 PNG-479
var dialFieldWithFocus=null; //PNG-471 KTRUMBLE 10052012 - incall dialer
var dialingDotsInterval; //PNG-511 KTRUMBLE 10042012 - adding a global for cancellation
var chatTranscriptsAvailable=false; //PNG-513 KTRUMBLE 10222012 - adding chat transcript button
var P2PChatEnabled = false;//PNG-186 KTRUMBLE 10302012 - Add P2PChat
var outgoingP2PURI=null;
var clickToCall = false;
var clickToCall10D = "";
var attemptingUpdate = false;//PNG-676 KTRUMBLE 11082012 - do not show default server timeout if attempting to update
var scrollPositions = {//WKRASKO 111512 - PNG-716//PNG-935 KTRUMBLE 04162013 - fix div scroll position function; was setting the position to 0 every time
    "Contacts": 0,
    "Favorites": 0,
    "History": 0,
    "PurpleMail": 0
}
var isThreeWay = false;
var IPRelayToggle = "VRS";
var vc_has_moved = false;
var contactEditMenuRight = 14;//different for windows and mac, unfortunately
var currentEditContact = '';
//WKRASKO 121712 - PNG-793, spanish months in history.
var enToEsMonthMap = {
    Jan: "Ene",
    Feb: "Feb",
    Mar: "Mar",
    Apr: "Abr",
    May: "Pue",
    Jun: "Jun",
    Jul: "Jul",
    Aug: "Ago",
    Sep: "Sep",
    Oct: "Oct",
    Nov: "Nov",
    Dec: "Dic"
}

var badLoginAttempt = false;
var callGroupArray = new Array();

function resetVars() {
    currentUiStatus = UiStatus.unknown;
    consoleWindow = undefined;
    waiting = 0;
    currentWidth = undefined;
    currentHeight = undefined;
    availableLines = undefined;
    remotePartiesInfo = {};
    lines = {};
    //clientType = ClientType.Standalone;
    lineRepository = new LineRepository();
    contactsNeedSync = false;
    historyNeedSync = false;
    purpleMailNeedsSync = true;//PNG-297 KTRUMBLE 09062012 we always want purplemail to refresh when accessed, for now.
    settingsNeedSync = true;//PNG-1029 KTRUMBLE 04182013 - auto sync settings with server on a timer
    coreSettingsAvailable = false;
    coreSettings = undefined;
    //appInfo = undefined;
    licenseInfo = undefined;
    defaultApplicationSettings = {
            "enableMessageEnhancing": true,
            "autoanswer":false,
            "contacts":{ 
                "groupByStatus":true, 
                "showUnavailable":false 
            },
            "history":{ "showMissed":true, "showInbound":true, "showOutbound":true},
            "language":_i18n_.getDefaultLanguageCode(),
            "windowsGeometries":{},
            "videoonlyGeometries": {
                "x":0,
                "y":0,
                "width":400,
                "height":400
            },
            "alwaysOnTopDuringCall":false,
            "minimizeOnLogon":false
        };
    //applicationSettings = defaultApplicationSettings;
    bodyScrollbarWidth = 5;
    authenticatedUserStatus = 'unknown';
    chatWithUnreadMessages = {};
    enqueuedCall = [];
    idleSince = new Date();
    isIdle = false;
    /*iconModifier = "p3-tng-icon-32";*/
    currentPopUpId = undefined;
    canConfirmClose = false;
    closeForRealTimeout = undefined;
    updateWasForced = false;
    configuringWithWizard = false;
    firstAuth = true;
    callLockTimeout = undefined;
    switchToDialingTimeout = undefined;
    callsLocked = false;
    transcodingInProgressPopupOpen = false;
    logoutAvailable = false;
    realCloseIssued = false;
    savingApplicationSettingsForQuit = false;
    sipRegisterRequested = false;
    //transit.reset();
    endpointStatuses = {
            sip:{
                status:Event.endpointNotificationType.UNKNOWN,
                reason:undefined,
                server:undefined
            },
            h323:{
                status:Event.endpointNotificationType.UNKNOWN,
                reason:undefined,
                server:undefined
            }
    };
    
    composerReady = false;
    scrollPositions = {//WKRASKO 111512 - PNG-716
        "favoritesList": 0,
        "historyList": 0,
        "purpleMailMessages": 0
    }
    badLoginAttempt = false;
    //WKRASKO 031413 - Support auto dialing for test
    clearTimeout(autocallInterval); autocallInterval = null;
}

function resetWindow(){
    setTrayMenu(true, true);
    $('#terpChat_wrap').html('');
    $('#NewCallBtn').click();
    if(!$('#dialViewer').is(':visible')) $('#dialSectionHead').click();//PNG-884 KTRUMBLE 03012013
    $('#historyList div.innerbox').empty();//PNG-226 KTRUMBLE 071112
    resetTemplateContent();//PNG-226 KTRUMBLE 071112
    chatTranscriptsAvailable=false;
    //WKRASKO 080312 - PNG-307, Reset avatars for possible new user
    $('#footer_avatar').attr('src','img/spacer.gif');
    $('#settings_profile_avatar').attr('src','img/spacer.gif');
    if (getCurrentOS() == OSType.MacOS) createPMFile('emptyFile',null,null,null);//PNG-1085 KTRUMBLE 04212013 - clear PM msg file on signout
    $('#purpleMailMessages').html('<div id="noMsg"><span class="noMsgInner i18n" data-i18n_key="GUI_PM_NOMESSAGES">No messages.</span></div>');//PNG-1085 KTRUMBLE 04212013 - clear PM container on signout
}

function resetTemplateContent(){//PNG-226 KTRUMBLE 071112
    $('#activeCallRowContent').empty();
    $("#activeCallRowTemplate").template("activeCallRowTemplate");
    $("#activeCallRowTemplateControls").template("activeCallRowTemplateControls");
    $('#incomingCallContent').empty();
    $("#incomingCallRowTemplate").template("incomingCallRowTemplate");
    $('#callMimizedInfo').empty();
    $('#activeCallMimizedTemplate').template("activeCallMimizedTemplate");
}

window.onresize = function () {
    var $window = $(window);
    if (($window.width() !== currentWidth) || ($window.currentHeight() !== currentHeight)) {
        if ($("#incomingCall").is(":visible")) { repositionPopUpEnvironment("#incomingCall"); }
        if ($("#startupMask").is(":visible") && $(".ui-autocomplete").is(":visible")) { $("#loginUsername").autocomplete("search"); }
    }
    if ($window.width() !== currentWidth) {
        setContentMaxWidth($window);
    }
    if ($window.height() !== currentHeight) {
        setContentHeight($window);
    }
    if (!isDefined(currentWidth)) { currentWidth === $window.width(); }
    if (!isDefined(currentHeight)) { currentHeight === $window.height(); }

    if (isDefined(geometryChangedTimeout)) { clearTimeout(geometryChangedTimeout); geometryChangedTimeout = undefined; }
    geometryChangedTimeout = setTimeout(onGeometryChanged, 500);
};

function __windowMoved() { 
    if (isDefined(geometryChangedTimeout)) { clearTimeout(geometryChangedTimeout); geometryChangedTimeout = undefined; }
    geometryChangedTimeout = setTimeout(onGeometryChanged, 500);
}

function onGeometryChanged() {
    if (isDefined(geometryChangedTimeout)) { geometryChangedTimeout = undefined; }
    saveWindowGeometry("main:main", getCurrentGeometry());
}

function setContentHeight($window){
    if (!isDefined($window)) { $window = $(window); }
    setVideoDimension();
    $('#mainContainer').height( $window.height()-73 );//159 = top bar + footer height
    if($('#contacts').css('padding-top')=="0px"){
        $('#mainContacts #contacts').height( $('#mainContacts').height()-$('#alphas').height()-1 );
        $('#mainContacts #favoritesList').height( $('#mainContacts').height()-$('#alphas').height()-1 );
    } else {
        $('#mainContacts #contacts').height( $('#mainContacts').height()-$('#alphas').height()-21 );
        $('#mainContacts #favoritesList').height( $('#mainContacts').height()-$('#alphas').height()-21 );//20, first alpha header spacing.
    }
    $('#historyList').height( $('#mainHistory').height()-$('#historyBuckets').height()-23 );//23, you got me!
    var mainCallVC_height =  parseInt($('#mainCall').height())-parseInt($('#mainCall_controls').height());
    $('#mainCall_vc').height(mainCallVC_height);
    $('#purpleMailMessages').height( $('#mainPurpleMail').height()-$('#pmHeader').height()-1 );
    if (applicationSettings.mode == "kiosk") { //chat window height
        $('#kiosk_flyout .scrollarea').height($window.height() - 386);
        if ($('#kiosk_mainarea').hasClass('connected')) {
            $('textarea#specialInstructions').height($window.height() - 778 - 56);
            $('#specialInstructionsDiv').css({'top' : 583});
        } else {
            $('textarea#specialInstructions').height($window.height() - 778);
            $('#specialInstructionsDiv').css({'top' : 553});
        }

        $('#terpChat_content').height($window.height()- 326);
    } else if (getPlatform() == "VRI") { // VRI mode
        $('#terpChat_content').height($window.height()-192);
    } else {
        $('#terpChat_content').height($window.height()-206);
    }
}

function setContentMaxWidth($window){
    if (!isDefined($window)) { $window = $(window); }
    setMainContentMaxWidth($window);
}

function setVideoDimension(){
    if (applicationSettings.mode == "kiosk" && !vc_has_moved) { //set video dimension
        var h = parseInt($('#contentDiv').height()) - 199;
        var w = parseInt($('#contentDiv').width()) - 557;
        var t = 174;  //top buffer
        var l = 99;   //left buffer
        var r = 183; //right buffer
        var b = 100; //bottom buffer

        var maxwidth = 704; //applicationSettings.mode == "kiosk");
        var maxheight = 576; //applicationSettings.mode == "kiosk");

        if (typeof applicationSettings.maxkioskvideowidth !== 'undefined') { maxwidth = applicationSettings.maxkioskvideowidth; }
        if (typeof applicationSettings.maxkioskvideoheight !== 'undefined') { maxheight = applicationSettings.maxkioskvideoheight; }


        //console.log('width: ' + maxwidth + ' >> height:' + maxheight);
        if (w > maxwidth) //twice CIF width of 352px each
        {
            padding = (w - maxwidth) / 2;
            w = maxwidth;
            l += padding;
            r += padding;
        }
        if (h > maxheight) //twice CIF height of 288px each
        {
            padding = (h - 576) / 2;
            h = maxheight;
            t += padding;
            b += padding;
        }

        $('#MyVideoConferenceWidget').height(h);
        $('#MyVideoConferenceWidget').width(w);
        $('#MyVideoConferenceWidget').css({ 'top': t, 'left': l, 'right': r, 'bottom': b });

        $('#videoPrivacySlide').height(h);
        $('#videoPrivacySlide').width(w);
        $('#videoPrivacySlide').css({ 'top': t, 'left': l, 'right': r, 'bottom': b });
    } else if (getPlatform() == "VRI" && !vc_has_moved) { // VRI mode
        var h = parseInt($('#contentDiv').height()) - 85;
        var w = parseInt($('#contentDiv').width()) - 343;
        var t = 85;  //top buffer
        var l = 40;   //left buffer
        var r = 303; //right buffer
        var b = 20; //bottom buffer

        /*  if maximum size is required, use this:
        var maxwidth = 704; 
        var maxheight = 576; 

        if (w > maxwidth) //twice CIF width of 352px each {
            padding = (w - maxwidth) / 2;
            w = maxwidth;
            l += padding;
            r += padding;
        }
        if (h > maxheight) //twice CIF height of 288px each {
            padding = (h - 576) / 2;
            h = maxheight;
            t += padding;
            b += padding;
        }
        */

        $('#videoPrivacySlide').css({ 'margin-top': 0, 'top': parseInt(h / 2), 'left': l, 'width': w, 'height': 0 });
        $('#MyVideoConferenceWidget').height(h);
        $('#MyVideoConferenceWidget').width(w);
        $('#MyVideoConferenceWidget').css({ 'top': t, 'left': l, 'right': r, 'bottom': b });
    } else if (!fullScreen && !vc_has_moved) {
        var h = parseInt($('#contentDiv').height()) - 52;
        var w = parseInt($('#contentDiv').width()) - 459;
        //console.log("height: " + $(window).height() + "   width: " + $(window).width());
        $('#MyVideoConferenceWidget').height(h);
        $('#MyVideoConferenceWidget').width(w);
        $('#videoPrivacySlide').height(h); //PNG-871 KTRUMBLE 02282013
        $('#videoPrivacySlide').width(w);
        $('#videoPrivacySlideIcon').css({ 'margin-top': parseInt(h / 2) - 18 }); //PNG-871 KTRUMBLE 02282013
        $('#MyVideoConferenceWidget').css({ 'top': 82, 'left': 185, 'right': 193, 'bottom': 100 });
    }
    else if (fullScreen) {
        //console.log('window width: ' + $(window).width());
        if ($(window).width() < 518) {
            $('#MyVideoConferenceWidget').css({ 'top': 125, 'left': 0 }).width('100%');
            $('#MyVideoConferenceWidget').css({ 'height': parseInt($('#contentDiv').height()) - 52 });
        } else {
            $('#MyVideoConferenceWidget').css({ 'top': 82, 'left': 0 }).width('100%');
            $('#MyVideoConferenceWidget').css({ 'height': parseInt($('#contentDiv').height()) - 2 });
        }
    }
}

function setMainContentMaxWidth($window){
    if (!isDefined($window)) { $window = $(window); }
    var contentWidth = $('#contentDiv').width()-40;//40 is 20 left and right padding.
    var mainSize = contentWidth - 92; //Menu collapsed width

    $('#mainContentCall').width( mainSize );
    $('#mainContainer').height( $window.height()-73 );//159 = top bar + footer height

    setVideoDimension();

    var mainCallAreaWidth =  parseInt($('#mainCall').width())-251;
    $('#mainCall_lc').width(mainCallAreaWidth);
    var contactNameWidth=parseInt($('#mainContent').width())-parseInt($('.contactsRCol').width())-96-29;//96 is padding and recordEditMenu width, plus 2 for safety. 29 is pm icon width.
    $('.contactsLCol').width(contactNameWidth);
    $('.contactContentMulti1').width(contactNameWidth);
    var favoriteNameWidth=parseInt($('#favoritesList').width())-parseInt($('.contactsRCol').width())-96-29;//96 is padding and recordEditMenu width, plus 2 for safety. 29 is pm icon width.//PNG-886 KTRUMBLE 02282013
    $('.favoritesLCol').width(favoriteNameWidth);//PNG-886 KTRUMBLE 02282013
    $('.historyLCol').width(parseInt($('#historyList').width())-parseInt($('.historyRCol').width())-parseInt($('.pmDate').width())-140);//140 is padding, scrollbar, recordEditMenu, and direction icon width, plus 2 for safety.
    $('.pmLCol').width(parseInt($('#contentDiv').width())-parseInt($('#leftNav').width())-605);//WKRASKO 051513 - PNG-1117, repeat new math here.
    if(onCall){
        var activeCallWidth = parseInt( ( ( $('#callMaskTable').width()-$('#call_mask_user').width()-$('#minimize3way_btns').width() )/2 ) - 29 );
        $('.activeCall').width(activeCallWidth);
        $('.activeCallDisplayName').css('max-width',parseInt(activeCallWidth-200)+'px');
        if(getCurrentOS()==OSType.Windows)
            $('.activeCall').css('min-width','266px');
    }
}

function isPopUpOpen(popUpId) {
    return $(popUpId).is(':visible');
}

function repositionPopUpEnvironment(popup) {
    var maskHeight = $(window).height();  
    var maskWidth  = $(window).width();   
    $(popup).css('top',  (maskHeight/2)-($(popup).height()/2)-($(popup).css('padding-top').replace('px','')));  
    $(popup).css('left', (maskWidth/2)-($(popup).width()/2)-($(popup).css('padding-left').replace('px','')));  
}

function openMessagePopup(popupID, title, message, buttonText, showCancel, closeCallback, maskOpacity) {
    hideEmbeddedVideoComposer();
    if (typeof maskOpacity === 'undefined') { maskOpacity = 0.9; }
    if (typeof showCancel === 'undefined') { showCancel = false; }
    var $popup = $(popupID);
    var firstText = "";
    var secondText = "";
    var buttonText = buttonText || "";
    var textArray = buttonText.split("|");
    if (textArray.length == 2) {
        firstText = textArray[0];
        secondText = textArray[1];
    } else {
        firstText = buttonText;
    }
    
    firstText = (firstText == "") ? _i18n_.get("COMMON_OK") : firstText;
    $('#popDiv').css('opacity',maskOpacity);
    $popup.find("div.popupTitle").empty().html(title || "");
    $popup.find("div.popupMessage").empty().html(message || "");
    $popup.find(".close.handler").empty().html(firstText);
    repositionPopUpEnvironment(popupID);
    $('#popDiv').show();
    $popup.show();
    $popup.find(".close.handler").bind('click', function(event){
        if (isDefinedAsFunction(closeCallback)) { closeCallback(popupID, event); }
        closeMessagePopup(popupID);
    });
    if (showCancel) {
        secondText = (secondText == "") ? _i18n_.get("COMMON_CANCEL") : secondText;
        $('#errorCancel').html(secondText);
        $popup.find(".cancel.handler").show();
        $popup.find(".cancel.handler").bind('click', function(event){
            $('#messagePop #messageCancel').text(_i18n_.get("COMMON_CANCEL"));//PNG-430 KTRUMBLE 09142012 - reset 'no' for 'cancel'
            closeMessagePopup(popupID);
        });
        if(popupID=="#errorPop"){
            $('#errorOK').removeClass('loner').css('width','auto');
        }
    } else if(popupID=="#errorPop"){
        $('#errorOK').addClass('loner').css( 'width', $('#errorOK span').width() );
    }
}

function closeMessagePopup(popupID) {
    var $popup = $(popupID);
    $popup.hide();
    if( !$('#editE911Pop').is(':visible') )
        $('#popDiv').hide();
    $popup.find(".close.handler").unbind('click');
    $popup.find(".cancel.handler").hide().unbind('click');
    if( !$('#editE911Pop').is(':visible') )
        showEmbeddedVideoComposer();
}

function switchCheckbox(checkboxElement) {
    if ($(checkboxElement).is(':checked')) {
        $(checkboxElement).attr('checked', false);
    } else {
        $(checkboxElement).attr('checked', true);
    }
}

$(document).ready(function() { onDocumentReady(); });
function onDocumentReady() {
    console.log("START INITIALIZATION");
    imagePreloader();
    showStartupMask();
    $('#startupMask #loadingDiv').css('display','table-cell');
    //Initialization time (START to END in console log above) is ~1800-2000ms (as of 032812 code), so these should add up to slightly less than that, we are "faking" the bar a bit
    $('#loadingStatus').html(_i18n_.getHTML("GUI_SYSTRAY_MSG_LOADING_STATUS1"));
    animateFuelBarInterval = setInterval(animateFuelBar,1,80);
    currentUiStatus = UiStatus.initializing;
    __thisWindow__.setIcon("img/"+iconModifier+".png");
    __thisWindow__.ready();
    __thisWindow__.setIdleTimeoutSeconds(0);
    initApplicationSettings();
    
    //UI stuff
    setupMainViewBindings();
    setContentMaxWidth();
    //Windows behaviour is for a program to close on window close
    /*if (getCurrentOS() !== OSType.MacOS) {
        realCloseIssued = true;
    }*/
    if (getCurrentOS() == OSType.Windows) {
        contactEditMenuRight=16;
        setupMenusForWindows();
        __thisWindow__.setIcon("img/icon.ico"); //KTRUMBLE 09272012 PNG-276 - setting the icon for windows, the .ico file scales better there
    }
    //Settings stuff
    $('#microphone_level').bind('change', function(e) { setMicLevel(parseInt($(this).val())); });
    $('#speakers_level').bind('change', function (e) { setSpeakerLevel(parseInt($(this).val())); });
}

function setupMenusForWindows(){
    $('#contactSortSelect').css('float','right');
    $('#sortLabel').css({'float':'left','margin-top':'5px','margin-right':'2px'});
    $('#help_vrs_numbers div').css('letter-spacing','-1px');
}
function imagePreloader() {
     // create object
     imageObj = new Image();

     // set image list
     images = new Array();
     images[0]="img/begin_setup_btn.gif";
     images[1]="img/msgs_icon.gif";
     images[2]="img/walkthru_video_ph.gif";
     images[3]="img/alerts_icon.gif";
     images[4]="img/logo_135x51_fff.png";
     images[5]="img/footer_logo.png";
     images[6]="img/status_chk.png";
     images[7]="img/p3-tng-icon-18-on.png";

     // start preloading
     for(var i=0; i<=8; i++)  {
          imageObj.src=images[i];
     }
}

function onGetApplicationSettings(result) {
    var savedApplicationSettings = result.applicationSettings;
    if (!$.isEmptyObject(savedApplicationSettings)) {
    	applicationSettings = savedApplicationSettings;
    	if (!isDefined(applicationSettings.autoanswer)) { applicationSettings.autoanswer = defaultApplicationSettings.autoanswer; }
    	if (!isDefined(applicationSettings.contacts))   { applicationSettings.contacts = defaultApplicationSettings.contacts; }
    	if (!isDefined(applicationSettings.history))    { applicationSettings.history  = defaultApplicationSettings.history; }
    	if (!isDefined(applicationSettings.language))   { applicationSettings.language = _i18n_.getDefaultLanguageCode(); }
    } else {
    	__log__.warn("Empty application settings retrieved, assuming an error or first run, saving defaults");
    	__thisWindowProxy__.setApplicationSettings(applicationSettings);
    }
    _i18n_.setLanguageCode(applicationSettings.language, 
            function(){ translate(); }, 
            function(){ __log__.error("Can't perform translation"); }
    );
    if ((currentUiStatus == UiStatus.initializing) && isDefined(applicationSettings.logins)) {
        loadSavedCredentials(applicationSettings);
    }
}

$(window).load(function(){ onWindowLoad(); });    
function onWindowLoad() {
    $(window).resize();  
    __thisWindowProxy__.getAppInfo(bind(window, function(response){
        if (isDefined(typeof response.result)) { 
            onGetAppInfo(response.result);
            if (isDefined(appInfo) && isDefined(appInfo.commandLine)) {
                processCommandLine(appInfo.commandLine);
            }
        }
    }));
    
    return true;
}

function copyToClipboard(text) { __thisWindow__.setClipboardText(text); }

$(window).unload(function(event) { onUnload(); });

function performDelayedLogOut() {
    $('#signin').hide();
    //WKRASKO 113012 - PNG-753, hang up all calls FIRST, and with line updated call to "reset" app
    if(onCall){
        lineRepository.forEachLine(function(line){ if (!line.idle) { line.dropCall(function(){ onLineUpdated(line.lineNum); }); } });
        setTimeout(function(){
            hideEmbeddedVideoComposer();
            clearContactsTab();
            //Our stuff, to ensure things are closed, should be it, but more might need to be added later.
            $('.bfoMenu ').hide();
            //End our close stuff
            showStartupMask();
            $('#startupMask #loadingStatus').html(_i18n_.getHTML("STARTUP_MSG_LOGGING_OUT"));
            $('#startupMask #loadingDiv').css('display','table-cell');
            //if (__thisWindow__.isVisible()) { __thisWindow__.bringToFront(); }
            setTimeout("performLogOut();",500);
            clearInterval(checkContactsInterval); checkContactsInterval = null;
            clearInterval(checkPMInterval); checkPMInterval = null;
            clearInterval(checkHistoryInterval); checkHistoryInterval = null;
        },3000);//Better way to do this? I don't know, a slower computer might take longer than 3s to "reset" calls
    } else {
        hideEmbeddedVideoComposer();
        clearContactsTab();
        //Our stuff, to ensure things are closed, should be it, but more might need to be added later.
        $('.bfoMenu ').hide();
        //End our close stuff
        showStartupMask();
        $('#startupMask #loadingStatus').html(_i18n_.getHTML("STARTUP_MSG_LOGGING_OUT"));
        $('#startupMask #loadingDiv').css('display','table-cell');
        //if (__thisWindow__.isVisible()) { __thisWindow__.bringToFront(); }
        setTimeout("performLogOut();",500);
        clearInterval(checkContactsInterval); checkContactsInterval = null;
        clearInterval(checkPMInterval); checkPMInterval = null;
        clearInterval(checkHistoryInterval); checkHistoryInterval = null;
    }
    
}

var loggingOut = false;
function performLogOut() { 
    loggingOut = true;
    __thisWindow__.setIdleTimeoutSeconds(0);
    
    resetVars();
    resetWindow();
    
    //From onDocumentReady, but only want to do these things
    currentUiStatus = UiStatus.initializing;
    __thisWindow__.setIcon("img/"+iconModifier+".png");
    if(getCurrentOS() == OSType.Windows) __thisWindow__.setIcon("img/icon.ico");//PNG-276 KTRUMBLE - adjust for windows
    __thisWindow__.ready();
    __thisWindow__.setIdleTimeoutSeconds(0);
    initApplicationSettings();
    showStartupMask();
    
    onWindowLoad();
    
    if (lineRepository.presentationEnabled) { stopApplicationSharing(); }  
    
    windowsRepository.forEachWindow(function(windowRef, windowName){ if(isDefined(windowRef)) { windowRef.close(); }});
    //EXAMPLE APP
    //hideEmbeddedVideoComposer();
    __thisWindowProxy__.logout();

    $('.ui-autocomplete').css({'bottom':'', 'left':'', 'max-height':'225px'});//WKRASKO 051713 - PNG-999 adjustments
    //EXAMPLE APP
    //setDocumentTitle();
    JAMBO_APP.activeUserAccount = null
}

function __confirmClose(){ // implementing window close confirmation callback
    if (!realCloseIssued && onCall) {
        //WKRASKO 111612 - No ticket yet, but requested by Mark Stern. closing window should confirm and REALLY quit app like P3 Old.
        hideEmbeddedVideoComposer();
        openMessagePopup("#errorPop", _i18n_.get("COMMON_QUIT"), _i18n_.get("MSG_CONFIRM_QUIT"), _i18n_.getHTML("COMMON_YES")+"|"+_i18n_.getHTML("COMMON_NO"), true, function(){
            windowsRepository.forEachWindow(function(windowRef, windowName){
                if (isDefined(windowRef) && isDefined(windowRef.__thisWindow__)) {
                    if ((windowName === "settings:settings") && configuringWithWizard) { return; } // skipping wizard window in global hide
                    windowRef.__thisWindow__.hide();
                }
            });
            realCloseIssued = true;
            window.close();
        });
        return false;
    } else if (!canConfirmClose) {
        var transcodingJobsRunning = false;
        
        if (!transcodingJobsRunning) {
            $('#info #mainMessage', '#startupMask').empty();
            $('#loadingDiv', '#startupMask').hide();
            showStartupMask();
            
            $('#info #mainMessage').html( _i18n_.getHTML("TITLE_CLOSING_APPLICATION") );
            if (lineRepository.presentationEnabled) { stopApplicationSharing(); }  
            lineRepository.forEachLine(function(line){ if (!line.idle) { line.dropCall(); } });
            
            hideEmbeddedVideoComposer();   
            windowsRepository.forEachWindow(function(windowRef, windowName){ if(isDefined(windowRef)) { windowRef.close(); }});
            canConfirmClose = true;
            return true;
        }
        return false;
    } else {
        return true;
    }
}

function closeForReal() {
    clearTimeout(closeForRealTimeout);
    closeForRealTimeout = undefined;
    canConfirmClose = true;
    window.close();
}

function onUnload(){
    __thisWindowProxy__.quit();
}

function serverForcedQuit(type) {
    __thisWindow__.beep();
    __log__.info("Server ["+type+"] forced quit received: closing all windows but this one.");
    var message = _i18n_.getHTML("MSG_ERR_GENERIC");
    if (type === Event.endpointNotificationSubtype.MCS_ADMIN) { message = _i18n_.getHTML("MSG_ERR_QUIT_SERVER_MCS_ADMIN"); }
    else if (type === Event.endpointNotificationSubtype.MCS_SEIZED) { message = _i18n_.getHTML("MSG_ERR_QUIT_SERVER_MCS_SEIZED"); }
    else { message = _i18n_.getHTML("MSG_ERR_QUIT_SERVER_"+type); }
    openMessagePopup('#errorPop', _i18n_.get("MSG_ERR_QUIT_SERVER_TITLE"), message, _i18n_.getHTML("COMMON_OK"), false, function(){
        __log__.info("Server ["+type+"] forced quit accepted by the user: exiting.");
        realCloseIssued = true;
        window.close();
        windowsRepository.closeAll();//WKRASKO 082012 - PNG-320, hopefully
    });
}

function onGetAppInfo(data) {
    if (isDefined(data)) { appInfo = data; }
    if (isDefined(appInfo) && (currentUiStatus == UiStatus.initializing)) {
        var totalVersion = "v";
        if (isDefined(appInfo.version)) { $('#aboutPop #mainVersion').html(appInfo.version); totalVersion += appInfo.version; }
        if (isDefined(appInfo.buildNumber)) { $('#aboutPop #buildNumber').html(appInfo.buildNumber); totalVersion += "."+appInfo.buildNumber; }
        if(totalVersion!="v"){
            $('#signinVersion').html("<i>"+totalVersion+"</i>");
            //WKRASKO 051613 - PNG-1030, show verion on logo mouseover.
            $('#p3_logo').attr('title',totalVersion);
            $('#kiosk_p3_logo').attr('title',totalVersion);
        }
    }
    setDocumentTitle();
}

function onGetLicenseInfo(data) {
    if (typeof data !== 'undefined') { licenseInfo = data; }
}

function requestedUserSettings() {
    __thisWindowProxy__.setUserSettings({
        "useEmbeddedInCallGUI": true,
        "enablePresence":false, 
        "enableInstantMsg":true//PNG-186 KTRUMBLE 10302012 - Add P2PChat
        });
}

function initialized() {
    console.log("END INITIALIZATION");

    currentUiStatus = UiStatus.initialized;
    
    if (clientType === ClientType.Standalone) {
        iconModifier = "p3-tng-icon-18-on";
        __thisWindow__.setTrayIcon("img/p3-tng-icon-18-on.png");
        __thisWindow__.setIcon("img/p3-tng-icon-18-on.png");
        if(getCurrentOS() == OSType.Windows){//PNG-276 KTRUMBLE - adjust for windows
            __thisWindow__.setTrayIcon("img/icon.ico");
            __thisWindow__.setIcon("img/icon.ico");
        }

    }
    initCoreSettings();

    if (clientType === ClientType.ClearSea) {
        __thisWindow__.setIdleTimeoutSeconds((isDefined(applicationSettings.idleTimeout)) ? applicationSettings.idleTimeout : 10*60);
    }
    
    setTrayMenu(false, true);
    
    initUserRecords();
    JAMBO_APP.WebServices.getCallGroupArray(callGroupSuccess);
    //WKRASKO - 041712 SETTINGS TEMP - For early test only, probably replace by gui settings later (this one is from Example App)
    jQuery(document).keydown(function(event){
       if(event.which==83 && event.ctrlKey){
           openSettingsWindow(false);
       }
       //TEmp to force sync contacts, for Bryan
       if(event.which==67 && event.ctrlKey && event.shiftKey)
           syncContacts();
    });
}

function activateWindow(windowName) {
	if (!isDefined(windowName)) {
		__thisWindow__.bringToFront();
                showEmbeddedVideoComposer();
	} else {
            //console.log("this is a test")
		var windowRef = windowsRepository.getWindow(windowName);
		if (isDefined(windowRef)) { windowRef.__thisWindow__.bringToFront(); }
	}
}

function setTrayMenu(empty, allowExit) {
    var doAllowExit = allowExit;
    if (!isDefined(doAllowExit)) { doAllowExit = true; }
    var menu = [];   
    if (!empty) {
        
        if (!configuringWithWizard) {
            menu.push({
                label: _i18n_.get("MENU_MAIN_WINDOW"),
                action: "activateWindow();"
            });
        } else {
            menu.push({
                    label: _i18n_.get("GUI_WIZARD_TITLE")+"...",
                    action: "activateWindow('settings:settings');"
            });
        }
        
    	var chatWindows = [];
    	var contactWindows = [];
    	var recordedCallWindows = [];
    	var otherWindows = [];
        
        windowsRepository.forEachWindow(function(windowRef, windowName){
            if (!isDefined(windowRef) || !isDefined(windowRef.document)) { return; }
        	var menuItem = {
        			label: windowRef.document.title+"...",
        			action: "activateWindow('"+windowName+"');"
        	};
        	
        	if (windowName.startsWith("chat:")) { chatWindows.push(menuItem); }
        	if (windowName.startsWith("editContact:")) { contactWindows.push(menuItem); }
        	if (windowName.startsWith("editRecordedCall:")) { recordedCallWindows.push(menuItem); }
        	if (windowName.startsWith("recordedCalls:") || windowName.startsWith("createContact:") || windowName.startsWith("applicationSharing:")) { otherWindows.push(menuItem); }
        });    
           
        chatWindows.sort(sortTrayMenu);
        var wLen = chatWindows.length;
    	for (var x = 0; x < wLen; x++) {
    		if (x===0) { menu.push("separator"); }
    		menu.push(chatWindows[x]); 
    	}
           
    	contactWindows.sort(sortTrayMenu);
    	wLen = contactWindows.length;
    	for (var x = 0; x < wLen; x++) {
    		if (x===0) { menu.push("separator"); }
    		menu.push(contactWindows[x]); 
    	} 

    	recordedCallWindows.sort(sortTrayMenu);
    	wLen = recordedCallWindows.length;
    	for (var x = 0; x < wLen; x++) {
    		if (x===0) { menu.push("separator"); }
    		menu.push(recordedCallWindows[x]); 
    	} 
       
    	otherWindows.sort(sortTrayMenu);
    	wLen = otherWindows.length;
    	for (var x = 0; x < wLen; x++) {
    		if (x===0) { menu.push("separator"); }
    		menu.push(otherWindows[x]); 
    	}
        
        menu.push("separator");
    	
        if (logoutAvailable) {
            var autostartLabel = _i18n_.get("GUI_CFG_GENERAL_AUTOSTART_LABEL")+" - ";
            autostartLabel += (isDefined(coreSettings) && coreSettings.autostart)?_i18n_.get("GUI_ON"):_i18n_.get("GUI_OFF");
            menu.push({
                label: autostartLabel,
                action: "toggleAutoStart();"
            });
            
            menu.push({
                label: _i18n_.get("MENU_LOGOUT"),
                action: "performDelayedLogOut();"
            });
            menu.push("separator");
        } else if (clientType === ClientType.Standalone) {
            menu.push("separator");
        }
    }
    
    if (doAllowExit) {
        menu.push({
            label: _i18n_.get("MENU_EXIT"),
            action: "delayedQuit();"
        });
    }
    
    __thisWindow__.setTrayMenu(menu);
}

function sortTrayMenu (a, b) {
	 var labelA = a.label.toLowerCase();
	 var labelB = b.label.toLowerCase();
	 if (labelA < labelB) return -1;
	 if (labelA > labelB) return 1;
	 return 0;
}

function delayedOpenSettingsWindow(isWizard) {
    setTimeout("openSettingsWindow("+isWizard+");");
}

function delayedQuit(){
    if (configuringWithWizard) {
        var windowRef = windowsRepository.getWindow("settings:settings");
        if (isDefined(windowRef)) { windowRef.wizardConfirmClose = true; }
    }
    realCloseIssued = true;
    setTimeout("window.close();");
}

function syncContacts() {
    saveDivScrollPositions('Contacts');//WKRASKO 111512 - PNG-716//PNG-935 KTRUMBLE 04162013 - fix div scroll position function; was setting the position to 0 every time
    if($('#networkStatus').hasClass('status_offline') || $('#networkStatus').hasClass('status_connecting'))
        return;
    console.log("Syncing contacts...");
    //WKRASKO 110512 - PNG-675
    JAMBO_APP.WebServices.getContactsLastUpdated(JAMBO_APP.activeUserAccount,syncContactsCheck);
}

function syncContactsCheck(result){
    if(result.ResultCode=="OK" && JAMBO_APP.ContactList.getLastUpdate()!=null){
        var tempNewUpdatedDate = new Date(result.LastUpdated);
        console.log("New Date: "+tempNewUpdatedDate+" is greater than Current Date: "+JAMBO_APP.ContactList.getLastUpdate()+" : "+(tempNewUpdatedDate>JAMBO_APP.ContactList.getLastUpdate()));
        if( tempNewUpdatedDate>JAMBO_APP.ContactList.getLastUpdate() ){
            JAMBO_APP.BlockedNumbers.getBlockedNumbers(JAMBO_APP.activeUserAccount);
            JAMBO_APP.ContactList.populate(JAMBO_APP.activeUserAccount);
            contactsNeedSync = false;
        }
    }
}

function syncPurpleMail() {
    saveDivScrollPositions('PurpleMail');//WKRASKO 111512 - PNG-716//PNG-935 KTRUMBLE 04162013 - fix div scroll position function; was setting the position to 0 every time
    if($('#networkStatus').hasClass('status_offline') || $('#networkStatus').hasClass('status_connecting'))
        return;
    console.log("Syncing PM...");
    JAMBO_APP.PurpleMail.populate(JAMBO_APP.activeUserAccount);
    purpleMailNeedsSync = true;//PNG-297 KTRUMBLE 09062012 we always want purplemail to refresh when accessed, for now.
}

function syncHistory() {
    saveDivScrollPositions('History');//WKRASKO 111512 - PNG-716//PNG-935 KTRUMBLE 04162013 - fix div scroll position function; was setting the position to 0 every time
    if($('#networkStatus').hasClass('status_offline') || $('#networkStatus').hasClass('status_connecting'))
        return;
    console.log("Syncing call history...");
    JAMBO_APP.CallHistory.populate(JAMBO_APP.activeUserAccount);
    historyNeedSync = false;
}

function syncSettings() {//PNG-1029 KTRUMBLE 04182013 - auto sync settings with server on a timer
    //reset field colors that may have been set via error entry - should reset on sync
    //PNG-1148 KTRUMBLE 05232013 - error fields should reset on sync
    $('#vcoext_global').css('backgroundColor', 'white');
    $('#ep_password_new').css('backgroundColor', 'white');
    $('#ep_password_confirm').css('backgroundColor', 'white');
    $('#vmNotificationEmail').css('backgroundColor', 'white');
    $('#icNotificationEmail').css('backgroundColor', 'white');
    $('#ep_email').css('backgroundColor', 'white');
    if($('#networkStatus').hasClass('status_offline') || $('#networkStatus').hasClass('status_connecting'))
        return;
    console.log("Syncing Settings...");
    JAMBO_APP.WebServices.getUser(JAMBO_APP.activeUserAccount,function(result){
        if(result.VILanguage != $('[name=terplang_settings_radio]:checked').val()){
            $.each($('[name=terplang_settings_radio]'),function(){
                $(this).attr('checked', false);
                if($(this).val() == result.VILanguage.toLowerCase()) $(this).attr('checked', true);
            });
            $('#terplang_settings_toggle').buttonset("refresh");
            $.each($('[name="terplang_radio"]'),function(){
                $(this).attr('checked', false);
                if ($(this).val() == result.VILanguage.toLowerCase()) $(this).attr('checked', true);
            });
            $('#terplang_toggle').buttonset("refresh");
            setVRS10D(result.VILanguage,vrs10D);
        }
        if(result.AnnounceVRS && $('[name=announcevrs_global_radio]:checked').val()=='no'){
            $.each($('[name=announcevrs_global_radio]'),function(){
                $(this).attr('checked', false);
                if($(this).val() == 'yes') $(this).attr('checked', true);
            });
            $('#announcevrs_global_toggle').buttonset("refresh");
            $.each($('[name=announcevrs_radio]'),function(){
                $(this).attr('checked', false);
                if($(this).val() == 'yes') $(this).attr('checked', true);
            });
            $('#announcevrs_toggle').buttonset("refresh");
        } else if(!result.AnnounceVRS && $('[name=announcevrs_global_radio]:checked').val()=='yes'){
            $.each($('[name=announcevrs_global_radio]'),function(){
                $(this).attr('checked', false);
                if($(this).val() == 'no') $(this).attr('checked', true);
            });
            $('#announcevrs_global_toggle').buttonset("refresh");
            $.each($('[name=announcevrs_radio]'),function(){
                $(this).attr('checked', false);
                if($(this).val() == 'no') $(this).attr('checked', true);
            });
            $('#announcevrs_toggle').buttonset("refresh");
        }
        if(result.VCONumber != $('#vconumber_global').val()){
            $('#vconumber').val(result.VCONumber);
            $('#vconumber_global').val(result.VCONumber);
        }
        if(result.VCOExt != $('#vcoext_global').val()){
            $('#vcoext').val(result.VCOExt);
            $('#vcoext_global').val(result.VCOExt);
        }
        if(result.AnsweringMachineGreeting != $('#pvg_voice_greeting').html()) $('#pvg_voice_greeting').html(result.AnsweringMachineGreeting);
        if(result.UseDefaultGreeting && !$('#pvg_voice_greeting_default').is(':checked')) $('#pvg_voice_greeting_default').attr('checked', true);
        else if(!result.UseDefaultGreeting && $('#pvg_voice_greeting_default').is(':checked')) $('#pvg_voice_greeting_default').attr('checked', false);
        if(result.FirstName != $('#e911_fname_static').html()) $('#e911_fname_static').html(result.FirstName);
        if(result.LastName != $('#e911_lname_static').html()) $('#e911_lname_static').html(result.LastName);
        if(result.E911Address.Street1 != $('#e911_address_static').html()) $('#e911_address_static').html(result.E911Address.Street1);
        if(result.E911Address.Street2 != $('#e911_address2_static').html()) $('#e911_address2_static').html(result.E911Address.Street2);
        if(result.E911Address.City != $('#e911_city_static').html()) $('#e911_city_static').html(result.E911Address.City);
        if(result.E911Address.State != $('#e911_state_static').html()) $('#e911_state_static').html(result.E911Address.State);
        if(result.E911Address.Zip != $('#e911_zip_static').html()) $('#e911_zip_static').html(result.E911Address.Zip);
        if(result.EmailAddress != $('#ep_email').html()) $('#ep_email').html(result.EmailAddress);//PNG-1115 KTRUMBLE 05012013 - should populate email address when the rest of the settings are populated
    },function(result){
        console.log('getUser fail');
    });
    settingsNeedsSync = true;
}

function showSoftwareUpdate(updateDetails) {
    return;//WKRASKO TEMP for testing...
    if (currentUiStatus == UiStatus.initializing) {
        attemptingUpdate=true; //PNG-676 KTRUMBLE 11082012 - do not show default server timeout if attempting to update
        $('#signin').hide();
        $('#loadingDiv').hide();
        $('#appInfo').css('display','table-cell');
        
        $('#startupMask .softwareUpdate a.newVersionWhatsNewUrl').unbind('click').click(function(){
            __thisWindow__.openInSystemBrowser(updateDetails.latestWhatsNewURL);
        });
        
        if (updateDetails.forced) {
            updateWasForced = true;
            _i18n_.setInnerHTML('#forcedUpdateMessage', '#startupMask',  'GUI_UPDATE_NEW_VERSION_FORCED', {"version":updateDetails.latestVersion});
            $('#forcedSoftwareUpdate', '#startupMask').show();            
            $('#forcedSoftwareUpdate #quit', '#startupMask').click(function(){ attemptingUpdate=false; realCloseIssued = true; window.close(); });
        } else {
            updateWasForced = false;
            _i18n_.setInnerHTML('#optionalUpdateMessage', '#startupMask',  'GUI_UPDATE_NEW_VERSION_OPTIONAL', {"version":updateDetails.latestVersion});
            $('#optionalSoftwareUpdate', '#startupMask').show();
            $('#optionalSoftwareUpdate #updateLater', '#startupMask').click(function(){
                attemptingUpdate=false;//PNG-676 KTRUMBLE 11082012 - do not show default server timeout if attempting to update
                __thisWindowProxy__.skipUpdate(); 
                $('#optionalSoftwareUpdate', '#startupMask').hide();
                $('#appInfo').hide();
            });
            //NOT SUPPORTED BY PURPLE
            /*$('#optionalSoftwareUpdate #skipThisVersion', '#startupMask').click(function(){ 
                __thisWindowProxy__.skipUpdate(updateDetails.latestVersion); 
                $('#forcedSoftwareUpdate', '#startupMask').hide();
                $('#appInfo').hide();
                $('#signin').css('display','table-cell');
            });*/
        }
        //Weird, works, but throws reference error, do reposition manually
        //repositionPopupEnvironment('#appInfo');
        var maskHeight = $(window).height();  
        var maskWidth  = $(window).width();   
        $('#appInfo').css('top',  (maskHeight/2)-($('#appInfo').height()/2)-($('#appInfo').css('padding-top').replace('px','')));  
        $('#appInfo').css('left', (maskWidth/2)-($('#appInfo').width()/2)-($('#appInfo').css('padding-left').replace('px','')));
        $('#startupMask #updateNow').bind('click', function(){
            attemptingUpdate=true;//WKRASKO 121812 - PNG-676, was a typo here, should be true not false.
            __thisWindowProxy__.performUpdate();
            
            _i18n_.setInnerHTML("#softwareUpdateInProgress #downloadMessage", "#startupMask", "STR_UPDATE_DOWNLOADING");
            $('#softwareUpdateInProgress #quit', '#startupMask').hide();
            $('#softwareUpdateInProgress #stopUpdate', '#startupMask').show().click(function(){ 
                __thisWindowProxy__.stopUpdate();
            });
            $('#softwareUpdateInProgress', '#startupMask').show();
            
            if (updateDetails.forced) {
                $('#forcedSoftwareUpdate', '#startupMask').hide();
            } else {
                $('#optionalSoftwareUpdate', '#startupMask').hide();
            }
            //Weird, works, but throws reference error, do reposition manually
            //repositionPopupEnvironment('#appInfo');
            var maskHeight = $(window).height();  
            var maskWidth  = $(window).width();   
            $('#appInfo').css('top',  (maskHeight/2)-($('#appInfo').height()/2)-($('#appInfo').css('padding-top').replace('px','')));  
            $('#appInfo').css('left', (maskWidth/2)-($('#appInfo').width()/2)-($('#appInfo').css('padding-left').replace('px','')));
        });
    }
}

function softwareUpdateProgress(status, downloaded, total) {
    switch (status) {
        case Event.softwareUpdateProgressStatus.STARTED:
            $('#startupMask #downloadProgress').removeClass('error').removeClass('stopped');
            break;
        case Event.softwareUpdateProgressStatus.IN_PROGRESS:
            var percentage = (downloaded / total)*100;
            animateProgressBar('#startupMask #downloadProgress', percentage);
            break;
        case Event.softwareUpdateProgressStatus.DOWNLOAD_COMPLETED:
            _i18n_.setInnerHTML("#softwareUpdateInProgress #downloadMessage", "#startupMask", "STR_UPDATE_DOWNLOADED");
            break;
        case Event.softwareUpdateProgressStatus.FAILED:
            $('#startupMask #downloadProgress').addClass('error');
            _i18n_.setInnerHTML("#softwareUpdateInProgress #downloadMessage", "#startupMask", "STR_UPDATE_FAILED");
            $('#startupMask #softwareUpdateInProgress #stopUpdate').hide();
            if (updateWasForced) { $('#startupMask #softwareUpdateInProgress #quit').live('click', function(){ realCloseIssued = true; window.close(); }).show(); }
            break;
        case Event.softwareUpdateProgressStatus.STOPPED_BY_USER:
            $('#startupMask #downloadProgress').addClass('stopped');
            _i18n_.setInnerHTML("#softwareUpdateInProgress #downloadMessage", "#startupMask", "STR_UPDATE_STOPPED");
            $('#startupMask #softwareUpdateInProgress #stopUpdate').hide();
            if (updateWasForced) { 
                $('#startupMask #softwareUpdateInProgress #quit').live('click', function(){ realCloseIssued = true; window.close(); }).show(); 
            } else {
                $('#softwareUpdateInProgress', '#startupMask').hide();
                $('#appInfo').hide();
                $('#signin').css('display','table-cell');
            }
            break;
        default:
            break;
    }
}

function hideStartupMask(){
    $('#startupMask').hide();
}

function showStartupMask(){
    $('#startupMask').css('display','table');
}

function clearCallHistory(full){
    $('#historyBuckets .bucketBlock').unbind('click');
    $('.historyNum').unbind('click');
    $('.pmNum').unbind('click');
    var clearOnServer = full || false;
    $('#historyList div').empty();
    $('.historyInfoBlock').hide();
    if(full)
        JAMBO_APP.CallHistory.deleteHistory(JAMBO_APP.activeUserAccount);
}

function animateProgressBar(widgetSelector, percentage, duration) {
    if (typeof percentage === 'undefined') { percentage = 0; }
    else if (percentage>100) { percentage = 100; }
    else if (percentage<0) { percentage = 0; }
    var perc = percentage+'%';
    if (isDefined(duration) && (duration > 0)) {
        $(widgetSelector).children('.progressBar').animate({width:perc}, {duration:duration,easing:'linear'});
    } else {
        $(widgetSelector).children('.progressBar').css("width", perc);
    }
}

function onMissingMandatoryConfiguration() {
    if (currentUiStatus == UiStatus.initializing) {
        //Doing our own setup window, so for JAMBO version, the above is skipped
        var newCoreSettings = {};
        newCoreSettings["autostart"] = true;
        newCoreSettings["disableAutoUpdate"] = false;
        newCoreSettings["language"] = "en_US";
        newCoreSettings["useAEC"] = true;
        //FORMAT
        newCoreSettings["cameraCaptureWidth"] = 0;
        newCoreSettings["cameraCaptureHeight"] = 0;
        newCoreSettings["cameraCaptureNsPerFrame"] = 0;
        newCoreSettings["cameraCaptureFormat"] = 'INVALID';
        newCoreSettings["micDefaultMutedOnCall"] = true;//WKRASKO 111912 - PNG-451
        __thisWindowProxy__.setCoreSettings(newCoreSettings, false, false, false, false, function(response){
            if (response.result.returnValue) {
                lineRepository.setMicMuted(true);
                __log__.info("Successfully set mandatory core settings programatically.");//$.extend(coreSettings, newCoreSettings);
            } else {
                __log__.warn("Error while saving newCoreSettings.");
            }
        });
    } else {
        __log__.error("Missing mandatory configuration on unexpected UI status ["+currentUiStatus+"]");
    }
}

function initCoreSettings(){
    __thisWindowProxy__.getCoreSettings(function(response){
        if (isDefined(response.result.coreSettings)) {
            coreSettings = response.result.coreSettings;
            originalCoreSettings = response.result.coreSettings; // saved for "cancel"
            coreSettingsAvailable = true;
            var currentDisplayName = "";
            var currentDialString = "";
            switch (clientType) {
                case ClientType.MCS:               
                    currentDisplayName = coreSettings.sip_displayName;
                    currentDialString = coreSettings.sip_alias;  
                    if (!isDefined(currentDisplayName) || currentDisplayName.trim().length == 0) {
                        currentDisplayName = coreSettings.sip_alias;
                    }
                    break;
                case ClientType.ClearSea:
                    currentDisplayName = coreSettings.sip_displayName;
                    currentDialString = coreSettings.sip_alias;
                    if (isDefined(coreSettings.extension) && coreSettings.extension.trim().length > 0) { currentDialString += ' ('+coreSettings.extension+')'; }  
                    if (!isDefined(currentDisplayName) || currentDisplayName.trim().length == 0) {
                        currentDisplayName = coreSettings.sip_alias;
                    }
                    break;
                case ClientType.Standalone:
                    //currentDisplayName = "WHO AM I?";
                    //currentDialString = "HOW CAN THEY REACH ME?";
                    break;
                default: break;
            }
            if (!isDefined(currentDisplayName) || currentDisplayName.trim().length == 0) {
                currentDisplayName = currentDialString;
            }  
            setDocumentTitle();
            
            availableLines = coreSettings.numLines;
            initLines();
            
            //Purple custom foced settings
            var newCoreSettings = {};
            newCoreSettings["inCallHUDdisabled"] = true;//KTRUMBLE 01312013 - disabling in-call hud per Mark Stern
            //newCoreSettings["videoComposerBackgroundTopLeftColor"] = {"r":68,"g":67,"b":67};
            //newCoreSettings["videoComposerBackgroundTopRightColor"] = {"r":68,"g":67,"b":67};
            //newCoreSettings["videoComposerBackgroundBottomLeftColor"] = {"r":68,"g":67,"b":67};
            //newCoreSettings["videoComposerBackgroundBottomRightColor"] = {"r":68,"g":67,"b":67};

            newCoreSettings["videoComposerBackgroundTopLeftColor"] = {"r":60,"g":60,"b":60};
            newCoreSettings["videoComposerBackgroundTopRightColor"] = {"r":60,"g":60,"b":60};
            newCoreSettings["videoComposerBackgroundBottomLeftColor"] = {"r":60,"g":60,"b":60};
            newCoreSettings["videoComposerBackgroundBottomRightColor"] = {"r":60,"g":60,"b":60};

            //newCoreSettings["autoAcceptCallTransfer"] = true;
            //newCoreSettings["disableScreensaver"] = false;
            //newCoreSettings["useAutoInBwControl"] = false;
            //WKRASKO 031213 - To support other resolutions in the future, including HD.
            //Since the user has no access to the settings window (shouldn't! Remember to comment out the bind for that on production builds!)
            //We have to just automatically match the server
            if( !($(coreSettings.videoFormatsRxEnabled).not(coreSettings.videoFormatsRxPreference).length == 0 && $(coreSettings.videoFormatsRxPreference).not(coreSettings.videoFormatsRxEnabled).length == 0) )
                newCoreSettings["videoFormatsRxPreference"] = coreSettings.videoFormatsRxEnabled;
            if( !($(coreSettings.videoFormatsTxEnabled).not(coreSettings.videoFormatsTxPreference).length == 0 && $(coreSettings.videoFormatsTxPreference).not(coreSettings.videoFormatsTxEnabled).length == 0) )
                newCoreSettings["videoFormatsTxPreference"] = coreSettings.videoFormatsTxEnabled;
            setTimeout(function(){
            __thisWindowProxy__.setCoreSettings(newCoreSettings, false, false, false, false, function(response){
                if (response.result.returnValue) {
                    $.extend(coreSettings, newCoreSettings);
                } else {
                    __log__.warn("Error while saving newCoreSettings.");
                }
            });
        }, 500);

            /** TOGGLE - ACOUSTIC ECHO CANCELLER **/
            $('#aec_toggle').empty();
            var aecState = false; if( isDefined(coreSettings.useAEC) && coreSettings.useAEC ) aecState = true;
            var radioStr = '<input type="radio" id="aec_radio_on" name="aec_radio" value="on" /><label for="aec_radio_on" class="typeToggle">On</label>';
            radioStr += '<input type="radio" id="aec_radio_off" name="aec_radio" value="off" /><label for="aec_radio_off" class="typeToggle">Off</label>';
            $('#aec_toggle').append(radioStr);

            if (aecState) { $('#aec_radio_on').attr('checked', true);
            } else { $('#aec_radio_off').attr('checked', true); }

            $('#aec_toggle').buttonset();
            $('#aec_toggle').unbind().change(function () {
                aecState = ($('[name=aec_radio]:checked').val() == "on") ? true : false;
                var settings = {};
                settings["useAEC"] = aecState;
                __thisWindowProxy__.setCoreSettings(settings, false, false, false, false, function(response){
                    if (response.result.returnValue) {
                        $.extend(coreSettings, settings);
                    } else {
                        __log__.warn("Error while saving useAEC, restoring previously selected value, reason["+response.result.reason+"]");
                    }
                    //$("#microphone_level").attr("disabled","disabled");
                });
                console.log("Turned AEC: " + aecState);
            });
        } else {
            __log__.error("Can't load coreSettings, reported error ["+response.result.error+"]");
        }
    });
}

function onUpdatedCoreSettings(tempCoreSettings) {
    if (isDefined(tempCoreSettings)) {
        coreSettings = tempCoreSettings;
        originalCoreSettings = tempCoreSettings; // saved for "cancel"
        setSettingsStuff();
    } else {
        __thisWindowProxy__.getCoreSettings(function(response){ 
            if (isDefined(response.result.coreSettings)) {
                coreSettings = response.result.coreSettings; 
                originalCoreSettings = response.result.coreSettings; // saved for "cancel"
                setSettingsStuff();
            } else {
                __log__.error("Can't load coreSettings, reported error ["+response.result.error+"]");
            }
        });
    }
}

function initApplicationSettings() {
    __thisWindowProxy__.getApplicationSettings(function (response) {
        if (isDefined(response.result.applicationSettings)) {
            var savedApplicationSettings = response.result.applicationSettings;
            if (!$.isEmptyObject(savedApplicationSettings)) {
                applicationSettings = savedApplicationSettings;
                if (!isDefined(applicationSettings.mode)) { applicationSettings.mode = "retail"; }
                if (!isDefined(applicationSettings.language)) { applicationSettings.language = "en_US"; }
                if (!isDefined(applicationSettings.windowsGeometries)) { applicationSettings.windowsGeometries = {}; }
                if (!isDefined(applicationSettings.enableMessageEnhancing)) { applicationSettings.enableMessageEnhancing = defaultApplicationSettings.enableMessageEnhancing; }
                if (!isDefined(applicationSettings.alwaysOnTopDuringCall)) { applicationSettings.alwaysOnTopDuringCall = defaultApplicationSettings.alwaysOnTopDuringCall; }
                if (!isDefined(applicationSettings.minimizeOnLogon)) { applicationSettings.minimizeOnLogon = defaultApplicationSettings.minimizeOnLogon; }

            } else {
                __log__.warn("Empty application settings retrieved, assuming an error or first run, saving defaults");
                __thisWindowProxy__.setApplicationSettings(applicationSettings);
            }
            _i18n_.setLanguageCode(applicationSettings.language,
                    function () { translate(); },
                    function () { __log__.error("Error performing translation on main window"); }
            );
            if ((currentUiStatus == UiStatus.initializing) && isDefined(applicationSettings.logins)) {
                loadSavedCredentials(applicationSettings);
            }
            initWindowsRepository();
            resetLayout();
            if (applicationSettings.mode == "kiosk") {
                initKiosk();
            } else {
                //Retail window set up.
                __thisWindow__.setMinimumSize(1035, 558);
                //The minimum we put in is because otherwise there's not enough width for Contacts tab, to fit the buttons across the top

                var width = 300;
                var height = 500;
                var x = undefined;
                var y = undefined;

                var savedGeometry = applicationSettings.windowsGeometries["main:main"];
                if (isDefined(savedGeometry)) {
                    if (isDefined(savedGeometry.width)) { width = savedGeometry.width; }
                    if (isDefined(savedGeometry.height)) { height = savedGeometry.height; }
                    if (isDefined(savedGeometry.x)) { x = savedGeometry.x; }
                    if (isDefined(savedGeometry.y)) { y = savedGeometry.y; }
                }

                __thisWindow__.resize(width, height);
                if (isDefined(x) && isDefined(y)) { __thisWindow__.move(x, y); }

                $(window).resize();
            }

            __thisWindow__.show();
            __thisWindow__.activate();
            document.title = 'P3';

            //if (__DEBUG__) { windowsRepository.open("console.html", "console:console", "Debug console"); }

            //Settings
            originalApplicationSettings = response.result.applicationSettings; // saved for "cancel"
            var options = "";
            for (var languageKey in I18N.availableLanguages) {
                var language = I18N.availableLanguages[languageKey];
                var isSelected = (language.code == _i18n_.getSelectedLanguageCode()) ? ' selected="selected"' : '';
                options += '<option value="' + language.code + '"' + isSelected + '>' + language.label + '</option>';
            }
            $("#language").empty().html(options).bind('change', function (e) {
                var tempApplicationSettings = $.extend(true, {}, applicationSettings);
                tempApplicationSettings["language"] = $("#language").val();

                __thisWindowProxy__.setApplicationSettings(tempApplicationSettings, function (response) {
                    if (response.result.returnValue) {
                        applicationSettings = tempApplicationSettings;
                        switch (applicationSettings.language) {//PNG-775 KTRUMBLE 01262013 - adding some last translations
                            case "es_ES":
                                $('#vcocallback').css('width', '114px'); //PNG-1034 KTRUMBLE 05062013 - change the vcocallback field width based on language
                                $('#chat_transcripts').addClass('ct_esp');
                                $('#chat_transcripts').removeClass('ct_eng');
                                break;
                            default:
                                $('#vcocallback').css('width', '127px'); //PNG-1034 KTRUMBLE 05062013 - change the vcocallback field width based on language
                                $('#chat_transcripts').addClass('ct_eng');
                                $('#chat_transcripts').removeClass('ct_esp');
                        } //END PNG-775
                        setTimeout(function () { setTrayMenu(false, true) }, 1000); //WKRASKO 121712 - PNG-796
                    } else {
                        __log__.warn("Error while saving language, restoring previously selected value, reason[" + response.result.reason + "]");
                        setFieldValue("#language", applicationSettings.language);
                    }
                });
            });

            //Language selector
            switch (applicationSettings.language) {
                case "es_ES":
                    $('#vcocallback').css('width', '114px'); //PNG-1034 KTRUMBLE 05062013 - change the vcocallback field width based on language
                    $('.cb-esp').addClass("selected");
                    $('#chat_transcripts').removeClass('ct_eng');
                    $('#chat_transcripts').addClass('ct_esp');
                    if (applicationSettings.mode == "kiosk") {
                    } else if (getPlatform() == "VRI") { // VRI mode
                    } else {
                        $('#outboundNumEntry').css({ 'width': '145px', 'letter-spacing': '0px' })
                        $('#outboundCallBtn').css({ 'width': '69px' })
                    }
                    break;
                default:
                    $('#vcocallback').css('width', '127px'); //PNG-1034 KTRUMBLE 05062013 - change the vcocallback field width based on language
                    $('.cb-eng').addClass("selected");
                    $('#chat_transcripts').removeClass('ct_esp');
                    $('#chat_transcripts').addClass('ct_eng');
                    if (applicationSettings.mode == "kiosk") {
                    } else if (getPlatform() == "VRI") { // VRI mode
                    } else {
                        $('#outboundNumEntry').css({ 'width': '170px', 'letter-spacing': '1px' })
                        $('#outboundCallBtn').css({ 'width': '44px' })
                    }
            }
            $(".cb-esp").click(function () {
                var parent = $(this).parents('.switch');
                $('.cb-eng', parent).removeClass('selected');
                $(this).addClass('selected');
                $('.checkbox', parent).attr('checked', true);
                if (applicationSettings.mode == "kiosk") {
                } else if (getPlatform() == "VRI") { // VRI mode
                } else {
                    $('#outboundNumEntry').css({ 'width': '145px', 'letter-spacing': '0px' })
                    $('#outboundCallBtn').css({ 'width': '69px' })
                }
                $('#vcocallback').css('width', '114px'); //PNG-1034 KTRUMBLE 05062013 - change the vcocallback field width based on language
                setLanguage("es_ES");
            });
            $(".cb-eng").click(function () {
                var parent = $(this).parents('.switch');
                $('.cb-esp', parent).removeClass('selected');
                $(this).addClass('selected');
                $('.checkbox', parent).attr('checked', false);
                if (applicationSettings.mode == "kiosk") {
                } else if (getPlatform() == "VRI") { // VRI mode
                } else {
                    $('#outboundNumEntry').css({ 'width': '170px', 'letter-spacing': '1px' })
                    $('#outboundCallBtn').css({ 'width': '44px' })
                }
                $('#vcocallback').css('width', '127px'); //PNG-1034 KTRUMBLE 05062013 - change the vcocallback field width based on language
                setLanguage("en_US");
            });

            setSettingsToggles();

            //WKRASKO 120612 - PNG-776
            if (applicationSettings.language == "es_ES")
                JAMBO_APP.ContactList.typeLookupObject = JAMBO_APP.ContactList.numberTypesES;
            else
                JAMBO_APP.ContactList.typeLookupObject = JAMBO_APP.ContactList.numberTypes;
            JAMBO_APP.ContactList.resetCreateEditContactNumberRow();

        } else {
            __log__.error("Can't load applicationSettings, reported error [" + response.result.error + "]");
        }
    }, undefined, false);
}

function initWindowsRepository(){
    windowsRepository = new WindowsRepository(applicationSettings.windowsGeometries, 
    		function(name, changedGeometry){ // changed geometries callback        
     		    saveWindowGeometry(name, changedGeometry);
    		},
    		function(windowRef, name) { // window create callback
                        setTrayMenu(false, !configuringWithWizard);
    		},
    		function(name) { // window unload callback
                        setTrayMenu(false, !configuringWithWizard);
    		}
    );
}

function saveWindowGeometry(name, geometry) {
    if (!isDefined(name) && !isDefined(geometry)) { return; }
    if (!isDefined(applicationSettings.windowsGeometries)) { applicationSettings.windowsGeometries = {}; }

    // getting original saved geometry
    var savedGeometry = (isDefined(applicationSettings.windowsGeometries) && isDefined(applicationSettings.windowsGeometries[name])) ? applicationSettings.windowsGeometries[name] : undefined;
    var toBeSavedGeometry = geometry;

    // check for changes
    if (isDefined(savedGeometry)) { // something was already saved
        toBeSavedGeometry = $.extend({}, savedGeometry, geometry);
        var geometryChanges = $.diff(savedGeometry, toBeSavedGeometry);
        if ($.isEmptyObject(geometryChanges.add) && $.isEmptyObject(geometryChanges.mod) && $.isEmptyObject(geometryChanges.del)) {
            // changes detected, skipping
            return;
        }
    } // else we need to save all changedGeometry

    // saving if needed
    if (isDefined(toBeSavedGeometry) && isDefined(windowsRepository)) {
        applicationSettings.windowsGeometries[name] = toBeSavedGeometry;
        windowsRepository.setSavedGeometries(applicationSettings.windowsGeometries);
        __thisWindowProxy__.setApplicationSettings(applicationSettings);
    }   
}

function onUpdatedApplicationSettings(tempApplicationSettings) {
    if (savingApplicationSettingsForQuit) { return; } // skip event if we are quitting
    if (isDefined(tempApplicationSettings)) {
        applicationSettings = tempApplicationSettings;
        _onUpdatedApplicationSettings(applicationSettings);
    } else {
        __thisWindowProxy__.getApplicationSettings(function(response){ 
            if (isDefined(response.result.applicationSettings)) { 
                applicationSettings = response.result.applicationSettings;
                _onUpdatedApplicationSettings(applicationSettings);
            } else {
                __log__.error("Can't load applicationSettings, reported error ["+response.result.error+"]");
            }
        });
    }
}

function _onUpdatedApplicationSettings(applicationSettings) {
    // we deal only with language changes
    if (_i18n_.getSelectedLanguageCode() !== applicationSettings.language) {
        if(applicationSettings.language=="en_US"){
            $('.cb-esp').removeClass('selected');//WKRASKO 092012 - PNG-441
            $('.cb-eng').addClass('selected');
        } else {
            $('.cb-eng').removeClass('selected');//WKRASKO 092012 - PNG-441
            $('.cb-esp').addClass('selected');
        }
        setFieldValue("#language",applicationSettings.language);
        __log__.info("Language code change detected ["+_i18n_.getSelectedLanguageCode()+"->"+applicationSettings.language+"], performing translations...");
        // translating main window
        _i18n_.setLanguageCode(applicationSettings.language, 
                function(){ translate(); },
                function(){ __log__.error("Error performing translation on main window"); }
        );
        
        // propagating language change to opened windows
        windowsRepository.forEachWindow(function(windowRef, windowName) {
            if (isDefined(windowRef._i18n_)) {
                windowRef._i18n_.setLanguageCode(applicationSettings.language, function(){
                    __log__.info("Translating ["+windowName+"] window...");
                    if (isDefinedAsFunction(windowRef.translate)) { windowRef.translate(); }
                    else { windowRef._i18n_.translate(); }
                });
            }
        });
    }
    
    if (clientType === ClientType.ClearSea) {
        __thisWindow__.setIdleTimeoutSeconds((isDefined(applicationSettings.idleTimeout)) ? applicationSettings.idleTimeout : 10*60);
    }
}

function serverAuthorizationRequest(event, authType, requiredServer) {
    sAuthType = authType;
    if (currentUiStatus == UiStatus.initializing) {
        isServerRequired=requiredServer;
        if (authType == 'mcs') {
            iconModifier = "p3-tng-icon-18-on";
            clientType = ClientType.MCS;
            setTrayMenu(false, true);
            __thisWindow__.setTrayIcon("img/p3-tng-icon-18-on.png");
            __thisWindow__.setIcon("img/p3-tng-icon-18-on.png");
            if(getCurrentOS() == OSType.Windows){//PNG-276 KTRUMBLE - adjust for windows
                __thisWindow__.setTrayIcon("img/icon.ico");
                __thisWindow__.setIcon("img/icon.ico");
            }
        } else {
            iconModifier = "p3-tng-icon-18-on";
            clientType = ClientType.Standalone;
            __thisWindow__.setTrayIcon("img/p3-tng-icon-18-on.png");
            __thisWindow__.setIcon("img/p3-tng-icon-18-on.png");
            if(getCurrentOS() == OSType.Windows){//PNG-276 KTRUMBLE - adjust for windows
                __thisWindow__.setTrayIcon("img/icon.ico");
                __thisWindow__.setIcon("img/icon.ico");
            }
        }
        
        if (!firstAuth) { 
            __log__.info("Error while performing login: "+event);
            var loginErrorMessage = undefined;
            switch (event) {
                case (Event.authenticationNotification.credentialNotValid)      : badLoginAttempt=true; loginErrorMessage = _i18n_.getHTML("MSG_ERR_LOGIN_INVALID_CREDENTIAL"); break;
            
                case (Event.authenticationNotification.invalidServerVersion)    : loginErrorMessage = _i18n_.getHTML("MSG_ERR_LOGIN_INVALID_SERVER_VERSION"); break;
                case (Event.authenticationNotification.invalidServerPlatform)   : loginErrorMessage = _i18n_.getHTML("MSG_ERR_LOGIN_INVALID_SERVER_PLATFORM"); break;
                case (Event.authenticationNotification.serverConnectionFailure) : loginErrorMessage = _i18n_.getHTML("MSG_ERR_LOGIN_SERVER_CONN_FAILURE"); break;
                
                case (Event.authenticationNotification.wrongUsernameParameter)  : loginErrorMessage = _i18n_.getHTML("MSG_ERR_LOGIN_INVALID_USERNAME"); break;
                case (Event.authenticationNotification.wrongPasswordParameter)  : loginErrorMessage = _i18n_.getHTML("MSG_ERR_LOGIN_INVALID_PASSWORD"); break;
                case (Event.authenticationNotification.wrongServerParameter)    : loginErrorMessage = _i18n_.getHTML("MSG_ERR_LOGIN_SERVER_CONN_FAILURE"); break;
                
                case (Event.authenticationNotification.missingUsernameParameter): loginErrorMessage = _i18n_.getHTML("MSG_ERR_LOGIN_MISSING_USERNAME"); break;
                case (Event.authenticationNotification.missingPasswordParameter): loginErrorMessage = _i18n_.getHTML("MSG_ERR_LOGIN_MISSING_USERNAME"); break;
                case (Event.authenticationNotification.missingServerParameter)  : loginErrorMessage = _i18n_.getHTML("MSG_ERR_LOGIN_MISSING_USERNAME"); break;

                default:break;
            } 
            if(isDefined(loginErrorMessage))
                openMessagePopup('#errorPop', _i18n_.get("TITLE_ERROR"), loginErrorMessage, _i18n_.getHTML("COMMON_OK"),false,function(){ enableLoginForm(); });//WKRASKO 103112 - PNG-372, new signin progress
        }
        if ($("#loginUsername").val().trim().length === 0) { 
            $("#loginUsername").focus();
        } else if ($("#loginPassword").val().trim().length === 0) { 
            $("#loginPassword").focus(); 
        }
        $("#loginUsername, #loginPassword").unbind('keypress').bind("keypress", function(e) {
                var code=e.charCode || e.keyCode;	                
                if (code===13) {
                    $('#loginUsername').blur();//PNG-354 KRUMBLE 08232012 close remembered users list (in case the user attempts to enter a user with no password)
                    setTimeout("$('#startupMask #loginDo').click()");
                    return false;
                } else {
                    return true;
                }
        });
        $('#startupMask #loginDo').unbind('click').bind('click', function(){
            //WKRASKO 103012 - PNG-372
            if($(this).hasClass('loginWorking'))
                return;
            setTrayMenu(false, true);
            //WKRASKO 103112 - PNG-372, new signin progress
            disableLoginForm();
            var loginUsername        = $('#signin #loginUsername', '#startupMask').val();
            var loginPassword        = $('#signin #loginPassword', '#startupMask').val();
            //$('#signin #loginPassword', '#startupMask').empty();
            JAMBO_APP.WebServices.loginUser(loginUsername, loginPassword, doMCSLogin);
            //WKRASKO 101712 - PNG-363, setup our own login timeout, core doesn't work in some cases
            setTimeout(function(){
                if($('#loginDo').hasClass('loginWorking') && !attemptingUpdate && !badLoginAttempt ){//PNG-676 KTRUMBLE 11082012 - do not show default server timeout if attempting to update
                    serverAuthorizationRequest(Event.authenticationNotification.serverConnectionFailure, authType, requiredServer)
                }
            },30000);
            firstAuth = false;
        });
        //WKRASKO 111912 - PNG-676
        if(loggingOut){
            setTimeout(function(){animateFuelBar(100);},500);
            loggingOut = false;
        }
    }
}

function doMCSLogin(result){
    console.log(JSON.stringify(result));
    if(result.ResultCode=="OK"){
        JAMBO_APP.activeUserAccount = result.GUID;
        JAMBO_APP.userAccounts[result.GUID] = result;

        if (applicationSettings.mode == "kiosk") {
            //Kiosk window set up.
            initKiosk();
        } else if (getPlatform() == "VRI") {
            // VRI window set up.
            initVRI();
        }

        var loginServer = undefined;
        if (isServerRequired) {
          loginServer = $('#signin #loginServer', '#startupMask').val();
        }
        __thisWindowProxy__.performAuthentication(result.Username, result.Password, loginServer, undefined, sAuthType, function(response) {  
            var errorString = Event.authenticationNotification.genericError;
            switch (response.result.error) {
                case "WrongParameter":                                    
                    if (isDefined(response.result.paramName)) {
                        switch (response.result.paramName) {
                            case "username": errorString = Event.authenticationNotification.wrongUsernameParameter; break;
                            case "password": errorString = Event.authenticationNotification.wrongPasswordParameter; break;
                            case "authType": errorString = Event.authenticationNotification.wrongAuthTypeParameter; break; 
                            case "server": errorString   = Event.authenticationNotification.wrongServerParameter; break; 
                            default: break;
                        }
                    } break;  
                case "MissingParameter":                                    
                    if (isDefined(response.result.paramName)) {
                        switch (response.result.paramName) {
                            case "username": errorString = Event.authenticationNotification.missingUsernameParameter; break;
                            case "password": errorString = Event.authenticationNotification.missingPasswordParameter; break;
                            case "authType": errorString = Event.authenticationNotification.missingAuthTypeParameter; break; 
                            case "server": errorString   = Event.authenticationNotification.missingServerParameter; break; 
                            default: break;
                        }
                    } break;
                default: break;
            }
            serverAuthorizationRequest(errorString, sAuthType, isServerRequired);   
        });
    } else {
        serverAuthorizationRequest(Event.authenticationNotification.credentialNotValid, sAuthType, isServerRequired)
    }
}

function loadSavedCredentials(applicationSettings) {
    var userList = new Array();
    if(isDefined(applicationSettings) && isDefined(applicationSettings.logins)){
        $.each(applicationSettings.logins, function(k,v){
            if(v.savePassword)//WKRASKO 072312 - PNG-256
                userList.push(v);
        });
        //we need password to be case insensitive so we need to go back
        //through and update all the previously stored passwords to lower case
        /*
        $.each(applicationSettings.logins,function(u,p){
            if(p.password){
                var decodedToLower=Base64.decode(p.password).toLowerCase();
                applicationSettings.logins[u].password = Base64.encode(decodedToLower);
            }
        });
        __thisWindowProxy__.setApplicationSettings(applicationSettings);
        */
    }
    $('#loginUsername').autocomplete({  
        //define source 
        source: userList,  

        //define select handler  
        select: function(e, ui) {
            var user = ui.item.value
            $('#startupMask #signin #loginUsername').val(user);
            //if(isDefined(ui.item.server))
                //$('#startupMask #signin #loginServer').val(ui.item.server);
            if(isDefined(ui.item.savePassword) && ui.item.savePassword){
                $('#startupMask #signin #loginSavePassword').attr('checked', true);
                if (isDefined(ui.item.password)) {
                    $('#startupMask #signin #loginPassword').val(Base64.decode(ui.item.password));
                }
            } else
                $('#startupMask #signin #loginSavePassword').removeAttr('checked');
            //WKRASKO 080312 - PNG-12
            //So, 2 possible scenarios:
            //1. Auto sign in on autocomplete - Makes more sense to me! :P
            //2. Auto sign in on startup - not good for multi-user, but it's what they want!
            //Current Scenario turned on - 2
            if(isDefined(ui.item.autoSignin) && ui.item.autoSignin){
                $('#startupMask #signin #loginAutomatic').attr('checked', true);
                //This line is for "scenario 2", sign in on autocomplete
                //$('#loginDo').click();
            } else {
                $('#startupMask #signin #loginAutomatic').removeAttr('checked');
            }
        }
    });
}

function forceSetApplicationSettings(redoCredential) {
    if(!isDefined(applicationSettings.logins))
        applicationSettings.logins = {};
    if(!isDefined(applicationSettings.lastLoggedInUser))
        applicationSettings.lastLoggedInUser = null;
    if (redoCredential) {
        var username        = $('#startupMask #signin #loginUsername').val();
        var server          = $('#startupMask #signin #loginServer').val();
        var password        = $('#startupMask #signin #loginPassword').val();
        var savePassword    = $('#startupMask #loginSavePassword').attr('checked');
        var autoSignin      = $('#startupMask #loginAutomatic').attr('checked');
        var uColor = "";
        var mMuted = true;//WKRASKO 051713 - PNG-451. When I re-did this section, I made this false! Needs to be true, default is muted.
        //WKRASKO 051613 - PNG-1030, need to do this stuff case-insenstive.
        if(isDefined(username)){
            var existingUserToOverwrite = false;
            $.each(applicationSettings.logins,function(userx){
                if(userx.toString().toLowerCase()==username.toString().toLowerCase()){
                    username = userx;//User existing record
                    if(isDefined(applicationSettings.logins[userx].color))
                        uColor = applicationSettings.logins[userx].color;
                    if(isDefined(applicationSettings.logins[userx].micMuted))
                        mMuted = applicationSettings.logins[userx].micMuted;
                }
            });

            applicationSettings.logins[username] = {
                label    : username,
                color   : uColor,
                micMuted    : mMuted
            };
            if (isDefined(server)) { applicationSettings.logins[username].server = server; }
            
            if (isDefined(savePassword)) { 
                applicationSettings.logins[username].savePassword = savePassword; 
            } else {
                savePassword = false;
            }
            if (savePassword) {
                if (isDefined(password)) { applicationSettings.logins[username].password = Base64.encode(password); } 
                else { applicationSettings.logins[username].password = undefined; }
            } else {
                applicationSettings.logins[username].password = undefined;
            }

            //WKRASKO 080312 - PNG-12, including line above to set autoSingin flag
            if (isDefined(autoSignin)){
                //Scenario 2, not needed for scenario 1 (above)
                if(autoSignin){//We have to clear other auto-sign
                    $.each(applicationSettings.logins,function(u){
                        applicationSettings.logins[u].autoSignin = false;
                    });
                }
                //Both Scenario 1 and 2
                applicationSettings.logins[username].autoSignin = autoSignin;
            }
            //WKRASKO 092112 - PNG-407
            applicationSettings.lastLoggedInUser = username;
        }
    }
    
    __thisWindowProxy__.setApplicationSettings(applicationSettings);
}

function serverAuthorizationSuccessful(contact, authType) {
    console.log("We made it here! Good login.");
    //$('#startupMask #info #mainMessage').html(_i18n_.getHTML("GUI_PRIMARY_LOADING_PLEASE_WAIT"));
    //authenticatedContact = new Contact(contact);   
    forceSetApplicationSettings(true);
    //WKRASKO 031413 - Support auto dialing for test
    if(autocallnumber!="")
        autocallInterval = setTimeout(autoCallDialer,autocallgap);
}

//WKRASKO 031413 - Support auto dialing for test
function autoCallDialer(){
    autocallInterval = null;
    if(!onCall){
        initCallFromDialString(autocallnumber,"PNG Auto Dialer", "10d");
    }
}

function initLines() {
    __log__.info("Initializing lines...");
    lineRepository.init(availableLines);
    $("#activeCallRowTemplate").template("activeCallRowTemplate");
    $("#incomingCallRowTemplate").template("incomingCallRowTemplate");
    $("#activeCallMimizedTemplate").template("activeCallMimizedTemplate");
    for(var i=0; i<availableLines; i++) {
        var line = lineRepository.getLine(i);
        
        // computing template for active calls
        $.tmpl("activeCallRowTemplate", {"lineLabel":line.label, "lineNum":line.lineNum}).appendTo("#activeCallRowContent");//PNG-226 KTRUMBLE 071112
        
        // computing template for incoming call
        $.tmpl("incomingCallRowTemplate", {"lineNum":line.lineNum}).appendTo("#incomingCallContent");//PNG-226 KTRUMBLE 071112
        
        $.tmpl("activeCallMimizedTemplate", {"lineNum":line.lineNum}).appendTo("#callMimizedInfo");
        
        // taking references 
        line.$activeCallElement = $('div.activeCall[data-lineNum="'+line.lineNum+'"]');
        line.$activeCallElement.data("idle", line.idle);
        line.$incomingCallElement = $('#incomingCall .incomingCallRow[data-lineNum="'+line.lineNum+'"]');
        
        _i18n_.translate('#incomingCall .incomingCallRow[data-lineNum="'+line.lineNum+'"]');
        _i18n_.translate('div.activeCall[data-lineNum="'+line.lineNum+'"]');
        _i18n_.translate('#incomingCall .incomingCallControls[data-lineNum="'+line.lineNum+'"]');
    }
    repositionPopUpEnvironment("#incomingCall");
    if(isDefined(lineRepository.getAvailableLine())) { 
        unlockCalls(); 
    }
    
    // adding listeners for active calls /*new */
    $('div#newCallControls0 div.newActiveCallControls div.newActiveCallHold').live("click", function(e){
        var lineNum = $(this).data('lineNum');
        var line = lineRepository.getLine(lineNum);
        line.setCallOnHold(true, function(){ onLineUpdated(lineNum); });
        $(this).hide();
        $('div#newActiveCallResume0').show();
        $('div#calltab0 div.activeCall div div.callStatus').hide();
        $('div#calltab0 div.activeCall div div.onhold').show();
    });
    $('div#newCallControls1 div.newActiveCallControls div.newActiveCallHold').live("click", function(e){
        var lineNum = $(this).data('lineNum');
        var line = lineRepository.getLine(lineNum);
        line.setCallOnHold(true, function(){ onLineUpdated(lineNum); });
        $(this).hide();
        $('div#newActiveCallResume1').show();
        $('div#calltab1 div.activeCall div div.callStatus').hide();
        $('div#calltab1 div.activeCall div div.onhold').show();
    });
    $('div#newCallControls0 div.newActiveCallControls div.newActiveCallResume').live("click", function(e){
        //Set all other lines on hold first. We want to force "Three Way" button for three way calls.
        var line;
        for(var i=0; i<availableLines; i++){
            line = lineRepository.getLine(i);
            if(!line.idle && !line.call.onHold){
                line.setCallOnHold(true, function(){ onLineUpdated(i) });
                $('div#newActiveCallHold1').hide();
                $('div#newActiveCallResume1').show();
            }
        }
        var lineNum = $(this).data('lineNum');
        line = lineRepository.getLine(lineNum);
        line.setCallOnHold(false, function(){ onLineUpdated(lineNum); });
        $(this).hide();
        $('div#newActiveCallHold0').show();
        $('div#calltab0 div.activeCall div div.callStatus').show();
        $('div#calltab0 div.activeCall div div.onhold').hide();
        $('div#calltab1 div.activeCall div div.callStatus').hide();
        $('div#calltab1 div.activeCall div div.onhold').show();
    });
    $('div#newCallControls1 div.newActiveCallControls div.newActiveCallResume').live("click", function(e){
        //Set all other lines on hold first. We want to force "Three Way" button for three way calls.
        var line;
        for(var i=0; i<availableLines; i++){
            line = lineRepository.getLine(i);
            if(!line.idle && !line.call.onHold){
                line.setCallOnHold(true, function(){ onLineUpdated(i) });
                $('div#newActiveCallHold0').hide();
                $('div#newActiveCallResume0').show();
            }
        }
        var lineNum = $(this).data('lineNum');
        line = lineRepository.getLine(lineNum);
        line.setCallOnHold(false, function(){ onLineUpdated(lineNum); });
        $(this).hide();
        $('div#newActiveCallHold1').show();
        $('div#calltab0 div.activeCall div div.callStatus').hide();
        $('div#calltab0 div.activeCall div div.onhold').show();
        $('div#calltab1 div.activeCall div div.callStatus').show();
        $('div#calltab1 div.activeCall div div.onhold').hide();
    });
    $('div#newCallControls0 div.newActiveCallDrop').live("click", function(e){
        var lineNum = $(this).data('lineNum');
        var line = lineRepository.getLine(lineNum);
        line.dropCall(function(){ onLineUpdated(lineNum); });
        console.log("hanging up...");
        if(!$('#chatSettings_menu').hasClass('dn')) $('#chatMenu').click();//need this and the next to be immediate, so it's here
        if($('#calltab0 div.activeCall div div.onhold').is(':visible')) $('#calltab0 div.activeCall div div.onhold').hide();
    });
    $('div#newCallControls1 div.newActiveCallDrop').live("click", function(e){
        var lineNum = $(this).data('lineNum');
        var line = lineRepository.getLine(lineNum);
        line.dropCall(function(){ onLineUpdated(lineNum); });
        console.log("hanging up...");
        if(!$('#chatSettings_menu').hasClass('dn')) $('#chatMenu').click();//need this and the next to be immediate, so it's here
        if($('#calltab1 div.activeCall div div.onhold').is(':visible')) $('#calltab1 div.activeCall div div.onhold').hide();
    });
    
    // adding listeners for incoming calls
    $('.newActiveCall .newActiveIncomingCallControls .newActiveCallAnswer').live('click', function (e) {
        showEmbeddedVideoComposer();
        var theLineNum = parseInt($(this).data('lineNum'));
        __thisWindowProxy__.answerCall(theLineNum, undefined, undefined, false);
        for (var i = 0; i < availableLines; i++) {//WKRASKO 082012 - Part of PNG-324 (found while fixing)
            if (i != theLineNum) {
                var tempLine = lineRepository.getLine(i);
                if (!tempLine.idle && tempLine.call.status == Line.CallStatus.INCOMING) {
                    //Other line is still incoming, reset to activeCalls buttons
                    $('#incomingCall').hide(); $("div#popDiv").hide();
                    //$('div#'+tempLine.label+' div.activeCallOnCallStuff').hide();
                    $('div#calltab' + theLineNum + ' div.activeCall div div.callStatus').show();
                    $('div#calltab' + theLineNum + ' div.activeCall div div.onhold').hide();
                    $('div#newActiveCallResume' + theLineNum).hide();
                    $('div#newActiveCallHold' + theLineNum).show();
                    $('#calltab' + theLineNum).hide();
                    setDialPlus();
                    if (!$("div#callBtnOverlay").hasClass('dn')) $("div#callBtnOverlay").addClass("dn"); //PNG-878 KTRUMBLE 02282013 - adding ringing animation back in
                    if (applicationSettings.mode == "kiosk") { // use "Ringing" indicator instead of "Calling" during kiosk mode
                        if(!$("#kiosk_ringing_"+theLineNum).hasClass('dn')) $("#kiosk_ringing_"+theLineNum).removeClass("dn");
                    } else { }

                    $('#calltab' + line.lineNum).removeClass('activeTab');
                    if ($('#NewCallBtn').hasClass('callActive') && !onCall) $('#NewCallBtn').removeClass('callActive');
                    if ($('#newCallControls').hasClass('callActive') && !onCall) $('#newCallControls').removeClass('callActive');
                    $('div#newCallControls' + line.lineNum).hide();
                }
            }
        }
    });
    $('#incomingCall .incomingCallControls #decline').live('click', function(e){
        //PNG-1057 KTRUMBLE 04082013 - we need to check to make sure there aren't any open popups before we do this
        if(!popCheck('incomingCall')){
            $('#popDiv').hide();
            showEmbeddedVideoComposer();
        }
        var lineNum = $(this).data('lineNum');
        var line = lineRepository.getLine(lineNum);
        line.dropCall(function(){ onLineUpdated(lineNum); });      
    });
    // adding listeners for incoming calls
    $('#incomingCall .incomingCallControls #accept').live('click', function(e){
        $('#NewCallBtn').click();
        showEmbeddedVideoComposer();
        var theLineNum = parseInt($(this).data('lineNum'));
        __thisWindowProxy__.answerCall(theLineNum, undefined, undefined, false);
        for(var i=0; i<availableLines; i++){//WKRASKO 082012 - Part of PNG-324 (found while fixing)
            if(i!=theLineNum){
                var tempLine = lineRepository.getLine(i);
                if(!tempLine.idle && tempLine.call.status==Line.CallStatus.INCOMING){
                    //Other line is still incoming, reset to activeCalls buttons
                    //WKRASKO 051413 - PNG-1130 and PNG-1131. WTF? I had fixed all this before, then someone commented it out below and broke it!
                    //$('#incomingCall').hide();$("div#popDiv").hide();
                    closeIncomingCallPopUp(tempLine);
                    $('div#newCallControls'+line.lineNum+' div.newActiveCallDrop').hide();
                    $('div#newCallControls'+tempLine.lineNum+' div.newActiveCallControls').hide();
                    $('div#newCallControls'+tempLine.lineNum+' div.newActiveIncomingCallControls').show();
                }
            }
        }
    });
    
    $('.newActiveCall .newActiveIncomingCallControls .newActiveCallIgnore').live('click', function(e){//PNG-887 KTRUMBLE 02282013
        var lineNum = $(this).data('lineNum');
        var line = lineRepository.getLine(lineNum);
        line.dropCall(function(){ onLineUpdated(lineNum); });   
    });
}

function switchSpeakerMuted() { 
    lineRepository.setSpeakerMuted(!lineRepository.speakerMuted); 
}

function switchMicMuted() { 
    lineRepository.setMicMuted(!lineRepository.micMuted);
}

function switchCameraPrivacyMode() { 
    lineRepository.setCameraPrivacyMode(!lineRepository.cameraPrivacyMode);
}

function openIncomingCallPopUp(line){
    //Special cases, don't want to mess them up
    if($('#inputPop').is(':visible'))
        closeInputPop();
    if($('#missedCalls').is(':visible'))
        $('#missedCallsIgnore').click();
    $('.rndpop').each(function(){//Correcting modal closing.
        if($(this).is(':visible') && isDefined($(this).attr('id')))
            closeMessagePopup('#'+$(this).attr('id'));
    });
    //Let's check, if we're on call already, we need to show alternate incoming call
    var dialing = false,theLineNum=null;//WKRASKO 082012 - PNG-324
    for(var i=0; i<availableLines; i++){
        theLineNum=i;
        var tempLine = lineRepository.getLine(i);
        if(!tempLine.idle && (tempLine.call.status==Line.CallStatus.DIALING || tempLine.call.status==Line.CallStatus.DIALTONE || tempLine.call.status==Line.CallStatus.REMOTE_RINGING))
            dialing=true;
    }

    if(onCall || dialing){
        $('div#newCallControls'+line.lineNum+' div.newActiveCallDrop').hide();
        $('div#newCallControls'+line.lineNum+' div.newActiveCallControls').hide();
        $('div#newCallControls'+line.lineNum+' div.newActiveIncomingCallControls').show();
    } else {
        hideEmbeddedVideoComposer();
        var $mask = $("div#popDiv");
        var $incomingCallPopUp = $("#incomingCall");
        if(line.lineNum==1)
            $incomingCallPopUp.height(355);
        else
            $incomingCallPopUp.height(210);
        if ($('#incomingCall .incomingCallRow.ringing').length == 0) { 
            //EXAMPLE APP
            //__thisWindow__.setTrayIcon(icons[iconModifier].CONNECTED_RINGING);
        }
        $mask.show();
        $mask.addClass('popDivAnimated');
        $incomingCallPopUp.show();
        repositionPopUpEnvironment("#incomingCall");

        // initializing info
        if (isDefined(line)) {
            var lineNum = line.lineNum;
            $incomingCallPopUp.addClass("ringing");
            $('#incomingCall .incomingCallRow[data-lineNum="'+lineNum+'"] .incomingCallMessage.displayName').empty().html(_i18n_.get("GUI_POPUP_INCOMING_CALL"));
            $('#incomingCall .incomingCallRow[data-lineNum="'+lineNum+'"] .incomingCallMessage.dialString').empty().html("<div class=\"loadingSmall\"></div>"); 
            $('#incomingCall .incomingCallRow[data-lineNum="'+lineNum+'"]').addClass('ringing');
            $('#incomingCall .incomingCallRow[data-lineNum="'+lineNum+'"]').show();
            $('#incomingCall .lt[data-lineNum="'+lineNum+'"]').show();
            $('#incomingCall .incomingCallControls[data-lineNum="'+lineNum+'"]').show();
        }
        repositionPopUpEnvironment("#incomingCall");
    }
    //WKRASKO 051713 - PNG-605, Finally! A bit of a hack, always on top, but it works and this has been a hell of a issue!
    //WKRASKO 091412 - PNG-390
    if(__thisWindow__.isMinimized())
        __thisWindow__.showNormal();//KTRUMBLE 09252012 PNG-466 - adjusting to restore vs maximize
    if(!__thisWindow__.isAlwaysOnTop()){
        __thisWindow__.setAlwaysOnTop(true);
        __thisWindow__.setAlwaysOnTop(false);
    }
}

function updateIncomingCallPopUp(line){
    //WKRASKO 120512 - PNG-725 Going to do some re-coding below for display name, to follow the way caller id works on a land line, so highest to lowest priority:
    //Normal incoming call pop: Local/Contact name -> MCS/line displayName(if displayName != dialString) -> "Unknown caller"
    //Active incoming accept: Local/Contact name -> MCS/line displayName -> dialString
    var displayName = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG");
    var dialString = line.call.remote.dialString;
    if (!isDefined(dialString)) { dialString = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_GROUP"); }
    dialString = cleanDisplayString(dialString);
    var callType = JAMBO_APP.ContactList.getNumTypeByNumber(dialString);
    
    if(isDefined(dialString) && JAMBO_APP.ContactList.contactExists(dialString))
        displayName = JAMBO_APP.ContactList.contactNameByNumber(dialString);
    else if (isDefined(dialString) && isDefined(line.call.remote.alias) && dialString!=line.call.remote.alias)
        displayName = line.call.remote.alias;
    
    var incomingCallName = sanitize(displayName);//KTRUMBLE 09292012 PNG-497 - truncating displayname of incoming call pop
    $('#incomingCall .incomingCallRow[data-lineNum="'+line.lineNum+'"] .incomingCallMessage.displayName').html(incomingCallName).attr('title',incomingCallName);//WKRASKO 110212 - PNG-640, added title
    var formattedNum = sanitize(dialString);
    if(sipPhonePurpReg.test(formattedNum))
        formattedNum = format10D(formattedNum);
    //WKRASKO 051413 - PNG-1130 and PNG-1131, appears we no longer set the name for the accept call button. Leaving behind (fixed) in case.
    /*if(displayName==_i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG"))
        $('div#newCallControls'+line.lineNum+' div.newActiveIncomingCallControls .newActiveCallAnswer').html(formattedNum);//WKRASKO 112712 - PNG-604
    else
        $('div#newCallControls'+line.lineNum+' div.newActiveIncomingCallControls .newActiveCallAnswer').html(incomingCallName);*/
    $('#incomingCall .incomingCallRow[data-lineNum="'+line.lineNum+'"] .incomingCallMessage.dialString').html(formattedNum);
    $('#incomingCall .incomingCallRow[data-lineNum="'+line.lineNum+'"] .numType').html((callType!=null)?callType+" -":"");//KTRUMBLE 092412 PNG-461 - show nothing if callType is null
    if(JAMBO_APP.ContactList.isFavoriteByNumber(dialString))
        $('#incomingCall .incomingCallRow[data-lineNum="'+line.lineNum+'"] .favStar').show();
    repositionPopUpEnvironment("#incomingCall");
    if(lineInfo[line.lineNum]==null){
        var tempDate = new Date();
        var tempTime = tempDate.format("h:i A");
        lineInfo[line.lineNum] = {callTime: tempTime, displayName: sanitize(displayName), dialNumber: sanitize(dialString), missed:false}//Save line info for missed call if needed.
    }
}

function closeIncomingCallPopUp(line){
    var $incomingCallPopUp = $("#incomingCall");
    if ($incomingCallPopUp.is(":visible")) {
        $('#incomingCall .incomingCallRow[data-lineNum="'+line.lineNum+'"] .favStar').hide();
        $('#incomingCall .incomingCallRow[data-lineNum="'+line.lineNum+'"]').removeClass('ringing');
        $('#incomingCall .incomingCallRow[data-lineNum="'+line.lineNum+'"]').hide();
        $('#incomingCall .lt[data-lineNum="'+line.lineNum+'"]').hide();
        $('#incomingCall .incomingCallControls[data-lineNum="'+line.lineNum+'"]').hide();
        repositionPopUpEnvironment("#incomingCall");
        if ($('#incomingCall .incomingCallRow.ringing').length == 0) {
            //setTrayIconAndTooltip();
            $incomingCallPopUp.removeClass("ringing");
            $incomingCallPopUp.hide();
            //WKRASKO 080312 - PNG-305
            if(!$('.rndpop').is(':visible'))
                $("div#popDiv").hide();
            $("#popDiv").removeClass('popDivAnimated');
        }
    }
    //repositionPopUpEnvironment("#incomingCall");
}

function openActiveCall(line){
    var $window = $(window);
    line.$activeCallElement.addClass('pActive');
    if (line.call.onHold) { line.$activeCallElement.addClass("onHold"); }
    else { line.$activeCallElement.removeClass("onHold"); }
    //WKRASKO 120512 - PNG-725 Going to do some re-coding below for display name, to follow the way caller id works on a land line, so highest to lowest priority:
    //Normal incoming call pop: Local/Contact name -> MCS/line displayName(if displayName != dialString) -> "Unknown caller"
    //Active incoming accept: Local/Contact name -> MCS/line displayName -> dialString
    var displayName = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG");
    var dialString = line.call.remote.dialString;
    if (!isDefined(dialString)) { dialString = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_GROUP"); }
    dialString = cleanDisplayString(dialString);
    if(isDefined(dialString) && JAMBO_APP.ContactList.contactExists(dialString))
        displayName = JAMBO_APP.ContactList.contactNameByNumber(dialString);
    else if (isDefined(dialString) && isDefined(line.call.remote.alias) && dialString!=line.call.remote.alias)
        displayName = line.call.remote.alias;
    displayName = sanitize(displayName);
    var $lineDisplayStringDiv = $('div#'+line.label+".activeCall div.activeCallDisplayName");
    if(displayName == _i18n_.get('GUI_ADDRESSBOOK_UNKNOWN_LONG') && dialString != _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_GROUP")) displayName = format10D(dialString);
    else if(displayName == _i18n_.get('GUI_ADDRESSBOOK_UNKNOWN_LONG') && dialString == _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_GROUP")) displayName = '';
    $lineDisplayStringDiv.html(displayName).attr('title',displayName);
    $('div#'+line.label+".activeCall div.activeCallDisplayName_overlay").html(displayName);//WKRASKO 051613 - PNG-1044, why oh why does someone keep using this trimToPX function when we have css3 AND that css3 stuff is already in place! Just adjust div width!
    $('#calltab' + line.lineNum).show();
    
    if (applicationSettings.mode == "kiosk") { //Open Active call process only for Kiosk
        if (!$('#kiosk_mainarea').hasClass('connected')) { $('#kiosk_mainarea').addClass('connected'); }
        $('#dialSectionHead').show();
        $('#chatSectionHead').show();
        $('#chatSectionHead').click();
        if (!$('#dialSectionHead_wrapper').hasClass('incall')) $('#dialSectionHead_wrapper').addClass('incall');
        setContentHeight($window);
    } else if (getPlatform() == "VRI") { //Open Active call process only for VRI mode
        if (!$('#kiosk_mainarea').hasClass('connected')) { $('#kiosk_mainarea').addClass('connected'); }
        if (!$('#vri_settings_gear').hasClass('connected')) { $('#vri_settings_gear').addClass('connected'); }
        $('#chatSectionHead').show();
        if (!$('#dialSectionHead_wrapper').hasClass('incall')) $('#dialSectionHead_wrapper').addClass('incall');
    } else {
    }

    setDialPlus();
    $('#calltab'+line.lineNum).addClass('activeTab');
    if (!$('#NewCallBtn').hasClass('callActive')) $('#NewCallBtn').addClass('callActive');
    if(!$('#newCallControls').hasClass('callActive')) $('#newCallControls').addClass('callActive');
    $('div#newCallControls' + line.lineNum).show();

    //setContentHeight($window);
    P2PdStr=line.call.remote.dialString;//PNG-186 KTRUMBLE 10302012 - Add P2PChat
    if(!JamboSocket.isVRS) enableP2PChat(line);
}

function updateActiveCall(line, status, error){
    var $window = $(window);   
    
    if (line.call.onHold) {line.$activeCallElement.addClass("onHold");}
    else {line.$activeCallElement.removeClass("onHold");}
    
    if (line.idle) {line.$activeCallElement.addClass("idle");}
    else {line.$activeCallElement.removeClass("idle");}
    
    if (isDefined(error)) {
        if (error) {line.$activeCallElement.addClass("error");}
        else {line.$activeCallElement.removeClass("error");}
    }
    
    if (line.call.recording) {line.$activeCallElement.addClass("recording");}
    else {line.$activeCallElement.removeClass("recording");}
    
    if (line.call.isEncrypted) {line.$activeCallElement.addClass("encrypted");} 
    else {line.$activeCallElement.removeClass("encrypted");}
    
    var displayName = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG");
    var dialString = line.call.remote.dialString;
    if (!isDefined(dialString)) { dialString = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_GROUP"); }
    dialString = cleanDisplayString(dialString);
    if(isDefined(dialString) && !isDefined(line.call.remote.displayName) && JAMBO_APP.ContactList.contactExists(dialString))
        displayName = JAMBO_APP.ContactList.contactNameByNumber(dialString);
    else if (isDefined(dialString) && isDefined(line.call.remote.displayName) && JAMBO_APP.ContactList.contactExists(dialString))//PNG-799 KTRUMBLE - adding another case to use the pre-defined displayName, allows multiple names for the same number and displays the correct name dialed
        displayName = line.call.remote.displayName;
    else if (isDefined(dialString) && isDefined(line.call.remote.alias) && dialString!=line.call.remote.alias)
        displayName = line.call.remote.alias;
    displayName = sanitize(displayName);
    
    if(displayName == _i18n_.get('GUI_ADDRESSBOOK_UNKNOWN_LONG') && dialString != _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_GROUP")) displayName = format10D(dialString);
    else if(displayName == _i18n_.get('GUI_ADDRESSBOOK_UNKNOWN_LONG') && dialString == _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_GROUP")) displayName = '';
    var $lineDisplayStringDiv = $('div#'+line.label+".activeCall div.activeCallDisplayName");
    var truncLength = (line.call.onHold)?110:160;//for onhold state
    if(!isRedirect) $lineDisplayStringDiv.html(displayName).attr('title',displayName);
    $('div#'+line.label+".activeCall div.activeCallDisplayName_overlay").html(displayName);
    $('div#minfo'+line.lineNum+' div.minimizedCallDisplayName').html(displayName);

    if ( isDefined(status) && (status=="DIALING" || status=="DIALTONE" || status=="INCOMING" || status=="REMOTE_RINGING" || status=="EARLYMEDIA" || status=="TRANSFERRING_PROCEEDING" || status=="TRANSFERRING_RINGBACK" || status=="TRANSFERRING_CONNECTED") ) {
        $("div#callBtnOverlay").removeClass("dn");//PNG-878 KTRUMBLE 02282013 - adding ringing animation back in
        $("div#callTabOverlay_"+line.lineNum).removeClass("dn");
        $("div#newCallControls"+line.lineNum+" div.newActiveCallControls").addClass("dn");
        $('div#'+line.label+".activeCall div.activeCallInformation div.activeCallStatus").html('');//PNG-511 KTRUMBLE 10042012 - outgoing call animation

        if (applicationSettings.mode == "kiosk") { // use "Ringing" instead of "Calling" during kiosk mode
            $("div#callTabOverlay_" + line.lineNum + " .calling").text("Ringing: ");
            $("#kiosk_ringing_"+line.lineNum).removeClass("dn");
        } else { }
    }
    //PNG-511 KTRUMBLE 10042012 - new outgoing call animations
    if ( isDefined(status) && (status=="DIALING" || status=="REMOTE_RINGING") ) {
        //display the displayName in the dialing bar while ringing
        document.getElementById('dialingBarName').innerHTML=displayName;//jquery $().html() is failing, using standard javascript method
        //start up the "dialing dots"
        dialingDotsInterval = setInterval('dialingDots(3)',650);
    }
    //END PNG-511

}

function setActiveCallTimeUpdater(line){
    updateCallOnLine(line.lineNum);
}

function updateCallOnLine(lineNum) {   
    var line = lineRepository.getLine(lineNum);
    if (isDefined(line)) {
        if (!line.idle) {
            var elapsedTime = '00:00:00';
            if (isDefined(line.call.startTimestamp)) {
                var nowTimestamp = new Date().getTime();
                elapsedTime = formatMillis(nowTimestamp - line.call.startTimestamp);
            }
            if(!$("div#callTabOverlay_"+lineNum).hasClass('dn')) $("div#callTabOverlay_"+lineNum).addClass("dn");
            $("div#newCallControls"+lineNum+" div.newActiveCallControls").removeClass("dn");
            if(fullScreen && !callMinimized){
                $('#fullScreenButtonImg').attr('src','img/png-fullscreen-close.png');
                $('#fullScreenButtonImg').addClass('fullScreenOn');
            }
            //END PNG-511
            $('div#'+line.label+".activeCall div.activeCallInformation div.activeCallStatus").html(elapsedTime);
            //WKRASKO 110912 - PNG-689, along with many other changes.
            $('div#minfo'+line.lineNum+' div.minimizedCallStatus').html(elapsedTime);
            line.call.updater = setTimeout('updateCallOnLine('+line.lineNum+')',1000);
            //PNG-186 KTRUMBLE 10302012 - Add P2PChat
            if(P2PChatEnabled){
                if(JamboSocket.hasMessages==false){
                    //WKRASKO 113012 - PNG-758, done by user now//$('#terpChat_wrap').html('');
                    $('#terpChat_send').removeClass('terpChatDisabled');
                    $('#terpChat_send').addClass('terpChatEnabled');
                    $('#terpChatEntry').removeAttr('disabled');
                }
            }
            //END PNG-186
        } else {
            clearActiveCallTimeUpdater(line);
        }
    }
}

function clearActiveCallTimeUpdater(line){
    if (isDefined(line.call.updater)) {
        clearTimeout(line.call.updater);
        line.call.updater = undefined;
    }
}

function clearDelayedCloseActiveCall(line){
    clearTimeout(line.delayedCloseTimeout);
}

function setDelayedCloseActiveCall(line){    
    line.delayedCloseTimeout = setTimeout("closeActiveLine("+line.lineNum+")", 2000);//WKRASKO, not even sure why they time this out, but it was too high.
}

function closeActiveLine(lineNum) {
    var $window = $(window);
    var line = lineRepository.getLine(lineNum);
    var noActiveCalls = true;
    var thisLineElements = $('div.tabControls');
    thisLineElements.children('div.activeCall.connected').each(function(){ noActiveCalls=false; });
    if (noActiveCalls) {
        $('#terpChat_head_VIID').html('');
        format="default";
        $('.icD_enteredNum').html('');
        dialFieldWithFocus=null;
        lineInfo[lineNum] = null;
        if(__thisWindow__.isAlwaysOnTop())
            __thisWindow__.setAlwaysOnTop(false);
        onCall = false;

        if (applicationSettings.mode == "kiosk") { //Close active line process only for Kiosk
            if ($('#kiosk_mainarea').hasClass('connected')){ $('#kiosk_mainarea').removeClass('connected'); }
            $('#dialSectionHead').hide();
            $('#chatSectionHead').hide();
            if ($('#dialSectionHead_wrapper').hasClass('incall')) $('#dialSectionHead_wrapper').removeClass('incall');
        } else if (getPlatform() == "VRI") { //Close active line process only for VRI mode
            if ($('#kiosk_mainarea').hasClass('connected')){ $('#kiosk_mainarea').removeClass('connected'); }
            if ($('#vri_settings_gear').hasClass('connected')) { $('#vri_settings_gear').removeClass('connected'); }
            if ($('#dialSectionHead_wrapper').hasClass('incall')) $('#dialSectionHead_wrapper').removeClass('incall');
            $('#dialSectionHead').hide();
            $('#chatSectionHead').show();
            $('#specialInstructions').val('');
            $('#specialInstructions').blur();
        } else { }
    }
    //We have one, but not 2
    $('#threeWayContainer').hide();$('#threeWayButton').unbind();
    
    setTimeout(syncHistory,1000);
    setContentHeight($window);
    $('div#calltab'+lineNum+' div.activeCall div div.callStatus').show();
    $('div#calltab'+lineNum+' div.activeCall div div.onhold').hide();
    $('div#newActiveCallResume'+lineNum).hide();
    $('div#newActiveCallHold'+lineNum).show();
    $('#calltab' + lineNum).hide();

    setDialPlus();
    if(!onCall){
        $('div#newAudioMute').hide();
        $('div#newVideoLayout').hide();
        $('div#newVideoFullScreen').hide();
    }
    //PNG-1048 KTRUMBLE 04082013 - show privacy slide if privacy mode is enabled on hanging up calls
    if (noActiveCalls && lineRepository.cameraPrivacyMode){
        $('#videoPrivacySlide').removeClass('dn');
        hideEmbeddedVideoComposer();
    }
    if(!$("div#callBtnOverlay").hasClass('dn')) $("div#callBtnOverlay").addClass("dn");//PNG-878 KTRUMBLE 02282013 - adding ringing animation back in
    if (applicationSettings.mode == "kiosk") { // use "Ringing" indicator instead of "Calling" during kiosk mode
        if(!$("#kiosk_ringing_"+lineNum).hasClass('dn')) $("#kiosk_ringing_"+lineNum).removeClass("dn");
    } else { }

    $('div#newCallControls'+line.lineNum).hide();
    if($('#NewCallBtn').hasClass('callActive') && !onCall) $('#NewCallBtn').removeClass('callActive');
    if ($('#newCallControls').hasClass('callActive') && !onCall) $('#newCallControls').removeClass('callActive');
}

function onLineUpdated(lineNum) {
    var line = lineRepository.getLine(lineNum);
    var prevLineIdle   = line.$activeCallElement.data("idle");
    var prevCallStatus = line.$activeCallElement.data("callStatus");
    var prevCallOnHold = line.$activeCallElement.data("callOnHold");
    if (!isDefined(prevCallOnHold)) { prevCallOnHold = false; }
    var newLineIdle    = line.idle;
    var newCallStatus  = line.idle ? undefined : line.call.status;
    var newCallOnHold  = line.call.onHold;
    if (!isDefined(newCallOnHold)) { newCallOnHold = false; }
    
    __log__.debug("LINE UPDATE|idle("+prevLineIdle+"-->"+newLineIdle+")|call.status("+prevCallStatus+"-->"+newCallStatus+")");
    
    line.$activeCallElement.data("idle", line.idle);
    line.$activeCallElement.data("callStatus", line.call.status);
    line.$activeCallElement.data("callOnHold", line.call.onHold);
    
    //This won't work for deaf users, they won't know it is ringing if they can not hear the ringer, needs to show as soon as we start ringing
    if (line.call.videoTx || line.call.videoRx || line.call.videoH239Tx || line.call.videoH239Rx) { showVideoComposerForLine(line); }
    
    if (prevLineIdle) { // was idle
        
        if (newLineIdle) { // remains idle, nothing to do

        } else { // becomes occupied, initializing call
            clearDelayedCloseActiveCall(line);
            if (!isDefined(lineRepository.getAvailableLine())) { lockCalls(); }
            
            switch (newCallStatus) {
            
            case Line.CallStatus.INCOMING: // incoming call
                __thisWindowProxy__.stopNotificationPlayback(getFlasher(), "wav/solid.wav");//WKRASKO 120412 - PNG-734
                doIncoming=function(){
                    var dialString = line.call.remote.dialString;
                    if(dialString.indexOf(":")!=-1)
                        dialString = dialString.split(":")[1];
                    if(dialString.indexOf("@")!=-1)
                        dialString = dialString.split("@")[0];
                    if(JAMBO_APP.BlockedNumbers.isBlocked(dialString)){
                        line.dropCall(function(){ onLineUpdated(line.lineNum); }); 
                    } else {
                        if (!applicationSettings.autoanswer) {
                             openIncomingCallPopUp(line);
                             updateIncomingCallPopUp(line);
                        } else {
                            __thisWindowProxy__.answerCall(line.lineNum, undefined, undefined, false);
                        }
                        openActiveCall(line);
                        updateActiveCall(line, newCallStatus, false);

                        __thisWindow__.activate();//WKRASKO 101812 - PNG-605, incorrect call
                        __thisWindow__.highlight();
                    }
                }
                setTimeout(doIncoming,500);
                break;
                
            case Line.CallStatus.DIALING: // outgoing call  
                openActiveCall(line);
                updateActiveCall(line, newCallStatus, false);
                $('div#newCallControls'+line.lineNum).show();
                $('#calltab'+line.lineNum).show();
                if (applicationSettings.mode == "kiosk") { //Dialing process only for Kiosk
                    if (!$('#kiosk_mainarea').hasClass('connected')){ $('#kiosk_mainarea').addClass('connected'); }
                    setContentHeight($window);
                } else if (getPlatform() == "VRI") { //Dialing process only for VRI mode
                    if (!$('#kiosk_mainarea').hasClass('connected')) { $('#kiosk_mainarea').addClass('connected'); }
                    if (!$('#vri_settings_gear').hasClass('connected')) { $('#vri_settings_gear').addClass('connected'); }
                } else { }
                setDialPlus();
                if (!$('#NewCallBtn').hasClass('callActive')) $('#NewCallBtn').addClass('callActive');
                if(!$('#newCallControls').hasClass('callActive')) $('#newCallControls').addClass('callActive');
                $('div#newCallControls'+line.lineNum+' div.newActiveCallDrop').show();
                $('div#newCallControls'+line.lineNum+' div.newActiveCallControls').show();
                $('div#newCallControls'+line.lineNum+' div.newActiveIncomingCallControls').hide();
                break;
                
            default:
                // PSEUDO / unexpected status
                break;
            
            }
        }
        
    } else { // was occupied
        if (newLineIdle) { // becomes idle, finalizing call  
            updateActiveCall(line);
            setDelayedCloseActiveCall(line);
            if (callsLocked) { unlockCalls(); }
            syncPurpleMail();//WKRASKO 120412 - PNG-734
        } else { // remains occupied, during call            
            
            if (newCallOnHold != prevCallOnHold) { // changing hold status
                if (newCallOnHold) { clearActiveCallTimeUpdater(line); } 
                else { setActiveCallTimeUpdater(line); }
            }
                
            if (prevCallStatus == newCallStatus) { // same call status, some information may have been changed
                updateActiveCall(line);
                updateIncomingCallPopUp(line);
                
            } else { // status is changed 
                closeIncomingCallPopUp(line);
                
                line.getCallInfo(onLineUpdated(line.lineNum));
                         
                switch (newCallStatus) {
                    case Line.CallStatus.REMOTE_RINGING:
                        updateActiveCall(line, newCallStatus);
                        //WKRASKO 052013 - PNG-1023. This SHOULD work. If we're here, we are connecting second call
                        if(!$('#newVideoLayout').hasClass('callScreenControlDisabled'))
                            $('#newVideoLayout').addClass('callScreenControlDisabled');
                        break;
                    case Line.CallStatus.EARLYMEDIA:
                        updateActiveCall(line, newCallStatus);
                        break;
                    case Line.CallStatus.CONNECTED:
                        //WKRASKO 091912 - PNG-343, init socket if iTRS
                        //WKRASKO 101612 - PNG-495, incoming dial string is not a simple number to lookup. :(
                        var lookupString = line.call.remote.dialString; //sip:7142000036@174.137.37.235;
                        if (lookupString.indexOf(":") != -1)
                            lookupString = lookupString.split(":")[1];
                        if (lookupString.indexOf("@") != -1)
                            lookupString = lookupString.split("@")[0];
                        if (prevCallStatus == Line.CallStatus.INCOMING)
                            JAMBO_APP.WebServices.doITRSLookup(lookupString, line.call.remote.alias, iTRSLookupSuccessIncoming, iTRSLookupFail);
                        //WKRASKO 090412 - PNG-345, moved this block to top, so it happens before connected class is added to "new" line
                        if (onCall) {
                            var thisLine = parseInt(line.lineNum);
                            var otherLine = null, otherLineNum = null;
                            for (var jkl = 0; jkl < availableLines; jkl++) {
                                if (jkl != thisLine) {
                                    otherLine = lineRepository.getLine(jkl);
                                    otherLineNum = otherLine.lineNum;
                                }
                            }
                            //Hold other line(s)
                            otherLine.setCallOnHold(true, function () { onLineUpdated(otherLineNum) });
                            $('#newActiveCallHold' + otherLineNum).click();
                            $('#threeWayContainer').show();
                            $('#threeWayButton').unbind().click(function () {
                                for (var jkl = 0; jkl < availableLines; jkl++) {
                                    $('div#newActiveCallResume' + jkl).hide();
                                    $('div#newActiveCallHold' + jkl).show();
                                    $('div#calltab' + jkl + ' div.activeCall div div.callStatus').show();
                                    $('div#calltab' + jkl + ' div.activeCall div div.onhold').hide();
                                    var line = lineRepository.getLine(jkl);
                                    if (!line.idle && line.call.onHold)
                                        line.setCallOnHold(false, function () { onLineUpdated(jkl) });
                                }
                            });
                            //WKRASKO 052013 - PNG-1023. This SHOULD work. If we're here, we are connecting second call
                            if(!$('#newVideoLayout').hasClass('callScreenControlDisabled'))
                                $('#newVideoLayout').addClass('callScreenControlDisabled');
                        } else
                            onCall = true;
                        line.$activeCallElement.addClass("connected");
                        setActiveCallTimeUpdater(line);
                        $('div#newCallControls' + line.lineNum).show();
                        $('#calltab' + line.lineNum).show();
                        setDialPlus();
                        if (!$('#NewCallBtn').hasClass('callActive')) $('#NewCallBtn').addClass('callActive');
                        if (!$('#newCallControls').hasClass('callActive')) $('#newCallControls').addClass('callActive');
                        $('div#newCallControls' + line.lineNum + ' div.newActiveCallDrop').show();
                        $('div#newCallControls' + line.lineNum + ' div.newActiveCallControls').show();
                        $('div#newCallControls' + line.lineNum + ' div.newActiveIncomingCallControls').hide();
                        $('div#newVideoLayout').show();
                        $('div#signOffTab').hide();
                        $('div#newAudioMute').show();
                        $('div.signOffTab').hide();

                        if (applicationSettings.mode == "kiosk") { //Connected process only for Kiosk
                            if (!$('#kiosk_mainarea').hasClass('connected')) { $('#kiosk_mainarea').addClass('connected'); }
                            setContentHeight($window);
                        } else if (getPlatform() == "VRI") { //Connected process only for VRI mode
                            if (!$('#kiosk_mainarea').hasClass('connected')) { $('#kiosk_mainarea').addClass('connected'); }
                            if (!$('#vri_settings_gear').hasClass('connected')) { $('#vri_settings_gear').addClass('connected'); }
                        } else {
                            $('div#newVideoFullScreen').show();
                        }

                        if (!$("div#callBtnOverlay").hasClass('dn')) $("div#callBtnOverlay").addClass("dn"); //PNG-878 KTRUMBLE 02282013 - adding ringing animation back in
                        if (applicationSettings.mode == "kiosk") { // use "Ringing" indicator instead of "Calling" during kiosk mode
                            if (!$("#kiosk_ringing_" + line.lineNum).hasClass('dn')) $("#kiosk_ringing_" + line.lineNum).removeClass("dn");
                        } else { }

                        if (!$('#videoPrivacySlide').hasClass('dn')) {//PNG-1048 KTRUMBLE 04082013 - show privacy slide if privacy mode is enabled on hanging up calls
                            $('#videoPrivacySlide').addClass('dn');
                            showEmbeddedVideoComposer();
                        }
                        if ($('#chatSectionHead').hasClass('bottom') && (JamboSocket.isVRS || P2PChatEnabled)) {//WKRASKO 051613 - PNG-1128, cleaning up auto-show chat all around for robustness
                            $('#chatSectionHead').click();
                        }
                        break;
                    case Line.CallStatus.DISCONNECTED:
                        //WKRASKO 101812 - PNG-588, socket hangup didn't account for other line on call, and above socket hangup was un-necessary
                        var altLine = lineRepository.getLine((lineNum == "1" || lineNum == 1) ? 0 : 1);
                        var altLineOnCall = (altLine.idle) ? false : true;
                        if (JamboSocket.connection != null && !JamboSocket.isRedirecting && (!altLineOnCall || !altLine.call.isVRS)) {//WKRASKO 112912 - PNG-740, bad mojo here, would only hang up socket if ALL calls were disconnected
                            JamboSocket.goodDisconnect = true;
                            JamboSocket.connection.close();
                            isRedirect = false;
                        }
                        line.$activeCallElement.removeClass("connected");
                        clearActiveCallTimeUpdater(line);

                        if (prevCallStatus == Line.CallStatus.INCOMING) {
                            if (!isDefined(line.callDropped) || !line.callDropped) {
                                lineInfo[lineNum].missed = true;
                                if ($('#missedCallsCount').text() >= 1) $('#missedCalls').show();
                                showMissedCalls();
                            }
                        }
                        
                        //WKRASKO 052013 - PNG-1023. This SHOULD work. No matter what if we're hanging a line up this should be enabled
                        if($('#newVideoLayout').hasClass('callScreenControlDisabled'))
                            $('#newVideoLayout').removeClass('callScreenControlDisabled');
                    
                    //WKRASKO 031413 - Support auto dialing for test
                    if(autocallnumber!="")
                        setTimeout(dropAllActiveCalls,autocallduration);
                        var disconnectReason = line.call.disconnectReason;
                        if (isDefined(disconnectReason) && (disconnectReason != Event.callNotificationSubtype.DISCONNECTED_NORMAL)) { // reason given
                            switch (disconnectReason) {
                                case Event.callNotificationSubtype.DISCONNECTED_NORMAL:
                                case Event.callNotificationSubtype.DISCONNECTED_LOCAL:
                                case Event.callNotificationSubtype.REDIRECTING:
                                    updateActiveCall(line, newCallStatus);
                                    break;
                                //WKRASKO 111212 - PNG-615, new modal notify user that nobody answered.   
                                case Event.callNotificationSubtype.DISCONNECTED_BUSY:
                                case Event.callNotificationSubtype.DISCONNECTED_UNANSWERED:
                                case Event.callNotificationSubtype.DISCONNECTED_UNREACHABLE:
                                case Event.callNotificationSubtype.DISCONNECTED_REJECT:
                                    $('#inputCancel').hide();
                                    openInputPop(_i18n_.get("MSG_WARN_NOANSWER"), '<center><img border="0" alt="No answer" src="img/noanswer.png"/></center>', 0.9, function () {
                                        closeInputPop(); $('#inputCancel').show();
                                    });
                                    setTimeout(function () {
                                        if ($('#inputPop').is(':visible')) { closeInputPop(); $('#inputCancel').show(); }
                                    }, 12000);
                                    break;
                                default:
                                    updateActiveCall(line, disconnectReason, true);
                                    break;
                            }
                        } else {
                            updateActiveCall(line, newCallStatus);
                        }
                        if (isDefined(lineRepository.getAvailableLine())) {
                            $('#dialViewer').removeClass('dn');
                            $('#chatViewer').addClass('dn');
                            $('#chatSectionHead').removeClass('top');
                            $('#chatSectionHead').addClass('bottom');
                            $('#chatMenu').addClass('bottom');
                            $('div#addCall').hide();

                            if (applicationSettings.mode == "kiosk") { //Disonnected process only for Kiosk
                                if ($('#dialSectionHead_wrapper').hasClass('incall')) $('#dialSectionHead_wrapper').removeClass('incall');
                                $('#chat_clearChat').click();
                                $('#outboundNumEntry').val('');
                                var theInstructions = _i18n_.get('GUI_SETTINGS_CALL_SI');
                                $('#specialInstructions').val(theInstructions);
                            } else {
                                $('div.signOffTab').show();
                            }
                        }
                        //the onhold indicators were hanging around sometimes, let's make sure it gets disabled on disconnect
                        $('#calltab' + line.lineNum + ' div.activeCall div div.onhold').hide();

                        if (!altLineOnCall && fullScreen) {
                            setTimeout(hideVideoOnlyMode, 1000);
                            fullScreen = false;
                        }
                        if (P2PChatEnabled) JamboSocket.closeChat();
                    
                    //WKRASKO 031413 - Support auto dialing for test
                    if(autocallnumber!="")
                        autocallInterval = setTimeout(autoCallDialer,autocallgap);
                        break;
                    default:
                        // PSEUDO / unexpected status
                        break;
                }
            }
        }
    }
}

function setDialPlus() {
    //PNG-956  Hide "+" add call whenever two lines are connected.
    $('div#addCall').hide();
    if ($('#calltab0').is(':visible') && $('#calltab1').is(':visible')) {
        $('#addCall').hide();
    } else if ($('#calltab0').is(':visible') || $('#calltab1').is(':visible')) {
        $('#addCall').show();
    }
}
function showVideoComposerForLine(line) {
    //WKRASKO 101812 - PNG-494, this if came from example app, not sure how it ever worked as no code resets videoComposerShown
    //Doesn't appear to be needed anyways, with our visible check, but leaving in case
    //if (!isDefined(line.call.videoComposerShown) || !line.call.videoComposerShown) {
        //WKRASKO 110612 - PNG-681
        if($('#popDiv').is(':visible'))
            $('#popDiv').hide();
        $('.rndpop:visible').hide();
        if(isDefined(applicationSettings.alwaysOnTopDuringCall) && applicationSettings.alwaysOnTopDuringCall)
            __thisWindow__.setAlwaysOnTop(true);
        line.call.videoComposerShown = true;
    //}
}

function lockCalls(){
    callsLocked = true;
}

function unlockCalls(){ 
    callsLocked = false;
}

function lockCallsWithTimeout() {
    lockCalls();
    if (isDefined(callLockTimeout)) { 
        clearTimeout(callLockTimeout);
        callLockTimeout = undefined;
    }
    if (isDefined(switchToDialingTimeout)) { 
        clearTimeout(switchToDialingTimeout);
        switchToDialingTimeout = undefined;
    }
    callLockTimeout = setTimeout('unlockCallsIfPossible()', 5000);
}

function unlockCallsIfPossible() {
    if (isDefined(lineRepository.getAvailableLine())) { unlockCalls(); }
}

function initCallFromDialString(dialString, displayName, numType) {
    if(!$('#NewCallBtn').hasClass('lNavActive')) $('#NewCallBtn').click();
    if(!$('#contactRecordEditMenu').hasClass('dn')) $('#contactRecordEditMenu').addClass('dn');
    if(!$('#historyRecordEditMenu').hasClass('dn')) $('#historyRecordEditMenu').addClass('dn');
    if (callsLocked) {
        //Since they may ask for this too...
        openMessagePopup('#errorPop', _i18n_.get("TITLE_ERR_MCS_CONNECTION_ERROR"), _i18n_.getHTML("MSG_WARN_CALLING_OFFLINE"), _i18n_.getHTML("COMMON_OK"),false);
        return;
    }
    if(displayName=="undefined" || displayName=="undefined undefined" || displayName==null)
        displayName = dialString;
    if(dialString!=displayName && displayName.indexOf("|apos|") != -1){//PNG-655 KTRUMBLE 11022012 - single apostrophies entered into names breaks the dial call,PNG-814 KTRUMBLE - swapping out 'search' for 'indexOf'
        while(displayName.indexOf("|apos|") != -1){
            displayName=displayName.replace("|apos|","'");
        }
    }//END PNG-655/PNG-814
    //WKRASKO 091912 - PNG-404, need to skip IP's, NOT vrs, updated 111312 - optimizing for less validation calls! Every call is resulting in like 50!
    //Ok, better, but some calls are required. They happen on line updated or draw call history.
    if(typeof numType === "undefined"){
        var validDialString=validateDialString(dialString);
        numType = validDialString.type;
    }
    //PNG-329|PNG-334|PNG-332 KTRUMBLE 08162012 - showing composer prior to dialing, so the user will know something is happening, even if it doesn't dial right away
    var line = lineRepository.getAvailableLine();
    showVideoComposerForLine(line);
    
    if( numType!="10d" && numType!="international" && numType!="911" ){//WKRASKO 102412 - PNG-633, WKRASKO 111312 - PNG-643//PNG-844 should treat 911 calls as VRS so that chat works
        if(!onCall)//WKRASKO 121112 - PNG-782, if already on VRS, we shouldn't reset this, otherwise, second attempt at VRS on line 2 will not show "no 2 vrs calls" error
            JamboSocket.isVRS = false;
        actuallyDoCallFromDialString(dialString,displayName,false);//PNG-655 KTRUMBLE 11022012 - single apostrophies entered into names breaks the dial call
    } else {
        JamboSocket.outbound10D = dialString;//PNG-342 KTRUMBLE 08232012 - collecting the dialstring for passing to the socket
        //WKRASKO 080212 - PNG-264, need socket connection first, so a bit of re-ordering
        JAMBO_APP.WebServices.doITRSLookup(dialString,displayName,iTRSLookupSuccessOutgoing, iTRSLookupFail);//PNG-655 KTRUMBLE 11022012 - single apostrophies entered into names breaks the dial call
    }
}
function actuallyDoCallFromDialString(dialString, displayName, isVRS){//WKRASKO 112912 - PNG-740, new param, need to properly hang up socket.
    var markVRS = (isDefined(isVRS))?isVRS:false;
    var line = lineRepository.getAvailableLine();//PNG-329|PNG-334|PNG-332 KTRUMBLE 08162012 - showing composer prior to dialing, so the user will know something is happening, even if it doesn't dial right away
    if (isDefined(line) && isDefined(dialString) && (dialString.length>0)) {
        __log__.info("Initializing call to ["+dialString+", "+displayName+"] on line ["+line.lineNum+"]...");
        lockCallsWithTimeout();
        // initializing caller
        var callerDisplayName = undefined;
        // initializing called
        var calledDisplayName = displayName;
        if (!isDefined(displayName)) { calledDisplayName = dialString; }
        // initializing line
        line.setOccupied();    
        //
        __thisWindowProxy__.makeCall(line.lineNum, callerDisplayName, calledDisplayName, dialString, function(response){
            if (response.result.notification == Response.makeCallNotification.callStarted) {
                __log__.info("Call ["+dialString+"] started on line ["+calledDisplayName+"]...");
                line.call.remote.dialString     = dialString;
                line.call.remote.displayName    = calledDisplayName;
                line.call.status                = Line.CallStatus.DIALING;
                line.call.isVRS = markVRS;
            } else {
                line.setIdle();
                __log__.warn("Can't call ["+dialString+"] on line ["+response.result.lineNum+"]: reason["+response.result.reason+"]");
            }
            onLineUpdated(line.lineNum);
        }, undefined, false);
        //See note above, normally done when we have one of audio/video, but for us needs to be done sooner
        //showVideoComposerForLine(line);//PNG-329|PNG-334|PNG-332 KTRUMBLE 08162012 - showing composer prior to dialing, so the user will know something is happening, even if it doesn't dial right away
    } else {
        __log__.warn("Can't call ["+dialString+"]: no available line found");
    }
}

function setAuthenticatedUserAvailable() {
    if (clientType === ClientType.Standalone) { return; }
    
    regStatus = 'available';
    
    if ((clientType == ClientType.ClearSea) || (clientType == ClientType.MCS)) {
        authenticatedUserStatus = 'available';
        if (!logoutAvailable) { logoutAvailable = true; }
        setTrayMenu(false, true);
    }
}

function setAuthenticatedUserUnavailable() {
    sipRegisterRequested = false;
    if (clientType === ClientType.Standalone) { return; }
    
    regStatus = "unavailable";

    if ((clientType == ClientType.ClearSea) || (clientType == ClientType.MCS)) {
        
        authenticatedUserStatus = 'unavailable';
        //EXAMPLE APP
        //setTrayIconTooltipAndUserDataBar();
        //__thisWindow__.setIcon("img/"+iconModifier+"_unavailable.png");
        /*if (needsTrayMessage) {
            // init contacts
            if (coreSettings.enableAddressBook) {
                pushTable("contacts", "contactsTable", [new EntryMessage({html:_i18n_.getHTML("GUI_PRIMARY_NOT_AVAILABLE")})]);
            }
            // init history
            if (coreSettings.enableCallsLog) {
                pushTable("history", "historyTable", [new EntryMessage({html:_i18n_.getHTML("GUI_PRIMARY_NOT_AVAILABLE")})]);
            }       
        }*/
        
        //EXAMPLE APP
        //$('#header').on('dblclick', '#userArea #userInfo.unavailable', function(e){
        	/*if (!sipRegisterRequested) {
        		__thisWindowProxy__.registerEndpoint("sip");
        		sipRegisterRequested = true;
        	}*/
        //});
    }
}

function setAuthenticatedUserConnecting() {
    if (clientType === ClientType.Standalone) { return; }
    if(regStatus == "unavailable"){
        if(clientType == ClientType.ClearSea){
            authenticatedUserStatus = 'unknown';
        }
    }
}
//KTRUMBLE 09282012 PNG-478 - set network status icon based on notification type
setNetworkStatus = function(status){
    if(status=='STATUS_UNREGISTERING' || status=='STATUS_NOTREGISTERED' || status=='UNINIT'){
        if($('#networkStatus').hasClass('status_online'))
            $('#networkStatus').removeClass('status_online');
        if($('#networkStatus').hasClass('status_connecting'))
            $('#networkStatus').removeClass('status_connecting');
        $('#networkStatus').addClass('status_offline');
    } else if(status=='STATUS_REGISTERED'){
        if($('#networkStatus').hasClass('status_offline'))
            $('#networkStatus').removeClass('status_offline');
        if($('#networkStatus').hasClass('status_connecting'))
            $('#networkStatus').removeClass('status_connecting');
        $('#networkStatus').addClass('status_online');
    } else if(status=='STATUS_REGISTERING'){
        if($('#networkStatus').hasClass('status_offline'))
            $('#networkStatus').removeClass('status_offline');
        if($('#networkStatus').hasClass('status_online'))
            $('#networkStatus').removeClass('status_online');
        $('#networkStatus').addClass('status_connecting');
    }
}

function processEndpointNotification(endpoint, type, subtype, serverInfo) {
    
    //KTRUMBLE 09282012 PNG-478 - set network status icon based on notification type
    setNetworkStatus(type);
    if(type=="STATUS_REGISTERED")
        unlockCalls();
    else
        lockCalls();
    
    if (    !isDefined(endpoint) || 
            (
                    (endpoint !== Event.endpointNotificationEndpoint.sip) && 
                    (endpoint !== Event.endpointNotificationEndpoint.h323) && 
                    (endpoint !== Event.endpointNotificationEndpoint.rtsp))
            ) {
        return;
    }
    var newEndpointStatus = {
            status:type,
            reason:subtype,
            server:serverInfo
    };
    var oldEndpointStatus = endpointStatuses[endpoint];
    
    var diff = $.diff(oldEndpointStatus, newEndpointStatus);
    if ($.isEmptyObject(diff.add) && $.isEmptyObject(diff.mod) && $.isEmptyObject(diff.del)) {
        // no difference detected, skipping event
        return;
    }
    
    endpointStatuses[endpoint] = newEndpointStatus;
    
    if (clientType === ClientType.Standalone) {
        updateProtocolStatusIcon(endpoint, newEndpointStatus.status, newEndpointStatus.reason);
        if ((endpoint === Event.endpointNotificationEndpoint.sip) && (newEndpointStatus.status === Event.endpointNotificationType.UNINIT)) {
        	closeAuthenticationPopup();
        }
        setProtocolsTrayIcon();
        //EXAMPLE APP
        //updateUserURIs();
    }
}

//WKRASKO - 041712 SETTINGS TEMP - For early test only, probably replace by gui settings later (this one is from Example App)
function openSettingsWindow(firstRun) {    
    var windowName = "settings:settings";
    var windowLocation = "settings.html";
    //alert(windowLocation);
    windowsRepository.open(
            windowLocation, 
            windowName, 
            (firstRun) ? "First run configuration" : "Configuration",
            {
                "name": windowName,
                "startedMinimized": false,
                "firstRun": firstRun
            });
}
//WKRASKO - SETTINGS TEMP END

function openIPRelayWindow(number){
    var theInstructions = ($('#specialInstructions_IPR').val()==_i18n_.get('GUI_SETTINGS_CALL_SI'))?'':$('#specialInstructions_IPR').val();
    var relayUrl = JAMBO_APP.ipRelayURL+"?";
    relayUrl += "theNumber="+number+"&";
    relayUrl += "theInstructions="+theInstructions+"&";
    relayUrl += "relayLang="+$('[name=opLanguage_radio]:checked').val()+"&";
    relayUrl += "myGUID="+JAMBO_APP.activeUserAccount+"&";
    relayUrl += "opGen="+$('[name=opGender_radio]:checked').val()+"&";
    relayUrl += "imTTY=1&";
    relayUrl += "myID=-1&";
    relayUrl += "myDeviceID=-1&";
    /*if( $('[name="vcotype_radio"]:checked').val()=="2" ){
        relayUrl += "vcoType=telephone&";
        relayUrl += "vcoNumber="+$('#vconumber').val()+"&";
    }*/
    relayUrl += "vcoNumber="+$('#vcocallback').val()+"&";
    relayUrl += "fromBook=32&";
    relayUrl += "fromQuick=1&";
    __thisWindow__.openInSystemBrowser(relayUrl);
}

function removeRecordedCall(recordedCallID) {
    __thisWindowProxy__.deleteRecordedCall(recordedCallID);
}

var endpointStatuses = {
        sip:{
            status:Event.endpointNotificationType.UNKNOWN,
            reason:undefined
        },
        h323:{
            status:Event.endpointNotificationType.UNKNOWN,
            reason:undefined
        },
        rtsp:{
            status:Event.endpointNotificationType.UNKNOWN,
            reason:undefined
        }
};

//WKRASKO 031413 - Support auto dialing for test
var autocallnumber = ""; var autocallduration = 10000; var autocallgap = 10000; var autocallInterval = null;
function processCommandLine(commandLine) {
    try {
        var bringToFront = true; // if no action was executed than bring to front
        // parsing executable and its parametes
        var exeOption = commandLine[0];
        var len = 0;
        if(isDefined(exeOption))
            len = exeOption.length;
        for (var i = 1; i < len; i++) { // parsing executable option parameters
            var param = exeOption[i];
            param = cleanCommandLineParameter(param);
            
            switch (param) {
                case "!!!q": // quit
                    window.close();
                    bringToFront = false;
                    break;
                case "!!!m": // minimize
                    minimizeAllOpenWindows();
                    bringToFront = false;
                    break;
                default: // make call
                    param = cleanCallToParameter(param);
                    if (currentUiStatus === UiStatus.initializing) {
                    	__log__.debug("Enqueing call["+param+"] requested via command line");
                        enqueuedCall.push(param);
                        if (!isDefined(enqueuedCallsTimer)) {
                        	enqueuedCallsTimer = setInterval("dequeCallsIfPossible()", 1000);
                        }
                    } else {
                        var dialString = getAddressPart(param);
                        var displayName = getDisplayName(param);
                        __log__.debug("Creating call["+param+"] to ["+dialString+","+displayName+"] requested via command line");
                        initCallFromDialString(dialString, displayName);
                    }
                    break;
            }
        }
        
        // parsing command line switches
        len = commandLine.length;
        for (var i = 1; i < len; i++) {
            var switchObj = commandLine[i];
            for (var switchName in switchObj) {
                var switchParams = switchObj[switchName]; // this is the switch parameters array
                switch (switchName) {
                    case "minimized":
                        minimizeAllOpenWindows();
                        bringToFront = false;
                        break;
                    case "drop":
                        dropAllActiveCalls();
                        break;
                    case "test":
                        alert("blah");
                        break;
                    case "env":
                        //WKRASKO 101912 - PNG-555, set vrs10D for env.
                        if(switchParams[0]=="newstaging"){
                            console.log("Switching env to "+switchParams[0]);
                            JAMBO_APP.WebServices.setConnection('https://websvcnew.staging.purple.us');
                            JamboSocket.serverURL='ws://lb.ares.staging.purple.us:14002/ares';
                            //NO longer used, but leaving for a while in case//JAMBO_APP.PurpleMail.serverURL='http://vmailer.test.hovrs.com/cgi-bin/viewpnmail.php';
                            $('#loginServer').val( 'P3.sip.staging.purple.us' );
                            JAMBO_APP.PurpleMail.setSelfRecordURL('selfrecord@hosvrs.com');
                            JAMBO_APP.ipRelayURL = "http://www.staging.i711.com/callPageP3TNG.php";
                            vrs10D = "8552744631";
                            vri10D = "8552746641";
                        }
                        if(switchParams[0]=="dev" || switchParams[0]=="staging" || switchParams[0]=="test" || switchParams[0]=="training"){
                            console.log("Switching env to "+switchParams[0]);
                            JAMBO_APP.WebServices.setConnection('https://websvc.'+switchParams[0]+'.purple.us');
                            //DEVTESTJAMBO_APP.WebServices.setConnection('https://websvc.dev.purple.us');
                            JamboSocket.serverURL='ws://lb.ares.'+switchParams[0]+'.purple.us:14002/ares';
                            //NO longer used, but leaving for a while in case//JAMBO_APP.PurpleMail.serverURL='http://vmailer.test.hovrs.com/cgi-bin/viewpnmail.php';
                            $('#loginServer').val( 'P3.sip.'+switchParams[0]+'.purple.us' );
                            JAMBO_APP.AppProperties.sipStr = "sip-lb."+switchParams[0]+".purple.us";//WKRASKO 112912 - PNG-186, fixing this proper
                            if(switchParams[0]=="test"){
                                JAMBO_APP.PurpleMail.setSelfRecordURL('selfrecord@hosvrs.com');
                                JamboSocket.serverURL='ws://lb.ares.dev.purple.us:14002/ares';
                                JAMBO_APP.ipRelayURL = "http://test.i711.com/callPageP3TNG.php";
                                vrs10D = "8552744620";
                                vri10D = "";
                            } else if (switchParams[0]=="staging"){
                                JAMBO_APP.PurpleMail.setSelfRecordURL('selfrecord@hosvrs.com');
                                JAMBO_APP.ipRelayURL = "http://www.staging.i711.com/callPageP3TNG.php";
                                vrs10D = "8552744631";
                                vri10D = "8552746641";
                            } else if (switchParams[0]=="dev"){
                                JAMBO_APP.PurpleMail.setSelfRecordURL('selfrecord@hosvrs.com');
                                JAMBO_APP.ipRelayURL = "http://dev.i711.com/callPageP3TNG.php";
                                vrs10D = "8552744620";
                                vri10D = "";
                            } else if (switchParams[0]=="training"){
                                JAMBO_APP.WebServices.setConnection('http://websvc.'+switchParams[0]+'.purple.us');//PNG-809 KTRUMBLE - changing to http vs https, no certificate in training
                                JAMBO_APP.PurpleMail.setSelfRecordURL('selfrecord@hosvrs.com');
                                JAMBO_APP.ipRelayURL = "http://www.staging.i711.com/callPageP3TNG.php";
                                vrs10D = "9168778543";
                                vri10D = "9168779321";
                            }
                        }
                        break;
                    case "relayType":
                        if(switchParams[0]=="VRS")
                            clickToCall = true;
                            break;
                    case "destination":
                        clickToCall10D = switchParams[0];
                        break;
                    //WKRASKO 031413 - Support auto dialing for test
                    case "autocallnum":
                        autocallnumber = switchParams[0];
                        break;
                    case "duration":
                        autocallduration = parseInt(switchParams[0])*1000;
                        break;
                    case "interval":
                        autocallgap = parseInt(switchParams[0])*1000;
                        break;
                    default: // unsupported switch
                        break;
                }
            }
        }
        //WKRASKO 110612 - PNG-455, click to call support
        if(logoutAvailable && clickToCall && clickToCall10D!=""){
            //User already logged in (app running), do click-to-call here if set. Otherwise, check on login
            clickToCall = false;
            var ctcDisplayName = clickToCall10D;
            var tempLookupName = JAMBO_APP.ContactList.contactNamesByNumber(ctcDisplayName);
            if( tempLookupName!=null && tempLookupName.length>0 )
                ctcDisplayName = tempLookupName[0]+' '+tempLookupName[1];
            var validDialString=validateDialString(clickToCall10D);
            if(validDialString.status) {
                initCallFromDialString(validDialString.dialString,ctcDisplayName, validDialString.type);
            }
            clickToCall10D = "";
        }
        
        if (bringToFront) { __thisWindow__.bringToFront(); }
    } catch (e) {
        __log__.error("Exception when processing command line: "+e.name+", "+e.message+", "+e.sourceURL+":"+e.line);
    }
}

function processProvisioningError(error) {
    __thisWindow__.beep();
    __log__.info("Provisioning error ["+error+"] forced quit received: closing all windows but this one.");
    var title = _i18n_.getHTML("TITLE_ERROR");
    var message = _i18n_.getHTML("MSG_ERR_GENERIC");
    switch (error) {
	    case Event.provisioningErrorError.unlicensedPlatform : 
	    	title = _i18n_.getHTML("TITLE_ERR_MCS_UNLICENSED_PLATFORM");
	    	message = _i18n_.getHTML("MSG_ERR_MCS_UNLICENSED_PLATFORM");
	    	break;
	       case Event.provisioningErrorError.missingServerSDKLicense : 
	            title = _i18n_.getHTML("TITLE_ERR_MCS_UNLICENSED_SDK");
	            message = _i18n_.getHTML("MSG_ERR_MCS_UNLICENSED_SDK");
	            break;
	    case Event.provisioningErrorError.serverConnectionFailure:
	    	title = _i18n_.getHTML("TITLE_ERR_MCS_CONNECTION_ERROR");
	    	message = _i18n_.getHTML("MSG_ERR_MCS_PROV_CONNECTING_TO_SERVER");
	    	break;
	    default:
	    	message = _i18n_.getHTML("MSG_ERR_MCS_PROV_"+error);
	    	break;
    }
    openMessagePopup("#errorPop", title, message, _i18n_.getHTML("COMMON_OK"), false, function(){
        __log__.info("Provisioning error ["+error+"] forced quit accepted by the user: exiting.");
        realCloseIssued = true;
        window.close();
        windowsRepository.closeAll();//WKRASKO 082012 - PNG-320, hopefully
    });
}

function processSystemError(error) {
    __thisWindow__.beep();
    __log__.info("System error ["+error+"] forced quit received: closing all windows but this one.");
    var title = _i18n_.getHTML("TITLE_ERROR");
    var message = _i18n_.getHTML("MSG_ERR_GENERIC");
    switch (error) {
        case Event.systemErrorError.unreachableDNS      : message = _i18n_.getHTML("MSG_ERR_MCS_PROV_DNS_UNREACHABLE"); break;
        case Event.systemErrorError.networkFailure      : message = _i18n_.getHTML("MSG_ERR_MCS_PROV_NETWORK_NOT_AVAILABLE"); break;
        case Event.systemErrorError.unsupportedDirectX  : message = _i18n_.getHTML("MSG_ERR_DIRECX_NOT_FOUND"); break;
        case Event.systemErrorError.unsupportedCPU      : message = _i18n_.getHTML("MSG_ERR_UNSUPPORTED_CPU"); break;
        case Event.systemErrorError.unlicensedDevice    : message = _i18n_.getHTML("MSG_ERR_UNLICENSED_DEVICE"); break;
        case Event.systemErrorError.unsupportedOS       : message = _i18n_.getHTML("MSG_ERR_UNSUPPORTED_OS"); break;
        case Event.systemErrorError.generic             : message = _i18n_.getHTML("MSG_ERR_GENERIC"); break;
        default: message += "<br />("+error+")"; break;
    }
    openMessagePopup("#errorPop", title, message, _i18n_.getHTML("COMMON_OK"), false, function(){
        __log__.info("System error ["+error+"] forced quit accepted by the user: exiting.");
        realCloseIssued = true;
        window.close();
        windowsRepository.closeAll();//WKRASKO 082012 - PNG-320, hopefully
    });
}

function processSystemWarning(warning) {
    __thisWindow__.beep();
    __log__.info("System warning ["+warning+"] received.");
    var title = _i18n_.getHTML("TITLE_WARNING");
    var message = _i18n_.getHTML("MSG_WARN_GENERIC");
    switch (warning) {
        case Event.systemWarningWarning.unsupportedDevice   : message = _i18n_.getHTML("MSG_WARN_UNSUPPORTED_DEVICE"); break;
        case Event.systemWarningWarning.audioCaptureFailure : message = _i18n_.getHTML("MSG_WARN_AUDIO_CAPTURE_FAILURE"); break;
        case Event.systemWarningWarning.audioPlaybackFailure: message = _i18n_.getHTML("MSG_WARN_AUDIO_PLAYBACK_FAILURE"); break;
        case Event.systemWarningWarning.videoCaptureFailure : message = _i18n_.getHTML("MSG_WARN_VIDEO_CAPTURE_FAILURE"); break;
        case Event.systemWarningWarning.lastStartupFailure  : message = _i18n_.getHTML("MSG_WARN_LAST_STARTUP_FAILED"); break;
        default: message += "<br />("+warning+")"; break;
    }
    openMessagePopup("#errorPop", title, message);
}

function minimizeAllOpenWindows() {
    windowsRepository.minimizeAll();
    __thisWindow__.showMinimized();
}

function dropAllActiveCalls() {
    lineRepository.forEachLine(function(line){ line.dropCall(); });
}

function setDocumentTitle() {     
    if (isDefined(clientType) && isDefined(coreSettings) && isDefined(appInfo) && isDefined(appInfo.name)) {  
        switch (clientType) {
            //WKRASKO 111512 - PNG-458, changing doc title's below
            case ClientType.MCS:              
            case ClientType.ClearSea: 
                var displayName = coreSettings.sip_displayName;
                if (!isDefined(displayName) || (displayName.trim()==="")) { displayName = coreSettings.sip_alias; } 
                document.title = _i18n_.get("GUI_PRIMARY_TITLE", {"productName":"P3"})+" - "+displayName; break;
            default: 
                document.title = _i18n_.get("GUI_PRIMARY_TITLE", {"productName":"P3"}); break;
        }
    } else {
        document.title = "Loading...";
    }
}

function translate() {
    _i18n_.translate();
    setDocumentTitle();
    $(window).resize();
    //WKRASKO 103112 - PNG-520, placeholders for login form went missing
    $('#loginUsername').attr('placeholder',_i18n_.get('GUI_MCSLOGIN_USERNAME_LABEL'));
    $('#loginPassword').attr('placeholder',_i18n_.get('GUI_MCSLOGIN_PASSWORD_LABEL'));
    //WKRASKO 110212 - PNG-659
    setSettingsToggles();
    setServerSideSettingsToggles();
}

var i18nCallStatus = {
        "DIALING"                                   	: "GUI_PRIMARY_ACTIVECALL_STATUS_DIALING",
        "DIALTONE"                                  	: "GUI_PRIMARY_ACTIVECALL_STATUS_DIALTONE", 
        "INCOMING"                                  	: "GUI_PRIMARY_ACTIVECALL_STATUS_INCOMING",
        "REMOTE_RINGING"                            	: "GUI_PRIMARY_ACTIVECALL_STATUS_REMOTE_RINGING",
        "EARLYMEDIA"                                	: "GUI_PRIMARY_ACTIVECALL_STATUS_EARLYMEDIA",
        "CONNECTED"                                 	: "GUI_PRIMARY_ACTIVECALL_STATUS_CONNECTED",
        "DISCONNECTED"                              	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED",
        "TERMINATED"                                	: "GUI_PRIMARY_ACTIVECALL_STATUS_TERMINATED",
        "DISCONNECTED_BUSY"                         	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_BUSY",
        "DISCONNECTED_NORMAL"                       	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_NORMAL",
        "DISCONNECTED_REJECT"                       	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_REJECT",
        "DISCONNECTED_UNREACHABLE"                  	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_UNREACHABLE",
        "DISCONNECTED_UNKNOWN"                      	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_UNKNOWN",
        "DISCONNECTED_LOCAL"                        	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_LOCAL",
        "DISCONNECTED_INCOMPLETEADDRESS"            	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_INCOMPLETEADDRESS",
        "DISCONNECTED_UNANSWERED"                   	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_UNANSWERED",
        "DISCONNECTED_UNAUTHORIZED"                 	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_UNAUTHORIZED",
        "DISCONNECTED_MEDIA_ENCRYPTION_REQUIRED"    	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_MEDIA_ENCRYPTION_REQUIRED", 
        "DISCONNECTED_MEDIA_ENCRYPTION_REQUIRED_REMOTE" : "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_MEDIA_ENCRYPTION_REQUIRED",
        "DISCONNECTED_UNSUPPORTED_MEDIA"            	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_UNSUPPORTED_MEDIA",  
        "TRANSFERRING_NOTRANSFER"                   	: "GUI_PRIMARY_ACTIVECALL_STATUS_TRANSFERRING_NOTRANSFER",
        "REDIRECTING"                               	: "GUI_PRIMARY_ACTIVECALL_STATUS_REDIRECTING",
        "TRANSFERRING_PROCEEDING"                   	: "GUI_PRIMARY_ACTIVECALL_STATUS_TRANSFERRING_PROCEEDING",
        "TRANSFERRING_RINGBACK"                     	: "GUI_PRIMARY_ACTIVECALL_STATUS_TRANSFERRING_RINGBACK",
        "TRANSFERRING_CONNECTED"                    	: "GUI_PRIMARY_ACTIVECALL_STATUS_TRANSFERRING_CONNECTED",
        "TRANSFERRING_FAILED"                       	: "GUI_PRIMARY_ACTIVECALL_STATUS_TRANSFERRING_FAILED",
        "TERMINATED_WAS_NOT_REGISTERED_TO_MCS"      	: "GUI_PRIMARY_ACTIVECALL_STATUS_TERMINATED_WAS_NOT_REGISTERED_TO_MCS",
        "DISCONNECTED_UNREACHABLE_MEDIA_ENCRYPTION" 	: "GUI_PRIMARY_ACTIVECALL_STATUS_DISCONNECTED_UNREACHABLE_MEDIA_ENCRYPTION"
};

var encryptionSuites = {
        AES_CM_128_HMAC_SHA1_80     : "AES 128 SHA1",
        AES_CM_128_HMAC_SHA1_32     : "AES 128 SHA1 32",
        F8_128_HMAC_SHA1_80         : "F8 128 SHA1",
        SEED_CTR_128_HMAC_SHA1_80   : "SEED 128 SHA1",
        SEED_128_CCM_80             : "SEED 128 CCM",
        SEED_128_GCM_96             : "SEED  128 GCM",
        AES_192_CM_HMAC_SHA1_80     : "AES 192 SHA1 80",
        AES_192_CM_HMAC_SHA1_32     : "AES 192 SHA1 32",
        AES_256_CM_HMAC_SHA1_80     : "AES 256 SHA1 80",
        AES_256_CM_HMAC_SHA1_32     : "AES 256 SHA1 32",
        AES_CBC_128                 : "AES CBC 128",
        AES_CBC_192                 : "AES CBC 192",
        AES_CBC_256                 : "AES CBC 256"    
};

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
var isP2P = false; var psReShow = false;
setupMainViewBindings = function () {
    //WKRASKO 103112 - PNG-520, placeholders for login form went missing
    $('#loginUsername').attr('placeholder', _i18n_.get('GUI_MCSLOGIN_USERNAME_LABEL'));
    $('#loginPassword').attr('placeholder', _i18n_.get('GUI_MCSLOGIN_PASSWORD_LABEL'));
    $('#activeCallRowContent').click(function () {
        $('#NewCallBtn').click();
    });
    $('.lNavBtn').click(function () {
        nav = $(this).attr('id').split('Btn')[0];
        if (nav != currentView) saveDivScrollPositions(nav); //PNG-935 KTRUMBLE 04162013 - fix div scroll position function; was setting the position to 0 every time
        if (!$('#chatSettings_menu').hasClass('dn')) $('#chatMenu').click();
        $('.box').hide();
        $('#leftNav .vAligner hr').removeClass('lNavSelectedHR');
        if (nav == 'Contacts' || nav == 'History' || nav == 'PurpleMail' || nav == 'Settings') {
            $('#outboundNumEntry').val('');//PNG-983 KTRUMBLE 05232013 - clear dial field on changing tabs
            if ($('#mainContent').hasClass('dn')) $('#mainContent').removeClass('dn');
            if (!$('#mainContentCall').hasClass('dn')) $('#mainContentCall').addClass('dn');
            if (!$('#videoPrivacySlide').hasClass('dn')) { $('#videoPrivacySlide').addClass('dn'); psReShow = true; }
            if (nav == "Contacts" && contactsNeedSync)
                syncContacts();
            if (nav == "History" && historyNeedSync)
                syncHistory();
            if (nav == "PurpleMail" && purpleMailNeedsSync && !$(this).hasClass('lNavActive'))
                syncPurpleMail();
            if (nav == "Settings" && settingsNeedSync)//PNG-1029 KTRUMBLE 04182013 - auto sync settings with server on a timer
                syncSettings();
            if (nav == "Settings") {
                vc_has_moved = true;
                hideEmbeddedVideoComposer();
                $('#MyVideoConferenceWidget').appendTo('#video_location');
                setTimeout(function () { $('#MyVideoConferenceWidget').css({ 'top': 0, 'left': 0, 'width': '280px', 'height': '165px' }) }, 125);
                setTimeout(function () { showEmbeddedVideoComposer(); }, 250);
            }
        } else if (nav == "NewCall") {
            if (vc_has_moved) {
                vc_has_moved = false;
                hideEmbeddedVideoComposer();
                $('#MyVideoConferenceWidget').appendTo('#mainContentCall');
                setTimeout(function () { $('#MyVideoConferenceWidget').css({ 'top': '82px', 'left': '185px' }) }, 125);
                setTimeout(function () { showEmbeddedVideoComposer(); }, 250);
            }
            if ($('#mainContentCall').hasClass('dn')) $('#mainContentCall').removeClass('dn');
            if (psReShow && $('#videoPrivacySlide').hasClass('dn')) { $('#videoPrivacySlide').removeClass('dn'); psReShow = false; }
            if (!$('#mainContent').hasClass('dn')) $('#mainContent').addClass('dn');
        }
        $('.lNavBtn').removeClass('lNavActive');
        $('#main' + nav).show();
        $('#' + nav + 'Btn').addClass('lNavActive');
        $('#' + nav + 'Btn').prev('hr').addClass('lNavSelectedHR');
        $('#' + nav + 'Btn').next('hr').addClass('lNavSelectedHR');
        //Total hack for now. I can't figure out why the heck the math for settings width is wrong on startup, works fine on resize
        $(window).resize();
        if (nav == 'History')//WKASKO 102312 - PNG-612, reset count on History focus.
            $('#missedCallsCount').text('0').css({ 'background-color': '#868686' });
        if (nav == 'Contacts' || nav == 'History' || nav == 'PurpleMail') setDivScrollPositions(nav); //PNG-935 KTRUMBLE 04162013 - fix div scroll position function; was setting the position to 0 every time
    });
    $('.lNavBtn').hover(function () { $(this).prev('hr').addClass('lNavSelectedHR'); }, function () { if (!$(this).hasClass('lNavActive')) $(this).prev('hr').removeClass('lNavSelectedHR'); });
    $('#favSortSelect').change(function () {
        switch ($(this).val()) {
            case "FirstName":
                JAMBO_APP.ContactList.favSortBy = "FirstName";
                JAMBO_APP.ContactList.sortFavoritesByFirst();
                break;
            case "LastName":
                JAMBO_APP.ContactList.favSortBy = "LastName";
                JAMBO_APP.ContactList.sortFavoritesByLast();
                break;
            default: break;
        }
        //WKRASKO 051713 - Sigh....
        //drawFavs();
    });
    $('#pmSortSelect').change(function () {
        switch ($(this).val()) {
            case "FirstName":
                JAMBO_APP.PurpleMail.pmSortBy = "FirstName";
                JAMBO_APP.PurpleMail.sortPMByFirst();
                break;
            case "LastName":
                JAMBO_APP.PurpleMail.pmSortBy = "LastName";
                JAMBO_APP.PurpleMail.sortPMByLast();
                break;
            default: break;
        }
        drawPurpleMail(JAMBO_APP.PurpleMail.getPMMessages());
    });
    $('#addNumberIcon').click(function () {
        //WKASKO - Please devs, if you're going to "fix" things, test everything around it that could break!
        //Adding this default id broke the ability to add new number, serious bug....
        //A bit frustrating. If there's an existing value, it's probably there for a reason.
        var default_block_id = $('.createEditContactNumber').length; //PNG-972 KTRUMBLE 04172013 - add ability to block numbers when creating new contacts
        if ($('.phone_input').length >= MAX_NUMBERS_PER_CONTACT)//WKRASKO 102412 - PNG-427, new number limit for contacts.
            return;
        $.tmpl(JAMBO_APP.ContactList.createEditContactNumberRow, { number_label: _i18n_.get("GUI_CONTACT_NUMBER"), number_value: "", type_label: _i18n_.get("GUI_CONTACT_NUMBER_TYPE"), id: "", blockID: default_block_id }).appendTo('#createEditContactNumbers');
        //$('.phone_input').mask('9999999999');
        repositionPopUpEnvironment('#createEditContactPop');
        bindBlocker(); //PNG-972 KTRUMBLE 04172013 - add ability to block numbers when creating new contacts
        //WKRASKO 052013 - PNG-1041
        if ($('tr.createEditContactNumber:visible').length > 1)
            $('tr.createEditContactNumber:visible').first().find('.minusSign').show();
    });
    $('#outboundNumEntry').focus(function () { $(this).select(); });
    $('#outboundNumEntry').keyup(function (event) {
        if (applicationSettings.mode == "kiosk") { //if value in textbox, hide "number" from background
            if ($('#outboundNumEntry').val() == '') {
                if (!$('#outboundNumEntry').hasClass('blur')) $('#outboundNumEntry').addClass('blur');
            } else {
                if ($('#outboundNumEntry').hasClass('blur')) $('#outboundNumEntry').removeClass('blur');
            }
        } else { }
    });
    $('#outboundNumEntry').keydown(function (event) {
        if (applicationSettings.mode == "kiosk") { //if value in textbox, hide "number" from background
            if (event.which == 32 || (event.which > 95 && event.which < 106) || (event.which > 47 && event.which < 128)) { //ASCII printable characters
                if ($('#outboundNumEntry').hasClass('blur')) $('#outboundNumEntry').removeClass('blur');
            }
        } else { }

        if (event.which == 13) {
            if (applicationSettings.mode == "kiosk") { //Check to see if 911 during Kiosk mode
                if ($('#outboundNumEntry').val().trim() == '911') {
                    kiosk_e911();
                    return false;
                }
            } else { }

            event.preventDefault();
            if ($('ul.ui-autocomplete').is(':visible')) $('#outboundNumEntry').blur(); //PNG-1040 KTRUMBLE 04152013 - triggering field blur to close autocomplete
            var lineAvailable = isDefined(lineRepository.getAvailableLine());
            JamboSocket.outbound10D = $('#outboundNumEntry').val().trim(); //PNG-342 KTRUMBLE 08232012 - collecting the dialstring for passing to the socket
            if (lineAvailable && ($('#outboundNumEntry').val() == _i18n_.get('GUI_NUMBERINPUT_TEXT') || $('#outboundNumEntry').val() == '')) {
                if (JamboSocket.isVRS) {//WKRASKO 041513 - PNG-1099
                    $('#invalidEntryMessage').html(_i18n_.get("MSG_ERR_TWO_VRS"));
                    $('#outboundNumEntry').effect("highlight", { color: "#fcdc00" }, 3000); ;
                    $('#invalidEntryMessage').show().delay(3000).fadeOut(500, function () { $('#invalidEntryMessage').html(''); });
                } else {
                    $('div#signOffTab').hide();
                    initCallFromDialString(vrs10D, 'VRS', '10d'); //WKRASKO 082112 - PNG-333, do need to call VRS on blank, it's what P3 old does
                }
            } else {
                var tempDisplayName = $(this).val();
                var tempLookupName = JAMBO_APP.ContactList.contactNamesByNumber(tempDisplayName);
                if (tempLookupName != null && tempLookupName.length > 0)
                    tempDisplayName = tempLookupName[0] + ' ' + tempLookupName[1];
                else {//WKRASKO 101712 - PNG-582, try stripped version
                    tempLookupName = JAMBO_APP.ContactList.contactNamesByNumber(tempDisplayName.replace(/\D/g, ''));
                    if (tempLookupName != null)
                        tempDisplayName = tempLookupName[0] + ' ' + tempLookupName[1];
                }

                var validDialString = validateDialString($(this).val());
                JAMBO_APP.WebServices.doITRSLookup(validDialString.dialString, tempDisplayName, function (result) {//this call was much more verbose and complex than necessary
                    if (result.ResultCode == "OK") { isP2P = true; } else { isP2P = false; } //need another flag set so that, if a terp VRS call is placed first, P2P calls can still proceed
                    var currentlyConnected = false; //PNG-992 KTRUMBLE 04302013 - should not be able to dial the same 10D if already connected
                    for (var i = 0; i < availableLines; i++) {
                        var tempLine = lineRepository.getLine(i);
                        if (isDefined(tempLine.call.remote.dialString)) {
                            if (tempLine.call.remote.dialString == validDialString.dialString) currentlyConnected = true;
                        }
                    }
                    if (lineAvailable && validDialString.status && (!JamboSocket.isVRS || (JamboSocket.isVRS && isP2P == true)) && !currentlyConnected) {
                        $('div#signOffTab').hide();
                        initCallFromDialString(validDialString.dialString, tempDisplayName, validDialString.type);
                    } else {
                        if (currentlyConnected) validDialString.error = _i18n_.get("MSG_ERR_ALREADY_CONNECTED");
                        if (JamboSocket.isVRS) $('#invalidEntryMessage').html(_i18n_.get("MSG_ERR_TWO_VRS"));
                        if (isDefined(validDialString.error)) $('#invalidEntryMessage').html(validDialString.error); //PNG-1019 KTRUMBLE 04152013 - if dialstring is invalid display bad dialstring error instead of already on vrs call message
                        if (!lineAvailable) $('#invalidEntryMessage').html(_i18n_.get("MSG_WARN_TWO_CALLS"));
                        $('#outboundNumEntry').effect("highlight", { color: "#fcdc00" }, 3000); ;
                        $('#invalidEntryMessage').show().delay(3000).fadeOut(500, function () { $('#invalidEntryMessage').html(''); });
                    }
                });
            }
        } else if (event.which >= 48 && event.which <= 57 && onCall) {//48-57 = 0-9 keys, 51=3(#), 56=8(*)
            //WKRASKO 051713 - PNG-1146
            playDTMF(String.fromCharCode(event.which));
        }
    });
    $('#outboundCallBtn').click(function () {
        if (applicationSettings.mode == "kiosk") { //Check to see if 911 during Kiosk mode
            if ($('#outboundNumEntry').val().trim() == '911') {
                kiosk_e911();
                return false;
            }
        } else { }

        if (IPRelayToggle == 'VRS') {
            var lineAvailable = isDefined(lineRepository.getAvailableLine());
            JamboSocket.outbound10D = $('#outboundNumEntry').val().trim(); //PNG-342 KTRUMBLE 08232012 - collecting the dialstring for passing to the socket
            if (getPlatform() == "VRI" && lineAvailable) {
                $('div#signOffTab').hide();
                initCallFromDialString(vri10D + "@hosvrs.com", 'VRI', '10d');
            } else if (lineAvailable && ($('#outboundNumEntry').val() == _i18n_.get('GUI_NUMBERINPUT_TEXT') || $('#outboundNumEntry').val() == '')) {
                if (JamboSocket.isVRS) {//WKRASKO 041513 - PNG-1099
                    $('#invalidEntryMessage').html(_i18n_.get("MSG_ERR_TWO_VRS"));
                    $('#outboundNumEntry').effect("highlight", { color: "#fcdc00" }, 3000); ;
                    $('#invalidEntryMessage').show().delay(3000).fadeOut(500, function () { $('#invalidEntryMessage').html(''); });
                } else {
                    $('div#signOffTab').hide();
                    initCallFromDialString(vrs10D, 'VRS', '10d'); //WKRASKO 082112 - PNG-333, do need to call VRS on blank, it's what P3 old does
                }
            } else {
                var tempDisplayName = $('#outboundNumEntry').val();
                var tempLookupName = JAMBO_APP.ContactList.contactNamesByNumber(tempDisplayName);
                if (tempLookupName != null && tempLookupName.length > 0)
                    tempDisplayName = tempLookupName[0] + ' ' + tempLookupName[1];
                else {//WKRASKO 101712 - PNG-582, try stripped version
                    tempLookupName = JAMBO_APP.ContactList.contactNamesByNumber(tempDisplayName.replace(/\D/g, ''));
                    if (tempLookupName != null)
                        tempDisplayName = tempLookupName[0] + ' ' + tempLookupName[1];
                }

                var validDialString = validateDialString($('#outboundNumEntry').val());
                JAMBO_APP.WebServices.doITRSLookup(validDialString.dialString, tempDisplayName, function (result) {//this call was much more verbose and complex than necessary
                    if (result.ResultCode == "OK") { isP2P = true; } else { isP2P = false; } //need another flag set so that, if a terp VRS call is placed first, P2P calls can still proceed
                    var currentlyConnected = false; //PNG-992 KTRUMBLE 04302013 - should not be able to dial the same 10D if already connected
                    for (var i = 0; i < availableLines; i++) {
                        var tempLine = lineRepository.getLine(i);
                        if (isDefined(tempLine.call.remote.dialString)) {
                            if (tempLine.call.remote.dialString == validDialString.dialString) currentlyConnected = true;
                        }
                    }
                    if (lineAvailable && validDialString.status && (!JamboSocket.isVRS || (JamboSocket.isVRS && isP2P == true)) && !currentlyConnected) {
                        $('div#signOffTab').hide();
                        initCallFromDialString(validDialString.dialString, tempDisplayName, validDialString.type);
                    } else {
                        if (currentlyConnected) validDialString.error = _i18n_.get("MSG_ERR_ALREADY_CONNECTED");
                        if (JamboSocket.isVRS) $('#invalidEntryMessage').html(_i18n_.get("MSG_ERR_TWO_VRS"));
                        if (isDefined(validDialString.error)) $('#invalidEntryMessage').html(validDialString.error); //PNG-1019 KTRUMBLE 04152013 - if dialstring is invalid display bad dialstring error instead of already on vrs call message
                        if (!lineAvailable) $('#invalidEntryMessage').html(_i18n_.get("MSG_WARN_TWO_CALLS"));
                        $('#outboundNumEntry').effect("highlight", { color: "#fcdc00" }, 3000); ;
                        $('#invalidEntryMessage').show().delay(3000).fadeOut(500, function () { $('#invalidEntryMessage').html(''); });
                    }
                });
            }
        } else {//is IPRelay
            if ($('#outboundNumEntry').val() == _i18n_.get('GUI_NUMBERINPUT_TEXT')) {
                $('#invalidEntryMessage').html(_i18n_.get('NUMBER_VALIDATION_NOTVALID'));
                $('#outboundNumEntry').effect("highlight", { color: "#fcdc00" }, 3000); ;
                $('#invalidEntryMessage').show().delay(3000).fadeOut(500, function () { $('#invalidEntryMessage').html(''); });
            } else {
                var tempDisplayName = $('#outboundNumEntry').val();
                var tempLookupName = JAMBO_APP.ContactList.contactNamesByNumber(tempDisplayName);

                var validDialString = validateDialString($('#outboundNumEntry').val());

                if (validDialString.status) {
                    openIPRelayWindow(validDialString.dialString);
                } else {
                    $('#invalidEntryMessage').html(validDialString.error);
                    $('#outboundNumEntry').effect("highlight", { color: "#fcdc00" }, 3000); ;
                    $('#invalidEntryMessage').show().delay(3000).fadeOut(500, function () { $('#invalidEntryMessage').html(''); });
                }
            }
        }
    });
    $('#callIPRelay').click(function () {
        $('#callContactMenu').hide();
        $('#outboundCallMenuBtn').removeClass('callMenuBtnSelected');
        if ($('#dialPad').is(":visible")) {
            $('#dialPad').hide();
            $('#dialpadWrapper').removeClass('dialpadWrapperOn');
            $('#dialpadWrapper').addClass('dialpadWrapperOff');
            if (applicationSettings.mode == "kiosk") {
            } else {
                $("#outboundNumEntry").autocomplete("enable")
            }
        }
        if ($('#outboundNumEntry').val() == _i18n_.get('GUI_NUMBERINPUT_TEXT')) {
            //populate error message box with message
            $('#invalidEntryMessage').html(_i18n_.get('NUMBER_VALIDATION_NOTVALID'));
            //change style of input field to error
            $('#outboundNumEntry').effect("highlight", { color: "#fcdc00" }, 3000); ;
            $('#invalidEntryMessage').show().delay(3000).fadeOut(500, function () { $('#invalidEntryMessage').html(''); });
        } else {
            var tempDisplayName = $('#outboundNumEntry').val();
            var tempLookupName = JAMBO_APP.ContactList.contactNamesByNumber(tempDisplayName);

            var validDialString = validateDialString($('#outboundNumEntry').val());

            if (validDialString.status) {
                openIPRelayWindow(validDialString.dialString);
            } else {
                //populate error message box with message
                $('#invalidEntryMessage').html(validDialString.error);
                //change style of input field to error
                $('#outboundNumEntry').effect("highlight", { color: "#fcdc00" }, 3000); ;
                $('#invalidEntryMessage').show().delay(3000).fadeOut(500, function () { $('#invalidEntryMessage').html(''); });
            }
        }
    });
    /*MAYBE_UNNEEDED
    $('#helpBuckets .bucketBlock').click(function(){
    $('#helpList .innerbox').hide();
    $('#helpBuckets .bucketBlock').removeClass('helpBucketSelected');
    $(this).addClass('helpBucketSelected');
    $('#help_'+$(this).attr('id')).show();
    });*/

    $('#startupMask #signin #loginSavePassword').click(function () {
        if ($('#startupMask #signin #loginSavePassword').attr('checked') == false && $('#startupMask #signin #loginAutomatic').attr('checked') == true) {
            $('#startupMask #signin #loginAutomatic').attr('checked', false);
        }
    });
    loadBadUserForm = function () {
        var userNameForm = "<div id='retrievePasswordForm'>" + _i18n_.getHTML("MSG_ERR_LOGIN_FORGOTPASS_NOUSER") + "<br>";
        userNameForm += "<input type='text' name='retrievepass_user' id='retrievepass_user'/>";
        userNameForm += "</div>";
        openInputPop(_i18n_.get("GUI_MCSLOGIN_FORGOT_PASSWORD"), userNameForm, 0.7, function () {
            closeInputPop();
            openLoadingAnim(); //WKRASKO 102412 - PNG-499
            JAMBO_APP.WebServices.resetPassword($('#retrievepass_user').val(), function (result) {
                closeLoadingAnim(); //WKRASKO 102412 - PNG-499
                if (result.ResultCode != 'Error') {
                    openMessagePopup('#errorPop', _i18n_.get("GUI_MCSLOGIN_FORGOT_PASSWORD"), _i18n_.get("GUI_SUCCESSFUL_EMAILED_PASSWORD"), _i18n_.getHTML("COMMON_OK"));
                } else {
                    loadBadUserForm();
                }
            });
        });
    }
    $('#forgotPassword_btnBox').click(function () {
        if ($('#loginUsername').val() == "") {
            loadBadUserForm();
        } else {
            openLoadingAnim(); //WKRASKO 102412 - PNG-499
            JAMBO_APP.WebServices.resetPassword($('#loginUsername').val(), function (result) {
                closeLoadingAnim(); //WKRASKO 102412 - PNG-499
                if (result.ResultCode != 'Error') {
                    openMessagePopup('#errorPop', _i18n_.get("GUI_MCSLOGIN_FORGOT_PASSWORD"), _i18n_.get("GUI_SUCCESSFUL_EMAILED_PASSWORD"), _i18n_.getHTML("COMMON_OK"));
                } else {
                    loadBadUserForm();
                }
            });
        }
    });
    $('#removeAccount_btnBox').click(function () {
        if (!isDefined(applicationSettings) || !isDefined(applicationSettings.logins) || !isDefined(applicationSettings.logins[$('#loginUsername').val()]))
            openMessagePopup('#errorPop', _i18n_.get("GUI_CFG_GENERAL_REMOVE_ACCOUNT"), _i18n_.get("GUI_CFG_GENERAL_REMOVE_ACCOUNT_NOT_FOUND_ERROR"), _i18n_.getHTML("COMMON_OK"));
        else {
            openMessagePopup('#messagePop', _i18n_.get("GUI_CFG_GENERAL_REMOVE_ACCOUNT"), _i18n_.get("MSG_WARN_REMOVE_USER"), _i18n_.get("COMMON_CONFIRM"), true, removeUserAccount);
            $('#userToRemove').text($('#loginUsername').val());
        }
    });
    $('.dpBtn').click(function () {
        $('#outboundNumEntry').val($('#outboundNumEntry').val() + $(this).find('.dpNum').text());
        $('#outboundNumEntry').focus(); //WKRASKO 111312 - PNG-708
    });
    $('#dialpadWrapper').unbind('click')
        .click(function (event) {
            event.stopPropagation();
            $('#dialPad').toggle();
            if ($('#dialPad').is(':visible')) {
                $("#outboundNumEntry").autocomplete("disable")
                $('#outboundNumEntry').focus();
            } else {
                if (applicationSettings.mode == "kiosk") {
                } else {
                    $("#outboundNumEntry").autocomplete("enable")
                    $('#outboundNumEntry').blur();
                }
            }
        })
        .hover(
            function () {
                if (!$('#dialPad').is(':visible')) {
                    $('#dialpadWrapper').removeClass('dialpadWrapperOff');
                    $('#dialpadWrapper').addClass('dialpadWrapperOn');
                }
            },
            function () {
                if (!$('#dialPad').is(':visible')) {
                    $('#dialpadWrapper').removeClass('dialpadWrapperOn');
                    $('#dialpadWrapper').addClass('dialpadWrapperOff');
                }
            }
    );
    $(document).mouseup(function (e) {
        var $target = $(event.target);
        if (!$target.hasClass('blackFlyOutBox') && !$target.hasClass('blackFlyOutBoxWithFiller') && //Not a settings box itself
        $target.attr('id') != "errorPop" && $target.parents("#errorPop").length <= 0 && $target.attr('id') != "popDiv" && //WKRASKO 102212 - PNG-543, more to NOT hide fly outs.
        $target.attr('id') != "inputPop" && $target.parents("#inputPop").length <= 0 &&
        $target.attr('id') != "editE911Pop" && $target.parents("#editE911Pop").length <= 0 && //WKRASKO 102312 - PNG-547
        $("#dialPad").has(e.target).length === 0 && $("#callContactMenu").has(e.target).length === 0 //Cover elements WITHIN dialpad and call menu
        && !$target.isChildOf('#ui-datepicker-div') //Not the datepicker or one of it's elements
        && !$target.hasClass('callSettingsBtn') && $target.attr('id') != "outboundCallMenuBtn" && $target.attr('id') != "dialpadWrapper") {//Finally, cover settings menu buttons themselves, so it they handle themselves.
            //Reset all popouts
            $('.callSettingsBtnOver').addClass('callSettingsBtn');
            $('.callSettingsBtn').removeClass('callSettingsBtnOver');
            $('.callSettingsBtn').removeClass('callSettingsBtnSelected');
            $('#outboundCallMenuBtn').removeClass('callMenuBtnSelected');
            $('.blackFlyOutBox').hide();
            $('.blackFlyOutBoxWithFiller').hide();
            $('#dialpadWrapper').removeClass('dialpadWrapperOn');
            $('#dialpadWrapper').addClass('dialpadWrapperOff');
            if (applicationSettings.mode == "kiosk") {
            } else {
                $("#outboundNumEntry").autocomplete("enable")
            }
        }
    });
    $(document).mousedown(function (e) {
        var $target = $(event.target);
        //WKRASKO 111212 - PNG-698, this is the only trustworthy way I could find to reset in call dialer focus
        if (onCall && dialFieldWithFocus != null && !$target.hasClass('icDBtn') && !$target.hasClass('icDNumbers')) {
            dialFieldWithFocus = null;
            $('.icD_enteredNum').html('');
        }
    });
    $('#outboundCallMenuBtn').click(function (event) {
        event.stopPropagation();
        $('.blackFlyOutBoxWithFiller').hide();
        $('.callSettingsBtnOver').addClass('callSettingsBtn');
        $('.callSettingsBtn').removeClass('callSettingsBtnOver');
        $('.callSettingsBtn').removeClass('callSettingsBtnSelected');
        $('#callContactMenu').css('right', $(window).width() - ($('#outboundCallMenuBtn').position().left + $('#outboundCallMenuBtn').width()) - 1);
        $('#callContactMenu').toggle();
        if ($('#callContactMenu').is(':visible'))
            $('#outboundCallMenuBtn').addClass('callMenuBtnSelected');
        else
            $('#outboundCallMenuBtn').removeClass('callMenuBtnSelected');
    });
    $('#callSaveAsNew').click(function () {
        popAddContact();
        $('#callContactMenu').hide();
        $('#outboundCallMenuBtn').removeClass('callMenuBtnSelected');
        if ($('#outboundNumEntry').val() != _i18n_.get('GUI_NUMBERINPUT_TEXT'))
            $('.phone_input').val($('#outboundNumEntry').val());
    });
    $('#callAddToExisting').click(function () {
        var defaultFavoritesListHTML = '';
        var contactsArray = JAMBO_APP.ContactList.getContacts();
        var contactID = null;
        var theFirstName = "";
        var theLastName = "";
        var topBorder = "";
        var shortNameClass = '', longNameClass = '', theName = '';
        var theNumID = null;
        var theNum = "";
        var theType = "";

        $.each(contactsArray, function (f) {
            contactID = contactsArray[f].ID;
            theFirstName = contactsArray[f].FirstName;
            theLastName = contactsArray[f].LastName;
            topBorder = (f == 0) ? ' dn' : '';

            if (theFirstName != '' && theLastName == '') {
                shortNameClass = ' dn';
                theName = theFirstName;
            } else if (theFirstName == '' && theLastName != '') {
                shortNameClass = ' dn';
                theName = theLastName;
            } else longNameClass = ' dn';

            for (var i = 0; i < contactsArray[f].Numbers.length; i++) {
                theNumID = contactsArray[f].Numbers[i].ID;
                theNum = contactsArray[f].Numbers[i].Number;
                theType = (contactsArray[f].Numbers[i].TypeID != null) ? JAMBO_APP.ContactList.typeLookupObject[contactsArray[f].Numbers[i].TypeID] : '';
                if (sipPhonePurpReg.test(theNum))
                    theNum = format10D(theNum);
                defaultFavoritesListHTML += '<hr class="dk ' + topBorder + '" /><div data-contactID="' + contactID + '" class="existingContact">\n\
                        <div id="ecNameLong_' + theNumID + '" class="ecNameLong fl' + longNameClass + '">' + theName + '</div>\n\
                        <div id="ecNameFirst_' + theNumID + '" class="ecName fl' + shortNameClass + ' ecNameFirst">' + theFirstName + '</div>\n\
                        <div id="ecNameLast_' + theNumID + '" class="ecName fl' + shortNameClass + '">' + theLastName + '</div>\n\
                        <div class="numType fl">' + theType + '</div>\n\
                        <div class="ecNumber fl">' + theNum + '</div>\n\
                    </div>';
            }
        });
        $('#addToExistingContacts').html(defaultFavoritesListHTML);
        $('.existingContact').unbind('click');
        $('.existingContact').click(function () {
            if (!$(this).hasClass('existingContactActive')) {
                $('.existingContact').removeClass('existingContactActive');
                $(this).addClass('existingContactActive');
            } else $(this).removeClass('existingContactActive');
        });
        $('#addToExistingCancel').unbind('click');
        $('#addToExistingCancel').bind('click', function () {
            $('#addToExistingPop').hide();
            $('#popDiv').hide();
            $(this).unbind('click');
            showEmbeddedVideoComposer();
        });
        $('#addToExistingContinue').unbind('click');
        $('#addToExistingContinue').bind('click', function () {
            currentEditContact = $('.existingContactActive').data('contactID');
            popEditContact(currentEditContact);
            $('#addNumberIcon').click(); //PNG-244 KTRUMBLE 07192012
            $('.createEditContactNumber .phone_input').last().val($('#outboundNumEntry').val());
            $('#outboundNumEntry').val(_i18n_.get('GUI_NUMBERINPUT_TEXT'));
            $('#outboundNumEntry').css('color', '#898989');
            $('#addToExistingContacts').html('No contacts.');
            $('#addToExistingPop').hide();
            $(this).unbind('click');
        });
        $('#callContactMenu').hide();
        $('#outboundCallMenuBtn').removeClass('callMenuBtnSelected');
        hideEmbeddedVideoComposer();
        $('#popDiv').show();
        $('#addToExistingPop').show();
        repositionPopUpEnvironment('#addToExistingPop');
    });
    $('#callEditContact').click(function () {
        currentEditContact = JAMBO_APP.ContactList.getContactByNumber($('#outboundNumEntry').val());
        $('#callContactMenu').hide();
        $('#outboundCallMenuBtn').removeClass('callMenuBtnSelected');
        if ($('#outboundNumEntry').val() != _i18n_.get('GUI_NUMBERINPUT_TEXT') && $('#outboundNumEntry').val() != "" && JAMBO_APP.ContactList.contactExists($('#outboundNumEntry').val()))
            popEditContact(currentEditContact);
        else
            openMessagePopup('#errorPop', _i18n_.get("GUI_CALL_MENU_EDIT"), _i18n_.get("GUI_CALL_MENU_EDIT_NOCONTACT"));
    });
    $('#blockedCallersButton').click(function () {
        var blockedCallerHTML = JAMBO_APP.BlockedNumbers.blockedNumberHTML();
        openMessagePopup('#blockedCallersPop', _i18n_.get("GUI_CALL_MENU_BLOCKED_CALLERS"), blockedCallerHTML, _i18n_.get("GUI_WIZARD_DONE"), false);
        repositionPopUpEnvironment('#blockedCallersPop');
        $('#generalSettingsDone').click();
        $('.unblockCallerBtn').unbind('click').bind('click', function () {
            numberToUnblock = $(this).data('num').toString();
            $('#blockedCallersPop').hide(); //WKRASKO 111912 - PNG-728
            openMessagePopup('#messagePop', _i18n_.get("GUI_CALL_MENU_UNBLOCKCALLER"), _i18n_.get("MSG_WARN_UNBLOCK_CALLER"), _i18n_.get("COMMON_CONFIRM"), true, function () { JAMBO_APP.BlockedNumbers.unblockNumber(numberToUnblock); });
            var formattedNum = numberToUnblock;
            if (sipPhonePurpReg.test(formattedNum))
                formattedNum = format10D(formattedNum);
            $('#numberToUnblock').text(formattedNum);
        });
    });
    $('#clearHistoryBtn').click(function () {
        openMessagePopup('#messagePop', _i18n_.get("GUI_CFG_CALLING_CLEAR_HISTORY"), _i18n_.get("MSG_WARN_DELETE_CALL_HISTORY"), _i18n_.get("COMMON_CONFIRM"), true, function () { clearCallHistory(true); });
    });
    //Settings specific bindings, but global (per user below)
    $('.callSettingsBtn').hover(
        function (e) {
            e.stopPropagation();
            if (!$(this).hasClass('callSettingsBtnSelected')) {
                $(this).removeClass('callSettingsBtn');
                $(this).addClass('callSettingsBtnOver');
            }
        },
        function (e) {
            e.stopPropagation();
            if (!$(this).hasClass('callSettingsBtnSelected')) {
                $(this).removeClass('callSettingsBtnOver');
                $(this).addClass('callSettingsBtn');
            }
        }
    );
    $('.callSettingsBtn').click(function (e) {
        e.stopPropagation();
        var imOn = false;
        if ($('#settingsMenu' + $(this).data('smenu')).is(':visible'))
            imOn = true;
        $('.bfoMenu').hide();
        $('.callSettingsBtnOver').addClass('callSettingsBtn');
        $('.callSettingsBtn').removeClass('callSettingsBtnOver');
        $('.callSettingsBtn').removeClass('callSettingsBtnSelected');
        $('#outboundCallMenuBtn').removeClass('callMenuBtnSelected');
        if (!imOn) {
            $('#settingsMenu' + $(this).data('smenu')).show();
            $(this).addClass('callSettingsBtnSelected');
        }
    });
    setSettingsDoneEnabled();
    $('.settingsSubContentItem').hide();
    $('.settingsSubContentItem').first().show();
    $('.settingsSubMenuItem').click(function () {
        $('.settingsSubMenuItem').removeClass('settingsSubMenuItemSelected');
        $(this).addClass('settingsSubMenuItemSelected');
        $('.settingsSubContentItem').hide();
        $('#' + $(this).data('myContent')).show();
    });
    $.each(states, function (i, n) { $('#e911_state').append('<option value="' + i + '">' + n + '</option>') });
    $('#settings_about').click(showAbout);
    $('#editE911').click(function (event) {
        event.stopPropagation();
        popEditE911();
    });
    $('#reeditE911').click(function (event) {
        $('#addressSuggestionsWrapper').hide();
        $('#addressSuggestions').empty();
        $('#editE911Table').show();
        repositionPopUpEnvironment('#editE911Pop');
    });
    $('#editE911Pop input').change(function () { enableE911Verify(); });
    $('#editE911Pop select').change(function () { enableE911Verify(); });
    $('#revertCP').click(function () {
        $('#cp_oldpass').removeAttr('disabled');
        $('#cp_oldpass').val('');
        $('#cp_newpass').val('');
        $('#cp_newpass_repeat').val('');
        if ($('#changePassStep2').is(':visible'))
            $('#changePassStep2').hide();
    });
    var chatMenuClicked = false;
    $('#chatMenu').unbind('click').click(function () {
        chatMenuClicked = true;

        var topVal = ($('#chat_transcripts').hasClass('first_csItem')) ? '-123px' : '-98px';
        if ($('#chatSettings_menu').hasClass('dn')) {
            $('#chatSettings_menu').removeClass('dn');
            if ($('#chatSectionHead').hasClass('bottom')) {
                $('#chatSettings').css({ 'top': topVal, 'right': '0' });
                $('#chatSettings_menu').css({ '-webkit-box-shadow': '-1px -2px 3px gray', 'border-radius': '3px 3px 0 0' });
            }
            if ($('#chatSectionHead').hasClass('top')) {
                if (getPlatform() == "VRI") { // VRI mode
                    $('#chatSettings').css({ 'top': '38px', 'right': '5px' });
                } else {
                    $('#chatSettings').css({ 'top': '65px', 'right': '5px' });
                }
                $('#chatSettings_menu').css({ '-webkit-box-shadow': '-1px 2px 3px gray', 'border-radius': '0 0 3px 3px' });
            }
            $('#chatMenu').addClass('chatMenu_on');
            $('#chatMenuGear').addClass('chatMenuGear_on');
        } else {
            $('#chatSettings_menu').addClass('dn');
            if ($('#chatSectionHead').hasClass('bottom')) {
                $('#chatSettings').css({ 'top': topVal, 'right': '0' });
                $('#chatSettings_menu').css({ '-webkit-box-shadow': '-1px -2px 3px gray', 'border-radius': '3px 3px 0 0' });
            }
            if ($('#chatSectionHead').hasClass('top')) {
                if (getPlatform() == "VRI") { // VRI mode
                    $('#chatSettings').css({ 'top': '38px', 'right': '5px' });
                } else {
                    $('#chatSettings').css({ 'top': '65px', 'right': '5px' });
                }
                $('#chatSettings_menu').css({ '-webkit-box-shadow': '-1px 2px 3px gray', 'border-radius': '0 0 3px 3px' });
            }
            $('#chatMenu').removeClass('chatMenu_on');
            $('#chatMenuGear').removeClass('chatMenuGear_on');
        }
    });
    $('#chat_largeText').unbind('click');
    $('#chat_largeText').click(function () {
        chatMenuClicked = true;
        if ($('.tc_blog_largeText').length > 0) {
            JamboSocket.fontClass = '';
            $('.chatMsgBlock').removeClass('tc_blog_largeText');
            $('#chat_largeText').html(_i18n_.get('GUI_INTERPRETERCHAT_LARGETEXT')); //PNG-775 KTRUMBLE 01262013 - adding some last translations
        } else {
            JamboSocket.fontClass = 'tc_blog_largeText';
            $('.chatMsgBlock').addClass('tc_blog_largeText');
            $('#chat_largeText').html(_i18n_.get('GUI_INTERPRETERCHAT_SMALLTEXT')); //PNG-775 KTRUMBLE 01262013 - adding some last translations
        }
    });
    $('#chat_saveChat').unbind('click');
    $('#chat_saveChat').click(function () {
        chatMenuClicked = true;
        //WKRASKO 120612 - PNG-778 Hack for Mirial bug. Their core creates subfolder if it does not exist, but will only create them one level deep.
        //Create dummy file in first subfolder if it does not exist then, to cause creation of the first subfolder separately. Should be submitted to Mirial in the long run.
        var dummyFilePath = __thisWindow__.getUserHomePath() + '/P3ChatTranscripts/placeholder.txt';
        var dummyFile = __thisWindow__.readTextFile(dummyFilePath);
        if (isDefined(dummyFile.error) && dummyFile.error == "ERROR_FILE_DOES_NOT_EXIST")
            __thisWindow__.writeTextFile(dummyFilePath, " ", false);
        //PNG-450 KTRUMBLE 10012012 - chat transcript viewer
        var transcriptHistoryFilePath = __thisWindow__.getUserHomePath() + '/P3ChatTranscripts/' + JAMBO_APP.activeUserAccount + '/P3_Transcript_History.txt';
        var transcriptHistoryFile = __thisWindow__.readTextFile(transcriptHistoryFilePath);
        var appendFlag = false;
        if (!isDefined(transcriptHistoryFile.error)) appendFlag = true;

        if (JamboSocket.sessionID != '' || P2PChatEnabled) {//PNG-513 KTRUMBLE 11022012 - needs to work with P2PChat, too
            var dateNow = new Date(); //PNG-350 KTRUMBLE 08232012 - add date to chatlog filename
            var month = (dateNow.getMonth() + 1).toString();
            //PNG-450 KTRUMBLE 10012012 - chat transcript viewer
            month = (month.length <= 1) ? '0' + month : month;
            var day = dateNow.getDate().toString();
            day = (day.length <= 1) ? '0' + day : day;
            var formattedDate = month + day + dateNow.getFullYear().toString();
            var hour = dateNow.getHours().toString();
            hour = (hour.length <= 1) ? '0' + hour : hour;
            var mins = dateNow.getMinutes().toString();
            mins = (mins.length <= 1) ? '0' + mins : mins;
            var timeNow = hour + mins + dateNow.getSeconds().toString();
            var contactID = JAMBO_APP.ContactList.getContactByNumber(JamboSocket.dialStr);
            //WKRASKO 102612 - Quick edit, bad design here, chats should be in subfolder so user does not have 100 html files in their home folder
            var textChatFilePath = __thisWindow__.getUserHomePath() + '/P3ChatTranscripts/' + JAMBO_APP.activeUserAccount + '/P3_chatlog_' + formattedDate + '_' + timeNow + '.html'; //ARES-347 KTRUMBLE 08232012 - moving chat logs to user's home directory; ARES-349 KTRUMBLE 08232012 - changing the chat log extension to .html to allow for text formatting in saved logs
            var theChatBlobs = $('.chatMsgBlock');
            //PNG-349 KTRUMBLE 08312012 - adding some structure and style to saved chat transcripts
            var date = new Date();
            date = date.format("M j h:i A");
            var transcriptStr = '<div id="P3TranscriptHeader"> P3 Chat Transcript: ' + date + '</div>';
            var chatContents = '\n\
                <!DOCTYPE html>\n\
                <html>\n\
                    <head>\n\
                        <title>P3 NextGen Chat Transcript</title>\n\
                        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n\
                        <style type="text/css">\n\
                            * { font-size:1.0em }\n\
                            .fl { float:left; }\n\
                            .fr { float:right; }\n\
                            .cb { clear:both; }\n\
                            .dn { display:none; }\n\
                            .tc_blob { width:100%; border-top:1px solid #333; }\n\
                            .tc_blobTop { width:100%; border-top:0; }\n\
                            .tc_blobSenderNameIncoming, .tc_blobSenderName { margin:6px 0 6px 6px; }\n\
                            .tc_blobSenderNameIncoming, .tc_blobSenderName, .tc_blobTimeStamp { color:#b3b2b2; font-size:0.75em !important; }\n\
                            .tc_blobSenderName { font-weight:bold; color:#fff; }\n\
                            .tc_blobSenderNameIncoming { font-weight:normal; color:#b3b2b2; font-style:italic; }\n\
                            .tc_blobTimeStamp { font-size:0.75em !important; margin:6px 6px 6px 0; }\n\
                            .tc_blobText { color:#252323; text-shadow:1px 1px #fff; font-size:0.688em; margin:0 6px 6px 6px; }\n\
                            #transcriptContainer { visibility:visible; margin: auto; width:420px; height:100%; }\n\
                            #transcriptContainer, #transcriptContainer * { visibility:visible; color:#000; }\n\
                            #P3TranscriptHeader { font-size:1.3em !important; border-bottom:2px solid #000; margin:5px; }\n\
                            #transcriptContainer .tc_blog_largeText, #transcriptContainer .tc_blog_largeText * { font-size:1.10em !important; }\n\
                        </style>\n\
                    </head>\n\
                    <body>\n\
                        <div id="transcriptContainer">' + transcriptStr;
            $.each(theChatBlobs, function (k) {
                chatContents += $('<div>').append($(theChatBlobs[k]).clone()).html();
            });
            chatContents += '</div>\n\
                    </body>\n\
                </html>';
            __thisWindow__.writeTextFile(textChatFilePath, chatContents, false); //WKRASKO 091712 - PNG-428, (appendFlag) should always be false, since the entire doc is created above, not the "since last time" chats. Easier this way too.//(!textChatFile.error)?true:false;
            chatContents = '';
            //PNG-450 KTRUMBLE 10012012 - chat transcript viewer
            //show (and hide) the confirmation text
            $('#chat_messaging').html('<div class="checkmark fl"></div><div class="fl">' + _i18n_.get('GUI_SAVED_TRANSCRIPT') + '</div>'); //PNG-348 KTRUMBLE 08312012, PNG-827 KTRUMBLE 01252013 - swapping out hard-coded 'saved' for i18n lib
            $('#chat_messaging').show().delay(3000).fadeOut(500, function () { $('#chat_messaging').html(''); });

            //update the transcript history file
            var historyUpdate = (appendFlag) ? ',' : '';
            historyUpdate += contactID + '|' + formattedDate + '_' + timeNow;
            __thisWindow__.writeTextFile(transcriptHistoryFilePath, historyUpdate, appendFlag);
        }
        buildTranscriptLib(); //PNG-513 KTRUMBLE 11022012 - this should run every time there's a transcript saved
    });
    $('#chat_printChat').unbind('click').click(function () {
        chatMenuClicked = true;
        //WKRASKO 120612 - PNG-778 Hack for Mirial bug. Their core creates subfolder if it does not exist, but will only create them one level deep.
        var date = new Date(); //PNG-245 | PNG-246 KTRUMBLE 07192012
        date = date.format("M j h:i A");
        var printStr = '<div id="P3TranscriptHeader">P3 Chat Transcript: ' + date + '</div>';
        //WKRASKO 080112 - PNG-248
        $('#printFrame').contents().find('#printContainer').html(printStr + $('#terpChat_wrap').html());
        document.getElementById('printFrame').contentWindow.print();
    });
    $('#chat_clearChat').unbind('click').click(function () {
        chatMenuClicked = true;
        //WKRASKO 113012 - PNG-758, clear chat manually now, no more auto-clear.
        $('#terpChat_wrap').html('');
    });
    // PNG-471 KTRUMBLE 10052012 - incall dialer
    $('.icDBtn').unbind('click').click(function (e) {
        var code = $(this).data('char');
        if (code == 'hash') code = '#';
        else if (code == 'per') code = '.';
        else if (code == 'ast') code = '*';
        var existingDigits = $('#outboundNumEntry').val();
        if (existingDigits == _i18n_.get('GUI_NUMBERINPUT_TEXT')) existingDigits = '';
        $('#outboundNumEntry').val(existingDigits + code);
        $('#outboundNumEntry').focus();
        playDTMF(code);

        if (applicationSettings.mode == "kiosk") { //if value in textbox, hide "number" from background
            if ($('#outboundNumEntry').val() == '') {
                if (!$('#outboundNumEntry').hasClass('blur')) $('#outboundNumEntry').addClass('blur');
            } else {
                if ($('#outboundNumEntry').hasClass('blur')) $('#outboundNumEntry').removeClass('blur');
            }
        } else { }
    });
    //END PNG-471
    $('#favAdd_btnBox').click(function () {
        var defaultFavoritesListHTML = '';
        var contactsArray = JAMBO_APP.ContactList.getContacts();
        var theContactID = null;
        var theFirstName = "";
        var theLastName = "";
        var topBorder = "";
        var theName = '';
        var theNumID = null;
        var theNum = "";
        var theType = "";
        var formattedNum = "";

        $.each(contactsArray, function (f) {
            theContactID = contactsArray[f].ID;
            theFirstName = contactsArray[f].FirstName;
            theLastName = contactsArray[f].LastName;
            topBorder = (f == 0) ? ' dn' : '';

            theName = theFirstName + " " + theLastName;

            for (var i = 0; i < contactsArray[f].Numbers.length; i++) {
                if (!contactsArray[f].Numbers[i].IsFavorite) {
                    theNumID = contactsArray[f].Numbers[i].ID;
                    theNum = contactsArray[f].Numbers[i].Number;
                    theType = (contactsArray[f].Numbers[i].TypeID != null) ? JAMBO_APP.ContactList.typeLookupObject[contactsArray[f].Numbers[i].TypeID] : '';
                    formattedNum = theNum;
                    if (sipPhonePurpReg.test(formattedNum))
                        formattedNum = format10D(formattedNum);
                    //WKRASKO 110212 - PNG-640, adding title.
                    defaultFavoritesListHTML += '<hr class="dk' + topBorder + '" /><div data-num="' + theNum + '" data-cid="' + theContactID + '" data-nid="' + theNumID + '" class="matchedContact">\n\
                                                   <div id="mcNameLong_' + theNumID + '" class="mcNameLong fl" title="' + theName + '">' + theName + '</div>\n\
                                                    <div class="numType fl">' + theType + '</div>\n\
                                                   <div class="mcNumber fl">' + formattedNum + '</div>\n\
                                               </div>';
                }
            }
        });

        $('#searchFavContacts').html(defaultFavoritesListHTML);
        hideEmbeddedVideoComposer();
        var doSearch = false;
        $('#searchContacts').keypress(function (event) {
            var c = null;
            if (event.which !== 0) {
                c = String.fromCharCode(event.which);
                //WKRASKO 080312 - PNG-303. Can't limit characters now anyways, since we allow special chars as in P3 old
                //if(c.match(/\w/))
                doSearch = true; //PNG-293 KTRUMBLE 07022012
                //else event.preventDefault();
            }
        });
        $('#searchContacts').keyup(function (event) {
            if ($('#searchContacts').val().length < 1) $('#searchFavContacts').html(defaultFavoritesListHTML);
            if (doSearch) { doContactsSearch(); doSearch = false; }
        });
        doContactsSearch = function () {
            var searchVal = $('#searchContacts').val().toString().toLowerCase();
            var searchContentString = '';
            var theContactID = null;
            var theName = "";
            var theNumID = "";
            var theNum = "";
            var theType = "";
            var thisLabel = "";
            var thisLabelNorm = "";
            $.each(contactsArray, function (i) {
                theContactID = contactsArray[i].ID;
                theName = contactsArray[i].FirstName + " " + contactsArray[i].LastName;

                for (var j = 0; j < contactsArray[i].Numbers.length; j++) {
                    theNumID = contactsArray[i].Numbers[j].ID;
                    theNum = contactsArray[i].Numbers[j].Number;
                    theType = "";
                    if (contactsArray[i].Numbers[j].TypeID != null)
                        theType = JAMBO_APP.ContactList.typeLookupObject[contactsArray[i].Numbers[j].TypeID].replace(' ', '');
                    thisLabel = theName + " " + theNum;
                    thisLabelNorm = thisLabel.toLowerCase(); //WKRASKO 080312 - PNG-303
                    thisLabel = thisLabel.replace(/[^a-zA-Z0-9-_]/g, '').replace('-', '').toLowerCase();
                    if ((thisLabel.search(searchVal) != -1 || thisLabelNorm.search(searchVal) != -1) && !contactsArray[i].Numbers[j].IsFavorite) {
                        var formattedNum = theNum;
                        if (sipPhonePurpReg.test(formattedNum))
                            formattedNum = format10D(formattedNum);
                        //WKRASKO 110212 - PNG-640, adding title.
                        searchContentString += '<hr class="dk" /><div data-num="' + theNum + '" data-cid="' + theContactID + '" data-nid="' + theNumID + '" class="matchedContact">\n\
                                                       <div id="mcNameLong_' + theNumID + '" class="mcNameLong fl" title="' + theName + '">' + theName + '</div>\n\
                                                       <div class="numType fl">' + theType + '</div>\n\
                                                       <div class="mcNumber fl">' + formattedNum + '</div>\n\
                                                   </div>';
                    }
                }
            });
            if (searchContentString == '') searchContentString = _i18n_.get("GUI_SEARCHRESULTS_NO_RESULTS");
            $('#searchFavContacts').html(searchContentString);
        }
        $('#addFavSave').unbind('click').click(function () {
            if ($('#searchFavContacts').html() != _i18n_.get("GUI_SEARCHRESULTS_NO_RESULTS")) {
                var thisNum = $('.matchedContactActive').data('num');
                var cid = $('.matchedContactActive').data('cid');
                var nid = $('.matchedContactActive').data('nid');
                var numberType = $('.matchedContactActive').find('.numType').text();
                contactsNeedSync = true;
                JAMBO_APP.ContactList.updateNumber(cid, nid, JAMBO_APP.ContactList.getNumTypeID(numberType), thisNum, true);
                $('#addFavCancel').click();
                setTimeout(syncContacts, 500); //WKRASKO 081312 - PNG-323
            }
        });
        $('#popDiv').show();
        $('#addFavPop').show();
        repositionPopUpEnvironment('#addFavPop');
        $('#addFavCancel').unbind('click').bind('click', function () {
            $('#searchContacts').val(_i18n_.get("GUI_CALL_NEWFAVORITE_INPUT")).css('color', 'gray');
            $('#addFavPop').hide();
            $('#popDiv').hide();
            $(this).unbind('click');
            showEmbeddedVideoComposer();
        });
    });
    //WKRASKO 072412 - PNG-259, moved this outside of bind above and changed it to "live"
    $('.matchedContact').unbind().live('click', function () {
        if (!$(this).hasClass('matchedContactActive')) {
            $('.matchedContact').removeClass('matchedContactActive');
            $(this).addClass('matchedContactActive');
        } else $(this).removeClass('matchedContactActive');
    });
    $('#missedCallsIgnore').click(function () {
        $('#popDiv').hide();
        $('#missedCalls').hide();
        $('.missedCallsRow').remove();
        $('#missedCallsCount').text(0);
        $('#missedCallsCount').css({ 'background-color': '#868686' });
        showEmbeddedVideoComposer();
    });
    $('.missedCallsBackArrow').click(function () {
        if ($('.missedCallsRow:visible').prev().length > 0 && $('.missedCallsRow:visible').prev().hasClass('missedCallsRow')) {
            $('.missedCallsRow:visible').hide().prev().show();
            var counters = $('#missedCallsPaginator').text().split(' ');
            $('#missedCallsPaginator').text((parseInt(counters[0]) - 1) + ' of ' + counters[2]);
        }
    });
    $('.missedCallsForwardArrow').click(function () {
        if ($('.missedCallsRow:visible').next().length > 0 && $('.missedCallsRow:visible').next().hasClass('missedCallsRow')) {
            $('.missedCallsRow:visible').hide().next().show();
            var counters = $('#missedCallsPaginator').text().split(' ');
            $('#missedCallsPaginator').text((parseInt(counters[0]) + 1) + ' of ' + counters[2]);
        }
    });
    $('#missedCallsCallBack').click(function () {
        showEmbeddedVideoComposer();
        if ($('.missedCallsRow:visible').length > 0) {
            var validDialString = validateDialString($('.missedCallsRow:visible').find('#missedNumber').data('call_number').toString());
            initCallFromDialString(validDialString.dialString, $('.missedCallsRow:visible').find('#missedName').text(), validDialString.type);
        }
        if ($('.missedCallsRow').size() <= 1)
            $('#missedCallsIgnore').click(); //PNG-505 KTRUMBLE 10042012 - should dismiss dialog if only one missed call on callback
        else {//WKRASKO 101512 - PNG-505, if more than one, should remove the one called back.
            var newTotal = parseInt($('#missedCallsLabelCount').text()) - 1;
            $('#missedCallsLabelCount').text(newTotal);
            if (newTotal > 1)
                $('#missedCallsPaginator').text("1 of " + newTotal);
            else {
                $('#missedCallsPaginator').hide();
                $('.missedCallsBackArrow').hide();
                $('.missedCallsForwardArrow').hide();
            }
            $('.missedCallsRow:visible').remove();
            $('.missedCallsRow').first().show();
            repositionPopUpEnvironment("#missedCalls");
        }
    });
    $('#minimizeCallButton').click(function () {
        minimizeCall();
    });
    $('#newVideoMute div.callScreenInner').unbind('click').click(function () {
        var curState = $(this).data('state');
        $(this).removeClass(curState);
        var newState = (curState == 'muted') ? 'notmuted' : 'muted';
        $(this).data('state', newState);
        var boolState = (curState == 'muted') ? false : true;
        lineRepository.setCameraPrivacyMode(boolState);
        $(this).addClass(newState);
        if (!onCall) {//PNG-897 KTRUMBLE 02282013 - should only fire if not on a call
            if (curState == 'muted') {
                showEmbeddedVideoComposer();
                setTimeout(function () {
                    if (!$('#videoPrivacySlide').hasClass('dn')) $('#videoPrivacySlide').addClass('dn');
                }, 1000);
            } else {
                if ($('#videoPrivacySlide').hasClass('dn')) $('#videoPrivacySlide').removeClass('dn');
                hideEmbeddedVideoComposer();
            }
        }
        //WKRASKO 051713 - PNG-1024
        translateInCallButtons();
    });
    $('#newAudioMute div.callScreenInner').unbind('click').click(function () {
        var curState = $(this).data('state');
        $(this).removeClass(curState);
        var newState = (curState == 'muted') ? 'notmuted' : 'muted';
        $(this).data('state', newState);
        var boolState = (curState == 'muted') ? false : true;
        lineRepository.setMicMuted(boolState);
        $(this).addClass(newState);
        //WKRASKO 051713 - PNG-1024
        translateInCallButtons();
    });
    $('#newVideoLayout div.callScreenInner').unbind('click').click(function () {
        if (onCall) {
            var curState = $(this).data('state'), newState = '', vcState = 0;
            $(this).removeClass(curState);
            switch (curState) {
                case 'comp0': newState = 'comp1'; vcState = 1; break; // SBS - side by side
                case 'comp1': newState = 'comp2'; vcState = 2; break; //Remote only
                case 'comp2': newState = 'comp0'; vcState = 0; break; //Normal view
            }

            if (applicationSettings.mode == "kiosk") { //video layouts
                $('#newVideoLayout div').removeClass('normal');
                $('#newVideoLayout div').removeClass('remote');
                $('#newVideoLayout div').removeClass('sbs');
                switch (vcState) {
                    case 0:
                        $('#newVideoLayout div').addClass('normal');
                        break;
                    case 1:
                        $('#newVideoLayout div').addClass('sbs');
                        break;
                    case 2:
                        $('#newVideoLayout div').addClass('remote');
                        break;
                }
            } else {
                $('#newVideoLayout div.callScreenInner div.newVideoLayoutSpr img').attr('src', 'img/video' + newState + '.png');
            }
            __thisWindowProxy__.setVideoComposerLayout(vcState);
            $(this).data('state', newState);
            $(this).addClass(newState);
        }
    });

    var delta_x = 180;
    var delta_w = 450;
    var delta_h = 45;
    var current_x;
    var current_y;
    var current_width;
    var current_height;
    $('div.newFullScreenControl div.callScreenInner').click(function () {
        if (applicationSettings.mode == "kiosk") { //no VOM allowed
            return false;
        }
        if (fullScreen) {
            hideVideoOnlyMode();
            fullScreen = false;
        } else {
            showVideoOnlyMode();
            fullScreen = true;
        }
        $(window).resize();
        //WKRASKO 051713 - PNG-1024
        translateInCallButtons();
    });
    hideVideoOnlyMode = function () {
        console.log('hide VideoOnlyMode');
        var geometry = getCurrentGeometry();

        if (isDefined(applicationSettings.videoonlyGeometries)) {
            var videoonlyConfiguration = applicationSettings.videoonlyGeometries;
            videoonlyConfiguration.x = geometry.x;
            videoonlyConfiguration.y = geometry.y;
            videoonlyConfiguration.width = geometry.width;
            videoonlyConfiguration.height = geometry.height;
        }

        __thisWindow__.setMinimumSize(1035, 558);

        __thisWindow__.move(current_x, current_y);
        __thisWindow__.resize(current_width, current_height);

        $('#activeCallRowContent').css({ 'left': 185 });
        $('.newCallControls_VC').css({ 'left': 185, 'right': 274, 'height': 46 });
        $('#mainContentCall_dc').css({ 'display': '' });
        $('.newFullScreenControl .callScreenInner').css({ 'background-image': 'url(../img/vom_button.png)' });
        $('#threeWayContainer').css({ 'left': 582 });
        $('.newCallTabs').css({ 'margin-left': 0 });

        $(window).resize();
    }
    showVideoOnlyMode = function () {
        //console.log('show VideoOnlyMode');
        var geometry = getCurrentGeometry();
        current_x = geometry.x;
        current_y = geometry.y;
        current_width = geometry.width;
        current_height = geometry.height;

        var vom_x = geometry.x;
        var vom_y = geometry.y;
        var vom_width = geometry.width;
        var vom_height = geometry.height;

        __thisWindow__.setMinimumSize(475, 397);
        if (isDefined(applicationSettings.videoonlyGeometries)) {
            var vom = applicationSettings.videoonlyGeometries;
            console.log("video mode settings defined.");
            vom_x = (isDefined(vom.x) ? vom.x : current_x + delta_x);
            vom_y = (isDefined(vom.y) ? vom.y : current_y);
            vom_width = (isDefined(vom.width) ? vom.width : current_width - delta_w);
            vom_height = (isDefined(vom.height) ? vom.height : current_height - delta_h);
            __thisWindow__.move(vom_x, vom_y);
            __thisWindow__.resize(vom_width, vom_height);
        } else {
            __thisWindow__.move(current_x + delta_x, current_y);
            __thisWindow__.resize(current_width - delta_w, current_height - delta_h);
        }

        $('#activeCallRowContent').css({ 'left': 4 });
        $('.newCallControls_VC').css({ 'left': 0, 'right': 0, 'height': '100%' });
        $('#mainContentCall_dc').css({ 'display': 'none' });
        $('.newFullScreenControl .callScreenInner').css({ 'background-image': 'url(../img/fullScreenBtn_spr.png)' });
        $('#threeWayContainer').css({ 'left': 401 });
        $('.newCallTabs').css({ 'margin-left': 3 });

        $(window).resize();
    }
    $(document).keydown(function (e) {
        if (applicationSettings.mode == "kiosk") { //keydown function
            if (e.shiftKey && e.altKey && e.ctrlKey) {
                switch (e.which) {
                    case 76: // key l - lock out
                        $('#kiosk_unlock').hide();
                        return false;
                        break;
                    case 85: // key u - lock out
                        $('#kiosk_unlock').show();
                        setTimeout(function () { $('#kiosk_unlock').hide() }, 3000);
                        return false;
                        break;
                }
                if ($('#kiosk_unlock').is(':visible')) {
                    var r = true;
                    switch (e.which) {
                        case 49: // key 1
                            $('#NewCallBtn').click();
                            $(window).resize();
                            setTimeout("setVideoDimension();", 1000);
                            break;
                        case 50: // key 2
                            $('#HistoryBtn').click();
                            break;
                        case 51: // key 3
                            $('#ContactsBtn').click();
                            break;
                        case 52: // key 4
                            $('#PurpleMailBtn').click();
                            break;
                        case 53: // key 5
                            $('#SettingsBtn').click();
                            break;
                        case 70: // key f - show full screen
                            __thisWindow__.showFullScreen();
                            __thisWindow__.setAlwaysOnTop(true);
                            r = false;
                            break;
                        case 78: // key n - show normal screen
                            __thisWindow__.move(0, 0);
                            __thisWindow__.showNormal();
                            __thisWindow__.setAlwaysOnTop(false);
                            r = false;
                            break;
                        case 79: // key o - sign out
                            performDelayedLogOut();
                            r = false;
                            break;
                        default:
                            $('#kiosk_unlock').hide();
                            r = false;
                    }
                    $('#kiosk_unlock').hide();
                    setVideoDimension();
                    return r;
                }
            }
        }
    });
    resetLayout = function () {
        $('#kiosk_mainarea').css({ 'display': 'none' });

        if ($('#mainContainer').hasClass('vriGUI')) { $('#mainContainer').removeClass('vriGUI'); }
        if ($('#footer').hasClass('vriGUI')) { $('#footer').removeClass('vriGUI'); }

        if ($('#mainContainer').hasClass('kioskGUI')) { $('#mainContainer').removeClass('kioskGUI'); }
        if ($('#footer').hasClass('kioskGUI')) { $('#footer').removeClass('kioskGUI'); }
    }
    initVRI = function () {

        resetLayout();

        //Top and Left sections
        $('#mainContainer').addClass('vriGUI');
        $('#footer').addClass('vriGUI');

        button_text = _i18n_.get("GUI_CFG_VRI_START_BUTTON")
        $('#outboundCallBtn').text(button_text);
        $('#newCallTabControls').prepend("<div id='vri_settings_gear' onclick='vri_display_settings();'></div>");
        $('#mainContent').prepend("<div id='vri_settings_close' onclick='vri_close_settings();'></div>");

        $('#profileMenuCallSetting').hide();
        $('#profileMenuVoiceGreeting').hide();
        $('#profileMenuE911').hide();
        $('#profileMenuEmailPassword').hide();
        $('#profileMenuEmail').hide();
        $('#profileMenuAvatarColor').hide();
        $('#blockedCallersButton').hide();

        //Body section
        $('#kiosk_mainarea').css({ 'display': 'block' });

        //Footer sections
        $('#networkStatus').css('background-image', 'url(../img/kiosk-network-status.png)');
    }
    var kiosk_initialized = false;
    initKiosk = function () {

        if (kiosk_initialized) return;
        kiosk_initialized = true;

        __thisWindow__.setAlwaysOnTop(true);
        __thisWindow__.setMinimumSize(1280, 800); // Set minimum size based on Kiosk screen
        __thisWindow__.showFullScreen();

        resetLayout();

        //Top and Left sections
        $('#mainContainer').addClass('kioskGUI');
        $('#footer').addClass('kioskGUI');
        $("#outboundNumEntry").val("");
        $("#outboundNumEntry").autocomplete("disable");
        $("#outboundNumEntry").addClass("blur");

        $('#profileMenuCallSetting').hide();
        $('#profileMenuVoiceGreeting').hide();
        $('#profileMenuE911').hide();
        $('#profileMenuEmailPassword').hide();
        $('#profileMenuEmail').hide();
        $('#profileMenuAvatarColor').hide();
        $('#blockedCallersButton').hide();

        $('#aboutPop_TnC').hide();
        $('#aboutPop_privacy').hide();
        $('.signOffTab').hide();
        $('#dialSectionHead').hide();
        $('#chatSectionHead').hide();
        $('#kiosk_flyout_button').show()
        $('#kiosk_flyout').hide()
        $('#chat_largeText').click();

        $('#newVideoLayout div').addClass('normal');

        $('#newVideoLayout').wrap('<div class="kioskPadding fr" />');
        $('#newAudioMute').wrap('<div class="kioskPadding fr" />');
        $('#newVideoMute').wrap('<div class="kioskPadding fr" />');

        $('div#newCallControls0 div.newActiveCallDrop').wrap('<div class="kioskHover" />');
        $('div#newCallControls1 div.newActiveCallDrop').wrap('<div class="kioskHover" />');

        $('div#newCallControls0 div.newActiveCallAnswer').wrap('<div class="kioskAnswer kioskHover" />');
        $('div#newCallControls1 div.newActiveCallAnswer').wrap('<div class="kioskAnswer kioskHover" />');

        $('div#newCallControls0 div.newActiveCallIgnore').wrap('<div class="kioskIgnore kioskHover" />');
        $('div#newCallControls1 div.newActiveCallIgnore').wrap('<div class="kioskIgnore kioskHover" />');

        $('div#newCallControls0 div.newActiveCallControls').wrap('<div class="kioskHover_hold" />');
        $('div#newCallControls1 div.newActiveCallControls').wrap('<div class="kioskHover_hold" />');

        $('div#dialSectionHead_wrapper').append('<div id="kiosk_leftline" />');

        //$('div.newActiveCallHold').wrap('<div class="kioskHover_hold" />');
        //$('div.newActiveCallResume').wrap('<div class="kioskHover_resume" />');

        $('#videoPrivacySlide').css({ 'background-color': 'none', 'z-index': 1 });

        //Body section
        $('body').css({ 'background-image': 'url(../img/kiosk_bg.png)' });
        $('#kiosk_mainarea').css({ 'display': 'block' });

        //Footer section
        $('#kiosk_unlock').hide();
        $('#kiosk_e911_button').show();
        $('#networkStatus').css('background-image', 'url(../img/kiosk-network-status.png)');

        $(window).resize();
    }
    kiosk_flyout_menu = function () {
        var contactsArray = JAMBO_APP.ContactList.getContacts();
        var contactID = null;
        var theFirstName = "";
        var theLastName = "";
        var topBorder = "";
        var theNumID = null;
        var theNum = "";
        var theNumFormat = "";
        var menu = "";

        if (contactsArray != null && contactsArray.length > 0) {
            $(".kioskGUI #kiosk_flyout .body ul").children().remove();
            $.each(contactsArray, function (f) {
                contactID = contactsArray[f].ID;
                theFirstName = contactsArray[f].FirstName;
                theLastName = contactsArray[f].LastName;

                if (theFirstName != '' && theLastName == '') {
                    theName = theFirstName;
                } else if (theFirstName == '' && theLastName != '') {
                    theName = theLastName;
                } else {
                    theName = theFirstName + ' ' + theLastName;
                }
                for (var i = 0; i < contactsArray[f].Numbers.length; i++) {
                    theNumID = contactsArray[f].Numbers[i].ID;
                    theNum = contactsArray[f].Numbers[i].Number;
                    if (sipPhonePurpReg.test(theNum))
                        theNumFormat = format10D(theNum);

                    menu += "<li onclick='kiosk_flyout_call(" + theNum + ");'>" +
                            "<div class='right'></div>" +
                            "<div class='name'>" + trimToPx(theName, 175) + "</div>" +
                            "<div class='num'>" + theNumFormat + "</div>" +
                        "</li>";
                }
            });
        }
        $(".kioskGUI #kiosk_flyout .body ul").append(menu);
    }
    kiosk_flyout_call = function (n) {
        if ($('#outboundNumEntry').hasClass('blur')) $('#outboundNumEntry').removeClass('blur');
        $('#outboundNumEntry').val(n);
        $('#kiosk_flyout').hide();
        $('#outboundCallBtn').click();
    }
    $('#kiosk_flyout_button').unbind().click(function () {
        $('#kiosk_flyout').show()
    });

    /* This takes care of purple outline when hover during Kioisk touch-up screen
    $(".callScreenControls").hover(
    function () {
    if (!$(this).closest('.kioskPadding').hasClass('hover'))
    $(this).closest('.kioskPadding').addClass('hover');
    },
    function () {
    if ($(this).closest('.kioskPadding').hasClass('hover'))
    $(this).closest('.kioskPadding').removeClass('hover');
    }
    );
    $(".newActiveCallDrop, .newActiveCallAnswer, .newActiveCallIgnore").hover(
    function () {
    if (!$(this).closest('.kioskHover').hasClass('hover'))
    $(this).closest('.kioskHover').addClass('hover');
    },
    function () {
    if ($(this).closest('.kioskHover').hasClass('hover'))
    $(this).closest('.kioskHover').removeClass('hover');
    }
    );
    $(".newActiveCallHold, .newActiveCallResume").hover(
    function () {
    if (!$(this).closest('.kioskHover_hold').hasClass('hover'))
    $(this).closest('.kioskHover_hold').addClass('hover');
    },
    function () {
    if ($(this).closest('.kioskHover_hold').hasClass('hover'))
    $(this).closest('.kioskHover_hold').removeClass('hover');
    }
    );
    */

    $('#e911_dob').datepicker({ changeMonth: true, changeYear: true, constrainInput: true, dateFormat: "mm-dd-yy", hideIfNoPrevNext: true, minDate: "01-01-1900", defaultDate: "12-03-1974", showButtonPanel: false, yearRange: "1900:2050" });
    $('#e911_dob').mask('m9-d9-y999');
    //WKRASKO 080312 - PNG-12
    $('#loginAutomatic').change(function () {
        if ($(this).is(':checked'))
            $('#loginSavePassword').attr('checked', 'checked');
    });
    $('#signUp_btn').unbind('click').click(function () {// PNG-472 KTRUMBLE 10042012 - signin screen updates
        __thisWindow__.openInSystemBrowser('http://www.purple.us/register'); //PNG-400 KTRUMBLE 09102012
    });
    //KTRUMBLE 09282012 PNG-479 - add video mute controls
    $('#vidPrivacy').click(function () {
        if ($('#vidPrivacy').hasClass('vidPriv_off')) {
            $('#vidPrivacy').removeClass('vidPriv_off');
            $('#vidPrivacy').addClass('vidPriv_on');
            $('#vidPrivacySlide').removeClass('dn');
            offCallToggle = true;
            hideEmbeddedVideoComposer();
        } else {
            $('#vidPrivacy').removeClass('vidPriv_on');
            $('#vidPrivacy').addClass('vidPriv_off');
            $('#vidPrivacySlide').addClass('dn');
            offCallToggle = true;
            showEmbeddedVideoComposer();
        }
        lineRepository.setCameraPrivacyMode(!lineRepository.cameraPrivacyMode);
        offCallToggle = false;
    });
    //PNG-471 KTRUMBLE 10152012 - incall dialer adjustments
    $('.inCall_sectionHead').click(function () {
        var section = $(this).data('section');
        if (section == 'terpChat') {
            $('#inCallDialer').hide();
            $('#inCallDialer_sectionHead').removeClass('head_on');
            $('#inCallDialer_sectionHead').addClass('head_off');
            $('#terpChat_sectionHead').removeClass('head_off');
            $('#terpChat_sectionHead').addClass('head_on');
            $('#tc_Inner').show();
        } else {
            $('#inCallDialer').show();
            $('#inCallDialer_sectionHead').addClass('head_on');
            $('#inCallDialer_sectionHead').removeClass('head_off');
            $('#terpChat_sectionHead').addClass('head_off');
            $('#terpChat_sectionHead').removeClass('head_on');
            $('#tc_Inner').hide();
        }
    });
    $("body").click(function (event) {
        if (event.target.id != "chatMenu" &&
            event.target.id != "chatMenuGear" &&
            event.target.id != "chatSettings_menu") {
            if (!$('#chatSettings_menu').hasClass('dn'))
                $('#chatSettings_menu').addClass('dn');
        }
        if (applicationSettings.mode == "kiosk") {
            if (event.target.id != "kiosk_flyout_button" && $('#kiosk_flyout').is(':visible'))
                $('#kiosk_flyout').hide();
        } else { }
    });

    //WKRASKO 101912 - PNG-518
    $('#loginAutomatic').change(function (e) {
        var username = $('#startupMask #signin #loginUsername').val();
        var autoSignin = $(this).attr('checked');
        if (isDefined(autoSignin) && isDefined(applicationSettings.logins) && isDefined(applicationSettings.logins[username])) {
            if (autoSignin) {//We have to clear other auto-sign
                $.each(applicationSettings.logins, function (u) {
                    applicationSettings.logins[u].autoSignin = false;
                });
            }
            applicationSettings.logins[username].autoSignin = autoSignin;
            __thisWindowProxy__.setApplicationSettings(applicationSettings);
        }
    });
    $('#chatSectionHead').unbind().click(function () {
        if (chatMenuClicked) { chatMenuClicked = false; return; }
        if (getPlatform() == "VRI" && !$('div#signOffTab').is(':visible') && $('#chatSectionHead').hasClass('top')) { return false; } //Do not go to Dial View during VRI mode

        if ($('#chatViewer').hasClass('dn')) {
            if (!$('#chatSettings_menu').hasClass('dn'))
                $('#chatSettings_menu').addClass('dn');
            $('#dialViewer').addClass('dn');
            $('#chatViewer').removeClass('dn');
            $('#chatSectionHead').removeClass('bottom');
            $('#chatMenu').removeClass('bottom');
            $('#chatSectionHead').addClass('top');
            if (applicationSettings.mode == "kiosk") {
                if (!$('#dialSectionHead_wrapper').hasClass('incall')) $('#dialSectionHead_wrapper').addClass('incall');
            } else { }
        } else {
            $('#dialSectionHead').click();
        }
    });
    $('.dialSectionHead').unbind().click(function () {
        if (!$('#chatSettings_menu').hasClass('dn'))
            $('#chatMenu').click();

        if ($('#dialViewer').hasClass('dn')) {
            if (applicationSettings.mode == "kiosk") {
                if ($('#dialSectionHead_wrapper').hasClass('incall')) $('#dialSectionHead_wrapper').removeClass('incall');
            } else {
            }
            $('#chatViewer').addClass('dn');
            $('#dialViewer').removeClass('dn');
            $('#chatSectionHead').removeClass('top');
            $('#chatSectionHead').addClass('bottom');
            $('#chatMenu').addClass('bottom');
        } else {
            $('#chatSectionHead').click();
        }
    });
    $('#p3_logo').unbind().click(function () { showAbout(); });
    $('#kiosk_p3_logo').unbind().click(function () { showAbout(); });

    $('#kiosk_e911_button').unbind().click(function () {
        kiosk_e911();
    });

    kiosk_e911 = function () {

        openMessagePopup('#errorPop', "Warning", "Are you sure you need to call 911?", "Confirm", true, function () {

            var s911 = '911';
            if ($('#outboundNumEntry').hasClass('blur')) $('#outboundNumEntry').removeClass('blur');
            $('#outboundNumEntry').blur();
            $('#outboundNumEntry').val(s911);
            var lineAvailable = isDefined(lineRepository.getAvailableLine());
            JamboSocket.outbound10D = s911;
            if (lineAvailable && !JamboSocket.isVRS) {
                if ($('#chatViewer').hasClass('dn')) {
                    $('#dialViewer').addClass('dn');
                    $('#chatViewer').removeClass('dn');
                    $('#chatSectionHead').addClass('top');
                    $('#chatSectionHead').removeClass('bottom');
                    $('#chatMenu').removeClass('bottom');
                }
                initCallFromDialString(vrs10D, 'VRS', '10d');
            } else {
                var validDialString = validateDialString(s911);

                var isP2P = false;
                var currentlyConnected = false; //PNG-992 KTRUMBLE 04302013 - should not be able to dial the same 10D if already connected
                for (var i = 0; i < availableLines; i++) {
                    var tempLine = lineRepository.getLine(i);
                    if (isDefined(tempLine.call.remote.dialString)) {
                        if (tempLine.call.remote.dialString == validDialString.dialString) currentlyConnected = true;
                    }
                }
                if (lineAvailable && validDialString.status && (!JamboSocket.isVRS || (JamboSocket.isVRS && isP2P == true)) && !currentlyConnected) {
                    if ($('#chatViewer').hasClass('dn')) {
                        $('#dialViewer').addClass('dn');
                        $('#chatViewer').removeClass('dn');
                        $('#chatSectionHead').addClass('top');
                        $('#chatSectionHead').removeClass('bottom');
                        $('#chatMenu').removeClass('bottom');
                    }
                    initCallFromDialString(validDialString.dialString, s911, validDialString.type);
                } else {
                    if (currentlyConnected) validDialString.error = _i18n_.get("MSG_ERR_ALREADY_CONNECTED");
                    if (JamboSocket.isVRS) $('#invalidEntryMessage').html(_i18n_.get("MSG_ERR_TWO_VRS"));
                    if (isDefined(validDialString.error)) $('#invalidEntryMessage').html(validDialString.error); //PNG-1019 KTRUMBLE 04152013 - if dialstring is invalid display bad dialstring error instead of already on vrs call message
                    if (!lineAvailable) $('#invalidEntryMessage').html(_i18n_.get("MSG_WARN_TWO_CALLS"));
                    $('#outboundNumEntry').effect("highlight", { color: "#fcdc00" }, 3000); ;
                    $('#invalidEntryMessage').show().delay(3000).fadeOut(500, function () { $('#invalidEntryMessage').html(''); });
                }
            }

        });

    }

    $('#inCallSettingsControl').unbind().click(function () {
        if (!VRSToggleClicked) {
            var VRSIPRSectionOpen = 'inCallSettings';
            var IPRelayToggleRadio = $('[name=vrsiprelay_radio]:checked').val();
            if (IPRelayToggleRadio == 'VRS') VRSIPRSectionOpen = 'inCallSettings';
            else VRSIPRSectionOpen = 'inCallSettings_IPR';
            if (!$('#' + VRSIPRSectionOpen).is(':visible')) {
                $('#' + VRSIPRSectionOpen).show();
                if (!$('#inCallSettingsControlArrow').hasClass('tsArrow_cs_open')) $('#inCallSettingsControlArrow').addClass('tsArrow_cs_open');
            } else {
                $('#' + VRSIPRSectionOpen).hide();
                if ($('#inCallSettingsControlArrow').hasClass('tsArrow_cs_open')) $('#inCallSettingsControlArrow').removeClass('tsArrow_cs_open');
            }
        } else VRSToggleClicked = false;
    });
}

var tScriptSortBy='contact',transcriptsByID=null,transcriptsByTimestamp=null,transcriptPopHTML=null;
var chatHistoryByID = {}, chatHistoryByTimestamp = {};// PNG-513 KTRUMBLE 10062012 - making some adjustments to the recordEditMenus (using a single menu, repurposed for each row, versus a menu for each row)
//PNG-450 KTRUMBLE 10012012 - chat transcript viewer
buildTranscriptLib = function(){
    //WKRASKO 111412 - Have to empty these or we got dups!
    chatHistoryByID = {};
    chatHistoryByTimestamp = {};
    console.log("BUILDING TRANSCRIPTS");
    var textChatHistoryFilePath = __thisWindow__.getUserHomePath()+'/P3ChatTranscripts/'+JAMBO_APP.activeUserAccount+'/P3_Transcript_History.txt';
    var textChatHistoryFile = __thisWindow__.readTextFile(textChatHistoryFilePath);
    var textChatHistory = null;
    var leftPaneHTMLByID = '', leftPaneHTMLByTimestamp = '';
    if(!textChatHistoryFile.error){
        //read file, split by comma delimiter
        textChatHistory = textChatHistoryFile.content;
        textChatHistory = textChatHistory.split(',');
        //build transcript viewer popup content arrays
        $.each(textChatHistory,function(i){
            if(textChatHistory[i]!=""){
                var thisTranscript = textChatHistory[i].split('|');
                thisTranscript.id = thisTranscript[0];
                thisTranscript.timestamp = thisTranscript[1];
                //check to see if the ID array exists, setup new, if not
                if(!chatHistoryByID[thisTranscript.id]) chatHistoryByID[thisTranscript.id] = new Array();
                //push to chatHistoryByID array
                chatHistoryByID[thisTranscript.id].push({'Timestamp':thisTranscript.timestamp});
                //check to see if the Timestamp array exists, setup new, if not
                var thisTimestamp = thisTranscript.timestamp;
                if(!chatHistoryByTimestamp[thisTimestamp]) chatHistoryByTimestamp[thisTimestamp] = new Array();
                //push to chatHistoryByTimestamp array
                chatHistoryByTimestamp[thisTimestamp].push({'ID':thisTranscript.id});
            }
        });
        //WKRASKO 111412 - PNG-700, adding time, remove vars for efficiencty (memory)
        convertTimestamp=function(ts){
            //this exists to turn the previously generated non-standard timestamp into a nice date, to assist in document retrieval and display
            var tStampDate = ts.split('_');
            var tStampMonth = tStampDate[0].substring(0,2);
            var months = {'01':'January','02':'February','03':'March','04':'April','05':'May','06':'June','07':'July','08':'August','09':'September','10':'October','11':'November','12':'December'};
            $.each(months,function(i){
                if(tStampMonth==i) tStampMonth = months[i];
            });
            var displayDate = tStampMonth+' '+tStampDate[0].substring(2,4)+', '+tStampDate[0].substring(4,9);
            var tempHour = parseInt(tStampDate[1].substring(0,2));
            var tempMeridian = "AM";
            if(tempHour == 0)
                tempHour = 12;
            else if (tempHour == 12)
                tempMeridian = "PM";
            else if (tempHour > 12){
                tempHour = tempHour-12;
                tempMeridian = "PM";
            }
            displayDate += " "+tempHour+":"+tStampDate[1].substring(2,4)+" "+tempMeridian;
            return displayDate;
        }
        //build the left pane HTML by ID
        $.each(chatHistoryByID,function(id){
            var thisContact = JAMBO_APP.ContactList.getContact(id);
            var tempFName = (thisContact!=null && thisContact.FirstName!=null) ? thisContact.FirstName : _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_CONTACT").split(' ')[0];
            var tempLName = (thisContact!=null && thisContact.LastName!=null) ? thisContact.LastName : _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_CONTACT").split(' ')[1];
            if(tempLName == null) tempLName = "";
            leftPaneHTMLByID += '<div data-cid="'+id+'" id="tsH_'+id+'" class="tsHead cb"><div class="tsArrow fl"></div>'+tempFName+' '+tempLName+'</div>';
            $.each(chatHistoryByID[id],function(g){
                var timeStamp = chatHistoryByID[id][g].Timestamp;
                if(timeStamp!=undefined) leftPaneHTMLByID += '<div class="cb tsItem dn _'+id+'" data-cid="'+id+'" data-tsFilePath="P3_chatlog_'+timeStamp+'.html">- '+convertTimestamp(timeStamp)+'</div>';
            });
        });
        //build the left pane HTML by Timestamp -TODO
        /*
        $.each(chatHistoryByTimestamp,function(ts){
            var thisContact = null;
            $.each(chatHistoryByTimestamp[ts],function(i){
                thisContact = JAMBO_APP.ContactList.getContact(chatHistoryByTimestamp[ts][i]['ID']);
            });
            leftPaneHTMLByTimestamp += '<div class="cb">'+thisContact.FirstName+' '+thisContact.LastName+'</div>';
        });*/
        //populate the popup content variable
        var chatTranscripts = (tScriptSortBy=='contact')?leftPaneHTMLByID:leftPaneHTMLByTimestamp;
        //now enable all the menu items in the hidden recordEditMenus
        if(textChatHistory.length>0 && !(textChatHistory.length==1 && textChatHistory[0]=="")){
            chatTranscriptsAvailable=true;
            if(!onCall && !offCallToggle){
               if($('#chat_transcripts').hasClass('dn')){
                   $('#chat_transcripts').removeClass('dn');
                   $('.chatSettings_item').removeClass('first_csItem');
                   $('#chat_transcripts').addClass('first_csItem');
               }
            }
        } else {//WKRASKO 051613 - PNG-1114. Always "clear".
            chatTranscriptsAvailable=false;
            if(!$('#chat_transcripts').hasClass('dn')){
                $('#chat_transcripts').addClass('dn');
                $('.chatSettings_item').addClass('first_csItem');
                $('#chat_transcripts').removeClass('first_csItem');
            }
        }
        //prepare the popup HTML
        transcriptPopHTML = '<div id="transcriptsLCol" class="transcriptPopCol fl">'+chatTranscripts+'</div>\n\
            <div id="transcriptsRCol" class="transcriptPopCol fl">'+_i18n_.get("GUI_TRANSCRIPTVIEWER_CHOOSE")+'</div>\n\
            <span id="transcriptDelete" class="delete handler fl">'+_i18n_.get("COMMON_DELETE")+'</span>\n\
            <span id="transcriptPrint" class="cancel handler fr purpleOK">'+_i18n_.get("GUI_INTERPRETERCHAT_PRINTTEXT")+'</span>';
    } else {
        chatTranscriptsAvailable=false;
        if(!$('#chat_transcripts').hasClass('dn')){//WKRASKO 051613 - PNG-1114. Always "clear".
            $('#chat_transcripts').addClass('dn');
            $('.chatSettings_item').addClass('first_csItem');
            $('#chat_transcripts').removeClass('first_csItem');
        }
    }
    //PNG-450 KTRUMBLE 10012012 - chat transcript viewer
    $('#chat_transcripts').unbind().click(function(){
        $('#chatMenu').click();
        openMessagePopup('#transcriptPop',_i18n_.get("GUI_TRANSCRIPTVIEWER_TITLE"),transcriptPopHTML,_i18n_.get("GUI_WIZARD_DONE"),false,function(){
            syncContacts();
            buildTranscriptLib();//WKRASKO 120312 - PNG-752, have to force this even though syncContacts does it, becuase with new "last updated" on contacts, it doesn't always get called. NOTE: syncContacts still needed! To re-draw for contacts edit menu transcript buttons.
        });
        $('.tsHead').unbind('click').click(function(){
            var thisID = $(this).data('cid');
            var thiscID = $(this).data('cid');
            if(!$('div#tsH_'+thisID+' div.tsArrow').hasClass('tsArrow_open')) $('div#tsH_'+thisID+' div.tsArrow').addClass('tsArrow_open');
            else $('div#tsH_'+thisID+' div.tsArrow').removeClass('tsArrow_open');
            $.each($('._'+thiscID),function(){
                if($(this).hasClass('dn')) $(this).removeClass('dn');
                else $(this).addClass('dn');
            });
        });
        $('.tsItem').unbind('click').click(function(){
            //WKRASKO 102612 - Quick edit, bad design here, chats should be in subfolder so user does not have 100 html files in their home folder
            var filePath = __thisWindow__.getUserHomePath()+'/P3ChatTranscripts/'+JAMBO_APP.activeUserAccount+'/'+$(this).data('tsFilePath');
            var transcriptFile = __thisWindow__.readTextFile(filePath);
            $('#transcriptsRCol').html(transcriptFile.content);
            $('.tsItem').removeClass('tsItem_on');
            $(this).addClass('tsItem_on');
        });
        $('#transcriptPrint').unbind('click').click(function(){
            $('#printFrame').contents().find('#printContainer').html($('#transcriptsRCol').html());
            document.getElementById('printFrame').contentWindow.print();
        });
        //WKRASKO 102612 - PNG-630, WKRASKO 111612 - UPDATE: Updating here and elswhere to store in subfolder of user id, otherwise all users can see each others chats!
        $('#transcriptDelete').unbind('click').click(function(){
            if(!$('.tsItem_on').length>0)
                return;
            var fileToDelete = __thisWindow__.getUserHomePath()+'/P3ChatTranscripts/'+JAMBO_APP.activeUserAccount+'/'+$('.tsItem_on').data('tsFilePath');
            var filestampToMatch = fileToDelete.split('_')[2]+'_'+fileToDelete.split('_')[3].split('.')[0];
            var contactIDToMatch = $('.tsItem_on').data('cid');
            var textChatHistoryFilePath = __thisWindow__.getUserHomePath()+'/P3ChatTranscripts/'+JAMBO_APP.activeUserAccount+'/P3_Transcript_History.txt';
            var textChatHistoryFile = __thisWindow__.readTextFile(textChatHistoryFilePath);
            var textChatHistory = null;
            var newHistoryArray = new Array();
            if(!textChatHistoryFile.error){
                //read file, split by comma delimiter
                textChatHistory = textChatHistoryFile.content;
                textChatHistory = textChatHistory.split(',');
                //build transcript viewer popup content arrays
                $.each(textChatHistory,function(i){
                    var thisTranscript = textChatHistory[i].split('|');
                    if(thisTranscript[0]==contactIDToMatch && thisTranscript[1]==filestampToMatch){
                        //THis is the one! Delete it
                        console.log("Going to delete chat transcript: "+textChatHistory[i]);
                        //For now, we just re-write log below. Mirial provides no deleteTextFile type call :(
                        //If added in future, probably something like:
                        //__thisWindow__.deleteTextFile(fileToDelete);
                    } else {
                        //Other put it back in file.
                        newHistoryArray.push(textChatHistory[i]);
                    }
                });
                if(newHistoryArray.length==0)
                    __thisWindow__.writeTextFile(textChatHistoryFilePath,"",false);
                else if(newHistoryArray.length==1)
                    __thisWindow__.writeTextFile(textChatHistoryFilePath,newHistoryArray[0],false);
                else if(newHistoryArray.length>1)
                    __thisWindow__.writeTextFile(textChatHistoryFilePath,newHistoryArray.join(),false);
                var $selectedTSItem = $('.tsItem_on');
                if($selectedTSItem.next().length>0){
                    if($selectedTSItem.next().hasClass('tsHead'))//WKRASKO 121312 - PNG-630, more fixes
                        $('#transcriptsRCol').html('')
                    $selectedTSItem.next().click();
                } else {
                    if($selectedTSItem.prev().hasClass('tsHead'))//WKRASKO 121312 - PNG-630, more fixes
                        $('#transcriptsRCol').html('')
                    $selectedTSItem.prev().click();
                }
                $selectedTSItem.remove();
            }
        });
    });
}

setupSettingsView = function () {
    //Initialize profile
    $('#pi_fname').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].FirstName);
    $('#pi_lname').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].LastName);
    $('#pi_email').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].EmailAddress);
    //Initialize email notifications
    var emailNotificationsState = "off";
    if (JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].NotifyVideoEmail) {
        emailNotificationsState = "on";
        //enableEmailNotificationForm();
    } else {
        //disableEmailNotificationForm();
    }

    /** TOGGLE - MINIMIZE DURING SIGN IN**/
    //$('#useemailnotifications_toggle').empty();
    //var useemailnotificationsState = false; 
    var radioStr = '<input type="radio" id="useemailnotifications_radio_on" name="useemailnotifications_radio" value="on" /><label for="useemailnotifications_radio_on" class="typeToggle">On</label>';
    radioStr += '<input type="radio" id="useemailnotifications_radio_off" name="useemailnotifications_radio" value="off" /><label for="useemailnotifications_radio_off" class="typeToggle">Off</label>';
    //$('#useemailnotifications_toggle').append(radioStr);

    //if (useemailnotificationsState) { $('#useemailnotifications_radio_on').attr('checked', true);
    //} else { $('#useemailnotifications_radio_off').attr('checked', true); }
    /*
    $('#useemailnotifications_toggle').buttonset();
    $('#useemailnotifications_toggle').unbind().change(function () {
    useemailnotificationsState = ($('[name=useemailnotifications_radio]:checked').val() == "on") ? true : false;
    if (useemailnotificationsState) { 
    enableEmailNotificationForm();
    } else {
    disableEmailNotificationForm(); }
    console.log("Turned Email Notifications: " + useemailnotificationsState);
    });
    */
    //$('#profileEmailCurrent').text(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].EmailAddress);
    $('#vmNotificationEmail').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VMEmailAddress);
    $('#icNotificationEmail').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].NotifyEmailAddress);
    /*$('#emailNotificationsUseProfile').unbind().change(function () {
    if ($(this).is(':checked')) {
    $('#vmNotificationEmail').attr('disabled', 'disabled');
    $('#icNotificationEmail').attr('disabled', 'disabled');
    } else {
    $('#vmNotificationEmail').removeAttr('disabled');
    $('#icNotificationEmail').removeAttr('disabled');
    }
    });*/
    //Initialize Calling
    populateAnnounceVRS();
    populateVILangSelect();
    populateVRSIPRelay();
    $("#e911address_toggle").buttonset();

    //Initialize E911
    JAMBO_APP.WebServices.getUserE911(JAMBO_APP.activeUserAccount, fillE911);

    if (isDefined(applicationSettings.vrsSettings)) {
        if (isDefined(applicationSettings.vrsSettings.specialInstructions)) {
            var theInstructions = (applicationSettings.vrsSettings.specialInstructions == '') ? _i18n_.get('GUI_SETTINGS_CALL_SI') : applicationSettings.vrsSettings.specialInstructions;
            $('#specialInstructions').val(theInstructions);
            $('#specialInstructions_IPR').val(theInstructions);
        } else {
            $('#specialInstructions').val(_i18n_.get('GUI_SETTINGS_CALL_SI'));
            $('#specialInstructions_IPR').val(_i18n_.get('GUI_SETTINGS_CALL_SI'));
        }
    } else {
        $('#specialInstructions').val(_i18n_.get('GUI_SETTINGS_CALL_SI'));
        $('#specialInstructions_IPR').val(_i18n_.get('GUI_SETTINGS_CALL_SI'));
    }

    //Help
    //MAYBE_UNNEEDED$('#help_support').click(function(){ openMessagePopup('#errorPop','Error Message','Yep, you had some error, call us.','Contact Support',false,function(){ initCallFromDialString(JAMBO_APP.DeviceConfig.CCNumber,'Temp Name') }); });
}

disableEmailNotificationForm = function(){
    //$('#emailNotificationsUseProfile').attr('disabled','disabled');
    //$('#vmNotificationEmail').attr('disabled','disabled');
    //$('#icNotificationEmail').attr('disabled','disabled');
    //$('#emailNotificationsUseProfile').removeAttr('checked');
}

enableEmailNotificationForm = function(){
    $('#emailNotificationsUseProfile').removeAttr('disabled');
    var profileEmail = JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].EmailAddress;
    if( JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].NotifyEmailAddress==profileEmail && JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VMEmailAddress==profileEmail ){
        $('#emailNotificationsUseProfile').attr('checked','checked');
        $('#vmNotificationEmail').attr('disabled','disabled');
        $('#icNotificationEmail').attr('disabled','disabled');
    } else {
        $('#emailNotificationsUseProfile').removeAttr('checked');
        $('#vmNotificationEmail').removeAttr('disabled');
        $('#icNotificationEmail').removeAttr('disabled');
    }
}

setVRS10D = function(l,n){//PNG-822 KTRUMBLE 04032013 - set VRS10D onload based on saved interpreter language
    if(l=='spanish' && n=='8774674877') vrs10D='8774674875';//prod
    else if(l=='spanish' && n=='9168778543') vrs10D='9168778547';//training
    else if(l=='spanish' && n=='8552744631') vrs10D='8552744632';//staging
    else if(l=='spanish' && n=='8552744620') vrs10D='8552744634';//dev
    else if(l=='english' && n=='8774674875') vrs10D='8774674877';//prod
    else if(l=='english' && n=='9168778547') vrs10D='9168778543';//training
    else if(l=='english' && n=='8552744632') vrs10D='8552744631';//staging
    else if(l=='english' && n=='8552744634') vrs10D='8552744620';//dev
}//END PNG-822

populateVILangSelect = function () {
    //BEGIN UI REVISION per DP - change terp language selector to same layout as vco toggle (from a select list to a radio toggle), but still populate and choose the default or previously selected language
    $('#terplang_toggle').empty();
    var langSwitches = (isDefined(applicationSettings.language) && applicationSettings.language == "es_ES") ? viLanguages.span : viLanguages.eng;
    $.each(langSwitches, function (i, n) {
        var radioStr = '<input type="radio" id="terplang_radio' + i + '" name="terplang_radio" value="' + i + '" /><label for="terplang_radio' + i + '" class="typeToggle">' + n + '</label>';
        $('#terplang_toggle').append(radioStr);
    });
    if (isDefined(JAMBO_APP.userAccounts) && isDefined(JAMBO_APP.activeUserAccount) && JAMBO_APP.activeUserAccount != null) {
        terpLang = JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VILanguage.toLowerCase();
        $.each($('[name="terplang_radio"]'), function (i) {
            if ($(this).val() == terpLang) $(this).attr('checked', true);
        });
    } else $('#terplang_radio' + terpLang).attr('checked', true);
    setVRS10D(terpLang,vrs10D);//PNG-822 KTRUMBLE 04032013 - set VRS10D onload based on saved interpreter language
    //END UI REVISION per DP
    $('#terplang_toggle').buttonset();
    $('#terplang_toggle').unbind().change(function () {
        terpLang = $('[name=terplang_radio]:checked').val();
        setVRS10D(terpLang,vrs10D);//PNG-822 KTRUMBLE 04032013 - set VRS10D onload based on saved interpreter language
    });
    $('#terplang_settings_toggle').empty();
    $.each(langSwitches, function (i, n) {
        var radioStr = '<input type="radio" id="terplang_settings_radio' + i + '" name="terplang_settings_radio" value="' + i + '" /><label for="terplang_settings_radio' + i + '" class="typeToggle">' + n + '</label>';
        $('#terplang_settings_toggle').append(radioStr);
    });
    if (isDefined(JAMBO_APP.userAccounts) && isDefined(JAMBO_APP.activeUserAccount) && JAMBO_APP.activeUserAccount != null) {
        terpLang = JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VILanguage.toLowerCase();
        $.each($('[name="terplang_settings_radio"]'), function (i) {
            if ($(this).val() == terpLang) $(this).attr('checked', true);
        });
    } else $('#terplang_settings_radio' + terpLang).attr('checked', true);
    //END UI REVISION per DP
    $('#terplang_settings_toggle').buttonset();
    $('#terplang_settings_toggle').unbind().change(function () {
        terpLang = $('[name=terplang_settings_radio]:checked').val();
        setVRS10D(terpLang,vrs10D);//PNG-822 KTRUMBLE 04032013 - set VRS10D onload based on saved interpreter language
        $.each($('[name="terplang_radio"]'), function (i) {
            $(this).attr('checked', false);
            if ($(this).val() == terpLang) $(this).attr('checked', true);
        });
        $('#terplang_toggle').buttonset("refresh");
    });
}

populateAnnounceVRS = function () {
    $('#announcevrs_toggle').empty();
    var relayState = "off"; if (isDefined(JAMBO_APP.userAccounts) && isDefined(JAMBO_APP.activeUserAccount) && isDefined(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount]) && JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].AnnounceVRS) { relayState = "on"; announceRelay = true; }

    if (applicationSettings.mode == "kiosk") {
        yes = "On";
        no = "Off";
        //relayState = "on"; 
        //announceRelay = true;
    }
    else {
        yes = _i18n_.get('GUI_YES');
        no = "No";
    }

    var radioStr = '<input type="radio" id="announcevrs_radio_yes" name="announcevrs_radio" value="yes" /><label id="announcevrs_radio_yes_label" for="announcevrs_radio_yes" class="typeToggle">' + yes + '</label>';
    radioStr += '<input type="radio" id="announcevrs_radio_no" name="announcevrs_radio" value="no" /><label id="announcevrs_radio_no_label" for="announcevrs_radio_no" class="typeToggle">' + no + '</label>';
    $('#announcevrs_toggle').append(radioStr);

    $('#announcevrs_global_toggle').empty();
    radioStr = '<input type="radio" id="announcevrs_global_radio_yes" name="announcevrs_global_radio" value="yes" /><label for="announcevrs_global_radio_yes" class="typeToggle">' + yes + '</label>';
    radioStr += '<input type="radio" id="announcevrs_global_radio_no" name="announcevrs_global_radio" value="no" /><label for="announcevrs_global_radio_no" class="typeToggle">' + no + '</label>';
    $('#announcevrs_global_toggle').append(radioStr);

    if (announceRelay) {
        $('#announcevrs_radio_yes').attr('checked', true);
        $('#announcevrs_global_radio_yes').attr('checked', true);
    } else {
        $('#announcevrs_radio_no').attr('checked', true);
        $('#announcevrs_global_radio_no').attr('checked', true);
    }

    $('#announcevrs_toggle').buttonset();
    $('#announcevrs_global_toggle').buttonset();

    $('#announcevrs_global_toggle').unbind().change(function () {
        announceRelay = $('[name=announcevrs_global_radio]:checked').val();
        console.log("Turned AnnounceVRS: " + announceRelay);
        //PNG-1015 KTRUMBLE 04012013 - dial pane settings should update on change
        $.each($('[name="announcevrs_radio"]'), function (i) {
            $(this).attr('checked', false);
            if ($(this).val() == announceRelay) $(this).attr('checked', true);
        });
        $('#announcevrs_toggle').buttonset("refresh");
    });
}
var VRSToggleClicked = false;
populateVRSIPRelay = function () {
    $('#callType_toggle').empty();
    var radioStr = '<input type="radio" id="vrsiprelay_radio_vrs" name="vrsiprelay_radio" value="VRS" checked="true" /><label for="vrsiprelay_radio_vrs" class="VRSIPRtypeToggle">VRS</label>';
    radioStr += '<input type="radio" id="vrsiprelay_radio_ipr" name="vrsiprelay_radio" value="IPRelay" /><label for="vrsiprelay_radio_ipr" class="VRSIPRtypeToggle">IP-Relay</label>';
    $('#callType_toggle').append(radioStr);

    $('#callType_toggle').buttonset();

    $('[name=vrsiprelay_radio]').unbind().change(function (event) {
        VRSToggleClicked=true;
        IPRelayToggle = $('[name=vrsiprelay_radio]:checked').val();
        console.log("Changed VRS/IPRelay to: " + IPRelayToggle);
        if(IPRelayToggle=="IPRelay") {
            $('#inCallSettings').hide();
            $('#inCallSettings_IPR').show();
        } else {
            $('#inCallSettings').show();
            $('#inCallSettings_IPR').hide();
        }
    });
    
    $('#opGender_toggle').empty();
    radioStr = '<input type="radio" id="opGender_radio_either" name="opGender_radio" value="Either" checked="true" /><label for="opGender_radio_either" class="IPRGenderToggle">Either</label>';
    radioStr += '<input type="radio" id="opGender_radio_male" name="opGender_radio" value="Male" /><label for="opGender_radio_male" class="IPRGenderToggle">Male</label>';
    radioStr += '<input type="radio" id="opGender_radio_female" name="opGender_radio" value="Female" /><label for="opGender_radio_female" class="IPRGenderToggle">Female</label>';
    $('#opGender_toggle').append(radioStr);
    $('#opGender_toggle').buttonset();
    
    $('#opLanguage_toggle').empty();
    radioStr = '<input type="radio" id="opLanguage_radio_eng" name="opLanguage_radio" data-i18n_key="COMMON_LANG_LABEL_ENG" value="'+_i18n_.get('COMMON_LANG_LABEL_ENG')+'" checked="true" /><label for="opLanguage_radio_eng" class="IPRGenderToggle">'+_i18n_.get('COMMON_LANG_LABEL_ENG')+'</label>';
    radioStr += '<input type="radio" id="opLanguage_radio_esp" name="opLanguage_radio" data-i18n_key="COMMON_LANG_LABEL_ESP" value="'+_i18n_.get('COMMON_LANG_LABEL_ESP')+'" /><label for="opLanguage_radio_esp" class="IPRGenderToggle">'+_i18n_.get('COMMON_LANG_LABEL_ESP')+'</label>';
    $('#opLanguage_toggle').append(radioStr);
    $('#opLanguage_toggle').buttonset();
}

setSettingsDoneEnabled = function () {
    $('#saveCallSettings').unbind('click').click(function () {
        var vcoError = false;
        if (!$('#vcoext_global').attr('disabled') && (
            isNaN($('#vcoext_global').val()) ||
            $('#vcoext_global').val().toString().length == 1 ||
            $('#vcoext_global').val().toString().length == 2 ||
            $('#vcoext_global').val().toString().indexOf(' ') != -1
        )) {
            vcoError = true;
            $('#c_ext_invalid_global').html(_i18n_.get("GUI_SETTINGS_INVALIDEXT_CALL"));
            $('#vcoext_global').css({ "backgroundColor": '#fcdc00' });
            $('#c_ext_invalid_global').show().delay(3000).fadeOut(500,function(){ $('#c_ext_invalid_global').html(''); });//PNG-1148 KTRUMBLE 05232013 - error messages should fade after 3 seconds
            $('#vcoext_global').unbind().focus(function () {
                $(this).css('backgroundColor', 'white');
            });
        } else { vcoError = false; }
        if (!vcoError) {
            var annouceVRS = false;
            if (!isDefined(applicationSettings.vrsSettings))
                applicationSettings.vrsSettings = {};
            if ($('[name=announcevrs_global_radio]:checked').val() == 'yes') annouceVRS = true;
            JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VILanguage = $('[name=terplang_settings_radio]:checked').val().charAt(0).toUpperCase() + $('[name=terplang_settings_radio]:checked').val().slice(1);
            JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].AnnounceVRS = announceRelay;
            JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCONumber = $('#vconumber_global').val();
            JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCOExt = $('#vcoext_global').val();
            var oneLineVCOUser = false, twoLineVCOUser = false;
            if ($('[name="vcotype_radio_global"]:checked').val() == "1" || $('[name="vcotype_radio_global"]:checked').val() == 1) {
                oneLineVCOUser = true;
            } else if ($('[name="vcotype_radio_global"]:checked').val() == "2" || $('[name="vcotype_radio_global"]:checked').val() == 2) {
                twoLineVCOUser = true;
            }
            JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].OneLineVCO = oneLineVCOUser;
            JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCOUser = twoLineVCOUser;
            var tempUpdateUserObj = {
                GUID: JAMBO_APP.activeUserAccount,
                VILanguage: $('[name=terplang_settings_radio]:checked').val().charAt(0).toUpperCase() + $('[name=terplang_settings_radio]:checked').val().slice(1),
                AnnounceVRS: annouceVRS,
                OneLineVCO: oneLineVCOUser,
                VCOUser: twoLineVCOUser,
                VCONumber: $('#vconumber_global').val(),
                VCOExt: $('#vcoext_global').val()
            };
            JAMBO_APP.WebServices.updateUser(tempUpdateUserObj);
            
            $('#vconumber').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCONumber);//PNG-1015 KTRUMBLE 05012013 - update general settings when the numbers are saved
            $('#vcoext').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCOExt);//PNG-1015 KTRUMBLE 05012013 - update general settings when the numbers are saved
            $('#vcotype_toggle').buttonset("refresh");
            $('#vcotype_toggle_global').buttonset("refresh");
            $("#saveCallSettings .save").fadeOut(1200);
            setTimeout(function () { $("#saveCallSettings .save").fadeIn(1200); }, 3000);
        }
    });
    $('#savePVG').unbind('click').click(function () {
        JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].AnsweringMachineGreeting = $('#pvg_voice_greeting').val();
        var PVG_default = ($('#pvg_voice_greeting_default').attr('checked')) ? true : false;
        if (PVG_default == true) {
            JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].UseDefaultGreeting = PVG_default;
            JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].AnsweringMachineGreeting = '';
            $('#pvg_voice_greeting').val('Hello, this is the Purple Video Relay Service. I am Sign Language Interpreter ____. One moment while I connect you to ' + $('#footer_user_name').text() + '.');
        }
        var tempUpdateUserObj = {
            GUID: JAMBO_APP.activeUserAccount,
            UseDefaultGreeting: PVG_default,
            AnsweringMachineGreeting: JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].AnsweringMachineGreeting
        };
        JAMBO_APP.WebServices.updateUser(tempUpdateUserObj);

        $("#savePVG .save").fadeOut(1200);
        setTimeout(function () { $("#savePVG .save").fadeIn(1200); }, 3000);
    });
    $('#saveEmailPassword').click(function () {
        //WKRASKO 051713 - PNG-1129. Making things consistent, general code improvements. Also, need to hide errors on retry!
        $('#pi_email_invalid').hide();
        $('#pi_pword_invalid').hide();
        //PNG-1115 KTRUMBLE 05022013 - update the verification process for this section to match purple.us
        var err = false,pErr = false,pMsg = '';
        if ($('#ep_email').val() == '' || ($('#ep_email').val() != '' && !isValidEmailAddress($('#ep_email').val()))) {
            $('#pi_email_invalid').html(_i18n_.get("GUI_SETTINGS_INVALIDEMAIL_PI"));
            $('#pi_email_invalid').show().delay(3000).fadeOut(500,function(){ $('#pi_email_invalid').html(''); });//PNG-1148 KTRUMBLE 05232013 - error messages should fade after 3 seconds
            $('#ep_email').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","white")});
            err=true;
        }
        if ($('#ep_password_new').val() != $('#ep_password_confirm').val()){
            pMsg=_i18n_.get("GUI_CP_ERROR_NEW_MATCH");
            pErr=true;
        } else if (($('#ep_password_new').val()!='' && $('#ep_password_confirm').val()!='') && !checkPurplePass($('#ep_password_new').val())){
            pMsg=_i18n_.get("GUI_CP_ERROR_NEW_RESTRICTIONS");
            pErr=true;
        }
        if(pErr){
            $('#ep_password_new').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","white")});
            $('#ep_password_confirm').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","white")});
            $('#pi_pword_invalid').html(pMsg);
            $('#pi_pword_invalid').show().delay(3000).fadeOut(500,function(){ $('#pi_pword_invalid').html(''); });//PNG-1148 KTRUMBLE 05232013 - error messages should fade after 3 seconds
            err=true;
        }
        if(!err){
            var emailTMP = $('#ep_email').val();
            if (emailTMP == '') emailTMP = JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].EmailAddress;
            var newPass = $('#ep_password_new').val(),successMsg='',successTitle='';
            var userObj = { GUID: JAMBO_APP.activeUserAccount, EmailAddress: emailTMP };
            if($('#ep_password_new').val()!='' && $('#ep_password_confirm').val()!='') userObj.Password=newPass;
            JAMBO_APP.WebServices.updateUser(userObj, function () {
                if(newPass!=''){
                    JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].Password = newPass;
                    $('#loginPassword').val(newPass);
                    var username = $('#startupMask #signin #loginUsername').val();
                    applicationSettings.logins[username].password = Base64.encode(newPass);
                    __thisWindowProxy__.setApplicationSettings(applicationSettings);
                    $('#ep_password_new').val('');
                    $('#ep_password_confirm').val('');
                    successMsg=_i18n_.get("GUI_CEP_SUCCESS");
                    successTitle=_i18n_.get("GUI_DESKTOP_PROFILE_MENU_CHANGE_EMAILPASS");
                } else {
                    successMsg=_i18n_.get("GUI_CE_SUCCESS");
                    successTitle=_i18n_.get("GUI_DESKTOP_PROFILE_MENU_CHANGE_EMAIL");
                }
                JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].EmailAddress = $('#ep_email').val();
                openMessagePopup('#messagePop', successTitle, successMsg, _i18n_.get("COMMON_OK"), false, function () {
                    $('#messageOK').removeClass('purpleOK');
                });
                $('#messageOK').addClass('purpleOK');

                $("#saveEmailPassword .save").fadeOut(1200);
                setTimeout(function () { $("#saveEmailPassword .save").fadeIn(1200); }, 3000);
            });
        }
    });
    $('#saveEmailNotification').unbind('click').click(function () {
        var save = true;
        var vmEmailAddy = $('#vmNotificationEmail').val();
        var icEmailAddy = $('#icNotificationEmail').val();
        
        //WKRASKo 051713 - PNG-1129, consistent errors.
        $('#pe_email_invalid').hide();
        if (vmEmailAddy != '') {
            if (!validEmailReg.test(vmEmailAddy)) {
                $('#vmNotificationEmail').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","white")});
                save = false;
            }
        }
        if (icEmailAddy != '') {
            if (!validEmailReg.test(icEmailAddy)) {
                $('#icNotificationEmail').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","white")});
                save = false;
            }
        }
        if (save) {
            JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VMEmailAddress = vmEmailAddy;
            JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].NotifyEmailAddress = icEmailAddy;
            var tempUpdateUserObj = {
                GUID: JAMBO_APP.activeUserAccount,
                //NotifyCall: icEmail,
                VMEmailAddress: vmEmailAddy,
                //VideoEmail: vmEmail,
                NotifyEmailAddress: icEmailAddy
            };
            JAMBO_APP.WebServices.updateUser(tempUpdateUserObj);

            $("#saveEmailNotification .save").fadeOut(1200);
            setTimeout(function () { $("#saveEmailNotification .save").fadeIn(1200); }, 3000);
        } else {
            $('#pe_email_invalid').html(_i18n_.get("GUI_SETTINGS_INVALIDEMAIL_PI"));
            $('#pe_email_invalid').show().delay(3000).fadeOut(500,function(){ $('#pe_email_invalid').html(''); });//PNG-1148 KTRUMBLE 05232013 - error messages should fade after 3 seconds
        }
    });
}

updateE911 = function(result){
    $('#editE911Working').hide();
    $('#addressSuggestions').empty();
    if( result.ResultCode!="OK" && (!isDefined(result.AddressSuggestions) || result.AddressSuggestions.length<1) ){
        //For now, just show error from WS
        openMessagePopup('#errorPop', result.ResultCode, result.ResultMessage, _i18n_.getHTML("COMMON_OK"), false, function(){ $('#editE911Table').show();repositionPopUpEnvironment('#editE911Pop'); });
        enableE911Verify();
    } else {
        if(isDefined(result.AddressSuggestions) && result.AddressSuggestions.length>0){
            //We got suggestions, generate suggsions
            for(var i=0; i<result.AddressSuggestions.length; i++){
                var tempEntry = {
                    "choiceid":i,"choice_type":(result.AddressSuggestions[i].AddressIsHomeOrWork=="H"?"Home":"Work"),
                    "choice_address1":result.AddressSuggestions[i].Street1,"choice_address2":result.AddressSuggestions[i].Street2,
                    "choice_city":result.AddressSuggestions[i].City,"choice_state":result.AddressSuggestions[i].State,
                    'choice_zip':result.AddressSuggestions[i].Zip};
                $.tmpl(JAMBO_APP.e911SuggestionRowDesktop, tempEntry).appendTo('#addressSuggestions');
            }
            
            $('#editE911Table').hide();
            $('#addressSuggestionsWrapper').show();
            repositionPopUpEnvironment('#editE911Pop');
            enableE911Verify();
        } else {
            //We successfully saved, hide everything
            $('#editE911Cancel').click();
        }
    }
}

removeUserAccount = function(){
    delete applicationSettings.logins[$('#loginUsername').val()];
    __thisWindowProxy__.setApplicationSettings(applicationSettings);
    $('#loginUsername').val('');
    $('#loginPassword').val('');//WKRASKO 101812 - PNG-493
    loadSavedCredentials(applicationSettings);
}

fillE911 = function(result){
    JAMBO_APP.e911Object = result;
    if(result.ResultCode == "OK"){
        $('#e911_fname').val( JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].FirstName );
        $('#e911_fname_static').html( JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].FirstName );
        $('#e911_lname').val( JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].LastName );
        $('#e911_lname_static').html( JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].LastName );
        $('#e911_address').val(result.E911Address.Street1);
        $('#e911_address_static').html(result.E911Address.Street1);
        $('#e911_address2').val(result.E911Address.Street2);
        $('#e911_address2_static').html(result.E911Address.Street2);
        $('#e911_city').val(result.E911Address.City);
        $('#e911_city_static').html(result.E911Address.City);
        $('#e911_zip').val(result.E911Address.Zip);
        $('#e911_zip_static').html(result.E911Address.Zip);
        $('#e911_zip').mask('99999');
        $('#e911_state').val(result.E911Address.State);
        $('#e911_state_static').html(result.E911Address.State);
        $('#e911_dob').val('');
    }
}

openInputPop = function(title, content, maskOpacity, closeCallback, closeButtonText){
    hideEmbeddedVideoComposer();
    if (typeof maskOpacity === 'undefined') { maskOpacity = 0.7; }
    if(maskOpacity!=0.7)
        $('#popDiv').css('opacity',maskOpacity);
    if(isDefined(title))
        $('#inputLabel').html(title);
    if(isDefined(content))
        $('#inputContent').html(content);
    if(isDefined(closeButtonText))
        $('#inputOK').html(closeButtonText);
    else
        $('#inputOK').text(_i18n_.get("COMMON_OK"));
    $('#popDiv').show();
    $('#inputPop').show();
    $('#inputPop #inputContent').css('max-height', $(window).height()-300 );
    repositionPopUpEnvironment('#inputPop');
    $('#inputPop').find(".close.handler").bind('click', function(event){        
        if (isDefinedAsFunction(closeCallback)) { closeCallback('#inputPop', event); }
    });
}

closeInputPop = function() {   
    $('#inputPop').hide();
    $('#popDiv').hide();
    $('#inputPop').find(".close.handler").unbind('click');
    $('#inputContent').css('text-align','left');
    showEmbeddedVideoComposer();
}

openLoadingAnim = function(){
    hideEmbeddedVideoComposer();//WKRASKO 121812 - PNG-800
    repositionPopUpEnvironment('#loadingAnim');
    $('#popDiv').show();
    $('#loadingAnim').show();
}

closeLoadingAnim = function(){
    $('#popDiv').hide();
    $('#loadingAnim').hide();
    showEmbeddedVideoComposer();//WKRASKO 121812 - PNG-800
}

mainAdjust = function(){
    //$('#mainContent').css('border-left','1px solid #363535');
    $(window).resize();
}

drawFavs=function(selectFav){
    $("#favoritesList").empty();
    if (typeof selectFav === 'undefined') { selectFav = ''; }
    var theFavs = JAMBO_APP.ContactList.getFavorites();

    if (JAMBO_APP.ContactList.sortBy == 'FirstName') 
        theFavs = theFavs.sortOn("FirstName", "LastName");
    else 
        theFavs = theFavs.sortOn("LastName", "FirstName");

    $.each(theFavs, function(key,value){
        
        //PNG-475 KTRUMBLE 10012012 - update row hover state
        var evenodd = (key%2==0)?'even':'odd';
        var topBorder = ' dn';
        var theType = (theFavs[key].type!=null)?theFavs[key].type:'';
        var favNumID = theFavs[key].numID;
        var contactID = theFavs[key].contactID;
        var selectedClass = '',shortNameClass='',longNameClass='',theName='';
        var theFirstName = theFavs[key].FirstName;
        var theLastName = theFavs[key].LastName;
        var displayName = "";//PNG-655 KTRUMBLE 11022012 - single apostrophies entered into names breaks the dial call
        if(theFirstName!='' && theLastName==''){
            shortNameClass=' dn';
            theName=theFirstName;
        } else if(theFirstName=='' && theLastName!=''){
            shortNameClass=' dn';
            theName=theLastName;
        } else {//PNG-655 KTRUMBLE 11022012 - single apostrophies entered into names breaks the dial call
            longNameClass=' dn';
            theName=theFirstName+' '+theLastName;
        }
        //PNG-655 KTRUMBLE 11022012 - single apostrophies entered into names breaks the dial call,PNG-814 KTRUMBLE - swapping out 'search' for 'indexOf'
        if(theName.indexOf("'") != -1){
            while(theName.indexOf("'") != -1){
                theName=theName.replace("'","|apos|");
            }
        }
        displayName=theName;//END PNG-655/PNG-814
        
        if(key===selectFav){
            selectedClass = ' favSel';
        }
        if(key!=0) topBorder='';
        var formattedNum = theFavs[key].value;
        //WKRASKO 122012 - let's make formatting more robust here
        var checkNum = validateDialString(formattedNum);
        if(checkNum.type=="10d")
            formattedNum = format10D(formattedNum);
        else if(formattedNum.indexOf(":")==-1){
            var tempCheckNum = formattedNum.split("@")[0];
            //WKRASKO 111912 - PNG-595 tweaks
            if(validateDialString(tempCheckNum).type=="10d"){
                formattedNum = format10D(validateDialString(tempCheckNum).dialString);
            } else if(validateDialString(tempCheckNum.substring(1)).type=="10d"){
                formattedNum = format10D(validateDialString(tempCheckNum.substring(1).dialString));
            }
        }
        if(!isDefined(formattedNum)) formattedNum = theFavs[key].value;
        var tempEntry = {
            "custom_classes":selectedClass,"id":theFavs[key].value,"number":formattedNum,
            "first_name":theFirstName,"last_name":theLastName,"num_type":theType,'theName':theName,
            "contactid":contactID,"numID":favNumID,'longNameClass':longNameClass,
            'shortNameClass':shortNameClass,"evenodd":evenodd,"topBorder":topBorder,
            "displayName":displayName};//PNG-655 KTRUMBLE 11022012 - single apostrophies entered into names breaks the dial call
       $.tmpl(JAMBO_APP.ContactList.favoriteItemTemplateDesktop, tempEntry).appendTo('#favoritesList');//PNG-886 KTRUMBLE 02282013
    });
    $('#favoritesList .recordEditBtn').unbind('click').bind('click',function(event){
        currentEditContact = $(this).data('cid');
        event.stopPropagation();
        popEditContact(currentEditContact);
    });
    //PNG-475 KTRUMBLE 10012012 - update row hover state
    //PNG-1053 KTRUMBLE 04022013 - update favorites to use global contactEditMenu
    $('.favorite').hover(
        function(){
            var id = $(this).attr('id').split('_')[1];
            var contactID = JAMBO_APP.ContactList.getContactByNumber(id);
            $('#hr_'+id).css('border-top','1px solid #979797');
            $('#hr_'+id).css('border-bottom','0px');
            event.stopPropagation();
            clearTimeout(recordEditMenuTimeout);
            recordEditMenuTimeout = null;
            $('#contactRecordEditMenu').data('contactRecordEditMenu', contactID);
            $('#rem_contact_luNumber').data('lookupnumber', id);
            $('#rem_contact_luNumber').data('editMenu', contactID);
            var newTop = $('#fav_' + id).offset().top;
            if ($('#fav_' + id).offset().top < $('#favoritesList').offset().top)
                newTop = $('#fav_' + id).offset().top + $('#fav_' + id).height() - $('#contactRecordEditMenu').height();
            newTop = newTop - 34;
            var editMenuRight = ($('#favoritesList').hasScrollBar())?16:0;
            $('#contactRecordEditMenu').css({ 'top': newTop, 'right': editMenuRight });
            $('#contactRecordEditMenu').removeClass('dn');
        },
        function(){
            var id = $(this).attr('id').split('_')[1];
            $('#hr_'+id).css('border-top','0px');
            $('#hr_'+id).css('border-bottom','1px solid whiteSmoke');
            if (recordEditMenuTimeout == null)
                recordEditMenuTimeout = setTimeout(function () {
                    $('#contactRecordEditMenu').addClass('dn');
                    recordEditMenuTimeout = null;
                }, 250);
        }
    );
    //END PNG-1053
    //END PNG-475
    $(window).resize();
}

drawPurpleMail=function(msgObj){
    $('#purpleMailMessages').empty();
    var unreadCount = 0;
    var FirstPM=' dn';
    if(msgObj!=null && msgObj.length>0){
        $.each(msgObj, function(i,v){
            if(!msgObj[i].Read) unreadCount++;
            msgObj[i].SenderNumber=msgObj[i].SenderNumber.replace(/[\(\) .-]/g,'');
            var favclass="no";
            var PMNumType = null;//KTRUMBLE 09242012 PNG-401 - fixing type, is looking for null below, not a string (ie: 'null')
            var PMName = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG");
            var PMReadState = null;
            var showAddContactBtn = 'recordEditButton recordEditButton_redux';
            var senderNumber = ''; //PNG-96 | PNG-97 KTRUMBLE 07202012
            var cid = null;
            switch(msgObj[i].Read){
                case true:PMReadState='pmRead';break;
                case false:PMReadState='pmUnread';break;
                case 'partial':PMReadState='pmPartiallyRead';break;
                default:break;
            }
            var theFirstName = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG").split(' ')[0], theLastName = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG").split(' ')[1];
            var longNameClass='',shortNameClass='',theName='';
            var evenodd = (i%2==0)?'even':'odd';//PNG-475 KTRUMBLE 10012012 - update row hover state
            //if thisPM exists in the contacts list
            var addUser = '';
            if(JAMBO_APP.ContactList.contactExists(msgObj[i].SenderNumber)){
                favclass = (JAMBO_APP.ContactList.isFavoriteByNumber(msgObj[i].SenderNumber)) ? "" : "no";
                PMNumType = JAMBO_APP.ContactList.numberTypeByNumber(msgObj[i].SenderNumber);
                PMNumType = (PMNumType==null)?'':PMNumType;//KTRUMBLE 09242012 PNG-401 - display nothing for numbers have a null type
                PMName = JAMBO_APP.ContactList.contactNamesByNumber(msgObj[i].SenderNumber);
                cid = JAMBO_APP.ContactList.getContactByNumber(msgObj[i].SenderNumber);
                if(PMName!=null){
                    theFirstName = PMName[0];
                    theLastName = PMName[1];
                    PMName = PMName[0]+' '+PMName[1];
                }
                if(theFirstName!='' && theLastName==''){
                    shortNameClass=' dn';
                    theName=theFirstName;
                } else if(theFirstName=='' && theLastName!=''){
                    shortNameClass=' dn';
                    theName=theLastName;
                } else longNameClass=' dn';
            } else {
                shortNameClass=' dn';
                theName=PMName;
                addUser=' contactAddBtn';
            }

            //set date display
            var dateTime = new Date(msgObj[i].Date);
            var dateTime_date = dateTime.format("M d");
            //WKRASKO 121712 - PNG-793, spanish months in history.
            if(applicationSettings.language=="es_ES"){
                //PNG-793 KTRUMBLE 01282013 - day string wasn't correctly set, using js format function instead
                dateTime_date = enToEsMonthMap[dateTime_date.toString().substr(0,3)]+' '+dateTime.format("d");
            }
            var dateTime_time = dateTime.format("h:i A");
            dateTime_time = (dateTime_time.charAt(0)==0)?dateTime_time.substring(1):dateTime_time;
            
            if(i!=0)FirstPM=''; //this simply hides the first hortizontal line in the tmpl
            if(PMName==_i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG")) showAddContactBtn = 'recordEditButton recordEditButton_redux';
            senderNumber = msgObj[i].SenderNumber;//PNG-96 | PNG-97 KTRUMBLE 07202012
            //enable pmavailable icons
            if($('#contactPM_'+senderNumber).length!=0){//WKRASKO 120512 - Quick fix, cant determine if element exists just by jquery, have to check length
                $('#contactPM_'+senderNumber).removeClass('pmAvailableIcon_off');
                $('#contactPM_'+senderNumber).addClass('pmAvailableIcon');
            }
            if($('#favoritePM_'+senderNumber).length!=0){//WKRASKO 120512 - Quick fix, cant determine if element exists just by jquery, have to check length
                $('#favoritePM_'+senderNumber).removeClass('pmAvailableIcon_off');
                $('#favoritePM_'+senderNumber).addClass('pmAvailableIcon');
            }
            //KTRUMBLE 09242012 PNG-460 - the client should show a "no preview" image if no preview image is available
            var thumbPreviewPath = (msgObj[i].Preview!=null)?msgObj[i].Preview:'img/no_thumb.png';
            var formattedNum = senderNumber;
            if(sipPhonePurpReg.test(formattedNum))
                formattedNum = format10D(formattedNum);
            //console.log('PMMSG'+i+': '+msgObj[i].Path);//PNG-811 - adding output for investigation
            //console.log('PMTHUMB'+i+': '+thumbPreviewPath);//PNG-811 - adding output for investigation
            var tempEntry = {
                "favClass":favclass,"showAddContactBtn":showAddContactBtn,"readState":PMReadState,
                "PMID":msgObj[i].ID,"FirstPM":FirstPM,"PMPath":msgObj[i].Path,"PMNumType":PMNumType,
                "PMSender":formattedNum,"PMName":theName,"PMTime":dateTime_time,
                'first_name':theFirstName,'last_name':theLastName,'shortNameClass':shortNameClass,
                'longNameClass':longNameClass,'thumb_path':thumbPreviewPath,"PMDate":dateTime_date,
                'senderNumber':senderNumber,'dateTime':msgObj[i].Date,"evenodd":evenodd,"cid":cid,
                'addUser':addUser
            };
            //populate pm array for sorting
            var isFav = (favclass=='no')?false:true;
            JAMBO_APP.PurpleMail.setIsFav(msgObj[i].ID,isFav);
            JAMBO_APP.PurpleMail.setType(msgObj[i].ID,PMNumType);
            JAMBO_APP.PurpleMail.setFirstName(msgObj[i].ID,theFirstName);
            JAMBO_APP.PurpleMail.setLastName(msgObj[i].ID,theLastName);
            if(i==0) $('#pmThumbMask_tmb').html('<img src="'+thumbPreviewPath+'" width="100" />');
            //WKRASKO 120512 - PNG-634, removing this condition, see comments in ticket for why.
            //if(!JAMBO_APP.BlockedNumbers.isBlocked(senderNumber))//PNG-634 KTRUMBLE 10312012 - history, pm will no longer show blocked contacts
                $.tmpl(JAMBO_APP.PurpleMail.pmDivDesktop, tempEntry).appendTo('#purpleMailMessages');
        });
    } else {
        //KTRUMBLE 08132012 - PNG-327: this should output the 'no messages' message if no messages present
        $('#purpleMailMessages').html('<div id="noMsg"><span class="noMsgInner i18n" data-i18n_key="GUI_PM_NOMESSAGES">'+_i18n_.getHTML("GUI_PM_NOMESSAGES")+'</span></div>');
    }
    $('#pmViewGreetingBtn').unbind('click').click(function(){
        JAMBO_APP.PurpleMail.viewGreeting(JAMBO_APP.activeUserAccount);
    });
    $('#pmDeleteAllBtn').unbind('click').click(function(){//PNG-99 KTRUMBLE 07242012
        if(JAMBO_APP.PurpleMail.getPMMessages().length>=1){
            openMessagePopup('#messagePop',_i18n_.get("GUI_CFG_CALLING_CLEAR_PM"),_i18n_.get("MSG_WARN_DELETE_ALL_PM"),_i18n_.get("COMMON_CONFIRM"),true,function(){deleteAllPMs();$('#messagePop #messageCancel').text(_i18n_.get("COMMON_CANCEL"));});//PNG-430 KTRUMBLE 09142012
            $('#messagePop #messageCancel').text('No');//PNG-430 KTRUMBLE 09142012
        }
    });
    $('#pmResetGreetingBtn').unbind('click').click(function(){
        openMessagePopup('#messagePop',_i18n_.get("GUI_PM_BUTTON_RESET"),_i18n_.get("MSG_WARN_RESET_PM"),_i18n_.get("COMMON_CONFIRM"),true,function(){ JAMBO_APP.WebServices.pmResetWelcomeMessage(JAMBO_APP.activeUserAccount); });
    });
    $('#pmChangeGreetingBtn').unbind('click').click(function(){
        $('#CallBtn').click();
        initCallFromDialString(JAMBO_APP.PurpleMail.getSelfRecordURL(),'Record PurpleMail Message','dns');
    });
    $('#purpleMailMessages .recordEditButton').unbind('click').bind('click',function(event){
        currentEditContact = $(this).data('cid');
        event.stopPropagation();
        if($(this).hasClass('contactAddBtn')){
            popAddContact();
            $('.phone_input').val($(this).data('pmsender')); // PNG-269 KTRUMBLE 07302012
        } else {
            popEditContact(currentEditContact);
        }
    });
    $('#purpleMailMessages .pmDeleteBtn').unbind('click').bind('click',function(event){
        event.stopPropagation();
        JAMBO_APP.PurpleMail.PMMID = $(this).data('pmid'); //PNG-327 KTRUMBLE 08132012 need to make sure PMMID is up-to-date prior to trying to delete
        openMessagePopup('#messagePop',_i18n_.get("COMMON_DELETE_PM"),_i18n_.get("MSG_WARN_DELETE_PM"),_i18n_.get("COMMON_CONFIRM"),true,deletePMMessage);
    });
    $('.pmSender').unbind('click').click(function(event){
        event.stopPropagation();
        var displayName = JAMBO_APP.ContactList.contactNameByNumber($(this).data('senderNumber'));
        if(displayName==null)
            displayName = $(this).data('senderNumber');
        console.log("Calling 10D: "+$(this).data('senderNumber')+" Display name: "+displayName);
        var validDialString=validateDialString( $(this).data('senderNumber').toString() );
        initCallFromDialString( validDialString.dialString, displayName, validDialString.type );
    });
    $('.pmPlayIcon').unbind('click').click(function(){//PNG-96 | PNG-97 KTRUMBLE 07202012
        var msgID = $(this).data('pmControlID');
        var dateTime = $(this).data('pmDateTime');
        JAMBO_APP.PurpleMail.pmUpdateID = msgID;
        var thisNumber = $(this).data('pmSender');
        var isUnread = $(this).hasClass('pmUnread'); //PNG-284 KTRUMBLE 08142012 - moving the 'hasClass' target
        //isUnread = findClass($(this).attr('class').split(' '),'pmUnread');//hasClass was always returning false, so I was inspecting the class names manually...now it works, leaving this in place JIC
        displayName=_i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG");
        // PNG-284 KTRUMBLE 08012012
        if(isUnread) JAMBO_APP.WebServices.updatePMStatus(JAMBO_APP.activeUserAccount, msgID, 'Read', JAMBO_APP.PurpleMail.pmStatusUpdateSuccess, JAMBO_APP.PurpleMail.pmStatusUpdateFail);
        
        if(JAMBO_APP.ContactList.contactExists(thisNumber))
            displayName=JAMBO_APP.ContactList.contactNameByNumber(thisNumber);
        if (navigator.appVersion.indexOf("Win")!=-1) openPurpleMailViewer('PMM',JAMBO_APP.PurpleMail.getPMMessage(msgID).Path,displayName,msgID);
        else if (navigator.appVersion.indexOf("Mac")!=-1) {
            __thisWindow__.openInSystemBrowser('file:///'+createPMFile(displayName,dateTime,format10D(thisNumber.toString()),JAMBO_APP.PurpleMail.getPMMessage(msgID).Path));
        }
    });
    $('.pmAvailableIcon').unbind('click').click(function(){
        var thisID = $(this).data('pmID');
        var pmData = JAMBO_APP.PurpleMail.getPMMessages();
        var displayName = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG");
        $.each(pmData,function(i){
            if(pmData[i].ID==thisID){
                var senderNumber = pmData[i].SenderNumber;
                if(JAMBO_APP.ContactList.contactExists(senderNumber)){
                    displayName=JAMBO_APP.ContactList.contactNameByNumber(senderNumber);
                }
                if (navigator.appVersion.indexOf("Win")!=-1) openPurpleMailViewer('PMM',JAMBO_APP.PurpleMail.getPMMessage(thisID).Path,displayName,thisID);
                else if (navigator.appVersion.indexOf("Mac")!=-1) {
                    __thisWindow__.openInSystemBrowser('file:///'+createPMFile(displayName,pmData[i].Date,format10D(senderNumber.toString()),JAMBO_APP.PurpleMail.getPMMessage(thisID).Path));
                }
                if($('#readState_'+thisID).hasClass('pmUnread')){ //PNG-359 KTRUMBLE 09042012 - turn off 'unread' marker and update WS
                    JAMBO_APP.PurpleMail.pmUpdateID = thisID;
                    JAMBO_APP.WebServices.updatePMStatus(JAMBO_APP.activeUserAccount, thisID, 'Read', JAMBO_APP.PurpleMail.pmStatusUpdateSuccess, JAMBO_APP.PurpleMail.pmStatusUpdateFail);
                }
                return false;
            }
        });
    });
    //PNG-475 KTRUMBLE 10012012 - update row hover state
    $('.pmNum').hover(
        function(){
            var id = $(this).attr('id').split('_')[1];
            $('#hr_'+id).css('border-top','1px solid #979797');
            $('#hr_'+id).css('border-bottom','0px');
        },
        function(){
            var id = $(this).attr('id').split('_')[1];
            $('#hr_'+id).css('border-top','0px');
            $('#hr_'+id).css('border-bottom','1px solid whiteSmoke');
        }
    );
    $('.pmSender').hover(
        function(){
            var id = $(this).data('cnID');
            var thisReadStateDiv = $('#pmItem_'+id+' div.pmNum div.fl div.readState');
            var theClasses = thisReadStateDiv.attr('class').toString().split(' ');
            $.each(theClasses,function(k,v){
                if(theClasses[k].search('pmRead')!=-1 || theClasses[k].search('pmUnread')!=-1 || theClasses[k].search('pmPartiallyRead')!=-1){
                    thisReadStateDiv.removeClass(theClasses[k]);
                    thisReadStateDiv.addClass(theClasses[k]+'_on');
                }
            });
        },
        function(){
            var id = $(this).data('cnID');
            var thisReadStateDiv = $('#pmItem_'+id+' div.pmNum div.fl div.readState');
            var theClasses = thisReadStateDiv.attr('class').toString().split(' ');
            $.each(theClasses,function(k,v){
                if(theClasses[k].search('pmRead')!=-1 || theClasses[k].search('pmUnread')!=-1 || theClasses[k].search('pmPartiallyRead')!=-1){
                    thisReadStateDiv.removeClass(theClasses[k]);
                    thisReadStateDiv.addClass(theClasses[k].split('_on')[0]);
                }
            });
        }
    );
    $('.pmLCol').width(parseInt($('#contentDiv').width())-parseInt($('#leftNav').width())-605);
    //END PNG-475
    $('.pmItem').hover(
        function(){//PNG-574 KTRUMBLE 10172012 - adjust/enable PM Thumb mask: the new PM structure broke the below hover code
            var thisID = $(this).attr('id');
            $('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs div.pmThumb').hide();
            $('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs div.pmLgThumb').removeClass('dn');
            $('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs').css('z-index','600');
            
            var thumbTop = $('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs div.pmLgThumb').offset().top;
            var tmbPath = $('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs div.pmLgThumb img').attr('src');
            $('#pmThumbMask_tmb img').attr('src',tmbPath);
            var maskThumbTop = 15;
            if(thumbTop<=146) maskThumbTop = maskThumbTop-(146-thumbTop);
            else maskThumbTop = maskThumbTop+(thumbTop-146);
            $('#pmThumbMask_tmb').css('top','0px');
            $('#tmbPlayControl').css('margin-top',parseInt(maskThumbTop+14)+'px');
            //WKRASKO 120512 - PNG-628, have to adjust on the fly, since pmLCol adjusts width on the fly
            $('#pmThumbMask').css('left',($('.pmLgThumb').offset().left-$('#leftNav').width()-13));
            $('#purpleMail div#pmThumbMask').removeClass('dn');
        },
        function(){
            var thisID = $(this).attr('id');
            $('#purpleMail div#pmThumbMask').addClass('dn');
            $('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs div.pmThumb').show();
            $('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs div.pmLgThumb').addClass('dn');
            $('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs').css('z-index','5');
        }
    );
    //WKRASKO 102912 - PNG-434, moved pmPlayControl visibility from above hover to next 2, so it only shows when hovering on the large thumb.
    $('.pmLgThumb').hover(
        function(){
            var thisID = $(this).data('pmItemID');
            if( $('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs div.pmPlayControl').hasClass('dn') )
                $('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs div.pmPlayControl').removeClass('dn');
        },
        function(){
            var thisID = $(this).data('pmItemID');
            if( !$('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs div.pmPlayControl').hasClass('dn') )
                $('#'+thisID+' div.pmNum div.fl div.pmRCol div.pmTmbs div.pmPlayControl').addClass('dn');
        }
    );
    $('.pmPlayControl').hover(
        function(){
            if( $(this).hasClass('dn') )
                $(this).removeClass('dn');
        },
        function(){
            if( !$(this).hasClass('dn') )
                $(this).addClass('dn');
        }
    );
    $('#unreadPMCount').text(unreadCount);
    if( unreadCount>0 ){
        $('#PurpleMailBtn div.lNavContent div#unreadPMCount').css({'background-color':'#896b9c'});
        if(getFlasher()!="")
            __thisWindowProxy__.startNotificationPlayback(getFlasher(), "wav/solid.wav", true);//WKRASKO 103012 - PNG-601
    }else{
        $('#PurpleMailBtn div.lNavContent div#unreadPMCount').css({'background-color':'#868686'});
        if(getFlasher()!="")
            __thisWindowProxy__.stopNotificationPlayback(getFlasher(), "wav/solid.wav");
    }
    //WKRASKO 111912 - PNG-638, hack for webkit draw issue. Includes corrections to set content width function.
    $(window).resize();
}

deleteAllPMs=function(){
    var pmMessages = JAMBO_APP.PurpleMail.getPMMessages();
    JAMBO_APP.PurpleMail.deleteCount = pmMessages.length;
    JAMBO_APP.PurpleMail.deleteInProgress=true;
    $.each(pmMessages,function(i){
        JAMBO_APP.PurpleMail.deleteMessage(JAMBO_APP.activeUserAccount,pmMessages[i].ID);
    });
    $('.pmaIcon').removeClass('pmAvailableIcon');//PNG-295 KTRUMBLE 07022012
    $('.pmaIcon').removeClass('pmAvailableIcon_off');//so none of them have it when it's added on the next line
    $('.pmaIcon').addClass('pmAvailableIcon_off');
}

//WKRASKO 102912 - PNG-409, lots of changes here and around.
createPMFile=function(displayName,dateTime,thisNumber,pmUrl){
    var date=null, day=null, time=null, PMG='';
    if(displayName!='Greeting' && displayName!='emptyFile'){//PNG-1085 KTRUMBLE 04212013 - clear PM msg file on signout
        date = new Date(dateTime);
        day = date.format("M dS, Y");
        time = date.format("h:i A");
        time = (time.charAt(0)==0)?time.substring(1):time;
    } else if(displayName=='Greeting') {//PNG-1085 KTRUMBLE 04212013 - clear PM msg file on signout
        PMG = 'dn';
        dateTime='N/A';
        thisNumber=format10D(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].TenDigitNumber[0].Number);
    }
    var pmFilePath = __thisWindow__.getUserDataPath()+'PMVIEWER.html';//PNG-1085 KTRUMBLE 04262013 - moving purplemail viewer file to user directory from common app directory
    var pmContents = '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">\n\
        <head>\n\
        <meta http-equiv="Content-type" content="text/html;charset=UTF-8">\n\
        <style type="text/css">\n\
            * { font-family:verdana; }\n\
            body, div, p, span{ margin:0; padding:0; cursor:default; }\n\
            body { background-color:#e9e7e7; }\n\
            .dn { display:none; }\n\
            #pmMessage { width:450px; height:497px; margin:0 auto; }\n\
            #pmHeader { height:143px; width:100%; margin:0 0 24px 0; }\n\
            #purpleLogo { height:143px; width:133px; float:left; }\n\
            #pmClose { height:45px; width:47px; float:right; background:url("file://'+__thisWindow__.getResourcesPath()+'pmViewer_close.png") 0 0 no-repeat; cursor:pointer; margin-top:98px }\n\
            #pmClose:hover { background-position:0 0; }\n\
            #pmView { width:450px; height:420px; background-color:#fff; border:1px solid #fff; border-radius:4px; }\n\
            #pmInfo { width:100%; height:55px; background-color:#dbd8d8; border-bottom:1px solid #cdcbcb; border-top-right-radius:4px; border-top-left-radius:4px; }\n\
            #pmInfo * { font-family:verdana; color:#666; }\n\
            #senderName { font-size:20px; font-weight:bold; width:225px; margin:15px 10px 0 20px; float:left; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }\n\
            #senderInfo { font-size:10px; width:180px; margin:15px 15px 0 0; float:left; text-align:right; }\n\
            #pmContent { width:450px; min-height:240px; text-align:center; }\n\
            #pmFooter { width:100%; font-size:10px; color:#333333; text-align:right; margin-top:15px; }\n\
        </style>\n\
        <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js"></script>\n\
        <script type="text/javascript">\n\
            var parameters = {src: "'+encodeURIComponent(pmUrl)+'", autoPlay:"true"};\n\
            if(swfobject.hasFlashPlayerVersion("10.1.0")){\n\
                swfobject.embedSWF\n\
                    ( "'+__thisWindow__.getResourcesPath()+'StrobeMediaPlayback.swf"\n\
                    , "strobeMediaPlayback"\n\
                    , 450\n\
                    , 366\n\
                    , "10.1.0"\n\
                    , {}\n\
                    , parameters\n\
                    , { allowFullScreen: "true" }\n\
                    , { name: "strobeMediaPlayback" }\n\
                    );\n\
            } else {\n\
                var readyStateCheckInterval = setInterval(function() {\n\
                    if (document.readyState === "complete") {\n\
                        document.getElementById("strobeMediaPlayback").innerHTML = "<img src=\'pmViewer_noFlash.png\' border=\'0\' usemap=\'#getadobe\' />";\n\
                        clearInterval(readyStateCheckInterval);\n\
                    }\n\
                }, 10);\n\
            }\n\
        </script>\n\
        </head>\n\
        <body>\n\
            <div id="pmMessage">\n\
                <div id="pmHeader">\n\
                    <div id="purpleLogo"><img src="'+__thisWindow__.getResourcesPath()+'pmViewer_logo.png" /></div>\n\
                    <div id="pmClose" onclick="window.close()"></div>\n\
                </div>\n\
                <div id="pmView">\n\
                    <div id="pmInfo">\n\
                        <div id="senderName" title="'+displayName+'">'+displayName+'</div>\n\
                        <div id="senderInfo" class="'+PMG+'">'+day+' at '+time+'<br />'+thisNumber+'</div>\n\
                    </div>\n\
                    <div id="pmContent"><div id="strobeMediaPlayback"></div></div>\n\
                </div>\n\
                <div id="pmFooter">Help: 877-885-3172 | VRS: 877-467-4877</div>\n\
            </div>\n\
            <map name="getadobe"><area shape="rect" coords="142,228,300,270" href="http://get.adobe.com/flashplayer/?no_redirect" target="_blank" alt="Get Adobe"></map>\n\
        </body>\n\
        </html>';
    if(displayName=='emptyFile') pmContents='';//PNG-1085 KTRUMBLE 04212013 - clear PM msg file on signout
    __thisWindow__.writeTextFile(pmFilePath,pmContents,false);
    if(displayName!='emptyFile') return pmFilePath;
}

pmFlashCode = function(url){
    var pmFilePath = __thisWindow__.getResourcesPath().replace(/\\/gi,"/");
    var PMObj = '<object type="application/x-shockwave-flash" name="strobeMediaPlayback" data="'+pmFilePath+'StrobeMediaPlayback.swf" width="295" height="240" id="strobeMediaPlayback" style="visibility: visible; ">\n\
                    <param name="allowFullScreen" value="true">\n\
                    <param name="wmode" value="transparent">\n\
                    <param name="flashvars" value="src='+encodeURIComponent(url)+'&autoPlay=true">\n\
                </object>';
    return PMObj;
}

openPurpleMailViewer = function(popType,pmUrl,pmSender,pmID){
    if(pmUrl==null)
        return;
    var PMObj = '';
    var PMLabel = (pmSender!=null)?pmSender:'';
    if(PMLabel.length > 40)
        PMLabel = PMLabel.substring(0,40)+"...";
    if(popType=='PMM'){
        PMObj=pmFlashCode(pmUrl);
        JAMBO_APP.PurpleMail.PMMID=pmID;
        JAMBO_APP.PurpleMail.PMNum=pmSender;//PNG-295 KTRUMBLE 07022012
        openInputPop(_i18n_.get("GUI_PM_FROM_LABEL")+PMLabel,PMObj,0.9,function(){
            //WKRASKO 121712 - PNG-791
            $('#inputPop').hide();
            $('#popDiv').hide();
            $('#inputPop').find(".close.handler").unbind('click');
            $('#inputContent').css('text-align','left');
            setTimeout(function(){openMessagePopup('#messagePop',_i18n_.get("COMMON_DELETE_PM"),_i18n_.get("MSG_WARN_DELETE_PM"),_i18n_.get("COMMON_CONFIRM"),true,deletePMMessage)},100);
        },_i18n_.get('COMMON_DELETE_PM'));
        $('#inputContent').css('text-align','center');
    } else if(popType=='PMG'){
        PMObj=pmFlashCode(pmUrl);//WKRASKO 092012 - PNG-287, default path was ALWAYS being used, instead of users path
        openInputPop(_i18n_.get('GUI_PM_GREETING_LABEL'),PMObj,0.9,function(){
            closeInputPop();
            initCallFromDialString(JAMBO_APP.PurpleMail.getSelfRecordURL(),'Record PurpleMail Message','dns');
        },_i18n_.get('COMMON_CHANGE_GREETING'));
        $('#inputContent').css('text-align','center');
    }
    repositionPopUpEnvironment('#inputPop');
}

deletePMMessage = function(){
    JAMBO_APP.PurpleMail.deleteMessage(JAMBO_APP.activeUserAccount,JAMBO_APP.PurpleMail.PMMID);
}

setPMAvailableIcons = function(PMs){//PNG-295 KTRUMBLE 07022012
    //hide all icons first
    $('.pmaIcon').removeClass('pmAvailableIcon');
    $('.pmaIcon').addClass('pmAvailableIcon_off');
    //enable icons where necessary
    $.each(PMs,function(i){
        if($('#contactPM_'+PMs[i].SenderNumber)){
            $('#contactPM_'+PMs[i].SenderNumber).data('pmID',PMs[i].ID);
            $('#contactPM_'+PMs[i].SenderNumber).removeClass('pmAvailableIcon_off');
            $('#contactPM_'+PMs[i].SenderNumber).addClass('pmAvailableIcon');
        }
        if($('#favoritePM_'+PMs[i].SenderNumber)){
            $('#favoritePM_'+PMs[i].SenderNumber).data('pmID',PMs[i].ID);
            $('#favoritePM_'+PMs[i].SenderNumber).removeClass('pmAvailableIcon_off');
            $('#favoritePM_'+PMs[i].SenderNumber).addClass('pmAvailableIcon');
        }
    });
}

clearContactsTab=function(){
    $('#alphaUl').html('');
    $('#contacts').html('');
}

drawContactsTab = function () {
    var theSortName = null;
    var theContacts = JAMBO_APP.ContactList.getContacts();
    var theAlphas = {}, aIndex = 0;
    var p3tng_numType = '';
    var lastAlpha = null;
    var thisAlpha = null;
    var theID = null;
    var theNumbers = null;
    var theFirstName = "";
    var theLastName = "";
    var displayName = ""; //PNG-655 KTRUMBLE 11022012 - single apostrophies entered into names breaks the dial call
    //WKRASKO 051713 - PNG-1147, removing "long name" section. Not sure why we ever had it, the names should always remain in their own columns.
    //This long name thing was done in lots of other places, but at this point to not have too much change in one commit I'll remove on a case by case basis
    var theName = '';
    var favClass = 'no', contactWrapper = '';
    var blockClass = '', unblockClass = '';
    var isBlocked = false; //PNG-513 KTRUMBLE 10082012 - adjusting blocked callers functionality for new menus
    //Reset all binds. We now have to cover the case where user has no contacts!
    $('#contacts').unbind();
    $('#contactRecordEditMenu .recordEditBtn').unbind('click');
    $('#contactRecordEditMenu .recordEditButton').unbind('click');
    $('#contactSortSelect').unbind();

    if (theContacts != null && theContacts.length > 0) {
        $('#alphaContacts').show();
        //iterate contacts
        for (var key = 0; key < theContacts.length; key++) {
            theID = theContacts[key].ID;
            theNumbers = theContacts[key].Numbers;
            theFirstName = theContacts[key].FirstName;
            theLastName = theContacts[key].LastName;
            theName = '';
            favClass = 'no', contactWrapper = '';
            if (theID == '') theID = 'unknown_' + key;
            if (chatHistoryByID[theID]) hasTranscripts = true; //PNG-513 KTRUMBLE 10062012 - making some adjustments to the recordEditMenus (using a single menu, repurposed for each row, versus a menu for each row

            if (theFirstName != '' && theLastName == '') {
                theName = theFirstName;
            } else if (theFirstName == '' && theLastName != '') {
                theName = theLastName;
            } else {
                theName = theFirstName + ' ' + theLastName; //PNG-655 KTRUMBLE 11022012 - single apostrophies entered into names breaks the dial call
            }
            //PNG-655 KTRUMBLE 11022012 - single apostrophies entered into names breaks the dial call,PNG-814 KTRUMBLE - swapping out 'search' for 'indexOf'
            if (theName.indexOf("'") != -1) {
                while (theName.indexOf("'") != -1) {
                    theName = theName.replace("'", "|apos|");
                }
            }
            displayName = theName; //END PNG-655/PNG-814

            //if we don't find that the last item entered into theAlphas matches this one
            //create/place a container in the DOM for this alpha, then record it in the array
            if (JAMBO_APP.ContactList.sortBy == 'FirstName') theSortName = theFirstName;
            else theSortName = theLastName;
            thisAlpha = theSortName.charAt(0).toUpperCase();
            if (thisAlpha != theAlphas[aIndex - 1]) {
                theAlphas[aIndex] = thisAlpha;
                aIndex++;
            }
            //populate contacts
            var contactHeight = 40;
            var thisNumber = "";
            var evenodd = "";
            var topBorder = '';
            var formattedNum = "";
            var hasTranscripts = false;
            for (var k = 0; k < theNumbers.length; k++) {
                thisNumber = theNumbers[k].Number;
                evenodd = (key % 2 == 0) ? 'even' : 'odd';
                blockClass = (JAMBO_APP.BlockedNumbers.isBlocked(thisNumber)) ? ' dn' : '';
                unblockClass = (JAMBO_APP.BlockedNumbers.isBlocked(thisNumber)) ? '' : ' dn';
                isBlocked = JAMBO_APP.BlockedNumbers.isBlocked(thisNumber); //PNG-513 KTRUMBLE 10082012 - adjusting blocked callers functionality for new menus
                favClass = (theNumbers[k].IsFavorite) ? '' : 'no';
                p3tng_numType = JAMBO_APP.ContactList.typeLookupObject[theNumbers[k].TypeID];
                //determine multiline content height and set content
                if (k >= 1) {
                    contactHeight = parseInt((contactHeight * k) + 10);
                    theFirstName = '&nbsp;';
                    theLastName = '&nbsp;';
                    contactWrapper = ' cb';
                }
                topBorder = (k == 0 && thisAlpha == lastAlpha) ? '' : ' dn';

                formattedNum = thisNumber;
                //WKRASKO 122012 - let's make formatting more robust here
                var checkNum = validateDialString(formattedNum);
                if (checkNum.type == "10d")
                    formattedNum = format10D(formattedNum);
                else if (formattedNum.indexOf(":") == -1) {
                    var tempCheckNum = formattedNum.split("@")[0];
                    //WKRASKO 111912 - PNG-595 tweaks
                    if (validateDialString(tempCheckNum).type == "10d") {
                        formattedNum = format10D(validateDialString(tempCheckNum).dialString);
                    } else if (validateDialString(tempCheckNum.substring(1)).type == "10d") {
                        formattedNum = format10D(validateDialString(tempCheckNum.substring(1).dialString));
                    }
                }
                if(!isDefined(formattedNum)) formattedNum=thisNumber;

                if (chatHistoryByID[theID]) hasTranscripts = true;
                var tempEntry = {
                    "index": k, "id": theID, "number": formattedNum,
                    "first_name": theFirstName, "last_name": theLastName,
                    "num_type": (p3tng_numType == null) ? '' : p3tng_numType, "favClass": favClass,
                    "contactWrapper": contactWrapper, "dialNumber": thisNumber,
                    "numID": theNumbers[k].ID, "evenodd": evenodd, "topBorder": topBorder,
                    "displayName": displayName, "BlockClass": blockClass, "UnblockClass": unblockClass,
                    "hasTranscripts": hasTranscripts, "isBlocked": isBlocked//PNG-655 KTRUMBLE 11022012 - single apostrophies entered into names breaks the dial call
                };

                //if(!JAMBO_APP.BlockedNumbers.isBlocked(thisNumber)){//need to work out evenodd so alternating background is intact on not outputting a contact
                    if (theNumbers.length == 1) {
                        $.tmpl(JAMBO_APP.ContactList.contactItemTemplateDesktop, tempEntry).appendTo('#contacts');
                    } else if (theNumbers.length > 1) {
                        if (k == 0) $.tmpl(JAMBO_APP.ContactList.multilineContactItemTemplate, tempEntry).appendTo('#contacts');
                        $.tmpl(JAMBO_APP.ContactList.multilineContactItemWrapper, tempEntry).appendTo('#contactNumbers_' + theID);
                    }
                //}
            };

            lastAlpha = thisAlpha;
        };
        //reset the size of the viewing area
        $('#contacts').css('height', (parseInt($('#leftNav').height()) - 62) + 'px');

        $('#favoritesList .recordEditButton').bind('click', function (event) {
            currentEditContact = $(this).data('cid');
            event.stopPropagation();
            popEditContact(currentEditContact);
        });
        $('#contactSortSelect').change(function () {
            var checkSum = $('#contactSortSelect').val();
            if (checkSum == 0) {
                JAMBO_APP.ContactList.sortBy = 'FirstName';
                clearContactsTab();
                JAMBO_APP.ContactList.sortByFirst();
                drawContactsTab();
                //WKRASKO 051713 - ...
                drawFavs();
            } else if (checkSum == 1) {
                JAMBO_APP.ContactList.sortBy = 'LastName';
                clearContactsTab();
                JAMBO_APP.ContactList.sortByLast();
                drawContactsTab();
                //WKRASKO 051713 - ...
                //drawFavs();
            }
        });
        //PNG-513 KTRUMBLE 10062012 - making some adjustments to the recordEditMenus (using a single menu, repurposed for each row, versus a menu for each row)
        $('#contactRecordEditMenu').bind('mouseleave', function (event) {
            if (recordEditMenuTimeout == null)
                recordEditMenuTimeout = setTimeout(function () {
                    $('#contactRecordEditMenu').addClass('dn');
                    recordEditMenuTimeout = null;
                }, 250);
        }).bind('mouseenter', function (event) {
            clearTimeout(recordEditMenuTimeout);
            recordEditMenuTimeout = null;
        });
        $('.contactItem').bind('mouseleave', function (event) {
            var id = $(this).attr('id').split('_')[1];
            $('#hr_' + id).css('border-top', '0px');
            $('#hr_' + id).css('border-bottom', '1px solid whiteSmoke');
            if (recordEditMenuTimeout == null)
                recordEditMenuTimeout = setTimeout(function () {
                    $('#contactRecordEditMenu').addClass('dn');
                    recordEditMenuTimeout = null;
                }, 250);
        }).bind('mouseenter', function (event) {
            var id = $(this).attr('id').split('_')[1];
            $('#hr_' + id).css('border-top', '1px solid #979797');
            $('#hr_' + id).css('border-bottom', '0px');
            event.stopPropagation();
            //WKRASKO 112712 - PNG-185. Things keep getting changed withouta retest!! Please THOROUGHLY re-test changes!
            if (id != "2000000000" && id != "2000000001" && id != "2000000002") {
                clearTimeout(recordEditMenuTimeout);
                recordEditMenuTimeout = null;
                $('#contactRecordEditMenu').data('contactRecordEditMenu', $(this).data('contactRecordEditMenu'));
                var menuRecord = $(this).data('contactRecordEditMenu').split('|');
                $('#rem_contact_luNumber').data('lookupnumber', menuRecord[2]);
                $('#rem_contact_luNumber').data('editMenu', menuRecord[1]);
                //WKRASKO 122012 - PNG-804, show record edit menu at bottom for multi-line partially out of view.
                var newTop = $('#contact_' + menuRecord[1]).offset().top;
                if ($('#contact_' + menuRecord[1]).offset().top < $('#contacts').offset().top)
                    newTop = $('#contact_' + menuRecord[1]).offset().top + $('#contact_' + menuRecord[1]).height() - $('#contactRecordEditMenu').height();
                newTop = newTop - 34;
                $('#contactRecordEditMenu').css({ 'top': newTop, 'right': contactEditMenuRight });
                $('#contactRecordEditMenu').removeClass('dn');
            }
        });
        $('#rem_contact_luNumber').unbind('click').bind('click', function (event) {
            currentEditContact = $('#rem_contact_luNumber').data('editMenu');
            $('#contactRecordEditMenu').addClass('dn');
            event.stopPropagation();
            //WKRASKO 112712 - PNG-759, more incomplete testing. Contacts are ALWAYS edit, so changes to single record edit menu broke them.
            if ($('#rem_contact_luNumber').data('editMenu') != "")
                popEditContact($('#rem_contact_luNumber').data('editMenu'));
            else {
                var isContact = JAMBO_APP.ContactList.getContactByNumber($(this).data('lookupnumber'));
                if (isContact != '') popEditContact(isContact);
                else {
                    popAddContact();
                    $('.phone_input').val($(this).data('lookupnumber'));
                }
            }
        });
        //END PNG-475
        //WKRASKO 110112 - Seems like better timing here, sometimes autocomplete is not loading, at least for active call dial field
        //Crap, even this is far enough out. Doing a timeout?
        setTimeout(function () {
            if (JAMBO_APP.ContactList.getContactNumData() != null) {
                if (applicationSettings.mode == "kiosk") { 
                //dave auto complete list here...
                } else {
                    $("#outboundNumEntry").autocomplete({
                        source: JAMBO_APP.ContactList.getContactNumData(),
                        select: function(event, ui) {
                            if(event.handleObj.type=='click') setTimeout(function(){$('#outboundCallBtn').click()},250);
                        }
                    });
                }
                $('.ui-autocomplete').css({ 'bottom': 90, 'left': 'auto !important', 'right': 32, 'max-height':'none' });//WKRASKO 051713 - PNG-999 adjustments
            }
        }, 500);
    } else {
        $('#alphaContacts').hide();
        $('#contacts').html(_i18n_.get("GUI_CONTACTS_NOCONTACTS"));
    }
    //WKRASKO 111912 - PNG-638, hack for webkit draw issue. Includes corrections to set content width function.
    $(window).resize();
}

drawCallHistory = function () {
    var history = JAMBO_APP.CallHistory.getHistory();
    $('.historyInfoBlock').show();
    var favclass = "no";
    var typeclass = "";
    var theNumber = "";
    var incompleteCount = 0;
    var endDate = null;
    var missed_num = 0;

    for (var i = 0; i < history.length; i++) {
        //PNG-475 KTRUMBLE 10012012 - update row hover state
        var evenodd = (i % 2 == 0) ? 'even' : 'odd';
        var isMissed = false;
        var direction = (history[i].Type.indexOf("Dialed") != -1) ? "outgoing" : "incoming";
        var topBorder = (i == 0) ? ' dn' : '';
        var hasTranscripts = false; //PNG-513 KTRUMBLE 10062012 - making some adjustments to the recordEditMenus (using a single menu, repurposed for each row, versus a menu for each row
        if (history[i].Type.indexOf("Missed") != -1) { direction += "_missed"; isMissed = true; }
        if (direction == "outgoing") {
            theNumber = history[i].Destination;
            if (history[i].Type.indexOf("Missed") != -1)
                incompleteCount += 1;
        } else {
            theNumber = history[i].Source;
        }
        favclass = (JAMBO_APP.ContactList.isFavoriteByNumber(theNumber)) ? "" : "no";
        endDate = new Date(history[i].EndDate);

        //set date display
        var dateTime = new Date(history[i].StartDate);
        var dateTime_date = dateTime.format("M d");
        //WKRASKO 121712 - PNG-793, spanish months in history.
        if (applicationSettings.language == "es_ES") {
            //PNG-816 KTRUMBLE 01252013 - day string wasn't correctly set, using js format function instead
            dateTime_date = enToEsMonthMap[dateTime_date.toString().substr(0, 3)] + ' ' + dateTime.format("d");
        }
        var dateTime_time = dateTime.format("h:i A");
        var duration = formatMillis(history[i].Duration * 60000);
        dateTime_time = (dateTime_time.charAt(0) == 0) ? dateTime_time.substring(1) : dateTime_time;
        dateTime_time += '&nbsp;&nbsp;' + duration;

        typeclass = JAMBO_APP.ContactList.getNumTypeByNumber(theNumber);

        //PNG-322 KTRUMBLE 08132012 - set name, if available
        //PNG-490 KTRUMBLE 09292012 history contact first/last should be separate like the rest of the tabs
        var name = history[i].ContactName;
        var theFirstName = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG").split(' ')[0], theLastName = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG").split(' ')[1];
        if (name.search('@hosvrs.com') != -1) {
            name = name.split('@')[0];
        } if (name.indexOf('@') != -1) {
            num = name.split('@')[0];
            var isnum = /^\d+$/.test(num);
            if (isnum) {
                if (num.length == 10)
                    name = num;
                else if (num.length == 11 && num.charAt(0) == "1")
                    name = num.substring(1);
            }
        }
        //WKRASKO 051713 - PNG-1086, we should ALWAYS match by number, not a string field.
        if (JAMBO_APP.ContactList.contactExists(theNumber)) {
            name = JAMBO_APP.ContactList.contactNamesByNumber(theNumber);
            if (name != null) {
                theFirstName = name[0];
                theLastName = name[1];
            }
        }

        var formattedNum = theNumber;
        var checkNum = validateDialString(formattedNum); //WKRASKO 110912 - PNG-595, let's make formatting more robust here
        if (checkNum.type == "10d")
            formattedNum = format10D(formattedNum);
        else if (formattedNum.indexOf(":") == -1) {
            var tempCheckNum = formattedNum.split("@")[0];
            //WKRASKO 111912 - PNG-595 tweaks
            if (validateDialString(tempCheckNum).type == "10d") {
                formattedNum = format10D(validateDialString(tempCheckNum).dialString);
            } else if (validateDialString(tempCheckNum.substring(1)).type == "10d") {
                formattedNum = format10D(validateDialString(tempCheckNum.substring(1).dialString));
            }
        }
        if(!isDefined(formattedNum)) formattedNum = theNumber;// comes back undefined in some cases, just display the dialed string, in that case
        //WTF? Looked at getDisplayName more carefully, it does nothing! :(
        //var lookupNumber = sanitize(getDisplayName(theNumber));
        var lookupNumber = theNumber
        if (lookupNumber.indexOf(":") != -1)
            lookupNumber = lookupNumber.split(":")[1];
        if (lookupNumber.indexOf("@") != -1)
            lookupNumber = lookupNumber.split("@")[0];
        var blockClass = (JAMBO_APP.BlockedNumbers.isBlocked(lookupNumber)) ? ' dn' : '';
        var unblockClass = (JAMBO_APP.BlockedNumbers.isBlocked(lookupNumber)) ? '' : ' dn';
        var contactID = JAMBO_APP.ContactList.getContactByNumber(lookupNumber);
        if (contactID == '') contactID = 'unknown_' + i;
        if (chatHistoryByID[contactID]) hasTranscripts = true; //PNG-513 KTRUMBLE 10062012 - making some adjustments to the recordEditMenus (using a single menu, repurposed for each row, versus a menu for each row
        //PNG-377 KTRUMBLE 09062012 we had multiple ids being generated in the code, so it was only placing the first
        //instance it found, which is in 'all'. now, each hNum row is different, based on history type (all, missed, today, etc)
        var tempEntry = {
            "id": history[i].ID, "name": name, "number_type": (typeclass == null) ? '' : typeclass,
            "fav_class": favclass, "number": formattedNum, "datestamp": endDate.format("M j h:i A"),
            "duration": duration, "direction": direction, "the10d": lookupNumber, //WKRASKO 112812 - PNG-760
            "PMDate": dateTime_date, "PMTime": dateTime_time, "historySection": "all", "topBorder": topBorder,
            'first_name': theFirstName, 'last_name': theLastName, 'evenodd': evenodd,
            "BlockClass": blockClass, "UnblockClass": unblockClass, "contactID": contactID, "hasTranscripts": hasTranscripts,
            "lookupnum": lookupNumber//WKRASKO 111912 - PNG-724, I keep fixing this and it keeps getting removed/changed! Stop it please! Or at least fully re-test changes.
        };
        //WKRASKO 101012 - PNG-536, seriously, WTF! THis was working, now it's broken, no good reason why the chane was made below. Fixing again.
        //A little more testing after making changes please!
        //WKRASKO 111412 - PNG-377 mods
        if (!JAMBO_APP.BlockedNumbers.isBlocked(lookupNumber)) {//PNG-634 KTRUMBLE 10312012 - history, pm will no longer show blocked contacts
            $.tmpl(JAMBO_APP.CallHistory.historyItemTemplateDesktop, tempEntry).appendTo('#history_all_calls');
            if (isMissed) {
                missed_num++;
                var missed_evenodd = (missed_num % 2 == 0) ? 'even' : 'odd';
                tempEntry['evenodd'] = missed_evenodd;
                tempEntry.historySection = "missed_calls";
                $.tmpl(JAMBO_APP.CallHistory.historyItemTemplateDesktop, tempEntry).appendTo('#history_missed_calls');
            } /*
            if(endDate.isToday()){
                tempEntry.historySection = "today";
                $.tmpl(JAMBO_APP.CallHistory.historyItemTemplateDesktop, tempEntry).appendTo('#history_today');
            }
            if(endDate.isYesterday()){
                tempEntry.historySection = "yesterday";
                $.tmpl(JAMBO_APP.CallHistory.historyItemTemplateDesktop, tempEntry).appendTo('#history_yesterday');
            }
            if(endDate.dayDiffFromToday()<=7){
                tempEntry.historySection = "past_7_days";
                $.tmpl(JAMBO_APP.CallHistory.historyItemTemplateDesktop, tempEntry).appendTo('#history_past_7_days');
            }
            if(endDate.dayDiffFromToday()<=30){
                tempEntry.historySection = "past_30_days";
                $.tmpl(JAMBO_APP.CallHistory.historyItemTemplateDesktop, tempEntry).appendTo('#history_past_30_days');
            }*/
        }
    }

    $('#contactBuckets .bucketBlock').unbind('click').click(function () {
        if(!$(this).hasClass('contactBucketSelected')){
            if($(this).attr('id')=='all_contacts'){
                $('#contacts').show();
                $('#favoritesList').hide();
            } else if ($(this).attr('id')=='fav_contacts'){
                $('#contacts').hide();
                $('#favoritesList').show();
            }
            $('.contactBucketSelected').removeClass('contactBucketSelected');
            $(this).addClass('contactBucketSelected');
        }
    });
    $('#historyBuckets .bucketBlock').unbind('click').click(function () {
        $('#history_' + $('.historyBucketSelected').attr('id')).hide();
        $('.historyBucketSelected').removeClass('historyBucketSelected');
        $(this).addClass('historyBucketSelected');
        $('#history_' + $(this).attr('id')).show();
    });
    //PNG-513 KTRUMBLE 10062012 - making some adjustments to the recordEditMenus (using a single menu, repurposed for each row, versus a menu for each row)
    $('#historyRecordEditMenu').bind('mouseleave', function (event) {
        if (recordEditMenuTimeout == null)
            recordEditMenuTimeout = setTimeout(function () {
                $('#historyRecordEditMenu').addClass('dn');
                recordEditMenuTimeout = null;
            }, 250);
    }).bind('mouseenter', function (event) {
        clearTimeout(recordEditMenuTimeout);
        recordEditMenuTimeout = null;
        //var menuRecord = $(this).data('historyRecordEditMenu').split('|');
        //if (chatHistoryByID[menuRecord[6]]) $('#rem_history_transcriptBtn').removeClass('dn');
    });
    $('.historyNum').bind('mouseleave', function (event) {
        if (recordEditMenuTimeout == null)
            recordEditMenuTimeout = setTimeout(function () {
                $('#historyRecordEditMenu').addClass('dn');
                recordEditMenuTimeout = null;
            }, 250);
    }).bind('mouseenter', function (event) {
        event.stopPropagation();
        clearTimeout(recordEditMenuTimeout);
        recordEditMenuTimeout = null;
        $('#historyRecordEditMenu').data('historyRecordEditMenu', $(this).data('historyRecordEditMenu'));
        var menuRecord = $(this).data('historyRecordEditMenu').split('|');
        //$('#rem_history_remArrow').data('editMenuArrowID', menuRecord[2] + '_' + menuRecord[1]);
        $('#rem_history_luNumber').data('lookupnumber', menuRecord[3]);
        //WKRASKO 120612 - PNG-679, along with lots of changes elsewhere I forgot to comment, sorry, in a hurry for RC1 now!
        if (JAMBO_APP.ContactList.contactExists(menuRecord[3])) {
            if ($('#rem_history_luNumber').hasClass('contactAddBtn')) $('#rem_history_luNumber').removeClass('contactAddBtn');
        } else if (!$('#rem_history_luNumber').hasClass('contactAddBtn'))
            $('#rem_history_luNumber').addClass('contactAddBtn');
        $('#rem_history_luNumber').data('editMenu', menuRecord[2] + '_' + menuRecord[1]);
        $('#historyRecordEditMenu').css({ 'top': $('#hNum_' + menuRecord[2] + '_' + menuRecord[1]).offset().top - 33, 'right': 16 });
        $('#historyRecordEditMenu').removeClass('dn');
    });
    $('#rem_history_luNumber').unbind('click').bind('click', function (event) {
        $('#historyRecordEditMenu').addClass('dn');
        event.stopPropagation();
        var isContact = JAMBO_APP.ContactList.getContactByNumber($(this).data('lookupnumber'));
        if (isContact != '') popEditContact(isContact);
        else {
            popAddContact();
            $('.phone_input').val($(this).data('lookupnumber'));
        }
    });
    //END PNG-513
    $('.historyRCol').unbind('click').click(function (event) {
        event.stopPropagation();
        var thisHistoryNum = $(this).data('the10d').split('_')[1]; //PNG-321 KTRUMBLE 08132012 .data was stripping leading zeros, adding the _ keeps the dialed string intact
        var displayName = JAMBO_APP.ContactList.contactNameByNumber(thisHistoryNum);
        if (displayName == null)
            displayName = thisHistoryNum.toString(); //WKRASKO 073112 - PNG-279
        console.log("Calling 10D: " + thisHistoryNum + " Display name: " + displayName);
        var hString = thisHistoryNum.toString();
        if (hString == "selfrecord")
            initCallFromDialString(JAMBO_APP.PurpleMail.getSelfRecordURL(), 'Record PurpleMail Message', 'dns');
        else {
            var validDialString = validateDialString(hString);
            initCallFromDialString(validDialString.dialString, displayName, validDialString.type);
        }
    });
    //PNG-475 KTRUMBLE 10012012 - update row hover state
    $('.historyNum').hover(
        function () {
            var rowid = $(this).data('cnID');
            $('#hr_' + rowid).css('border-top', '1px solid #979797');
            $('#hr_' + rowid).css('border-bottom', '0px');
        },
        function () {
            var rowid = $(this).data('cnID');
            $('#hr_' + rowid).css('border-top', '0px');
            $('#hr_' + rowid).css('border-bottom', '1px solid whiteSmoke');
        }
    );
    //END PNG-475
    //WKRASKO 111912 - PNG-638, hack for webkit draw issue. Includes corrections to set content width function.
    $(window).resize();
}

popAddContact = function(){
    hideEmbeddedVideoComposer();
    $('#popDiv').show();
    $('#createEditContactLabel').html(_i18n_.get("GUI_ADDRESSBOOK_ADDCONTACT"));
    $('#createEditContactFirstName').attr('placeholder',_i18n_.get("GUI_CONTACT_NAME_FIRST"));
    $('#createEditContactLastName').attr('placeholder',_i18n_.get("GUI_CONTACT_NAME_LAST"));
    $('#createEditContactID').val('');
    $('#createEditContactNumbers').empty();
    $('#addNumberIcon').click();
    $('.minusSign').hide();
    $('#createEditContactPop').show();
    $('#createEditContactFirstName').focus();//PNG-1104 KTRUMBLE 05232013 - set focus to first name field on opening 'add new contact'
    $('#createEditContactDelete').hide();
    repositionPopUpEnvironment('#createEditContactPop');
    $('#createEditContactCancel').bind('click',function(event){
        $('#createEditContactPop').hide();
        $('#popDiv').hide();
        $(this).unbind('click');
        $('#createEditContactSave').unbind('click');
        $('.invalid').removeClass('invalid');
        $('#createEditContactFirstName').val('');
        $('#createEditContactLastName').val('');
        $('#createEditContactFirstName').css("background","none");
        $('#createEditContactLastName').css("background","none");
        showEmbeddedVideoComposer();
    });
    $('#createEditContactSave').bind('click',function(event){
        var firstName = $('#createEditContactFirstName').val().trim();
        var lastName = $('#createEditContactLastName').val().trim();
        var numbersValid = true;
        $('.createEditContactNumber').each(function(index) {
            var numValidation = validateDialString( $(this).find('.phone_input').val() );
            if( !numValidation.status ){
                numbersValid = false;
                $(this).find('.phone_input').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","none")});
            }
        });
        if( (firstName!='' || lastName!='') && $('.createEditContactNumber .phone_input').first().val()!="" && numbersValid){//WKRASKO 072412 - PNG-189//PNG-1032 KTRUMBLE 04262013 - change to first || last name (not both required)
            //go ahead, create a contact!
            JAMBO_APP.ContactList.addContact(firstName, lastName, addContactNumbers);
        } else {
            //Missing required info
            if(firstName=='') $('#createEditContactFirstName').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","none")});
            if(lastName=='') $('#createEditContactLastName').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","none")});
            //if($('.createEditContactNumber .phone_input').first().val()=="")
                //$('.createEditContactNumber .phone_input').first().css("background-color","red").focus(function(){$(this).css("background","none")});
        }
    });
    bindBlocker();//PNG-972 KTRUMBLE 04172013 - add ability to block numbers when creating new contacts
}
//PNG-972 KTRUMBLE 04172013 - add ability to block numbers when creating new contacts
//this function is here so that we can re-bind the block buttons when a number row is added
//to the popaddcontact modal by the user
bindBlocker = function(){
    $('div.blockSign').unbind().click(function () {
        var blockID = $(this).data('id');
        if(!$('#editInput_'+blockID).hasClass('phone_input_blocked')) $('#editInput_'+blockID).addClass('phone_input_blocked');
        else $('#editInput_'+blockID).removeClass('phone_input_blocked');
        if(!$(this).hasClass('blockSignActive')) $(this).addClass('blockSignActive');
        else $(this).removeClass('blockSignActive');
    });
}

removeNumberRow = function(elem){
    //WKRASKO 052013 - PNG-1041, change to only hide delete if rows == 1
    if($('#createEditContactID').val()=='' || $(elem).data('id')==""){
        $(elem).closest('tr').remove();
    } else if( $('#createEditContactNumbers').find('tr:visible').length > 1 ){
        $(elem).closest('tr').hide();
        $(elem).addClass('remove');
    }
    if( $('#createEditContactNumbers').find('tr:visible').length == 1 )
        $('.minusSign:visible').hide();
}

addContactNumbers = function(result){
    if(result.ResultCode=="OK"){
        $('.createEditContactNumber').each(function(index) {
            var numberToAdd = $(this).find('.phone_input').val();
            if( numberToAdd!='' ){
                var numValidation = validateDialString( numberToAdd );
                JAMBO_APP.ContactList.addNumber(result.Contacts[0].ID, numValidation.dialString, $(this).find('select').val(), $(this).find('.favStar').hasClass('isFav_blue'));
                if($(this).find('.blockSign').hasClass('blockSignActive')){//PNG-972 KTRUMBLE 04172013 - add ability to block numbers when creating new contacts
                    JAMBO_APP.BlockedNumbers.blockNumber(numberToAdd);
                }
            }
        });
        $('#createEditContactCancel').click();
        setTimeout(syncContacts,1000);
    } else {
        //TODO: What do we do if contact didn't save?
    }
}

popEditContact = function(contactID){
    currentEditContact=contactID;
    hideEmbeddedVideoComposer();
    $('#popDiv').show();
    var theContact = JAMBO_APP.ContactList.getContact(contactID);
    var labelName = theContact.FirstName+" "+theContact.LastName;
    //WKRASKO 110212 - PNG-640. Adding title here, also in all row templates.
    $('#createEditContactLabel').html(_i18n_.get("GUI_ADDRESSBOOK_EDITCONTACT")+": "+labelName).attr('title',_i18n_.get("GUI_ADDRESSBOOK_EDITCONTACT")+": "+labelName);
    $('#createEditContactFirstName').attr('placeholder',_i18n_.get("GUI_CONTACT_NAME_FIRST"));
    $('#createEditContactLastName').attr('placeholder',_i18n_.get("GUI_CONTACT_NAME_LAST"));
    $('#createEditContactFirstName').val(theContact.FirstName);
    $('#createEditContactLastName').val(theContact.LastName);
    $('#createEditContactID').val(contactID);
    $('#createEditContactNumbers').empty();
    for(var i=0; i<theContact.Numbers.length; i++){
        var activeBlockClass = (JAMBO_APP.BlockedNumbers.isBlocked(theContact.Numbers[i].Number))?' blockSignActive':'';
        $.tmpl(JAMBO_APP.ContactList.createEditContactNumberRow, {number_label:_i18n_.get("GUI_CONTACT_NUMBER"),number_value:theContact.Numbers[i].Number,type_label:_i18n_.get("GUI_CONTACT_NUMBER_TYPE"),id:theContact.Numbers[i].ID,'blockClass':activeBlockClass,blockID:theContact.Numbers[i].ID}).appendTo('#createEditContactNumbers');
        console.log("Updating number row...");
        if(JAMBO_APP.BlockedNumbers.isBlocked(theContact.Numbers[i].Number)){
            $('#editInput_'+theContact.Numbers[i].ID).addClass('phone_input_blocked');//PNG-894 KTRUMBLE 04092013 - modifying block/unblock number functionality to better fit the process as suggested in the PSD
        }
        $('#createEditContactNumbers select').last().val(theContact.Numbers[i].TypeID);
        if(theContact.Numbers[i].IsFavorite)
            $('#createEditContactNumbers .favStar').last().addClass('isFav_blue');
    }
    //WKRASKO 052013 - PNG-1041
    if(theContact.Numbers.length==1)
        $('#createEditContactNumbers .minusSign').hide();
    $('div.blockSign').unbind().click(function () {
        var blockID = $(this).data('id');
        numberToBlock = $('#editInput_'+blockID).val();
        numberToUnblock = $('#editInput_'+blockID).val();
        if(!JAMBO_APP.BlockedNumbers.isBlocked(numberToBlock)){
            var tempVNum = validateDialString(numberToBlock);
            if (numberToBlock != _i18n_.get('GUI_NUMBERINPUT_TEXT') && numberToBlock != "" && tempVNum.status) {
                //PNG-894 KTRUMBLE 04092013 - modifying block/unblock number functionality to better fit the process as suggested in the PSD
                $('#editInput_'+blockID).addClass('phone_input_blocked');
                $(this).addClass('blockSignActive');
                $('#blockedNumOverlay_txt_'+numberToBlock).html('BLOCKED').show().delay(1500).fadeOut(500);
                $('#blockedNumOverlay_'+numberToBlock).show().delay(1500).fadeOut(500);
                JAMBO_APP.BlockedNumbers.blockNumber(numberToBlock);
            } else//Fixed above, we should be able to block AND store sip, ip, etc. Below is wrong too, but not fixing right now. Cause the error, hit ok, see what happens!
                openMessagePopup('#errorPop', _i18n_.get("GUI_CALL_MENU_BLOCK"), _i18n_.get("GUI_CALL_MENU_BLOCK_BADNUMBER"));
        } else {
            //PNG-894 KTRUMBLE 04092013 - modifying block/unblock number functionality to better fit the process as suggested in the PSD
            $('#editInput_'+blockID).removeClass('phone_input_blocked');
            $(this).removeClass('blockSignActive');
            $('#blockedNumOverlay_txt_'+numberToUnblock).html('UNBLOCKED').show().delay(1500).fadeOut(500);
            $('#blockedNumOverlay_'+numberToUnblock).show().delay(1500).fadeOut(500);
            JAMBO_APP.BlockedNumbers.unblockNumber(numberToUnblock);
        }
    });
    $('#createEditContactPop').show();
    $('#createEditContactDelete').unbind('click').bind('click',function(){
        $('#createEditContactPop').hide();
        openMessagePopup('#messagePop',_i18n_.get("GUI_ADDRESSBOOK_DELETECONTACT"),_i18n_.get("MSG_WARN_DELETE_CONTACT"),_i18n_.get("GUI_VCR_DELETE"),true,function(){
            JAMBO_APP.ContactList.deleteContact( $('#createEditContactID').val() );
            $('#createEditContactSave').unbind('click');
            $('.invalid').removeClass('invalid');
            $('.invalid').removeClass('invalid');
            showEmbeddedVideoComposer();
        });
    }).show();
    repositionPopUpEnvironment('#createEditContactPop');
    $('#createEditContactCancel').bind('click',function(event){
        if(!$('.blockedNumOverlay_txt').hasClass('dn')) $('.blockedNumOverlay_txt').addClass('dn');
        if(!$('.blockedNumOverlay').hasClass('dn')) $('.blockedNumOverlay').addClass('dn');
        $('#createEditContactPop').hide();
        $('#popDiv').hide();
        $(this).unbind('click');
        $('#createEditContactSave').unbind('click');
        $('.invalid').removeClass('invalid');
        $('#createEditContactFirstName').val('');
        $('#createEditContactLastName').val('');
        $('#createEditContactFirstName').css("background","none");
        $('#createEditContactLastName').css("background","none");
        showEmbeddedVideoComposer();
    });
    $('#createEditContactSave').bind('click',function(event){
        var firstName = $('#createEditContactFirstName').val().trim();
        var lastName = $('#createEditContactLastName').val().trim();
        if(firstName!='' || lastName!=''){//WKRASKO 072412 - PNG-189//PNG-1032 KTRUMBLE 04262013 - change to first || last name (not both required)
            var goodToGo = true;
            //PNG-424 KTRUMBLE 09142012 - sniff for duplicates, mark accordingly
            var duplicateNumber = false,nextPhoneInput = null;
            $('.phone_input').css("background","none");
            $('.phone_input').each(function(i){
                var thisPhoneInput = $(this).val();
                $('.phone_input').each(function(j){
                    if(j!=i){
                        nextPhoneInput = $(this).val();
                        if(thisPhoneInput==nextPhoneInput) {
                            duplicateNumber=true;
                            $(this).addClass('duplicateNumber');
                        }
                    }
                });
                if(duplicateNumber) $(this).addClass('duplicateNumber');
                duplicateNumber=false;
            });
            //END PNG-424
            $('.createEditContactNumber').each(function(index) {
                if( $(this).find('.phone_input').val()=='' && !$(this).find('.minusSign').hasClass('remove') && $(this).find('.minusSign').data('id')!==''){
                    goodToGo = false;
                    $(this).find('.phone_input').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","none")});
                }
                var numValidation = validateDialString( $(this).find('.phone_input').val() );
                if( $(this).find('.phone_input').val()!='' && !numValidation.status && !$(this).find('.minusSign').hasClass('remove') ){//Allow blank numbers for this validation. They can be for remove markers above.
                    goodToGo = false;
                    $(this).find('.phone_input').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","none")});
                }
                //PNG-424 KTRUMBLE 09142012 - disallow submission, highlight the duplicates
                if( $(this).find('.phone_input').hasClass('duplicateNumber') ){
                    goodToGo = false;
                    $(this).find('.phone_input').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","none")});
                }
                //END PNG-424
            });
            $('.phone_input').removeClass('duplicateNumber');//PNG-424 KTRUMBLE 09142012 - clear duplicates
            //Update first/last name...
            if(goodToGo){
                JAMBO_APP.ContactList.updateContact(contactID, firstName, lastName);
                //WORKING ON
                var numberID = null;
                $('.createEditContactNumber').each(function(index) {
                    numberID = $(this).find('.minusSign').data('id');
                    var numValidation = validateDialString( $(this).find('.phone_input').val() );
                    if( numberID!=undefined && numberID!='' ){
                        console.log("the num id is "+numberID);//WKRASKO - PNG-235, for some reason, just putting this here worked! Probably another js timing issue.
                       if( $(this).find('.minusSign').hasClass('remove') ){//Delete the number
                           JAMBO_APP.ContactList.deleteNumber(numberID);
                           numberToUnblock = $('#editInput_'+numberID).val();//PNG-975 KTRUMBLE 04102013 - unblock numbers if number/contact deleted
                           if(JAMBO_APP.BlockedNumbers.isBlocked(numberToUnblock)) JAMBO_APP.BlockedNumbers.unblockNumber(numberToUnblock);
                       } else//Update the number
                           JAMBO_APP.ContactList.updateNumber(contactID, numberID, $(this).find('select').val(), numValidation.dialString, $(this).find('.favStar').hasClass('isFav_blue'))
                    } else if(!$(this).find('.minusSign').hasClass('remove')) {
                       //New number, add the sucka!
                       JAMBO_APP.ContactList.addNumber(contactID, numValidation.dialString, $(this).find('select').val(), $(this).find('.favStar').hasClass('isFav_blue'));
                    }
                });
                $('#createEditContactCancel').click();
                setTimeout(syncContacts,1000);
            }
        } else {
            //Missing required info
            if(firstName=='') $('#createEditContactFirstName').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","none")});
            if(lastName=='') $('#createEditContactLastName').css("background-color","#fcdc00").unbind('focus').focus(function(){$(this).css("background","none")});
        }
    });
}

popEditE911 = function(){
    hideEmbeddedVideoComposer();
    $('#popDiv').show();
    $('#editE911Pop').show();
    $('#editE911Table').show();
    repositionPopUpEnvironment('#editE911Pop');
    $('#editE911Cancel').bind('click',function(event){
        if( $('#addressSuggestionsWrapper').is(':visible') )
            $('#addressSuggestionsWrapper').hide();
        $('#editE911Pop').hide();
        $('#popDiv').hide();
        $(this).unbind('click');
        $('#editE911Save').unbind('click');
        showEmbeddedVideoComposer();
        JAMBO_APP.WebServices.getUserE911(JAMBO_APP.activeUserAccount,fillE911);
    });
    disableE911Verify();
}

enableE911Verify = function(){
    $('#editE911Save').unbind('click').bind('click',function(event){//WKRASKO 110212 - PNG-653, need to unbind first, or we get stacked binds.
        if( $('#editE911Table').is(':visible') ){
            $('#editE911Table').hide();
            var tempUserObj = {
                GUID: JAMBO_APP.activeUserAccount,
                FirstName: $('#e911_fname').val(),
                LastName: $('#e911_lname').val(),
                E911Address: {
                    Street1: $('#e911_address').val(),
                    Street2: $('#e911_address2').val(),
                    City: $('#e911_city').val(),
                    State: $('#e911_state').val(),
                    Zip: $('#e911_zip').val(),
                    AddressIsHomeOrWork : $('input:radio[name=e911AddressIs_radio]:checked').val()
                },
                DOB: $('#e911_dob').val()
            }
        } else if( $('#addressSuggestionsWrapper').is(':visible') && $('input[name=e911address_choice]:checked').length==1 ){
            $('#addressSuggestionsWrapper').hide();
            var row = $('#addressSuggestions tr[data-rownum="'+$('input[name=e911address_choice]:checked').val()+'"]');
            var tempUserObj = {
                GUID: JAMBO_APP.activeUserAccount,
                FirstName: $('#e911_fname').val(),
                LastName: $('#e911_lname').val(),
                E911Address: {
                    Street1: row.find('.e911_choice_address1').text(),
                    Street2: row.find('.e911_choice_address2').text(),
                    City: row.find('.e911_choice_city').text(),
                    State: row.find('.e911_choice_state').text(),
                    Zip: row.find('.e911_choice_zip').text(),
                    AddressIsHomeOrWork : (row.find('.e911_choice_type').text()=="Home"?"H":"W")
                },
                DOB: $('#e911_dob').val()
            }
        }
        if( !$('#addressSuggestionsWrapper').is(':visible') || $('input[name=e911address_choice]:checked').length==1 ){
            disableE911Verify();
            $('#editE911Working').show();
            repositionPopUpEnvironment('#editE911Pop');
            JAMBO_APP.WebServices.updateUserE911(tempUserObj,updateE911);
        }
    });
    $('#editE911Save').addClass('e911Enabled');
}

disableE911Verify = function(){
    $('#editE911Save').unbind('click');
    $('#editE911Save').removeClass('e911Enabled');
}

popChangeAvatar = function(){
    var fileUploadHtml = '<label>'+_i18n_.get("AVATAR_LABEL_SIZE_RESTRICTION")+' '+(avatarFileSizeLimit/1024).toFixed(0)+' KB '+avatarDimensionLimit+'x'+avatarDimensionLimit+'</label><br/><input type="file" id="avatarSelect" style="width:360px"/><br/><label style="color:red;" id="avatarError"></label>';
    openInputPop(_i18n_.get('MENU_CHOOSE_AVATAR'),fileUploadHtml,0.9,function(){
        $('#avatarError').empty();
        var avatarInput = document.getElementById("avatarSelect");
        var reader, file;
        if(avatarInput.files.length<1){
            $('#avatarError').text(_i18n_.get("AVATAR_ERROR_NOFILE"));
            return;//No file selected, force them to select or cancel.
        }
        file = avatarInput.files[0];
        //WKRASKO 082212 - PNG-306, new limit
        var img = new Image();
        img.onload = function(){
            var tempWidth = this.width; var tempHeight = this.height;
            if(file.fileSize>avatarFileSizeLimit || this.width>avatarDimensionLimit || this.height>avatarDimensionLimit){
                $('#avatarError').text(_i18n_.get("AVATAR_ERROR_TOOBIG"));
            } else if (!!file.type.match(/image.*/)) {
                if ( window.FileReader ) {
                    closeInputPop();
                    reader = new FileReader();
                    reader.onloadend = function (e) {
                        //console.log("Mime type: "+file.type);
                        //console.log("Image Data: "+e.target.result.split('base64')[1].slice(1));
                        avatarOldSrc = $('#footer_avatar').attr('src');//Save, so if web service fails/errors, we can set the local images back
                        $('#footer_avatar').attr('src',e.target.result);
                        $('#settings_profile_avatar').attr('src',e.target.result);
                        scaleAvatar();
                        //console.log(e.target.result);
                        //console.log(encodeURIComponent(e.target.result.split('base64')[1].slice(1)))
                        //Old call
                        //JAMBO_APP.WebServices.setUserAvatar(JAMBO_APP.activeUserAccount, encodeURIComponent(e.target.result.split('base64')[1].slice(1)), file.type, function(result)
                        JAMBO_APP.WebServices.setUserAvatar(JAMBO_APP.activeUserAccount, e.target.result.split('base64')[1].slice(1), file.type, function(result){
                            if(result.ResultCode!="OK"){
                                $('#footer_avatar').attr('src',avatarOldSrc);
                                $('#settings_profile_avatar').attr('src',avatarOldSrc).load(function(){
                                    scaleAvatar();
                                });
                            }
                        });
                    };
                    reader.readAsDataURL(file);
                }
            } else {
                $('#avatarError').text(_i18n_.get("AVATAR_ERROR_NOTIMAGE"));
            }
        }
        var _URL = window.URL || window.webkitURL;
        img.src = _URL.createObjectURL(file);
    },_i18n_.get('COMMON_SAVE'));
}

function generalWSError(theError){
    console.log("WS: The following error occurred - "+theError);
}

function addUserToApp(result){
    var tempUser = result;
    delete tempUser.ResultCode;
    delete tempUser.ResultMessage;
    JAMBO_APP.userAccounts[tempUser.GUID] = tempUser;
}

function drawVideoSwitch(){
    $('#walkthru_toggle').iphoneSwitch("off",
        function() {
            //On stuff
            console.log("Turned on");
        },
        function() {
            //Off stuff
            console.log("Turned off");
        },
        {
            switch_on_container_path: 'img/iphone_switch_container_off.png'
        }
    );
}

function setLanguage(lang){
    console.log("Setting language to: "+lang);
    var tempApplicationSettings = $.extend(true, {}, applicationSettings);
    tempApplicationSettings["language"] = lang;
    _i18n_.setLanguageCode(lang, function(){ translate(); });
    __thisWindowProxy__.setApplicationSettings(tempApplicationSettings, function(response){
        if (response.result.returnValue) {
            applicationSettings = tempApplicationSettings;
            
        } else {
            __log__.warn("Error while saving language, restoring previously selected value, reason["+response.result.reason+"]");
        }
    });
    //make adjustments to layout by language
    
}

function animateFuelBar(finalWidth){
    //console.log("Stop at: "+finalWidth+" Current width: "+$(".meter > span#fuel").width());
    //Hint for timeing, since we may have to re-time as we go. Watch the fuel bar and watch the console for "END INITIALIZATION" they should end/happen about the same time.
    var newFuelBarWidth = $(".meter > span#fuel").width()+2;
    $(".meter > span#fuel").width(newFuelBarWidth);
    $("#fuelPercent").width(newFuelBarWidth+48);
    $('#fuelPercentValue').text( parseInt($(".meter > span#fuel").width()/4)+"%" );
    if( $(".meter > span#fuel").width()>=finalWidth ){
        clearInterval(animateFuelBarInterval);
        animateFuelBarInterval = null;
        switch(finalWidth){
            case 80:
                $('#loadingStatus').html(_i18n_.getHTML("GUI_SYSTRAY_MSG_LOADING_STATUS2"));
                animateFuelBarInterval = setInterval(animateFuelBar,3,200);
                break;
            case 200:
                $('#loadingStatus').html(_i18n_.getHTML("GUI_SYSTRAY_MSG_LOADING_STATUS3"));
                animateFuelBarInterval = setInterval(animateFuelBar,2,330);
                break;
            case 330:
                $('#loadingStatus').html(_i18n_.getHTML("GUI_SYSTRAY_MSG_LOADING_STATUS4"));
                animateFuelBarInterval = setInterval(animateFuelBar,1,400);
                break;
            default:
                $(".meter > span#fuel").css('border-right',"none");
                $('#startupMask #loadingDiv').hide();
                $('.meter').hide();

                //Show "user switcher"
                $('#startupMask #signin').css('display','table-cell');
                //WKRASKO 080312 - PNG-12
                //For Scenario 2 only
                if(finalWidth!=100){
                    //NOT logout, do auto login
                    var autoDone = false;
                    $.each(applicationSettings.logins,function(u){
                        if(isDefined(applicationSettings.logins[u].autoSignin) && applicationSettings.logins[u].autoSignin){
                            $('#startupMask #signin #loginUsername').val(u);
                            $('#startupMask #signin #loginSavePassword').attr('checked', true);
                            $('#startupMask #signin #loginAutomatic').attr('checked', true);
                            $('#startupMask #signin #loginPassword').val(Base64.decode(applicationSettings.logins[u].password));
                            $('#loginDo').click();
                            autoDone = true;
                        }
                    });
                    //WKRASKO 092112 - PNG-407
                    if(!autoDone){
                        var u = applicationSettings.lastLoggedInUser;
                        if(u!=null && isDefined(applicationSettings.logins) && isDefined(applicationSettings.logins[u])){
                            $('#startupMask #signin #loginUsername').val(u);
                            $('#startupMask #signin #loginSavePassword').attr('checked', true);
                            $('#startupMask #signin #loginPassword').val(Base64.decode(applicationSettings.logins[u].password));
                            $('#startupMask #signin #loginUsername').focus(function(){this.select();});
                        }
                        $('#startupMask #signin #loginUsername').focus();
                    }
                }
                break;
        }
    }
}

function showAbout(){
    $('#popDiv').show();
    $('#aboutPop').show();
    hideEmbeddedVideoComposer();//PNG-573 KTRUMBLE 10172012 - hiding composer, like we do whenever we use the pop mask
    repositionPopUpEnvironment("#aboutPop");
    $('#aboutPop').find("div.close.handler").bind('click', function(event){        
        hideAbout();
        showEmbeddedVideoComposer();//PNG-573 KTRUMBLE 10172012 - unhiding composer
    });
    // PNG-810 KTRUMBLE - aboutPop update
    $('#aboutPop_TnC').unbind('click').click(function(){
        __thisWindow__.openInSystemBrowser('http://www.purple.us/relayterms', true);
    });
    $('#aboutPop_privacy').unbind('click').click(function(){
        __thisWindow__.openInSystemBrowser('http://www.purple.us/privacy', true);
    });
    // END PNG-810
}

function hideAbout(){
    $('#aboutPop').hide();
    $('#popDiv').hide();
    $('#aboutPop').find("div.close.handler").unbind('click');
}

function showEmbeddedVideoSettingComposer() {
    if (!composerReady)
        setTimeout(showEmbeddedVideoSettingComposer, 100);
    else if ($('#MyVideoConferenceSettingWidget').hasClass('dn'))
        setTimeout(function () { $('#MyVideoConferenceSettingWidget').removeClass('dn') }, 500);
}
function showEmbeddedVideoComposer(){
    if(!composerReady)
        setTimeout(showEmbeddedVideoComposer,100);
    else if($('#MyVideoConferenceWidget').hasClass('dn')){
        setTimeout(function(){ $('#MyVideoConferenceWidget').removeClass('dn') },500);
        //WKRASKO 051413 - Better fix for PNG-950, works every time with the right timeout in the function below. So far 1500 seems to work every time.
        if(initUserStuff){
            initUserStuff = false;
            checkInitVC();
        }
    }
}

function checkInitVC(){
    if(document.activeElement!=document.body)
        setTimeout(checkInitVC,100);
    else
        setTimeout(function(){$('#outboundNumEntry').unbind('focus').focus();__thisWindow__.activate();},1500);
}

function hideEmbeddedVideoComposer(){
    if(!$('#MyVideoConferenceWidget').hasClass('dn'))
        $('#MyVideoConferenceWidget').addClass('dn');

    if (!$('#MyVideoConferenceSettingWidget').hasClass('dn'))
        $('#MyVideoConferenceSettingWidget').addClass('dn');
}

var hideUserMenuTimer = null,initUserStuff=false;
function initUserRecords(){
    initUserStuff=true;//PNG-950 KTRUMBLE 04152013 - set focus to dial field on login
    // init blocked numbers
    JAMBO_APP.BlockedNumbers.getBlockedNumbers(JAMBO_APP.activeUserAccount);
    // init contacts
    JAMBO_APP.ContactList.populate(JAMBO_APP.activeUserAccount);
    setTimeout(function(){//Give time for contacts to complete. Sometimes history and/or PM returns first, then looks for info in contacts which is not there.
        // init history
        JAMBO_APP.CallHistory.populate(JAMBO_APP.activeUserAccount);
        // init purplemail
        JAMBO_APP.PurpleMail.populate(JAMBO_APP.activeUserAccount);
    },300);
    //WKRASKO 092112 - PNG-410, adding contacts sync
    checkContactsInterval = setInterval(syncContacts,CHECK_CONTACTS_INTERVAL);
    checkPMInterval = setInterval(syncPurpleMail,CHECK_PM_INTERVAL);
    if (getCurrentOS() == OSType.MacOS) createPMFile('emptyFile',null,null,null);//PNG-1085 KTRUMBLE 04212013 - clear PM msg file on signin
    checkHistoryInterval = setInterval(syncHistory,CHECK_HISTORY_INTERVAL);
    checkSettingsInterval = setInterval(syncSettings,CHECK_SETTINGS_INTERVAL);//PNG-1029 KTRUMBLE 04182013 - auto sync settings with server on a timer
    //populate current user name, number, avatar
    footerUsername = JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].FirstName+" "+JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].LastName;
    $('#footer_user_name').html('<div class="footer_username_wrapper fl">'+footerUsername+'</div>');
    $('#footer_thumb').unbind().click(popChangeAvatar);
    $('#footerWrapper').unbind().click(popChangeAvatar);
    if(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].UseDefaultGreeting) $('#pvg_voice_greeting').val('Hello, this is the Purple Video Relay Service. I am Sign Language Interpreter ____. One moment while I connect you to '+footerUsername+'.');
    else $('#pvg_voice_greeting').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].AnsweringMachineGreeting);
    $('#pvg_voice_greeting_default').attr('checked', JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].UseDefaultGreeting);
    $('#footer_user_number').html( format10D(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].TenDigitNumber[0].Number) );
    //populate call mask, easiest way I could find to do all these and get the fanciness David P. wanted was to separate them all like this
    $('#call_mask_number').html( format10D(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].TenDigitNumber[0].Number) );
    $('#vconumber').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCONumber);
    $('#vcoext').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCOExt);
    $('#vconumber_global').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCONumber);
    $('#vcoext_global').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCOExt);
    $('#ep_email').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].EmailAddress);//PNG-1115 KTRUMBLE 05012013 - should populate email address when the rest of the settings are populated
    setupSettingsView();
    setServerSideSettingsToggles();
    hideStartupMask();
    var userDefaultColor = "#FFFFFF";
    //WKRASKO 101612 - PNG-229, have to compare username case insensitive, since login is
    if(isDefined(applicationSettings.logins)){
        $.each(applicationSettings.logins, function(k,v){
            if(k.toLowerCase()==JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].Username.toLowerCase()){
                if( isDefined(v.color) ){
                    userDefaultColor = v.color;
                    $('#footer_thumb').css('background-color',v.color);
                    $('#call_mask_thumb').css('background-color',v.color);
                    $('#profileAvatarWrapper').css('background-color',v.color);
                    $('.profileColorChoice').removeClass('colorSelected');
                    if(v.color=="")
                        $('#profileColorNone').addClass('colorSelected');
                    else
                        $("#profileColorChoiceWrapper").find("[data-code='" + v.color.toUpperCase() + "']").addClass('colorSelected');
                }
            }
        });
    }
    JAMBO_APP.WebServices.getUserAvatar(JAMBO_APP.activeUserAccount, function(result){
        if(result.ResultCode=="OK"){
            $('#footer_avatar').attr('src','data:'+result.MimeType+';base64,'+result.Image);
            $('#settings_profile_avatar').attr('src','data:'+result.MimeType+';base64,'+result.Image).load(function(){
                scaleAvatar();
            });
        }
    });
    $('.profileColorChoice').unbind().click(function(){
        var tempApplicationSettings = $.extend(true, {}, applicationSettings);
        //WKRASKO 101612 - PNG-229, have to compare username case insensitive, since login is
        var newColor = $(this).data('code');
        if( newColor == "#none" || newColor=="none" )//WKRASKO 101812 - PNG-509, includes mods to jquery.simple-color.js
            newColor = "";
        console.log("new color is: "+newColor);
        if(isDefined(applicationSettings.logins)){
            $.each(applicationSettings.logins, function(k,v){
                if(k.toLowerCase()==JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].Username.toLowerCase()){
                    tempApplicationSettings.logins[k].color = newColor;
                }
            });
        }
        //tempApplicationSettings.logins[JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].Username]["color"] = $(this).val();
        __thisWindowProxy__.setApplicationSettings(tempApplicationSettings, function(response){
            if (response.result.returnValue) {
                applicationSettings = tempApplicationSettings;
                $('#footer_thumb').css('background-color',newColor);
                $('#call_mask_thumb').css('background-color',newColor);
                $('#profileAvatarWrapper').css('background-color',newColor);
                $('.profileColorChoice').removeClass('colorSelected');
                if(newColor=="")
                    $('#profileColorNone').addClass('colorSelected');
                else
                    $("#profileColorChoiceWrapper").find("[data-code='" + newColor.toUpperCase() + "']").addClass('colorSelected');
            } else {
                __log__.warn("Error while saving autoanswer, restoring previously selected value, reason["+response.result.reason+"]");
            }
        });
    });
    $('#changeAvatarButton').unbind().click(popChangeAvatar);
    if( !isDefined(applicationSettings.minimizeOnLogon) || !applicationSettings.minimizeOnLogon || !isDefined(applicationSettings.muteVideoOnMinimize) || !applicationSettings.muteVideoOnMinimize )
        showEmbeddedVideoComposer();
    //Set settings stuff up
    setSettingsStuff();
    if( isDefined(applicationSettings.minimizeOnLogon) && applicationSettings.minimizeOnLogon )
        setTimeout(function(){__thisWindow__.showMinimized();isMin = "hidden";},2000);//Might be a better way? Appear stuff doesn't draw if you don't get composer shown first.
    enableLoginForm();//WKRASKO 103112 - PNG-372, new signin progress
    //WKRASKO 103112 - PNG-451, save mic muted for login. Restore here.
    if(isDefined(applicationSettings.logins)){
        $.each(applicationSettings.logins, function(k,v){
            if(k.toLowerCase()==JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].Username.toLowerCase()){
                if( isDefined(v.micMuted) ){
                    lineRepository.setMicMuted(v.micMuted);
                }
            }
        });
    }
    if(clickToCall && clickToCall10D!=""){//WKRASKO 110612 - PNG-455, click to call support
        //User already logged in (app running), do click-to-call here if set. Otherwise, check on login
        clickToCall = false;
        var ctcDisplayName = clickToCall10D;
        var tempLookupName = JAMBO_APP.ContactList.contactNamesByNumber(ctcDisplayName);
        if( tempLookupName!=null && tempLookupName.length>0 )
            ctcDisplayName = tempLookupName[0]+' '+tempLookupName[1];
        var validDialString=validateDialString(clickToCall10D);
        if(validDialString.status) {
            initCallFromDialString(validDialString.dialString, ctcDisplayName, validDialString.type);
        }
        clickToCall10D = "";
    }
}

scaleAvatar=function(){
    var avatarImage = $("#settings_profile_avatar");
    var theAvatar = new Image();
    theAvatar.src = avatarImage.attr("src");
    var avatarWidth = theAvatar.width;
    var avatarHeight = theAvatar.height;
    if(avatarWidth > avatarHeight){
        $('#settings_profile_avatar').css({'width':100,'height':'auto'});
        $('#footer_avatar').css({'width':21,'height':'auto'});
    } else {
        $('#settings_profile_avatar').css({'height':100,'width':'auto'});
        $('#footer_avatar').css({'height':21,'width':'auto'});
    }
}

function setSettingsStuff(){
    updateAudioCaptureDevices();
    updateAudioPlaybackDevices();
    updateVideoDevices();
    updateNotificationDevices();
}

function setSettingsToggles() {

    /** TOGGLE - AUTO ANSWER **/
    $('#autoanswer_toggle').empty();
    var autoAnswerState = false; if( isDefined(applicationSettings.autoanswer) && applicationSettings.autoanswer ) autoAnswerState = true;
    var radioStr = '<input type="radio" id="autoanswer_radio_on" name="autoanswer_radio" value="on" /><label for="autoanswer_radio_on" class="typeToggle">On</label>';
    radioStr += '<input type="radio" id="autoanswer_radio_off" name="autoanswer_radio" value="off" /><label for="autoanswer_radio_off" class="typeToggle">Off</label>';
    $('#autoanswer_toggle').append(radioStr);

    if (autoAnswerState) { $('#autoanswer_radio_on').attr('checked', true);
    } else { $('#autoanswer_radio_off').attr('checked', true); }

    $('#autoanswer_toggle').buttonset();
    $('#autoanswer_toggle').unbind().change(function () {
        autoAnswerState = ($('[name=autoanswer_radio]:checked').val() == "on") ? true : false;
        var tempApplicationSettings = $.extend(true, {}, applicationSettings);
        tempApplicationSettings["autoanswer"] = autoAnswerState;
        __thisWindowProxy__.setApplicationSettings(tempApplicationSettings, function(response){
            if (response.result.returnValue) {
                applicationSettings = tempApplicationSettings;
            } else {
                __log__.warn("Error while saving autoanswer, restoring previously selected value, reason["+response.result.reason+"]");
            }
        });
        console.log("Turned Auto Answer: " + autoAnswerState);
    });

    /** TOGGLE - ALWAYS ON TOP **/
    $('#ontoponcall_toggle').empty();
    var aotdcState = false; if( isDefined(applicationSettings.alwaysOnTopDuringCall) && applicationSettings.alwaysOnTopDuringCall ) aotdcState = true;
    var radioStr = '<input type="radio" id="ontoponcall_radio_on" name="ontoponcall_radio" value="on" /><label for="ontoponcall_radio_on" class="typeToggle">On</label>';
    radioStr += '<input type="radio" id="ontoponcall_radio_off" name="ontoponcall_radio" value="off" /><label for="ontoponcall_radio_off" class="typeToggle">Off</label>';
    $('#ontoponcall_toggle').append(radioStr);

    if (aotdcState) { $('#ontoponcall_radio_on').attr('checked', true);
    } else { $('#ontoponcall_radio_off').attr('checked', true); }

    $('#ontoponcall_toggle').buttonset();
    $('#ontoponcall_toggle').unbind().change(function () {
        aotdcState = ($('[name=ontoponcall_radio]:checked').val() == "on") ? true : false;
        var tempApplicationSettings = $.extend(true, {}, applicationSettings);
        tempApplicationSettings["alwaysOnTopDuringCall"] = aotdcState;
        __thisWindowProxy__.setApplicationSettings(tempApplicationSettings, function(response){
            if (response.result.returnValue) {
                applicationSettings = tempApplicationSettings;
            } else {
                __log__.warn("Error while saving alwaysOnTopDuringCall, restoring previously selected value, reason["+response.result.reason+"]");
            }
        });
        console.log("Turned Always On Top: " + aotdcState);
    });

    /** TOGGLE - MUTE VIDEO ON MINIMIZE **/
    $('#mutevideoonmin_toggle').empty();
    var mutevidonminState = false; if( isDefined(applicationSettings.muteVideoOnMinimize) && applicationSettings.muteVideoOnMinimize ) mutevidonminState = true;
    var radioStr = '<input type="radio" id="mutevideoonmin_radio_on" name="mutevideoonmin_radio" value="on" /><label for="mutevideoonmin_radio_on" class="typeToggle">On</label>';
    radioStr += '<input type="radio" id="mutevideoonmin_radio_off" name="mutevideoonmin_radio" value="off" /><label for="mutevideoonmin_radio_off" class="typeToggle">Off</label>';
    $('#mutevideoonmin_toggle').append(radioStr);

    if (aotdcState) { $('#mutevideoonmin_radio_on').attr('checked', true);
    } else { $('#mutevideoonmin_radio_off').attr('checked', true); }

    $('#mutevideoonmin_toggle').buttonset();
    $('#mutevideoonmin_toggle').unbind().change(function () {
        aotdcState = ($('[name=mutevideoonmin_radio]:checked').val() == "on") ? true : false;
        var tempApplicationSettings = $.extend(true, {}, applicationSettings);
        tempApplicationSettings["muteVideoOnMinimize"] = aotdcState;
        __thisWindowProxy__.setApplicationSettings(tempApplicationSettings, function(response){
            if (response.result.returnValue) {
                applicationSettings = tempApplicationSettings;
            } else {
                __log__.warn("Error while saving muteVideoOnMinimize, restoring previously selected value, reason["+response.result.reason+"]");
            }
        });
        console.log("Turned Mute video on minimize: " + aotdcState);
    });


    /** TOGGLE - MINIMIZE DURING SIGN IN**/
    $('#minonlogon_toggle').empty();
    var minonlogonState = false; if( isDefined(applicationSettings.minimizeOnLogon) && applicationSettings.minimizeOnLogon ) minonlogonState = true;
    var radioStr = '<input type="radio" id="minonlogon_radio_on" name="minonlogon_radio" value="on" /><label for="minonlogon_radio_on" class="typeToggle">On</label>';
    radioStr += '<input type="radio" id="minonlogon_radio_off" name="minonlogon_radio" value="off" /><label for="minonlogon_radio_off" class="typeToggle">Off</label>';
    $('#minonlogon_toggle').append(radioStr);

    if (aotdcState) { $('#minonlogon_radio_on').attr('checked', true);
    } else { $('#minonlogon_radio_off').attr('checked', true); }

    $('#minonlogon_toggle').buttonset();
    $('#minonlogon_toggle').unbind().change(function () {
        minonlogonState = ($('[name=minonlogon_radio]:checked').val() == "on") ? true : false;
        var tempApplicationSettings = $.extend(true, {}, applicationSettings);
        tempApplicationSettings["minimizeOnLogon"] = minonlogonState;
        __thisWindowProxy__.setApplicationSettings(tempApplicationSettings, function(response){
            if (response.result.returnValue) {
                applicationSettings = tempApplicationSettings;
            } else {
                __log__.warn("Error while saving minimizeOnLogon, restoring previously selected value, reason["+response.result.reason+"]");
            }
        });
        console.log("Turned Minimize during sign in: " + aotdcState);
    });



    $('#profileAvatarColor .minusSignAvatar').unbind('click').bind('click',function(){
        openMessagePopup('#messagePop',_i18n_.get("MENU_DELETE_AVATAR"),_i18n_.get("MSG_WARN_DELETE_AVATAR"),_i18n_.get("COMMON_CONFIRM"),true,function(){
            JAMBO_APP.WebServices.deleteUserAvatar(JAMBO_APP.activeUserAccount,function(result){
                if(result.ResultCode=="OK"){
                    $('#footer_avatar').attr('src','img/spacer.gif');
                    $('#settings_profile_avatar').attr('src','img/spacer.gif');
                } else {
                    console.log(result);
                }
            });
        });
    });
    // END UI REVISION per DP
    if(isDefined(coreSettings)){
        /** TOGGLE - ACOUSTIC ECHO CANCELLER **/
        $('#aec_toggle').empty();
        var aecState = false; if( isDefined(coreSettings.useAEC) && coreSettings.useAEC ) aecState = true;
        var radioStr = '<input type="radio" id="aec_radio_on" name="aec_radio" value="on" /><label for="aec_radio_on" class="typeToggle">On</label>';
        radioStr += '<input type="radio" id="aec_radio_off" name="aec_radio" value="off" /><label for="aec_radio_off" class="typeToggle">Off</label>';
        $('#aec_toggle').append(radioStr);

        if (aecState) { $('#aec_radio_on').attr('checked', true);
        } else { $('#aec_radio_off').attr('checked', true); }

        $('#aec_toggle').buttonset();
        $('#aec_toggle').unbind().change(function () {
            aecState = ($('[name=aec_radio]:checked').val() == "on") ? true : false;
            var tempApplicationSettings = $.extend(true, {}, applicationSettings);
            tempApplicationSettings["useAEC"] = aecState;
            __thisWindowProxy__.setApplicationSettings(tempApplicationSettings, function(response){
                if (response.result.returnValue) {
                    applicationSettings = tempApplicationSettings;
                } else {
                    __log__.warn("Error while saving useAEC, restoring previously selected value, reason["+response.result.reason+"]");
                }
            });
            console.log("Turned Acoustic Echo Canceller: " + aotdcState);
        });
    }
}

setServerSideSettingsToggles = function () {
    $("#vcotype_toggle").buttonset();
    $("#vcotype_toggle_global").buttonset();

    $('#vcoradio0').attr("checked", false);
    $('#vcoradio1').attr("checked", false);
    $('#vcoradio2').attr("checked", false);
    $('#vcoradio0_global').attr("checked", false);
    $('#vcoradio1_global').attr("checked", false);
    $('#vcoradio2_global').attr("checked", false);

    var OneLineVCO = false;
    var TwoLineVCO = false;

    if (isDefined(JAMBO_APP.userAccounts) && isDefined(JAMBO_APP.activeUserAccount) && isDefined(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount])) {
        if (isDefined(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].OneLineVCO))
            OneLineVCO = JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].OneLineVCO;

        if (isDefined(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCOUser))
            TwoLineVCO = JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCOUser;
    }
    
    if (OneLineVCO) {
        $('#vcoradio1').attr("checked", true);
        $('#vcoradio1_global').attr("checked", true);
        $('#vconumber').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCONumber);
        $('#vcoext').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCOExt);
        $('#vconumber_global').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCONumber);
        $('#vcoext_global').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCOExt);
    } else if (TwoLineVCO) {
        $('#vcoradio2').attr("checked", true);
        $('#vconumber').removeAttr('disabled');
        $('#vcoext').removeAttr('disabled');
        $('#vconumber').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCONumber);
        $('#vcoext').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCOExt);

        $('#vcoradio2_global').attr("checked", true);
        $('#vconumber_global').removeAttr('disabled');
        $('#vcoext_global').removeAttr('disabled');
        $('#vconumber_global').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCONumber);
        $('#vcoext_global').val(JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].VCOExt);
    } else {
        $('#vcoradio0').attr("checked", true);
        $('#vcoradio0_global').attr("checked", true);
        $('#vconumber_global').attr('disabled',true);
        $('#vcoext_global').attr('disabled',true);
    }
    $('#vcotype_toggle').buttonset("refresh");
    $('#vcotype_toggle_global').buttonset("refresh");

    $('#vconumber').mask('9999999999');
    $('#vconumber_global').mask('9999999999');

    $('[name="vcotype_radio"]').unbind().change(function () {
        if ($('[name="vcotype_radio"]:checked').val() == "0" || $('[name="vcotype_radio"]:checked').val() == "1") {
            $('#vconumber').attr('disabled', 'disabled');
            $('#vcoext').attr('disabled', 'disabled');
        } else {
            $('#vconumber').removeAttr('disabled');
            $('#vcoext').removeAttr('disabled');
        }
    });

    $('[name="vcotype_radio_global"]').unbind().change(function () {
        //PNG-1015 KTRUMBLE 04012013 - dial pane settings should update on change
        var vcoType = $('[name="vcotype_radio_global"]:checked').val();
        if (vcoType == "0" || vcoType == "1") {
            $('#vconumber').attr('disabled', 'disabled');
            $('#vcoext').attr('disabled', 'disabled');
            $('#vconumber_global').attr('disabled', 'disabled');
            $('#vcoext_global').attr('disabled', 'disabled');
        } else {
            $('#vconumber').removeAttr('disabled');
            $('#vcoext').removeAttr('disabled');
            $('#vconumber_global').removeAttr('disabled');
            $('#vcoext_global').removeAttr('disabled');
        }
        $.each($('[name="vcotype_radio"]'), function (i) {
            $(this).attr('checked', false);
            if ($(this).val() == vcoType) $(this).attr('checked', true);
        });
        $('#vcotype_toggle').buttonset("refresh");
    });

    if (applicationSettings.mode == "kiosk") {
        //Call Settings section

        $('#vcoradio0_label span').text('Off');
        $('#vcoradio0_label').removeClass('ui-corner-left');
        $('#vcoradio0_label').addClass('ui-corner-right');

        $('#vco_oneline_label span').text('On');
        $('#vco_oneline_label').addClass('ui-corner-left');

    }
    else {
    }

}

showMissedCalls = function(){
    var missedCount = parseInt($('#missedCallsCount').text());//WKRASKO 102312 - PNG-612, moved here, representing missed calls for the session.
    for(var i=0; i<availableLines; i++){
        if(lineInfo[i]!=null && lineInfo[i].missed == true){
            missedCount += 1;
            console.log(missedCount);
            //console.log('############### lineInfo[i]!=null && lineInfo[i].missed == true');
            var favclass = (JAMBO_APP.ContactList.isFavoriteByNumber(lineInfo[i].dialNumber)) ? "favStar" : "";
            var favclassOncall = (JAMBO_APP.ContactList.isFavoriteByNumber(lineInfo[i].dialNumber)) ? "favStarMissedOnCall" : "";
            var formattedNum = lineInfo[i].dialNumber;
            if(sipPhonePurpReg.test(formattedNum))
                formattedNum = format10D(formattedNum);
            var nameToShow = lineInfo[i].displayName;
            if(JAMBO_APP.ContactList.contactNameByNumber(lineInfo[i].dialNumber)!=null)
                nameToShow = JAMBO_APP.ContactList.contactNameByNumber(lineInfo[i].dialNumber);
            nameToShow=(nameToShow=='unknown')?nameToShow+' &nbsp;':nameToShow; //KTRUMBLE 09242012 PNG-462 - adding some "padding" to the right of the name, if unknown
            //WKRASKO 092012 - PNG-456
            var numberType = JAMBO_APP.ContactList.getNumTypeByNumber(lineInfo[i].dialNumber);
            //KTRUMBLE 09242012 PNG-462 - this allows us to hide the numtype field if it's unknown
            var unknownType = '';
            if(numberType==null || numberType==""){ unknownType=' dn'; numberType=''; }
            else if(!onCall)
                numberType=numberType+' -';
            //END PNG-462
            var tempEntry = {
                "callTime":lineInfo[i].callTime,
                "favClass":favclass,
                "favClassOnCall":favclassOncall,
                "displayName":nameToShow,
                "callNumber":lineInfo[i].dialNumber,
                "displayNumber":formattedNum,
                "numberType": numberType,
                "missedLabel": _i18n_.get("GUI_SYSTRAY_TITLE_MISSED_CALL"),
                "unknownType": unknownType //KTRUMBLE 09242012 PNG-462
            };
            if(onCall){
                $.tmpl(JAMBO_APP.missedCallsOnCallTemplate, tempEntry).appendTo("#callMask").delay(500).show('slide',{direction:'up'},500);//KTRUMBLE 09252012 PNG-346 - remove the hide .delay(5000).hide('slide',{direction:'down'},500,function(){$(this).remove();});
            } else {
                hideEmbeddedVideoComposer();
                $('#popDiv').show();//Incoming call popup close close this, so re-open either way
                $('.missedCallsRow:visible').hide();
                $.tmpl(JAMBO_APP.missedCallsRowTemplate, tempEntry).insertBefore(".missedCallsForwardArrow");
                if( $('#missedCalls').is(':visible') ){
                    //Add to dialog and show extra stuffs
                    if(missedCount>1){
                        $('#missedCallsLabelCount').show().text( $('.missedCallsRow').size() );
                        $('#missedCallsPaginator').show().text( $('.missedCallsRow').size()+' of '+$('.missedCallsRow').size() );
                        $('.missedCallsBackArrow').show();
                        $('.missedCallsForwardArrow').show();
                    }
                    $('#missedCallsLabel').text( " "+_i18n_.get("GUI_SYSTRAY_TITLE_MISSED_CALLS") );
                    $('#missedCallsIgnore').text( _i18n_.get("GUI_MISSED_CALLS_IGNORE_ALL") );
                } else {
                    //Show missed calls window with new item
                    $('#missedCallsLabelCount').hide().text('1');
                    $('#missedCallsPaginator').hide().text('1 of 1');
                    $('.missedCallsBackArrow').hide();
                    $('.missedCallsForwardArrow').hide();
                    $('#missedCalls').show();
                    $('#missedCallsLabel').text( _i18n_.get("GUI_SYSTRAY_TITLE_MISSED_CALL") );
                    $('#missedCallsIgnore').text( _i18n_.get("GUI_MISSED_CALLS_IGNORE") );
                }
                repositionPopUpEnvironment("#missedCalls");
            }
            lineInfo[i] = null;//Reset storage
            syncHistory();
        } //else console.log('############### else');
    }
    $('#missedCallsCount').text(missedCount);
    if( missedCount>0 )
        $('#missedCallsCount').css({'background-color':'#896b9c'});
    else
        $('#missedCallsCount').css({'background-color':'#868686'});
}

function __windowMinimized(){
    if( JAMBO_APP.activeUserAccount != null && isDefined(applicationSettings.muteVideoOnMinimize) && applicationSettings.muteVideoOnMinimize ){
        if(onCall){
            lineRepository.setCameraPrivacyMode(true);//WKRASKO 073012 - PNG-275
            isMin = "private";
        } else {//PNG-533 KTRUMBLE 02072013 - update from Mirial to fix mute on minimize problem for mac
            cameraDevice = coreSettings.cameraDevice; // save the current camera device to resume it when going back from minimized
            __thisWindowProxy__.setCoreSettings(
                {"cameraDevice":"-"}, // change only this parameter
                false, // do not restart audio
                true, // do restart video
                false, // do not restart endpoints
                false // do not continue initialization
            );
            isMin = "hidden";
        }
    }
}

function __windowNormal(){
    if( JAMBO_APP.activeUserAccount != null && isMin !== "false" ){
        if(isMin=="private")
            lineRepository.setCameraPrivacyMode(false);//WKRASKO 073012 - PNG-275
        else {//PNG-533 KTRUMBLE 02072013 - update from Mirial to fix mute on minimize problem for mac
            if (cameraDevice !== 'undefined') {
                __thisWindowProxy__.setCoreSettings(
                    {"cameraDevice":cameraDevice}, // change only this parameter
                    false, // do not restart audio
                    true, // do restart video
                    false, // do not restart endpoints
                    false // do not continue initialization
                );
            }
        }
        isMin = "false";
    }
}

//WKRASKO 091412 - PNG-384, do not do while in full screen mode, plus mods to windowNormal above
//Crap, this call is broken in core (not even getting a console log from it)
//Will also need an opposite, for leaving full screen to reset if on call:
//if(isDefined(applicationSettings.alwaysOnTopDuringCall) && applicationSettings.alwaysOnTopDuringCall)
    //__thisWindow__.setAlwaysOnTop(true);
function __windowFullScreen(){
    if(__thisWindow__.isAlwaysOnTop()){
        __thisWindow__.setAlwaysOnTop(false);
    }
}

function __trayIconActivated(){
    if(getCurrentOS()!== OSType.MacOS)
        setTimeout(showEmbeddedVideoComposer,200);
}

function micChecker(micMuted){
    if(micMuted){
        $('#newAudioMute').addClass('muted');
    } else {
        $('#newAudioMute').removeClass('muted');
    }
    //WKRASKO 103112 - PNG-451, save setting per user.
    var username = $('#startupMask #signin #loginUsername').val();
    if (currentUiStatus==UiStatus.initialized && isDefined(applicationSettings.logins) && isDefined(applicationSettings.logins[username])){
        applicationSettings.logins[username].micMuted = micMuted;
        __thisWindowProxy__.setApplicationSettings(applicationSettings);
    }
}

function cameraPrivacyChecker(privacyOn){
    if(privacyOn){
        $('#newVideoMute').removeClass('muted');
    } else {
        $('#newVideoMute').addClass('muted');
    }
}

var notifyLineLabel = null;
function notifyAlreadyOnVRS(){
    for(var i=0; i<availableLines; i++){//Find idle(outgoing) line
        var tempLine = lineRepository.getLine(i);
        if(tempLine.idle){
            //Display message
            notifyLineLabel = tempLine.label;
            $('div#invalidEntryMessage').html(_i18n_.get("MSG_ERR_TWO_VRS")).show().delay(3000).fadeOut(500,function(){
                //PNG-457 KTRUMBLE 09219012 - for some reason, in windows, if you don't explicitly hide the message, it reappears on minimize/maximize
                //$('div#'+notifyLineLabel+' div.activeCallMessage').hide();
                $('div#invalidEntryMessage').html('');
            });
        }
    }
}
//PNG-186 KTRUMBLE 10302012 - Add P2PChat
var P2PdStr = null,P2PDisplayName = null,remotePartyUri;
enableP2PChat = function(line){
    JamboSocket.dialStr=line.call.remote.dialString;//PNG-513 KTRUMBLE 11022012 - needs to work with P2PChat, too
    if(JamboSocket.dialStr.startsWith('sip:')) JamboSocket.dialStr=JamboSocket.dialStr.split('sip:')[1].split('@')[0];
    if (isDefined(line.call.remote.displayName)) { P2PDisplayName = sanitize(line.call.remote.displayName); }
    if (P2PDisplayName!=null && (!isDefined(P2PDisplayName) || (P2PDisplayName.trim() === ""))) { P2PDisplayName = sanitize(getDisplayName('<'+line.call.remote.dialString+'>')); }
    if(P2PDisplayName==null){
        if(P2PdStr.startsWith('sip:')){
            P2PDisplayName=P2PdStr.split('sip:')[1].split('@')[0];
        }
    }
    //check to see if contact exists, create new MCS contact, if not TODO
    var contactsConfiguration = applicationSettings.contacts;
    __thisWindowProxy__.getContacts(contactsConfiguration, function(response){
        if(response.result.contacts.length==0){
            //console.log('no MCS contacts');
        } else console.log(response.result.contacts.length+' MCS contacts');
    });
    P2PChatEnabled = true;
    JamboSocket.enableSend();
}
//END PNG-186
iTRSLookupSuccessOutgoing = function(result, dialString, displayName){
    if(displayName==null)displayName=dialString;
    dialString = dialString.toString(); displayName = displayName.toString();//WKRASKO 110212 - PNG-654, weird, but sometimes iTRS lookup return an int vs string.
    //WKRASKO 091412 - PNG-379, should never end up with socket for self record
    if( (dialString.indexOf("selfrecord")!=-1 || (result.ResultCode!="Error" && (result.ResultCode=="OK" && result.ResultMessage=="Phone number found"))) && jQuery.inArray(dialString,callGroupArray)==-1 ){
        actuallyDoCallFromDialString(dialString,displayName,false);
        return;
    } else {
        P2PChatEnabled = false;//PNG-186 KTRUMBLE 10302012 - Add P2PChat
        if(JamboSocket.isVRS){//WKRASKO 091412 - PNG-355, do not allow 2 VRS calls, moved 101012
            notifyAlreadyOnVRS();
        } else if(dialString!=''){//PNG-333 KTRUMBLE 08162012 - actuallyDoCallFromDialString doesn't dial if the dialstring is empty, we should do nothing here, as well.
            JamboSocket.isVRS = true;
            JamboSocket.init(dialString, displayName, Line.CallStatus.DIALING,true);
        }
    }
}
//WKRASKO - Could have used same function, with another param, but separating in case something unique comes up, which is highly possible.
iTRSLookupSuccessIncoming = function(result, dialString, displayName){
    //WKRASKO 112812 - PNG-726, make sure var exists before calling toString
    if(isDefined(dialString))
        dialString = dialString.toString();
    if(isDefined(displayName))
        displayName = displayName.toString();//WKRASKO 110212 - PNG-654, weird, but sometimes iTRS lookup return an int vs string.
    if( (dialString.indexOf("selfrecord")!=-1 || (result.ResultCode!="Error" && (result.ResultCode=="OK" && result.ResultMessage=="Phone number found"))) && jQuery.inArray(dialString,callGroupArray)==-1 ){
        return;
    } else {
        P2PChatEnabled = false;//PNG-186 KTRUMBLE 10302012 - Add P2PChat
        JamboSocket.isVRS = true;
        JamboSocket.init(dialString, displayName, Line.CallStatus.INCOMING);
    }
}
iTRSLookupFail = function(){
    if(!onCall){//WKRASKO 121112 - PNG-782, if already on VRS, we shouldn't reset this, otherwise, second attempt at VRS on line 2 will not show "no 2 vrs calls" error
        JamboSocket.isVRS = false;//WKRASKO 080212 - PNG-264, Need to default to false, or we get stuck in a loop Frank doesn't like'
        P2PChatEnabled = false;//PNG-186 KTRUMBLE 10302012 - Add P2PChat
    }
    //Also, need to show user error message here now, it won't call at all on a failed lookup
}

callGroupSuccess = function(result){
    if(result.ResultCode=="OK" && isDefined(result.CallGroup) && result.CallGroup.length>0){
        //Parse to global callGroupArray
        callGroupArray = [];
        $.each(result.CallGroup,function(k,v){
            callGroupArray.push(v.DialString);
        });
    }
}
//PNG-186 KTRUMBLE 10302012 - Add P2PChat
function handleInstantMsg(instantMsgData) {
    if(onCall && P2PChatEnabled){
        if (!isDefined(instantMsgData.myUri)) { instantMsgData.myUri = "contact:self"; }
        var instantMsg = new InstantMsg(instantMsgData);
        if (instantMsg.sourceUri.startsWith("contact:")) {
            var contactUri = instantMsg.sourceUri.substring(8);
            instantMsgData.destinationUri = "contact:"+contactUri;
        }
        
        //don't show top border if no messages
        var topBorder="";
        if(JamboSocket.hasMessages==false){
            topBorder='Top';
        }
        else topBorder='';
        
        if(instantMsg.sourceUri=="contact:self"){//outgoing
            JamboSocket.displayChatMessage(instantMsgData.message);
        } else {//incoming
            //get time.
            var time=new Date();
            var hour=time.getHours();
            var minutes=time.getMinutes();
            if(minutes.toString().length==1)minutes='0'+minutes.toString();
            if(hour>=13)hour=hour-12;
            time=hour+':'+minutes;
            //sometimes the 10d is still the only thing listed. let's check one more time for a contact name
            if(JAMBO_APP.ContactList.contactExists(P2PDisplayName)){
                P2PDisplayName=JAMBO_APP.ContactList.contactNamesByNumber();
            }
            if(P2PDisplayName=='') P2PDisplayName=$('div.activeTab div.activeCallDisplayName').html();
            //add text to chat window
            $.tmpl(JamboSocket.chatDiv, {
                "topBorder":topBorder,
                "blobType":"Incoming",
                "senderName":P2PDisplayName,
                "blobTime":time,
                "blobText":instantMsgData.message,
                "fontClass":JamboSocket.fontClass
            }).appendTo("#terpChat_wrap");

            //scroll chat window to bottom
            $("#terpChat_wrap").scrollTop($("#terpChat_wrap")[0].scrollHeight);
        }
        JamboSocket.hasMessages=true;
    }
}
//END PNG-186
getFlasher = function(){
    var fdevice = "";
    if(isDefined(coreSettings.ringNotifications)){
        for(var i=0; i<coreSettings.ringNotifications.length; i++){
            if(coreSettings.ringNotifications[i].deviceClass==Command.notificationDeviceClass.Flasher)
                fdevice = coreSettings.ringNotifications[i].device;
        }
    }
    return fdevice;
}

//WKRASKO 103012 - PNG-372, new sign in progress.
disableLoginForm = function(){
    $('#loginUsername').attr('disabled','disabled');
    $('#loginPassword').attr('disabled','disabled');
    $('#loginSavePassword').attr('disabled','disabled');
    $('#loginAutomatic').attr('disabled','disabled');
    $('#signinBottomDisabler').show();
    $('#loginDo').html('<img id="signinWorking" class="signinAnimation" src="img/loading.gif"/>'+_i18n_.get('GUI_CFG_GENERAL_SIGNIN')).addClass('loginWorking');
}

enableLoginForm = function(){
    $('#loginUsername').removeAttr('disabled');
    $('#loginPassword').removeAttr('disabled');
    $('#loginSavePassword').removeAttr('disabled');
    $('#loginAutomatic').removeAttr('disabled');
    $('#signinBottomDisabler').hide();
    $('#loginDo').html(_i18n_.get('GUI_CFG_GENERAL_SIGNIN')).removeClass('loginWorking');
}

function toggleAutoStart(){
    var newCoreSettings = {};
    newCoreSettings["autostart"] = !coreSettings.autostart;
    __thisWindowProxy__.setCoreSettings(newCoreSettings, false, false, false, false, function(response){
        if (response.result.returnValue) {
            __log__.info("Successfully toggled autostart programatically.");
            $.extend(coreSettings, newCoreSettings);
            setTrayMenu(false, true);
        } else {
            __log__.warn("Error while saving newCoreSettings.");
        }
    });
}
//PNG-935 KTRUMBLE 04162013 - fix div scroll position function; was setting the position to 0 every time
var currentView = "NewCall";
function saveDivScrollPositions(view) {
    var divName = '';
    if(currentView == 'Contacts' || currentView == 'History' || currentView == 'PurpleMail' || currentView == 'Favorites'){
        switch(currentView){
            case 'Contacts': divName = 'contacts'; break;
            case 'Favorites': divName = 'favoritesList'; break;
            case 'History': divName = 'historyList'; break;
            case 'PurpleMail': divName = 'purpleMailMessages'; break;
        }
        scrollPositions[currentView] = $('#'+divName).scrollTop();
    }
    currentView = view;
}

function setDivScrollPositions(view) {
    var divName = '';
    switch(view){
        case 'Contacts': divName = 'contacts'; break;
        case 'Favorites': divName = 'favoritesList'; break;
        case 'History': divName = 'historyList'; break;
        case 'PurpleMail': divName = 'purpleMailMessages'; break;
    }
    $('#'+divName).scrollTop(scrollPositions[view]);
}
//END PNG-935

function getPlatform() {
    var platform = "";
    if (typeof JAMBO_APP.activeUserAccount !== 'undefined' && 
        typeof JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount] !== 'undefined' &&
        typeof JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].PlatformName !== 'undefined') {
        platform = JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].PlatformName;
    }
    return platform;
}
function vri_display_settings() {
    $('#SettingsBtn').click();
}
function vri_close_settings() {
    $('#NewCallBtn').click();
    $(window).resize();
    setTimeout("setVideoDimension();", 1000);
}

//WKRASKO 051713 - PNG-1024
translateInCallButtons = function(){
    if($('#newVideoLayout').length>0)
        $('#newVideoLayout').attr('title',_i18n_.get("ONCALL_CONTROLS_TOOLTIP_VLAYOUT"));
    //Dynamic ones
    if($('#newVideoFullScreen').length>0){
        if(fullScreen)
            $('#newVideoFullScreen').attr('title',_i18n_.get("ONCALL_CONTROLS_TOOLTIP_NORMAL_MODE"));
        else
            $('#newVideoFullScreen').attr('title',_i18n_.get("ONCALL_CONTROLS_TOOLTIP_VOM"));
    }
    if($('#newAudioMute').length>0){
        var tempState = "Off";
        if($('#newAudioMute div.callScreenInner').data('state')=='notmuted')
            tempState = "On";
        $('#newAudioMute').attr('title',_i18n_.get("ONCALL_CONTROLS_AUDIO")+tempState);
    }
    if($('#newVideoMute').length>0){
        tempState = "Off";
        if($('#newVideoMute div.callScreenInner').data('state')=='muted')
            tempState = "On";
        $('#newVideoMute').attr('title',_i18n_.get("ONCALL_CONTROLS_VIDEO")+tempState);
    }
}