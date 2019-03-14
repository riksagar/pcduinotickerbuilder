"use strict";

let FS = require("fs");

let SdffBuilder = require("./sdff_builder");
let DisplayUtil = require("./display_util");
let Seperator = require("./widget/seperator");


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

let sepSolid = Seperator.makeSeperator(Seperator.Style.SOLID);
let sepSolidGreen = Seperator.makeSeperator(Seperator.Style.SOLID, {
    foregroundColor: DisplayUtil.Display.PixelState.GREEN
});
let sepDashed = Seperator.makeSeperator(Seperator.Style.DASHED);
let sepDashedNasty = Seperator.makeSeperator(Seperator.Style.DASHED, {
    foregroundColor: DisplayUtil.Display.PixelState.GREEN,
    backgroundColor: DisplayUtil.Display.PixelState.RED
});
let sepDotted = Seperator.makeSeperator(Seperator.Style.DOTTED);
let sepProgress0 = Seperator.makeSeperator(Seperator.Style.SCROLLBAR, {
    position: 0
});
let sepProgress1 = Seperator.makeSeperator(Seperator.Style.SCROLLBAR, {
    position: 1
});
let sepProgress2 = Seperator.makeSeperator(Seperator.Style.SCROLLBAR, {
    position: 2
});
let sepProgress3 = Seperator.makeSeperator(Seperator.Style.SCROLLBAR, {
    position: 3
});
let sepProgressN = Seperator.makeSeperator(Seperator.Style.SCROLLBAR, {
    position: 6
});






let display = DisplayUtil.DisplayBuilder
    .init()
    .setDisplay(DisplayUtil.DisplayBuilder.makeDisplay(26,10))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(sepSolid))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(sepSolidGreen))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(sepDashed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(sepDashedNasty))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(sepDotted))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(sepProgress0)) //5
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(sepProgress1)) //9
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowGreen))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowGreen))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(sepProgress2)) //14
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(sepProgress3)) //18
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowRed))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(sepProgressN)) //22
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowGreen))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowGreen))
    .addColumn(DisplayUtil.DisplayBuilder.makeDisplayColumn(rowGreen))
    .build();
        

let sdffDisplay = SdffBuilder.serializeDisplay(display);
console.log(sdffDisplay);

let sdffDisplayBuffer = Buffer.from(sdffDisplay);

let script = DisplayUtil.ScriptBuilder
    .init()
    .setScript(DisplayUtil.ScriptBuilder.makeScript(DisplayUtil.Script.Flags.repeat))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptPositionAction(0))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptPauseAction(1000))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptScrollAction(1, 5, 200))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptPauseAction(2000))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptScrollAction(1, 4, 200))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptPauseAction(2000))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptScrollAction(1, 5, 200))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptPauseAction(2000))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptScrollAction(1, 4, 200))
    .addAction(DisplayUtil.ScriptBuilder.makeScriptPauseAction(2000))
    .build();

let sdffScript = SdffBuilder.serializeScript(script);
let sdffScriptBuffer = Buffer.from(sdffScript);



let hFile = FS.openSync("/tmp/display", "w");
FS.writeSync(hFile, sdffDisplayBuffer, 0, sdffDisplayBuffer.byteLength);
FS.writeSync(hFile, sdffScriptBuffer, 0, sdffScriptBuffer.byteLength);
FS.closeSync(hFile);
