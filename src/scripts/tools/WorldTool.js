"use strict";

const Tool             = require('./Tool');
const {Action}         = require('../action'); 
const behaviorModule   = require('../behaviors');
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
          let {entity, x, y, rotation, layer, physics, behaviors, name} = obj;
          let addedObj = scene.addEntity(entity, layer, false);
          addedObj.name               = name;
          addedObj.position.x         = x;
          addedObj.position.y         = y;
          addedObj.customData.physics = physics;
          addedObj.rotate(rotation);

          if (behaviors) {
            addedObj.customData.tempBehaviorData = behaviors;
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
      let behaviors    = obj.customData.behaviors;
      let behaviorData = undefined;
      if (behaviors && Object.keys(behaviors).length > 0) {
        behaviorData = {};
        
        let behaviorKeys = Object.keys(behaviors);
        for (let behaviorKey of behaviorKeys) {
          behaviorData[behaviorKey] = {};
          let properties = behaviors[behaviorKey].properties;
          
          if (properties) {
            let propertyKeys = Object.keys(properties);
            for (let propertyKey of propertyKeys) {
              behaviorData[behaviorKey][propertyKey] =
                properties[propertyKey].value;
            }
          }
        }
      }
      
      let objData = {
        layer:     obj.layer,
        entity:    obj.customData.entity,
        name:      obj.name,
        x:         obj.position.x,
        y:         obj.position.y,
        rotation:  obj.rotation,
        physics:   obj.customData.physics,
        behaviors: behaviorData
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
    let loadedBehaviors = behaviorModule.getLoadedBehaviors();
    
    for (const obj of gameObjects) {
      if (typeof obj.customData.behaviors === 'undefined') {
        obj.customData.behaviors = {};
      }

      let behaviors    = obj.customData.tempBehaviorData || {};
      let behaviorKeys = Object.keys(behaviors);
      
      for (const key of behaviorKeys) {
        // If the behavior module is loaded, fill it with the game object's
        // saved data
        if (key in loadedBehaviors) {
          let behaviorData = behaviors[key];
          let behavior     = loadedBehaviors[key].clone();
          
          // Set properties
          let propertyKeys = Object.keys(behaviorData);
          for (let propertyKey of propertyKeys) {
            let property = behavior.properties[propertyKey];
            
            if (property !== undefined) {
              property.value = behaviorData[propertyKey];
            }
          }
          
          obj.customData.behaviors[key] = behavior;
        
        // Otherwise, the behavior module may not be accessible, so hold onto
        // the current behavior module's data until we can access it later
        } else if (obj.customData.tempBehaviorData !== undefined) {
          // If the game object already had the behavior module loaded, that
          // means it was made inaccessible while editing the level
          if (obj.customData.behaviors[key] !== undefined &&
              obj.customData.behaviors[key].module !== undefined) {
            
            let behavior = obj.customData.behaviors[key];
            obj.customData.tempBehaviorData[key] = {};
            
            // Retain properties in temp data
            let propertyKeys = Object.keys(behavior.properties);
            for (let propertyKey of propertyKeys) {
              let property = behavior.properties[propertyKey];
              
              if (property !== undefined) {
                obj.customData.tempBehaviorData[key][propertyKey] =
                  property.value;
              }
            }
            
            behavior.module = undefined;
          
          // Otherwise, the level was loaded and the behavior module cannot be
          // accessed
          } else {
            obj.customData.behaviors[key] =
              behaviorModule.getPlaceholderBehavior();
            obj.customData.behaviors[key].name = key;
          }
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