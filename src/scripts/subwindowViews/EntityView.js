"use strict";

const $                 = wfl.jquery;
const PIXI              = wfl.PIXI;
const SubwindowView     = require('./SubwindowView');
const {Menu,
       MenuItem,
       MenuButton}      = require('../ui');
const {Entity}          = require('../world');
const {Action,
       ActionPerformer} = require('../action');
const {remote}          = require('electron');
const {dialog}          = remote;
const path              = remote.require('path');
const fs                = remote.require('fs-extra');
const {Project}         = remote.require('./scripts/file');

class EntityView extends SubwindowView {
  constructor() {
    super();
    
    this.entitiesMenu = new Menu('Entities');
    this.add(this.entitiesMenu);
    
    this.addEntityEntryBtn = new MenuButton('add_box');
    this.addEntityEntryBtn.element.on('click', (e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        this.addEntityEntry();
      }
    });
    this.entitiesMenu.addButton(this.addEntityEntryBtn);
    
    this.removeEntityEntryBtn = new MenuButton('indeterminate_check_box');
    this.removeEntityEntryBtn.element.on('click', (e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        this.removeEntityEntry();
      }
    });
    this.entitiesMenu.addButton(this.removeEntityEntryBtn);
    
    $(this.entitiesMenu).on('change', (e, data) => {
      let elem = data.element;
      this.selectEntity(elem[0].innerHTML);
    });
    
    this.loader = PIXI.loader;
  }
  
  getSelectedEntity() {
    return this.entitiesMenu.getLastSelected();
  }
  
  reset() {
    this.entitiesMenu.clear();
    this.loader.reset();
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
  
  addEntity(entity, reversable = true) {
    let entityData = {
      entityId: entity.name,
      entity:   entity
    };
    ActionPerformer.do(
      Action.Type.ENTITY_ADD,
      entityData,
      reversable
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
      
      let entityObjs = [];
      let fsPromises = [];
      let project = Project.getProject();
      
      if (project && typeof project.dirname !== 'undefined') {
        // Copy over assets into assets folder
        for (let filePath of filePaths) {
          // TODO: Allow for assets in subdirectories
          let entityName = path.basename(filePath);
          let newPath = path.join(project.dirname, 'assets', entityName);
          
          // If the asset is already contained in the assets folder, don't copy
          // it again
          if (newPath.indexOf(filePath) === -1) {
            fsPromises.push(
              fs.copy(filePath, newPath)
            );
          }
          
          entityObjs.push({
            imageSource: entityName
          });
        }

        Promise.all(fsPromises)
        .then(() => this.loadFromData(entityObjs));
      }
    });
  }
  
  loadFromData(data, reversable = true, callback = null) {
    let entities = [];
    let project = Project.getProject();

    for (var i = 0; i < data.length; i++) {
      let filePath = data[i].imageSource;
      let absolutePath = path.join(project.dirname, 'assets', filePath);
      let entityName = data[i].name || path.parse(filePath).name;

      // Only proceed with loading an entity if it's not yet added
      if (!this.loader.resources[entityName] && 
          !this.entitiesMenu.find(entityName)) {
        
        let entity = new Entity({
          name: entityName,
          imageSource: absolutePath
        });
        
        // Queue the entities to load
        this.loader.add(
          entityName,
          absolutePath
        );
        entities.push(entity);
      }
    }

    if (entities.length > 0) {
      // Officially add the entities to the editor once they have finished
      // loading
      this.loader.load((loader, resources) => {
        for (let entity of entities) {
          this.addEntity(entity, reversable);
        }
        
        if (callback) {
          callback();
        }
      });
    }
  }
  
  removeEntityEntry() {
    let selected = this.getSelectedEntity();
    
    // If no entry is selected none can be removed, so exit early
    if (!selected) return;

    dialog.showMessageBox({
      type:    'question',
      title:   'Remove entity?',
      buttons: ['Yes', 'No'],
      message: 'Remove this entity permanently from the game? History will be cleared. (No undo)'
    }, (res) => {
      switch (res) {
        // Yes: Remove the entity from the game
        case 0:
          if (selected) {
            // Remove the selected entity
            let entityData = {
              entityId: selected.element.html()
            };
            ActionPerformer.do(
              Action.Type.ENTITY_REMOVE,
              entityData,
              false
            );
            
            // Clear history
            let clearData = {
              msg: "Entity (" + entityData.entityId + ") removed"
            };
            ActionPerformer.do(
              Action.Type.HISTORY_CLEAR,
              clearData
            );
          }
          break;
      }
    });
  }
  
  
  
  onActionEntitySelect(action) {
    let {entity, entityId} = action.data;
    
    if (entity) {
      let menuItem = this.entitiesMenu.find(entityId);
      this.entitiesMenu.select(menuItem);
    }
  }
  
  onActionEntityAdd(action) {
    let {entity} = action.data;
    
    let menuItem = new MenuItem(entity.name, entity);
    this.entitiesMenu.append(menuItem);

    // Select the added entity
    this.selectEntity(entity.name);
  }
  
  onActionEntityRemove(action) {
    let {entityId} = action.data;
    let menuItem   = this.entitiesMenu.find(entityId);
    this.entitiesMenu.remove(menuItem);

    // After removing the element, get the currently selected one and
    // perform an ENTITY_SELECT
    let selected = this.getSelectedEntity();

    if (selected) {
      this.selectEntity(selected.element.html());
    } else {
      // Still perform an ENTITY_SELECT on null so that other tools can
      // handle when no more entities are remaining in the project
      this.selectEntity(null);
    }
  }
}

module.exports = EntityView;