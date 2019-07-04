var soloEnabled = false;
var soloTabId = 0;

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

    if(soloEnabled){
        audioControlList.get(tabid).muteNode.gain.value = 0;
    }

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
    // first unsolo it
    unsoloTab(tabid);

    // visually mute it
    chrome.runtime.sendMessage({action: "background-visual-mute-request", id:tabid, type: " mute"});

    // first is it load or page source of audio
    if(audioControlList.has(tabid)){
        audioControlList.get(tabid).muteNode.gain.value = 0;
        audioControlList.get(tabid).mute = true;
    
    } else if(pageAudioControlList.has(tabid)){
        pageAudioControlList.get(tabid).mute = true;
        chrome.tabs.sendMessage(tabid, {action: "backgroundAudioSetup-mute-request", mute:true});
    }
}

function unmuteTab(tabid){
    // only allow unmute if solo isnt on.
    if(!soloEnabled){
        chrome.runtime.sendMessage({action: "background-visual-undo-request", id:tabid, type: " mute"});

        // first is it load or page source of audio
        if(audioControlList.has(tabid)){
            audioControlList.get(tabid).muteNode.gain.value = 1;
            audioControlList.get(tabid).mute = false;
    
        } else if(pageAudioControlList.has(tabid)){
            chrome.tabs.sendMessage(tabid, {action: "backgroundAudioSetup-unmute-request", mute:false});
            pageAudioControlList.get(tabid).mute = false;
        }
    }
}

function soloTab(tabid){
    // if soloEnabled, find the solo tab and remove its solo visual (it will be muted later (below))
    if(soloEnabled){
        chrome.runtime.sendMessage({action: "background-visual-undo-request", id:soloTabId, type: " solo"});
    }

    // now unmute (it may not be muted) (thats why we set solo enabled to false - so unmute works) 
    soloEnabled = false;
    unmuteTab(tabid);

    // visually solo
    chrome.runtime.sendMessage({action: "background-visual-solo-request", id:tabid, type: " mute"});
    // now set solo enabled to tru
    soloEnabled = true;
    soloTabId = tabid;
    // mute everything other than this thing - but dont sent the mute param to true
    audioControlList.forEach(function(value, key, map){
        if(key !== tabid){
            // set mute value
            value.muteNode.gain.value = 0;
            // set visual
            chrome.runtime.sendMessage({action: "background-visual-mute-request", id:key, type: " mute"});
        }
    });

    pageAudioControlList.forEach(function(value, key, map){
        if(key !== tabid){
            // set visual
            chrome.runtime.sendMessage({action: "background-visual-mute-request", id:key, type: " mute"});
            // send message - note MUTE IS FALSE HERE, WE DON'T SET IT TO MUTE
            chrome.tabs.sendMessage(tabid, {action: "backgroundAudioSetup-mute-request", mute:false}); 
        }
    });
    
    // have you considered is it on mute!!!
    // have you considered something else is on solo - only let one thing solo okay DONT try a counter too faffy

}

function unsoloTab(tabid){
    soloEnabled = false;
    // visually unsolo
    chrome.runtime.sendMessage({action: "background-visual-undo-request", id:tabid, type: " solo"});
    // go through all! other tabs, and if there mute value is not set, unmute them
    audioControlList.forEach(function(value, key, map){
        if(key !== tabid){
            if(!value.mute){
                // umute
                value.muteNode.gain.value = 1;
                // undo mute visual
                chrome.runtime.sendMessage({action: "background-visual-undo-request", id:key, type: " mute"});
            }
        }
    });
    pageAudioControlList.forEach(function(value, key, map){
        if(key !== tabid){
            // set visual
            if(!value.mute){
                // unmute
                chrome.tabs.sendMessage(key, {action: "backgroundAudioSetup-unmute-request", mute:false});
                // undo mute visual
                chrome.runtime.sendMessage({action: "background-visual-undo-request", id:key, type: " mute"});
            }
        }
    });
    

}