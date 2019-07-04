// background script goes here, to inject content script eventually I imagine
// testing for creating multiple objects
var audioControlList = new Map();
var pageAudioControlList = new Map();

/**
 * TEMPLATE FOR SENDING MESSAGES IS:
 * action: sender-param/info-request/modify/delivery   (where info is the specific info)
 */

// on install, eventually should setup settings, for now just write to console
chrome.runtime.onInstalled.addListener(function (){
    console.log("extension installed");
});


// setup message listener, when tab audio requested, just output a log of the stream
chrome.runtime.onMessage.addListener(function(request, sendResponse){
    // the message listener will recieve a request message, who sent it and a callback? I think, not sure
    console.log("message:", request);

    // if its my message
    if(request.action === 'popup-fetch-audio-stream-request') {
        console.log("my mesage for audio fetch recieved");

        // fetch tab id
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currTab = tabs[0];
            if (currTab) { // Sanity check
                // get id
                var tabid = currTab.id;

                 // now check if the tab isn't already being monitored, if it is, do nothing.
                if(audioControlList.has(tabid) || pageAudioControlList.has(tabid)){
                    return;
                }

                // fetch audio
                chrome.tabCapture.capture({
			        audio : true,
		            video : false
	            }, function(stream) {
                    try{
                        console.log('stream', stream);
                        
                        // call the setup function to attach all the audio nodes and add to the audioControlList.
                        setupBackgroundAudioContext(stream, tabid, currTab.mutedInfo);

                        // send message to popup to add new slider
                        chrome.runtime.sendMessage({
                            action: 'background-new-loaded-audio-control-delivery',
                            key: tabid
                        })
                    } catch(err) {
                        console.log("audio stream cannot be fetched, which may be a good thing, cause:", err);
                    }

                });
            }
        });

    
    } else if (request.action === 'page-audio-setup-delivery'){
        // add new audio element to page map:
        console.log("tabid: ", request.tabid);
        console.log("page audios before: ", pageAudioControlList);

        if(!pageAudioControlList.has(request.tabid)){

            pageAudioControlList.set(request.tabid, {
                gain: request.gain,
                pan: request.pan,
                valid: request.valid,
                muted: request.muted,
                soloed:false
            });

            console.log("SEND TAB TO FRONT");
            console.log("page audios after: ", pageAudioControlList);
            // send message to popup to add new slider to other list
            chrome.runtime.sendMessage({
                action: 'background-new-page-audio-control-delivery',
                key: request.tabid
            });
        }
    }

    else if(request.action === "slidergrid-mute-request"){
        // mute this particular tab
        __muteTab(request.tabid);
    }

    else if(request.action === "slidergrid-solo-request"){
        soloTab(request.tabid);
    }

});

/*
Listen for closing tabs
send message of a closed tab to the popup mebbe
*/
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo){
    console.log("removedTab id: ", tabId);
    // now can't just remove the thing for concurrency issues a silder may try and undate and old thing,
    // so I need to include some special valid state. set valid to false if the thing is not valid.

    // now to send message to remove the slider with that particular id
    // check if id is being used
    if(audioControlList.has(tabId)){
        audioControlList.get(tabId).valid = false;
        
        // send message saying audio value is to be removed
        chrome.runtime.sendMessage({
            action: 'background-loaded-tab-close-delivery',
            key: tabId
        })
    }

    if(pageAudioControlList.has(tabId)){
        pageAudioControlList.get(tabId).valid = false;
        
        // send message saying audio value is to be removed
        chrome.runtime.sendMessage({
            action: 'background-page-tab-close-delivery',
            key: tabId
        })
    }
});

// Find out the id of a tab from when a page is loaded and pass it to the content script, so it knows its id.
chrome.webNavigation.onCompleted.addListener(function(details){
    console.log("details found: ", details);
    chrome.tabs.sendMessage(details.tabId, {
        action: 'background-tab-id-load-delivery',
        tabid: details.tabId,
        url: details.url,
    });
});