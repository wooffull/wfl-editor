"use strict";

const Tool           = require('./Tool');
const subwindowViews = require('../subwindowViews');

class WorldTool extends Tool {
  constructor() {
    super('web_asset');
    
    this.subwindowView = new subwindowViews.WorldView();
  }
}

module.exports = WorldTool;