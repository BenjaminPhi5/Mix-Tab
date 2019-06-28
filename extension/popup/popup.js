// get html element
let mute_test = document.getElementById('mute_test');

// add onclick for it
mute_test.onclick = function(element) {
    console.log("button pressed");

    chrome.tabCapture.capture(
        {audio: true, video:false},
        // call back function
        function(stream){
            console.log("got stream: ", stream);
        }
    );
}