//Application DeviceWebServices Interface
//Talk to Leap Frog services for things like network config, etc on set top box
JAMBO_APP.DeviceWebServices = (function() {
    //PRIVATE
    var api = {
        "start_ringing": "{}",
        "missed_call": "{}",
        "start_call": "{}",
        "call_disconnect": "{}",
        "missed_call_alert": "{}",
        "missed_call_dismiss": "{}",
        "mail_notice": '{"on":true}',
        "privacy_notice": '{"on":true}',
        "mute_notice": '{"on":true}',
        "get_network_connections": '{}',
        "set_network_metric": '{"netID":"networkid1", "metric":2}',
        "get_wifi_networks": '{}',
        "set_wifi_access": '{"SSID ":"mySSID", "passPhrase":"myPassphrase"}',
        "set_preferred_wifi_network": '{"SSID ":"mySSID"}',
        "get_network_info": '{}',
        "set_ip_address": '{"netID ":"networkid1", "ip":"192.168.0.1"}',
        "set_network_speed": '{"netID":"networkid1", "speed":100}',
        "set_dns_server": '{"netID":"networkid1", "dns":"192.168.0.1"}',
        "set_subnet_mask": '{"netID":"networkid1", "subnetmask":"255.255.255.0"}',
        "set_default_gateway": '{"netID":"networkid1", "gateway":"192.168.0.1"}',
        "get_current_language": '{}',
        "get_languages": '{}',
        "set_current_language": '{"language ":"us-US"}',
        "get_time_zones": "{}",
        "get_current_time_zone": "{}",
        "set_current_time_zone": '{"TimeZoneID ":"GTG Standard Time"}',
        "get_cameras": '{}',
        "set_camera": '{"camID":"1"}',
        "get_screen_resolution": '{"displayID":1}',
        "set_screen_resolution": '{"displayID":2, "width":1440,"height":900}',
        "get_display_devices": '{}',
        "set_display": '{"displayID ":2}',
        "get_device_info": '{}',
        "update_software": '{}',
        "set_restart": '{"seconds":2,"shutdown":false}',
        "log_event": '{"message":"request failed"}'
    };
    
    var serverUrl = "http://localhost:8082/";
    
    var defaultSuccessCallback = function(responseData){
        console.log( "DeviceWebService: "+JSON.stringify(responseData) );
        //TEMP
        $('#devServiceOutput').text( "DeviceWebService: "+JSON.stringify(responseData) );
    };
    var defaultErrorCallback = function(responseData, errorThrown){
        console.log( "DeviceWebService: "+responseData.responseText+" "+errorThrown );
        //TEMP
        $('#devServiceOutput').text( "DeviceWebService: "+responseData.responseText+" "+errorThrown );
    };
    
    //PUBLIC
    return {
        //Sets local (private) connection property once for the app based on environment.
        setConnection: function(env){
            serverUrl = env;
        },
        runAPI: function(method, params, successCallback, errorCallback) {
            var doMethod = method || null;
            if(doMethod == null || doMethod == ""){
                return;
            } else {
                var theParams = params || api[doMethod];
                console.log("DeviceWebService: Calling the method "+serverUrl+doMethod+" with params: "+theParams);
                
                $.ajax({
                    url: serverUrl + doMethod,
                    data: theParams,
                    type: "POST",
                    processData: false,
                    crossDomain: true,
                    contentType: "application/json",
                    timeout: 10000,
                    dataType: 'json',

                    success: function(responseData, textStatus, jqXHR){
                        if(typeof successCallback == 'function')
                            successCallback(responseData);
                        else
                            defaultSuccessCallback(responseData);
                    },
                    error:function (responseData, textStatus, errorThrown){
                        if(typeof errorCallback == 'function')
                            errorCallback(responseData, errorThrown);
                        else
                            defaultErrorCallback(responseData, errorThrown);
                    }

                });
            }
        }
        
    }
})();