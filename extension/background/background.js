// background script goes here, to inject content script eventually I imagine
// testing for creating multiple objects
var tabstrings = ["label a", "lable b", "label c"];
var audioControlList = new Map();
var pageAudioControlList = new Map();


// testing setup for a single audio context
//var audioContext = new AudioContext();
//var gainNode = audioContext.createGain();

// on install, eventually should setup settings, for now just write to console
chrome.runtime.onInstalled.addListener(function (){
    console.log("extension installed");
    // store the value for my slider:
    chrome.storage.sync.set({sliderValue: 100});
});

var popupPort;
// port connection from popup for when popup closes
chrome.runtime.onConnect.addListener(function(port){
    popupPort = port;
    popupPort.onMessage.addListener(function(message){
        console.log("message that I got:", message)
        // store all the state in the message
    });

    port.onDisconnect.addListener(function(message) {
        // popup should have closed now
        console.log("disconnect recieved: ", message);
    });
});


// setup message listener, when tab audio requested, just output a log of the stream
chrome.runtime.onMessage.addListener(function(request, sendResponse){
    // the message listener will recieve a request message, who sent it and a callback? I think, not sure
    console.log("message:", request);

    // if its my message
    if(request.action === 'fetch_audio_stream') {
        console.log("my mesage for audio fetch recieved");

        // fetch tab id
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var currTab = tabs[0];
            if (currTab) { // Sanity check
                // get id
                var tabid = currTab.id;

                // fetch audio
                chrome.tabCapture.capture({
			        audio : true,
		            video : false
	            }, function(stream) {
                    try{

                        console.log('slider value:', request.slider_value);
                        console.log('stream', stream);
                        
                        // call the setup function to attach all the audio nodes and add to the audioControlList.
                        setupBackgroundAudioContext(stream, tabid);

                        // send message to popup to add new slider
                        chrome.runtime.sendMessage({
                            action: 'new-audio-control',
                            key: tabid
                        })
                    } catch(err) {
                        console.log("audio stream cannot be fetched, which may be a good thing, cause:", err);
                    }

                });
            }
        });

        

        
    // the recieve an update gain message    
    } else if (request.action === 'update-gain'){
        console.log("value recived: " + request.slider_value);
        gainNode.gain.value = parseInt(request.slider_value)/100;
    
    } else if(request.action === 'fetch-gain-node'){
            sendResponse(gainNode);
    
    } else if (request.action === 'get-current-tab'){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            console.log("tab", tabs[0]);
        });
    
    } else if (request.action === 'page-audio-setup'){
        // add new audio element to page map:
        pageAudioControlList.set(request.tabid, {gain: request.gain, valid: request.valid});

        // send message to popup to add new slider to other list
        chrome.runtime.sendMessage({
            action: 'new-page-audio-control',
            key: request.tabid
        })
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
            action: 'tab-close',
            key: tabId
        })
    }

    if(pageAudioControlList.has(tabId)){
        pageAudioControlList.get(tabId).valid = false;
        
        // send message saying audio value is to be removed
        chrome.runtime.sendMessage({
            action: 'page-tab-close',
            key: tabId
        })
    }
});

// Find out the id of a tab from when a page is loaded and pass it to the content script, so it knows its id.
chrome.webNavigation.onCompleted.addListener(function(details){
    console.log("details found: ", details);
    chrome.tabs.sendMessage(details.tabId, {
        action: 'tab-id-send',
        tabid: details.tabId,
        url: details.url
    });
});


/*
// log the change of status of tabs may need this is a tab now has some audio to stream
chrome.tabCapture.onStatusChanged.addListener(function (captureInfo){
    console.log("captureInfo: ", captureInfo);
});
*/

/*
trigger the extension on certain websites where the audio is known to not work - e.g. to get netflix silverlight
or something like that and make it all work via a browser action.
chrome.runtime.onMessageExternal.addListener(
    function(request, sender, response){
        // verify `sender.url`, read `request` object, reply with `sednResponse(...)`
    }
)
*/