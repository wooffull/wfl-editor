"use strict";

const Tool           = require('./Tool');
const {Action}       = require('../action');
const {Entity}       = require('../world');
const subwindowViews = require('../subwindowViews');

class EntityTool extends Tool {
  constructor() {
    super('nature', new subwindowViews.EntityView());
    
    this.register(
      Action.Type.ENTITY_SELECT,
      (action) => this.subwindowView.onActionEntitySelect(action)
    );
    this.register(
      Action.Type.ENTITY_ADD,
      (action) => this.subwindowView.onActionEntityAdd(action)
    );
    this.register(
      Action.Type.ENTITY_REMOVE,
      (action) => this.subwindowView.onActionEntityRemove(action)
    );
  }
  
  subwindowInit() {
    $(this.subwindowView.entitiesMenu.element).click();
  }
  
  projectUpdate(project) {
    // If no level data, exit early
    if (!project.level) return;
      
    let {entities} = project.level;
    let lastEntity = null;

    // If no entity data, exit early
    if (!entities) return;

    for (const entityData of entities) {
      let entity = new Entity({
        name: entityData.name,
        imageSource: entityData.imageSource
      });

      this.subwindowView.addEntity(entity);
      lastEntity = entity;
    }

    if (lastEntity) {
      this.subwindowView.selectEntity(lastEntity.name)
    }
  }
  
  getData() {
    let menuList = this.subwindowView.entitiesMenu.list;
    let data     = {
      entities: []
    };
    
    for (const item of menuList) {
      data.entities.push(item.data);
    }
    
    return data;
  }
}

module.exports = EntityTool;