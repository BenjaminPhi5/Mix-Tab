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
        muted: false,
        soloed: false}
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

function __muteTab(tabid){
    // set state
    console.log("muted called on: ", tabid);
    if(audioControlList.has(tabid)){
        console.log("muted called on background loaded: ", tabid);
        audioControlList.get(tabid).soloed = false;
        audioControlList.get(tabid).muted = true;

        // mute the tab
        audioControlList.get(tabid).muteNode.gain.value = 0;
    
    } else if(pageAudioControlList.has(tabid)){
        console.log("muted called on page loaded: ", tabid);
        pageAudioControlList.get(tabid).soloed = false;
        pageAudioControlList.get(tabid).muted = true;

        chrome.tabs.sendMessage(tabid, {
            action: "backgroundAudioSetup-mute-request"
        });
    }

}

function soloTab(tabid){
    // set state
    if(audioControlList.has(tabid)){
        if(audioControlList.get(tabid).muted){
            // if its muted, unmute it
            audioControlList.get(tabid).muted = false;
            audioControlList.get(tabid).muteNode.gain.value = 1;
        }
        
        audioControlList.get(tabid).soloed = true;
    
    } else if(pageAudioControlList.has(tabid)){
        if(pageAudioControlList.get(tabid).muted){
            // if its muted, unmute it
            pageAudioControlList.get(tabid).muted = false;
            chrome.tabs.sendMessage(tabid, {
                action: "backgroundAudioSetup-unmute-request"
            });
        }


        pageAudioControlList.get(tabid).soloed = true;
    }

    // mute all other tabids
    // iterate through each element, and add a slider
    console.log("audio control: ", audioControlList);
    audioControlList.forEach(function(value, key, map){
        console.log("elem: ", key, value);
        if(key !== tabid){
            __muteTab(tabid);
        }
    });
    console.log("page audio control: ", tabid, pageAudioControlList);
    pageAudioControlList.forEach(function(value, key, map){
        console.log("elem: ", key, value);
       if(key !== tabid){
        console.log("selected elem: ", key, value);
           __muteTab(tabid);
       }
    });
    
}