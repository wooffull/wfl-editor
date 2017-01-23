"use strict";

const $             = wfl.jquery;
const SubwindowView = require('./SubwindowView');
const CssClasses    = require('../CssClasses');
const {FileMenu}    = require('../ui');

class FileExplorerView extends SubwindowView {
  constructor() {
    super();
    
    this.FileMenu = new FileMenu('Project Explorer');
    this.add(this.FileMenu);
  }
  
  reset() {
    this.FileMenu.clear();
  }
  
  setRoot(filepath) {
    // The root has changed, so recreate the entire file list
    if (this.FileMenu.rootPath !== filepath) {
      this.FileMenu.clear();
      this.FileMenu.rootPath = filepath;
    }
    
    this.FileMenu.update();
  }
}

module.exports = FileExplorerView;