"use strict";

const Tool             = require('./Tool');
const {Action}         = require('../action');
const {remote}         = require('electron');
const subwindowViews   = require('../subwindowViews');

class HistoryTool extends Tool {
  constructor() {
    super('history', new subwindowViews.HistoryView());
  }
  
  undo() {
    let menu        = this.subwindowView.historyMenu;
    let currentItem = menu.getCurrentItem();
    let index       = menu.indexOf(currentItem);

    // Don't allow 0-th index because one element always needs to be in the
    // list
    if (index > 0) {
      let previousItem = menu.getAt(index - 1);
      menu.select(previousItem);
    }
  }
  
  redo() {
    let menu        = this.subwindowView.historyMenu;
    let currentItem = menu.getCurrentItem();
    let index       = menu.indexOf(currentItem);

    // Don't allow the last index because we can't redo if the menu is
    // already on that item
    if (index >= 0 && index < menu.list.length - 1) {
      let nextItem = menu.getAt(index + 1);
      menu.select(nextItem);
    }
  }
  
  subwindowInit() {
  }
  
  onSelect() {
    this.subwindowView.scrollToLastSelectedMenuItem();
  }
  
  addAction(action) {
    if (action.type === Action.Type.HISTORY_CLEAR) {
      this.subwindowView.reset();
    }
    
    this.subwindowView.addAction(action);
  }
}

module.exports = HistoryTool;