SdffBuilder = require("./sdff_builder.js");


//var COLS = 32;
var COLS = 6;
var ROWS = 10;

function loader(){

	var savedDisplayState = window.localStorage.getItem("displayState");
	var displayState;
	if ("string" === typeof savedDisplayState){
		displayState = JSON.parse(savedDisplayState);
	}

	if (!!displayState && !!displayState.columns){
		COLS = displayState.columns;
	}

	if (!!displayState && !!displayState.rows){
		// TODO Make ROWS changable - rows needs to stay at 10 for now!
		//ROWS = displayState.rows;
	}

	loadDisplay(COLS, displayState);

	var savedScriptState = window.localStorage.getItem("scriptState");
	var scriptState;
	if ("string" === typeof savedScriptState){
		scriptState = JSON.parse(savedScriptState);
	}
	if (!!scriptState){
		loadScript(scriptState);
	}
}


function loadDisplay(cols, displayData){
	var contElem = document.getElementById("display-container");
	var tmplt = document.getElementById("led-tmplt").innerHTML;

	var colData = displayData && displayData.columnData;

	var contElemInner = "";
	for (var col=0; col != cols; ++col){
		for (var row=0; row != ROWS; ++row){
			contElemInner += tmplt;
		}
	}

	contElem.innerHTML = contElemInner;

	var pixelElems = contElem.getElementsByClassName("display-pixel");

	for (var idx = 0; idx != pixelElems.length; ++idx){
		var col = parseInt(idx/ROWS);
		var row = idx % ROWS;


		var rowState = 0;
		if (!!colData && !!colData[col] && !!colData[col][row]){
			rowState = 0|(colData[col][row]);
		}

		pixelElems[idx].style.top = ""+(10+30*row)+"px";
		pixelElems[idx].style.left = ""+(10+30*col)+"px";
		pixelElems[idx].id = "-" + col + "-" + row + "-";
		pixelElems[idx].addEventListener("click", onPixelClick);
		pixelElems[idx].setAttribute("data-pixel-state", ""+rowState);
		pixelElems[idx].className = buildClassNameForState("pixel-state-" + convertPixelStateToPixelColor(rowState));
	}
}

function loadScript(scriptState){

	scriptState.items.forEach( function(item){
		var elem = onAddScriptAction(item.type);
		setScriptActionParams(elem, item);
	});

}

function buildClassNameForState(state){
	return ("display-pixel"+(!state?"":(" "+state)));
}

function onPixelClick(evt){
	var pixelElem = evt.target;

	var currentState = pixelElem.getAttribute("data-pixel-state");
	if ("undefined" === typeof currentState){
		currentState = 0;
	}
	else {
		currentState |= 0;
		++currentState;
		currentState &= 3;
	}

	pixelElem.setAttribute("data-pixel-state", currentState);

	var pixelClassName = "pixel-state-";
	var color = convertPixelStateToPixelColor(currentState);
	pixelClassName += color;

	pixelElem.className = buildClassNameForState(pixelClassName);

}

function convertPixelStateToPixelColor(state){
	switch (state){
		case 1:
			return "red";
		case 2:
			return "green";
		case 3:
			return "yellow";
		case 0:
		default:
			return "off";
	}
}


function onDownloadBinary(arr){

	console.log(arr);
	var str = String.fromCharCode.apply(null, arr);
	var data = btoa(str);

	window.location = "data:application/octet-stream;base64,"+data;

}
function onDownloadCHeader(arr){
	arr = arr.map(function(item){
		return makePaddedHex(item);
	});

	var str = "#define PIXELS {";
	str += arr.join(",");
	str += "}";

	console.log(str);
	var data = btoa(str);

	window.location = "data:application/octet-stream;base64,"+data;

}
function onClickDownload(type){
	
	var arr = [];
	arr.push.apply(arr, serializeDisplayStateToNumArray());
	arr.push.apply(arr, serializeScriptToNumArray());

	switch(type){
		case "c_header":
			onDownloadCHeader(arr);
			break;
		case "binary":
			onDownloadBinary(arr);
			break;
	}
}


function makePaddedHex(n){
	var ret = (n|0).toString(16);
	ret = "00"+ret;
	ret = ret.substr(-2);
	ret = "0x"+ret;
	return ret;
}


