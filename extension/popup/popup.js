// get html element
let testdiv = document.getElementById('testdiv');
let testslider = document.getElementById('testslider');
var tablist;

let mute_test = document.getElementById('mute_test');
var gain_slider = document.getElementById('gainslider');
let second_slider = document.getElementById('secondslider');
let third_slider = document.getElementById('thirdslider');
let label1 = document.getElementById('label1');
let date = new Date();
var gainNode;
var audios = [];

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
    if(request.action === 'new-audio-control'){
        addExtraTab(request.key);
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
        
        index = event.target.id;

        this.console.log("change gain in list: ", audios);
        this.console.log("current index:", index);
        this.console.log(testslider);
        audios[index].node.gain.value = parseInt(evvalue)/100;
    }
});



/*
    On load, setup the UI
*/

// create a slider and add it in to the popup
function mkSlider(id, value){
    //template: <input id="gainslider" type="range" min="1" max="100" value="50"></input>
    let slider = document.createElement('input');
    slider.id = id;
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = String(value);
    testslider.appendChild(slider);
}


// load already being tracked tabs into popup page
function loadCapturedTabs(){
    // get the tab array from the document script
    audios = chrome.extension.getBackgroundPage().audioControlList;
    console.log("audios:", audios);
    console.log("html tags:", testslider);

    var i = 0;
    for(var key in audios){
        mkSlider(key, audios[key].node.gain.value * 100);
    }

}

// load a new tab into the popup
function addExtraTab(key){
    // can also try passing in the audio node
    index = audios.length - 1;
    mkSlider(key, audios[key].node.gain.value * 100);
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