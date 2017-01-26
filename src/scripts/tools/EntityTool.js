"use strict";

const Tool           = require('./Tool');
const {Action}       = require('../action');
const subwindowViews = require('../subwindowViews');

class EntityTool extends Tool {
  constructor() {
    super('nature', new subwindowViews.EntityView());
    
    this.register(
      Action.Type.ENTITY_SELECT,
      (action) => this.subwindowView.onActionEntitySelect(action)
    );
  }
  
  subwindowInit() {
    $(this.subwindowView.entitiesMenu.element).click();
  }
}

module.exports = EntityTool;