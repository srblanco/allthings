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

function I18N(){
    this.language = undefined;
}
I18N.availableLanguages = {};

I18N.prototype.getDefaultLanguageCode = function(){
    for(var languageKey in I18N.availableLanguages) {
        if (I18N.availableLanguages[languageKey].isDefault) {
            return I18N.availableLanguages[languageKey].code;
        }
    }
    __log__.error("I18N|Can't find default language code between available languages, please check language files definitions!");
    return undefined;
};

I18N.prototype.getSelectedLanguageCode = function(){
    if (isDefined(this.language)) {
        return this.language.code;
    } else {
        return undefined;
    }
};

/**
 * Sets the current language and loads the translations map
 * 
 * @param languageCode from I18N.availableLanguages
 * @param onSuccess callback called on successful loaded language, will be called even if the requested language is already loaded
 * @param onFailure callback called on explicit failure, due to undefined or not available language
 */
I18N.prototype.setLanguageCode = function(languageCode, onSuccess, onFailure) {
    if (!isDefined(languageCode) || !isDefined(I18N.availableLanguages[languageCode])) {
        if (isDefinedAsFunction(onFailure)) {
            __log__.error("I18N|Language ["+languageCode+"] not loaded, current selected language ["+(isDefined(this.language) ? this.language.code : "undefined")+"] left unchanged");
            onFailure();
        }
    } else if (isDefined(languageCode) && isDefined(I18N.availableLanguages[languageCode])) {        
        if ((isDefined(this.language) && (this.language.code != languageCode)) || !isDefined(this.language)){
            this.language = I18N.availableLanguages[languageCode];
            __log__.info("I18N|Language ["+languageCode+"] loaded");
        } else {
            __log__.info("I18N|Language ["+languageCode+"] already loaded");
        }        
        if (isDefinedAsFunction(onSuccess)) { onSuccess(); }            
    }
};

/**
 * Returns the value for the given key in the current translation map, if no translation is possible "[<key>]" will be returned 
 * 
 * @param key to be translated
 * @param placeHolderValues a map for the placeholders in the value
 * @returns the translation for the given key if exists
 */
I18N.prototype.get = function (key, placeHolderValues) {
    if (!isDefined(this.language) || !isDefined(this.language.map)) {
        __log__.error("I18N|"+key+"|No valid language selected"); 
        return '[' + key + ']';
    }
    var value = this.language.map[key];
    if(!isDefined(value)) { 
        __log__.error("I18N|"+key+"|"+this.language.code+"|No translation available for current language, in production environments this key will be translated using default language if possible."); 
        var defaultCode = this.getDefaultLanguageCode();
        if (!__DEBUG__ && !__SDK__ && isDefined(defaultCode) && isDefined(I18N.availableLanguages[defaultCode].map) && isDefined(I18N.availableLanguages[defaultCode].map[key])) {
            value = I18N.availableLanguages[defaultCode].map[key];
        } else {
            return '[' + key + ']';
        }
    }    
    if(isDefined(placeHolderValues)) {
        for (var i in placeHolderValues) {                    
            var regexp = new RegExp('\\{('+i+')\\}', "g");
            value = value.replace(regexp, placeHolderValues[i]);
        }
        value = value.replace(/[\n\r]/g,"<br />");
    }
    return value;
};

/**
 * Performs the translation of a given piece of the current DOM, narrowed by selectorContext if provided; it searches for ANY 
 * tag with the class "i18n" found, uses the attribute "data-i18n_key" as the key and "data-i18n_placeHolderValues" as the placeholder map
 * to perform a translation via this.get(key, placeholder); all the innerHTML of the tag will be replace with the result of the translation.
 * 
 * NOTE: the placeholdermap is loaded throught a $.evalJSON call
 * 
 * @param selectorContext
 */
