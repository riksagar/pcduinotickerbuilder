"use strict";

let FS = require("fs");

let SdffBuilder = require("./sdff_builder");
let DisplayUtil = require("./display_util");


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


let display = DisplayUtil.DisplayBuilder
    .init()
    .setDisplay(DisplayUtil.DisplayBuilder.makeDisplay(6,10))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowYellow))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowOff))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowGreen))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowOff))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowYellow))
    .build();
        

let sdffDisplay = SdffBuilder.serializeDisplay(display);
console.log(sdffDisplay);

let sdffDisplayBuffer = Buffer.from(sdffDisplay);

let script = DisplayUtil.ScriptBuilder
    .init()
    .setScript(DisplayUtil.ScriptBuilder.makeScript(DisplayUtil.Script.Flags.repeat))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptPositionAction(0))
    .build();

let sdffScript = SdffBuilder.serializeScript(script);
let sdffScriptBuffer = Buffer.from(sdffScript);



let hFile = FS.openSync("/tmp/display", "w");
FS.writeSync(hFile, sdffDisplayBuffer, 0, sdffDisplayBuffer.byteLength);
FS.writeSync(hFile, sdffScriptBuffer, 0, sdffScriptBuffer.byteLength);
FS.closeSync(hFile);
