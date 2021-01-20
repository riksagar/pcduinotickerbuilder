"use strict";

var Script = {
	Flags: {
		repeat: 0x01,
		wrap: 0x02
	}
};

let Display = {
    PixelState: {
        OFF: 0, 
        RED: 1, 
        GREEN: 2, 
        YELLOW: 3,
        ALPHA: 0x8000
    }
};


let ScriptActionBase = {
    /** {string} */
    type: ""
};

function makeScript(flags){
    return {
        flags: flags,
        count: 0, 
        items: []
    };
}

/**
 * 
 * @param {*} step 
 * @param {*} count 
 * @param {*} delay
 * 
 * @returns {ScriptActionBase} 
 */
function makeScriptScrollAction(step, count, delay){
    return {
        type: "scroll", 
        step: step, 
        count: count,
        delay: delay
    };
}

/**
 * 
 * @param {*} position
 * @returns {ScriptActionBase} 
 */
function makeScriptPositionAction(position){
    return {
        type: "position",
        position: position
    };
}

/**
 * 
 * @param {*} duration
 * @returns {ScriptActionBase} 
 */
function makeScriptPauseAction(duration){
    return {
        type: "pause", 
        duration: duration
    };
}


let SS = {

}
let SB = {
    /**
     * @returns {SB}
     */
    init: function(){},
    /**
     * @param {Script}
     * @returns {SB}
     */
    setScript: function(){},
    /**
     * @param {ScriptActionBase} action
     * @returns {SB}
     */
    addAction: function(){},
    /**
     * @param {SciptActionBase[]} actionList
     * @returns {SB}
     */
    addActions: function(){},

    /**
     * @returns {Number[]} 
     */
    build: function(){}
};

function scriptBuilderInit(){
    let script;
    let api = {
        setScript: function(s){
            script = s;
            return api;
        },
        addAction: function(action){
            if (!action || !action.type) throw new Error("Invalid action object");
            script.items.push(action);
            
            return api;
        },
        addActions: function(actionList){
            actionList.forEach(function(item){
                if (!item.type) throw new Error("Invalid script action object");
                script.items.push(item);
            });
            return api;        
        },
        build: function(){
            script.count = script.items.length;
            return script;
        }
    };
    return api;
}

/**
 * 
 * @param {Number} columns 
 * @param {Number} rows 
 * 
 * @returns {DS}
 */
function makeDisplay(columns, rows){
    return {
        columns: columns, 
        rows: rows, 
        columnData: []
    };
}

/**
 * 
 * @param {Display.PixelState[]} rows
 * @returns Display.PixelState[] 
 */
function makeDisplayColumn(rows/*...*/){
    let ret = [];
    let rowList;

    if (!rows) throw new Error ("Column info need rows");
    if (Array.isArray(rows)){
        rowList = rows;
    }
    else {
        rowList = arguments;
    }

    [].forEach.call(rowList, function(item){
        if ("number" !== typeof item) throw new Error("Row value must be a number");
        ret.push(item);
    });

    return ret;
}

let DS = {
    /** {Number} */
    columns: 0,
    /** {Number} */
    rows: 0,
    /** {Display.PixelState[]} */
    columnData: []
};

let DB  = {
    /**
     * @param {Display.PixelState[]} rows
     * @returns {DB}
     */
    addColumn: function(row){},
    /**
     * @param {Display.PixelState} color
     * @returns {DB}
     */
    addEmptyColumn: function(color){},
    /**
     * @param {Display.PixelState} row[]
     * @returns {DB}
     */
    setDisplay: function(){},
    /**
     * @returns {DS}
     */
    build: function(){}
};


/**
 * @return {DB}
 */
function displayBuilderInit(){

    let display;
    let activeColumn = 0;

    let api = {
        setDisplay: function(d){
            if (!d.columns || !d.rows) throw new Error("Invalid display object");
            
            display = d;
            if (!display.columnData || !Array.isArray(display.columnData)){
                display.columnData = [];
                for (let col=0; col !== display.columns; ++col){
                    let colTemp = [];
                    for (let row=0; row !== display.rows; ++row){
                        colTemp[row] = Display.PixelState.OFF;    
                    }
                    display.columnData[col] = colTemp;
                }
            }

            return api;
        },
        addColumn: function(column){
            if (column.length !== display.rows) throw new Error("Column has wrong number of rows"); 
            if (!display) throw new Error("Display object not set");

            display.columnData[activeColumn] = column;
            ++activeColumn;

            return api;
        },
        addEmptyColumn: function(color){
            if (!display || !display.rows) throw new Error("Display object not set");

            let column = [];
            for(let i=0; i !== display.rows; ++i){
                column.push(color);
            }
            return api.addColumn(column);
        },
        build: function(){
            return display;
        }
    };

    return api;
}


let ScriptBuilder = {
    init: scriptBuilderInit,
    makeScript: makeScript,
    makeScriptScrollAction: makeScriptScrollAction, 
    makeScriptPositionAction: makeScriptPositionAction,
    makeScriptPauseAction: makeScriptPauseAction
};

let DisplayBuilder = {
    init: displayBuilderInit,
    makeDisplay: makeDisplay,
    makeDisplayColumn: makeDisplayColumn
};


module.exports = {
    Script: Script,
    Display: Display,
    ScriptBuilder: ScriptBuilder,
    DisplayBuilder: DisplayBuilder
};