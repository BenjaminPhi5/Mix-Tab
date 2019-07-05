/**
 * This script mostly for controlling the visual effect of the dials...
 * and some message passing for connecting to the rest of the extension,
 * for communicating values to content scripts etc etc.
 */
//var sliders = document.getElementsByClassName("round-slider");

function generateSliderHandle(slider, value){
	//sliders = document.getElementsByClassName("round-slider");
	console.log("Slider:", slider);
	

		// the angle should be fetched here from the popup, and message passing should
		// also be set up here, so that the param is passed through,
		// however, wait until actually have frequency stuff properly setup.
		computeStartAngle(slider, value);

		slider.addEventListener("click", round_slider_tune, false);
		slider.addEventListener("mousedown", function(event) {
			slider.onmousemove = function(event) {
				if (event.buttons == 1 || event.buttons == 3) {
					round_slider_tune(event);
				}
			}
		});
	
}

// these compuet the dx and dys for the dial position function
// which ive reverse engineered to be able to input a pocentage and get out a dx, dy that could have caused that
// and then apply that to the dial. messy code reuse but oh well.
function interpolate(v,vmin, vmax, outstart, outend){
	return outstart + (outend-outstart) * ((v-vmin)/(vmax-vmin));
}

function getX(value){
	if(0 <= value && value <= 13){
		return interpolate(value, 0, 13, 45, 0);
	}
	else if(14 <= value && value <= 38){
		return 0;
	}
	else if(39 <= value && value <= 63){
		return interpolate(value, 39, 63, 5, 100);
	}
	else if(64 <= value && value <= 88){
			return 100;
	}
	else if(89 <= value && value <= 100){
			return interpolate(value, 89, 100, 96, 52);
	}
	
}

function getY(value){
	if(0 <= value && value <= 13){
		return 0;
	}
	else if(14 <= value && value <= 38){
		return interpolate(value, 14, 38, 5, 100);
	}
	else if(39 <= value && value <= 63){
		return 100;
	}
	else if(64 <= value && value <= 88){
		return interpolate(value, 64, 88, 95, 0);
	}
	else if(89 <= value && value <= 100){
		return 0;
	}
}

function getAngle(value){
	if(value < 50){
		return interpolate(value, 0, 49, 2, 176);
	} else {
		return interpolate(value, 50, 100, -176, -2);
	}
}

function computeStartAngle(slider, percentage){

	let dX = getX(percentage);
	let dY = getY(percentage);
	let angle = getAngle(percentage);
	
	let output = slider.getElementsByClassName("selection")[0],
		text = slider.getElementsByClassName("slidertext")[0],
		styleafter = document.head.appendChild(document.createElement("style")),
		value = 100;

	if (0 <= dX && dX < 50 && dY == 0) {
		output.style = "clip-path: polygon(" + dX + "% " + dY + "%, 50% 0%, 50% 50%);";
		value = Math.round((50 - dX) / 50 * 12.5);
	} else if (dX == 0 && 0 <= dY && dY <= 100) {
		output.style = "clip-path: polygon(" + dX + "% " + dY + "%, 0% 0%, 50% 0%, 50% 50%);";
		value = Math.round(12.5 + dY / 100 * 25);
	} else if (0 <= dX && dX <= 100 && dY == 100) {
		output.style = "clip-path: polygon(" + dX + "% " + dY + "%, 0% 100%, 0% 0%, 50% 0%, 50% 50%);";
		value = Math.round(37.5 + dX / 100 * 25);
	} else if (dX == 100 && 0 <= dY && dY <= 100) {
		output.style = "clip-path: polygon(" + dX + "% " + dY + "%, 100% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 50%);";
		value = Math.round(62.5 + (100 - dY) / 100 * 25);
	} else if (50 <= dX && dX <= 100 && dY == 0) {
		output.style = "clip-path: polygon(" + dX + "% " + dY + "%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 50%);";
		value = Math.round(87.5 + (100 - dX) / 50 * 12.5);
	}
	
	styleafter.innerHTML = ".round-slider .selection:after {transform: rotate(" + -angle + "deg);}";
	let hue = Math.floor(value / 100 * 120),
		saturation = Math.abs(value - 50);
	text.innerHTML = percentage + "%";
	text.style = "color: hsl(" + hue + ", 100%, " + saturation + "%);";

	console.log("dx, dy, angle, value, percentage: " + dX + "%", dY + "% " + angle, value, percentage);
	
}

