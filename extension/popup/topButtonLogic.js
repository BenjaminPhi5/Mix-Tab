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
        switchToGain();
    }
}

pan_button.onclick = function(element){
    // if not already on pan, do switching
    if(currentStatus !== "pan"){
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
        switchToPan();
    }
}

eq_button.onclick = function(element){
    // if not already on pan, do switching
    if(currentStatus !== "eq"){
        // set button color to blue and other buttons to orange
        eq_button.style = "background-color:#004df3;";
        gain_button.style = "background-color:#f36d00;";
        pan_button.style = "background-color:#f36d00;";
        
        // switch out the sliders for the eq dials and load all that eq data......
        switchToEq();
    }
}


// switch the sliders from whatever state they are in to gain
function switchToGain(){
    if(currentStatus === "pan"){
        // set status
        currentStatus = "gain";

        // get all the sliders
        sliders = document.getElementsByClassName("rs-range");

        for(i = 0; i < sliders.length; i++){
            let slider = sliders[i];
            let id = parseInt(slider.getAttribute("tabid"));
            if(slider.getAttribute("audiosource") === "load"){
                // for all document loaded audio, just switch the slider value to the pan
                slider.value = audios.get(id).gainNode.gain.value * 100;
            }

            
            else if(slider.getAttribute("audiosource") === "page"){
                // store old (current) slider value
                let vals = pageAudios.get(id);
                vals.pan = parseInt(slider.value)/100 - 1;
                pageAudios.set(id, vals);
                

                // now, local values are stored in the pageAudios map upon a switch, so no message passing needed!. yay nice.
                // see the top of the if statement for the store bit
                slider.value = pageAudios.get(id).gain * 100;
            }
        }

        
    } else {
        // switch from eq to gain
        // set status
        currentStatus = "gain";
    }

}

function switchToPan(){
    if(currentStatus === "gain"){
        // store current gain value

        // set status
        currentStatus = "pan";

        // get all the sliders
        sliders = document.getElementsByClassName("rs-range");

        for(i = 0; i < sliders.length; i++){
            let slider = sliders[i];
            let id = parseInt(slider.getAttribute("tabid"));
            if(slider.getAttribute("audiosource") === "load"){
                console.log("load pan: ", slider.getAttribute("tabid"), audios, slider);
                console.log("load pan value: ", parseInt(slider.getAttribute("tabid")), audios.get(parseInt(slider.getAttribute("tabid"))).panNode.pan.value);
                // for all document loaded audio, just switch the slider value to the pan, by converting the given value
                slider.value = (audios.get(id).panNode.pan.value + 1) * 100;
            }

            // for all page loaded audio - gonna have to do a ton of message passing eugh oh well
            else if(slider.getAttribute("audiosource") === "page"){
                // store old (current) slider value
                let vals = pageAudios.get(id);
                vals.gain = parseInt(slider.value)/100;
                pageAudios.set(id, vals);

                // now, local values are stored in the pageAudios map upon a switch, so no message passing needed!. yay nice.
                slider.value = (pageAudios.get(id).pan + 1) * 100;
            }

        }

        
    } else {
        // switch from eq to gain
        // set status
        currentStatus = "pan";
    }
}

function switchToEq(){
    // set status
    currentStatus = "eq";
}