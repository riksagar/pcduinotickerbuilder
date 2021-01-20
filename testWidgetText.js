"use strict";


let FS = require("fs");

let SdffBuilder = require("./sdff_builder");
let DisplayUtil = require("./display_util");

let TextWidget = require("./widget/text");

function test1(){
    const DISPLAY_COLS = 30;
    const DISPLAY_ROWS = 10;
    let displayBuilder = DisplayUtil.DisplayBuilder
        .init()
        .setDisplay(DisplayUtil.DisplayBuilder.makeDisplay(DISPLAY_COLS, DISPLAY_ROWS));

    for (let i=0; DISPLAY_COLS !== i; ++i){
        displayBuilder.addEmptyColumn(DisplayUtil.Display.PixelState.OFF);
    }

    let display0 = displayBuilder.build();

    let fontId = TextWidget.loadFontFromFile("geek");
    TextWidget.render(display0, "HELLO", {
        color: DisplayUtil.Display.PixelState.GREEN,
        top: 0,
        left: 0,
        fontId: fontId
    });

    TextWidget.render(display0, "WORLD", {
        color: DisplayUtil.Display.PixelState.YELLOW, 
        top: 5, 
        left: 3,
        fontId: fontId
    });



    let sdffDisplay = SdffBuilder.serializeDisplay(display0);
    console.log(sdffDisplay);

    let sdffDisplayBuffer = Buffer.from(sdffDisplay);


    let script = DisplayUtil.ScriptBuilder
        .init()
        .setScript(DisplayUtil.ScriptBuilder.makeScript(DisplayUtil.Script.Flags.repeat))
        .addAction(DisplayUtil.ScriptBuilder.makeScriptPositionAction(0))
    //    .addAction(DisplayUtil.ScriptBuilder.makeScriptPauseAction(1000))
        .addAction(DisplayUtil.ScriptBuilder.makeScriptScrollAction(1, 5+DISPLAY_COLS, 150))
        .build();

    let sdffScript = SdffBuilder.serializeScript(script);
    let sdffScriptBuffer = Buffer.from(sdffScript);



    let hFile = FS.openSync("/tmp/display_helloworld-geek", "w");
    FS.writeSync(hFile, sdffDisplayBuffer, 0, sdffDisplayBuffer.byteLength);
    FS.writeSync(hFile, sdffScriptBuffer, 0, sdffScriptBuffer.byteLength);
    FS.closeSync(hFile);
}

function test2(){
    const DISPLAY_COLS = 40;
    const DISPLAY_ROWS = 10;

    let displayBuilder = DisplayUtil.DisplayBuilder
        .init()
        .setDisplay(DisplayUtil.DisplayBuilder.makeDisplay(DISPLAY_COLS, DISPLAY_ROWS));

    for (let i=0; DISPLAY_COLS !== i; ++i){
        displayBuilder.addEmptyColumn(DisplayUtil.Display.PixelState.OFF);
    }

    let displayWelcome = displayBuilder.build();

    let fontId = TextWidget.loadFontFromFile("narrow");
    TextWidget.render(displayWelcome, "WELCOME TO", {
        color: DisplayUtil.Display.PixelState.GREEN,
        //background: DisplayUtil.Display.PixelState.YELLOW,
        top: 0,
        left: 0,
        fontId: fontId
    });

    TextWidget.render(displayWelcome, "THE MACHINE", {
        color: DisplayUtil.Display.PixelState.RED, 
        //background: DisplayUtil.Display.PixelState.YELLOW,
        top: 5, 
        left: 3,
        fontId: fontId
    });



    let sdffDisplay = SdffBuilder.serializeDisplay(displayWelcome);
    console.log(sdffDisplay);

    let sdffDisplayBuffer = Buffer.from(sdffDisplay);


    let script = DisplayUtil.ScriptBuilder
        .init()
        .setScript(DisplayUtil.ScriptBuilder.makeScript(DisplayUtil.Script.Flags.repeat))
        .addAction(DisplayUtil.ScriptBuilder.makeScriptPositionAction(0))
    //    .addAction(DisplayUtil.ScriptBuilder.makeScriptPauseAction(1000))
        .addAction(DisplayUtil.ScriptBuilder.makeScriptScrollAction(1, 3+DISPLAY_COLS, 200))
        .build();

    let sdffScript = SdffBuilder.serializeScript(script);
    let sdffScriptBuffer = Buffer.from(sdffScript);



    let hFile = FS.openSync("/tmp/display_welcome-narrow", "w");
    FS.writeSync(hFile, sdffDisplayBuffer, 0, sdffDisplayBuffer.byteLength);
    FS.writeSync(hFile, sdffScriptBuffer, 0, sdffScriptBuffer.byteLength);
    FS.closeSync(hFile);
}

test1();
test2();

