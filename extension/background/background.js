// background script goes here, to inject content script eventually I imagine
var audioContextsList = []; // the audio contexts of current live tabs
var gainNodesList = [];     // gain nodes for current live tabs
var tabsList = [];          // the tabs that are currently live


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


// setup message listener, check for different messages and act approporiately
chrome.runtime.onMessage.addListener(function(request, sendResponse){
    // the message listener will recieve a request message, who sent it and a callback? I think, not sure
    
    // if its my message
    if(request.action === 'fetch_audio_stream') {
        console.log("my mesage for audio fetch recieved");

        try{
            // capture the active tab
            chrome.tabCapture.capture({
			    audio : true,
			    video : false
		    }, function(stream) {
			    //console.log('stream', stream);
                //I can attach audio stuff here

                // create an audio context
                var audioContext = new AudioContext();
                var gainNode = audioContext.createGain();

                // get a source, attach the gain node
                var source = audioContext.createMediaStreamSource(stream);
                source.connect(gainNode);
                gainNode.connect(audioContext.destination);
            
                // now push the new nodes to the list store
                audioContextsList.push(audioContext);
                gainNodesList.push(gainNode);
        });

        } catch(err) {
            // in this case do nothing, since there is no audio context to capture
            if(err.name !== 'TypeError'){
                console.error("Not the error type I was expecting")
            }
        }

    // the recieve an update gain message    
    } else if (request.action === 'update-gain'){
        console.log("value recived: " + request.slider_value);
        gainNode.gain.value = parseInt(request.slider_value)/100;
    
    // when asked to retrive a gain node    
    } else if(request.action == 'fetch-gain-node'){
            sendResponse(gainNode);
    }

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
