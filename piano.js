// -*- coding: utf-8 -*-
// title JavaScript Piano
// since 2010-06-09
// author AKIYAMA Kouhei

// notenum = MIDI Note Number
// keycode = DOM Event Keycode

JSPiano = (function(){

    // Utilities

    function getLastScriptNode() {
        var n = document;
        while(n && n.nodeName.toLowerCase() != "script") { n = n.lastChild;}
        return n;
    };

    function addEventListener(elem, evname, func) {
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

    function setCookie(cookieName, data) {
        var value = "";
        for(var key in data){
            if(value){
                value += "&";
            }
            value += key + ":" + data[key];
        }

        var expires = new Date();
        expires.setFullYear(expires.getFullYear() + 1);
        document.cookie = cookieName + "=" + value + ";expires=" + expires.toGMTString();
    };

    function getCookie(cookieName) {
        var cookies = document.cookie;
        var pos = cookies.indexOf(cookieName + "=");
        if(pos == -1){
            return {};
        }
        var first = pos + cookieName.length + 1;
        var last = cookies.indexOf(";", first);
        if(last == -1){
            last = cookies.length;
        }
        var cookieValue = cookies.substring(first, last);
        var lines = cookieValue.split("&");
        var data = {};
        var i;
        for(i = 0; i < lines.length; ++i){
            var keyval = lines[i].split(":");
            data[keyval[0]] = keyval[1];
        }
        return data;
    };

    // Keyboard Constants

    var KEYCODE_NAME_MAP = {
        8:"BS", 9:"Tab", 13:"Ent",
        16:"Shi", 17:"Ctl", 18:"Alt", 19:"Pau",
        20:"Cap", 21:"Nfr",
        27:"Esc", 28:"Xfr",
        32:"Spa", 33:"PUp", 34:"PDo", 35:"End",
        36:"Hom", 37:"←", 38:"↑", 39:"→",
        40:"↓",
        45:"Ins", 46:"Del",
        48:"0", 49:"1", 50:"2", 51:"3",
        52:"4", 53:"5", 54:"6", 55:"7",
        56:"8", 57:"9",         59:":",
        65:"A", 66:"B", 67:"C",
        68:"D", 69:"E", 70:"F", 71:"G",
        72:"H", 73:"I", 74:"J", 75:"K",
        76:"L", 77:"M", 78:"N", 79:"O",
        80:"P", 81:"Q", 82:"R", 83:"S",
        84:"T", 85:"U", 86:"V", 87:"W",
        88:"X", 89:"Y", 90:"Z", 91:"LW",
        92:"RW", 93:"sel",
        96:"N0", 97:"N1", 98:"N2", 99:"N3",
        100:"N4", 101:"N5", 102:"N6", 103:"N7",
        104:"N8", 105:"N9", 106:"*", 107:"+",
        109:"-", 110:".", 111:"/",
        112:"f1", 113:"f2", 114:"f3", 115:"f4",
        116:"f5", 117:"f6", 118:"f7", 119:"f8",
        120:"f9", 121:"f10", 122:"f11", 123:"f12",
        144:"NuL", 145:"ScL",
        186:";", 187:"=",
        188:",", 190:".", 191:"/",
        192:"@",
        219:"[",
        220:"\\", 221:"]", 222:"^",
        226:"\\",
    };
    function convertKeycodeToKeytext(keycode) {
        return KEYCODE_NAME_MAP[keycode] || keycode.toString();
    };
    var DEFAULT_PIANO_KEY_MAP = {49:56,50:58,81:57,87:59,69:60,52:61,82:62,53:63,84:64,89:65,55:66,85:67,56:68,73:69,57:70,79:71,80:72,109:73,192:74,222:75,219:76,13:77,8:78,46:79,65:32,90:33,83:34,88:35,67:36,70:37,86:38,71:39,66:40,78:41,74:42,77:43,75:44,188:45,76:46,190:47,191:48,59:49,226:50,221:51};
    var DEFAULT_FUNCTION_KEY_MAP = {32:0,17:1};

    function convertKeyMapToStr(km, comma, colon){
        if(!comma) { comma = ",";}
        if(!colon) { colon = ":";}
        var str = "";
        var key;
        for(key in km){
            if(str.length != 0){
                str += comma;
            }
            str += key + colon + km[key];
        }
        return str;
    };
    
    
    // Piano Constants
    
    var KEY_WHITE = {width: 20, textColor: "#000000", color: "#ffffff", colorDown: "#ffc040", height: 100, keyTextSize: 14};
    var KEY_BLACK = {width: 16, textColor: "#ffffff", color: "#000000", colorDown: "#ff8800", height: 60, keyTextSize: 14};

    // class PianoKey

    function createPianoKeyDiv(isBlack, keyConst, left) {
        var keyDiv = document.createElement("div");
        keyDiv.style.borderWidth = "1px";
        keyDiv.style.borderColor = "#000000";
        keyDiv.style.borderStyle = "solid";
        keyDiv.style.color       = keyConst.textColor;
        keyDiv.style.backgroundColor = keyConst.color;
        keyDiv.style.width    = keyConst.width  + "px";
        keyDiv.style.height   = keyConst.height + "px";
        keyDiv.style.position = "absolute";
        keyDiv.style.left     = left + "px";
        keyDiv.style.top      = "0px";
        keyDiv.style.zIndex   = isBlack ? "2" : "1";
        return keyDiv;
    };

    function createPianoKeyText(text, keyConst) {
        var keyText = document.createElement("div");
        var fontSize = keyConst.keyTextSize;
        keyText.style.position = "absolute";
        keyText.style.top = (keyConst.height - fontSize*1.2) + "px";
        keyText.style.fontSize = fontSize + "px";
        keyText.appendChild(document.createTextNode(text));
        return keyText;
    };
    
    function createPianoKey(notenum, isBlack, left, audioSet, pianoKeyboard) {
        var keyConst = isBlack ? KEY_BLACK : KEY_WHITE;
        var keyDiv = createPianoKeyDiv(isBlack, keyConst, left);
        var keyText = null;
        
        var audio = audioSet.notes[notenum];

        function seekAudioBegin() {
            if(audio){
                try {audio.pause(); audio.currentTime=0;} catch(e) { audio.load();}
            }
        };
        
        var pressed = false;
        var pressedByMouse = false;
        function press() {
            if(!pressed){
                keyDiv.style.backgroundColor = keyConst.colorDown;
                seekAudioBegin();
                audio.play();
                pressed = true;
            }
        };
        function pressByMouse() {
            pressedByMouse = true;
            press();
        };
        function release() {
            keyDiv.style.backgroundColor = keyConst.color;
            pressed = false;
            pressedByMouse = false;
            if( ! pianoKeyboard.sustain){
                audio.pause();
            }
        };
        
        addEventListener(keyDiv, "mousedown", pressByMouse);
        addEventListener(keyDiv, "mouseup", release);
        addEventListener(keyDiv, "mouseout", release);

        var keyObj = {
            getElement: function() {
                return keyDiv;
            },
            isPressed: function() { return pressed; },
            isPressedByMouse: function() { return pressedByMouse; },
            press: press,
            release: release,
            stop: function() {
                audio.pause();
            },
            setKeyText: function(text){
                if(keyText){
                    keyDiv.removeChild(keyText);
                }
                keyText = createPianoKeyText(text, keyConst);
                keyDiv.appendChild(keyText);
            }
        };
        return keyObj;
    };

    // class FunctionKey

    function createFunctionKey(left, top, text, funcDown, funcUp, toggle) {
        var div = document.createElement("div");
        div.style.position = "absolute";
        div.style.left = left + "px";
        div.style.top = top + "px";
        var button = document.createElement("div");
        button.style.display = "inline-block";
        button.style.borderWidth = "1px";
        button.style.borderStyle = "solid";
        button.style.borderColor = "#000000";
        button.style.width = "24px";
        button.style.height = "20px";
        button.style.marginRight = "4px";
        div.appendChild(button);
        var text = document.createTextNode(text);
        div.appendChild(text);
        var buttonText = null;

        var pressedByMouse = false;
        var pressed = false;
        var selected = false;
        var pressByMouse = function() { pressedByMouse = true; press();};
        var press;
        var release;
        
        if(toggle){
            press = function(){
                if(!pressed){
                    pressed = true;
                }
            };
            release = function(){
                if(pressed){
                    pressed = false;
                    pressedByMouse = false;
                    selected = !selected;
                    if(selected){
                        if(funcDown){funcDown();}
                    }
                    else{
                        if(funcUp){funcUp();}
                    }
                    button.style.backgroundColor = selected ? "#ff0000" : "#ffffff";
                }
            };
        }
        else{
            press = function(){
                if(!pressed){
                    pressed = true;
                    if(funcDown){funcDown();}
                    button.style.backgroundColor = "#ff0000";
                }
            };
            release = function(){
                if(pressed){
                    pressed = false;
                    pressedByMouse = false;
                    if(funcUp){funcUp();}
                    button.style.backgroundColor = "#ffffff";
                }
            };
        }
        addEventListener(button, "mousedown", pressByMouse);
        addEventListener(button, "mouseup", release);
        addEventListener(button, "mouseout", release);
        return {
            getElement: function() { return div;},
            isPressed: function() { return pressed;},
            isPressedByMouse: function() { return pressedByMouse;},
            isSelected: function() { return selected;},
            press: press,
            release: release,
            setKeyText: function(text) {
                if(buttonText){
                    button.removeChild(buttonText);
                }
                buttonText = document.createTextNode(text);
                button.appendChild(buttonText);
            }
        };
    };


    // class KeyMap

    function createKeyMap() {
        var keyMap = {}; // keycode to key object.

        return {
            setMapKeycodeToKeyObject: function(keycode, keyObj) {
                if(keyObj){
                    
                    for(var w in keyMap){
                        if(keyMap[w] == keyObj){
                            delete keyMap[w];
                        }
                    }
                    
                    if(keyMap[keycode]){
                        keyMap[keycode].setKeyText("");
                    }
                    
                    keyMap[keycode] = keyObj;
                    keyObj.setKeyText(convertKeycodeToKeytext(keycode));
                    return true;
                }
                return false;
            },

            clearKeyMap: function () {
                for(var keycode in keyMap){
                    if(keyMap[keycode]){
                        keyMap[keycode].setKeyText("");
                    }
                    delete keyMap[keycode];
                }
            },

            onKeyDown: function(ev) {
                var keycode = ev.which.toString();
                var keyObj = keyMap[keycode];
                if(keyObj){
                    keyObj.press();
                    ev.preventDefault();
                }
            },
        
            onKeyUp: function(ev){
                var keycode = ev.which.toString();
                var keyObj = keyMap[keycode];
                if(keyObj){
                    keyObj.release();
                    ev.preventDefault();
                }
            },

            enumerateKeyIndex: function(keys) { //(keys:Array)->Object
                var result = {};
                for(var key in keyMap){
                    var index = keys.indexOf(keyMap[key]);
                    if(index >= 0){
                        result[key] = index;
                    }
                }
                return result;
            }
        };
    };
    
    // class PianoKeyboard

    function PianoKeyboard(audioSet){
        this.keyMap = createKeyMap();
        this.sustain = false;
        this.keyboardDiv = this.createPianoKeyboardDiv();
        this.pianoKeys = this.placePianoKeys(audioSet, this.keyboardDiv);
        this.functionKeys =
            this.placeSustainKeys().concat(
            this.placeConfigKeys());
        this.allKeys = this.pianoKeys.concat(this.functionKeys);
        if(!this.loadKeyMap()){
            this.initKeyMap();
        }
        this.setWindowKeyEventListener();
    };
    PianoKeyboard.prototype = {
        createPianoKeyboardDiv: function() {
            var keyboardDiv = document.createElement("div");
            keyboardDiv.className = "keyboard";
            keyboardDiv.style.borderWidth = "1px";
            keyboardDiv.style.borderColor = "#000000";
            keyboardDiv.style.borderStyle = "solid";
            keyboardDiv.style.position = "relative";
            keyboardDiv.style.left = "0px";
            keyboardDiv.style.top = "0px";
            keyboardDiv.style.height = "200px";
            return keyboardDiv;
        },

        placePianoKeys: function (audioSet, keyboardDiv) {
            var keyObjArray = [];
        
            var pos = 0;
            for(var notenum = audioSet.notenumMin; notenum <= audioSet.notenumMax; ++notenum, ++pos){
                var o = Math.floor((notenum-12) / 12);
                var s = (notenum-12) - o*12;
                
                var isBlack = !(s & 1) == (s >= 5);

                var left = pos * KEY_WHITE.width/2;
                if(isBlack){
                    left += (KEY_WHITE.width-KEY_BLACK.width)/2;
                    left += (s==1 || s==6) ? -3 : (s==3 || s==10) ? 3 : 0;
                }

                if(s == 11 || s == 4){
                    ++pos;
                }
                
                var keyObj = createPianoKey(notenum, isBlack, left, audioSet, this);
                keyObjArray[notenum] = keyObj;
                this.keyboardDiv.appendChild(keyObj.getElement());

                if(s == 0){
                    var posTextDiv = document.createElement("div");
                    posTextDiv.style.position = "absolute";
                    posTextDiv.style.left = left + "px";
                    posTextDiv.style.fontSize = KEY_WHITE.width + "px";
                    posTextDiv.style.top = KEY_WHITE.height + "px";
                    posTextDiv.appendChild(document.createTextNode("C" + o));
                    this.keyboardDiv.appendChild(posTextDiv);
                }
            }

            var right = left + (isBlack ? KEY_BLACK.width : KEY_WHITE.width);
            keyboardDiv.style.width = right + 2 + "px";
            
            return keyObjArray;
        },

        placeSustainKeys: function(){
            var self = this;
            
            function stopReleasedNotes() {
                for(notenum = 0; notenum < self.pianoKeys.length; ++notenum){
                    var keyObj = self.pianoKeys[notenum];
                    if(keyObj){
                        if( ! keyObj.isPressed()){
                            keyObj.stop();
                        }
                    }
                }
            };
            function setSustainState(b) {
                if(self.sustain != b){
                    self.sustain = b;
                    if(!b){
                        stopReleasedNotes();
                    }
                }
            };
            function updateSustainState(){
                setSustainState(buttonSustain.isPressed() || buttonSustainLock.isSelected());
            };
            
            var buttonSustain = createFunctionKey(0, 140, "Sustain", updateSustainState, updateSustainState);
            var buttonSustainLock = createFunctionKey(120, 140, "Sustain Lock", updateSustainState, updateSustainState, true);
            this.keyboardDiv.appendChild(buttonSustain.getElement());
            this.keyboardDiv.appendChild(buttonSustainLock.getElement());
        
            return [buttonSustain, buttonSustainLock];
        },

        placeConfigKeys: function(){
            var self = this;
            var buttonInitKeyMap = createFunctionKey(240, 140, "Init Keymap", null, function() { self.initKeyMap();});
            this.keyboardDiv.appendChild(buttonInitKeyMap.getElement());

            var buttonShowKeyMap = createFunctionKey(360, 140, "Show Keymap", null, function() { self.showKeyMap();});
            this.keyboardDiv.appendChild(buttonShowKeyMap.getElement());
            
            var buttonSaveKeyMap = createFunctionKey(480, 140, "Save Keymap to cookie", null, function() { self.saveKeyMap();});
            this.keyboardDiv.appendChild(buttonSaveKeyMap.getElement());
            
            return [buttonInitKeyMap, buttonShowKeyMap, buttonSaveKeyMap];
        },

        initKeyMap: function() {
            this.restoreKeyMap(DEFAULT_PIANO_KEY_MAP, DEFAULT_FUNCTION_KEY_MAP);
        },

        showKeyMap: function() {
            var km1 = this.keyMap.enumerateKeyIndex(this.pianoKeys);
            var km2 = this.keyMap.enumerateKeyIndex(this.functionKeys);

            alert("DEFAULT_PIANO_KEY_MAP = {" + convertKeyMapToStr(km1) + "};\n" +
                  "DEFAULT_FUNCTION_KEY_MAP = {" + convertKeyMapToStr(km2) + "};");
        },

        saveKeyMap: function() {
            var km1 = this.keyMap.enumerateKeyIndex(this.pianoKeys);
            var km2 = this.keyMap.enumerateKeyIndex(this.functionKeys);
            setCookie("config", {
                "PIANO_KEY_MAP": convertKeyMapToStr(km1, "_", "_"),
                "FUNCTION_KEY_MAP": convertKeyMapToStr(km2, "_", "_")
            });
        },

        loadKeyMap: function() {
            var config = getCookie("config");
            var pkms = config["PIANO_KEY_MAP"];
            var fkms = config["FUNCTION_KEY_MAP"];
            if(!pkms || !fkms){
                return false;
            }

            pkms = pkms.split("_");
            fkms = fkms.split("_");
            var pkm = {};
            var fkm = {};
            for(i = 0; i < pkms.length/2; ++i){
                pkm[parseInt(pkms[i*2])] = parseInt(pkms[i*2+1]);
            }
            for(i = 0; i < fkms.length/2; ++i){
                fkm[parseInt(fkms[i*2])] = parseInt(fkms[i*2+1]);
            }
            
            this.restoreKeyMap(pkm, fkm);
            
            return true;
        },

        restoreKeyMap: function(pianoKeyMap, functionKeyMap) {
            this.keyMap.clearKeyMap();
            var keyObj;
            for(var keycode in pianoKeyMap){
                var notenum = pianoKeyMap[keycode];
                keyObj = this.pianoKeys[notenum];
                if(keyObj){
                    this.keyMap.setMapKeycodeToKeyObject(keycode, keyObj);
                }
            }
            for(var keycode in functionKeyMap){
                var index = functionKeyMap[keycode];
                keyObj = this.functionKeys[index];
                if(keyObj){
                    this.keyMap.setMapKeycodeToKeyObject(keycode, keyObj);
                }
            }
        },

        findFirstPressedKeyByMouse: function() {
            for(var i = 0; i < this.allKeys.length; ++i){
                var keyObj = this.allKeys[i];
                if(keyObj && keyObj.isPressedByMouse()){
                    return keyObj;
                }
            }
            return undefined;
        },

        setWindowKeyEventListener: function() {
            var self = this;
            window.addEventListener("keydown", function(ev){
                // customize a mapping of keycode to key object.
                var keycode = ev.which.toString();
                self.keyMap.setMapKeycodeToKeyObject(keycode, self.findFirstPressedKeyByMouse());
                
                // play.
                self.keyMap.onKeyDown(ev);
            }, true);
        
            window.addEventListener("keyup", function(ev){
                self.keyMap.onKeyUp(ev);
            }, true);
        },

        getElement: function() {
            return this.keyboardDiv;
        }
    };
    function createPianoKeyboard(audioSet) {
        return new PianoKeyboard(audioSet);
    };

    // class Audio

    function getSupportedMediaType() {
        try{
            var audio = new Audio("");
            var result;
            if(audio.canPlayType){
                result = audio.canPlayType("audio/mpeg");
                if(result != "no" && result != ""){
                    return "mp3";
                }
                result = audio.canPlayType("audio/ogg");
                if(result != "no" && result != ""){
                    return "ogg";
                }
                result = audio.canPlayType("audio/wav");
                if(result != "no" && result != ""){
                    return "wav";
                }
                result = audio.canPlayType("audio/x-wav");
                if(result != "no" && result != ""){
                    return "wav";
                }
            }
        }
        catch(e){}
        return undefined;
    };

    function createAudio(notenum, mediaType, funcLoaded) {
        var audio = new Audio("./sounds/piano/44khz_" + mediaType + "/" + ("00" + notenum).slice(-3) + "." + mediaType);
        function onCanPlayThrough() {
            audio.removeEventListener("canplaythrough", onCanPlayThrough, true);
            funcLoaded();
        };
        function onError() {
            audio.removeEventListener("error", onError, true);
            funcLoaded();
        };
        audio.addEventListener("canplaythrough", onCanPlayThrough, true);
        audio.addEventListener("error", onError, true);
        audio.load();
        return audio;
    };

    // class AudioSet
    
    function createAudioSet(funcProgress, funcCompleted) {
        var audioSet = {
            notenumMin: 21,
            notenumMax: 108,
            notes: [],
            countTotal: 0,
            countLoaded: 0
        };
        var mediaType = getSupportedMediaType();
        if(!mediaType){
            alert("html5 audio not supported.");
            return audioSet;
        }
        
        function onAudioLoaded() {
            if(++audioSet.countLoaded == audioSet.countTotal){
                funcCompleted();
            }
            else{
                funcProgress(audioSet);
            }
        };
        
        audioSet.countTotal = audioSet.notenumMax - audioSet.notenumMin + 1;
        for(var notenum = audioSet.notenumMin; notenum <= audioSet.notenumMax; ++notenum){
            audioSet.notes[notenum] = createAudio(notenum, mediaType, onAudioLoaded);
        }
        return audioSet;
    };

    // class Piano
    
    function createPianoDiv() {
        var div = document.createElement("div");
        return div;
    };
    
    function createPiano() {
        var pianoDiv = createPianoDiv();
        
        var loadingText = document.createTextNode("Loading...");
        pianoDiv.appendChild(loadingText);

        var funcProgress = function(as){
            pianoDiv.removeChild(loadingText);
            loadingText = document.createTextNode("Loading... (" + as.countLoaded + "/" + as.countTotal + ")");
            pianoDiv.appendChild(loadingText);
        };
        var funcCompleted = function(){
            pianoDiv.removeChild(loadingText);
            pianoDiv.appendChild(createPianoKeyboard(audioSet).getElement());
        };
        
        var audioSet = createAudioSet(funcProgress, funcCompleted);

        var pianoObj = {
            getElement: function() { return pianoDiv;},
            audioSet: audioSet,
        };
        return pianoObj;
    };
    
    // public functions

    return {
        insertKeyboardAfterThisScriptNode: function() {
            var parent = getLastScriptNode().parentNode;
            parent.appendChild(createPiano().getElement());
        }
    };
})();