function onClickSave(evt){
	var displayState = serializeDisplayStateToJSON();
	window.localStorage.setItem("displayState", JSON.stringify(displayState));

	var scriptState = serializeScriptToJSON();
	window.localStorage.setItem("scriptState", JSON.stringify(scriptState));
}


/**
Create an array (uint8 byte values) representing the distplay

Can be used to download to binary file, etc.
*/
function serializeDisplayStateToNumArray(){

	var displayStateJSON = serializeDisplayStateToJSON();

	var colList = [];


	for (var pixelCol = 0; pixelCol != displayStateJSON.columnData.length; ++pixelCol){
		for (var pixelRow = 0; pixelRow != displayStateJSON.columnData[pixelCol].length; ++pixelRow){

			var pixelState = displayStateJSON.columnData[pixelCol][pixelRow];
			var colData = colList[pixelCol]||0;

			var pixelBits = pixelState << (pixelRow*2);
			var pixelMask = 0x03 << (pixelRow*2);
			console.log(
				"Pixel: " + pixelCol + "x" + pixelRow
					+ "; Pixel State: " + pixelState
					+ "; Pixel Mask: " + pixelMask
					+ "; Pixel Data: " + pixelBits);
			pixelMask ^= 0xff;
			colData |= pixelBits;
			colList[pixelCol] = colData;
		}
	}

	var arr = [];

	// create V0 file header, so reader can parse correctly.
	arr.push.apply(arr, SdffBuilder.makeDispBoxHeader(COLS, ROWS, colList.length*4));

	for (var idx=0; idx !== colList.length; ++idx){
		var item = colList[idx];
		arr.push( (item>>24)&0xff );
		arr.push( (item>>16)&0xff );
		arr.push( (item>>8)&0xff );
		arr.push( item&0xff );
	}

	return arr;
}

/**
Create a json object representing the display state
*/
function serializeDisplayStateToJSON(){
	var colList = [];

	var ret = {
		columns: COLS,
		rows: ROWS,
		columnData: [ ]
	};

	var pixelElems = document.getElementsByClassName("display-pixel");

	for (var idx = 0; idx != pixelElems.length; ++idx){
		var pixelState = pixelElems[idx].getAttribute("data-pixel-state");
		var pixelPosition = pixelElems[idx].id;
		pixelPosition = pixelPosition.split("-");
		var pixelCol = 0|pixelPosition[1];
		var pixelRow = 0|pixelPosition[2];
		var colData = ret.columnData[pixelCol];
		if (!colData) {
			colData = [];
			for (var i = 0; i != ret.rows; ++i){
				colData[i] = 0;
			}
		}

		colData[pixelRow] = pixelState;
		ret.columnData[pixelCol] = colData;
	}

	return ret;
}

function restoreDisplayStateFromNumArray(){

}


function serializeScriptToNumArray(){
	var scriptJSON = serializeScriptToJSON();

	var ret = serializeScriptBox(scriptJSON.flags);
	for (var idx=0; idx != scriptJSON.count; ++idx){
		console.log(
			"Serialize script action box: "
			+ idx
			+ "/"
			+ scriptJSON.count
			+ "; type: "
			+ scriptJSON.items[idx].type);

		var boxBytes;
		switch(scriptJSON.items[idx].type){
			case "scroll":
				boxBytes = serializeScrollScriptAction(scriptJSON.items[idx]);				
				break;
			case "pause":
				boxBytes = serializePauseScriptAction(scriptJSON.items[idx]);				
				break;
			case "position":
				boxBytes = serializePositionScriptAction(scriptJSON.items[idx]);
				break;
			default:
				console.error("Invalid script action type: "+scriptJSON.items[idx].type);
				break;
		}

		ret.push.apply(ret, boxBytes);
	}

	return ret;
}

function serializeScriptBox(flags){
	var arr = [];

	arr.push.apply(arr, SdffBuilder.makeBoxHeader("scpt", 0, flags, 8));

	return arr;
}

function serializeScrollScriptAction(action){
	var arr = [];

	arr.push.apply(arr, SdffBuilder.makeBoxHeader("sscr", 0, 0, 13))
	SdffBuilder.pushInt16BE(arr, action.step);
	SdffBuilder.pushInt16BE(arr, action.delay);
	SdffBuilder.pushInt8(arr, action.count);

	return arr;
}

function serializePositionScriptAction(action){
	var arr = [];

	arr.push.apply(arr, SdffBuilder.makeBoxHeader("spos", 0, 0, 10))
	SdffBuilder.pushInt16BE(arr, action.position);

	return arr;
}

