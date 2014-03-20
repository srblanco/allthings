var JAMBO_APP = JAMBO_APP || {};

//Application Properties Entity
JAMBO_APP.AppProperties = (function() {
    //PRIVATE
    var status = "Initialized"//"Needs Setup";
    
    //PUBLIC
    return {
        sipStr:"sip-lb.prod.purple.us",//WKRASKO 112912 - PNG-186, fixing this proper
        getStatus: function(){
            return status;
        },
        setStatus: function(newStatus){
            status = newStatus;
        }
    }
})();

//Application Device Entity, set on startup
JAMBO_APP.DeviceInfo = null;
JAMBO_APP.DeviceConfig = null;

//Application Camera settings
//Part of Mirial Core Settings, no need for a separate object, see core settings

//Application User AccountS (plural)
JAMBO_APP.userAccounts = {};
JAMBO_APP.activeUserAccount = null;//We store user GUID or the index to userAccounts?

JAMBO_APP.e911Object = null;

JAMBO_APP.e911SuggestionRowDesktop = "<tr data-rowNum='${choiceid}'>\n\
    <td><input type='radio' id='e911address_choice_${choiceid}' name='e911address_choice' value='${choiceid}' /></td>\n\
        <td>\n\
            <span class='e911_choice_type'>${choice_type}</span><br/>\n\
            <span class='e911_choice_address1'>${choice_address1}</span><br/>\n\
            <span class='e911_choice_address2'>${choice_address2}</span><br/>\n\
            <span class='e911_choice_city'>${choice_city}</span>, <span class='e911_choice_state'>${choice_state}</span> <span class='e911_choice_zip'>${choice_zip}</span>\n\
        </td>\n\
    </tr>";

JAMBO_APP.ipRelayURL = "https://www.i711.com/callPageP3TNG.php";

//Application/activeUserAccount Call History List/Entity
JAMBO_APP.CallHistory = (function() {
    //PRIVATE
    var history = null;//Holder for returned contacts from web services.
    //NOTES ON history entry properties:
    //Received Call: We want "source" for number, person who called in.
    //Dialed Call: We want "destination" for number, person we tried to call.
    
    //PUBLIC
    return{
        historyItemTemplate: "<hr class='dk' style='margin-left:23px;margin-right:23px;'/><div id='hNum_${id}' class='historyNum'><div class='fl'>${name}</div><div class='fr'><div class='fl ${fav_class}'></div> <div id='icon_${id}' class='numType ${number_type} fl'></div><div id='info_${id}' class='fl'>${number}&nbsp;&nbsp;${datestamp} ${duration}</div> <div class='${direction}_icon fl'></div></div></div>",
        //PNG-321 KTRUMBLE 08132012 .data() was stripping leading zeros of international numbers, adding the _ keeps the dialed string intact
        //PNG-490 KTRUMBLE 09292012 history contact first/last should be separate like the rest of the tabs
        historyItemTemplateDesktop: "<div id='hNum_${historySection}_${id}' class='historyNum contactItem_${evenodd}' data-cnID='${historySection}_${id}' data-the10d='${the10d}' data-historyRecordEditMenu='hNum|${id}|${historySection}|${lookupnum}|${BlockClass}|${UnblockClass}|${contactID}|${hasTranscripts}'>\n\
                    <div class='historyLCol fl'>\n\
                        <div class='historyNameShort historyFirstName fl' title='${first_name}'>${first_name}</div>\n\
                        <div class='historyNameShort historyLastName fl' title='${last_name}'>${last_name}</div>\n\
                    </div>\n\
                    <div class='historyRCol fl' data-the10d='_${the10d}'>\n\
                        <div class='favStar${fav_class} fl'></div>\n\
                        <div data-cnID='${historySection}_${id}' class='historyNumNumber fl'>${number}</div>\n\
                        <div id='icon_${id}' class='historyNumType numType fl'>${number_type}</div>\n\
                        <div class='cCallIcon dn'></div>\n\
                    </div>\n\
                    <div class='pmDate fl'>\n\
                        <div class='PMDate_date fl'>${PMDate}</div>\n\
                        <div class='PMDate_time fl'>${PMTime}</div>\n\
                    </div>\n\
                    <div class='${direction}_icon fr'></div>\n\
                </div>",
        
        populate: function(userGUID){
            JAMBO_APP.WebServices.getCallHistory(userGUID,JAMBO_APP.CallHistory.loadSuccess,JAMBO_APP.CallHistory.loadError);
        },
        loadSuccess: function(result){
            history = result.Calls;
            console.log("CallHistory: Successfully populated Call History from PWS.");
            clearCallHistory();
            buildTranscriptLib();
            drawCallHistory();
            if(isDefinedAsFunction(setDivScrollPositions))//WKRASKO 111512 - PNG-716
                setDivScrollPositions('History');//PNG-935 KTRUMBLE 04162013 - fix div scroll position function; was setting the position to 0 every time
        },
        loadError: function(){
            console.log("CallHistory: There was an error calling WebServices.getCallHistory.");
        },
        getHistory: function(){
            return history;
        },
        deleteHistory: function(userGUID){
            JAMBO_APP.WebServices.deleteCallHistory(userGUID,JAMBO_APP.CallHistory.deleteSuccess,JAMBO_APP.CallHistory.deleteError);
        },
        deleteSuccess: function(result){
            console.log("CallHistory: Success! Deleted history. ResultCode: "+result.ResultCode+", ResultMessage: "+result.ResultMessage);
        },
        deleteError: function(){
            console.log("CallHistory: There was an error calling WebServices.deleteCallHistoryEntry.");
        }
    }
})();

