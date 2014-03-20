$(document).ready(function(){
//$('#page-content-title').before('<div id="fullbleed"></div>');
	$('<div id="fullbleed" />').insertBefore($('#page-content-title'));
	var $prodDiv = '<div id="prodMain" />';
	var $prodDiv1 = '<div id="prodDiv1" class="prodDivProduct" />';
	var $prodDiv2 = '<div id="prodDiv2" class="prodDivProduct" />';
	var $prodDiv3 = '<div id="prodDiv3" class="prodDivProduct" />';
	var $prodDiv4 = '<div id="prodDiv4" class="prodDivProduct" />';
	var $prodDiv5 = '<div id="prodDiv5" class="prodDivProduct" />';
	var $prodDiv6 = '<div id="prodDiv6" class="prodDivProduct" />';
	$('#fullbleed').append($prodDiv);
	$('#prodMain').append($prodDiv1);
	$('#prodMain').append($prodDiv2);
	$('#prodMain').append($prodDiv3);
	$('#prodMain').append($prodDiv4);
	$('#prodMain').append($prodDiv5);
	$('#prodMain').append($prodDiv6);
});