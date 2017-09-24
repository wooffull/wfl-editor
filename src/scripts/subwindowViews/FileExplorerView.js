"use strict";

const $                 = wfl.jquery;
const SubwindowView     = require('./SubwindowView');
const CssClasses        = require('../CssClasses');
const {Action,
       ActionPerformer} = require('../action');
const {FileMenu,
       MenuButton}      = require('../ui');
const watch             = require('watch');
const mkdirp            = require('mkdirp');
const {remote}          = require('electron');
const {Project}         = remote.require('./scripts/file');
const fs                = remote.require('fs');
const path              = remote.require('path');

class FileExplorerView extends SubwindowView {
  constructor() {
    super();
    
    this.fileMenu = new FileMenu('Project Explorer');
    this.add(this.fileMenu);
    
    this.refreshBtn = new MenuButton('refresh');
    this.refreshBtn.element.on('click', (e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        this.refresh();
      }
    });
    this.fileMenu.addButton(this.refreshBtn);
  }
  
  reset() {
    if (typeof this.fileMenu.rootPath !== "undefined") {
      watch.unwatchTree(this.fileMenu.rootPath);
    }
    
    this.fileMenu.clear();
    this.refresh();
    
    ActionPerformer.do(Action.Type.FILE_INIT);
  }
  
  setRoot(filepath) {
    // The root has changed, so recreate the entire file list
    if (this.fileMenu.rootPath !== filepath) {
      this.fileMenu.clear();
      this.fileMenu.rootPath = filepath;
    }

    this.refresh()
      .then(this.fileMenu.update())
      .then(() => {
        if (typeof this.fileMenu.rootPath !== "undefined") {
          watch.watchTree(
            this.fileMenu.rootPath,
            this._onWatchUpdate.bind(this)
          );
        }
      });
  }
  
  refresh() {
    if (typeof this.fileMenu.rootPath !== "undefined") {
      return this._confirmBehaviorsDirectoryExists()
        .catch((err) => console.log(err))
        .then(this.fileMenu.update());
    } else {
      return Promise.resolve();
    }
  }
  
  _confirmBehaviorsDirectoryExists() {
    return new Promise((resolve, reject) => {
      let project = Project.getProject();
      
      if (project && project.title) {
        let behaviorsPath = path.join(project.dirname, 'behaviors');
      
        fs.lstat(behaviorsPath, (err, stats) => {
          if (err || !stats.isDirectory()) {
            this._createBehaviorsDirectory()
              .then(() => resolve())
              .catch((err) => reject(err));
          } else {
            resolve();
          }
        });
      } else {
        reject("Behaviors directory could not be created. " +
               "Try saving the current project.");
      }
    });
  }
  
  _createBehaviorsDirectory() {
    return new Promise((resolve, reject) => {
      let project = Project.getProject();
      let behaviorsPath = path.join(project.dirname, 'behaviors');
      
      mkdirp(behaviorsPath, function (err) {
        if (err && err.code !== 'EEXIST') {
          reject(err);
        }
        
        resolve();
      });
    });
  }
  
  _onWatchUpdate(modifiedFile, currentStat, previousStat) {
    this.fileMenu.update()
  }
}

module.exports = FileExplorerView;