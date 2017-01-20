"use strict";

const $             = wfl.jquery;
const SubwindowView = require('./SubwindowView');
const CssClasses    = require('../CssClasses');
const {FileList}    = require('../ui');

class FileExplorerView extends SubwindowView {
  constructor() {
    super();
    
    this.fileList = new FileList('Project Explorer');
    this.add(this.fileList);
  }
  
  reset() {
    this.fileList.clear();
  }
  
  setRoot(filepath) {
    // The root has changed, so recreate the entire file list
    if (this.fileList.rootPath !== filepath) {
      this.fileList.clear();
      this.fileList.rootPath = filepath;
    }
    
    this.fileList.update();
  }
}

module.exports = FileExplorerView;