/***
 * Author: Keith Trumble, 02172014
 * Description:
 *  Javascript generated menu with subnav items
 * Methods:
 *  popNav.init(btn,nav) //add toggle to dom and generate nav on page load
 *      btn = requires ID of parent for menu toggle placement
 *      nav = requires ID of parent for nav placement
 *  popNav.navCheck() //listens for hover state
 *  popNav.toggleControl() //this toggles the main nav, hides any subnav
 *  popNav.generateNav() //this generates the nav structure
 *  popNav.closeSubNav() //this hides any visible subnav menus
 *  popNav.placeSubNav(mainNavId) //this displays the relevant subnav menu
 ***/
var gID = function(el){ return document.getElementById(el); };
window.onload=function(){ popNav.init('lCol','mCol_content'); };
var popNav = {
    initState:false,
    toggleParent:null,
    navParent:null,
    mainNavHover:false,
    subNavHover:false,
    subNavTimeout:null,
    init:function(btn,nav){
        popNav.toggleParent = btn;
        popNav.navParent = nav;
        
        var btnDiv = document.createElement('div');
        btnDiv.id = 'navToggle';
        btnDiv.className = 'navToggle';
        btnDiv.innerHTML = 'Nav Toggle';
        gID(popNav.toggleParent).appendChild(btnDiv);
        
        popNav.generateNav();
        
        if(btnDiv.addEventListener)
            btnDiv.addEventListener('click',function(){ popNav.toggleControl(); });
        else
            btnDiv.attachEvent('onclick',function(){ popNav.toggleControl(); });
    },
    navCheck:function(){
        subNavTimeout = setTimeout(function(){
            if(!popNav.mainNavHover && !popNav.subNavHover) popNav.closeSubNav();
            else popNav.navCheck();
        },750);
    },
    generateNav:function(){
        //create main nav container
        var navDiv = document.createElement('div');
        navDiv.id = 'navDiv';
        navDiv.className = 'dn';
        gID(popNav.navParent).appendChild(navDiv);
        
        //create main nav items
        var mainNavWrapper = document.createElement('div');
        mainNavWrapper.id = 'mainNavWrapper';
        gID('navDiv').appendChild(mainNavWrapper);
        for(var m in navItems){
            var mainItem = document.createElement('div');
            mainItem.id = 'mainNav_'+m;
            mainItem.className = 'mainItem';
            mainItem.innerHTML = navItems[m].mainText;
            gID('mainNavWrapper').appendChild(mainItem);
            var btnClick  = gID('mainNav_'+m);
            if(btnClick.addEventListener){
                btnClick.addEventListener('mouseover',function(){
                    popNav.closeSubNav();
                    popNav.placeSubNav(this.id);
                    popNav.mainNavHover = true;
                },false);
                btnClick.addEventListener('mouseout',function(){
                    popNav.mainNavHover = false;
                    popNav.navCheck();
                },false);
            } else {
                btnClick.attachEvent('onmouseover',function(e){
                    var mainId = e.srcElement.id;
                    popNav.closeSubNav();
                    popNav.placeSubNav(mainId);
                    popNav.mainNavHover = true;
                });
                btnClick.attachEvent('onmouseout',function(){
                    popNav.mainNavHover = false;
                    popNav.navCheck();
                });
            }
        }
        
        //create subnav container and sets
        var mainSubNavWrapper = document.createElement('div');
        mainSubNavWrapper.id = 'mainSubNavWrapper';
        gID('navDiv').appendChild(mainSubNavWrapper);
        for(var q in navItems){
            var subNavWrapper = document.createElement('div');
            subNavWrapper.id = 'subNav_'+q;
            subNavWrapper.className = 'subNavWrapper dn';
            gID('mainSubNavWrapper').appendChild(subNavWrapper);
            for(var s in navItems[q].subNav){
                var subItem = document.createElement('div');
                subItem.id = 'subNav_'+q+'.'+s;
                subItem.className = 'subItem';
                subItem.innerHTML = navItems[q].subNav[s];
                gID('subNav_'+q).appendChild(subItem);
                
                if(subItem.addEventListener){
                    subItem.addEventListener('mouseover',function(){
                        popNav.subNavHover = true;
                    },false);
                    subItem.addEventListener('mouseout',function(){
                        popNav.subNavHover = false;
                    },false);
                } else {
                    subItem.attachEvent('onmouseover',function(e){
                        popNav.subNavHover = true;
                    });
                    subItem.attachEvent('onmouseout',function(e){
                        popNav.subNavHover = false;
                    });
                }
            }
        }
        popNav.initState = true;
    },
    toggleControl:function(){
        popNav.closeSubNav();
        if(gID('navDiv').className === 'shown'){
            gID('navDiv').style.display = 'none';
            gID('navDiv').className = 'hidden';
        } else {
            gID('navDiv').style.display = 'block';
            gID('navDiv').className = 'shown';
        }
    },
    closeSubNav:function(){
        var allElems = document.getElementsByTagName('div');
        for(var i in allElems) {
            if((' ' + allElems[i].className + ' ').indexOf(' subNavWrapper ') > -1) {
                gID(allElems[i].id).style.display = 'none';
                var theClasses = gID(allElems[i].id).className;
                if(theClasses.indexOf(' animateOut ') > -1) theClasses = theClasses.split(' animateOut')[0];
                gID(allElems[i].id).className = theClasses;
            }
        }
    },
    placeSubNav:function(mainNavID){
        var subNavId = mainNavID.split('_')[1];
        var theClasses = gID('subNav_'+subNavId).className;
        if(theClasses.indexOf(' animateOut ') === -1) gID('subNav_'+subNavId).className = theClasses+' animateOut';
        gID('subNav_'+subNavId).style.display = 'block';
        gID('subNav_'+subNavId).style.top = gID(mainNavID).offsetTop+'px';
    }
};
//here is the data and expected structure by which we'll build our nav
var navItems = [
    {
        mainText:'Main Nav 1',
        //url:'somelink.html', //TODO add page links to nav items
        subNav:{
            //0:{//TODO add page links to subnav items
            //    text:'Sub Nav 1.1',
            //    url:'somelink.html'
            //},
            0:'Sub Nav 1.1',
            1:'Sub Nav 1.2',
            2:'Sub Nav 1.3',
            3:'Sub Nav 1.4',
            4:'Sub Nav 1.5'
        }
    },
    {
        mainText:'Main Nav 2',
        subNav:{
            0:'Sub Nav 2.1',
            1:'Sub Nav 2.2',
            2:'Sub Nav 2.3',
            3:'Sub Nav 2.4',
            4:'Sub Nav 2.5'
        }
    },
    {
        mainText:'Main Nav 3',
        subNav:{
            0:'Sub Nav 3.1',
            1:'Sub Nav 3.2',
            2:'Sub Nav 3.3',
            3:'Sub Nav 3.4',
            4:'Sub Nav 3.5'
        }
    },
    {
        mainText:'Main Nav 4',
        subNav:{
            0:'Sub Nav 4.1',
            1:'Sub Nav 4.2',
            2:'Sub Nav 4.3',
            3:'Sub Nav 4.4',
            4:'Sub Nav 4.5'
        }
    },
    {
        mainText:'Main Nav 5',
        subNav:{
            0:'Sub Nav 5.1',
            1:'Sub Nav 5.2',
            2:'Sub Nav 5.3',
            3:'Sub Nav 5.4',
            4:'Sub Nav 5.5'
        }
    }
];


//add to utils "IE8 CONSOLE OBJECT PARSING"
/*
var out = '';
for(var g in e){
    if(g === 'srcElement'){
        for(var h in e.srcElement){
            out += h+': '+e.srcElement[h]+'\n';
        }
    }
}
console.log(out);
*/