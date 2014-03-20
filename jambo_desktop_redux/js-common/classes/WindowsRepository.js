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

function WindowsRepository(savedGeometries, unsavedGeometriesCallback, onCreateCallback, onUnloadCallback){
    this.windowsSavedGeometries_ = savedGeometries;
    this.onUnsavedGeometries_ = unsavedGeometriesCallback;
    this.onCreateCallback_ = onCreateCallback;
    this.onUnloadCallback_ = onUnloadCallback;
    this.windows_ = {};
}

WindowsRepository.prototype.setSavedGeometries = function(savedGeometries) {
    this.windowsSavedGeometries_ = savedGeometries;
};

WindowsRepository.prototype.getWindow = function(name) {
    if (isDefined(this.windows_[name]) && isDefined(this.windows_[name].windowRef_) && !this.windows_[name].windowRef_.closed) {
        // window already open
        return this.windows_[name].windowRef_;
    } else {
        return undefined;
    }
};

WindowsRepository.prototype.isOpen = function(name) {
    return isDefined(this.getWindow(name));
};

WindowsRepository.prototype.getParameters = function(name) {
    var windowElement = this.getWindow_(name);
    if (isDefined(windowElement)) {
        return windowElement.parameters_;
    } else {
        return undefined;
    }
};

WindowsRepository.prototype.getSavedGeometry = function(name) {
    var windowElement = this.getWindow_(name);
    if (isDefined(windowElement)) {
        return windowElement.savedGeometry_;
    } else {
        return undefined;
    }
};

WindowsRepository.prototype.getWindow_ = function(name) {
    if (isDefined(this.windows_[name]) && isDefined(this.windows_[name].windowRef_) && !this.windows_[name].windowRef_.closed) {
        return this.windows_[name];
    } else {
        return undefined;
    }
};

WindowsRepository.prototype.open = function(url, name, title, parameters, onUnloadCallback) {    
    if (isDefined(this.windows_[name]) && isDefined(this.windows_[name].windowRef_) && !this.windows_[name].windowRef_.closed) {
        // window already open
        __log__.debug("WINDOW|Already open window["+name+"|"+url+"], bringing to front...");
        this.windows_[name].windowRef_.__thisWindow__.bringToFront();
        
    } else {
        // completing window parameters
        this.windows_[name] = {};
        this.windows_[name].parameters_ = parameters;
        this.windows_[name].savedGeometry_ = (isDefined(this.windowsSavedGeometries_) && (this.windowsSavedGeometries_[name])) ? this.windowsSavedGeometries_[name] : undefined;
        this.windows_[name].onUnload_ = onUnloadCallback;
        
        // opening window
        var windowRef = __thisWindowProxy__.openWindow(url, name);        
        if (isDefined(windowRef)) { // window open ok
            __log__.debug("WINDOW|Opened window["+name+"|"+url+"]");
            this.windows_[name].windowRef_ = windowRef;
            if (isDefined(title)) { this.windows_[name].windowRef_.document.title = title; }
            if (isDefinedAsFunction(this.onCreateCallback_)) { this.onCreateCallback_(this.windows_[name].windowRef_, name); }
        } else { // window open ko
            __log__.error("WINDOW|Can't open window["+name+"|"+url+"], something gone wrong...");
            delete this.windows_[name];
        }        
    }
};

WindowsRepository.prototype.onChangedGeometries = function(name, currentGeometries) {
    if (isDefined(name) && isDefined(currentGeometries) && isDefined(this.windows_[name])) {        
        if (isDefinedAsFunction(this.onUnsavedGeometries_)) { this.onUnsavedGeometries_(name, currentGeometries); }
    } else {
        // unloading a window without a repository reference
        __log__.warn("WINDOW|Unknown window["+name+"] unsaved geometries["+currentGeometries+"]");
    }
};

WindowsRepository.prototype.onUnload = function(name, parameters) {    
    if (isDefined(this.windows_[name])) {
        // notifying closed window
        if (isDefinedAsFunction(this.windows_[name].onUnload_)) { this.windows_[name].onUnload_(parameters); }            
        
        // cleaning up the repository
        this.windows_[name] = undefined;
        delete this.windows_[name];
        
        if (isDefinedAsFunction(this.onUnloadCallback_)) { this.onUnloadCallback_(name); }
    } else {
        // unloading a window without a repository reference
        __log__.warn("WINDOW|Unknown window["+name+"] unloaded");
    }
};

WindowsRepository.prototype.changeName = function(oldName, newName) {
    if (isDefined(this.windows_[oldName]) && !isDefined(this.windows_[newName])) {
        var win = this.windows_[oldName];
        delete this.windows_[oldName];
        console.error(win, this.windows_[oldName]);
        this.windows_[newName] = win;
        this.windows_[newName].windowRef_.name = newName;
        console.error(this.windows_[newName]);
        return true;
    } else {
        return false;
    }
};

WindowsRepository.prototype.closeAll = function() {
    this.forEachWindow(function(windowRef, windowName){ windowRef.close(); });
};

WindowsRepository.prototype.minimizeAll = function() {
    this.forEachWindow(function(windowRef, windowName){ windowRef.__thisWindow__.showMinimized(); });
};

WindowsRepository.prototype.forEachWindow = function(callback) {
    if (!isDefinedAsFunction(callback)) { return; }
    for (var windowName in this.windows_) {
        try {
            callback(this.windows_[windowName].windowRef_, windowName);
        } catch (e) {
            __log__.error("WINDOW|Exception when processing forEachWindow on window["+windowName+"]: "+e.name+", "+e.message+", "+e.sourceURL+":"+e.line);
        }  
    }
};