//Application FAQ List, holds questionObject's (below)
JAMBO_APP.faqs = new Array();
//Application Manual/Videos List, holds questionObject's (below)
JAMBO_APP.helpAndVideos = new Array();
//Application questionObject Entity
JAMBO_APP.QuestionObject = function(theTopic, theQuestion, theAnswer, theVideoURL) {
    //PRIVATE
    var topic = theTopic || '';
    var question = theQuestion || '';
    var answer = theAnswer || '';
    var videoURL = theVideoURL || null;
    
    //PUBLIC
    return{
        getTopic: function(){
            return topic;
        },
        getQuestion: function(){
            return question;
        },
        getAnswer: function(){
            return answer;
        },
        getVideoURL: function(){
            return videoURL;
        }
    }
};

JAMBO_APP.missedCallsRowTemplate = '<div id="missedCall" class="missedCallsRow fl">\n\
    <div class="missedFavHolder fl ${favClass}"></div>\n\
        <div id="missedName" class="fl" title="${displayName}">${displayName}</div>\n\
        <div class="numType cb fl${unknownType}">${numberType}</div>\n\
        <div id="missedNumber" class="fl" data-call_number="${callNumber}">${displayNumber}</div>\n\
        <div class="cb fl missedCallsTime">${callTime}</div>\n\
    </div>';

JAMBO_APP.missedCallsOnCallTemplate = '<div id="call_mask_missed" class="fr dn">\n\
        <div class="call_mask_missed_bottom"><img src="img/call_mask_missed_arrow.png" border="0" alt=""/></div>\n\
        <div class="call_mask_missed_content">\n\
            <div class="call_mask_missed_label fl">${missedLabel}</div>\n\
            <div class="call_mask_missed_close fr" onclick="$(\'#call_mask_missed\').last().hide(\'slide\',{direction:\'up\'},500,function(){$(\'#call_mask_missed\').last().remove();})">X</div>\n\
            <div class="call_mask_missed_data cb fl"><div class="fl call_mask_missed_displayname" title="${displayName}">${displayName}</div> <div class="cmmc_fav ${favClassOnCall} fl"></div> <div class="fl">${numberType}</div></div>\n\
        </div>\n\
    </div>';

