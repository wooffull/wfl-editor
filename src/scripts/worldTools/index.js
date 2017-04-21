"use strict";

const WorldTool  = require('./WorldTool');
const DrawTool   = require('./DrawTool');
const SelectTool = require('./SelectTool');
const AlignTool  = require('./AlignTool');
const RotateTool  = require('./RotateTool');

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
  ALIGN:  AlignTool,
  ROTATE: RotateTool,
};

const materialIconLabels = {
  DRAW:   'create',
  SELECT: 'crop_free',
  ALIGN:  'apps',
  ROTATE: 'rotate_left',
};

const toolData = {
  DRAW:   createToolData('DRAW'),
  SELECT: createToolData('SELECT'),
  ALIGN:  createToolData('ALIGN'),
  ROTATE: createToolData('ROTATE'),
};

module.exports = {
  WorldTool:  WorldTool,
  DrawTool:   DrawTool,
  SelectTool: SelectTool,
  AlignTool:  AlignTool,
  RotateTool: RotateTool,
  
  toolData:   toolData
};
