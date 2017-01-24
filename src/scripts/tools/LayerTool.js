"use strict";

const Tool           = require('./Tool');
const Action         = require('./Action');
const subwindowViews = require('../subwindowViews');

class LayerTool extends Tool {
  constructor() {
    super('layers', new subwindowViews.LayerView());
  }
  
  subwindowInit() {
    $(this.subwindowView.getSelectedLayer().element).click();
  }
  
  parseAction(action) {
    let data = action.data;

    if (action.direciton === Action.Direction.DEFAULT) {
      
    } else if (action.direction === Action.Direction.UNDO) {
      switch (action.type) {
        case Action.Type.LAYER_REMOVE:
          this.subwindowView.addLayer(data, action.direction);
          break;
      }
      
    } else if (action.direction === Action.Direction.REDO) {
      
    }
  }
}

module.exports = LayerTool;