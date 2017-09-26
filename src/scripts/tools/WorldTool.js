"use strict";

const Tool             = require('./Tool');
const {Action}         = require('../action'); 
const behaviors        = require('../behaviors');
const {remote}         = require('electron');
const {globalShortcut} = remote;
const subwindowViews   = require('../subwindowViews');

class WorldTool extends Tool {
  constructor() {
    super('terrain', new subwindowViews.WorldView());
    
    this._entitiesLoaded = null;
    this._filesLoaded    = null;
    
    this._resetFlags();
    
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
      Action.Type.PROJECT_TILE_WIDTH_CHANGE,
      (action) => this.subwindowView.onActionTileWidthChange(action)
    );
    this.register(
      Action.Type.PROJECT_TILE_HEIGHT_CHANGE,
      (action) => this.subwindowView.onActionTileHeightChange(action)
    );
    this.register(
      Action.Type.FILE_REFRESH,
      (action) => this.onActionFileRefresh(action)
    );
    this.register(
      Action.Type.ENTITY_PROJECT_LOAD_COMPLETE,
      (action) => this.onActionEntityProjectLoadComplete(action)
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
      Action.Type.LAYER_LOCK,
      (action) => this.subwindowView.onActionLayerLock(action)
    );
    this.register(
      Action.Type.LAYER_UNLOCK,
      (action) => this.subwindowView.onActionLayerUnlock(action)
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
    let scene          = this.subwindowView.worldEditorScene;
    let leftMouseState = scene.mouse.getState(1);
    
    if (!leftMouseState.dragging) {
      let selector     = scene.selector;
      let gameObjects  = selector.selectedObjects;

      if (gameObjects.length > 1) {
        scene.scheduleRemoveGameObjectBatch(gameObjects);
      } else if (gameObjects.length === 1) {
        scene.scheduleRemoveGameObject(gameObjects[0], gameObjects[0].layer);
      }

      selector.clear();
    }
  }
  
  selectAllEntities() {
    let scene        = this.subwindowView.worldEditorScene;
    let selector     = scene.selector;
    let gameObjects  = scene.getGameObjects();
    
    for (const obj of gameObjects) {
      selector.add(obj);
    }
  }
  
  onActionFileRefresh(action) {
    this._filesLoaded = true;
    this._onLoadComplete();
  }
  
  onActionEntityProjectLoadComplete(action) {
    let {project} = action.data;
    
    if (project.level) {
      let {gameObjects, tileSize} = project.level;
      let scene         = this.subwindowView.worldEditorScene;

      // If no game object data, exit early
      if (gameObjects) {
        for (const obj of gameObjects) {
          let {entity, x, y, rotation, layer, physics, behaviors} = obj;
          let addedObj = scene.addEntity(entity, layer, false);
          addedObj.position.x = x;
          addedObj.position.y = y;
          addedObj.rotate(rotation);
          addedObj.customData.physics = physics;

          if (behaviors) {
            addedObj.customData.behaviors = behaviors;
          }
        }
      }
    }
    
    this._entitiesLoaded = true;
    this._onLoadComplete();
  }
  
  onProjectUpdate(project) {
    this._resetFlags();
  }
  
  getData() {
    let scene       = this.subwindowView.worldEditorScene;
    let gameObjects = scene.getGameObjects();
    let data        = {
      tileSize:    scene.tileSize,
      gameObjects: []
    };
    
    for (const obj of gameObjects) {
      // Empty behaviors should not be saved
      let behaviors = obj.customData.behaviors;
      if (behaviors && Object.keys(behaviors).length === 0) {
        behaviors = undefined;
      }
      
      let objData = {
        layer:     obj.layer,
        entity:    obj.customData.entity,
        x:         obj.position.x,
        y:         obj.position.y,
        rotation:  obj.rotation,
        physics:   obj.customData.physics,
        behaviors: behaviors
      };
      
      data.gameObjects.push(objData);
    }
    
    return data;
  }
  
  _onAllAssetsLoaded() {
    this._updateBehaviors();
  }
  
  _updateBehaviors() {
    let scene           = this.subwindowView.worldEditorScene;
    let gameObjects     = scene.getGameObjects();
    let loadedBehaviors = behaviors.getLoadedBehaviors();
    
    for (const obj of gameObjects) {
      let behaviors    = obj.customData.behaviors || {};
      let behaviorKeys = Object.keys(behaviors);
      
      for (const key of behaviorKeys) {
        // TODO: Update refreshed behaviors with more sophistication.
        if (key in loadedBehaviors) {
          obj.customData.behaviors[key] = loadedBehaviors[key];
        } else {
          obj.customData.behaviors[key].module = null;
        }
      }
    }
  }
  
  _resetFlags() {
    this._entitiesLoaded = false;
    this._filesLoaded    = false;
  }
  
  _onLoadComplete() {
    if (this._everythingLoaded) {
      this._onAllAssetsLoaded();
    }
  }
  
  get _everythingLoaded() {
    return this._entitiesLoaded &&
           this._filesLoaded;
  }
}

module.exports = WorldTool;