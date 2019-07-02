// get html element
let testdiv = document.getElementById('testdiv');
let testslider = document.getElementById('testslider');
let testslider2 = document.getElementById('testslider2');
var tablist;

let mute_test = document.getElementById('load-current-tab');
let logbutton = document.getElementById('log');
var gain_slider = document.getElementById('gainslider');
let second_slider = document.getElementById('secondslider');
let third_slider = document.getElementById('thirdslider');
let label1 = document.getElementById('label1');
let date = new Date();
var gainNode;
var audios = new Map();
var pageAudios = new Map();

// IF I CAN EVER WORK OUT HOW TO GET THIS BACKGROUND PORT THING TO WORK
// THE IDEA IS THAT YOU ONLY SAVE THE STATE WHEN THE POPUP ACTUALLY CLOSES, AND I THINK THIS THING ACHIEVES THIS
var backgroundPort = chrome.runtime.connect({name:"port-from-popup"});
// message via port from background....
backgroundPort.onMessage.addListener(function(message){});


// add onclick for it
mute_test.onclick = function(element) {
    console.log("button pressed");

    // request the tab capture - maybe I need to do it in here...?
    chrome.runtime.sendMessage({
        action: 'fetch_audio_stream',
        slider_value: gain_slider.style.value
    });
}

// LOG ON CLICK
logbutton.onclick = function(element) {
    console.log("LOG: ", audios);
}

/*
    Getting updates from UI
*/
window.addEventListener("change", function(event){
    console.log("audio object: ", audios);
    // if its a slider, set its value to the slider value
    
    if(event.target.parentElement.className === "slider"){
        chrome.storage.sync.set({'sliderValue': event.target.value});
        label1.innerHTML = "slider value: " + event.target.value;
    }
    
});

chrome.runtime.onMessage.addListener(function(request, sendResponse){
    // if a new audio control has been clicked on and added
    if(request.action === 'new-audio-control'){
        addExtraTab(request.key);
    }

    if(request.action === 'new-page-audio-control'){
        addExtraPageTab(request.key);
    }

    // if an audio control has been removed, its slider needs to dissapear
    if(request.action === 'tab-close'){
        removeExtraTab(request.key, testslider);
    }

    if(request.action === 'page-tab-close'){
        removeExtraTab(request.key, testslider2);
    }

    if(request.action === 'page-param-send'){
        // update value in pageAudios
        pageAudios.get(request.key).gain = request.value;
        addExtraPageTab(request.key);

    }
});

// input is the message used for sliders that gradually change their value
window.addEventListener("input", function(event){
    // if its a slider continually update a value
    let evvalue = event.target.value;
    if(event.target.parentElement.className === "slider"){
        label1.innerHTML = "slider value: " + evvalue;
    }
    if(event.target.parentElement.className === 'testslider'){

        // load from gain node list
        label1.innerHTML = "slider value: " + evvalue;
        
        index = parseInt(event.target.id);

        this.console.log("change gain in list: ", audios);
        this.console.log("current index:", index);
        this.console.log(testslider);
        audios.get(index).node.gain.value = parseInt(evvalue)/100;
    }

    if(event.target.parentElement.className === 'testslider2'){
        // load from gain node list
        label1.innerHTML = "slider value: " + evvalue;
        pagetabid = parseInt(event.target.id);
        gainvalue = parseInt(evvalue)/100;

        // send message to page context script
        chrome.tabs.sendMessage(pagetabid, {
            action: 'page-param-modify',
            tabid: pagetabid,
            param: 'gain',
            gain: gainvalue
        });
    }
});



/*
    On load, setup the UI
*/

// create a slider and add it in to the popup
function mkSlider(id, value, slidergroup){
    //template: <input id="gainslider" type="range" min="1" max="100" value="50"></input>
    let slider = document.createElement('input');
    slider.id = String(id);
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = String(value);
    slidergroup.appendChild(slider);
}


// load already being tracked tabs into popup page
function loadCapturedTabs(){
    // get the tab array from the document script
    audios = chrome.extension.getBackgroundPage().audioControlList;
    pageAudios = chrome.extension.getBackgroundPage().pageAudioControlList;
    console.log("audios:", audios);
    console.log("html tags:", testslider);

    // iterate through each element, and add a slider
    audios.forEach(function(value, key, map){
        // sanity check - if its valid
        // value is audios.get(key)
        if(value.valid){
            mkSlider(key, value.node.gain.value * 100, testslider);
        } else {
            // popup is the only section to modify params, therefore it is safe for the popup to do deletion
            // of records it is not currently using.
            audios.delete(key);
        }
    });

    // iterate through each element, and add a slider, going to need to actually request values via a message
    pageAudios.forEach(function(value, key, map){
        if(value.valid){
        chrome.tabs.sendMessage(key, {action: 'page-param-request', param: 'gain'});
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
        mkSlider(key, audios.get(key).node.gain.value * 100, testslider);
    } else {
        // popup is the only section to modify params, therefore it is safe for the popup to do deletion
        // of records it is not currently using.
        audios.delete(key);
    }
}

function addExtraPageTab(key){
    if(pageAudios.get(key).valid){
        mkSlider(key, pageAudios.get(key).gain * 100, testslider2);
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
    // set the slider value to the value in storage

    // get the slider value
    chrome.storage.sync.get('sliderValue', function(data){
        console.log("setting value to: ", data.sliderValue);
        gain_slider.value = data.sliderValue;
    });

    // now fetch the gain node from the background...
    // so yes, everything is going to be handled from the popup script now oh yes I know, its terrible.
    gainNode = chrome.extension.getBackgroundPage().gainNode;
    console.log("background page :", chrome.extension.getBackgroundPage().gainNode);
    
    // loading elements testing
    loadCapturedTabs();

});

window.addEventListener("close", function(){
    chrome.storage.sync.set({'sliderValue': event.target.value});
});

// should instead out the audio_stream_fetch here if you want it, and then put a button for load
// netflix audio instead or something..? not quite sure okay.