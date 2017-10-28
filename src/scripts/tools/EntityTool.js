"use strict";

const Tool              = require('./Tool');
const {Action,
       ActionPerformer} = require('../action');
const {Entity}          = require('../world');
const subwindowViews    = require('../subwindowViews');
const {remote}          = require('electron');
const path              = remote.require('path');
const {Project}         = remote.require('./scripts/file');

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
  
  onProjectUpdate(project) {
    // If no level data, exit early
    if (!project.level) return;
      
    let {entities} = project.level;

    // If no entity data, exit early
    if (!entities) return;
    
    // Load the entities then select the first one
    this.subwindowView.loadFromData(entities, false, () => {
      if (entities.length > 0) {
        this.subwindowView.selectEntity(entities[0].name);
      }
      
      // Notify the project that entities have loaded
      let projectData = {
        project: project
      };
      ActionPerformer.do(
        Action.Type.ENTITY_PROJECT_LOAD_COMPLETE,
        projectData,
        false
      );
    });
  }
  
  getData() {
    let menuList = this.subwindowView.entitiesMenu.list;
    let data     = {
      entities: []
    };
    let project = Project.getProject();
    
    for (const item of menuList) {
      let entity = {
        name: item.data.name,
        imageSource: path.relative(
          path.join(project.dirname, 'assets'),
          item.data.imageSource
        )
      };
      
      data.entities.push(entity);
    }
    
    return data;
  }
}

module.exports = EntityTool;