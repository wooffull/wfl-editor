"use strict";

const Tool           = require('./Tool');
const subwindowViews = require('../subwindowViews');

class LayerTool extends Tool {
  constructor() {
    super('layers', new subwindowViews.LayerView());
  }
  
  subwindowInit() {
    $(this.subwindowView.getSelectedLayer().element).click();
  }
}

module.exports = LayerTool;