const {remote}          = require('electron');
const {Project}         = remote.require('./scripts/file');
const path              = remote.require('path');

const ArrowKeyMovement = require('./ArrowKeyMovement');

let loadedBehaviors = {};

function updateBehaviors(behaviorData) {
  loadedBehaviors = {};
  
  for (let behavior of behaviorData) {
    let {module, absolutePath, basename, name} = behavior;
    loadedBehaviors[name] = behavior;
  }
}

module.exports = {
  ArrowKeyMovement:   ArrowKeyMovement,
  
  updateBehaviors:    updateBehaviors,
  getLoadedBehaviors: () => loadedBehaviors
};