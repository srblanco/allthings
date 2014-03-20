/** JavaScript Document
*    Author: Keith Trumble, 02/05/2014
*    Description:
*        Knocked together an app to manage my music collection,
*        mostly to demonstrate ability, and not waste the time 
*        on a demo that does nothing.
*    Methods:
*        coming soon
**/
var returnData = [];
var artistData = [];
var albumData = [];
var foundData = false;

//Album Info Management Functions
var AlbumEntity = function(){
    this.outputData = function(){
        resetAlbumEntity();
        var albumHTML = '<div><span class="albumTitle">'+this.title+'</span> by <span class="albumArtist">'+this.artist+'</span> (<span>'+this.media+' '+this.type+'</span>)';
        albumHTML += '<p>Tracks:</p><div><div class="trackList">';
        for(var i in this.tracks){
            albumHTML += '<div id="track_'+(parseInt(i)+1)+'" class="trackItem"><span>'+(parseInt(i)+1)+'. </span>'+this.tracks[i]+'</div>';
        }
        albumHTML += '</div></div></div>';
        var $albumDiv = $('<div/>',
            {
                id:'',
                'class':'',
                html:albumHTML
            }
        );
        $('#albumDisplay').append($albumDiv).show();
    };
    console.log(albumData.length);
};
resetAlbumEntity = function(){
    $('#albumTitle').html('');
    $('#albumArtist').html('');
    $('#albumFormat').html('');
    $('#albumTracks').html('');
    $('#albumDisplay').hide();
};
var Album = function(title,type,tracks,media,artist){
    this.title = title;
    this.type = type;
    this.tracks = tracks;
    this.media = media;
    this.artist = artist;
};
Album.prototype = new AlbumEntity();
function makeAlbum(title,type,tracks,media,artist){
    var albumEntity = new Album(title,type,tracks,media,artist);
    albumEntity.outputData();
}
//Artist and Band Info Management Functions
var MusicalEntity = function(){
    this.isBand = false;
    this.outputData = function(){
        this.resetMusicalEntity();
        $('#artistName').html(this.name);
        if(this.isBand){
            var members = '';
            for(var m in this.members){
                if(m != 0) members += ', ';
                members += this.members[m];
            }
            $('#members').text(members);
            $('#bandMembers').show();
        }
        $('#artistDisplay').show();
    };
    this.resetMusicalEntity = function(){
        $('#members').text('');
        $('#bandMembers').hide();
        $('#artistDisplay').hide();
    };
};
var Solo = function(name) {
    this.name = name;
    this.isBand = false;
};
Solo.prototype = new MusicalEntity();
var Band = function(name,members){
    this.name = name;
    this.isBand = true;
    this.members = members;
};
Band.prototype = new MusicalEntity();
var makeSolo = function(name){
    var soloEntity = new Solo(name);
    soloEntity.outputData();
};
var makeBand = function(name,members){
    var bandEntity = new Band(name,members);
    bandEntity.outputData();
};
/* Data structure for albumData: */
albumData = [
{
    'title':'Chicken Shins',
    'artist':'Velvet Bean',
    'tracks':
        [
            'Why cross the road?',
            'Why cross the road? (remix)'
        ]
},
{
    'title':'Pillowtalk',
    'artist':'PANTyRAiD',
    'tracks':
        [
            'That\'s the Spot',
            'Realism is for Girls',
            'Jokes from the Back Seat',
            'Stay Up Tonight',
            'Waiting for Wednesday',
            'No Self Control',
            'Keeping Secrets',
            'Sixteen &amp; Free',
            'Just for You',
            'Room Service',
            'Brooklyn Angel',
            'Driving Back Home'
        ]
}];
artistData = [
{
    'name':'Depeche Mode',
    'members':
        [
            'Dave Gahan',
            'Martin L. Gore',
            'Andy Fletcher'
        ]
},
{
    'name':'Martin L. Gore',
    'members':null
},
{
    'name':'Rolling Stones',
    'members':
        [
            'Mick Jagger',
            'Keith Richards',
            'Ronny Wood',
            'Charlie Watts',
            'Brian Jones',
            'Mick Taylor',
            'Bill Wyman'
        ]
}];

//Search stuff
//check artistData and albumData
lookupInfo = function(str){
    var foundAlbum = false;
    for(var g in albumData){
        if(str === albumData[g].title){//TODO: need partial string searches
            foundAlbum = true;
            foundData = true;
        }
    }
    var foundArtist = false;
    for(var h in artistData){
        if(str === artistData[h].name){//TODO: need partial string searches
            foundArtist = true;
            foundData = true;
        }
    }
    var results = {'album':foundAlbum, 'artist':foundArtist};
    return results;
};

$(document).ready(function(){
    //listeners
    $('#lookupBtn').click(function(){
        $('#begin').hide();
        var str = $('#str').val();
        var lookupResults = lookupInfo(str);
        console.log(lookupResults);
        var pageMsg = $('#messaging');
        var msg = (foundData)?'<span>'+str+'</span> found.':'<span>'+str+'</span> not found.';
        pageMsg.html(msg).show();
        //now, display albums and artists found
        if(lookupResults.album) console.log('found an album');
        if(lookupResults.artist) console.log('found an artist');
    });
    
    console.log('Syntax:');
    console.log("makeSolo('Martin L. Gore');");
    console.log("makeBand('Depeche Mode',['Dave','Martin','Andy']);");
    console.log("makeAlbum('Chicken Shins','Single',['Why cross the road?','Why cross the road? (remix)'],'CD','Velvet Bean');");
    //test early output functions
    makeSolo('Martin L. Gore');
    makeBand('Depeche Mode',['Dave','Martin','Andy']);
    makeAlbum('Chicken Shins','Single',['Why cross the road?','Why cross the road? (remix)'],'CD','Velvet Bean');
});