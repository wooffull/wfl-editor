"use strict";

const Tool       = require('./Tool');
const DrawTool   = require('./DrawTool');
const SelectTool = require('./SelectTool');

const idMap = {
    DRAW:   "#tool-draw",
    SELECT: "#tool-select"
};

const toolMap = {
    "#tool-draw":   DrawTool,
    "#tool-select": SelectTool
};

module.exports = {
    Tool:       Tool,
    DrawTool:   DrawTool,
    SelectTool: SelectTool,

    ids:        idMap,
    list:       toolMap
};
