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
    console.log("audios page audios:", audioControlList, pageAudioControlList);

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
                        setupBackgroundAudioContext(stream, tabid, currTab.title);

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
                low: request.low,
                mid: request.mid,
                high: request.high,
                valid: request.valid,
                mute: request.mute,
                title: "unknown",
                solo:request.solo
            });

            if(soloEnabled){
                chrome.tabs.sendMessage(tabid, {action: "backgroundAudioSetup-mute-request", mute:true});
            }

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
        muteTab(request.tabid);
    }

    else if(request.action === "slidergrid-unmute-request"){
        unmuteTab(request.tabid);
        
    }

    else if(request.action === "slidergrid-solo-request"){
        soloTab(request.tabid);
    }

    else if(request.action === "slidergrid-unsolo-request"){
        unsoloTab(request.tabid);
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


// When a tab becomes audio, send the tab id to the page script and set it running, setting up the audio context.
// changed to this from the webkit on load thing since that was buggy and often failed. this version should not
// since it waits for the tab to be audiable before doing anything (and therefore fulfilling the 'only init after user guesture'
// requirement that chrome now insists on for audio).
chrome.tabs.onUpdated.addListener(function(tabid, changeInfo, tab){
    // update popup sliders with pages updated titles.
    console.log("change: ", changeInfo);
    if(changeInfo.audible){
        chrome.tabs.sendMessage(tabid, {
            action: 'background-tab-id-load-delivery',
            tabid: tabid,
            url: "",
        });
    }
});

// Find out the id of a tab from when a page is loaded and pass it to the content script, so it knows its id.
/* THIS IS THE OLD WAY - SEE BELOW. NOW AUDIO ONLY LOADED UPON A USER GUESTURE THAT CAUSES AUDIO - INLINE WITH THE 
 CHANGES TO CHROME
chrome.webNavigation.onCompleted.addListener(function(details){
    console.log("details found: ", details);
    // send tab id to the page
    chrome.tabs.sendMessage(details.tabId, {
        action: 'background-tab-id-load-delivery',
        tabid: details.tabId,
        url: details.url,
    });
});
*/

