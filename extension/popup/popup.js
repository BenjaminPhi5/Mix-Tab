// get html element
let mute_test = document.getElementById('mute_test');

// add onclick for it
mute_test.onclick = function(element) {
    console.log("button pressed");

    // request the tab capture
    chrome.runtime.sendMessage({
        action: 'fetch_audio_stream'
    });
}