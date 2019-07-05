let eqParentGroup = document.getElementById("eqControlHolder");
// set eq to be invisible at start
eqParentGroup.style.display = 'none';
/**
 * Generates the eq container with the dials and labels
 * 
 * Attached to the popup page
 * 
 * reference htmlcode to be generated looks like this:
 * 
 * <div class="eq-pane">
                <label class="infolabel eqlabel">host: content</label>
                <div class="grid-container">
       
                               <div class="grid-item round-slider">
                                       <div class="selection"></div>
                                       <div class="holder" style="color: hsl(120, 100%, 50%);"><label class="slidertext">100%</label></div>
                               </div>
                               
                               <div class="grid-item round-slider">
                                       <div class="selection"></div>
                                       <div class="holder" style="color: hsl(120, 100%, 50%);"><label class="slidertext">100%</label></div>      
                               </div>
                               
                               <div class="grid-item round-slider">
                                       <div class="selection"></div>
                                       <div class="holder" style="color: hsl(120, 100%, 50%);"><label class="slidertext">100%</label></div>      
                               </div>

                               <label class="infolabel eqlabel">low</label>
                               <label class="infolabel eqlabel">mid</label>
                               <label class="infolabel eqlabel">high</label>
                      </div>
                
    </div>
 * 
 * reference slider generator from old tesingcode:
 
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
// see sliderGrid for similar function description.
 function generateEqGrid(id, low, mid, high, title){
    // create elements
    let eqPane = document.createElement('div');
    let infoLabel = document.createElement('label');
    let gridContainer = document.createElement('div');
    let sliderLow = document.createElement('div');
    let selectionLow = document.createElement('div');
    let holderLow = document.createElement('div');
    let labelLow = document.createElement('label');
    let sliderMid = document.createElement('div');
    let selectionMid = document.createElement('div');
    let holderMid = document.createElement('div');
    let labelMid = document.createElement('label');
    let sliderHigh = document.createElement('div');
    let selectionHigh = document.createElement('div');
    let holderHigh = document.createElement('div');
    let labelHigh = document.createElement('label');
    let textLow = document.createElement('label');
    let textMid = document.createElement('label');
    let textHigh = document.createElement('label');

    // add the elements' properties
    strId = String(id);

    eqPane.className = "eq-pane";
    eqPane.id = strId + " eqGroup";

    infoLabel.className = "infolabel eqlabel";
    infoLabel.id = strId + " eqInfo";
    infoLabel.innerHTML = title;

    gridContainer.className = "grid-container";

    // low
    sliderLow.className = "grid-item round-slider";
    sliderLow.id = strId + " dialLow";
    sliderLow.setAttribute("eq-type", "low");
    sliderLow.setAttribute("tabid", strId);

    selectionLow.className = "selection";
    selectionLow.id = strId + "selLow";

    holderLow.className = "holder";
    holderLow.id = strId + "hLow";
    holderLow.style = "color: hsl(120, 100%, 50%);";

    labelLow.className = "slidertext";
    labelLow.id = strId + "lltext";
    labelLow.innerHTML = String(Math.round(low)) + "%";

    // mid
    sliderMid.className = "grid-item round-slider";
    sliderMid.id = strId + " dialMid";
    sliderMid.setAttribute("eq-type", "mid");
    sliderMid.setAttribute("tabid", strId);

    selectionMid.className = "selection";
    selectionMid.id = strId + "selMid";

    holderMid.className = "holder";
    holderMid.id = strId + "hMid";
    holderMid.style = "color: hsl(120, 100%, 50%);";

    labelMid.className = "slidertext";
    labelMid.id = strId + "lmtext";
    labelMid.innerHTML = String(Math.round(mid)) + "%"; 
    
    // high
    sliderHigh.className = "grid-item round-slider";
    sliderHigh.id = strId + " dialHigh";
    sliderHigh.setAttribute("eq-type", "high");
    sliderHigh.setAttribute("tabid", strId);

    selectionHigh.className = "selection";
    selectionHigh.id = strId + "selHigh";

    holderHigh.className = "holder";
    holderHigh.id = strId + "hHigh";
    holderHigh.style = "color: hsl(120, 100%, 50%);";

    labelHigh.className = "slidertext";
    labelHigh.id = strId + "lhtext";
    labelHigh.innerHTML = String(Math.round(high)) + "%";

    textLow.innerHTML = "low";
    textLow.className = "infolabel eqlabel";

    textMid.innerHTML = "mid";
    textMid.className = "infolabel eqlabel";

    textHigh.innerHTML = "high";
    textHigh.className = "infolabel eqlabel";

    // Generate parent child structure
    // everything is finally added to the popup at the end
    // to prevent any wierd rendering issues
    // structure built from inside out
    // NOTE THAT THE APPEND ORDER MATTERS
    holderLow.appendChild(labelLow);

    holderMid.appendChild(labelMid);

    holderHigh.appendChild(labelHigh);

    sliderLow.appendChild(selectionLow);
    sliderLow.appendChild(holderLow);

    sliderMid.appendChild(selectionMid);
    sliderMid.appendChild(holderMid);

    sliderHigh.appendChild(selectionHigh);
    sliderHigh.appendChild(holderHigh);

    gridContainer.appendChild(sliderLow);
    gridContainer.appendChild(sliderMid);
    gridContainer.appendChild(sliderHigh);
    gridContainer.appendChild(textLow);
    gridContainer.appendChild(textMid);
    gridContainer.appendChild(textHigh);

    eqPane.appendChild(infoLabel);
    eqPane.appendChild(gridContainer);

    eqParentGroup.appendChild(eqPane);

    // get new controllers for each dial - method from the dials.js script
    generateSliderHandle(sliderLow, low);
    generateSliderHandle(sliderMid, mid);
    generateSliderHandle(sliderHigh, high);
 }