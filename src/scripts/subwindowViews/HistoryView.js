"use strict";

const $                = wfl.jquery;
const SubwindowView    = require('./SubwindowView');
const {ExpandableMenu,
       MenuItem,
       MenuButton}     = require('../ui');
const {Action}         = require('../tools');

class HistoryView extends SubwindowView {
  constructor() {
    super();
    
    this.entitiesMenu = new ExpandableMenu('History');
    this.add(this.entitiesMenu);
    
    /*$(this.entitiesMenu.element).on('click', () => {
      this.perform(
        Action.Type.ENTITY_SELECT,
        this.getSelectedEntity(),
        false
      );
    });*/
  }
  
  reset() {
    this.entitiesMenu.clear();
  }
  
  addAction(action) {
    let menuItem = this.createMenuItem(action);
    this.entitiesMenu.append(menuItem);
  }
  
  getSelectedEntity() {
    return this.entitiesMenu.getLastSelected();
  }
  
  createMenuItem(action) {
    let label = '';
    
    switch (action.type) {
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
}

module.exports = HistoryView;