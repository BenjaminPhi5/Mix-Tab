// setup the audioContext variable
function setupBackgroundAudioContext(stream, tabid, title){
    // init the audio context
    var audioContext = new AudioContext();

    // get a source
    var source = audioContext.createMediaStreamSource(stream);

    // add a gain node and a pan node
    var gainNode = audioContext.createGain();
    var panNode = audioContext.createStereoPanner();
    var muteNode = audioContext.createGain();

    // create the filters
    // the gain on all of these eq ranges from -20db to +20db thats the range okay. good.
    // freq: low = 315,   mid = 2950 high = 7500
    // Q:    low = 0.553, mid = 0.517 high = 0.567
    var lowEq = createBackgroundFilter(audioContext, 315, 0.553);
    var midEq = createBackgroundFilter(audioContext, 2950, 0.517);
    var highEq = createBackgroundFilter(audioContext, 7500, 0.567);

    // connect together source and node chain
    source.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(lowEq);
    lowEq.connect(midEq);
    midEq.connect(highEq);
    highEq.connect(muteNode);
    muteNode.connect(audioContext.destination);

    // add gain node to audios list/map
    // audioControlList[tabid] = {node: gainNode, streamid: stream.id, valid:true};
    audioControlList.set(tabid, {
        gainNode: gainNode, 
        panNode: panNode, 
        lowEq: lowEq,
        midEq: midEq,
        highEq: highEq,
        muteNode: muteNode,
        streamid: stream.id,
        title: title,
        valid:true,
        mute: false,
        solo: false}
    );

    console.log("audioControl: ",audioControlList);
    // done
}



function createBackgroundFilter(context, freq, Q){

    // the gain on all of these ranges from -20db to +20db thats the range okay. good.
    // freq: low = 315,   mid = 2950 high = 7500
    // Q:    low = 0.553, mid = 0.517 high = 0.567

    // setup filter
   var filter = context.createBiquadFilter();
   filter.type = "peaking"; // create an eq field of the type i intend
   filter.Q.value = Q; // experimental value
   filter.frequency.value = freq;
   filter.gain.value = 0;

   return filter;
}

function muteTab(tabid){
    // visually mute it
    chrome.runtime.sendMessage({action: "background-visual-mute-request", id:tabid, type: " mute"});

    // first is it load or page source of audio
    if(audioControlList.has(tabid)){
        audioControlList.get(tabid).muteNode.gain.value = 0;
        audioControlList.get(tabid).mute = true;
    
    } else if(pageAudioControlList.has(tabid)){
        pageAudioControlList.get(tabid).mute = true;
        chrome.tabs.sendMessage({action: "backgroundAudioSetup-mute-request"});
    }
}

function unmuteTab(tabid){

}

function soloTab(tabid){
    
}