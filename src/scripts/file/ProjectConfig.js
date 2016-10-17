"use strict";

const fs        = require('fs');
const AppConfig = require('./AppConfig');

let projectConfig = {};
let basePath      = AppConfig.basePath;

// Saves the config for the game editor
function saveConfig(config = {}) {
  let configJson = JSON.stringify(config, null, '  ');
  
  fs.writeFile(basePath + '/projects/config.json', configJson, {flag: 'wx'}, (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });
}

// Loads the config for the game editor
// ./projects/config.json will be created if it does not already exist
function loadConfig() {
  fs.readFile(basePath + '/projects/config.json', (err, data) => {
    if (err) {
      saveConfig();
      return;
    }
    
    projectConfig = JSON.parse(data);
  });
}

loadConfig();

module.exports = {
  saveConfig: saveConfig,
  loadConfig: loadConfig,
  getConfig: () => projectConfig
};