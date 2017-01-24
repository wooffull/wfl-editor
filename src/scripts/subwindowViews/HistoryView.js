"use strict";

const $             = wfl.jquery;
const SubwindowView = require('./SubwindowView');
const {HistoryMenu,
       MenuItem}    = require('../ui');
const {Action}      = require('../tools');

class HistoryView extends SubwindowView {
  constructor() {
    super();
    
    this.historyMenu = new HistoryMenu('History');
    this.add(this.historyMenu);
    
    $(this.historyMenu).on('undo-set', (e, list) => {
      for (let action of list) {
        this.perform(
          action.type,
          action.data,
          false,
          Action.Direction.UNDO
        );
      }
    });
    
    $(this.historyMenu).on('redo-set', (e, list) => {
      for (let action of list) {
        this.perform(
          action.type,
          action.data,
          false,
          Action.Direction.REDO
        );
      }
    });
  }
  
  reset() {
    this.historyMenu.clear();
  }
  
  getLastChangedTime() {
    let currentAction = this.historyMenu.getLastSelected().data;
    return currentAction.time;
  }
  
  addAction(action) {
    let menuItem = this.createMenuItem(action);
    this.historyMenu.append(menuItem);
    
    // Select the new layer
    this.historyMenu._onItemSelect(menuItem);
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
        
      case Action.Type.LAYER_ADD:
        label = 'Add Layer: ' + action.data;
        break;
      
      case Action.Type.LAYER_REMOVE:
        label = 'Remove Layer: ' + action.data;
        break;
      
      case Action.Type.WORLD_ENTITY_ADD:
        let addedGameObject = action.data.gameObject;
        let addedLayerId    = action.data.layerId;
        let addedEntity     = addedGameObject.customData.entity;
        let addedId         = addedGameObject.customData.id;
        label = 'Place Entity: ' + addedEntity.data.name + '@' + addedId +
                ' [' + addedLayerId + ']';
        break;
        
      case Action.Type.WORLD_ENTITY_REMOVE:
        let removedGameObject = action.data.gameObject;
        let removedLayerId    = action.data.layerId;
        let removedEntity     = removedGameObject.customData.entity;
        let removedId         = removedGameObject.customData.id;
        label = 'Remove Entity: ' + removedEntity.data.name + '@' + removedId +
                ' [' + removedLayerId + ']';
        break;
      
      case Action.Type.WORLD_SELECTION_MOVE:
        let selection = action.data.gameObjects;
        let length    = selection.length;
        
        if (length === 1) {
          let movedGameObject = selection[0];
          let movedLayerId    = movedGameObject.layer;
          let movedEntity     = movedGameObject.customData.entity;
          let movedId         = movedGameObject.customData.id;
          label = 'Moved Entity: ' + movedEntity.data.name + '@' + movedId +
                ' [' + movedLayerId + ']';
        } else {
          label = 'Moved ' + length + ' Entities';
        }
        break;
      
      default:
        label = '???: ' + action.type;
    }
    
    return new MenuItem(label, action);
  }
  
  undo(action) {
    
  }
  
  redo(action) {
    
  }
}

module.exports = HistoryView;