// -*- coding: utf-8 -*-
// title JavaScript Piano
// since 2010-06-09
// author AKIYAMA Kouhei

// notenum = MIDI Note Number
// keycode = DOM Event Keycode

// todo:
// - 設定のクッキーへの保存
// - キー割り当てのalert表示(初期割り当てを改善するため)
// - キー割り当て初期化ボタンを追加

var JSPiano = {};

(function(){

    // DOM Utilities

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
    var DEFAULT_PIANO_KEY_MAP = {
        84:60,
        54:61,
        89:62,
        55:63,
        85:64,
        73:65,
        57:66,
        79:67,
        48:68,
        80:69,
        109:70,
        192:71,
        219:72,
        220:73,
        13:74,
        8:75,
        46:76
    };
    var DEFAULT_FUNCTION_KEY_MAP = {
        32: 0,
        17: 1,
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
    
    function createPianoKey(notenum, isBlack, left, keyboardState, audioSet) {
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
            if( ! keyboardState.sustain){
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
    
    
    // class PianoKeyboard

    function createPianoKeyboardDiv() {
        var keyboardDiv = document.createElement("div");
        keyboardDiv.className = "keyboard";
        keyboardDiv.style.borderWidth = "1px";
        keyboardDiv.style.borderColor = "#000000";
        keyboardDiv.style.borderStyle = "solid";
        keyboardDiv.style.position = "relative";
        keyboardDiv.style.left = "0px";
        keyboardDiv.style.top = "0px";
        keyboardDiv.style.height = KEY_WHITE.height + "px";
        return keyboardDiv;
    };

    function placePianoKeys(keyboardDiv, keyboardState, audioSet) {
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
            
            var keyObj = createPianoKey(notenum, isBlack, left, keyboardState, audioSet);
            keyObjArray[notenum] = keyObj;
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
        return keyObjArray;
    };

    function placeFunctionKeys(keyboardDiv, keyboardState, pianoKeys){
        function stopReleasedNotes() {
            for(notenum = 0; notenum < pianoKeys.length; ++notenum){
                var keyObj = pianoKeys[notenum];
                if(keyObj){
                    if( ! keyObj.isPressed()){
                        keyObj.stop();
                    }
                }
            }
        };
        function setSustainState(b) {
            if(keyboardState.sustain != b){
                keyboardState.sustain = b;
                if(!b){
                    stopReleasedNotes();
                }
            }
        };
        function updateSustainState(){
            setSustainState(buttonSustain.isPressed() || buttonSustainLock.isSelected());
        };
        
        var buttonSustain = createFunctionKey(0, 140, "Sustain", updateSustainState, updateSustainState);
        var buttonSustainLock = createFunctionKey(150, 140, "Sustain Lock", updateSustainState, updateSustainState, true);
        keyboardDiv.appendChild(buttonSustain.getElement());
        keyboardDiv.appendChild(buttonSustainLock.getElement());
        
        return [buttonSustain, buttonSustainLock];
    };

    
    function createPianoKeyboard(audioSet) {
        var keyboardState = {
            sustain: false
        };
        var keyboardDiv = createPianoKeyboardDiv();
        var pianoKeys = placePianoKeys(keyboardDiv, keyboardState, audioSet);
        var functionKeys = placeFunctionKeys(keyboardDiv, keyboardState, pianoKeys);
        var allKeys = pianoKeys.concat(functionKeys);

        // key input
        
        var keyMap = {}; // keycode to key object.

        function setMapKeycodeToKeyObject(keycode, keyObj) {
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
        };

        function clearKeyMap() {
            for(var keycode in keyMap){
                if(keyMap[keycode]){
                    keyMap[keycode].setKeyText("");
                }
                delete keyMap[keycode];
            }
        };

        function restoreKeyMap(pianoKeyMap, functionKeyMap) {
            clearKeyMap();
            var keyObj;
            for(var keycode in pianoKeyMap){
                var notenum = pianoKeyMap[keycode];
                keyObj = pianoKeys[notenum];
                if(keyObj){
                    setMapKeycodeToKeyObject(keycode, keyObj);
                }
            }
            for(var keycode in functionKeyMap){
                var index = functionKeyMap[keycode];
                keyObj = functionKeys[index];
                if(keyObj){
                    setMapKeycodeToKeyObject(keycode, keyObj);
                }
            }
        };
        restoreKeyMap(DEFAULT_PIANO_KEY_MAP, DEFAULT_FUNCTION_KEY_MAP);

        function findFirstPressedKeyByMouse() {
            for(var i = 0; i < allKeys.length; ++i){
                var keyObj = allKeys[i];
                if(keyObj && keyObj.isPressedByMouse()){
                    return keyObj;
                }
            }
            return undefined;
        };

        window.addEventListener("keydown", function(ev){
            var keycode = ev.which.toString();

            // customize a mapping of keycode to key object.
            setMapKeycodeToKeyObject(keycode, findFirstPressedKeyByMouse());

            // play.
            var keyObj = keyMap[keycode];
            if(keyObj){
                keyObj.press();
            }
        }, true);
        
        window.addEventListener("keyup", function(ev){
            var keycode = ev.which.toString();

            // stop.
            var keyObj = keyMap[keycode];
            if(keyObj){
                keyObj.release();
            }
        }, true);

        var keyboardObj = {
            getElement: function() {
                return keyboardDiv;
            }
        };
        return keyboardObj;
    };

    //
    function getSupportedMediaType() {
        try{
            var audio = new Audio("");
            var result;
            if(audio.canPlayType){
                result = audio.canPlayType("audio/ogg");
                if(result != "no" && result != ""){
                    return "ogg";
                }
                result = audio.canPlayType("audio/mpeg");
                if(result != "no" && result != ""){
                    return "mp3";
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
    
    JSPiano.insertKeyboardAfterThisScriptNode = function() {
        var parent = getLastScriptNode().parentNode;
        parent.appendChild(createPiano().getElement());
    };
})();
