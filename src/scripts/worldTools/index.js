"use strict";

const WorldTool  = require('./WorldTool');
const DrawTool   = require('./DrawTool');
const SelectTool = require('./SelectTool');
const AlignTool  = require('./AlignTool');

function createToolData(type) {
  return {
    type:              type,
    classReference:    classMap[type],
    materialIconLabel: materialIconLabels[type]
  };
}

const classMap = {
  DRAW:   DrawTool,
  SELECT: SelectTool,
  ALIGN:  AlignTool
};

const materialIconLabels = {
  DRAW:   'create',
  SELECT: 'crop_free',
  ALIGN:  'apps'
};

const toolData = {
  DRAW:   createToolData('DRAW'),
  SELECT: createToolData('SELECT'),
  ALIGN:  createToolData('ALIGN'),
};

module.exports = {
  WorldTool:  WorldTool,
  DrawTool:   DrawTool,
  SelectTool: SelectTool,
  AlignTool:  AlignTool,
  
  toolData:   toolData
};
