"use strict";

const $                 = wfl.jquery;
const SubwindowView     = require('./SubwindowView');
const CssClass          = require('../CssClasses'); 
const {CheckBox,
       InputTextPair,
       MenuItem,
       MenuButton}      = require('../ui');
const {Action,
       ActionPerformer} = require('../action');

class PropertiesView extends SubwindowView {
  constructor() {
    super();
    
    this.label = $("<div>").html("Properties");
    this.label.addClass(CssClass.MENU_LABEL);
    
    this.buttonContainer = $("<span>");
    this.label.append(this.buttonContainer);
    
    this.addPropertyBtn = new MenuButton('add_box');
    this.addPropertyBtn.element.on('click', (e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        this.addProperty();
      }
    });
    this.buttonContainer.prepend(this.addPropertyBtn.element);
    
    this.saveBtn = new MenuButton('save');
    this.saveBtn.element.on('click', (e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        this.saveProperties();
      }
    });
    
    this.solidCheckbox    = new CheckBox('Solid');
    this.fixedCheckbox    = new CheckBox('Fixed');
    this.persistsCheckbox = new CheckBox('Persists');
    
    $(this.solidCheckbox).on('change',    (e) => this.changeSolid());
    $(this.fixedCheckbox).on('change',    (e) => this.changeFixed());
    $(this.persistsCheckbox).on('change', (e) => this.changePersists());
    
    this.propertiesContainer = $("<div>");
    this.properties = [];
    
    this.element.append(this.label);
    this.element.append(this.solidCheckbox.element);
    this.element.append(this.fixedCheckbox.element);
    this.element.append(this.persistsCheckbox.element);
    this.element.append(this.propertiesContainer);
    this.element.append(this.saveBtn.element);
    
    this.reset();
  }
  
  reset() {
    this.gameObjects = [];
    this.props       = [];
    this.physics     = [];
    
    this.clearProperties();
    
    this.solidCheckbox.value = false;
    this.fixedCheckbox.value = false;
    this.persistsCheckbox.value = false;
    
    this.solidCheckbox.disable();
    this.fixedCheckbox.disable();
    this.persistsCheckbox.disable();
    
    this.solidCheckbox.uncheck();
    this.fixedCheckbox.uncheck();
    this.persistsCheckbox.uncheck();
  }
  
  clearProperties() {
    for (let prop of this.properties) {
      prop.destroy();
    }
    
    this.propertiesContainer.empty();
    this.properties = []
  }
  
  addProperty(key, value) {
    if (this.gameObjects.length > 0) {
      let newInput = new InputTextPair(key, value);
      this.propertiesContainer.append(newInput.element);
      this.properties.push(newInput);
    }
  }
  
  saveProperties() {
    if (this.gameObjects.length > 0) {
      // TODO: Fix props so they merge with changes in a selection
      for (let gameObject of this.gameObjects) {
        let props = [];

        for (const prop of this.properties) {
          let key = prop.label.val();
          let val = prop.data.val();
          props.push({
            key: key,
            val: val
          });
        }
        
        gameObject.customData.props = props;
      }
    }
  }
  
  changeSolid() {
    let data = {
      entities: this.gameObjects,
      prevValues: this.gameObjects.map((x) => x.customData.physics.solid),
      values: this.gameObjects.map((x) => this.solidCheckbox.value)
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_SOLID,
      data
    );
  }
  
  changeFixed() {
    let data = {
      entities: this.gameObjects,
      prevValues: this.gameObjects.map((x) => x.customData.physics.fixed),
      values: this.gameObjects.map((x) => this.fixedCheckbox.value)
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_FIXED,
      data
    );
  }
  
  changePersists() {
    let data = {
      entities: this.gameObjects,
      prevValues: this.gameObjects.map((x) => x.customData.physics.persists),
      values: this.gameObjects.map((x) => this.persistsCheckbox.value)
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_PERSISTS,
      data
    );
  }
  
  onActionEntitySelect(action) {
    this.clearProperties();
    
    this.solidCheckbox.enable();
    this.fixedCheckbox.enable();
    this.persistsCheckbox.enable();
    
    this.gameObjects = action.data.gameObjects;
    let props        = this._consolidateProps(this.gameObjects);
    let physics      = this._consolidatePhysics(this.gameObjects);
    
    for (const prop of props) {
      let key = prop.key;
      let val = prop.val;
      this.addProperty(key, val);
    }
    
    this.solidCheckbox.value    = physics.solid;
    this.fixedCheckbox.value    = physics.fixed;
    this.persistsCheckbox.value = physics.persists;
  }
  
  onActionEntityDeselect(action) {
    this.reset();
  }
  
  onActionPropertyChangeSolid(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      
      if (!entity.customData.physics) {
        this._addDefaultPhysicsProperties(entity);
      }
      
      entity.customData.physics.solid = values[i];
    }
    
    let physics                 = this._consolidatePhysics(this.gameObjects);
    this.solidCheckbox.value    = physics.solid;
    this.fixedCheckbox.value    = physics.fixed;
    this.persistsCheckbox.value = physics.persists;
  }
  
  onActionPropertyChangeFixed(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      
      if (!entity.customData.physics) {
        this._addDefaultPhysicsProperties(entity);
      }
      
      entity.customData.physics.fixed = values[i];
    }
    
    let physics                 = this._consolidatePhysics(this.gameObjects);
    this.solidCheckbox.value    = physics.solid;
    this.fixedCheckbox.value    = physics.fixed;
    this.persistsCheckbox.value = physics.persists;
  }
  
  onActionPropertyChangePersists(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      
      if (!entity.customData.physics) {
        this._addDefaultPhysicsProperties(entity);
      }
      
      entity.customData.physics.persists = values[i];
    }
    
    let physics                 = this._consolidatePhysics(this.gameObjects);
    this.solidCheckbox.value    = physics.solid;
    this.fixedCheckbox.value    = physics.fixed;
    this.persistsCheckbox.value = physics.persists;
  }
  
  _consolidateProps(gameObjects) {
    let entries = {};
    let consolidatedProps = [];
    
    // Each key in entries will map to an array of values for the selection
    for (let gameObject of gameObjects) {
      if (gameObject.customData.props) {
        for (const prop of gameObject.customData.props) {
          let key = prop.key;
          let val = prop.val;

          if (!(key in entries)) {
            entries[key] = [];
          }

          entries[key].push(val);
        }
      }
    }
    
    let keys = Object.keys(entries);
    
    // If the amount of values for a key is equal to the amount of game objects
    // then this key is shared among all game objects in the selection
    for (const key of keys) {
      let values = entries[key];
      
      if (values.length === gameObjects.length) {
        let initialValue       = values[0];
        let allValuesAreShared = true;

        for (const value of values) {
          if (value !== initialValue) {
            allValuesAreShared = false;
            break;
          }
        }
        
        // If all values are the same, that value can be displayed
        if (allValuesAreShared) {
          consolidatedProps.push({
            key: key,
            val: initialValue
          });
        
        // Otherwise, null is used to represent an "indeterminate" value
        } else {
          consolidatedProps.push({
            key: key,
            val: null
          });
        }
      }
    }
    
    return consolidatedProps;
  }
  
  _consolidatePhysics(gameObjects) {
    let consolidatedPhysics = {
      solid:    false,
      fixed:    false,
      persists: false
    };
    
    // Add default physics to game objects that don't have physics properties
    // defined
    for (let gameObject of gameObjects) {
      if (typeof gameObject.customData.physics === 'undefined') {
        this._addDefaultPhysicsProperties(gameObject);
      }
    }
    
    if (gameObjects.length > 0) {
      let phys                     = gameObjects[0].customData.physics;
      consolidatedPhysics.solid    = phys.solid;
      consolidatedPhysics.fixed    = phys.fixed;
      consolidatedPhysics.persists = phys.persists;
    }
    
    // Go through the selection and check if all game objects have the same
    // value for their physics properties. Otherwise, conflicting properties 
    // are in an "indeterminate" state
    if (gameObjects.length > 1) {
      for (let gameObject of gameObjects) {
        let phys          = gameObject.customData.physics;
        let matchSolid    = consolidatedPhysics.solid    === phys.solid;
        let matchFixed    = consolidatedPhysics.fixed    === phys.fixed;
        let matchPersists = consolidatedPhysics.persists === phys.persists;

        if (!matchSolid) {
          consolidatedPhysics.solid = null;
        } else if (consolidatedPhysics.solid !== null) {
          consolidatedPhysics.solid = phys.solid;
        }

        if (!matchFixed) {
          consolidatedPhysics.fixed = null;
        } else if (consolidatedPhysics.fixed !== null) {
          consolidatedPhysics.fixed = phys.fixed;
        }

        if (!matchPersists) {
          consolidatedPhysics.persists = null;
        } else if (consolidatedPhysics.persists !== null) {
          consolidatedPhysics.persists = phys.persists;
        }
      }
    }
    
    return consolidatedPhysics;
  }
  
  _addDefaultPhysicsProperties(gameObject) {
    gameObject.customData.physics = {
      solid:    false,
      fixed:    false,
      persists: false
    };
  }
}

module.exports = PropertiesView;