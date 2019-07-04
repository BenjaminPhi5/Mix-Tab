let load_audio_button = document.getElementById('load-current-tab');
let mute_all_button = document.getElementById('mute-all');
let options_button = document.getElementById('options');

//on click for the load_audio button
load_audio_button.onclick = function(element) {
    console.log("button pressed");

    // request the tab capture - maybe I need to do it in here...?
    chrome.runtime.sendMessage({
        action: 'popup-fetch-audio-stream-request',
    });
}

mute_all_button.onclick = function(element){
    // get all ids and mute them
    audios.forEach(function(value,key,map){
        muteSlider(key);
    });
}

options_button.onclick = function(element){
    // eventually will just load the options tab.. dunno how you do that yet
}
