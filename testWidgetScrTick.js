"use strict";

let FS = require("fs");

let SdffBuilder = require("./sdff_builder");
let DisplayUtil = require("./display_util");
let ScrollTicker = require("./widget/scroll_ticker");


let rowOff = [];
let rowRed = [];
let rowGreen = [];
let rowYellow = [];
for(let i=10; i--;){
    rowOff.push(DisplayUtil.Display.PixelState.OFF);
    rowRed.push(DisplayUtil.Display.PixelState.RED);
    rowGreen.push(DisplayUtil.Display.PixelState.GREEN);
    rowYellow.push(DisplayUtil.Display.PixelState.YELLOW);
}


let displayBuilder = DisplayUtil.DisplayBuilder
    .init()
    .setDisplay(DisplayUtil.DisplayBuilder.makeDisplay(14, rowRed.length));

for (let i=0; 14 !== i; ++i ){
    displayBuilder.addColumn(rowRed.map((r)=>r));
}

let display0 = displayBuilder.build();

ScrollTicker.updateDisplayWithTickerOverlay(display0, ScrollTicker.Position.FOOTER);


displayBuilder = DisplayUtil.DisplayBuilder
    .init()
    .setDisplay(DisplayUtil.DisplayBuilder.makeDisplay(7, rowGreen.length));

for (let i=0; 7 !== i; ++i ){
    displayBuilder.addColumn(rowYellow.map((r)=>r));
}

let display1 = displayBuilder.build();

ScrollTicker.updateDisplayWithTickerOverlay(display1, {
    foregroundColor: DisplayUtil.Display.PixelState.GREEN,
    backgroundColor: DisplayUtil.Display.PixelState.RED,
    tickSpacing: 4
});

display0.columnData.push.apply(display0.columnData, display1.columnData);
display0.columns += display1.columns;

let sdffDisplay = SdffBuilder.serializeDisplay(display0);
console.log(sdffDisplay);

let sdffDisplayBuffer = Buffer.from(sdffDisplay);




let script = DisplayUtil.ScriptBuilder
    .init()
    .setScript(DisplayUtil.ScriptBuilder.makeScript(DisplayUtil.Script.Flags.repeat))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptPositionAction(0))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptPauseAction(1000))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptScrollAction(1, 30, 100))
    .build();

let sdffScript = SdffBuilder.serializeScript(script);
let sdffScriptBuffer = Buffer.from(sdffScript);



let hFile = FS.openSync("/tmp/display", "w");
FS.writeSync(hFile, sdffDisplayBuffer, 0, sdffDisplayBuffer.byteLength);
FS.writeSync(hFile, sdffScriptBuffer, 0, sdffScriptBuffer.byteLength);
FS.closeSync(hFile);