I18N.prototype.translate = function(selectorContext){
    if (!isDefined(this.language) || !isDefined(this.language.map)) {
        __log__.error("I18N|Can't perform translation, no valid language selected");
        return;
    }
    // translating tag contents
    $(".i18n", selectorContext).each(function(index, element) {
        var $this = $(this);
        var key = $this.data('i18n_key');
        var placeHolderValuesString = $this.data('i18n_placeHolderValues');
        if (isDefined(key) && (key.trim().length>0)) {
            var placeHolderValues = isDefined(placeHolderValuesString) ? placeHolderValuesString : undefined;
            //WKRASKO 101712 - PNG-519
            if($this.is("input"))
                $this.val(_i18n_.get(key, placeHolderValues))
            else if($this.hasClass('typeToggle') && $this.find('span').length>0)
                $this.find('span').empty().html(_i18n_.get(key, placeHolderValues));
            else
                $this.empty().html(_i18n_.get(key, placeHolderValues));
        } 
    });
    // translating tag tooltips
    $(".i18nTitle", selectorContext).each(function(index, element) {
        var $this = $(this);
        var key = $this.data('i18nTitle_key');
        var placeHolderValuesString = $this.data('i18nTitle_placeHolderValues');
        if (isDefined(key) && (key.trim().length>0)) {
            var placeHolderValues = isDefined(placeHolderValuesString) ? placeHolderValuesString : undefined;
            $this.attr("title", _i18n_.get(key, placeHolderValues));
        } 
    });
    //WKRASKO 101812 - PNG-519
    if(isDefinedAsFunction(populateVILangSelect))
        populateVILangSelect();
    //WKRASKO 120512 - PNG-775, set image
    if(this.language.code=="es_ES")
        $('#networkStatus').css('background-image','url(../img/networkStatus_spr-esp.png)');
    else
        $('#networkStatus').css('background-image','url(../img/networkStatus_spr.png)');
    //WKRASKO 120612 - PNG-776
    if(typeof JAMBO_APP !== 'undefined'){
        if(this.language.code=="es_ES")
            JAMBO_APP.ContactList.typeLookupObject = JAMBO_APP.ContactList.numberTypesES;
        else
            JAMBO_APP.ContactList.typeLookupObject = JAMBO_APP.ContactList.numberTypes;
        JAMBO_APP.ContactList.resetCreateEditContactNumberRow();
        JAMBO_APP.BlockedNumbers.getBlockedNumbers(JAMBO_APP.activeUserAccount);
        JAMBO_APP.ContactList.populate(JAMBO_APP.activeUserAccount);
        syncHistory();
    }
    //WKRASKO 051713 - PNG-1024
    translateInCallButtons();
};

/**
 * Sets the innerHTML of the element(s) selected using selector and selectorContext, using key and placeholder via this.get(key, placeholder);
 * this method modifies the element(s) selected adding the class "i18n" and the attributes "data-i18n_key" and "data-i18n_placeHolderValues" with the
 * respective values to enable subsequent translation operated via this.translate(selectorContext).
 * 
 * NOTE: the "data-i18n_placeHolderValues" attribute's value is written via a $.toJSON call
 * 
 * @param selector
 * @param selectorContext
 * @param key
 * @param placeHolderValues
 */
I18N.prototype.setInnerHTML = function(selector, selectorContext, key, placeHolderValues) {
    var $this = $(selector, selectorContext);
    if (isDefined($this) && isDefined(key) && (key.trim().length>0)) {
        $this.addClass("i18n");
        $this.data("i18n_key", key);
        if (isDefined(placeHolderValues)) { 
            $this.data("i18n_placeHolderValues", placeHolderValues);             
        } else {
            $this.data("i18n_placeHolderValues", undefined);
        }
        $this.empty().html(_i18n_.get(key, placeHolderValues));
    }
};

/**
 * Returns a string containing a piece of "i18n enable" HTML already translate and ready to be placed; to minimize the complexity impact on the target DOM,
 * it creates a <span>; please note that, where possible, using the this.setInnerHTML, this.translate or this.get is preferred because of the lower impact on
 * the DOM structure. 
 *
 * NOTE: the "data-i18n_placeHolderValues" attribute's value is written via a $.toJSON call
 *
 * @param key
 * @param placeHolderValues
 * @returns the "i18n enabled" HTML
 */
I18N.prototype.getHTML = function(key, placeHolderValues) {    
    var html = undefined;
    if (isDefined(key)) {
        html = "<span class=\"i18n\" data-i18n_key=\""+key+"\"";
        if (isDefined(placeHolderValues)) {
            html += " data-i18n_placeHolderValues=\'"+$.toJSON(placeHolderValues)+"\'";
        }
        html += ">"+_i18n_.get(key, placeHolderValues)+"</span>";
    } else {
        __log__.error("I18N|Can't create i18n HTML for undefined key");
    }
    return html;
};

var _i18n_ = new I18N();