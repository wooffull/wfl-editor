"use strict";

const fs         = require('fs-extra');
const path       = require('path');
const {dialog}   = require('electron');
const AppConfig  = require('./AppConfig');
const mkdirp     = require('mkdirp');
const browserify = require('browserify');

let win         = undefined;
let project     = undefined;
let lastChanged = undefined;
let basePath    = AppConfig.basePath;

function hasChanges() {
  return typeof win !== 'undefined' && typeof lastChanged !== 'undefined' && project.lastChanged !== lastChanged;
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
  win.webContents.send('project-new-finalize', project);
}


/**
 * Allows user to select the exported project's location with the file explorer 
 */
function exportProject() {
  let projectsPath = project.dirname || path.join(basePath, 'projects');
  
  dialog.showOpenDialog(win, {
    title:       'Export Project',
    defaultPath: projectsPath,
    buttonLabel: 'Export',
    properties: ['openDirectory']
  },
  (projectPath) => {
    if (typeof projectPath === 'undefined') return;
    
    // Take the first selected project from the array
    projectPath = projectPath[0];
    
    // The new folder to be created should be named after the project's title
    projectPath = path.join(projectPath, project.title || 'undefined');
    
    mkdirp(projectPath, function (err) {
      if (err && err.code !== 'EEXIST') {
        throw err;
      }
    
      let assetsPath = path.join(projectPath, 'assets');
      
      mkdirp(assetsPath, function (err) {
        if (err && err.code !== 'EEXIST') {
          throw err;
        }
        mkdirp(path.join(projectPath, 'behaviors'), function (err) {
          if (err && err.code !== 'EEXIST') {
            throw err;
          }
          
          let fileList = [];
          fileList.push({
            srcPath:  path.join(basePath, 'src', 'lib', 'wfl.js'),
            destPath: path.join(projectPath, 'wfl.js')
          });
          fileList.push({
            srcPath:  path.join(basePath, 'src', 'export', 'styles.css'),
            destPath: path.join(projectPath, 'styles.css')
          });
          fileList.push({
            srcPath:  path.join(basePath, 'src', 'export', 'game.js'),
            destPath: path.join(projectPath, 'game.js')
          });
          
          let copiedEntities = [];
          for (let entity of project.level.entities) {
            copiedEntities.push({
              imageSource: path.win32.basename(entity.imageSource),
              name: entity.name
            });
            
            fileList.push({
              srcPath:  entity.imageSource,
              destPath: path.join(
                assetsPath,
                path.win32.basename(entity.imageSource)
              )
            });
          }
          
          for (let fileData of fileList) {
            fs.writeFileSync(
              fileData.destPath,
              fs.readFileSync(fileData.srcPath)
            );
          }
          
          // Create level data for the exported game
          let levelData = {
            dynamicZOrder: project.level.dynamicZOrder,
            entities:      copiedEntities,
            gameObjects:   project.level.gameObjects
          };
          let gameData = {
            title: project.title,
            level: levelData
          };
          
          // Add the game data file
          fs.writeFileSync(
            path.join(projectPath, 'data.json'),
            JSON.stringify(gameData)
          );
          
          // Add the HTML file
          fs.writeFileSync(
            path.join(projectPath, 'index.html'),
`<!DOCTYPE html>
<html>
    <head>
        <title>${project.title}</title>
        
        <link rel="stylesheet" href="./styles.css">
    </head>
    <body>
        <canvas width="768" height="576" id="game-canvas"></canvas>
        <script src="./wfl.js"></script>
        <script src="./bundle.js"></script>
    </body>
</html>`
          );
          
          // Copy over all behaviors
          fs.readdir(path.join(project.dirname, 'behaviors'), (err, items) => {
            if (err) {
              throw err;
            }

            let behaviors = [];

            for (let item of items) {
              if (path.extname(item) === '.js') {
                behaviors.push(item);
              }
            }
            
            // Add the behaviors index
            let moduleString = 
`'use strict';
module.exports = {`;
            
            for (let behavior of behaviors) {
              let basename = path.win32.basename(behavior, '.js');
              moduleString += `${basename}: require('./${basename}.js'),`;
            }
            moduleString += '};';
            
            fs.writeFileSync(
              path.join(projectPath, 'behaviors', 'index.js'),
              moduleString
            );

            // Begin bundling game and behaviors
            let b = browserify();
            let writeStream = fs.createWriteStream(
              path.join(projectPath, 'bundle.js')
            );
            
            // Compile all behaviors into one bundle
            if (behaviors.length > 0) {
              for (let behavior of behaviors) {
                fs.writeFileSync(
                  path.join(projectPath, 'behaviors', behavior),
                  fs.readFileSync(
                    path.join(project.dirname, 'behaviors', behavior)
                  )
                );
              }

              for (let behavior of behaviors) {
                b.add(path.join(projectPath, 'behaviors', behavior));
              }
            }
            
            // Bundle the game and behaviors
            b.add(path.join(projectPath, 'game.js'));
            b.bundle().pipe(writeStream);
            
            // Remove temp files when the bundle is finished
            writeStream.on('finish', function () {
              fs.remove(path.join(projectPath, 'behaviors'));
              fs.remove(path.join(projectPath, 'game.js'));
            });
          });
        });
      });
    });
  });
}


/**
 * Allows user to select the project's directory with the file explorer to save a new project
 */
function saveAsProject(next) {
  let projectsPath = path.join(basePath, 'projects');
  
  dialog.showSaveDialog(win, {
    title:       'Save Project',
    defaultPath: projectsPath
  },
  (projectPath) => {
    if (typeof projectPath === 'undefined') return;
    
    // If likely overwriting another project, handle the paths accordingly
    if (path.extname(projectPath) === '.wfl') {
      project.dirname = path.dirname(projectPath);
      project.title   = path.win32.basename(project.dirname);
    } else {
      project.dirname = projectPath;
      project.title   = path.win32.basename(projectPath);
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
      win.webContents.send('project-save-finalize', project);
      
      if (next) next();
    });
  });
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
      win.webContents.send('project-load-finalize', project);
      
      lastChanged = project.lastChanged;
      win.webContents.send('project-altered', project, hasChanges());
    });
  });
}




module.exports = {
  reset:               newProject,
  save:                saveProject,
  saveAs:              saveAsProject,
  export:              exportProject,
  load:                loadProject,
  hasChanges:          hasChanges,
  updateHistory:       updateHistory,
  confirmSavedChanges: confirmSavedChanges,
  
  getProject:          () => project
};