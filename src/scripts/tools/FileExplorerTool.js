"use strict";

const Tool           = require('./Tool');
const subwindowViews = require('../subwindowViews');

class FileExplorerTool extends Tool {
  constructor() {
    super('web_asset', new subwindowViews.FileExplorerView());
  }
  
  subwindowInit() {
  }
  
  onProjectUpdate(project) {
    if (typeof project.dirname === 'undefined') {
      this.reset();
      return;
    }
    
    this.subwindowView.setRoot(project.dirname);
  }
}

module.exports = FileExplorerTool;