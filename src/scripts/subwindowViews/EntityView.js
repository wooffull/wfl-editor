"use strict";

const $                 = wfl.jquery;
const SubwindowView     = require('./SubwindowView');
const {ExpandableMenu,
       MenuItem,
       MenuButton}      = require('../ui');
const {Entity}          = require('../world');
const {Action,
       ActionPerformer} = require('../action');
const {remote}          = require('electron');
const {dialog}          = remote;
const fs                = remote.require('fs');
const path              = remote.require('path');

class EntityView extends SubwindowView {
  constructor() {
    super();
    
    this.entitiesMenu = new ExpandableMenu('Entities');
    this.add(this.entitiesMenu);
    
    this.addEntityEntryBtn = new MenuButton('add_box');
    this.addEntityEntryBtn.element.on('click', () => this.addEntityEntry());
    this.entitiesMenu.addButton(this.addEntityEntryBtn);
    
    this.removeEntityEntryBtn = new MenuButton('indeterminate_check_box');
    this.removeEntityEntryBtn.element.on('click', () => this.removeEntityEntry());
    this.entitiesMenu.addButton(this.removeEntityEntryBtn);
    
    $(this.entitiesMenu).on('change', (e, data) => {
      let elem = data.element;
      this.selectEntity(elem[0].innerHTML);
    });
  }
  
  getSelectedEntity() {
    return this.entitiesMenu.getLastSelected();
  }
  
  reset() {
    this.entitiesMenu.clear();
  }
  
  selectEntity(entityId) {
    let entity = null;
    
    if (entityId) {
      entity = this.entitiesMenu.find(entityId).data;
    }
    
    let entityData = {
      entityId: entityId,
      entity:   entity
    };
    
    // Select the newest entity
    ActionPerformer.do(
      Action.Type.ENTITY_SELECT,
      entityData,
      false
    );
  }
  
  addEntityEntry() {
    dialog.showOpenDialog({
      properties: [
        'openFile',
        'multiSelections'
      ],
      filters: [
        {name: 'Images', extensions: ['png', 'jpg', 'gif']},
        {name: 'All Files', extensions: ['*']}
      ]
    },
                          
    (filePaths) => {
      if (filePaths === undefined) {
        return;
      }
      
      for (let filePath of filePaths) {
        fs.readFile(filePath, 'utf-8', (err, data) => {
          if (err) {
            alert("An error occurred while reading the file: " + err.message);
            return;
          }
          
          let entityName = path.parse(filePath).name;
          let entity     = new Entity({
            name: entityName,
            imageSource: filePath
          });
          this.addEntity(entity);
          
          // Select the last added entity
          this.selectEntity(entityName);
        })
      }
    });
  }
  
  removeEntityEntry() {
    let selected = this.getSelectedEntity();
    
    if (selected) {
      this.entitiesMenu.remove(selected);
      
      // After removing the previously selected element, get the currently
      // selected one and perform an ENTITY_SELECT
      selected = this.getSelectedEntity();
      
      if (selected) {
        this.selectEntity(selected.element.html());
      } else {
        this.selectEntity(null);
      }
    }
  }
  
  addEntity(entity) {
    let menuItem = new MenuItem(entity.name, entity);
    this.entitiesMenu.append(menuItem);
  }
  
  
  
  onActionEntitySelect(action) {
    let {entity} = action.data;
    
    if (entity) {
      let entityName = entity.name;
      let menuItem   = this.entitiesMenu.find(entityName);
      this.entitiesMenu.select(menuItem);
    }
  }
}

module.exports = EntityView;