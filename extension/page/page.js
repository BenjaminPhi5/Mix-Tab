// page script to be injected
// at the moment it is injected into every single page upon the page being loaded.
// it does nothing so far.
var audioContextCreated = false;
var audioContext;
var targets = [];
var audioNodes = [];
var tabid = 0;
var sendReady = false;
var url = '';
var responsefunc;


// collect audio targets - returns a list of targets

function getAudioTargets(){
    // get all videos and audios from the html, and collect them into a targets array.
    var videos = document.getElementsByTagName('video');
    var audios = document.getElementsByTagName('audio');

    // NOTE live values in console not same as what is fetched
    // sometimes some elements don't get loaded at all until later, as in they are injected
    // into the script at a later date... which could be a problem since this never re-checks
    // for extra target elements. but we will see......

    for (i = 0; i < videos.length; i++) {
        console.log('video:', videos[i]);
        targets.push(videos[i]);
    }
    for (i = 0; i < audios.length; i++) {
        console.log('audio:', audios[i]);
        targets.push(audios[i]);
    }
}

// get a host name
function getHostName(url){
    if('blob:' === url.substring(0,5)){
        url = url.replace('blob:', '');
        // remove control characters from the url
        url = unescape(url);
    }

    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i); // match a host in a url
    if(match !== null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0){
        // if a url match is found
        return match[2];
    } else {
        return null;
    }
}

// the init function - collect the targets, if there are some create an audio context. if not, then don't this seems simple
// also look in the tab info to see if it could at any point play audio maybe
function init(){
    // get targets
    getAudioTargets();
    console.log("targets load success!: ", targets);

    if(targets.length > 0){
        // init the audio context and add control nodes
        setupAudioContext();   
        console.log("setup success!");
    }
    // check audioContext exists
    if(!audioContextCreated){
        // for now just return, means targets to attach to, or creating the audiocontext failed.
        return;
    }
    console.log("proceed to attach success!");
    // attach the controller audio params
    attachAll();

    console.log("attach success!");
    // AAAAAHHHH BUT by running attach target, not the entire attach process, attachAll is only called once,
    // so instead, don't have to worry
    // then am giong to have to communicate these changes to the document page.
    // ONLY DO IT IF THE PAGEEEE IS NOT!! CURRENTLY IN THE LIST, SINCE THESE SOURCE REATTACH THINGIES
    // NEED TO BE CONSIDERED. note I don't think tab id nessesarily works here, as the new page in the tab may have
    // no audio at all... hmmmm this is something to be investigated with the other document stuff actually.

    // NOTE THAT IF A TAB ALREADY!! EXISTS REPLACE ITS INFO OKAY
    
    // now its time to communicate to the backgroundd... here goes:
    sendReady = true;
    sendToBackground();
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
  
    if(target.getAttribute('mix-tab-attach') === 'true'){
        return; // duplicate target, or where this method has got called multiple times from mutation observer on the target
    }

    // the source may be the target source or be the webpage source? not quite sure about this but I need it
    var targetSource = (target.src ? target.src : target.currentSrc);

    // if the source exists, good carry on
    if(targetSource){
        // crossorigin stuff.... for resources loaded from another domain
        resolveCrossorigin(target, targetSource);

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

        // now run the observer - I only care about attributes, and so don't want any spurious triggers from anything else
        targetObserver.observe(target, {
            childList: false,
            subtree: false,
            attributes: true,
            characterData: false
        });
    }
   
}

// deal with any crossorigin issues
function resolveCrossorigin(target, source){
    try{
    // I am NOT going to rewrite headers of webpages, so im giong to try and force the cross origin attribute
    // and if it doesn't work, I will ignore it. I don't to modify headers, bad practice.
    var crossorigin = target.getAttribute('crossorigin');

    // if cross origin is being used and the cross origin attribute has not been set, then I need to try and set it
    if(document.location.hostname != getHostName(source) && source.substring(0,5) != 'blob:' && !crossorigin){
        // ananymous means cross-origin requests for this element will have the credentials flag set to 'same-origin'.
        target.setAttribute('crossorigin', 'anonymous'); 

        //force "reload" so addedd crossorigin attribute can kick in
        if (target.src){
            // fine do nothing
        } else {
            if(target.currentSrc){
                if(!target.paused){
                    target.load();
                }
            }
        }
    }
    } catch(err) {
        // crossorigin resolve failed (probably due to header issues)
        console.log("resolving crossorgin failed: ", err);
    }
}

// setup the audioContext variable
function setupAudioContext(){
    // reset audioNodes
    audioNodes = [];

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
    console.log("got called to attach: ", target);
    var source = audioContext.createMediaElementSource(target);
    
    // connect the source to the first node in the chain (index 0 is the audio context itself)
    source.connect(audioNodes[1]); 

    // register the target is now attached
    target.setAttribute('mix-tab-attach', 'true');
}

function sendToBackground(){
    // for now basic setup just using a gain node - does NOT look to see if the tab is there...
    // but I don't think that matters since it will just override it anyway... oooh noice.
    // REFERENCE FROM DOCUMENT SCRIPT: audioControlList.set(tabid, {node: gainNode, streamid: stream.id, valid:true});
    //var audioControlList = chrome.extension.getBackgroundPage().audioControlList;

    // first check, is the id not 0 or the init function is not finished:
    console.log("got here: ", tabid, sendReady);
    console.log("audionodes: ", audioNodes);
    if(tabid === 0 || !sendReady){
        return;
    }
    // else, continue, send info to background
    console.log("YES got here: ", audioNodes, audioNodes[1]);

    // send the message to the background okay. noice.
    
    chrome.runtime.sendMessage({
        action: 'page-audio-setup',
        tabid: tabid,
        gain: audioNodes[1].gain.value,
        valid:true
    });
}



chrome.runtime.onMessage.addListener(function(request, sendResponse){
    // recieve tabid
    if(request.action === 'tab-id-send'){
        // set ids
        url = request.url;
        tabid = request.tabid;
        console.log("tab found: (+url): ", tabid, url);

        // setup response func

        // just call init from in here, on each page load:
        init();
    }

    // update gain node with audio
    if(request.action === 'page-param-modify'){
        audioNodes[1].gain.value = request.gain;
    }
});


document.addEventListener("DOMContentLoaded", function onLoad(){
    // log each time a new tab is loaded
    console.log("new tab has loaded - should be for every single tab");

    console.log("script: ", document.currentScript);

    // setup audio targets
    //init();
    // dont really think i need this method anymore..... aha oh well never mind.
    
});