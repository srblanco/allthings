//Application WebServices Interface
JAMBO_APP.WebServices = (function() {
    //PRIVATE
    var connection = {
        url: "https://websvc.prod.purple.us/",
        user: "p3.app",
        pass: "H67D8b39#1&N"
    };
    
    
    var defaultSuccessCallback = function(responseData){
        console.log( "WebService: "+JSON.stringify(responseData) );
    };
    var defaultErrorCallback = function(responseData, errorThrown){
        console.log( "WebService: "+responseData.responseText+" "+errorThrown );
        //WKRASKO 101712 - PNG-363
        if($('#loadingDiv').is(':visible') && $('#loadingStatus').html()==_i18n_.getHTML("STARTUP_MSG_LOGGING_IN")){
            openMessagePopup('#errorPop', _i18n_.get("TITLE_ERROR"), _i18n_.getHTML("MSG_ERR_LOGIN_SERVER_CONN_FAILURE"), _i18n_.getHTML("COMMON_OK"),false,function(){ $('#startupMask #loadingDiv').hide();$('#signin').css('display','table-cell'); });
            if(composerReady)
                hideEmbeddedVideoComposer();
            else
                setTimeout(hideEmbeddedVideoComposer,200);
        }
    };
    var callService = function(serviceURL, successCallback, errorCallback, methodType, theGUID){
        var serviceType = methodType || "GET";
        var tempURL = connection.url+serviceURL;
        console.log("WebService: Calling service "+tempURL);
        //WKRASKO 120412 - PNG-590.
        //PLEASE do not change this back to jQuery. Turns out, jQuery has pretty much always memory leaked in their ajax requests, and still has issues, so just leave this native.
        var xmlHttpReq = false;
        // Mozilla/Safari
        if (window.XMLHttpRequest) {
            xmlHttpReq = new XMLHttpRequest();
        }
        // IE, yes, I know we should never get this in our webkit based app, but it's good practice!
        else if (window.ActiveXObject) {
            xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlHttpReq.open(serviceType, tempURL, true);
        xmlHttpReq.setRequestHeader('Authorization', "Basic " + $().crypt({ method: "b64enc", source: connection.user+":"+connection.pass }));
        xmlHttpReq.setRequestHeader('Origin', 'http://www.purple.us');
        xmlHttpReq.setRequestHeader('Content-Type', 'application/json');
        xmlHttpReq.onreadystatechange = function() {
            if (xmlHttpReq.readyState == 4) {
                if(xmlHttpReq.status==200){
                    if(typeof successCallback == "function"){
                        if(typeof theGUID === "string")
                            successCallback(JSON.parse(xmlHttpReq.responseText),theGUID);
                        else
                            successCallback(JSON.parse(xmlHttpReq.responseText));
                    } else
                        defaultSuccessCallback(JSON.parse(xmlHttpReq.responseText));
                } else {
                    if(typeof errorCallback == "function")
                        errorCallback(xmlHttpReq.statusText);
                    else
                        defaultErrorCallback(xmlHttpReq, xmlHttpReq.statusText);
                }
            }
        }
        xmlHttpReq.send(null);
    }
    
    //PUBLIC
    return {
        //Sets local (private) connection property once for the app based on environment.
        setConnection: function(env){
            connection.url = env+"/";
        },
        getConnection: function(){
            return connection;
        },
        
        getDeviceConfig: function(deviceID, successFunction, errorFunction){
            var serviceURL = "Devices/GetConfig?input={DeviceID:'"+deviceID+"'}";
            callService(serviceURL, successFunction, errorFunction, "GET");
        },
        /*@param deviceObj an object in the following format:
         *{
         *    'DeviceID':'<string>',
         *    'UserGuids':'<comma_seperated_strings>',
         *    'Language':'<enum>',
         *    'Camera':'<string>',
         *    'Network':{"NetworkID":"333","Type":"Wifi","Metric":1,"SSID":"MoonStation","SecurityEnabled":true,"WifiPassphrase":"arouondtheworld","IPAddress":"192.168.0.32","DNS":"comcast.net","SubnetMask":"255.255.255.0","Gateway":"192.168.0.1"},
         *    'NoticeDisplayed':<boolean>
         *}
         * Required Fields: DeviceID
         *@param successFunction function to be processed on ajax success
         *@param errorFunction function to be processed on ajax error
         *
         */
        updateDeviceConfig: function(deviceObj, successFunction, errorFunction){
            var serviceURL = "Devices/UpdateConfig?input="+$.toJSON(deviceObj);
            callService(serviceURL, successFunction, errorFunction, "PUT");
        },
        
        //Section WSDL: https://websvc.test.purple.us/VRSUser/help
        loginUser: function(username, password, successFunction, errorFunction){
            var serviceURL = "VRSUser/Login?input={username:'"+username+"',password:'"+password+"'}";
            callService(serviceURL, successFunction, errorFunction, "GET");
        },
        getUser: function(userGUID, successFunction, errorFunction){
            var serviceURL = "VRSUser/GetUser?input={GUID:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "GET");
        },
        /*@param userObj an object in the following format:
         * {
         *     GUID:"<string>",
         *     FirstName:"<string>",
         *     LastName:"<string>",
         *     VILanguage:?,
         *     EmailAddress:"<string>",
         *     AnnounceVRS:<boolean>,
         *     VCOUser:<boolean>,
         *     PhoneHome:"<string>",
         *     PhoneWork:"<string>",
         *     VPNameHome:"<string>",?
         *     VPNameWork:"<string>",?
         *     Pager:"<string>",
         *     VCONumber:"<string>",
         *     VCOExt:"<string>",
         *     VMEmailAddress:"<string>",
         *     UseFollowMe:<boolean>,
         *     NotifyEmail:<boolean>,
         *     NotifyCall:<boolean>,
         *     NotifyVideoEmail:<boolean>,
         *     AnsweringMachineGreeting:"<string>",
         *     NotifyEmailAddress:"<string>"
         * }
         * Required Fields: GUID
         *@param successFunction function to be processed on ajax success
         *@param errorFunction function to be processed on ajax error
         *
         */
        updateUser: function(userObj, successFunction, errorFunction){
            var serviceURL = "VRSUser/UpdateUser?input="+$.toJSON(userObj);
            callService(serviceURL, successFunction, errorFunction, "PUT");
        },
        getUserE911: function(userGUID, successFunction, errorFunction){
            var serviceURL = "VRSUser/GetE911?input={guid:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "GET");
        },
        /*@param userE911 an object in the following format, all fields required:
         * {
         *     GUID:"<string>",
         *     FirstName:"<string>",
         *     LastName:"<string>",
         *     E911Address:{
         *         Street1:"<string>",
         *         City:"<string>",
         *         State:"<string>",
         *         Zip:"<string>"
         *     }
         * }
         *@param successFunction function to be processed on ajax success
         *@param errorFunction function to be processed on ajax error
         * 
         */
        updateUserE911: function(userE911, successFunction, errorFunction){
            var serviceURL = "VRSUser/UpdateE911?input="+$.toJSON(userE911);
            callService(serviceURL, successFunction, errorFunction, "PUT");
        },
        
        resetPassword: function(username, successFunction, errorFunction){
            var serviceURL = "VRSUser/EmailPassword?input={Username:'"+username+"'}";
            callService(serviceURL, successFunction, errorFunction, "POST");
        },
        
        //Section WSDL: https://websvc.test.purple.us/ContactList/help
        getContactList: function(userGUID, successFunction, errorFunction){
            var serviceURL = "ContactList/GetContactList?input={guid:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "GET");
        },
        getContactsLastUpdated: function(userGUID, successFunction, errorFunction){
            var serviceURL = 'ContactList/GetLastUpdated?input={GUID:"'+userGUID+'"}';
            callService(serviceURL, successFunction, errorFunction, "GET");
        },
        createContact: function(userGUID, firstName, lastName, successFunction, errorFunction){
            var serviceURL = 'ContactList/CreateContact?input={GUID:"'+userGUID+'",FirstName:"'+firstName+'",LastName:"'+lastName+'"}';
            callService(serviceURL, successFunction, errorFunction, "POST");
        },
        /*@param userGUID string required
         *@param contactID string required
         *@param firstName string optional
         *@param lastName string optional
         *@param successFunction function to be processed on ajax success
         *@param errorFunction function to be processed on ajax error
         *
         */
        updateContact: function(userGUID, contactID, firstName, lastName, successFunction, errorFunction){
            var tempFName = firstName || '';
            var tempLName = lastName || '';
            var serviceURL = 'ContactList/UpdateContact?input={GUID:"'+userGUID+'",ContactID:"'+contactID+'"';
            serviceURL += ',FirstName:"'+firstName+'"';
            serviceURL += ',LastName:"'+lastName+'"';
            serviceURL += '}';
            callService(serviceURL, successFunction, errorFunction, "PUT");
        },
        deleteContact: function(userGUID, contactID, successFunction, errorFunction){
            var serviceURL = "ContactList/DeleteContact?input={ContactID:'"+contactID+"',GUID:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "DELETE");
        },
        /*@param newNumber an object in the following format:
         * {
         *     GUID:"<string>",
         *     ContactID:"<string>",
         *     IsFavorite:<boolean>,
         *     Number:"<string>",
         *     TypeID:<number>
         * }
         * Required Fields: All but IsFavorite, defaults to false
         *@param successFunction function to be processed on ajax success
         *@param errorFunction function to be processed on ajax error
         * 
         */
        createContactNumber: function(newNumber, successFunction, errorFunction){
            var serviceURL = "ContactList/CreateNumber?input="+$.toJSON(newNumber);
            callService(serviceURL, successFunction, errorFunction, "POST");
        },
        /*@param newNumber an object in the following format:
         * {
         *     GUID:"<string>",
         *     ContactID:"<string>",
         *     NumberID:"<string>",
         *     TypeID:<number>,
         *     Number:"<string>",
         *     IsFavorite:<boolean>
         * }
         * Required Fields: GUID, ContactID, NumberID
         *@param successFunction function to be processed on ajax success
         *@param errorFunction function to be processed on ajax error
         *
         */
        updateContactNumber: function(newNumber, successFunction, errorFunction){
            var serviceURL = "ContactList/UpdateNumber?input="+$.toJSON(newNumber);
            callService(serviceURL, successFunction, errorFunction, "PUT");
        },
        deleteContactNumber: function(userGUID, numberID, successFunction, errorFunction){
            var serviceURL = "ContactList/DeleteNumber?input={NumberID:'"+numberID+"',GUID:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "DELETE");
        },
        
        //Section WSDL: http://websvc.test.purple.us/CallHistory/help
        getCallHistory: function(userGUID, successFunction, errorFunction){
            var serviceURL = "CallHistory/GetCallHistory?input={guid:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "GET");
        },
        deleteCallHistory: function(userGUID, successFunction, errorFunction){
            var serviceURL = "CallHistory/DeleteCallHistory?input={guid:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "DELETE");
        },
        
        //PurpleMail
        getPurpleMail: function(userGUID, successFunction, errorFunction){
            var serviceURL = "PurpleMail/GetMessages?input={GUID:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "GET");
        },
        deletePM: function(userGUID, pmID, successFunction, errorFunction){
            var serviceURL = "PurpleMail/DeleteMessage?input={GUID:'"+userGUID+"',messageID:'"+pmID+"'}";
            callService(serviceURL, successFunction, errorFunction, "DELETE");
        },
        updatePMStatus: function(userGUID, pmID, status, successFunction, errorFunction){
            var serviceURL = "PurpleMail/UpdateMessageStatus?input={GUID:'"+userGUID+"',messageID:'"+pmID+"',Status:'"+status+"'}";
            callService(serviceURL, successFunction, errorFunction, "PUT");
        },
        pmResetWelcomeMessage: function(userGUID, successFunction, errorFunction){
            var serviceURL = "PurpleMail/ResetWelcomeMessage?input={GUID:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "PUT");
        },
        mailboxProperties: function(userGUID, successFunction, errorFunction){
            var serviceURL = "PurpleMail/GetMailboxProperties?input={GUID:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "GET", userGUID);
        },
        
        getUserAvatar: function(userGUID, successFunction, errorFunction){
            var serviceURL = "VRSUser/GetAvatar?input={GUID:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "GET");
        },
        setUserAvatar: function(userGUID, base64Image, mimeType, successFunction, errorFunction){
            //WKRASKO 080812 - PNG-306. Querystring method was un-reliable as some images encoded resulted in too
            //long of a querystring. For this method only, sending json in body.
            var tempURL = connection.url+"VRSUser/SetAvatar";
            console.log("WebService: Calling service "+tempURL);
            $.ajax({
                data: JSON.stringify({
                    "GUID": userGUID,
                    "Image": base64Image,
                    "MimeType": mimeType
                }),
                dataType: 'json',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + $().crypt({ method: "b64enc", source: connection.user+":"+connection.pass }) );
                    xhr.setRequestHeader("Origin","http://www.purple.us");
                },
                success: function(msg){
                    if(typeof successFunction == "function")
                        successFunction(msg);
                    else
                        defaultSuccessCallback(msg);
                },
                error:function (xhr, ajaxOptions, thrownError){
                    if(typeof errorFunction == "function")
                        errorFunction(thrownError);
                    else
                        defaultErrorCallback(xhr, thrownError);
                },
                complete: function(){
                    console.log("WebService: Completed service call.");
                },
                processData: false,
                type: 'PUT',
                url: tempURL
            });
        },
        deleteUserAvatar: function(userGUID, successFunction, errorFunction){
            var serviceURL = "VRSUser/DeleteAvatar?input={GUID:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "DELETE");
        },
        doiTRSLookup: function(dialString, successFunction, errorFunction){
            var serviceURL = "iTRS/LookupNumber?input={PhoneNumber:'"+dialString+"'}";
            callService(serviceURL, successFunction, errorFunction, "GET");
        },
        blockedNumbers: function(userGUID, successFunction, errorFunction){
            var serviceURL = "BlockNumber/GetBlockedNumbers?input={GUID:'"+userGUID+"'}";
            callService(serviceURL, successFunction, errorFunction, "GET");
        },
        blockNumber: function(userGUID, number, successFunction, errorFunction){
            var serviceURL = "BlockNumber/BlockNumber?input={GUID:'"+userGUID+"',PhoneNumber:'"+number+"'}";
            callService(serviceURL, successFunction, errorFunction, "POST");
        },
        unblockNumber: function(userGUID, number, successFunction, errorFunction){
            var serviceURL = "BlockNumber/UnblockNumber?input={GUID:'"+userGUID+"',PhoneNumber:'"+number+"'}";
            callService(serviceURL, successFunction, errorFunction, "DELETE");
        },
        
        getCallGroupArray: function(successFunction, errorFunction){
            var serviceURL = "CallGroup/GetCallGroup";
            callService(serviceURL, successFunction, errorFunction, "GET");
            
        },
        doITRSLookup: function(dialString, displayName, successFunction, errorFunction){
            //WKRASKO 080212 - PNG-264, do ajax directly. :( We need extra params in the callback now
            //WKRASKO 120412 - PNG-590.
            //PLEASE do not change this back to jQuery. Turns out, jQuery has pretty much always memory leaked in their ajax requests, and still has issues, so just leave this native.
            var xmlHttpReq = false;
            // Mozilla/Safari
            if (window.XMLHttpRequest) {
                xmlHttpReq = new XMLHttpRequest();
            }
            // IE, yes, I know we should never get this in our webkit based app, but it's good practice!
            else if (window.ActiveXObject) {
                xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP");
            }
            xmlHttpReq.open("GET", connection.url+"iTRS/LookupNumber?input={PhoneNumber:'"+dialString+"'}", true);
            xmlHttpReq.setRequestHeader('Authorization', "Basic " + $().crypt({ method: "b64enc", source: connection.user+":"+connection.pass }));
            xmlHttpReq.setRequestHeader('Origin', 'http://www.purple.us');
            xmlHttpReq.setRequestHeader('Content-Type', 'application/json');
            xmlHttpReq.onreadystatechange = function() {
                if (xmlHttpReq.readyState == 4) {
                    console.log("WebServices: Completed iTRS lookup for dialstring: "+dialString+" and displayName: "+displayName+".");
                    if(xmlHttpReq.status==200){
                        successFunction(JSON.parse(xmlHttpReq.responseText), dialString, displayName)
                    } else {
                        errorCallback(xmlHttpReq.statusText);
                    }
                }
            }
            xmlHttpReq.send(null);
        }
    }
})();