//Blocked caller functionality
JAMBO_APP.BlockedNumbers = (function() {
    //PRIVATE
    var blockedNumbers = null;//Holder for returned blocked numbers.
    var blockedNumData  = new Array();
    var parseBlockedNumbers = function(){
        blockedNumData = [];
        if(blockedNumbers!=null){
            $.each(blockedNumbers, function(k) {
                var thisNum = blockedNumbers[k];
                var thisFav = JAMBO_APP.ContactList.isFavoriteByNumber(thisNum);
                var thisType = JAMBO_APP.ContactList.numberTypeByNumber(thisNum);
                var thisLabel = JAMBO_APP.ContactList.contactNamesByNumber(thisNum);
                if(thisNum!=null) blockedNumData.push({num:thisNum,fav:thisFav,type:thisType,label:thisLabel});
            });
        }
    }
    
    //PUBLIC
    return{
        blockFlag: false,
        getBlockedNumbers: function(){
            JAMBO_APP.WebServices.blockedNumbers(JAMBO_APP.activeUserAccount,JAMBO_APP.BlockedNumbers.LoadSuccess,JAMBO_APP.BlockedNumbers.LoadError);
        },
        blockNumber: function(number){
            JAMBO_APP.WebServices.blockNumber(JAMBO_APP.activeUserAccount,number,JAMBO_APP.BlockedNumbers.addNumber,JAMBO_APP.BlockedNumbers.BlockError);
        },
        unblockNumber: function(number){
            JAMBO_APP.WebServices.unblockNumber(JAMBO_APP.activeUserAccount,number,JAMBO_APP.BlockedNumbers.removeNumber,JAMBO_APP.BlockedNumbers.UnblockError);
        },
        LoadSuccess: function(result){
            blockedNumbers = result.PhoneNumbers;
            parseBlockedNumbers();
            console.log("BlockedNumbers: Successfully populated blocked numbers list from PWS.");
        },
        LoadError: function(){
            console.log("BlockedNumbers: There was an error loading the user\'s blocked numbers.");
        },
        BlockError: function(){
            console.log("BlockedNumbers: There was an error processing the number block request.");
        },
        getBlockedCallers: function(){
            return blockedNumbers;
        },
        UnblockError: function(){
            console.log("BlockedNumbers: There was an error processing the number unblock request.");
        },
        addNumber: function(){
            blockedNumbers[blockedNumbers.length]=numberToBlock.toString();
            numberToBlock = null;
            parseBlockedNumbers();
            clearContactsTab();//PNG-513 KTRUMBLE 10082012 - need to refresh contacts after blocking/unblocking
            drawContactsTab();
            syncHistory();
        },
        isBlocked: function(number){
            var isBlocked = false;
            if(blockedNumData!=null){
                $.each(blockedNumData, function(key) {
                    if( blockedNumData[key].num == number)
                        isBlocked = true;
                });
            }
            return isBlocked;
        },
        removeNumber: function(){
            if(blockedNumbers!=null){
                for(var i=0; i<blockedNumbers.length; i++){
                    if(blockedNumbers[i] == numberToUnblock.toString())
                        blockedNumbers.splice(i,1);
                }
            }
            numberToUnblock = null;
            parseBlockedNumbers();
            clearContactsTab();//PNG-513 KTRUMBLE 10082012 - need to refresh contacts after blocking/unblocking
            drawContactsTab();
            syncHistory();
        },
        blockedNumberHTML: function(){
            parseBlockedNumbers();
            var bnHTML ='<div id="blockedCallersDiv">';
            if(blockedNumData.length==0) bnHTML+='<div class="blockedCaller"><div class="blockedCallerName fl">'+_i18n_.get("GUI_WIZARD_NO_BLOCKED_CALLERS")+'</div></div>';
            $.each(blockedNumData,function(i){
                var bnName=blockedNumData[i].num,bnNum=blockedNumData[i].num,bnType=blockedNumData[i].type;
                //WKRASKO 101912 - PNG-541, display unknown if not found.
                if(bnNum!=null && JAMBO_APP.ContactList.contactExists(bnNum)){
                    bnName = JAMBO_APP.ContactList.contactNamesByNumber(bnNum);//PNG-484 KTRUMBLE 10012012 - making some needed tweaks to the blocked callers popup (mostly removing the old graphical numtype icons)
                } else {
                    bnName = _i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_LONG").split(' ');
                }
                if(bnType==null)
                    bnType = "";
                var formattedNum = bnNum;
                if(sipPhonePurpReg.test(bnNum))
                    formattedNum = format10D(bnNum);
                if(i>=1)bnHTML+='<hr class="lt" />';//PNG-484 KTRUMBLE 10012012 - making some needed tweaks to the blocked callers popup (mostly removing the old graphical numtype icons)
                bnHTML+='<div class="blockedCaller">\n\
                            <div class="blockedCallerName fl" title="'+bnName[0]+' '+bnName[1]+'">'+bnName[0]+' '+bnName[1]+'</div>\n\
                            <div class="blockedCallerNum fl">'+formattedNum+'</div>\n\
                            <div class="blockedCallerNumType fl">'+bnType+'</div>\n\
                            <div data-num="'+bnNum+'" class="unblockCallerBtn fr">'+_i18n_.get("GUI_CALL_MENU_UNBLOCK")+'</div>\n\
                         </div>';
            });
            bnHTML+='</div>';
            return bnHTML;
        }
    }
})();