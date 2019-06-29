// get html element
let mute_test = document.getElementById('mute_test');
var gain_slider = document.getElementById('gainslider');
let second_slider = document.getElementById('secondslider');
let third_slider = document.getElementById('thirdslider');
let label1 = document.getElementById('label1');
let date = new Date();
var gainNode;

// IF I CAN EVER WORK OUT HOW TO GET THIS BACKGROUND PORT THING TO WORK
// THE IDEA IS THAT YOU ONLY SAVE THE STATE WHEN THE POPUP ACTUALLY CLOSES, AND I THINK THIS THING ACHIEVES THIS
var backgroundPort = chrome.runtime.connect({name:"port-from-popup"});
// message via port from background....
backgroundPort.onMessage.addListener(function(message){});


// add onclick for it
mute_test.onclick = function(element) {
    console.log("button pressed");

    // request the tab capture - maybe I need to do it in here...?
    /*
    chrome.runtime.sendMessage({
        action: 'fetch_audio_stream',
        slider_value: gain_slider.style.value
    });
    */
}

/*
    Getting updates from UI
*/
window.addEventListener("change", function(event){

    // if its a slider, set its value to the slider value
    
    if(event.target.parentElement.className === "slider"){
        chrome.storage.sync.set({'sliderValue': event.target.value});
        label1.innerHTML = "slider value: " + event.target.value;
    }
    

    // however, we only want to store the value when popup is closed, but do!!
    // want to update audio values upon a slider change.
    /*
    chrome.runtime.sendMessage({
        action: 'update-gain',
        slider_value: gain_slider.value
    });
    */
    
});

// TODOOOOOOOOOOO
/*
make it so that when it loads the page, ot gets access to that objects list

then for each time the popup is loaded, it also does the fetch audio stream thing

need to handle for errors so that if the audio stream thing fails, it does nothing - doesn't try

to add something to the list 

then get rid of the button checking

then need to make it so that it only checks for the update if the tab isn't already currently registered - 
store the tab in a currently stored list or something

then on load need to insert a load of new sliders for each thing that needs to be checked.

then the slider needs to update the gain for that thing okay.
does that make sense...?
good good good.

MUST USE chrome.extension.getBackgroundPage().gainNode; this kind of thing to get stuff from the background tab
*/



// input is the message used for sliders that gradually change their value
window.addEventListener("input", function(event){
    // if its a slider continually update a value
    let evvalue = event.target.value;
    if(event.target.parentElement.className === "slider"){
        label1.innerHTML = "slider value: " + evvalue;

        // now update the audio gain in the two different ways with the two different sliders.
       gainNode.gain.value = parseInt(evvalue)/100;
    }
});

/*
    On load, setup the UI
*/
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
    // TODO need to replace with fetch the list, hopefully then can just access any nodes in it quite easily.
    console.log("background page: ", chrome.extension.getBackgroundPage().gainNode);
    gainNode = chrome.extension.getBackgroundPage().gainNode;
    console.log("background page2 :", chrome.extension.getBackgroundPage().gainNode);
    

});

window.addEventListener("close", function(){
    chrome.storage.sync.set({'sliderValue': event.target.value});
});

// should instead out the audio_stream_fetch here if you want it, and then put a button for load
// netflix audio instead or something..? not quite sure okay.