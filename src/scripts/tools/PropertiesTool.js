"use strict";

const Tool           = require('./Tool');
const {Action}       = require('../action');
const subwindowViews = require('../subwindowViews');

class LayerTool extends Tool {
  constructor() {
    super('settings', new subwindowViews.PropertiesView());
    
    this.register(
      Action.Type.WORLD_ENTITY_SELECT,
      (action) => this.subwindowView.onActionEntitySelect(action)
     );
    this.register(
      Action.Type.WORLD_ENTITY_DESELECT,
      (action) => this.subwindowView.onActionEntityDeselect(action)
     );
  }
}

module.exports = LayerTool;