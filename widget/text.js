"use strict";

let DisplayUtil = require("../display_util");

function convertColumns(cols){
    var ret = cols.map((col) =>{
        let colBits = col.split("");
        let colInt = colBits
            .map((bit, offset) => {
                return (bit === ' ')?0:(colBits.length-offset);
            })
            .reduce((acc,bitVal)=>{
                if (0 === bitVal) return acc;
                return acc+Math.pow(2, bitVal-1);
            }, 0);
        return colInt;
    });

    return ret;
}


/**
 * 
 * @param {string} name 
 * @param {string} filename 
 */
function loadFontFromFile(filename, tag){
    let font;
    if (-1 === filename.indexOf(".json")){
        filename += ".json";
    }
    if (0 !== filename.indexOf(".")){
        filename = "./font/"+filename;
    }

    try{
        font = require(filename);        
    }
    catch(err){
        console.log("Failed to load font JSON from file: "+filename+"; err: "+err.message);
    }

    if (!font){
        throw new Error("Invalid font");
    }
    else {
        return loadFont(font, tag);
    }
}

var fonts = {};
var fontId = 0;
function loadFont(font, tag){
    let name;
    let chardata = {};
    let retId = ++fontId;

    name = tag || font.name || "font-"+retId;

    fonts[name] = {
        id: retId,
        name: name,
        chars: { }
    }

    for (let c in font.chars){
        let fontChar = font.chars[c]; 
        let cols = convertColumns(fontChar.columns);
        chardata = {
            width: fontChar.width||(1+fontChar.columns.length),
            height: fontChar.height||fontChar.columns[0].length,
            columns: cols
        };
        fonts[name].chars[c] = chardata;
    }

    return retId;
}

function TextConfigDefault(){
    return {
        color: 3,
        background: 0,
        top: 0, 
        left: 0,
        fontId: 0
    };
}

const TextRenderConfig = {
    /** {DisplayUtil.Display.PixelState} */
    color: 0,
    /** {DisplayUtil.Display.PixelState} */
    background: 0,
    /** {number} */
    top: 0, 
    /** {number} */
    left: 0,
    /** {number} */
    fontId: 0
};

/**
 * 
 * @param {DisplayUtil.DS} display 
 * @param {string} string 
 * @param {TextRenderConfig} config 
 * 
 * @returns {number} width of rendered text
 */
function render(display, string, config){
    let settings = TextConfigDefault();
    
    if (!!config){

        if (config.color) settings.color = config.color;
        if (config.background) settings.background = config.background;
        if (config.top) settings.top = config.top;
        if (config.left) settings.left = config.left;
        if (config.fontId) settings.fontId = config.fontId;
    }

    if (!display) throw new Error("Need a valid display to draw to");

    let font;
    for (let f in fonts){
        if (settings.fontId === fonts[f].id){
            font = fonts[f];
            break;
        }
    }

    if (!font) throw new Error("Invalid font");

    let done = false;
    let charIdx = 0;
    let leftDelta = settings.left;
    do {
        try {
            let char = string[charIdx];
            leftDelta = renderChar(display, font, char, settings.top, leftDelta, settings.color, settings.background);
            if (leftDelta === display.columns){
                done = true;
            }
            else {
                ++charIdx;
                if (string.length === charIdx){
                    done = true;
                }
            }
        }
        catch(err){
            console.error("Ending due to error: "+err.message);
            done = true;
        }
    }
    while(!done);

    // Report the width of the written text.
    return leftDelta - settings.left;
}

function renderChar(display, font, char, top, left, foreground, background){

    let charData = font.chars[char];
    let srcColumn = 0;
    let targetColumn = left;
    let colIdx = 0;

    while ( (colIdx !== charData.columns.length) && (targetColumn < display.columns) ){
        //TODO: Mask
        //TODO: use top
        let columnData = charData.columns[srcColumn];
        let rowMask = 1;
        for (let rowIdx=0; rowIdx !== charData.height; ++rowIdx){
            if (display.rows > (rowIdx+top)) {
                let rowState = rowMask & columnData
                if (0 === rowState){
                    if (background !== DisplayUtil.Display.PixelState.ALPHA) { 
                        display.columnData[targetColumn][rowIdx+top] = background;
                    }
                }
                else {
                    if (foreground !== DisplayUtil.Display.PixelState.ALPHA){
                        display.columnData[targetColumn][rowIdx+top] = foreground;
                    }
                }
            }
            rowMask <<= 1;
        }


        ++colIdx;
        ++targetColumn;
        ++srcColumn;
    }

    //TODO don't return anything higher than display.columns
    return left + charData.width;
}




module.exports = {
    loadFont: loadFont,
    loadFontFromFile: loadFontFromFile,
    render: render
};