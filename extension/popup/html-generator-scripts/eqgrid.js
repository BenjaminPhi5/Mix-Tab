let parentGroup = document.getElementById("audioControlHolder");

/**
 * Generates the eq container with the dials and labels
 * 
 * Attached to the popup page
 * 
 * reference htmlcode to be generated looks like this:
 * 
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
 function generateEqGrid(id, low, mid, high, host, content){
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

    eqPane.class = "eq-pane";
    eqPane.id = strId + " eqGroup";

    infoLabel.class = "infolabel eqlabel";
    infoLabel.id = strId + " eqInfo";
    infoLabel.innerHTML = host + ": " + content;

    gridContainer.class = "grid-container";

    // low
    sliderLow.class = "grid-item round-slider";
    sliderLow.id = strId + " dialLow";

    selectionLow.class = "selection";
    selectionLow.id = strId + "selLow";

    holderLow.class = "holder";
    holderLow.id = strId + "hLow";
    holderLow.style = "color: hsl(120, 100%, 50%);";

    labelLow.class = "slidertext";
    labelLow.id = strId + "lltext";
    labelLow.innerHTML = String(mid) + "%";

    // mid
    sliderMid.class = "grid-item round-slider";
    sliderMid.id = strId + " dialMid";

    selectionMid.class = "selection";
    selectionMid.id = strId + "selMid";

    holderMid.class = "holder";
    holderMid.id = strId + "hMid";
    holderMid.style = "color: hsl(120, 100%, 50%);";

    labelMid.class = "slidertext";
    labelMid.id = strId + "lmtext";
    labelMid.innerHTML = String(low) + "%"; 
    
    // high
    sliderHigh.class = "grid-item round-slider";
    sliderHigh.id = strId + " dialHigh";

    selectionHigh.class = "selection";
    selectionHigh.id = strId + "selHigh";

    holderHigh.class = "holder";
    holderHigh.id = strId + "hHigh";
    holderHigh.style = "color: hsl(120, 100%, 50%);";

    labelHigh.class = "slidertext";
    labelHigh.id = strId + "lhtext";
    labelHigh.innerHTML = String(high) + "%";

    textLow.innerHTML = "low";

    textMid.innerHTML = "mid";

    textHigh.innerHTML = "high";

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

    parentGroup.appendChild(eqPane);
 }