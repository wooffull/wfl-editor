"use strict";

const $                 = wfl.jquery;
const SubwindowView     = require('./SubwindowView');
const CssClasses        = require('../CssClasses');
const {Action,
       ActionPerformer} = require('../action');
const {FileMenu,
       MenuButton}      = require('../ui');
const behaviors         = require('../behaviors');
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
        .then(this.fileMenu.update())
        .then(this._updateBehaviors());
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
              .catch((err) => reject(err))
              .then(() => resolve());
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
    this.refresh();
  }
  
  _updateBehaviors() {
    return new Promise((resolve, reject) => {
      let project = Project.getProject();
      
      if (project && project.title) {
        let behaviorsPath = path.join(project.dirname, 'behaviors');
      
        fs.lstat(behaviorsPath, (err, stats) => {
          if (err || !stats.isDirectory()) {
            reject(err);
          } else {
            this._getBehaviorFilepaths()
              .then((filepaths) => this._getBehaviorModules(filepaths))
              .then(() => this._performFileExplorerUpdateAction())
              .then(() => resolve());
          }
        });
      }
    });
  }
  
  _getBehaviorFilepaths() {
    let project = Project.getProject();

    if (project && project.title) {
      let behaviorsPath = path.join(project.dirname, 'behaviors');
      return new Promise((resolve, reject) => {
        fs.readdir(behaviorsPath, (err, filepaths) => {
          if (err) {
            reject(err);
          } else {
            resolve(filepaths);
          }
        });
      });
    } else {
      return Promise.resolve([]);
    }
  }
  
  _getBehaviorModules(filepaths) {
    let project       = Project.getProject();
    let behaviorsPath = path.join(project.dirname, 'behaviors');
    let behaviorData  = [];
    
    // TODO: Make require non-blocking
    for (let filepath of filepaths) {
      let extension = path.extname(filepath);
      
      // Only allow JavaScript behaviors (for now?)
      if (extension === '.js') {
        let absolutePath = path.join(behaviorsPath, filepath);
        
        // Invalidate the cache if the behavior has already been loaded in,
        // this way behaviors get updated properly
        if (typeof require.cache[absolutePath] !== 'undefined') {
          delete require.cache[absolutePath];
        }
        
        let module = require(absolutePath);
        let data   = {
          module:       module,
          absolutePath: absolutePath,
          basename:     filepath,
          name:         filepath.split('.')[0]
        };

        behaviorData.push(data);
      }
    }
    
    behaviors.updateBehaviors(behaviorData);
    
    return Promise.resolve();
  }
  
  _performFileExplorerUpdateAction() {
    ActionPerformer.do(
      Action.Type.FILE_REFRESH,
      null,
      false
    );
    
    return Promise.resolve();
  }
}

module.exports = FileExplorerView;