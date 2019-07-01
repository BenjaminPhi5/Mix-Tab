// page script to be injected
// at the moment it is injected into every single page upon the page being loaded.
// it does nothing so far.
var audioContext = false;
var targets = [];

// collect audio targets - returns a list of targets
function getAudioTargets(){
    // get all videos and audios from the html, and collect them into a targets array.
    var videos = document.getElementsByTagName('video');
    var audios = document.getElementsByTagName('audio');

    var collect = function(collection) {
        collection.forEach(element => {
            targets.push(element);
        });
    }

    collect(videos);
    collect(audios);
}

// the init function - collect the targets, if there are some create an audio context. if not, then don't this seems simple
// also look in the tab info to see if it could at any point play audio maybe
function init(){
    // get targets
    getAudioTargets();

    if(targets.length > 0){
        audioContext = new AudioContext();
    }

    // check it exists
    if(!audioContext){
        // for now just return, means targets to attach to, or creating the audiocontext failed.
        return;
    }

    // attach the controller audio params
    attachAll();


    // then am giong to have to communicate these changes to the document page.
}

// attach the tab html5 audio to our audio context
function attachAll(){
    if(!audioContext){
        // something went wrong
        return;
    }

    targets.forEach(function(target, index){
        // attach the target to the audioContext okay. okay noice I like it very much good
        attachTarget(target, index);
    });

}

function attachTarget(target, index){
    // attach this specific target to the audioContext.
    // for now will just attach a gain filter. noice.

    // check if it is already attached, (may be duplicate targets)
    // if so do nothing

    // then check if the source exists, if it doesn't, then do something else

    // deal with cross origin.

    // then nicely all setup. good.
}


document.addEventListener("DOMContentLoaded", function onLoad(){
    // log each time a new tab is loaded
    console.log("new tab has loaded - should be for every single tab");

    console.log("window", window);

    // outputs the current tab in the background console.
    chrome.runtime.sendMessage({
        action: 'get-current-tab'}
    );

    // may have to do this in background or something... hmmm we shall seeee.
    
    

    // Media streams seems can be created from three separate sources.
    // checking the dom for the <audio> tags gets the html 5 stuff,
    // need to use other things to get the rest though.

    // orrr... even better find a way of getting one of my beloved media streams....
    // maybe add each audio context as one of all three put together
    
});