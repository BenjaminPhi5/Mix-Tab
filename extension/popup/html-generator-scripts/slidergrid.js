/**
 * Generates the grid containing the slider and its buttons.
 * 
 * Attached to the popup page
 * 
 * reference html code to be generated looks like this:
 * 
 * <div class="slider-grid-container">
                <button class="slider-grid-item acontrol" id="mute">mute</button>
                <label class="slider-grid-item infolabel">host: content</label>
                <button class="slider-grid-item acontrol" id="goto">goto</button>
                <button class="slider-grid-item acontrol" id="solo">solo</button>
            <div class="slider-grid-item container">
                   
  
                    <div class="range-slider">
                        
                      <input id="rs-range-line" class="rs-range" type="range" value="0" min="0" max="200">
                      
                    </div>
                    
                    <div class="box-minmax">
                      <span class="slider-lower-bound">0</span><span class="slider-upper-bound">200</span>
                    </div>
                    
            </div>
            <label class = "slider-grid-item"></label>
        </div>
 */

 /*
Reference slider generator from old testing code:

function mkSlider(id, value, slidergroup){
    //template: <input id="gainslider" type="range" min="1" max="100" value="50"></input>
    let slider = document.createElement('input');
    slider.id = String(id);
    slider.type = "range";
    slider.min = "0";
    slider.max = "100";
    slider.value = String(value);
    slidergroup.appendChild(slider);
}
*/
/**
 * 
 * @param {*number} id tab id
 * @param {*number} value value of gain/pan param
 * @param {*String} host site tab is on
 * @param {*String} content site media content
 * @param {*HTML element} parentGroup parent html element of slider
 */
function generateSliderGrid(id, value, title, audioSource, mute, solo){
    // create elements
    console.log("at generate now: ", id, String(id), value, String(value), Math.round(value), title, audioSource);

    let sliderGridContainer = document.createElement('div');
    let muteButton = document.createElement('button');
    let infoLabel = document.createElement('label');
    let gotoButton = document.createElement('button');
    let soloButton = document.createElement('button');
    let sliderGridItem = document.createElement('div');
    let rangeSlider = document.createElement('div');
    let rangeLine = document.createElement('input');
    let boxMinMax = document.createElement('div');
    let zeroSpan = document.createElement('span');
    let maxSpan = document.createElement('span');
    let spareGridItem = document.createElement('label');


    // add the elements' properties
    strId = String(id);

    sliderGridContainer.className = "slider-grid-container";
    sliderGridContainer.id = strId + "sGroup";
    
    muteButton.className = "slider-grid-item acontrol";
    muteButton.id = strId + " mute";
    muteButton.innerHTML = "mute";
    muteButton.setAttribute("muted",(mute) ? "true":"false");
    
    infoLabel.className = "slider-grid-item infolabel";
    infoLabel.id = strId + " info";
    infoLabel.innerHTML = title;

    gotoButton.className = "slider-grid-item acontrol";
    gotoButton.id = strId + " goto";
    gotoButton.innerHTML = "goto";

    soloButton.className = "slider-grid-item acontrol";
    soloButton.id = strId + " solo";
    soloButton.innerHTML = "solo";
    soloButton.setAttribute("soloed",(solo) ? "true":"false");

    sliderGridItem.className = "slider-grid-item container";
    sliderGridItem.id = strId + " sgi";
    
    rangeSlider.className = "range-slider";
    rangeSlider.id = strId + " rs";

    rangeLine.className = "rs-range";
    rangeLine.id = strId + " input";
    rangeLine.type = "range";
    rangeLine.min = "0";
    rangeLine.max = "200";
    rangeLine.value = String(value);
    rangeLine.setAttribute('audiosource', audioSource); 
    rangeLine.setAttribute("tabid", id);
    //audio source is page for contents script extracted audio, and load for popup loaded audio

    boxMinMax.className = "box-minmax";
    
    zeroSpan.className = "slider-lower-bound";
    zeroSpan.innerHTML = "0";

    maxSpan.innerHTML = "200";
    maxSpan.className = "slider-upper-bound";

    spareGridItem.className = "slider-grid-item";

    
    // Generate parent child structure
    // everything is finally added to the popup at the end
    // to prevent any wierd rendering issues
    // structure built from inside out
    rangeSlider.appendChild(rangeLine);

    boxMinMax.appendChild(zeroSpan);
    boxMinMax.appendChild(maxSpan);

    sliderGridItem.appendChild(rangeSlider);
    sliderGridItem.appendChild(boxMinMax);

    sliderGridContainer.appendChild(muteButton);
    sliderGridContainer.appendChild(infoLabel);
    sliderGridContainer.appendChild(gotoButton);
    sliderGridContainer.appendChild(soloButton);
    sliderGridContainer.appendChild(sliderGridItem);
    sliderGridContainer.appendChild(spareGridItem);

    parentGroup.appendChild(sliderGridContainer);

    // call the mute or solo functions if nessesary
    if(mute){
      visualMuteSlider(id);
    } else if(solo){
      visualSoloSlider(id);
    }

    // add on clicks for the buttons:

  muteButton.onclick = function(elment){
      // is it mute or not?:
      if(muteButton.getAttribute("muted") === "true"){
        unmuteSlider(id);
      } else {
        muteSlider(id);
      }
  }

  soloButton.onclick = function(element){
     // is it solo or not?:
     if(soloButton.getAttribute("soloed") === "true"){
      unsoloSlider(id);
    } else {
      soloSlider(id);
    }
  }
  
  gotoButton.onclick = function(element){
    // this button just opens the tab which you have selected
    // gets selected tab to get its window id, then switches to it.
    chrome.tabs.get(id, function(tab){
      chrome.tabs.update(id, {active: true}, function () {
        chrome.windows.update(tab.windowId, {focused: true});
      });
    });
  }
}

