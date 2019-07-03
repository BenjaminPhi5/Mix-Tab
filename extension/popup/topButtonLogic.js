let gain_button = document.getElementById('gain-button');
let pan_button = document.getElementById('pan-button');
let eq_button = document.getElementById('eq-button');
let currentStatus = "gain"; // is either "gain", "pan", or "eq".

// things to do
// set the colour of the relevant buttons.
// do nothing if on correct option
// set the slider labels to hold the correct values.
// default the gain button to the correct colour.

function setupStatus(){
    // set status and gain colour. // the default gain could be in css but id have to make special case in css
    // easier to do it here while I remember
    currentStatus = "gain";
    gain_button.style = "background-color:#004df3;";
}

gain_button.onclick = function(element) {
    // if not already on gain, do switching
    if(currentStatus !== "gain"){
        // set status
        currentStatus = "gain";

        // set button color to blue and other buttons to orange
        gain_button.style = "background-color:#004df3;";
        pan_button.style = "background-color:#f36d00;";
        eq_button.style = "background-color:#f36d00;";
        
        // set slider texts to the correct values.
        lowers = document.getElementsByClassName("slider-lower-bound");
        uppers = document.getElementsByClassName("slider-upper-bound");
        for(i = 0; i < lowers.length; i++){
            lowers[i].innerHTML = "0";
            uppers[i].innerHTML = "200";
        }

        // now the values have to be changed... not same as loading...
        // load the slider values
    }
}

pan_button.onclick = function(element){
    // if not already on pan, do switching
    if(currentStatus !== "pan"){
        // set status
        currentStatus = "pan";

        // set button color to blue and other buttons to orange
        pan_button.style = "background-color:#004df3;";
        gain_button.style = "background-color:#f36d00;";
        eq_button.style = "background-color:#f36d00;";
        
        // set slider texts to the correct values.
        lowers = document.getElementsByClassName("slider-lower-bound");
        uppers = document.getElementsByClassName("slider-upper-bound");
        for(i = 0; i < lowers.length; i++){
            lowers[i].innerHTML = "L";
            uppers[i].innerHTML = "R";
        }

        // now the values have to be changed... not same as loading...
        // load the slider values
    }
}

eq_button.onclick = function(element){
    // if not already on pan, do switching
    if(currentStatus !== "eq"){
        // set status
        currentStatus = "eq";

        // set button color to blue and other buttons to orange
        eq_button.style = "background-color:#004df3;";
        gain_button.style = "background-color:#f36d00;";
        pan_button.style = "background-color:#f36d00;";
        
        // switch out the sliders for the eq dials and load all that eq data......
    }
}