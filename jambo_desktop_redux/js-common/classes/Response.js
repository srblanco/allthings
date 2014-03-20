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

function Response(json) {
    $.extend(this, json);
}

Response.getUID = function(response) {
    var uid = (typeof response.appID !== 'undefined') ? response.appID+'-' : '-1-';
    uid += (typeof response.seqN !== 'undefined') ? response.seqN : uid += '-1';
    return uid;
};

Response.getCallInfoFailureReason = {
        CALL_NOT_PRESENT    : "CALL_NOT_PRESENT",
        LINE_NOT_PRESENT    : "LINE_NOT_PRESENT"
};

Response.makeCallNotification = {
        callStarted     : "callStarted",
        callNotStarted  : "callNotStarted"
};

Response.makeCallReason = {
        emptyDialString         : "emptyDialString",
        noEndpointAvailable     : "noEndpointAvailable",
        endpointNotRegistered   : "endpointNotRegistered",
        notAllowedOutboundCall  : "notAllowedOutboundCall",
        notAllowedIPCall        : "notAllowedIPCall",
        notAllowedE164Call      : "notAllowedE164Call",
        notAllowedH323Call      : "notAllowedH323Call"
};