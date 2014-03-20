//Application Contacts Entity
JAMBO_APP.ContactList = (function () {
    //PRIVATE
    var contacts = null; //Holder for returned contacts from web services.
    var contactNumData = new Array();
    var contactsLastUpdated = null;
    var tempVNum = null;
    var parseNumbers = function () {
        //NOTE: We already have contacts above!! Lets try not to overuse contactNumData,
        //was intended for auto-complete and started getting used for everything, greatly impacting performance.
        contactNumData = [];
        if (contacts != null) {
            //populate contactNumData/favorites array
            $.each(contacts, function (cndkey, cndvalue) {
                $.each(contacts[cndkey].Numbers, function (k, v) {
                    var formattedNum = contacts[cndkey].Numbers[k].Number;
                    if (sipPhonePurpReg.test(formattedNum)) {
                        formattedNum = format10D(formattedNum);
                    } else {
                        tempVNum = validateDialString(formattedNum);
                        if (tempVNum.status && tempVNum.type == "10d") {
                            contacts[cndkey].Numbers[k].Number = tempVNum.dialString;
                            formattedNum = format10D(tempVNum.dialString);
                        }
                    }
                    //WKRASKO 101712 - PNG-582, watch them go back on this! They want a full search param
                    //if(formattedNum != null && formattedNum.length>15)
                    //formattedNum = formattedNum.substring(0,12)+"...";
                    var formattedName = contacts[cndkey].FirstName + " " + contacts[cndkey].LastName;
                    //if(formattedName.length>15)
                    //formattedName = formattedName.substring(0,12)+"...";
                    if (contacts[cndkey].Numbers[k].Number != null)
                        contactNumData.push({
                            numID: contacts[cndkey].Numbers[k].ID,
                            contactID: contacts[cndkey].ID,
                            fav: contacts[cndkey].Numbers[k].IsFavorite,
                            type: JAMBO_APP.ContactList.typeLookupObject[contacts[cndkey].Numbers[k].TypeID],
                            label: trimToPx(formattedName, 177) + "<div class='cb'></div> <div class='autocomplete_num'>" + formattedNum + "</div>  <div class='autocomplete_type'>" + JAMBO_APP.ContactList.typeLookupObject[contacts[cndkey].Numbers[k].TypeID] + "</div><span class='dn'>" + contacts[cndkey].Numbers[k].Number + "</span><div class='push'></div>", //For autocomplete
                            inlineLabel: formattedName + " " + formattedNum, //For inline autocomplete. WKRASKO 073112 - PNG-281
                            value: contacts[cndkey].Numbers[k].Number, //For jQuery autocomplete
                            FirstName: contacts[cndkey].FirstName,
                            LastName: contacts[cndkey].LastName
                        });
                });
            });
        }
    }

    //PUBLIC
    return {
        numberTypeIDs: {
            WORK: 1,
            HOME: 2,
            MOBILE: 3,
            //We're not sure what happend to 4
            PERSONAL: 5,
            PAGER: 6,
            MAIN: 7,
            FAX_HOME: 8,
            FAX_WORK: 9,
            OTHER: 10
        },
        numberTypes: {
            1: "Work",
            2: "Home",
            3: "Mobile",
            //We're not sure what happened to 4
            5: "Personal",
            6: "Pager",
            7: "Main",
            8: "Fax Home",
            9: "Fax Work",
            10: "Other"
        },
        numberTypesES: {
            1: "Trabajo",
            2: "Hogar",
            3: "Móvil",
            //We're not sure what happened to 4
            5: "Personal",
            6: "Localizador",
            7: "Principal",
            8: "Fax Hogar",
            9: "Fax Trabajo",
            10: "Otro"
        },
        typeLookupObject: null,
        numberDiv: '<div id="${id}_numbers" class="cNum cb${divVis}"></div>',
        numberRow: '<hr class="dk2" />\n\
                    <div id="cNum_${number_stripped}|${type}" class="contactNum${extra_class}">\n\
                        <div id="icon_${number_stripped}" class="fl numType ${number_type}"></div>\n\
                        ${number}\n\
                        {{html fav_div}}\n\
                    </div>',
        contactEditButton: '<div id="contactsEdit_${id}" class="contactEditBtn fr" onClick="popEditContact(${id});">${label}</div>',
        favoriteItemTemplate: '<div class="favorite ${custom_classes}" id="${id}">\n\
                        <div class="favContent">\n\
                            <div class="fr">\n\
                                <div class="numType numType_${num_type} fl"></div>\n\
                                <div class="favNumber fl">${number}</div>\n\
                            </div>\n\
                            <div class="favName fl">${display_name}</div>\n\
                            <div class="favStar fl"></div>\n\
                        </div>\n\
                   </div>',
        //PNG-475 KTRUMBLE 10012012 - update row hover state
        favoriteItemTemplateDesktop: '<div class="favorite contactItem_${evenodd} ${custom_classes}" id="fav_${id}">\n\
                        <div class="favContent">\n\
                            <div class="favoritesLCol fl">\n\
                                <div id="favNameLong_${numID}" class="favNameLong fl${longNameClass}" title="${theName}">${theName}</div>\n\
                                <div id="favNameFirst_${numID}" class="favName fl${shortNameClass} favNameFirst" title="${first_name}">${first_name}</div>\n\
                                <div id="favNameLast_${numID}" class="favName fl${shortNameClass}" title="${last_name}">${last_name}</div>\n\
                            </div>\n\
                            <div class="contactsRCol fl" onClick="initCallFromDialString(\'${id}\', \'${displayName}\')">\n\
                                <div class="fl">\n\
                                    <div class="favStar fl"></div>\n\
                                    <div data-cnID="${id}" class="favNumber fl">${number}</div>\n\
                                </div>\n\
                                <div class="numType fl">${num_type}</div>\n\
                                <div class="cCallIcon dn"></div>\n\
                            </div>\n\
                            <div data-dialNumber="${id}" id="favoritePM_${id}" class="pmaIcon pmAvailableIcon_off fl"></div>\n\
                        </div>\n\
                   </div>',
        //PNG-475 KTRUMBLE 10012012 - update row hover state
        contactItemTemplateDesktop: '<div class="contactItem contactItem_${evenodd}" id="contact_${id}" data-contactRecordEditMenu="cNum|${id}|${dialNumber}|${BlockClass}|${UnblockClass}|${hasTranscripts}|${isBlocked}">\n\
                        <div id="${numID}" class="contactContent">\n\
                            <div class="contactsLCol fl">\n\
                                <div id="contactNameFirst_${id}" class="contactName fl contactNameFirst" title="${first_name}">${first_name}</div>\n\
                                <div id="contactNameLast_${id}" class="contactName fl" title="${last_name}">${last_name}</div>\n\
                            </div>\n\
                            <div class="contactsRCol fl" onClick="initCallFromDialString(\'${dialNumber}\', \'${displayName}\')">\n\
                                <div class="fl">\n\
                                    <div class="favStar${favClass} fl"></div>\n\
                                    <div data-cnID="${id}" class="contactNumber fl">${number}</div>\n\
                                </div>\n\
                                <div class="numType fl">${num_type}</div>\n\
                                <div class="cCallIcon dn"></div>\n\
                            </div>\n\
                            <div data-dialNumber="${dialNumber}" id="contactPM_${dialNumber}" class="pmaIcon pmAvailableIcon_off fl"></div>\n\
                        </div>\n\
                   </div>',
        //PNG-475 KTRUMBLE 10012012 - update row hover state
        multilineContactItemTemplate: '<div class="contactItem contactItem_${evenodd}" id="contact_${id}" data-contactRecordEditMenu="cNum|${id}|${dialNumber}|${BlockClass}|${UnblockClass}|${hasTranscripts}|${isBlocked}">\n\
                <div class="contactItemTableWrapper contactItem_${evenodd}"><table class="contactItemTable" id="contact_${id}" border="0" cellpadding="0" cellspacing="0">\n\
                    <tr>\n\
                        <td class="contactContentMulti1">\n\
                            <div id="contactNameLong_${id}" class="contactNameLong fl ${longNameClass}" title="${theName}">${theName}</div>\n\
                            <div id="contactNameFirst_${id}" class="contactName fl ${shortNameClass} contactNameFirst" title="${first_name}">${first_name}</div>\n\
                            <div id="contactNameLast_${id}" class="contactName fl ${shortNameClass}" title="${last_name}">${last_name}</div>\n\
                        </td>\n\
                        <td id="contactNumbers_${id}"></td>\n\
                       </tr></table></div>',
        //PNG-475 KTRUMBLE 10012012 - update row hover state
        multilineContactItemWrapper: '<div id="${numID}" class="contactWrapper cl fl" onClick="initCallFromDialString(\'${dialNumber}\', \'${displayName}\')">\n\
                            <div class="fl">\n\
                                <div class="favStar${favClass} fl"></div>\n\
                                <div data-cnID="${id}" data-nID="${numID}" class="contactNumber fl">${number}</div>\n\
                            </div>\n\
                            <div class="numType fl">${num_type}</div>\n\
                            <div class="cCallIcon dn"></div>\n\
                        </div>\n\
                        <div data-dialNumber="${dialNumber}" id="contactPM_${dialNumber}" class="pmaIcon pmAvailableIcon_off fl"></div>',
        contactsAlphaSeparator: '<div id="${alphalink}_sep" class="alphaSep"><div class="alphaSepTab">${alpha}</div></div>',
        createEditContactNumberRow: '<tr class="createEditContactNumber"><td><br/><div class="favStar" onclick="$(this).toggleClass(\'isFav_blue\');"></div></td><td class="block_td"><span>${number_label}</span><br/><input type="text" value="${number_value}" class="phone_input"/><div id="blockedNumOverlay_txt_${number_value}" class="blockedNumOverlay_txt">BLOCKED</div><div id="blockedNumOverlay_${number_value}" class="blockedNumOverlay"></div></td><td><span class="dn">${type_label}</span><br/><select>',

        populate: function (userGUID) {
            JAMBO_APP.WebServices.getContactList(userGUID, JAMBO_APP.ContactList.loadSuccess, JAMBO_APP.ContactList.loadError);
        },
        sortBy: 'FirstName', //default sort order
        favSortBy: 'FirstName', //default FAVORITES sort order
        loadSuccess: function (result) {
            clearContactsTab();
            contacts = result.Contacts;

            //WKRASKO 110712 - Adding a check on our end, although this is really a purple.us issue. (site should not allow creation of contact with no number, or at least not create a blank/0 id number record if so)
            var len = contacts.length;
            while (len--) {
                if (contacts[len].Numbers.length == 1 && (contacts[len].Numbers[0].ID == "0" || contacts[len].Numbers[0].ID == 0))
                    contacts.splice(len, 1);
            }

            contactsLastUpdated = new Date(result.LastUpdated);
            parseNumbers();
            if (JAMBO_APP.ContactList.favSortBy == 'LastName') {
                contactNumData = contactNumData.sortOn("LastName", "FirstName");
            } else {
                contactNumData = contactNumData.sortOn("FirstName", "LastName");
            }
            //WKRASKO 051713 - No longer used, so why are we processing! Shall leave it behind in case minds get changed again.
            //drawFavs();

            if (JAMBO_APP.ContactList.sortBy == 'LastName') {//WKRASKO 072412 - PNG-211, changing sort
                contacts = contacts.sortOn("LastName", "FirstName");
            } else {
                contacts = contacts.sortOn("FirstName", "LastName");
            }
            buildTranscriptLib();
            drawContactsTab();

            if (applicationSettings.mode == "kiosk") { //Populate flyout menu
                kiosk_flyout_menu();
            } else { }

            console.log("ContactList: Successfully populated contact list from PWS.");
            if (isDefinedAsFunction(setDivScrollPositions))//WKRASKO 111512 - PNG-716
                setDivScrollPositions('Contacts'); //PNG-935 KTRUMBLE 04162013 - fix div scroll position function; was setting the position to 0 every time
        },
        loadError: function () {
            console.log("ContactList: There was an error loading the users contacts.");
        },
        getLastUpdate: function () {
            return contactsLastUpdated;
        },
        getContact: function (theID) {
            returnObj = null;
            if (contacts != null) {
                $.each(contacts, function (key, value) {
                    if (contacts[key].ID == theID)
                        returnObj = contacts[key];
                });
            }
            return returnObj;
        },
        getContacts: function () {
            return contacts;
        },
        getContactNumData: function () {
            return contactNumData;
        },
        getFavorites: function () {
            var returnArray = [];
            if (contactNumData != null) {
                $.each(contactNumData, function (key, value) {
                    if (contactNumData[key].fav == true || contactNumData[key].fav == "true")
                        returnArray.push(contactNumData[key]);
                });
            }
            return returnArray;
        },
        getNumTypeID: function (numberType) {
            var numTypeID = null;
            for (tType in JAMBO_APP.ContactList.typeLookupObject) {
                if (numberType == JAMBO_APP.ContactList.typeLookupObject[tType])
                    numTypeID = tType;
            }
            return numTypeID;
        },
        addContact: function (fName, lName, callBack) {
            JAMBO_APP.WebServices.createContact(JAMBO_APP.activeUserAccount, fName, lName, callBack);
        },
        updateContact: function (contactID, fName, lName) {
            JAMBO_APP.WebServices.updateContact(JAMBO_APP.activeUserAccount, contactID, fName, lName);
        },
        deleteContact: function (contactID) {
            JAMBO_APP.WebServices.deleteContact(JAMBO_APP.activeUserAccount, contactID);
            var numbersToUnblock = []; //PNG-975 KTRUMBLE 04102013 - unblock numbers if number/contact deleted
            if (contacts != null) {
                for (var i = 0; i < contacts.length; i++) {
                    if (contacts[i].ID == contactID) {
                        numbersToUnblock = contacts[i].Numbers; //PNG-975 KTRUMBLE 04102013 - unblock numbers if number/contact deleted
                        contacts.splice(i, 1);
                    }
                }
            }
            //PNG-975 KTRUMBLE 04102013 - unblock numbers if number/contact deleted
            for (y = 0; y < numbersToUnblock.length; y++) {
                if (JAMBO_APP.BlockedNumbers.isBlocked(numbersToUnblock[y].Number)) {
                    numberToUnblock = numbersToUnblock[y].Number;
                    JAMBO_APP.BlockedNumbers.unblockNumber(numberToUnblock);
                }
            }
            parseNumbers();
            //WKRASKO 051713 - No longer used, so why are we processing!
            //drawFavs();
            clearContactsTab();
            drawContactsTab();
            if (contactNumData != null) {
                if (applicationSettings.mode == "kiosk") {
                } else {
                    $("#outboundNumEntry").autocomplete({
                        source: contactNumData
                    });
                }
            }
        },
        //Returns Numbers as array of objects.
        getNumbers: function (contactID) {
            if (contacts != null) {
                $.each(contacts, function (key, value) {
                    if (contacts[key].ID == contactID)
                        return contacts[key].Numbers;
                });
            }
        },
        addNumber: function (contactID, number, typeID, isFavorite) {
            JAMBO_APP.WebServices.createContactNumber({ GUID: JAMBO_APP.activeUserAccount, ContactID: contactID, IsFavorite: isFavorite, Number: number, TypeID: typeID });
            //Returns:
            /*WebService: {"Contacts":[{"FirstName":null,"ID":1653649,"LastName":null,"Numbers":[{"ID":3041998,"IsFavorite":true,"Number":"1234545787","TypeDescription":null,"TypeID":2}]}],"ResultCode":"OK","ResultMessage":"Successfully created contact list number."}*/
        },
        updateNumber: function (contactID, numberID, typeID, number, isFavorite) {
            JAMBO_APP.WebServices.updateContactNumber({ GUID: JAMBO_APP.activeUserAccount, ContactID: contactID, NumberID: numberID, TypeID: typeID, Number: number, IsFavorite: isFavorite });
        },
        deleteNumber: function (numberID) {
            JAMBO_APP.WebServices.deleteContactNumber(JAMBO_APP.activeUserAccount, numberID);
        },
        sortByLast: function () {
            //WKRASKO 072412 - PNG-211, changing sort
            contacts = contacts.sortOn("LastName", "FirstName");
        },
        sortByFirst: function () {
            //WKRASKO 072412 - PNG-211, changing sort
            contacts = contacts.sortOn("FirstName", "LastName");
        },
        //WKRASKO 111212 - PNG-699, change below to use newer sort method, also changing above to re-sort on sync.
        sortFavoritesByLast: function () {
            contactNumData = contactNumData.sortOn('LastName', 'FirstName');
        },
        sortFavoritesByFirst: function () {
            contactNumData = contactNumData.sortOn('FirstName', 'LastName');
        },

        //NOTE: We need it, but un-reliable function. If I and my wife are entered into contacts with same (home) number, it will always grab the first of us, not necessarily the correct one of us
        //We warned early on about this and were told to do it anyways, so noting for future reference.
        getContactByNumber: function (number) {
            var theID = "";
            if (contacts != null) {
                for (var i = 0; i < contacts.length; i++) {
                    for (var j = 0; j < contacts[i].Numbers.length; j++) {
                        if (contacts[i].Numbers[j].Number == number)
                            theID = contacts[i].ID;
                    }
                }
            }
            return theID;
        },
        //NOTE: We need it, but un-reliable function. If I and my wife are entered into contacts with same (home) number, it will always grab the first of us, not necessarily the correct one of us
        //We warned early on about this and were told to do it anyways, so noting for future reference.
        contactExists: function (number) {
            var isContact = false;
            if (contacts != null) {
                for (var i = 0; i < contacts.length; i++) {
                    for (var j = 0; j < contacts[i].Numbers.length; j++) {
                        if (contacts[i].Numbers[j].Number == number)
                            isContact = true;
                    }
                }
            }
            return isContact;
        },
        //NOTE: We need it, but un-reliable function. If I and my wife are entered into contacts with same (home) number, it will always grab the first of us, not necessarily the correct one of us
        //We warned early on about this and were told to do it anyways, so noting for future reference.
        numberTypeByNumber: function (number) {
            var numType = null;
            if (contacts != null) {
                for (var i = 0; i < contacts.length; i++) {
                    for (var j = 0; j < contacts[i].Numbers.length; j++) {
                        if (contacts[i].Numbers[j].Number == number)
                            numType = JAMBO_APP.ContactList.typeLookupObject[contacts[i].Numbers[j].TypeID];
                    }
                }
            }
            return numType;
        },
        //NOTE: We need it, but un-reliable function. If I and my wife are entered into contacts with same (home) number, it will always grab the first of us, not necessarily the correct one of us
        //We warned early on about this and were told to do it anyways, so noting for future reference.
        contactNamesByNumber: function (number) {
            var first_last = new Array();
            if (contacts != null) {
                for (var i = 0; i < contacts.length; i++) {
                    for (var j = 0; j < contacts[i].Numbers.length; j++) {
                        if (contacts[i].Numbers[j].Number == number) {
                            first_last[0] = contacts[i].FirstName;
                            first_last[0] = (first_last[0] != null && first_last[0] != ' ' && first_last[0] != '') ? first_last[0] : '';
                            first_last[1] = contacts[i].LastName;
                            first_last[1] = (first_last[1] != null && first_last[1] != ' ' && first_last[1] != '') ? first_last[1] : '';
                        }
                    }
                }
            }
            return first_last;
        },
        //NOTE: We need it, but un-reliable function. If I and my wife are entered into contacts with same (home) number, it will always grab the first of us, not necessarily the correct one of us
        //We warned early on about this and were told to do it anyways, so noting for future reference.
        contactNameByNumber: function (number) {
            var numName = null, numFName = '', numLName = '';
            if (contacts != null) {
                for (var i = 0; i < contacts.length; i++) {
                    for (var j = 0; j < contacts[i].Numbers.length; j++) {
                        if (contacts[i].Numbers[j].Number == number) {
                            numFName = contacts[i].FirstName;
                            numFName = (numFName != null && numFName != ' ' && numFName != '') ? numFName : '';
                            numLName = contacts[i].LastName;
                            numLName = (numLName != null && numLName != ' ' && numLName != '') ? numLName : '';
                            numName = (numFName != '') ? numFName + ' ' : '';
                            numName = (numName != '') ? numName + numLName : numLName;
                        }
                    }
                }
            }
            return numName;
        },
        //NOTE: We need it, but un-reliable function. If I and my wife are entered into contacts with same (home) number, it will always grab the first of us, not necessarily the correct one of us
        //We warned early on about this and were told to do it anyways, so noting for future reference.
        isFavoriteByNumber: function (number) {
            var fav = false;
            if (contacts != null) {
                for (var i = 0; i < contacts.length; i++) {
                    for (var j = 0; j < contacts[i].Numbers.length; j++) {
                        if (contacts[i].Numbers[j].Number == number && (contacts[i].Numbers[j].IsFavorite || contacts[i].Numbers[j].IsFavorite == "true")) {
                            fav = true;
                        }
                    }
                }
            }
            return fav;
        },
        //NOTE: We need it, but un-reliable function. If I and my wife are entered into contacts with same (home) number, it will always grab the first of us, not necessarily the correct one of us
        //We warned early on about this and were told to do it anyways, so noting for future reference.
        getNumTypeByNumber: function (number) {
            var numType = null;
            if (contacts != null) {
                for (var i = 0; i < contacts.length; i++) {
                    for (var j = 0; j < contacts[i].Numbers.length; j++) {
                        if (contacts[i].Numbers[j].Number == number) {
                            numType = JAMBO_APP.ContactList.typeLookupObject[contacts[i].Numbers[j].TypeID];
                        }
                    }
                }
            }
            return numType;
        },
        resetCreateEditContactNumberRow: function () {
            JAMBO_APP.ContactList.createEditContactNumberRow = '<tr class="createEditContactNumber"><td><br/><div class="favStar" onclick="$(this).toggleClass(\'isFav_blue\');"></div></td><td class="block_td"><span>${number_label}</span><br/><input id="editInput_${id}" type="text" value="${number_value}" class="phone_input"/><div id="blockedNumOverlay_txt_${number_value}" class="blockedNumOverlay_txt dn">BLOCKED</div><div id="blockedNumOverlay_${number_value}" class="blockedNumOverlay dn"></div></td><td><span class="dn">${type_label}</span><br/><select>';
            for (tType in JAMBO_APP.ContactList.typeLookupObject) {
                JAMBO_APP.ContactList.createEditContactNumberRow += '<option value="' + tType + '">' + JAMBO_APP.ContactList.typeLookupObject[tType] + '</option>';
            }
            JAMBO_APP.ContactList.createEditContactNumberRow += '</select></td><td><div class="blockSign${blockClass}" data-id="${blockID}"></div></td><td class="minus_td"><div class="minusSign" onclick="removeNumberRow(this);" data-id="${id}"></div></td></tr>';
        }
    }
})();