function round_slider_tune(event) {
	let eventDoc = (event.target && event.target.ownerDocument) || document,
		doc = eventDoc.documentElement,
		body = eventDoc.body;
	event.pageX = event.clientX +
		  (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
		  (doc && doc.clientLeft || body && body.clientLeft || 0);
	event.pageY = event.clientY +
		  (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
		  (doc && doc.clientTop  || body && body.clientTop  || 0 );
	let output = event.target.getElementsByClassName("selection")[0],
		text = event.target.getElementsByClassName("slidertext")[0],
		styleafter = document.head.appendChild(document.createElement("style")),
		elpos = event.target.getBoundingClientRect(),
		cX = elpos.width / 2,
		cY = elpos.height / 2,
		eX = event.pageX - elpos.left,
		eY = event.pageY - elpos.top,
		dX = 0,
		dY = 0,
		angle = Math.atan2(cX - eX, cY - eY) * (180 / Math.PI),
		value = 100;
	//console.log(cX, cY, eX, eY, angle);

	if (Math.abs(eX - cX) >= Math.abs(eY - cY)) { // 110 90
		dX = 150 / 2 + Math.sign(eX - cX) * 150 / 2;
		dY = 150 / 2 + (eY - cY) / Math.abs(eX - cX) * 150 / 2;
	} else {
		dX = 150 / 2 + (eX - cX) / Math.abs(eY - cY) * 150 / 2;
		dY = 150 / 2 + Math.sign(eY - cY) * 150 / 2;
	}
	dX = Math.round(dX / 150 * 100)
	dY = Math.round(dY / 150 * 100)
	//console.log("dx, dy: " + dX + "%", dY + "%");
	/*if (0 < angle && angle <= 45) {
	} else if (45 < angle && angle <= 120) {
	} else if ((120 < angle && angle <= 180) || (-180 < angle && angle <= -120)) {
	} else if (-120 < angle && angle <= -45) {
	} else if (-45 < angle && angle <= 0) {}*/
	if (0 <= dX && dX < 50 && dY == 0) {
		output.style = "clip-path: polygon(" + dX + "% " + dY + "%, 50% 0%, 50% 50%);";
		value = Math.round((50 - dX) / 50 * 12.5);
	} else if (dX == 0 && 0 <= dY && dY <= 100) {
		output.style = "clip-path: polygon(" + dX + "% " + dY + "%, 0% 0%, 50% 0%, 50% 50%);";
		value = Math.round(12.5 + dY / 100 * 25);
	} else if (0 <= dX && dX <= 100 && dY == 100) {
		output.style = "clip-path: polygon(" + dX + "% " + dY + "%, 0% 100%, 0% 0%, 50% 0%, 50% 50%);";
		value = Math.round(37.5 + dX / 100 * 25);
	} else if (dX == 100 && 0 <= dY && dY <= 100) {
		output.style = "clip-path: polygon(" + dX + "% " + dY + "%, 100% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 50%);";
		value = Math.round(62.5 + (100 - dY) / 100 * 25);
	} else if (50 <= dX && dX <= 100 && dY == 0) {
		output.style = "clip-path: polygon(" + dX + "% " + dY + "%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%, 50% 50%);";
		value = Math.round(87.5 + (100 - dX) / 50 * 12.5);
	}
	styleafter.innerHTML = ".round-slider .selection:after {transform: rotate(" + -angle + "deg);}";
	let hue = Math.floor(value / 100 * 120),
		saturation = Math.abs(value - 50);
	text.innerHTML = value + "%";
	text.style = "color: hsl(" + hue + ", 100%, " + saturation + "%);";

	console.log("dx, dy, angle, value: " + dX + "%", dY + "% " + angle, value);
	communicateChange(value, event.target);
}

function communicateChange(value, target){
	// now communicate change in eq param, convert value to a value between -20 and 20:
	let converted = ((value/10) * 4) - 20;

	let tabid = parseInt(target.getAttribute("tabid"));
	let eqType = target.getAttribute("eq-type");

	// check if it in load audios
	if(audios.has(tabid)){
		let audioControl = audios.get(tabid);
		switch(eqType){
			case "low": audioControl.lowEq.gain.value = converted; break;
			case "mid": audioControl.midEq.gain.value = converted; break;
			case "high": audioControl.highEq.gain.value = converted; break;
		}
	} else {
		// must be a page audio, send to contents script
		chrome.tabs.sendMessage(tabid, {
			action: "dials-param-delivery",
			eqType: target.getAttribute("eq-type"),
			value: converted
		});
	}
	
}

// convert a eq value to percent
function ctp(value){
	return ((value + 20) / 4) * 10;
}