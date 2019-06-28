// background script goes here, to inject content script eventually I imagine


// on install, eventually should setup settings, for now just write to console
chrome.runtime.onInstalled.addListener(function (){
    console.log("extension installed");
});


// setup message listener, when tab audio requested, just output a log of the stream
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    // the message listener will recieve a request message, who sent it and a callback? I think, not sure
    
    // if its my message
    if(request.action === 'fetch_audio_stream') {
        console.log("my mesage for audio fetch recieved");

        chrome.loadofoldnonsense.capture({
			audio : true,
			video : false
		}, function(stream) {
			console.log('stream', stream);
			//I can attach all my filter here...
		});
    }

});
/*
// log the change of status of tabs
chrome.tabCapture.onStatusChanged.addListener(function (captureInfo){
    console.log("captureInfo: ", captureInfo);
});
*/
let callback = function(info){console.log("got some info");}
chrome.browserAction.onClicked.addListener(function(request) {
    console.log("well at least something happened");
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabCapture.capture({audio: true, video: true}, callback);
    });
});