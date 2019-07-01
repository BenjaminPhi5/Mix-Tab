// page script to be injected
// at the moment it is injected into every single page upon the page being loaded.
// it does nothing so far.
var audioContextCreated = false;
var audioContext;
var targets = [];
var audioNodes = [];

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
        // init the audio context and add control nodes
        setupAudioContext();
        
    }

    // check it exists
    if(!audioContextCreated){
        // for now just return, means targets to attach to, or creating the audiocontext failed.
        return;
    }

    // attach the controller audio params
    attachAll();


    // AAAAAHHHH BUT by running attach target, not the entire attach process, attachAll is only called once,
    // so instead, don't have to worry
    // then am giong to have to communicate these changes to the document page.
    // ONLY DO IT IF THE PAGEEEE IS NOT!! CURRENTLY IN THE LIST, SINCE THESE SOURCE REATTACH THINGIES
    // NEED TO BE CONSIDERED. note I don't think tab id nessesarily works here, as the new page in the tab may have
    // no audio at all... hmmmm this is something to be investigated with the other document stuff actually.
}

// attach the tab html5 audio to our audio context
function attachAll(){
    if(!audioContextCreated){
        // something went wrong
        return;
    }

    targets.forEach(function(target, index){
        // attach the target to the audioContext okay. okay noice I like it very much good
        attachTarget(target, index);
    });

}

// attach this specific target to the audioContext.
// for now will just attach a gain filter. noice.
function attachTarget(target, index){
  
    if(target.getAttribute("mix-tab-attach") === "true"){
        // duplicate target, its already attached, or this is a rerun from where sources have now been
        // initialised, see the case below
        return;
    }

    // the source may be the target source or be the webpage source? not quite sure about this but I need it
    var targetSource = (target.src ? target.src : target.currentSrc);

    // crossorigin stuff.... see below
    var crossorigin = target.getAttribute("crossorigin");

    // if the source exists, good carry on
    if(targetSource){
        // do the cross origin stuff
        

        // attach the audio nodes and set the parameter
        attachTargetAudio(target);

    } else {
        // Some websites don't initialise the object upon creation with things such as a source, they add info later
        //so if source is defined its fine, if not need to observe when
        // so instead, I will create an observer that will look to see if any attributes are unchanged
        // and if so rerun attaching the target
        var targetObserver = new MutationObserver(function(mutations, observer){
            try{
                // if an attribute has changed, retry attaching the target
                attachTarget(target, index);
            } catch(err) {
                // dones't seem to occur.
                console.log("attach error: ", err);
            }
        });

        // now run the observer
        targetObserver.observe(target, {
            childList: false,
            subtree: false,
            attributes: true,
            characterData: false
        });
    }
   
}

// setup the audioContext variable
function setupAudioContext(){
    // init the audio context
    audioContext = new AudioContext();
    audioContextCreated = true;

    // add a gain node
    var gainNode = audioContext.createGain();

    // will eventually do this for last parameter okay. noice.
    //filters[0]._defaultChannelCount = (source.channelCount) ? source.channelCount : 2;

    // i assue only have to connect up all the filters once only.... but not sure
    gainNode.connect(audioContext.destination);

    // add nodes to the audios array
    audioNodes.push(audioContext);
    audioNodes.push(gainNode);
}

function attachTargetAudio(target){
    // get source from target
    var source = audioContext.createMediaElementSource(target);
    
    // connect the source to the first node in the chain (index 0 is the audio context itself)
    source.connect(audioNodes[1]); 

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