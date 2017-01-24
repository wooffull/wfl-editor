"use strict";

const $             = wfl.jquery;
const SubwindowView = require('./SubwindowView');
const CssClasses    = require('../CssClasses');
const {Action}      = require('../tools');
const {FileMenu}    = require('../ui');

class FileExplorerView extends SubwindowView {
  constructor() {
    super();
    
    this.fileMenu = new FileMenu('Project Explorer');
    this.add(this.fileMenu);
  }
  
  reset() {
    this.fileMenu.clear();
    
    this.perform(Action.Type.FILE_INIT);
  }
  
  setRoot(filepath) {
    // The root has changed, so recreate the entire file list
    if (this.fileMenu.rootPath !== filepath) {
      this.fileMenu.clear();
      this.fileMenu.rootPath = filepath;
    }
    
    this.fileMenu.update();
  }
}

module.exports = FileExplorerView;