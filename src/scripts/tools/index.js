"use strict";

var Tool       = require('./Tool');
var DrawTool   = require('./DrawTool');
var SelectTool = require('./SelectTool');

var idMap = {
    DRAW:   "#tool-draw",
    SELECT: "#tool-select"
};

var toolMap = {
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
