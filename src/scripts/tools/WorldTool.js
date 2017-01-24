"use strict";

const Tool           = require('./Tool');
const Action         = require('./Action'); 
const subwindowViews = require('../subwindowViews');

class WorldTool extends Tool {
  constructor() {
    super('terrain', new subwindowViews.WorldView());
  }
  
  parseAction(action) {
    let scene = this.subwindowView.worldEditorScene;
    let data  = action.data;

    if (action.direction === Action.Direction.DEFAULT) {
      switch (action.type) {
        case Action.Type.MAIN_TOOL_SELECT:
          scene.tool = new data.classReference(scene);
          break;

        case Action.Type.ENTITY_SELECT:
          scene.curEntity = data;
          break;

        case Action.Type.LAYER_SELECT:
          scene.layerId = data;
          break;

        case Action.Type.LAYER_ADD:
          scene.addLayer(data);
          break;

        case Action.Type.LAYER_REMOVE:
          scene.removeLayer(data);
          break;
      }
      
    } else if (action.direction === Action.Direction.UNDO) {
      switch (action.type) {
        case Action.Type.LAYER_ADD:
          // TODO: Add entities back to the layer as well
          scene.addLayer(data);
          break;
      }
      
    } else if (action.direction === Action.Direction.REDO) {
      
    }
  }
}

module.exports = WorldTool;