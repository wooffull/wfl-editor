"use strict";

const Tool           = require('./Tool');
const {Action}       = require('../action');
const subwindowViews = require('../subwindowViews');

class PropertiesTool extends Tool {
  constructor() {
    super('list', new subwindowViews.PropertiesView());
    
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

module.exports = PropertiesTool;