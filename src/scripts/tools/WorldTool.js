"use strict";

const Tool           = require('./Tool');
const {Action}       = require('../action'); 
const subwindowViews = require('../subwindowViews');

class WorldTool extends Tool {
  constructor() {
    super('terrain', new subwindowViews.WorldView());
    
    this.register(
      Action.Type.MAIN_TOOL_SELECT,
      (action) => this.subwindowView.onActionMainToolSelect(action)
    );
    this.register(
      Action.Type.ENTITY_SELECT,
      (action) => this.subwindowView.onActionEntitySelect(action)
    );
    this.register(
      Action.Type.LAYER_SELECT,
      (action) => this.subwindowView.onActionLayerSelect(action)
    );
    this.register(
      Action.Type.LAYER_ADD,
      (action) => this.subwindowView.onActionLayerAdd(action)
    );
    this.register(
      Action.Type.LAYER_REMOVE,
      (action) => this.subwindowView.onActionLayerRemove(action)
    );
    this.register(
      Action.Type.WORLD_ENTITY_ADD,
      (action) => this.subwindowView.onActionWorldEntityAdd(action)
    );
    this.register(
      Action.Type.WORLD_ENTITY_REMOVE,
      (action) => this.subwindowView.onActionWorldEntityRemove(action)
    );
    this.register(
      Action.Type.WORLD_SELECTION_MOVE,
      (action) => this.subwindowView.onActionWorldSelectionMove(action)
    );
  }
  
 /* parseAction(action) {
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
      
    } else if (action.direction === Action.Direction.REDO) {
      
    }
  }*/
}

module.exports = WorldTool;