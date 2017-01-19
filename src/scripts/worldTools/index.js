"use strict";

const WorldTool  = require('./WorldTool');
const DrawTool   = require('./DrawTool');
const SelectTool = require('./SelectTool');

function createToolData(type) {
  return {
    type:              type,
    classReference:    classMap[type],
    materialIconLabel: materialIconLabels[type]
  };
};

const classMap = {
  DRAW:   DrawTool,
  SELECT: SelectTool
};

const materialIconLabels = {
  DRAW:   'create',
  SELECT: 'crop_free'
};

const toolData = {
  DRAW:   createToolData('DRAW'),
  SELECT: createToolData('SELECT')
};

module.exports = {
  WorldTool:  WorldTool,
  DrawTool:   DrawTool,
  SelectTool: SelectTool,
  
  toolData:   toolData
};
