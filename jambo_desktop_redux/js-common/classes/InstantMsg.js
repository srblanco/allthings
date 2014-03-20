 /*
 * This source  code  is  part of  the  Logitech   Mirial   MCS   Client   Software 
 * Development Kit(referred here as the "SDK"). SDK is licensed to you  subject  to 
 * the terms of the "MCS Client  SDK  License  Agreement"  (referred  here  as  the 
 * "License Agreement"). The  License  Agreement  forms  a legally binding contract 
 * between you and Logitech Mirial in relation to your use of the SDK.
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

function InstantMsg(json){ 
    $.extend(this, json);
    __log__.info(this.timestamp);
    if (!isDefined(this.sourceUri)) { this.sourceUri = this.myUri; }
    if (!isDefined(this.destinationUri)) { this.destinationUri = this.myUri; }
    this.remotePartyUri = this.sourceUri;
    this.direction = InstantMsg.direction.incoming;
    if ((this.sourceUri == this.myUri) || (this.sourceUri == "contact:self")) { 
        this.remotePartyUri = this.destinationUri;
        this.direction = InstantMsg.direction.outgoing;
    }
    if (!isDefined(this.timestamp)) {
        this.timestamp = new Date().getTime();
    } else {
    	try {
    		this.timestamp = parseInt(this.timestamp);
    	} catch (e) {
    		this.timestamp = new Date().getTime();
    	}
    }
    if (isDefined(this.message) && (this.message === "-x-serverMessage-messageNotSent-userNotAvailableForChat")) {
        this.serverMessage = true;
        this.failed = true;
        this.userNotAvailableForChat = true;
    }
};

InstantMsg.direction = {
        incoming : "incoming",
        outgoing : "outgoing"
};
InstantMsg.thisClass = "InstantMsg";
InstantMsg.prototype.thisClass = "InstantMsg";

InstantMsg.sortByTimestampAsc = function(a, b){ return compareNumbers(a.timestamp, b.timestamp, 1); };
InstantMsg.sortByTimestampDesc = function(a, b){ return compareNumbers(a.timestamp, b.timestamp, -1); };