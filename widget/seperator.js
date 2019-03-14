"use strict";

const SeperatorStyle = {
    SOLID: 0, 
    DASHED: 1,
    DOTTED: 2,
    SCROLLBAR: 3
};

const COLUMN_HEIGHT = 10;


let SeperatorConfigSolid = {
    /**
     * {Display.PixelState}
     */
    foregroundColor: 0
};

let SeperatorConfigDotted = {
    /**
     * {Display.PixelState}
     */
    foregroundColor: 0, 
    /**
     * {Display.PixelState}
     */
    backgroundColor: 0
};

let SeperatorConfigDashed = {
    /**
     * {Display.PixelState}
     */
    foregroundColor: 0, 
    /**
     * {Display.PixelState}
     */
    backgroundColor: 0
};

let SeperatorConfigScrollbar = {
    /**
     * {Display.PixelState}
     */
    foregroundColor: 0, 
    /**
     * {Display.PixelState}
     */
    thumbColor: 0,
    /**
     * {number}
     */
    position: 0
};

/**
 * 
 * @param {SeperatorStyle} style 
 * @param {SeperatorConfigSolid|SeperatorConfigDotted|SeperatorConfigDashed|SeperatorConfigScrollbar} config 
 */
function makeSeperator(style, config){
    let ret;
    let nColor = 3;
    let nThumbColor = 0;
    let scrollPosition = 0;

    if (!config) config = {};


    if ("number" !== typeof style){
        ret = makeSepSolid(nColor, COLUMN_HEIGHT);
    }
    else {
        switch(style){
            case SeperatorStyle.SOLID:
            default:
                if ("number" === typeof config.foregroundColor){
                    nColor = config.foregroundColor;
                }
                ret = makeSepSolid(nColor, COLUMN_HEIGHT);
                break;
            case SeperatorStyle.DOTTED:
                if ("number" === typeof config.foregroundColor){
                    nColor = config.foregroundColor;
                }
                if ("number" === typeof config.backgroundColor){
                    nThumbColor = config.backgroundColor;
                }
                ret = makeSepDotted(nColor, nThumbColor, COLUMN_HEIGHT);
                break;
            case SeperatorStyle.DASHED:
                if ("number" === typeof config.foregroundColor){
                    nColor = config.foregroundColor;
                }
                if ("number" === typeof config.backgroundColor){
                    nThumbColor = config.backgroundColor;
                }
                ret = makeSepDashed(nColor, nThumbColor, COLUMN_HEIGHT);
                break;
            case SeperatorStyle.SCROLLBAR:
                if ("number" === typeof config.foregroundColor){
                    nColor = config.foregroundColor;
                }
                if ("number" === typeof config.backgroundColor){
                    nThumbColor = config.backgroundColor;
                }
                if ("number" === typeof config.position){
                    scrollPosition = config.position;
                }
                ret = makeSepScroll(nColor, nThumbColor, scrollPosition, COLUMN_HEIGHT);
                break;
        }
    }

    return ret;
}

function makeSepSolid(color, height){
    let ret = [];

    for (let i=0; i !== height; ++i){
        ret.push(color);
    }

    return ret;
}

function makeSepDotted(color, altColor, height){
    let ret = [];

    for (let i=0; i !== height; ++i){
        ret.push((0 === (i&1))?color:altColor);
    }

    return ret;
}

function makeSepDashed(color, altColor, height){
    let ret = [];

    for (let i=0; i !== height; ++i){
        let n = i%3;
        ret.push((2 === n)?altColor:color);
    }

    return ret;
}

function makeSepScroll(color, thumbColor, position, height){
    let ret = [];
    for (let i=0; i !== height; ++i){
        ret.push(color);
    }

    let thumbTop;
    let thumbCount;
    if (position >= (height-2)/2) {
        thumbTop = 1;
        thumbCount = height-2;
    }
    else {
        thumbTop = 1 + position*2;
        thumbCount = 2;
    }

    for (let i = thumbTop,end=thumbTop+thumbCount; i != end; ++i ){
        ret[i] = thumbColor;
    }

    return ret;
}


module.exports = {
    Style: SeperatorStyle, 
    SeperatorConfigSolid: SeperatorConfigSolid,
    SeperatorConfigDotted: SeperatorConfigDotted,
    SeperatorConfigDashed: SeperatorConfigDashed,
    SeperatorConfigScrollbar: SeperatorConfigScrollbar,
    makeSeperator: makeSeperator
};