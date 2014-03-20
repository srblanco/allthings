/************************************************ 
*  jQuery iphoneSwitch plugin                   *
*                                               *
*  Author: Daniel LaBare                        *
*  Date:   2/4/2008                             *
************************************************/

jQuery.fn.iphoneSwitch = function(start_state, switched_on_callback, switched_off_callback, options) {

	var state = start_state == 'on' ? start_state : 'off';
	
	// define default settings
	var settings = {
		mouse_over: 'pointer',
		mouse_out:  'default',
		switch_on_container_path: 'img/iphone_switch_container_on.png',
		switch_off_container_path: 'img/iphone_switch_container_off.png',
		switch_path: 'img/iphone_switch.png',
                switch_path_es: 'img/iphone_switch_es.png',
		switch_height: 24,
		switch_width: 84
	};

	if(options) {
		jQuery.extend(settings, options);
	}

	// create the switch
	return this.each(function() {

		var container;
		var image;
		
		// make the container
		container = jQuery('<div class="iphone_switch_container" style="height:'+settings.switch_height+'px; width:'+settings.switch_width+'px; position: relative; overflow: hidden"></div>');
		
		// make the switch image based on starting state
                //WKRASKO 110212 - PNG-659, includes new image above
                var tempSwitchPath = settings.switch_path;
                if(isDefined(applicationSettings) && applicationSettings.language=="es_ES")
                    tempSwitchPath = settings.switch_path_es;
		image = jQuery('<img class="iphone_switch" style="height:'+settings.switch_height+'px; width:'+settings.switch_width+'px; background-image:url('+tempSwitchPath+'); background-repeat:none; background-position:'+(state == 'on' ? 0 : -47)+'px" src="'+(state == 'on' ? settings.switch_on_container_path : settings.switch_off_container_path)+'" /></div>');

		// insert into placeholder
		jQuery(this).html(jQuery(container).html(jQuery(image)));

		jQuery(this).mouseover(function(){
			jQuery(this).find('.iphone_switch').css("cursor", settings.mouse_over);
		});

		jQuery(this).mouseout(function(){
			jQuery(this).find('.iphone_switch').css("cursor", settings.mouse_out);
		});

		// click handling
		jQuery(this).unbind('click').click(function() {
			if(state == 'on') {
				jQuery(this).find('.iphone_switch').animate({backgroundPosition: -47}, "slow", function() {
					jQuery(this).attr('src', settings.switch_off_container_path);
					switched_off_callback();
				});
				state = 'off';
			}
			else {
				jQuery(this).find('.iphone_switch').animate({backgroundPosition: 0}, "slow", function() {
					switched_on_callback();
				});
				jQuery(this).find('.iphone_switch').attr('src', settings.switch_on_container_path);
				state = 'on';
			}
		});		

	});
	
};

jQuery.fn.isChildOf = function(b){ 
    return (this.parents(b).length > 0); 
};

//Override jquery ui.autocomplete match function so that we can use html in label, but not search on it
$.ui.autocomplete.filter = function(array, term) {
    var matcher = new RegExp( $.ui.autocomplete.escapeRegex(term), "i" );

    return $.grep(array,function(value){return matcher.test($('<div />', { html: value.label }).text()||value.value||value)});
};

//WKRASKO 111212 - PNG-698, defining new selector to determine if item is focuesd
jQuery.expr[':'].focus = function(elem) {
  return elem === document.activeElement && (elem.type || elem.href);
};