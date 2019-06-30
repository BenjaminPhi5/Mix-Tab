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


<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
// setup message listener, check for different messages and act approporiately
chrome.runtime.onMessage.addListener(function(request, sendResponse){
=======
// setup message listener, when tab audio requested, just output a log of the stream
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider
=======
// setup message listener, when tab audio requested, just output a log of the stream
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider
=======
// setup message listener, when tab audio requested, just output a log of the stream
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider
    // the message listener will recieve a request message, who sent it and a callback? I think, not sure
    
    // if its my message
    if(request.action === 'fetch_audio_stream') {
        console.log("my mesage for audio fetch recieved");
<<<<<<< HEAD
        console.log("request: ", request);
        console.log("send_resp: ", sendResponse);

        try{
            // now check if tab is not in 'currently being tracked tabs'
            var currTab;

            /*
            chrome.tabs.query({active:true, currentWindow:true}, function(tabs){
                currTab = tabs[0];
                console.log("currTab: ",currTab);
            });
            */

            if(!tabsList.includes(5)){
                
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
=======

        chrome.tabCapture.capture({
			audio : true,
			video : false
		}, function(stream) {
            console.log('slider value:', request.slider_value)
			console.log('stream', stream);
            //I can attach all my filter here...

            // create an audio context
            var audioContext = new AudioContext();
            var gainNode = audioContext.createGain();
            //var destination = audioContext.createMediaStreamDestination();

            // get a source
            var source = audioContext.createMediaStreamSource(stream);
            console.log('i managed to create an audio context.. yay')
            
            
            
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);

            console.log("here is my audio context, source, and gain node: ", audioContext, source, gainNode);
            console.log("min and max value", gainNode.gain.minValue, gainNode.gain.maxValue);
            console.log("current value", gainNode.gain.value);
            gainNode.gain.value *= 5;
            console.log("updated value", gainNode.gain.value);
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider
            
<<<<<<< HEAD
<<<<<<< HEAD
                    // now push the new nodes to the list store
                    audioContextsList.push(audioContext);
                    gainNodesList.push(gainNode);
                    tabsList.push(currTab); // add tabs to tabs being monitored.
                });
            }

        } catch(err) {
            // in this case do nothing, since there is no audio context to capture
            if(err.name !== 'TypeError'){
                console.error("Not the error type I was expecting, something else went wrong here:")
                console.error(err);
            }
        }

        // now call the callback function:
        sendResponse(true);

<<<<<<< HEAD
    // the recieve an update gain message    
    } else if (request.action === 'update-gain'){
        console.log("value recived: " + request.slider_value);
        gainNode.gain.value = parseInt(request.slider_value)/100;
    
    // when asked to retrive a gain node    
    } else if(request.action == 'fetch-gain-node'){
            sendResponse(gainNode);
    }
=======
		});
    } 
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider
=======

		});
    } 
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider
=======

		});
    } 
>>>>>>> parent of b98dc9f... properly linked my gain node to my slider

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
