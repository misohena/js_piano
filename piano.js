// -*- coding: utf-8 -*-
// title JavaScript Piano
// since 2010-06-09
// author AKIYAMA Kouhei


var JSPiano = {

    // DOM Utilities

    getLastScriptNode: function()
    {
        var n = document;
        while(n && n.nodeName.toLowerCase() != "script") { n = n.lastChild;}
        return n;
    },

    addEventListener: function(elem, evname, func)
    {
        if(!elem){return;}
        if(elem.addEventListener){ //for DOM
            elem.addEventListener(evname, func, false);
        }
        else if(elem.attachEvent){ //for IE
            switch(evname){
            case "click": evname = "onclick"; break;
            case "blur": evname = "onblur"; break;
            case "mousedown": evname = "onmousedown"; break;
            case "mouseup": evname = "onmouseup"; break;
            case "mouseover": evname = "onmouseenter"; break;
            case "mouseout": evname = "onmouseleave"; break;
            default: evname = "on" + evname; break;
            }
            if(evname != ""){
                elem.attachEvent(evname, func);
            }
        }
    },


    KEY_WHITE: {width: 20, color: "#ffffff", colorDown: "#ffc040", height: 100},
    KEY_BLACK: {width: 16, color: "#000000", colorDown: "#ff8800", height: 60},

    createKeyboard: function()
    {
        var keyboardDiv = document.createElement("div");
        keyboardDiv.className = "keyboard";
        keyboardDiv.style.borderWidth = "1px";
        keyboardDiv.style.borderColor = "#000000";
        keyboardDiv.style.borderStyle = "solid";
        keyboardDiv.style.position = "relative";
        keyboardDiv.style.left = "0px";
        keyboardDiv.style.top = "0px";
        keyboardDiv.style.height = JSPiano.KEY_WHITE.height + "px";

        var pos = 0;
        for(var n = 21; n <= 108; ++n, ++pos){
            var o = Math.floor((n-24) / 12);
            var s = (n-24) - o*12;
            
            var isBlack = !(s & 1) == (s >= 5);
            var keyConst = isBlack ? JSPiano.KEY_BLACK : JSPiano.KEY_WHITE;

            if(s == 0 || s == 5){
                ++pos;
            }
            
            var left = pos * JSPiano.KEY_WHITE.width/2;
            if(isBlack){
                left += (JSPiano.KEY_WHITE.width-JSPiano.KEY_BLACK.width)/2;
                left += (s==1 || s==6) ? -3 : (s==3 || s==10) ? 3 : 0;
            }
        
            var keyObj = new JSPiano.Key(o, s, isBlack, keyConst, left);
            keyboardDiv.appendChild(keyObj.keyDiv);

            if(s == 0){
                var posTextDiv = document.createElement("div");
                posTextDiv.style.position = "absolute";
                posTextDiv.style.left = left + "px";
                posTextDiv.style.fontSize = JSPiano.KEY_WHITE.width + "px";
                posTextDiv.style.top = JSPiano.KEY_WHITE.height + "px";
                posTextDiv.appendChild(document.createTextNode("C" + o));
                keyboardDiv.appendChild(posTextDiv);
            }
        }
        
        return keyboardDiv;
    },
    
    placePiano: function()
    {
        var parent = JSPiano.getLastScriptNode().parentNode;
        parent.appendChild(JSPiano.createKeyboard());
    }

};

JSPiano.Key = function(o, s, isBlack, keyConst, left)
{
    var keyDiv = document.createElement("div");
    keyDiv.style.borderWidth = "1px";
    keyDiv.style.borderColor = "#000000";
    keyDiv.style.borderStyle = "solid";
    keyDiv.style.backgroundColor = keyConst.color;
    keyDiv.style.width = keyConst.width + "px";
    keyDiv.style.height = keyConst.height + "px";
    keyDiv.style.position = "absolute";
    keyDiv.style.left = left + "px";
    keyDiv.style.top = "0px";
    keyDiv.style.zIndex = isBlack ? "2" : "1";
    this.keyDiv = keyDiv;
    this.keyConst = keyConst;

    this.initEventListeners();

    var notenum = 24 + (o*12+s);
    var mediaType = "wav";
    var audio = new Audio("./sounds/piano/44khz_" + mediaType + "/" + ("00" + notenum).slice(-3) + "." + mediaType);
    this.audio = audio;
}
JSPiano.Key.prototype = {
    initEventListeners: function()
    {
        var self = this;
        JSPiano.addEventListener(this.keyDiv, "mousedown", function(){ self.onKeyDown();})
        //JSPiano.addEventListener(this.keyDiv, "mouseover", function(){ self.onKeyDown();});
        JSPiano.addEventListener(this.keyDiv, "mouseup", function(){ self.onKeyUp();});
        JSPiano.addEventListener(this.keyDiv, "mouseout", function(){ self.onKeyUp();});
    },

    onKeyDown: function()
    {
        this.keyDiv.style.backgroundColor = this.keyConst.colorDown;
//        this.audio.pause();
        this.audio.load();
        this.audio.play();
    },
    onKeyUp: function()
    {
        this.keyDiv.style.backgroundColor = this.keyConst.color;
        //this.audio.pause();
    }
};
