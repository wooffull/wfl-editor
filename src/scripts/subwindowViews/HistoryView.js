"use strict";

const $                 = wfl.jquery;
const SubwindowView     = require('./SubwindowView');
const {remote}          = require('electron');
const {Project}         = remote.require('./scripts/file');
const {HistoryMenu,
       MenuItem}        = require('../ui');
const {Action,
       ActionPerformer} = require('../action');

class HistoryView extends SubwindowView {
  constructor() {
    super();
    
    this.historyMenu = new HistoryMenu('History');
    this.add(this.historyMenu);
    
    $(this.historyMenu).on('undo-set', (e, list) => {
      for (let action of list) {
        this.undo(action);
      }
    });
    
    $(this.historyMenu).on('redo-set', (e, list) => {
      for (let action of list) {
        this.redo(action);
      }
    });
  }
  
  reset() {
    this.historyMenu.clear();
  }
  
  resize() {
    this.scrollToLastSelectedMenuItem();
  }
  
  scrollToLastSelectedMenuItem() {
    let lastSelected = this.historyMenu.getLastSelected();
    
    if (lastSelected) {
      this.historyMenu.scrollTo(lastSelected);
    }
  }
  
  getLastChangedTime() {
    let currentAction = this.historyMenu.getLastSelected().data;
    return currentAction.time;
  }
  
  addAction(action) {
    let menuItem = this.createMenuItem(action);
    this.historyMenu.append(menuItem);
    
    // Select the new layer
    this.historyMenu.select(menuItem);
  }
  
  undo(action) {
    ActionPerformer.undo(action);
  }
  
  redo(action) {
    ActionPerformer.redo(action);
  }
  
