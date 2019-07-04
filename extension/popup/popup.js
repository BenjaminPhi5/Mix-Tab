// get html element
var tablist;

let load_audio_button = document.getElementById('load-current-tab');
let mute_all_button = document.getElementById('mute-all');
let options_button = document.getElementById('options');

let slider_holder = document.getElementById('audioControlHolder');

let logbutton = document.getElementById('log');
let label1 = document.getElementById('testing-label');
var gainNode;
var audios = new Map();
var pageAudios = new Map();


// add onclick for it
load_audio_button.onclick = function(element) {
    console.log("button pressed");

    // request the tab capture - maybe I need to do it in here...?
    chrome.runtime.sendMessage({
        action: 'popup-fetch-audio-stream-request',
    });
}
/*
    Getting updates from UI
*/

// listen for requests to add or remove audio control groups from the popup,
// or to switch between gain, pan, and eq.
chrome.runtime.onMessage.addListener(function(request, sendResponse){
    // if a new audio control has been clicked on and added
    if(request.action === 'background-new-loaded-audio-control-delivery'){
        addExtraTab(request.key);
    }

    if(request.action === 'background-new-page-audio-control-delivery'){
        addExtraPageTab(request.key);
    }

    // if an audio control has been removed, its slider needs to dissapear
    if(request.action === 'background-loaded-tab-close-delivery'){
        removeExtraTab(request.key, slider_holder);
    }

    if(request.action === 'background-page-tab-close-delivery'){
        removeExtraTab(request.key, slider_holder);
    }

    if(request.action === 'page-param-delivery'){
        // update value in pageAudios
        console.log("request param deliv: ", request);
        pageAudios.get(request.key).gain = request.value;
        addExtraPageTab(request.key);

    }
});

// input is the message used for sliders that gradually change their value
window.addEventListener("input", function(event){
    // testing label if its a slider continually update a value
    let evvalue = event.target.value;
    label1.innerHTML = "slider value: " + evvalue;
    this.console.log("event.target: ", event.target);

    if(event.target.getAttribute('audiosource') === 'load'){
        label1.innerHTML = "slider value: " + evvalue + " :" + event.target.getAttribute("audiosource");
        
        index = parseInt(event.target.id);

        // check if it is gain or pan
        if(currentStatus === "gain"){
            // divide by 100, to get a maximum gain of 2, min of 0
            audios.get(index).gainNode.gain.value = parseInt(evvalue)/100;
        }
        else if(currentStatus === "pan"){
            // divide by 100 and -1, to get a min of -1 (all left) and max +1 (all right)
            audios.get(index).panNode.pan.value = (parseInt(evvalue)/100) -1;
        }
        
    }

    if(event.target.getAttribute('audiosource') === 'page'){
        pagetabid = parseInt(event.target.id);

        if(currentStatus === "gain"){
            gainvalue = parseInt(evvalue)/100;
            // send message to page context script
            chrome.tabs.sendMessage(pagetabid, {
                action: 'popup-param-modify',
                param: 'gainNode',
                value: gainvalue
            });
        }
        
        else if(currentStatus === "pan"){
            panvalue = parseInt(evvalue)/100 - 1;
            // send message to page context script
            chrome.tabs.sendMessage(pagetabid, {
                action: 'popup-param-modify',
                param: 'panNode',
                value: panvalue
            });
        }
        
    }
});

window.addEventListener("change", function(event){
    // on change now does nothing
});

/*
    On load, setup the UI
*/


// load already being tracked tabs into popup page
function loadCapturedTabs(){
    // get the tab array from the document script
    audios = chrome.extension.getBackgroundPage().audioControlList;
    pageAudios = chrome.extension.getBackgroundPage().pageAudioControlList;
    console.log("audios:", audios);
    console.log("page audios", pageAudios);

    // iterate through each element, and add a slider
    audios.forEach(function(value, key, map){
        // sanity check - if its valid
        // value is audios.get(key)
        if(value.valid){
            generateSliderGrid(key, value.gainNode.gain.value * 100, "load host", "ld cn", "load");
        } else {
            // popup is the only section to modify params, therefore it is safe for the popup to do deletion
            // of records it is not currently using.
            audios.delete(key);
        }
    });

    // iterate through each element, and add a slider, going to need to actually request values via a message
    pageAudios.forEach(function(value, key, map){
        console.log("audio iterate: ", value, key);
        if(value.valid){
            console.log("selected");
        chrome.tabs.sendMessage(key, {action: 'popup-param-request', param: 'gainNode'});
        } else {
            // popup is the only section to modify params, therefore it is safe for the popup to do deletion
            // of records it is not currently using.
            pageAudios.delete(key);
        }
    });
}

// load a new tab into the popup
function addExtraTab(key){
    // sanity check - if its valid
    if(audios.get(key).valid){
        generateSliderGrid(key, audios.get(key).gainNode.gain.value * 100, "load host", "ld cn", "load");
    } else {
        // popup is the only section to modify params, therefore it is safe for the popup to do deletion
        // of records it is not currently using.
        audios.delete(key);
    }
}

function addExtraPageTab(key){
    console.log("add tab: , key, audios: ", key, pageAudios);
    if(pageAudios.get(key).valid){
        generateSliderGrid(key, pageAudios.get(key).gain * 100, "page host", "pg cn", "page");
    } else {
        pageAudios.delete(key);
    }
}

// remove slider for deleted audio.. can a tab just close in the background... it doesnt seem so but ill add it anyway
function removeExtraTab(key, slidergroup){
    // remove child element from the div section, by the id of the child.
    slidergroup.removeChild(document.getElementById(String(key)));
}

window.addEventListener("load", function(){
    console.log("the popup was loaded on");

    // set current button status
    setupStatus();

    // loading elements testing
    loadCapturedTabs();
    //generateSliderGrid(1234567, 50, "host it", "content it", "load");
    //generateEqGrid(12345987, 50, 50, 50, "host it", "content it");

});



window.addEventListener("close", function(){
    chrome.storage.sync.set({'sliderValue': event.target.value});
});

// should instead out the audio_stream_fetch here if you want it, and then put a button for load
// netflix audio instead or something..? not quite sure okay.