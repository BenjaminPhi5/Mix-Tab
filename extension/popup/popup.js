// get html element
let mute_test = document.getElementById('mute_test');
let gain_slider = document.getElementById('gainslider');
let label1 = document.getElementById('label1');
let date = new Date();
<<<<<<< HEAD
<<<<<<< HEAD
var gainNodes = [];
var audioContexts = [];
var tabs = [];
=======
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider
=======
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider

// IF I CAN EVER WORK OUT HOW TO GET THIS BACKGROUND PORT THING TO WORK
// THE IDEA IS THAT YOU ONLY SAVE THE STATE WHEN THE POPUP ACTUALLY CLOSES, AND I THINK THIS THING ACHIEVES THIS
var backgroundPort = chrome.runtime.connect({name:"port-from-popup"});
// message via port from background....
backgroundPort.onMessage.addListener(function(message){});


// add onclick for it
mute_test.onclick = function(element) {
    console.log("button pressed");
    chrome.runtime.sendMessage({
        action: 'fetch_audio_stream',
    });
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
    
});

// TODOOOOOOOOOOO
/*
make it so that when it loads the page, ot gets access to that objects list

then for each time the popup is loaded, it also does the fetch audio stream thing - BUT ONLY if that tab is not currently
being tracked, so it needs to get the list of tabs first, and see if it is not there you know - easiest to do that in document.

then it needs to dynamically add sliders!!!! to the popup depending on the number of audio contexts being tracked,
including the current. 

need to handle for errors so that if the audio stream thing fails, it does nothing - doesn't try

to add something to the list 

then get rid of the button checking

then need to make it so that it only checks for the update if the tab isn't already currently registered - 
store the tab in a currently stored list or something

then on load need to insert a load of new sliders for each thing that needs to be checked.

then the slider needs to update the gain for that thing okay.
does that make sense...?
good good good.

add an event listener for each slider instead

TEST OUT THAT WINDOW EVENT CLOSE THING SEE WHAT HAPPENS

MUST USE chrome.extension.getBackgroundPage().gainNode; this kind of thing to get stuff from the background tab
but actually due to callbacks I didn't need to do that
*/



// input is the message used for sliders that gradually change their value
window.addEventListener("input", function(event){
    // if its a slider continually update a value
    let evvalue = event.target.value;
    if(event.target.parentElement.className === "slider"){
        label1.innerHTML = "slider value: " + evvalue;

<<<<<<< HEAD
<<<<<<< HEAD
        // now update the audio gain for the relevant tab
        gainNodes[parseInt(event.target.id)].gain.value = parseInt(evvalue)/100;
=======
=======
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider

        // now update the audio gain in the two different ways with the two different sliders.
        // version 1, by sending a message:
        chrome.runtime.sendMessage({
            action: 'gain-update',
            // need to deal with is this a string not a number...?
            value: evvalue
        });


        // version 2 - where we already have the audio thing
<<<<<<< HEAD
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider
=======
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider
    }
});

/*
    On load, setup the UI
*/
var sendResp = function(evt){
    // get parameters
    audioContexts = chrome.extension.getBackgroundPage().audioContextsList;
    gainNodes = chrome.extension.getBackgroundPage().gainNodesList;
    tabs = chrome.extension.getBackgroundPage().tabsList;
    console.log("audiocontexts, gainnodes, tabs", audioContexts, gainNodes, tabs);

    // inject extra sliders
    for(i = 0; i < gainNodes.length; i++){
        let slider = document.createElement('input');
        
        slider.id = toString(i);
        slider.type = "range";
        slider.min = "0";
        slider.max = "100";
        slider.value = "100";
    }
    
}


window.addEventListener("load", function(){
    console.log("the popup was loaded on");
    // set the slider value to the value in storage

    // get the slider value- just for keeping that slider up to date
    chrome.storage.sync.get('sliderValue', function(data){
        console.log("setting value to: ", data.sliderValue);
        gain_slider.value = data.sliderValue;
    });

<<<<<<< HEAD
<<<<<<< HEAD
    // now fetch the gain node from the background...
    // so yes, everything is going to be handled from the popup script now oh yes I know, its terrible.
    // TODO need to replace with fetch the list, hopefully then can just access any nodes in it quite easily.
    //console.log("background page: ", chrome.extension.getBackgroundPage().gainNode);
    //gainNode = chrome.extension.getBackgroundPage().gainNode;
    //console.log("background page2 :", chrome.extension.getBackgroundPage().gainNode);

=======
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider
=======
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider
});

// now to ask for the audio info
chrome.runtime.sendMessage({
    action: 'fetch_audio_stream',
}, sendResp);


/// dammnit need to test if this works as well
window.addEventListener("close", function(event){
    //chrome.storage.sync.set({'sliderValue': gain_slider.value});
});

// should instead out the audio_stream_fetch here if you want it, and then put a button for load
// netflix audio instead or something..? not quite sure okay.