function serializePauseScriptAction(action){
	var arr = [];

	arr.push.apply(arr, SdffBuilder.makeBoxHeader("spau", 0, 0, 10))
	SdffBuilder.pushInt16BE(arr, action.duration);

	return arr;
}





var Script = {
	Flags: {
		repeat: 0x01,
		wrap: 0x02
	}
};

function serializeScriptToJSON(){
	var ret = {
		flags: Script.Flags.repeat,///<TODO: 
		count: 0,
		items: []
	};

	var elems = getScriptContainer();

	for (var elemIdx = 0; true; ++elemIdx){
		var elem = elems.get(elemIdx);
		if (!elem) break;
		elem = elem.firstElementChild;
		var actionJson = serializeScriptActionToJson(elem);
		if (!!actionJson){
			ret.items.push(actionJson);
		}
	}

	ret.count = ret.items.length;

	return ret;
}

function serializeScriptActionToJson(scriptActionElem){
	var actionTypeElem = scriptActionElem.getElementsByClassName("script-action-type")[0];

	return getSerializerByType(actionTypeElem.value).serialize(scriptActionElem);
}

var scriptActionSerializers = {
	scroll: function(elem){
		var ret = { type: "scroll" };
		var classes = elem.getElementsByClassName("script-action-option-scroll"); 
		var params = classes[0];
		var paramElem = params.firstChild;
		while (!!paramElem){
			if ("step" === paramElem.id){
				ret.step = parseInt(paramElem.value);
			}
			else if ("count" === paramElem.id){
				ret.count = parseInt(paramElem.value);
			}
			else if ("delay" === paramElem.id){
				ret.delay = parseInt(paramElem.value);
			}
			paramElem = paramElem.nextSibling;
		}
		return ret;
	}, 
	position: function(elem){
		var ret = {type: "position"};
		var classes = elem.getElementsByClassName("script-action-option-position"); 
		var params = classes[0];
		var paramElem = params.firstChild;
		while (!!paramElem){
			if ("position" === paramElem.id){
				ret.position = parseInt(paramElem.value);
			}
			paramElem = paramElem.nextSibling;
		}
		return ret;
	}, 
	pause: function(elem){
		var ret = {type:"pause"};
		var classes = elem.getElementsByClassName("script-action-option-pause"); 
		var params = classes[0];
		var paramElem = params.firstChild;
		while (!!paramElem){
			if ("duration" === paramElem.id){
				ret.duration = parseInt(paramElem.value);
			}
			paramElem = paramElem.nextSibling;
		}
		return ret;
	}	
};
function getSerializerByType(type){
	var fn = scriptActionSerializers[type];
	if (!!fn){
		return {
			serialize: fn
		};
	}

	return {
		serialize: function(){}
	};
}



function onClickSetWidth(){
	var btnElem = document.getElementById("width-setter-button");
	var valElem = document.getElementById("width-setter-input");

	var classState = btnElem.classList;
	classState = [].map.call(classState, function(item){
		return item;
	});

	var classStateActive = classState.indexOf("active");
	if (-1 !== classStateActive){
		classState.splice(classStateActive, 1);
		btnElem.className = classState.join(" ");

		var newCols = valElem.value;
		newCols = parseInt(newCols);
		if (!isNaN(newCols) && (newCols > 0)) {
			if (COLS !== newCols){
				updateDisplayWidth(newCols);
			}
		}

		btnElem.value = "Set Columns ("+COLS+")";

		valElem.className = "col-setter col-setter-inactive";
	}
	else {
		classState.push("active");
		btnElem.className = classState.join(" ");
		btnElem.value = "Set Columns";

		valElem.value = COLS;
		valElem.className = "col-setter col-setter-active";
	}
}


function updateDisplayWidth(cols){
	var displayState = serializeDisplayStateToJSON();

	COLS = cols;

	loadDisplay(COLS, displayState);

}


function onClickClear(){
	loadDisplay(COLS);
}

