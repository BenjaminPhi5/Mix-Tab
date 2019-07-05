// this script is a contents script, injected into all pages as well.

// the audioContext of the page
var audioContext;
// all the audio nodes for the page (the context, gain, pan, eq low, mid, high)
var audioNodes = new Map();

// setup the audioContext variable
function setupAudioContext(){
    // only do the setup if it hasn't been done alreacdy
    
    if(audioNodes.size > 1){
        return;
    }

    // reset audioNodes
    audioNodes = new Map();

    // init the audio context
    audioContext = new AudioContext();
    audioContextCreated = true;
    audioNodes.set("audioContext", audioContext);

    // add a gain node and a pan node
    var gainNode = audioContext.createGain();
    var panNode = audioContext.createStereoPanner();
    audioNodes.set("gainNode", gainNode);
    audioNodes.set("panNode", panNode);

    // create the filters
    // the gain on all of these eq ranges from -20db to +20db thats the range okay. good.
    // freq: low = 126,   mid = 1250 high = 7500
    // Q:    low = 0.553, mid = 0.517 high = 0.567
    var lowEq = createFilter("lowEq", 126, 0.553);
    var midEq = createFilter("midEq", 1250, 0.517);
    var highEq = createFilter("highEq", 7500, 0.567);

    // add mute node
    var muteNode = audioContext.createGain();
    audioNodes.set("muteNode", muteNode);

    // connect up all the filters in order (remember ive put the context itself in slot 0, so don't try to connect that)
    gainNode.connect(panNode);
    panNode.connect(lowEq);
    lowEq.connect(midEq);
    midEq.connect(highEq);
    highEq.connect(muteNode);
    muteNode.connect(audioContext.destination);
}

// create an eq filter
function createFilter(name, freq, Q){
    // sanity check, audio context exists
    if(!audioContextCreated){
        return;
    }

    // the gain on all of these ranges from -20db to +20db thats the range okay. good.
    // freq: low = 315,   mid = 2950 high = 7500
    // Q:    low = 0.553, mid = 0.517 high = 0.567

    // setup filter
   var filter = audioContext.createBiquadFilter();
   filter.type = "peaking"; // create an eq field of the type i intend
   filter.Q.value = Q; // experimental value
   filter.frequency.value = freq;
   filter.gain.value = 0;

    // add to audioControls list
    audioNodes.set(name, filter);

    return filter;
}

// attach a target in the page to the audio nodes chain.
function attachTargetAudio(target){
    // get source from target
    console.log("got called to attach: ", target);
    var source = audioContext.createMediaElementSource(target);
    
    // set channel count for firts node in chain

    // connect the source to the first node in the chain (index 0 is the audio context itself)
    source.connect(audioNodes.get("gainNode"));

    // register the target is now attached
    target.setAttribute('mix-tab-attach', 'true');
}
