"use strict";

const Tool           = require('./Tool');
const subwindowViews = require('../subwindowViews');

class EntityTool extends Tool {
  constructor() {
    super('nature');
    
    this.subwindowView = new subwindowViews.EntityView();
  }
  
  subwindowInit() {
    $(this.subwindowView.entitiesMenu.element).click();
  }
}

module.exports = EntityTool;