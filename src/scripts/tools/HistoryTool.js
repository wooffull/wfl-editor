"use strict";

const Tool           = require('./Tool');
const subwindowViews = require('../subwindowViews');

class HistoryTool extends Tool {
  constructor() {
    super('history', new subwindowViews.HistoryView());
  }
  
  subwindowInit() {
  }
  
  addAction(action) {
    if (action.reversable) {
      this.subwindowView.addAction(action);
    }
  }
}

module.exports = HistoryTool;