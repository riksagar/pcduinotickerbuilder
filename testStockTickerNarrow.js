"use strict";


let FS = require("fs");

let SdffBuilder = require("./sdff_builder");
let DisplayUtil = require("./display_util");

let TextWidget = require("./widget/text");


function test1(){
    const DISPLAY_COLS = 60;
    const DISPLAY_ROWS = 10;
    const TICKER_ROW_STAGGER = 0.5;
    const TICKER_INTRA_PAD = 4;

    let displayBuilder = DisplayUtil.DisplayBuilder
        .init()
        .setDisplay(DisplayUtil.DisplayBuilder.makeDisplay(DISPLAY_COLS, DISPLAY_ROWS));

    for (let i=0; DISPLAY_COLS !== i; ++i){
        displayBuilder.addEmptyColumn(DisplayUtil.Display.PixelState.OFF);
    }

    let displayWelcome = displayBuilder.build();

    let fontId = TextWidget.loadFontFromFile("narrow");
    let widthRendered = TextWidget.render(displayWelcome, "SPY", {
        color: DisplayUtil.Display.PixelState.GREEN,
        //background: DisplayUtil.Display.PixelState.YELLOW,
        top: 0,
        left: 0,
        fontId: fontId
    });

    let row2StartOffset = Math.floor(widthRendered*TICKER_ROW_STAGGER);
    let nextTickerOffset = TICKER_INTRA_PAD+widthRendered;
    widthRendered = TextWidget.render(displayWelcome, "QQQ", {
        color: DisplayUtil.Display.PixelState.RED,
        //background: DisplayUtil.Display.PixelState.YELLOW,
        top: 0,
        left: nextTickerOffset,
        fontId: fontId
    });

    nextTickerOffset += TICKER_INTRA_PAD+widthRendered;
    widthRendered = TextWidget.render(displayWelcome, "IYY", {
        color: DisplayUtil.Display.PixelState.RED,
        //background: DisplayUtil.Display.PixelState.YELLOW,
        top: 0,
        left: nextTickerOffset,
        fontId: fontId
    });

    nextTickerOffset = row2StartOffset;
    widthRendered = TextWidget.render(displayWelcome, "TSLA", {
        color: DisplayUtil.Display.PixelState.RED, 
        //background: DisplayUtil.Display.PixelState.YELLOW,
        top: 5, 
        left: nextTickerOffset,
        fontId: fontId
    });

    nextTickerOffset += TICKER_INTRA_PAD+widthRendered;
    TextWidget.render(displayWelcome, "WMT", {
        color: DisplayUtil.Display.PixelState.GREEN, 
        //background: DisplayUtil.Display.PixelState.YELLOW,
        top: 5, 
        left: nextTickerOffset,
        fontId: fontId
    });

    nextTickerOffset += TICKER_INTRA_PAD+widthRendered;
    TextWidget.render(displayWelcome, "HPQ", {
        color: DisplayUtil.Display.PixelState.GREEN, 
        //background: DisplayUtil.Display.PixelState.YELLOW,
        top: 5, 
        left: nextTickerOffset,
        fontId: fontId
    });




    let sdffDisplay = SdffBuilder.serializeDisplay(displayWelcome);
    console.log(sdffDisplay);

    let sdffDisplayBuffer = Buffer.from(sdffDisplay);


    let script = DisplayUtil.ScriptBuilder
        .init()
        .setScript(DisplayUtil.ScriptBuilder.makeScript(DisplayUtil.Script.Flags.repeat))
        .addAction(DisplayUtil.ScriptBuilder.makeScriptPositionAction(0))
        .addAction(DisplayUtil.ScriptBuilder.makeScriptPauseAction(666))
        .addAction(DisplayUtil.ScriptBuilder.makeScriptScrollAction(1, 3+DISPLAY_COLS, 133))
        .build();

    let sdffScript = SdffBuilder.serializeScript(script);
    let sdffScriptBuffer = Buffer.from(sdffScript);



    let hFile = FS.openSync("/tmp/display_stock-test-narrow-1", "w");
    FS.writeSync(hFile, sdffDisplayBuffer, 0, sdffDisplayBuffer.byteLength);
    FS.writeSync(hFile, sdffScriptBuffer, 0, sdffScriptBuffer.byteLength);
    FS.closeSync(hFile);
}

test1();
//test2();

