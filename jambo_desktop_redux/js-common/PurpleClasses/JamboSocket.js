/**********************************
Purple Communications, Inc (c) 2012
by Keith Trumble for Jambo_Desktop
*/
var JamboSocket = {
    callType:null,
    connection:null,
    serverURL:'ws://lb.ares.prod.purple.us:14002/ares',
    this10D: null,
    outbound10D: null,//PNG-342 KTRUMBLE 08232012 - collecting the dialstring for passing to the socket
    initFlag:false,
    sessionID:'',
    goodDisconnect:false,
    tryReconnect:false,
    socketReady:false,
    reconnectTries:15,
    reconnectTimer:10000,
    myTimer:false,
    hasMessages:false,
    VIID:null,
    senderID:null,
    senderName:null,
    isVRS:false,
    fontClass:'',
    VIConnected:false,//PNG-329|PNG-334|PNG-332 KTRUMBLE 08162012
    dialStr:null,
    dspName:null,
    isRedirecting:false,
    callDirection:null,
    chatDiv: '<div class="chatMsgBlock tc_blob${topBorder} ${fontClass}">\n\
                    <div class="tc_blobSenderName${blobType} fl">${senderName}</div>\n\
                    <div class="tc_blobTimeStamp fr">${blobTime}</div>\n\
                    <div class="tc_blobText cb">${blobText}</div>\n\
                </div>',
    init:function(dialString, displayName, direction){
        this.dialStr=dialString;//PNG-329|PNG-334|PNG-332 KTRUMBLE 08162012 - we need to wait to actually dial until the socket is connected.
        this.dspName=displayName;//PNG-329|PNG-334|PNG-332 KTRUMBLE 08162012
        this.callDirection = direction;
        this.setMachineType();//mac, or windows?
        //Force format is below, after connect is cleaner
        if(!this.initFlag){
            //WKRASKO 113012 - PNG-758, let user clear chat now.
            $('#terpChat_wrap').append('<div class="tc_blobText cb">'+_i18n_.get('GUI_SYSTRAY_TOOLTIP_CONNECTING')+'</div>');
            this.this10D = JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].TenDigitNumber[0].Number;
            this.connect();
            if (applicationSettings.mode == "kiosk") { 
                $('#dialSectionHead').show();
                $('#chatSectionHead').show();
                $('#chatSectionHead').click();
                if (!$('#dialSectionHead_wrapper').hasClass('incall')) $('#dialSectionHead_wrapper').addClass('incall');
            } else {
            }
        }
    },
    connect:function(){
        try{
            this.connection = new WebSocket(this.serverURL);
            this.connection.onopen    = function(evnt){JamboSocket.socketOpen(event);}
            this.connection.onmessage = function(msg){JamboSocket.socketMessage(msg);}
            this.connection.onclose   = function(){JamboSocket.socketClose(event);}
            this.connection.onerror   = function(){JamboSocket.socketError(fail);}
        } catch(exception){
            console.log('WebSocket ERROR: Couldn\'t make socket connection.\nServer URL: '+this.serverURL+'\nException:\n'+exception);
        }
    },
    socketOpen:function(evt){
        console.log('WebSocket: Ready. (socketOpen)');
        this.initFlag=true;
        var cameraString = coreSettings.cameraDevice;//WKRASKo 080812 - PNG-314, strip crap from Windows strings
        if(cameraString.indexOf("\\global")!=-1){
            cameraString = cameraString.split('global')[1].substring(1);
        }
        if(cameraString.indexOf("}")!=-1)//WKRASKO 120312 - PNG-314, more logic.
            cameraString = cameraString.split("}").pop();
        var sendString = "myMethod=StartSession||findOther=true||10D="+this.this10D+"||callType="+this.callType+"||ocxVersion="+appInfo.version+"."+appInfo.buildNumber;
        sendString += "||cameraType="+cameraString;//PNG-261, includes "version" added in last line.
        //Be careful! This is session based, so has to be directly from form, NOT from saved values.
        //Saved values are only used for restoring form on restart.
        var phNumber = this.filterList(this.outbound10D);//PNG-487 KTRUMBLE 09042012 - filtering for dns names
        sendString += "||phNumber="+phNumber;//PNG-206 KTRUMBLE 08062012 adding the dialed number as a backup for autoentry into field on VI (comes through video feed as well)
        sendString += "||lang="+$('[name=terplang_radio]:checked').val()+"||announceVRS=";//UI REVISION per DP - change to radio from select list
        sendString += $('[name=announcevrs_radio]:checked').val();//PNG-1062 KTRUMBLE 04152013 - since the dial pane settings get updated when general settings are updated, we should always send what the dial pane reports
        var spInst = ($('#specialInstructions').val()==_i18n_.get('GUI_SETTINGS_CALL_SI'))?'':$('#specialInstructions').val();//PNG-351 KTRUMBLE 08232012 - remove carriage return and newline characters
        sendString += "||spInstruct="+spInst.replace(/[\n\r]/g, ' ');
        if($('[name="vcotype_radio"]:checked').val()!="0"){
            if( $('[name="vcotype_radio"]:checked').val()=="2" && $('#vcoext').val()!="" )//WKRASKO 110612 - PNG-682, should only send extension for 2-line
                sendString += " VCO Ext: "+$('#vcoext').val();//Another be careful. We're adding this to special instructions above, so must be first.
            sendString += "||isVCO=1";
            if($('[name="vcotype_radio"]:checked').val()!="2")//WKRASKO 091712 - PNG-417, 2 is 2 leg, this was backwards.
                sendString += "||vcoNumber=1LEG";
            else
                sendString += "||vcoNumber="+$('#vconumber').val();
        }
        if(this.callDirection=='INCOMING') sendString += "||youCalledMe=true";//PNG-1121 KTRUMBLE 05082013 - add inbound video flag
        else sendString += "||youCalledMe=false";//PNG-1121 KTRUMBLE 05082013 - add inbound video flag
        console.log(sendString);
        if(evt){
            if(this.tryReconnect){
 		clearInterval(this.myTimer);
		this.myTimer = false;
 		this.send(sendString);
 		this.reconnectTries = 15;
 		console.log('WebSocket: Reconnected');
                this.tryReconnect = false;
            } else {
                if(!this.socketReady) this.send(sendString);
            }
            format = "withChat"; JamboSocket.setChatView();//WKRASKO 091812 - PNG-343, should open on ANY socket call
        } else {
            console.log("WebSocket: The socket connect attempt returned badness.");
        }
    },
    socketMessage:function(msg){
        var thisMsg = msg.data.toString();
        if(thisMsg!=' '){
            if(thisMsg!=' ' && thisMsg.indexOf('keepAlive')==-1){
                console.log('WebSocket: Message received.');
                this.parseResponse(thisMsg);
            }
        }
    },
    socketClose:function(evt){
        console.log('WebSocket: Connection closed.');
	if(this.goodDisconnect == false){ // we didn't drop on purpose
            if(this.myTimer == false){
                this.myTimer = setInterval(this.reconnect,this.reconnectTimer);
                console.log("WebSocket: Connection closed and it shouldn't have. Starting timer.");
                this.socketStatus('dropped');
            } else {
                console.log("WebSocket: Connection dropped, but I have a reconnect timer running, so do nothing.");
            }
	} else {
            this.goodDisconnect = false;
            this.isVRS = false;
            this.closeChat();
            this.connection = null;
	}
    },
    socketError:function(fail){
        console.log('Websocket: this.connection.onerror called. Error:');
        console.log(fail);
    },
    send:function(str){
        if(isDefined(JamboSocket.connection) && isDefined(JamboSocket.connection.readyState) && JamboSocket.connection.readyState!=1){
            if(str.indexOf("viEndpoint") != -1) return;
            else setTimeout('JamboSocket.send(\''+str+'\')',300);
        }else{
            try{
                if(str.indexOf('keepAlive')==-1) console.log('Sending str: ['+str+']');
                JamboSocket.connection.send(str);
            }
            catch(ex){console.log('WebSocket ERROR: Cannot send, here\'s why:\n'+ex);}
        }
    },
    reconnect:function(){
        JamboSocket.tryReconnect = true;
        if(JamboSocket.reconnectTries > 0){
            var tmpCount = 16 - JamboSocket.reconnectTries;
            console.log("WebSocket: Attempting Reconnection attempt " +String(tmpCount) +" to "+JamboSocket.serverURL);
            if(isDefined(JamboSocket.connection) && isDefined(JamboSocket.connection.readyState) && JamboSocket.connection.readyState!=1){
                console.log("WebSocket ERROR: Can't reconnect: waiting 10 seconds...");
                JamboSocket.reconnectTries--;
                JamboSocket.connect();
            } else {
                clearInterval(JamboSocket.myTimer);
                JamboSocket.myTimer = false;
            }
        } else {
            console.log("WebSocket ERROR: Could not connect to server after 30 attempts");
            clearInterval(JamboSocket.myTimer);
            JamboSocket.myTimer = false;
            console.log("WebSocket ERROR: There be an error from the server: Could not re-connect to server");
        }
    },
    socketStatus:function(state){
        if(state == 'dropped'){
            this.socketReady = false;
        } else if(state == 'reconnected'){
            this.socketReady = true;
        }
    },
    parseResponse:function(msg){
        console.log(msg);
	var dataArray = msg.split("||");
        var theMethod=null;
        var access=null;
        var theResult=null;
        var theState=null;
        var theText=null;
        var the10D=null;
        var theVIID=null;
        
	//parse param value pairs
        $.each(dataArray,function(k,v){
            var key=dataArray[k].split('=')[0];
            var val=dataArray[k].split('=')[1];
            if(key=='myMethod') theMethod=val;
            if(key=='access') access=val;
            if(key=='result') theResult=val;
            if(key=='state') theState=val;
            if(key=='SessionID') JamboSocket.sessionID=val;
            if(key=='text') theText=val;
            if(key=='VIID'){
                JamboSocket.VIID=val; theVIID=val;
                $('#terpChat_head_VIID').html('VI# '+val);//WKRASKO 113012 - PNG-770
                console.log('WebSocket: Connected to VI'+val);
            }
            if(key=='10D') the10D=val;
        });
        
        //identify sender id if no VIID
        if(the10D!=null && this.VIID==null) {
            this.senderID=JAMBO_APP.ContactList.getContactByNumber(the10D);
            if(this.senderID==null || this.senderID=="") this.senderID='unknown';
        }
        
        //WKRASKO 102412 - PNG-633, another possible method, this should close socket.
        if(theMethod=="GoodbyeToAres" && access=="over"){
            JamboSocket.goodDisconnect=true;
            JamboSocket.connection.close();
        }

        //handshake message from the SS, initializes chat
        if(theMethod=='WelcomeToAres' && (access!='granted' || access==null)){
            console.log('WebSocket: Access denied.');
            this.initFlag=false;
            this.goodDisconnect=false;
        } else if(theMethod=='WelcomeToAres' && access=='granted'){
            console.log('WebSocket: Access granted.');
            this.initFlag=true;
        }
        
        if(this.initFlag==true){
            //if access granted, look for StartSession method to indicate a session has been created
            if(theMethod=='StartSession' && (theResult!='true' || theResult==null)){
                this.socketReady=false;
                this.goodDisconnect=false;
                console.log('WebSocket: Bad session, StartSession returned result=false||null.');
            } else if(theMethod=='StartSession' && theResult=='true'){
                this.enableSend();
                this.socketReady=true;
                console.log('WebSocket: Session started.');
                if(this.callDirection==Line.CallStatus.DIALING)
                    actuallyDoCallFromDialString(this.dialStr, this.dspName,true);
            }
        } else this.socketReady=false;
        
        //if(this.socketReady){
            //WKRASKO 121812 - PNG-802, need to cover spanish too or we don't get text chat for spanish VRS calls
            if( theMethod=='sendText' && theVIID!=null && theText!='' && theText!=null && (theText.search('Hello, this is')!=-1 || theText.search('Hola, soy el')!=-1) )
                this.VIConnected=true;
        //}
        
        if(this.VIConnected){
            //start processing sendText messages
            if(theMethod=='sendText' && theText!=null && theText!=''){
                //don't show top border if no messages
                var topBorder="";
                if(this.hasMessages==false){
                    this.hasMessages=true;
                    topBorder='Top';
                    //WKRASKO 113012 - PNG-758, done by user now//$('#terpChat_wrap').html('');
                    $('#terpChat_send').removeClass('terpChatDisabled');
                    $('#terpChat_send').addClass('terpChatEnabled');
                    $('#terpChatEntry').removeAttr('disabled');//WKRASKO 101912 - PNG-522, if it's disabled, it should be disabled!
                } else topBorder='';

                //setup senderName
                if(this.VIID!=null && this.senderID==null){//is interpreter chat
                    this.senderName=_i18n_.get("GUI_INTERPRETERCHAT_LABEL")+this.VIID;
                } else if (this.VIID==null && this.senderID!=null && this.senderID!='unknown'){//is some other chat
                    if(the10D!=null){
                        this.senderName=JAMBO_APP.ContactList.contactName(the10D);
                        this.senderName=(this.senderName!=null)?this.senderName[0]+' '+this.senderName[1]:_i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_CONTACT");
                    } else this.senderName=_i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_CONTACT");
                } else {//senderID is 'unknown', no 10D or other info available
                    this.senderName=_i18n_.get("GUI_ADDRESSBOOK_UNKNOWN_CONTACT");
                }
                
                //get time.
                var time=new Date();
                var hour=time.getHours();
                var minutes=time.getMinutes();
                if(minutes.toString().length==1)minutes='0'+minutes.toString();
                if(hour>=13)hour=hour-12;
                time=hour+':'+minutes;
                
                //add text to chat window
                $.tmpl(JamboSocket.chatDiv, {
                    "topBorder":topBorder,
                    "blobType":"Incoming",
                    "senderName":this.senderName,
                    "blobTime":time,
                    "blobText":theText,
                    "fontClass":this.fontClass
                }).appendTo("#terpChat_wrap");
                
                //scroll chat window to bottom
                $("#terpChat_wrap").scrollTop($("#terpChat_wrap")[0].scrollHeight);
                
            } else if(theMethod=='sendText' && theResult=='true'){
                console.log('message sent.')
            }
        }
    },
    closeChat:function(){
        this.hasMessages=false;
        this.socketReady=null;
        this.initFlag=false;
        this.VIID=null;
        this.senderID=null;
        this.senderName=null;
        P2PdStr=null;
        $('#terpChatEntry').val('');
        $('#terpChat_send').removeClass('terpChatEnabled');
        $('#terpChat_send').addClass('terpChatDisabled');
        $('#terpChatEntry').attr('disabled','disabled');//WKRASKO 101912 - PNG-522, if it's disabled, it should be disabled!
    },
    enableSend:function(){
        //PNG-186 KTRUMBLE 10302012 - Add P2PChat
        if(P2PChatEnabled){//WKRASKO 111512 - PNG-711, chat with anbody after the first doesn't work with check that was here, and I see no purpose in the check.
            if(P2PdStr.startsWith('sip:')){
                P2PdStr=P2PdStr.split('sip:')[1].split('@')[0];
            }
            remotePartyUri='sip:'+P2PdStr+'@'+JAMBO_APP.AppProperties.sipStr;//WKRASKO 112912 - PNG-186, bad coding here, address was static to staging.
        }
        //END PNG-186
        $('#chatSend').unbind('click');
        $('#chatSend').bind('click',function(){
            if(JamboSocket.VIConnected)//WKRASKO 101912 - PNG-522, if it's disabled, it should be disabled!
                JamboSocket.chatSend();
            else if(P2PChatEnabled)//PNG-186 KTRUMBLE 10302012 - Add P2PChat
                __thisWindowProxy__.sendInstantMsg(remotePartyUri, $('#terpChatEntry').val(), function(response){ });
        });
        $("#terpChatEntry").unbind('keypress').keypress(function(e){//WKRASKO 091712 - PNG-416, keydown does not use real characer codes for all characters, should never be used to bind keys like this, has to be keypress. (i.e., '=0 on keydown, whic nothing should, =39 (correct) on keypress)
            if(( e.which == 13 || (e.which == 0 && !e.shiftKey) ) &&  $('#terpChatEntry').val()!='' && JamboSocket.socketReady && JamboSocket.VIConnected)
                JamboSocket.chatSend();
            else if(( e.which == 13 || (e.which == 0 && !e.shiftKey) ) && $('#terpChatEntry').val()!='' && P2PChatEnabled){
                __thisWindowProxy__.sendInstantMsg(remotePartyUri, $('#terpChatEntry').val(), function(response){ });//PNG-186 KTRUMBLE 10302012 - Add P2PChat
            }
        });
    },
    chatSend:function(){
        var chatMsg = $('#terpChatEntry').val();
        var sendString = "myMethod=sendText||text="+chatMsg;
        var myCount = chatMsg.length -1;
        while(chatMsg.charCodeAt(myCount) == 13 || chatMsg.charCodeAt(myCount) == 10){
            myCount--;
        }
        chatMsg = chatMsg.substring(0,myCount+1);
        sendString = "myMethod=sendText||text="+chatMsg;
        JamboSocket.send(sendString);
        JamboSocket.displayChatMessage(chatMsg);
    },
    displayChatMessage:function(msg){
        var topBorder='';
        this.senderName = JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].FirstName+" "+JAMBO_APP.userAccounts[JAMBO_APP.activeUserAccount].LastName;
        
        //don't show top border if no messages
        if(this.hasMessages==false){
            this.hasMessages=true;
            topBorder='Top';
        } else topBorder='';
        
        //get time.
        var time=new Date();
        var hour=time.getHours();
        var minutes=time.getMinutes();
        if(minutes.toString().length==1)minutes='0'+minutes.toString();
        if(hour>=13)hour=hour-12;
        time=hour+':'+minutes;

        $.tmpl(JamboSocket.chatDiv, {
            "topBorder":topBorder,
            "blobType":"",
            "senderName":this.senderName,
            "blobTime":time,
            "blobText":msg,
            "fontClass":this.fontClass
        }).appendTo("#terpChat_wrap");
        $("#terpChat_wrap").scrollTop($("#terpChat_wrap")[0].scrollHeight);
        
        $('#terpChatEntry').val('');
    },
    setMachineType:function(){
        if (navigator.appVersion.indexOf("Win")!=-1) this.callType=115;
        else if (navigator.appVersion.indexOf("Mac")!=-1) this.callType=120;
    },
    //PNG-487 KTRUMBLE 09042012 - filtering for dns names and certain numbers
    filterList:function(str){
        var displayString = '';
        if( jQuery.inArray(str,callGroupArray)==-1 )
            displayString=str;
        return displayString;
    },
    setChatView:function(){
        var $window = $(window); //cleaning up a JS error
        if (applicationSettings.mode == "kiosk") { //chat window height
            $('#terpChat_content').height($window.height()- 326);
        } else if (getPlatform() == "VRI") { // VRI mode
            $('#terpChat_content').height($window.height()-192);
        } else {
            $('#terpChat_content').height($window.height()-206);
        }
        if ($('#chatSectionHead').hasClass('bottom')) {//WKRASKO 051613 - PNG-1128, cleaning up auto-show chat all around for robustness
            $('#chatSectionHead').click();
        }
    },
    sendSSDTMF:function(theTone){
        JamboSocket.send('myMethod=DTMF||tone='+theTone);
    }
}