function visualMuteSlider(id){
  strId = String(id);

  // set badge text and colour
  chrome.browserAction.setBadgeText({text: "mute", tabId: id});
  chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000", tabId: id});
  
  //set its colour to dark grey
  slider = document.getElementById(strId + " input");
  slider.style = "border: 1px solid #252420;\nbackground: #252420;";

  // set button colour
  document.getElementById(strId + " mute").style = "background-color:#FF0000;"

  // set state
  setMuteState(id, "true");
}

function visualUndoSlider(id, type){
  strId = String(id);
  // remove badge text
  chrome.browserAction.setBadgeText({text: '', tabId: id});

  // set its colour back to white
  slider = document.getElementById(strId + " input");
  slider.style = "border: 0px solid #010101;\nbackground: #ffffff;";

  // set button colour
  document.getElementById(strId + type).style = "background-color:#44c767;"

  // set state
  if(type === " mute"){
    setMuteState(id, "false");
  } else {
    setSoloState(id, "false");
  }
}

function visualSoloSlider(id){
  strId = String(id);
  // set badge text and colour
  chrome.browserAction.setBadgeText({text: "solo", tabId: id});
  chrome.browserAction.setBadgeBackgroundColor({color: "#F1C40F", tabId: id});

  // set background colour to yellow
  slider = document.getElementById(strId + " input");
  slider.style = "border: 1px solid #ff9900;\nbackground: #ff9900;";

  // set button colour
  document.getElementById(strId + " solo").style = "background-color:#F1C40F;"

  // set state
  setSoloState(id, "true");
}

function muteSlider(id){
    strId = String(id);
    slider = document.getElementById(strId + " input");

    chrome.runtime.sendMessage({
      action: "slidergrid-mute-request",
      tabid: id
    });
}

function unmuteSlider(id){
  strId = String(id);
  slider = document.getElementById(strId + " input");

  chrome.runtime.sendMessage({
    action: "slidergrid-unmute-request",
    tabid: id
  });
}

function soloSlider(id){
  strId = String(id);
  slider = document.getElementById(strId + " input");

  chrome.runtime.sendMessage({
    action: "slidergrid-solo-request",
    tabid: id
  });
}

function unsoloSlider(id){
  strId = String(id);
  slider = document.getElementById(strId + " input");

  chrome.runtime.sendMessage({
    action: "slidergrid-unsolo-request",
    tabid: id
  });
}

function setMuteState(id, mute){
  document.getElementById(String(id) + " mute").setAttribute("muted", mute);
}

function setSoloState(id, solo){
  document.getElementById(String(id) + " solo").setAttribute("soloed", solo);
}