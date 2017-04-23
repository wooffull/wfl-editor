"use strict";

const Tool             = require('./Tool');
const {Action}         = require('../action'); 
const {remote}         = require('electron');
const {globalShortcut} = remote;
const subwindowViews   = require('../subwindowViews');

class WorldTool extends Tool {
  constructor() {
    super('terrain', new subwindowViews.WorldView());
    
    // (Shortcut) Ctrl+A: Select all entities
    // TODO: Select only entities for layers that are not locked
    globalShortcut.register("CommandOrControl+A", () => {
      this.selectAllEntities();
    });
    
    // (Shortcut) Delete: Removes all currently selected game objects
    globalShortcut.register("Delete", () => {
      this.removeSelection();
    });
    
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
      Action.Type.WORLD_ENTITY_ADD_BATCH,
      (action) => this.subwindowView.onActionWorldEntityAddBatch(action)
    );
    this.register(
      Action.Type.WORLD_ENTITY_REMOVE_BATCH,
      (action) => this.subwindowView.onActionWorldEntityRemoveBatch(action)
    );
    this.register(
      Action.Type.WORLD_SELECTION_MOVE,
      (action) => this.subwindowView.onActionWorldSelectionMove(action)
    );
    this.register(
      Action.Type.WORLD_SELECTION_ALIGN,
      (action) => this.subwindowView.onActionWorldSelectionAlign(action)
    );
    this.register(
      Action.Type.WORLD_SELECTION_ROTATE,
      (action) => this.subwindowView.onActionWorldSelectionRotate(action)
    );
    this.register(
      Action.Type.ENTITY_REMOVE,
      (action) => this.subwindowView.onActionEntityRemove(action)
    );
  }
  
  removeSelection() {
    let scene        = this.subwindowView.worldEditorScene;
    let selector     = scene.selector;
    let gameObjects  = selector.selectedObjects;
    
    if (gameObjects.length > 1) {
      scene.scheduleRemoveGameObjectBatch(gameObjects);
    } else if (gameObjects.length === 1) {
      scene.scheduleRemoveGameObject(gameObjects[0], gameObjects[0].layer);
    }
    
    selector.clear();
  }
  
  selectAllEntities() {
    let scene        = this.subwindowView.worldEditorScene;
    let selector     = scene.selector;
    let gameObjects  = scene.getGameObjects();
    
    for (const obj of gameObjects) {
      selector.add(obj);
    }
  }
  
  onProjectUpdate(project) {
    // If no level data, exit early
    if (!project.level) return;
      
    let {gameObjects} = project.level;
    let scene         = this.subwindowView.worldEditorScene;

    // If no game object data, exit early
    if (!gameObjects) return;
    
    for (const obj of gameObjects) {
      let {entity, x, y, rotation, layer, props} = obj;
      let addedObj = scene.addEntity(entity, layer, false);
      addedObj.position.x = x;
      addedObj.position.y = y;
      addedObj.setRotation(rotation);
      addedObj.customData.props = props
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
        rotation: obj.getRotation(),
        props:    obj.customData.props
      };
      
      data.gameObjects.push(objData);
    }
    
    return data;
  }
}

module.exports = WorldTool;