var scriptActionId = 0;
function onAddScriptAction(type){
	var tmplt = document.getElementById("action-tmplt");
	var container = getScriptContainer();

	var actionElem = container.add();
	actionElem.style.height = "40px";
	var thisScriptActionId = ++scriptActionId;
	actionElem.setAttribute("data-action-item-id", thisScriptActionId);

	actionElem.innerHTML = tmplt.innerHTML;

	// TODO: Mutation observer...
	setTimeout(function(){
		var actionTypeElem = actionElem.getElementsByClassName("script-action-type")[0];
		actionTypeElem.setAttribute("data-action-item-id", thisScriptActionId);
		actionTypeElem.addEventListener("change", onScriptActionTypeChanged);

		var actionRemoveElem = actionElem.getElementsByClassName("script-action-remove")[0];
		actionRemoveElem.setAttribute("data-action-item-id", thisScriptActionId);
		actionRemoveElem.addEventListener("click", onScriptActionRemove);

		if (!!type){
			setTimeout(function(){
				for (var idx=0; idx != actionTypeElem.length; ++idx){
					if (type === actionTypeElem.options[idx].value){
						actionTypeElem.selectedIndex = idx;
						showScriptActionParams(actionTypeElem, type);
						break;
					}
				}
			}, 10)
		}
	}, 10);

	return actionElem;
}

function showScriptActionParams(elem, type){

	console.log("! = "+elem.getAttribute("data-action-item-id")+type);
	var optionElems = elem.parentNode.getElementsByClassName("script-action-option");
	for (var idx=0; idx != optionElems.length; ++idx){
		if (optionElems[idx].classList.contains("script-action-option-"+type)){
			optionElems[idx].style.display="inline-block";
		}
		else {
			optionElems[idx].style.display="none";
		}
	}
}

function setScriptActionParams(elem, info){
	var handler = scriptActionParamHandlers[info.type];
	handler(elem, info);
}

var scriptActionParamHandlers = {
	scroll: function(elem, info){
		var classes = elem.getElementsByClassName("script-action-option-scroll"); 
		var params = classes[0];
		var paramElem = params.firstChild;
		while (!!paramElem){
			if ("step" === paramElem.id){
				paramElem.value = info.step;
			}
			else if ("count" === paramElem.id){
				paramElem.value = info.count;
			}
			else if ("delay" === paramElem.id){
				paramElem.value = info.delay;
			}
			paramElem = paramElem.nextSibling;
		}
	},
	pause: function(elem, info){
		var classes = elem.getElementsByClassName("script-action-option-pause"); 
		var params = classes[0];
		var paramElem = params.firstChild;
		while (!!paramElem){
			if ("duration" === paramElem.id){
				paramElem.value = info.duration;
			}
			paramElem = paramElem.nextSibling;
		}
	},
	position: function(elem, info){
		var classes = elem.getElementsByClassName("script-action-option-position"); 
		var params = classes[0];
		var paramElem = params.firstChild;
		while (!!paramElem){
			if ("position" === paramElem.id){
				paramElem.value = info.position;
			}
			paramElem = paramElem.nextSibling;
		}
	}
}

function onScriptActionTypeChanged(evt){
	var type = evt.target.value;
	var elem = evt.target;

	showScriptActionParams(elem, type);
}

function onScriptActionRemove(evt){
	var actionId = evt.target.getAttribute("data-action-item-id");

	var scriptActionElems = getScriptContainer();

	var removeItem;
	for (var actionToRemove = 0; actionToRemove != scriptActionElems.length; ++actionToRemove){
		if (scriptActionElems.get(actionToRemove).getAttribute("data-action-item-id") === actionId){
			removeItem = actionToRemove;
			break;
		}
	}

	if ("number" === typeof removeItem){
		scriptActionElems.remove(removeItem);
	}

}


function getScriptContainer(){
	var container = document.getElementById("script-container");
	scrollContainer = container.firstChild;
	while (scrollContainer.id !== "scroll-container"){
		scrollContainer = scrollContainer.nextSibling;
//		scrollContainer = scrollContainer.nextElementSibling;
	}

	function getItem(i){
		return scrollContainer.children[i];
	}
	function addItem(pos){
		var elem = document.createElement("div");
		if ("undefined" === typeof pos){
			scrollContainer.appendChild(elem);
		}
		else {
//			scrollContainer.
		}
		return elem;
	}
	function removeItem(i){
		var elem = scrollContainer.children[i];
		scrollContainer.removeChild(elem);
	}
	
	return {
		get: getItem,
		add: addItem,
		remove: removeItem, 
	};
}


module.exports = {
	loader: loader,
	onClickDownload: onClickDownload,
	onClickClear: onClickClear,
	onClickSave: onClickSave,
	onClickSetWidth: onClickSetWidth,
	onAddScriptAction: onAddScriptAction

}

