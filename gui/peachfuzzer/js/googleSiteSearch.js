$(document).ready(function(){

	//bind click on search nav icon
    $('#siteSearch').bind('click',function(e){
        if(!$('#searchBox').is(":visible")){
            $('#searchBox').show();
            $('#siteSearch').addClass('active');
            $('#siteSearch').css('background-color','#ff6300');
        } else {
        	$('#searchBox').hide();
            $('#siteSearch').removeClass('active');
            $('#siteSearch').css('background-color','transparent');
        }
    });
    //bind enter key for search
	$(document).keypress(function(e) {
	    if(e.which == 13) {
	    	if($("#searchInput").is(":focus")) $('#searchButton').click();
	    }
	});
	//bind click on 'go' button
	$('#searchButton').bind('click',function(e){
		googleSearch();
		$('#siteSearch').click();
	});
	//set what happens to default input field text
	var searchInputText = "What do you want to find?";
	$('#searchInput').focus(function(e){
		if($('#searchInput').val() === searchInputText) $('#searchInput').val('');
	});
	$('#searchInput').blur(function(e){
		if($('#searchInput').val() === '') $('#searchInput').val(searchInputText);
	});

	var config = {
		siteURL		: 'PeachFuzzer.com',	// Change this to your site
		searchSite	: true,
		type		: 'web',
		append		: false,
		perPage		: 8,			// A maximum of 8 is allowed by Google
		page		: 0				// The start page
	}
	
	function googleSearch(settings){
		
		// If no parameters are supplied to the function,
		// it takes its defaults from the config object above:
		settings = $.extend({},config,settings);
		settings.term = settings.term || $('#searchInput').val();
		
		if(settings.searchSite){
			// Using the Google site:example.com to limit the search to a
			// specific domain:
			settings.term = 'site:'+settings.siteURL+' '+settings.term;
		}
		
		// URL of Google's AJAX search API
		var apiURL = 'http://ajax.googleapis.com/ajax/services/search/'+settings.type+'?v=1.0&callback=?';
		var resultsDiv = $('#resultsDiv');
		
		$.getJSON(apiURL,{q:settings.term,rsz:settings.perPage,start:settings.page},function(r){
			//let's reset some stuff
			$('#resultsDiv').html('');
			$('#pag_content').empty();
			
			var results = r.responseData.results;
			
			if(results.length){
				// If results were returned, add them to a pageContainer div,
				// after which append them to the #resultsDiv:
				
				var pageContainer = $('<div>',{className:'pageContainer'});
				
				for(var i=0;i<results.length;i++){
					// Creating a new result object and firing its toString method:
					pageContainer.append(new result(results[i]) + '');
				}
				
				if(!settings.append){
					// This is executed when running a new search, 
					// instead of clicking on the More button:
					resultsDiv.empty();
				}
				
				pageContainer.append('<div class="clear"></div>')
							 .hide().appendTo(resultsDiv)
							 .fadeIn('slow');
				
				var cursor = r.responseData.cursor;

				var numResults = parseInt(cursor.estimatedResultCount,10);
				//populate search page header
				$('#numResults').text(numResults);
				$('#resultTime').text(cursor.searchResultTime);

				//setup pagination
				var numLIs = Math.floor(numResults/8);
				var modulo = numResults % 8;
				if(modulo>0)numLIs++;
				//now: we should only show one row of results pagination, let's work out how many that is
				var numBtns = 20; // 20 is an approximation
				if(numLIs == 21) numBtns = 21;
				else if(numLIs > 21 && cursor.currentPageIndex > 0){
					numBtns = 19;
				}
				var resultsSetWidth = null;
				for(var nR=0;nR<numLIs;nR++){
					if(nR >= settings.page){
						var pageNum = parseInt(nR+1);
						var activeClass = (nR == settings.page)?'activePage':'';
						$('#pag_content').append('<div id="page_'+pageNum+'" class="pageBtn '+activeClass+'"><div>'+pageNum+'</div></div>')
						//bind page button
						$('#page_'+pageNum).bind('click',function(){
							$('.activePage').removeClass('activePage');
							$(this).addClass('activePage');
							googleSearch({append:true,page:parseInt($(this).attr('id').split('_')[1]-1)});
						});
					}
				}
				if(!settings.append){
					if(numLIs < 21){ //move element into #pag_content, floating left
						var $nextDiv = $('#nextDiv');
						$('#nextDiv').remove();
						$('#pag_content').append($nextDiv);
						$('#nextDiv').css('float','left');
						$('#nextPag').css({
							'margin-right':'0px',
							'margin-top':'-1px'
						});
					}
					//bind next button
					$('#nextPag').bind('click',function(e){
						console.log('do something next');
					});
					resultsSetWidth = $('#resultsSet').width();
				}

				//show results
				$('#resultsSet').show();
				console.log(settings);
				
			} else {
				
				// No results were found for this search.
				
				resultsDiv.empty();
				$('<p>',{className:'notFound',html:'No Results Were Found!'}).hide().appendTo(resultsDiv).fadeIn();
			}
		});
	}
	
	function result(r){
		
		// This is class definition. Object of this class are created for
		// each result. The markup is generated by the .toString() method.
		
		var arr = [];
		
		// GsearchResultClass is passed by the google API
		switch(r.GsearchResultClass){

			case 'GwebSearch':
				arr = [
					'<div class="webResult">',
					'<h2><a href="',r.unescapedUrl,'" target="_self">',r.title,'</a></h2>',
					'<a href="',r.unescapedUrl,'" target="_self">',r.visibleUrl,'</a>',
					'<p>',r.content,'</p>',
					'</div>'
				];
			break;
			case 'GimageSearch':
				arr = [
					'<div class="imageResult">',
					'<a target="_blank" href="',r.unescapedUrl,'" title="',r.titleNoFormatting,'" class="pic" style="width:',r.tbWidth,'px;height:',r.tbHeight,'px;">',
					'<img src="',r.tbUrl,'" width="',r.tbWidth,'" height="',r.tbHeight,'" /></a>',
					'<div class="clear"></div>','<a href="',r.originalContextUrl,'" target="_blank">',r.visibleUrl,'</a>',
					'</div>'
				];
			break;
			case 'GvideoSearch':
				arr = [
					'<div class="imageResult">',
					'<a target="_blank" href="',r.url,'" title="',r.titleNoFormatting,'" class="pic" style="width:150px;height:auto;">',
					'<img src="',r.tbUrl,'" width="100%" /></a>',
					'<div class="clear"></div>','<a href="',r.originalContextUrl,'" target="_blank">',r.publisher,'</a>',
					'</div>'
				];
			break;
			case 'GnewsSearch':
				arr = [
					'<div class="webResult">',
					'<h2><a href="',r.unescapedUrl,'" target="_blank">',r.title,'</a></h2>',
					'<p>',r.content,'</p>',
					'<a href="',r.unescapedUrl,'" target="_blank">',r.publisher,'</a>',
					'</div>'
				];
			break;
		}
		
		// The toString method.
		this.toString = function(){
			return arr.join('');
		}
	}
	
	
});
