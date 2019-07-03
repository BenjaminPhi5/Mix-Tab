// page script to be injected into every loaded page

var audioContextCreated = false;
var targets = [];
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



// Communicate setup to background script ----------------------------------------------------------------------------------------------
function sendToBackground(){
    // first check, is the id not 0 or the init function is not finished:
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



// Listeners For Setup -----------------------------------------------------------------------------------------------------------------

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
        console.log("recieved param update: ", request);
        audioNodes[1].gain.value = request.gain;
    }

    if(request.action === 'page-param-request'){
        // can actually make audioNodes a map and multiplex on request.param
        console.log("recieved message: param: ", request);
        chrome.runtime.sendMessage({action: 'page-param-send', key: tabid, param:'gain', value: audioNodes[1].gain.value});
    }
});


document.addEventListener("DOMContentLoaded", function onLoad(){
    // log each time a new tab is loaded
    console.log("new tab has loaded - should be for every single tab");
});