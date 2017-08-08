"use strict";

const $                 = wfl.jquery;
const SubwindowView     = require('./SubwindowView');
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
        
        // Force the time to be undefined so that when this action is the current
        // one in the history menu, the project thinks it hasn't been changed. This
        // works because the FILE_INIT is supposed to be the very first action, and
        // that cannot be undone.
        action.time = undefined;
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
        
      case Action.Type.LAYER_ADD:
        label = 'Add Layer: ' + action.data.layerId;
        break;
      
      case Action.Type.LAYER_REMOVE:
        label = 'Remove Layer: ' + action.data.layerId;
        break;
      
      case Action.Type.LAYER_LOCK:
        label = 'Locked Layer: ' + action.data.layerId;
        break;
      
      case Action.Type.LAYER_UNLOCK:
        label = 'Unlocked Layer: ' + action.data.layerId;
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
          label = 'Moved Entity: ' + movedEntity.name + '#' + movedId +
                ' [' + movedLayerId + ']';
        } else {
          label = 'Moved ' + length + ' Entities';
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
          label = 'Aligned Entity: ' + movedEntity.name + '#' + movedId +
                ' [' + movedLayerId + ']';
        } else {
          label = 'Aligned ' + length + ' Entities';
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
          label = 'Rotated Entity: ' + movedEntity.name + '#' + movedId +
                ' [' + movedLayerId + ']';
        } else {
          label = 'Rotated ' + length + ' Entities';
        }
        break;
        
      case Action.Type.HISTORY_CLEAR:
        label = action.data.msg;
        break;
        
      case Action.Type.PROPERTY_CHANGE_SOLID:
        label = 'Changed Solid Property: '
              + (!action.data.value).toString()
              + ' -> '
              + action.data.value.toString();
        break;
      
      case Action.Type.PROPERTY_CHANGE_FIXED:
        label = 'Changed Fixed Property: '
              + (!action.data.value).toString()
              + ' -> '
              + action.data.value.toString();
        break;
      
      case Action.Type.PROPERTY_CHANGE_PERSISTS:
        label = 'Changed Persistence Property: '
              + (!action.data.value).toString()
              + ' -> '
              + action.data.value.toString();
        break;
      
      default:
        label = '???: ' + action.type;
    }
    
    return new MenuItem(label, action);
  }
}

module.exports = HistoryView;