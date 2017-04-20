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
    this.register(
      Action.Type.ENTITY_REMOVE,
      (action) => this.subwindowView.onActionEntityRemove(action)
    );
  }
  
  projectUpdate(project) {
    // If no level data, exit early
    if (!project.level) return;
      
    let {gameObjects} = project.level;
    let scene         = this.subwindowView.worldEditorScene;

    // If no game object data, exit early
    if (!gameObjects) return;
    
    for (const obj of gameObjects) {
      let {entity, x, y, rotation, layerId} = obj;
      let addedObj = scene.addEntity(entity, layerId, false);
      addedObj.position.x = x;
      addedObj.position.y = y;
      addedObj.setRotation(rotation);
    }
  }
  
  getData() {
    let scene        = this.subwindowView.worldEditorScene;
    let gameObjects  = scene.getGameObjects();
    let data         = {
      gameObjects: []
    };
    
    for (const obj of gameObjects) {
      let objData = {
        layer:    obj.layer,
        entity:   obj.customData.entity,
        x:        obj.position.x,
        y:        obj.position.y,
        rotation: obj.getRotation()
      };
      
      data.gameObjects.push(objData);
    }
    
    return data;
  }
}

module.exports = WorldTool;