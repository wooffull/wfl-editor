"use strict";

const Tool           = require('./Tool');
const subwindowViews = require('../subwindowViews');

class LayerTool extends Tool {
  constructor() {
    super('layers');
    
    this.subwindowView = new subwindowViews.SubwindowView();
  }
}

module.exports = LayerTool;