  createMenuItem(action) {
    let label = '';
    
    switch (action.type) {
      case Action.Type.FILE_INIT:
        label = 'Start Project';
        
        // Force the action's time to match the last time the project was
        // changed. This gives it a relevant time stamp when checking if the
        // project has been changed.
        let project = Project.getProject();
        action.time = project.lastChanged;
        break;
        
      case Action.Type.PROJECT_TILE_WIDTH_CHANGE:
        label = 'Change Tile Width: '
              + action.data.prevTileWidth
              + ' -> '
              + action.data.tileWidth;
        break;
        
      case Action.Type.PROJECT_TILE_HEIGHT_CHANGE:
        label = 'Change Tile Height: '
              + action.data.prevTileHeight
              + ' -> '
              + action.data.tileHeight;
        break;
        
      case Action.Type.PROJECT_DYNAMIC_Z_ORDER_CHANGE:
        label = 'Change Dynamic Z-Order: '
              + (!action.data.value)
              + ' -> '
              + action.data.value;
        break;
        
      case Action.Type.LAYER_ADD:
        label = 'Add Layer: ' + action.data.layerId;
        break;
      
      case Action.Type.LAYER_REMOVE:
        label = 'Remove Layer: ' + action.data.layerId;
        break;
      
      case Action.Type.LAYER_LOCK:
        label = 'Lock Layer: ' + action.data.layerId;
        break;
      
      case Action.Type.LAYER_UNLOCK:
        label = 'Unlock Layer: ' + action.data.layerId;
        break;
      
      case Action.Type.ENTITY_ADD:
        label = 'Add entity: ' + action.data.entityId;
        break;
      
      case Action.Type.WORLD_ENTITY_ADD:
        var addedGameObject = action.data.gameObject;
        var addedLayerId    = action.data.layerId;
        var addedEntity     = addedGameObject.customData.entity;
        var addedId         = addedGameObject.customData.id;
        label = 'Place Entity: ' + addedEntity.name + '#' + addedId +
                ' [' + addedLayerId + ']';
        break;
        
      case Action.Type.WORLD_ENTITY_REMOVE:
        var removedGameObject = action.data.gameObject;
        var removedLayerId    = action.data.layerId;
        var removedEntity     = removedGameObject.customData.entity;
        var removedId         = removedGameObject.customData.id;
        label = 'Remove Entity: ' + removedEntity.name + '#' + removedId +
                ' [' + removedLayerId + ']';
        break;
        
      case Action.Type.WORLD_ENTITY_ADD_BATCH:
        var addedGameObjects = action.data.gameObjects;
        label = `Place ${addedGameObjects.length} Entities`;
        break;
        
      case Action.Type.WORLD_ENTITY_REMOVE_BATCH:
        var removedGameObjects = action.data.gameObjects;
        label = `Remove ${removedGameObjects.length} Entities`;
        break;
      
      case Action.Type.WORLD_SELECTION_MOVE:
        var selection = action.data.gameObjects;
        var length    = selection.length;
        
        if (length === 1) {
          var movedGameObject = selection[0];
          var movedLayerId    = movedGameObject.layer;
          var movedEntity     = movedGameObject.customData.entity;
          var movedId         = movedGameObject.customData.id;
          label = 'Move Entity: ' + movedEntity.name + '#' + movedId +
                ' [' + movedLayerId + ']';
        } else {
          label = 'Move ' + length + ' Entities';
        }
        break;
      
      case Action.Type.WORLD_SELECTION_ALIGN:
        var selection = action.data.gameObjects;
        var length    = selection.length;
        
        if (length === 1) {
          var movedGameObject = selection[0];
          var movedLayerId    = movedGameObject.layer;
          var movedEntity     = movedGameObject.customData.entity;
          var movedId         = movedGameObject.customData.id;
          label = 'Align Entity: ' + movedEntity.name + '#' + movedId +
                ' [' + movedLayerId + ']';
        } else {
          label = 'Align ' + length + ' Entities';
        }
        break;
      
      case Action.Type.WORLD_SELECTION_ROTATE:
        var selection = action.data.gameObjects;
        var length    = selection.length;
        
        if (length === 1) {
          var movedGameObject = selection[0];
          var movedLayerId    = movedGameObject.layer;
          var movedEntity     = movedGameObject.customData.entity;
          var movedId         = movedGameObject.customData.id;
          label = 'Rotate Entity: ' + movedEntity.name + '#' + movedId +
                ' [' + movedLayerId + ']';
        } else {
          label = 'Rotate ' + length + ' Entities';
        }
        break;
        
      case Action.Type.HISTORY_CLEAR:
        label = action.data.msg;
        break;
        
      case Action.Type.PROPERTY_CHANGE_NAME:
        var length = action.data.gameObjects.length;
        
        if (length === 1) {
          label = 'Change Name Property: '
                + action.data.prevValues[0].toString()
                + ' -> '
                + action.data.values[0].toString();
        } else {
          label = 'Change Name Property for group';
        }
        break;
        
      case Action.Type.PROPERTY_CHANGE_SOLID:
        var length = action.data.gameObjects.length;
        
        if (length === 1) {
          label = 'Change Solid Property: '
                + action.data.prevValues[0].toString()
                + ' -> '
                + action.data.values[0].toString();
        } else {
          label = 'Change Solid Property for group';
        }
        break;
      
      case Action.Type.PROPERTY_CHANGE_FIXED:
        var length = action.data.gameObjects.length;
        
        if (length === 1) {
          label = 'Change Fixed Property: '
                + action.data.prevValues[0].toString()
                + ' -> '
                + action.data.values[0].toString();
        } else {
          label = 'Change Fixed Property for group';
        }
        break;
      
      case Action.Type.PROPERTY_CHANGE_PERSISTS:
        var length = action.data.gameObjects.length;
        
        if (length === 1) {
          label = 'Change Persistence Property: '
                + action.data.prevValues[0].toString()
                + ' -> '
                + action.data.values[0].toString();
        } else {
          label = 'Change Persistence Property for group';
        }
        break;
      
      case Action.Type.PROPERTY_CHANGE_MASS:
        var length = action.data.gameObjects.length;
        
        if (length === 1) {
          label = 'Change Mass Property: '
                + action.data.prevValues[0].toString()
                + ' -> '
                + action.data.values[0].toString();
        } else {
          label = 'Change Mass Property for group';
        }
        break;
      
      case Action.Type.PROPERTY_CHANGE_FRICTION:
        var length = action.data.gameObjects.length;
        
        if (length === 1) {
          label = 'Change Friction Property: '
                + action.data.prevValues[0].toString()
                + ' -> '
                + action.data.values[0].toString();
        } else {
          label = 'Change Friction Property for group';
        }
        break;
      
      case Action.Type.PROPERTY_CHANGE_RESTITUTION:
        var length = action.data.gameObjects.length;
        
        if (length === 1) {
          label = 'Change Restitution Property: '
                + action.data.prevValues[0].toString()
                + ' -> '
                + action.data.values[0].toString();
        } else {
          label = 'Change Restitution Property for group';
        }
        break;
        
      case Action.Type.PROPERTY_ADD_BEHAVIOR:
        var length = action.data.gameObjects.length;
        var name   = action.data.behaviorData.name;
        
        if (length === 1) {
          var entity = action.data.gameObjects[0].customData.entity;
          label = `Add Behavior (${name}) to `
                + entity.name;
        } else {
          label = `Add Behavior (${name}) to group`;
        }
        break;
        
      case Action.Type.PROPERTY_REMOVE_BEHAVIOR:
        var length = action.data.gameObjects.length;
        var name   = action.data.behaviorData.name;
        
        if (length === 1) {
          var entity = action.data.gameObjects[0].customData.entity;
          label = `Remove Behavior (${name}) from `
                + entity.name;
        } else {
          label = `Remove Behavior (${name}) from group`;
        }
        break;
        
      case Action.Type.PROPERTY_CHANGE_BEHAVIOR:
        var length       = action.data.gameObjects.length;
        var behaviorName = action.data.behaviorData.name;
        var propertyName = action.data.propertyName;
        
        if (length === 1) {
          var entity = action.data.gameObjects[0].customData.entity;
          label = `Change Behavior Property (${behaviorName}::`
                + `${propertyName}) for ` + entity.name;
        } else {
          label = `Change Behavior Property (${behaviorName}::`
                + `${propertyName}) for group`;
        }
        break;
      
      default:
        label = '???: ' + action.type;
    }
    
    return new MenuItem(label, action);
  }
}

module.exports = HistoryView;