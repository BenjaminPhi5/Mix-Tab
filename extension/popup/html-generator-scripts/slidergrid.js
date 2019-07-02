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
                      <span>0</span><span>200</span>
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
function generateSliderGrid(id, value, host, content, parentGroup){
    // create elements
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

    sliderGridContainer.class = "slider-grid-container";
    sliderGridContainer.id = strId + "sGroup";
    
    muteButton.class = "slider-grid-item acontrol";
    muteButton.id = strId + " mute";
    muteButton.innerHTML = "mute";
    
    infoLabel.class = "slider-grid-item infolabel";
    infoLabel.id = strId + " info";
    infoLabel.innerHTML = host + ": " + content;

    gotoButton.class = "slider-grid-item acontrol";
    gotoButton.id = strId + " goto";
    gotoButton.innerHTML = "goto";

    soloButton.class = "slider-grid-item acontrol";
    soloButton.id = strId + " solo";
    soloButton.innerHTML = "solo";

    sliderGridItem.class = "slider-grid-item container";
    sliderGridItem.id = strId + " sgi";
    
    rangeSlider.class = "range-slider";
    rangeSlider.id = strId + " rs";

    rangeLine.class = "rs-range";
    rangeLine.id = strId + " input";
    rangeLine.type = "range";
    rangeLine.value = String(value);
    rangeLine.min = "0";
    rangeLine.max = "200";

    boxMinMax.class = "box-minmax";
    
    zeroSpan.innerHTML = "0";

    maxSpan.innerHTML = "200";

    spareGridItem.class = "slider-grid-item";

    
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
}