//Application PurpleMail Entity
JAMBO_APP.PurpleMail = (function() {
    //PRIVATE
    var pMessages = null;//Holder for returned messages from web services.
    var selfRecordURL = "selfrecord@hovrs.com";
    
    //PUBLIC
    return{
        serverURL: 'http://vmailer.hovrs.com/cgi-bin/viewpnmail.php',
        deleteCount: 0,
        deleteInProgress:false,
        pmSortBy:'FirstName',//default PM sort order
        pmUpdateID:null,
        PMMID:null,PMNum:null,//for pm delete functions
        pmDiv: '<hr class="dk${FirstPM}" />\n\
                <div id="pmNum_${PMID}" data-pmpath="${PMPath}" data-pmsender="${PMSender}" class="pmNum cb">\n\
                    <div class="fl">\n\
                        <div class="pmName fl">${PMName}</div>\n\
                        <div class="favNum${PMFav} fl"></div>\n\
                        <div id="icon_${PMID}" class="numType numType_${PMNumType} fl"></div>\n\
                        <div id="info_${PMID}" class="fl">${PMSender} ${PMDate}</div>\n\
                        <div class="outgoing_icon fl"></div>\n\
                    </div>\n\
                </div>',
        //PNG-475 KTRUMBLE 10012012 - update row hover state
        //PNG-503 KTRUMBLE 10222012 - removed numtype from display
        pmDivDesktop: '<div class="pmItem" id="pmItem_${PMID}">\n\
                    <div id="pmNum_${PMID}" data-pmpath="${PMPath}" data-pmsender="${PMSender}" class="pmNum contactItem_${evenodd} cb">\n\
                        <div class="fl">\n\
                            <div id="readState_${PMID}" class="readState fl ${readState}"></div>\n\
                            <div class="pmLCol fl">\n\
                                <div class="pmNameLong fl ${longNameClass}" title="${PMName}">${PMName}</div>\n\
                                <div class="pmNameShort pmFirstName fl ${shortNameClass}" title="${first_name}">${first_name}</div>\n\
                                <div class="pmNameShort pmLastName fl ${shortNameClass}" title="${last_name}">${last_name}</div>\n\
                            </div>\n\
                            <div class="pmRCol fl">\n\
                                <div id="info_${PMID}" class="pmInfo fl">\n\
                                    <div class="favStar${favClass} fl"></div>\n\
                                    <div data-cnID="${PMID}" data-senderNumber="${senderNumber}" class="pmSender fl">${PMSender}</div>\n\
                                    <div class="cCallIcon dn"></div>\n\
                                </div>\n\
                                <div class="pmDate fl">\n\
                                    <div class="PMDate_date fl">${PMDate}</div>\n\
                                    <div class="PMDate_time fl">${PMTime}</div>\n\
                                </div>\n\
                                <div class="pmTmbs fl">\n\
                                    <div class="pmLgThumb dn" data-pmItemID="pmItem_${PMID}"><img src="${thumb_path}" width="100" /></div>\n\
                                    <div class="pmThumb"><img src="${thumb_path}" width="48" /></div>\n\
                                    <div class="pmPlayControl dn"><img data-pmsender="${senderNumber}" data-pmDateTime="${dateTime}" data-pmControlID="${PMID}" class="pmPlayIcon ${readState}" src="img/pmPlayIcon.png" /></div>\n\
                                </div>\n\
                            </div>\n\
                        </div>\n\
                        <div class="pmTools">\n\
                            <div class="recordEditMenuWrapper fl dn"><div data-cid="${cid}" data-pmsender="${senderNumber}" class="${showAddContactBtn}${addUser}"></div></div>\n\
                            <div data-pmid="${PMID}" data-pmsender="${senderNumber}" class="pmDeleteBtn fr dn"></div>\n\
                        </div>\n\
                    </div>\n\
                </div>',
        getSelfRecordURL: function(){
            return selfRecordURL;
        },
        setSelfRecordURL: function(newURL){
            if(isDefined(newURL) && newURL!='')
                selfRecordURL = newURL;
        },
        getPMMessages: function(){
            return pMessages;
        },
        getPMMessage: function(messageID){
            var messageObj = null;
            for(var i=0; i<pMessages.length; i++){
                if(pMessages[i].ID==messageID)
                    messageObj = pMessages[i];
            }
            return messageObj;
        },
        setIsFav: function(msgID, isFav){
            if(pMessages!=null && pMessages.length>0)
                $.each(pMessages, function(k,v){
                    if(pMessages[k].ID==msgID)
                        pMessages[k].fav = isFav;
                });
        },
        setType: function(msgID, newType){
            if(pMessages!=null && pMessages.length>0)
                $.each(pMessages, function(k,v){
                    if(pMessages[k].ID==msgID)
                        pMessages[k].type = newType;
                });
        },
        setFirstName: function(msgID, newFirstName){
            if(pMessages!=null && pMessages.length>0)
                $.each(pMessages, function(k,v){
                    if(pMessages[k].ID==msgID)
                        pMessages[k].FirstName = newFirstName;
                });
        },
        setLastName: function(msgID, newLastName){
            if(pMessages!=null && pMessages.length>0)
                $.each(pMessages, function(k,v){
                    if(pMessages[k].ID==msgID)
                        pMessages[k].LastName = newLastName;
                });
        },
        populate: function(userGUID){
            JAMBO_APP.WebServices.getPurpleMail(userGUID,JAMBO_APP.PurpleMail.loadSuccess,JAMBO_APP.PurpleMail.loadError);
        },
        loadSuccess: function(result){
            if(result.ResultCode!="Error"){
                console.log('PurpleMail: messages retrieved successfully');
                pMessages = result.Messages;
                drawPurpleMail(pMessages);
                setPMAvailableIcons(pMessages);//PNG-295 KTRUMBLE 07022012
                if(isDefinedAsFunction(setDivScrollPositions))//WKRASKO 111512 - PNG-716
                    setDivScrollPositions('PurpleMail');//PNG-935 KTRUMBLE 04162013 - fix div scroll position function; was setting the position to 0 every time
            } else JAMBO_APP.PurpleMail.loadError(result);
        },
        loadError: function(err){
            closeLoadingAnim();
            $('#purpleMailMessages').html('<div id="noMsg"><span class="noMsgInner i18n" data-i18n_key="GUI_PM_NOMESSAGES">'+_i18n_.getHTML("MSG_ERR_LOADING_PM")+'</span></div>');
            console.log("PurpleMail: There was an error loading the messages.\n"+err);
        },
        viewGreeting: function(userGUID){
            openLoadingAnim();
            JAMBO_APP.WebServices.mailboxProperties(userGUID,JAMBO_APP.PurpleMail.mailboxPropsSuccess,JAMBO_APP.PurpleMail.loadError);
        },
        mailboxPropsSuccess: function(result){
            console.log('PurpleMail: greeting retrieved successfully, location: '+result.WelcomeMessagePath);
            //WKRASKO 092012 - PNG-287, default path was ALWAYS being used, instead of users path
            //URL example: http://prod1-vms.hovrs.com:8080/api/request?api=exportContent&path=PSE.VAM/contents/welcome/91/65/14/53/99/Welcome-9165145399-1347651949&format=flv_cif_3840
            closeLoadingAnim();
            if (navigator.appVersion.indexOf("Win")!=-1) openPurpleMailViewer('PMG',result.WelcomeMessagePath,null,null);
            else if (navigator.appVersion.indexOf("Mac")!=-1) {
                __thisWindow__.openInSystemBrowser('file:///'+createPMFile('Greeting',null,null,result.WelcomeMessagePath));
            }
        },
        deleteMessage: function(userGUID,messageID){
            JAMBO_APP.WebServices.deletePM(userGUID,messageID,JAMBO_APP.PurpleMail.messageDeleteSuccess,JAMBO_APP.PurpleMail.messageDeleteError);
        },
        messageDeleteSuccess: function(result){
            if(JAMBO_APP.PurpleMail.deleteInProgress)
                JAMBO_APP.PurpleMail.deleteCount -= 1;
            if(result.ResultCode=="OK" && JAMBO_APP.PurpleMail.deleteCount == 0){
                JAMBO_APP.PurpleMail.deleteInProgress = false;
                $('#purpleMailMessages').empty();
                //WKRASKO 082012 - PNG-271, I added setters to set the extra info that pmNameArray was created for vs. using up more memory with large object arrays.
                $('#unreadPMCount').css({'background-color':'#868686'});
                $('#unreadPMCount').text('0');
                if($('#contactPM_'+JAMBO_APP.PurpleMail.PMNum)){//PNG-295 KTRUMBLE 07022012
                    $('#contactPM_'+JAMBO_APP.PurpleMail.PMNum).removeClass('pmAvailableIcon');
                    $('#contactPM_'+JAMBO_APP.PurpleMail.PMNum).addClass('pmAvailableIcon_off');
                }
                if($('#favoritePM_'+JAMBO_APP.PurpleMail.PMNum)){//PNG-295 KTRUMBLE 07022012
                    $('#favoritePM_'+JAMBO_APP.PurpleMail.PMNum).removeClass('pmAvailableIcon');
                    $('#favoritePM_'+JAMBO_APP.PurpleMail.PMNum).addClass('pmAvailableIcon_off');
                }
                JAMBO_APP.PurpleMail.populate(JAMBO_APP.activeUserAccount);//WKRASKO 073112 - PNG-271, moved this from index.js deletePMMessage, ajax is asynchronous! If it's there, you can't guarantee which call happens/returns first
            }
        },
        messageDeleteError: function(){
            console.log("PurpleMail: There was an error deleting the message.");
        },
        dynamicSort: function(property) {
            return function (a,b) {
                return (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            }
        },
        sortPMByLast: function(){
            pMessages = pMessages.sort(this.dynamicSort('LastName'));
        },
        sortPMByFirst: function(){
            pMessages = pMessages.sort(this.dynamicSort('FirstName'));
        },
        pmStatusUpdateSuccess: function(){// PNG-284 KTRUMBLE 08012012
            $('#readState_'+JAMBO_APP.PurpleMail.pmUpdateID).removeClass('pmUnread');
            $('#readState_'+JAMBO_APP.PurpleMail.pmUpdateID).addClass('pmRead');
            if(parseInt($('#unreadPMCount').text())>='1'){
                $('#unreadPMCount').text(parseInt($('#unreadPMCount').text())-1);
            }
            if(parseInt($('#unreadPMCount').text())==0){
                $('#unreadPMCount').css({'background-color':'#868686'});
                if(getFlasher()!="")
                    __thisWindowProxy__.stopNotificationPlayback(getFlasher(), "wav/solid.wav");//WKRASKO 103012 - PNG-601
            }
            JAMBO_APP.PurpleMail.pmUpdateID=null;
        },
        pmStatusUpdateFail: function(){
            console.log("PurpleMail: There was an error updating the message status.");
        }
    }
})();