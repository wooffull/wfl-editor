"use strict";

const Tool           = require('./Tool');
const {Action}       = require('../action'); 
const subwindowViews = require('../subwindowViews');

class HistoryTool extends Tool {
  constructor() {
    super('history', new subwindowViews.HistoryView());
  }
  
  subwindowInit() {
  }
  
  addAction(action) {
    if (action.type === Action.Type.HISTORY_CLEAR) {
      this.subwindowView.reset();
    }
    
    this.subwindowView.addAction(action);
  }
}

module.exports = HistoryTool;