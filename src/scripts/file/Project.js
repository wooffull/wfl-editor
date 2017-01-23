"use strict";

const fs        = require('fs');
const path      = require('path');
const {dialog,
      ipcMain}  = require('electron');
const AppConfig = require('./AppConfig');
const mkdirp    = require('mkdirp');

let win         = undefined;
let project     = undefined;
let lastChanged = undefined;
let basePath    = AppConfig.basePath;

// TODO: Implement detection for if the project has been changed
function hasChanges() {
  return typeof win !== 'undefined' && project.lastChanged !== lastChanged;
}

function updateHistory(time) {
  lastChanged = time;
  win.webContents.send('project-altered', project, hasChanges());
}

function confirmSavedChanges(forcedNext) {
  // If changes were made, ask the user if they want to save the project before
  // closing this one
  if (hasChanges()) {
    dialog.showMessageBox(win, {
      type:    'question',
      title:   'Save Changes?',
      buttons: ['Yes', 'No', 'Cancel'],
      message: 'Save changes before closing project?'
    }, (res) => {
      switch (res) {
        // Yes: So save changes then call forcedNext
        case 0:
          saveProject(forcedNext);
          break;
        
        // No: So call forcedNext
        case 1:
          forcedNext();
          break;
        
        // Cancel: Don't do anything
        case 2:
          break;
      }
    });
  
  // No changes were made, so call forcedNext
  } else {
    forcedNext();
  }
}

/**
 * Resets the current project back to a new project's state
 */
function newProject(winRef, _preventConfirmation = false) {
  if (!_preventConfirmation) {
    confirmSavedChanges(() => newProject(winRef, true));
    return;
  }
  
  win = winRef;
  lastChanged = undefined;
  
  project = {
    title:       undefined,
    dirname:     undefined,
    lastChanged: undefined
  };
  win.webContents.send('project-new', project);
}

/**
 * Allows user to select the project's directory with the file explore to save a new project
 */
function saveAsProject(next) {
  let projectJson  = JSON.stringify(project, null, '  ');
  let projectsPath = path.join(basePath, 'projects');
  
  dialog.showSaveDialog(win, {
    title:       'Save Project',
    defaultPath: projectsPath
  },
  (projectPath) => {
    if (typeof projectPath === 'undefined') return;
    
    // If likely overwriting another project, handle the paths accordintly
    if (path.extname(projectPath) === '.wfl') {
      project.dirname = path.dirname(projectPath);
      project.title   = path.basename(project.dirname);
    } else {
      project.dirname = projectPath;
      project.title   = path.basename(projectPath);
    }
    
    saveProject(next);
  });
}

/**
 * Saves changes to the current project
 * -- Saves a new project (saveAsProject()) if the project hasn't been saved before
 */
function saveProject(next) {
  // If the project hasn't been saved before, perform a "save as"
  if (typeof project.title === 'undefined') {
    saveAsProject(next);
    return;
  }
  
  // Update the time reference for when the project was last changed
  project.lastChanged = lastChanged;
  
  let projectJson  = JSON.stringify(project, null, '  ');
  let projectsPath = path.join(basePath, 'projects');
  
  mkdirp(project.dirname, function (err) {
    if (err && err.code !== 'EEXIST') {
      throw err;
    }
    
    let savePath = path.join(project.dirname, 'project.wfl');

    fs.writeFile(savePath, projectJson, {flag: 'w'}, (err) => {
      if (err) {
        throw err;
      }
      win.webContents.send('project-save', project);
      
      if (next) next();
    });
  })
}

/**
 * Allows user to explore files to load a .wfl project
 */
function loadProject(projectTitle = 'test', _preventConfirmation = false) {
  if (!_preventConfirmation) {
    confirmSavedChanges(() => loadProject(projectTitle, true));
    return;
  }
  
  let projectsPath = path.join(basePath, 'projects');
  
  dialog.showOpenDialog(win, {
    title:       'Open Project',
    defaultPath: projectsPath,
    filters:     [
      {name: 'WFL Projects', extensions: ['wfl']},
      {name: 'All Files',    extensions: ['*']}
    ]
  },
  (projectPath) => {
    if (typeof projectPath === 'undefined') return;
    
    // Take the first selected project from the array
    projectPath = projectPath[0];
    
    fs.readFile(projectPath, (err, data) => {
      if (err) {
        throw err;
      }

      project = JSON.parse(data);
      win.webContents.send('project-load', project);
      
      lastChanged = project.lastChanged;
      win.webContents.send('project-altered', project, hasChanges());
    });
  });
}




module.exports = {
  reset:               newProject,
  save:                saveProject,
  saveAs:              saveAsProject,
  load:                loadProject,
  hasChanges:          hasChanges,
  updateHistory:       updateHistory,
  confirmSavedChanges: confirmSavedChanges,
  
  getProject:          () => project
};