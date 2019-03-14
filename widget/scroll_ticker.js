"use strict";

const TickerPosition = {
    HEADER: "header", 
    FOOTER: "footer"
};

const MIN_TICK_SPACING = 3;

let ScrollTickerConfig = {
    /** {TIckerPosition}  */
    position: TickerPosition.FOOTER,
    /** {number} */
    tickSpacing: MIN_TICK_SPACING,
    /** Display.PixelState */
    foregroundColor: 3,
    backgroundColor: 0
};

function updateDisplayWithTickerOverlay(display/*DisplayUtil.DS*/, config){

    if (!config){
        config = ScrollTickerConfig;
    }

    let position;
    if ("number" !== typeof config.position){
        position = TickerPosition.FOOTER;
    }
    else {
        position = config.position;
    }

    let tickSpacing;
    if ("number" !== typeof config.tickSpacing){
        tickSpacing = MIN_TICK_SPACING;
    }
    else {
        tickSpacing = config.tickSpacing;
        if (tickSpacing < MIN_TICK_SPACING){
            tickSpacing = MIN_TICK_SPACING;
        }
    }

    let nColor;
    if ("number" !== typeof config.foregroundColor){
        nColor = 3;
    }
    else {
        nColor = config.foregroundColor;
    }

    let nAltColor;
    if ("number" !== typeof config.backgroundColor){
        nAltColor = 0;
    }
    else {
        nAltColor = config.backgroundColor;
    }


    let expectedHeight = display.rows;

    let notSquare = display.columnData.some((col)=>{
        return (col.length !== expectedHeight);
    });
    if (notSquare) throw new Error("Not Square");

    let row = (TickerPosition.HEADER === position)?0:(expectedHeight-1);

    for (let i=0; i !== display.columnData.length; ++i){
        let col = display.columnData[i];
        col[row] = ((0 === (i%tickSpacing))?nColor:nAltColor);
    }    
}

module.exports = {
    Position: TickerPosition,
    updateDisplayWithTickerOverlay: updateDisplayWithTickerOverlay
}