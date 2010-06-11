// -*- coding: utf-8 -*-
// title JavaScript Piano
// since 2010-06-09
// author AKIYAMA Kouhei

var JSPiano = {};

(function(){

    // DOM Utilities

    var getLastScriptNode = function() {
        var n = document;
        while(n && n.nodeName.toLowerCase() != "script") { n = n.lastChild;}
        return n;
    };

    var addEventListener = function(elem, evname, func) {
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
    };

    // Piano Constants
    
    var KEY_WHITE = {width: 20, color: "#ffffff", colorDown: "#ffc040", height: 100};
    var KEY_BLACK = {width: 16, color: "#000000", colorDown: "#ff8800", height: 60};

    // class PianoKey
    
    var createPianoKey = function(o, s, isBlack, keyConst, left) {
        var keyDiv = document.createElement("div");
        keyDiv.style.borderWidth = "1px";
        keyDiv.style.borderColor = "#000000";
        keyDiv.style.borderStyle = "solid";
        keyDiv.style.backgroundColor = keyConst.color;
        keyDiv.style.width    = keyConst.width + "px";
        keyDiv.style.height   = keyConst.height + "px";
        keyDiv.style.position = "absolute";
        keyDiv.style.left     = left + "px";
        keyDiv.style.top      = "0px";
        keyDiv.style.zIndex   = isBlack ? "2" : "1";

        var notenum = 24 + (o*12+s);
        var mediaType = "wav";
        var audio = new Audio("./sounds/piano/44khz_" + mediaType + "/" + ("00" + notenum).slice(-3) + "." + mediaType);

        var onKeyDown = function() {
            keyDiv.style.backgroundColor = keyConst.colorDown;
            audio.load();
            audio.play();
        };

        var onKeyUp = function() {
            keyDiv.style.backgroundColor = keyConst.color;
        };

        addEventListener(keyDiv, "mousedown", onKeyDown);
        addEventListener(keyDiv, "mouseup", onKeyUp);
        addEventListener(keyDiv, "mouseout", onKeyUp);

        var keyObj = {
            stop: function() {
                try {audio.pause(); audio.currentTime=0;} catch(e) { audio.load();}
            },
            getElement: function() {
                return keyDiv;
            }
        };
        return keyObj;
    };
    
    // class PianoKeyboard
    
    var createPianoKeyboard = function() {
        var keyboardDiv = document.createElement("div");
        keyboardDiv.className = "keyboard";
        keyboardDiv.style.borderWidth = "1px";
        keyboardDiv.style.borderColor = "#000000";
        keyboardDiv.style.borderStyle = "solid";
        keyboardDiv.style.position = "relative";
        keyboardDiv.style.left = "0px";
        keyboardDiv.style.top = "0px";
        keyboardDiv.style.height = KEY_WHITE.height + "px";

        var pos = 0;
        for(var n = 21; n <= 108; ++n, ++pos){
            var o = Math.floor((n-24) / 12);
            var s = (n-24) - o*12;
            
            var isBlack = !(s & 1) == (s >= 5);
            var keyConst = isBlack ? KEY_BLACK : KEY_WHITE;

            if(s == 0 || s == 5){
                ++pos;
            }
            
            var left = pos * KEY_WHITE.width/2;
            if(isBlack){
                left += (KEY_WHITE.width-KEY_BLACK.width)/2;
                left += (s==1 || s==6) ? -3 : (s==3 || s==10) ? 3 : 0;
            }
        
            var keyObj = createPianoKey(o, s, isBlack, keyConst, left);
            keyboardDiv.appendChild(keyObj.getElement());

            if(s == 0){
                var posTextDiv = document.createElement("div");
                posTextDiv.style.position = "absolute";
                posTextDiv.style.left = left + "px";
                posTextDiv.style.fontSize = KEY_WHITE.width + "px";
                posTextDiv.style.top = KEY_WHITE.height + "px";
                posTextDiv.appendChild(document.createTextNode("C" + o));
                keyboardDiv.appendChild(posTextDiv);
            }
        }

        var keyboardObj = {
            getElement: function() {
                return keyboardDiv;
            }
        };
        return keyboardObj;
    };

    // public functions
    
    JSPiano.insertKeyboardAfterThisScriptNode = function() {
        var parent = getLastScriptNode().parentNode;
        parent.appendChild(createPianoKeyboard().getElement());
    };
})();
