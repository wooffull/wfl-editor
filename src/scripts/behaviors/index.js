const {remote}          = require('electron');
const {Project}         = remote.require('./scripts/file');
const path              = remote.require('path');
const Behavior          = wfl.behavior.Behavior;

const ArrowKeyMovement = require('./ArrowKeyMovement');

let loadedBehaviors = {};

function updateBehaviors(behaviorData) {
  loadedBehaviors = {};
  
  for (let behavior of behaviorData) {
    if (typeof behavior.module === 'function') {
      loadedBehaviors[behavior.name] = cloneBehavior(behavior);
    }
  }
}

function cloneBehavior(behavior) {
  let clonedBehavior = {
    module:       behavior.module,
    absolutePath: behavior.absolutePath,
    basename:     behavior.basename,
    name:         behavior.name,
    properties:   {},
    clone:        () => cloneBehavior(clonedBehavior)
  };

  if (clonedBehavior.module !== undefined) {
    let clonedPropertyKeys = Object.keys(clonedBehavior.module);

    for (let cloneKey of clonedPropertyKeys) {
      // Clone the property if it exists
      if ('properties' in behavior) {
        clonedBehavior.properties[cloneKey] =
          behavior.properties[cloneKey].clone();

      // Otherwise, the properties haven't been defined yet, so clone them from
      // the module definitions directly
      } else {
        clonedBehavior.properties[cloneKey] = 
          behavior.module[cloneKey].clone();
      }
    }
  }
  
  return clonedBehavior;
}

module.exports = {
  ArrowKeyMovement:   ArrowKeyMovement,
  
  updateBehaviors:    updateBehaviors,
  getLoadedBehaviors: () => loadedBehaviors,
  getPlaceholderBehavior: () => {
    let placeholder = {
      module:       undefined,
      absolutePath: undefined,
      basename:     undefined,
      name:         undefined,
      properties:   {},
      clone:        () => cloneBehavior(placeholder)
    };
    return placeholder;
  }
};