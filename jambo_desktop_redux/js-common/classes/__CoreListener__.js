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

function __CoreListener__(){
    this.callbacks = {}; 
}

__CoreListener__.prototype.setCallback = function(command, callback) {
    if ((typeof command !== 'undefined') && (typeof callback !== 'undefined')) {
        this.callbacks[Command.getUID(command)] = callback;
    }
};

__CoreListener__.prototype.onResponse = function(json) {    
    if (__DEBUG__ || __SDK__) {
        var start = new Date().getTime();
        if (!isDefined(json)) { __log__.error(__APP_ID__+"|RES|Undefined JSON, discarding response"); } 
        else {
            try { this.onResponse_(json, start); } 
            catch (e) { __log__.error(__APP_ID__+"|RES|"+(new Date().getTime() - start)+"ms|Exception during __coreListener__.onResponse(): "+e.name+", "+e.message+", "+e.sourceURL+":"+e.line); }
        }
    } else {
        // skipping try catch to improve performances in production environments
        this.onResponse_(json, undefined);
    }
};

__CoreListener__.prototype.onResponse_ = function(json, start) {
    var response = new Response(json);
    if (typeof __coreListener__.callbacks[Response.getUID(response)] !== 'undefined') {
        __log__.debug(__APP_ID__+"|RES|"+response.seqN+"|"+response.appID+"|"+response.command+"|Processing using provided callback...");
        var callback = __coreListener__.callbacks[Response.getUID(response)];
        callback(response);
        delete __coreListener__.callbacks[Response.getUID(response)];
    } else {
        __log__.debug(__APP_ID__+"|RES|"+response.seqN+"|"+response.appID+"|"+response.command+"|Processing...");
        __coreListener__.processResponse(response);
    }
    __log__.info(__APP_ID__+"|RES|"+response.seqN+"|"+response.appID+"|"+response.command+"|"+(isDefined(start) ? (new Date().getTime() - start)+"ms|":"")+"Processed");
};

__CoreListener__.prototype.onEvent = function(json) {
    if (__DEBUG__ || __SDK__) {
        var start = new Date().getTime();
        if (!isDefined(json)) { __log__.error(__APP_ID__+"|EVT|Undefined JSON, discarding event"); } 
        else {
            try { this.onEvent_(json, start); } 
            catch (e) { __log__.error(__APP_ID__+"|EVT|"+(new Date().getTime() - start)+"ms|Exception during __coreListener__.onEvent(): "+e.name+", "+e.message+", "+e.sourceURL+":"+e.line); }
        }
    } else {
        // skipping try-catch statement to improve performances in production environments
        this.onEvent_(json, undefined);
    }
};

__CoreListener__.prototype.onEvent_ = function(json, start) {
    var event = new Event(json);
    __log__.debug(__APP_ID__+"|EVT|"+event.seqN+"|"+event.event+"|Processing...");
    __coreListener__.processEvent(event);
    __log__.info(__APP_ID__+"|EVT|"+event.seqN+"|"+event.event+"|"+(isDefined(start) ? (new Date().getTime() - start)+"ms|":"")+"Processed");
};

__CoreListener__.prototype.processResponse = function(response) { // to be overridden
    __log__.warn(__APP_ID__+"|RES|"+response.seqN+"|"+response.appID+"|"+response.command+"|Unhandled response");
};

__CoreListener__.prototype.processEvent = function(event) { // to be overridden
    __log__.warn(__APP_ID__+"|EVT|"+event.seqN+"|"+event.event+"|Unhandled event");
};