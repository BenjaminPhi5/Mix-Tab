// get html element
let mute_test = document.getElementById('mute_test');
let gain_slider = document.getElementById('gainslider');
let label1 = document.getElementById('label1');
let date = new Date();

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

    // if its a slider, set its value to the slider value
    if(event.target.parentElement.className === "slider"){
        chrome.storage.sync.set({'sliderValue': event.target.value});
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

});

// should instead out the audio_stream_fetch here if you want it, and then put a button for load
// netflix audio instead or something..? not quite sure okay.