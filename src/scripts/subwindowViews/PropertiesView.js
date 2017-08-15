"use strict";

const $                 = wfl.jquery;
const PhysicsObject     = wfl.core.entities.PhysicsObject;
const SubwindowView     = require('./SubwindowView');
const CssClass          = require('../CssClasses');
const {DataValidator}   = require('../util');
const {CheckBox,
       InputText,
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
    
    /**
     * CREATE UI ELEMENTS
     */
    // -------------------- CHECKBOXES --------------------
    this.solidCheckbox      = new CheckBox('Solid');
    this.fixedCheckbox      = new CheckBox('Fixed');
    this.persistsCheckbox   = new CheckBox('Persists');
    
    // -------------------- INPUT TEXT --------------------
    this.positionXInputText = new InputText(
      "Position (X)",
      0,
      3,
      DataValidator.keyValidatorForNumbers
    );
    this.positionYInputText = new InputText(
      "Position (Y)",
      0,
      3,
      DataValidator.keyValidatorForNumbers
    );
    this.rotationInputText = new InputText(
      "Rotation",
      0,
      3,
      DataValidator.keyValidatorForNumbers
    );
    this.massInputText = new InputText(
      "Mass",
      PhysicsObject.DEFAULT_MASS,
      3,
      DataValidator.keyValidatorForPositiveNumbers
    );
    this.frictionInputText = new InputText(
      "Surface Friction",
      PhysicsObject.DEFAULT_SURFACE_FRICTION,
      3,
      DataValidator.keyValidatorForNumbers
    );
    this.restitutionInputText = new InputText(
      "Surface Restitution",
      PhysicsObject.DEFAULT_SURFACE_RESTITUTION,
      3,
      DataValidator.keyValidatorForNumbers
    );
    
    // A map from physics property key to UI element.
    // Used to quickly iterate over UI elements and assign values
    this.physicsUiMap = {
      solid:       this.solidCheckbox,
      fixed:       this.fixedCheckbox,
      persists:    this.persistsCheckbox,
      x:           this.positionXInputText,
      y:           this.positionYInputText,
      rotation:    this.rotationInputText,
      mass:        this.massInputText,
      friction:    this.frictionInputText,
      restitution: this.restitutionInputText
    };
    
    $(this.solidCheckbox).on('change',        (e) => this.changeSolid());
    $(this.fixedCheckbox).on('change',        (e) => this.changeFixed());
    $(this.persistsCheckbox).on('change',     (e) => this.changePersists());
    $(this.positionXInputText).on('change',   (e) => this.changePositionX());
    $(this.positionYInputText).on('change',   (e) => this.changePositionY());
    $(this.rotationInputText).on('change',    (e) => this.changeRotation());
    $(this.massInputText).on('change',        (e) => this.changeMass());
    $(this.frictionInputText).on('change',    (e) => this.changeFriction());
    $(this.restitutionInputText).on('change', (e) => this.changeRestitution());
    
    this.propertiesContainer = $("<div>");
    this.properties = [];
    
    this.element.append(this.label);
    this.element.append(this.positionXInputText.element);
    this.element.append(this.positionYInputText.element);
    this.element.append(this.rotationInputText.element);
    this.element.append(this.solidCheckbox.element);
    this.element.append(this.fixedCheckbox.element);
    this.element.append(this.persistsCheckbox.element);
    this.element.append(this.massInputText.element);
    this.element.append(this.frictionInputText.element);
    this.element.append(this.restitutionInputText.element);
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
    this.positionXInputText.value = '';
    this.positionYInputText.value = '';
    this.rotationInputText.value = '';
    this.massInputText.value = '';
    this.frictionInputText.value = '';
    this.restitutionInputText.value = '';
    
    this._disablePhysicsPropertiesDisplay();
    
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
  
  changePositionX() {
    let value = DataValidator.stringToNumberOrDefault(
      this.positionXInputText.value,
      this.positionXInputText._prevValue
    );
    
    // If the validated value is equivalent to its previous value, don't
    // perform an action for its change
    if (value === parseFloat(this.positionXInputText._prevValue)) {
      this.positionXInputText.value = value;
      return;
    }
    
    let data = {
      entities: this.gameObjects,
      prevValues: this.gameObjects.map((x) => x.customData.physics.x),
      values: this.gameObjects.map((x) => value)
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_POSITION_X,
      data
    );
  }
  
  changePositionY() {
    let value = DataValidator.stringToNumberOrDefault(
      this.positionYInputText.value,
      this.positionYInputText._prevValue
    );
    
    // If the validated value is equivalent to its previous value, don't
    // perform an action for its change
    if (value === parseFloat(this.positionYInputText._prevValue)) {
      this.positionYInputText.value = value;
      return;
    }
    
    let data = {
      entities: this.gameObjects,
      prevValues: this.gameObjects.map((x) => x.customData.physics.y),
      values: this.gameObjects.map((x) => value)
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_POSITION_Y,
      data
    );
  }
  
  changeRotation() {
    let value = DataValidator.stringToNumberOrDefault(
      this.rotationInputText.value,
      this.rotationInputText._prevValue
    );
    
    // If the validated value is equivalent to its previous value, don't
    // perform an action for its change
    if (value === parseFloat(this.rotationInputText._prevValue)) {
      this.rotationInputText.value = value;
      return;
    }
    
    let data = {
      entities: this.gameObjects,
      prevValues: this.gameObjects.map((x) => x.customData.physics.rotation),
      values: this.gameObjects.map((x) => value)
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_ROTATION,
      data
    );
  }
  
  changeMass() {
    let value = DataValidator.stringToNumberOrDefault(
      this.massInputText.value,
      this.massInputText._prevValue
    );
    
    // If the validated value is equivalent to its previous value, don't
    // perform an action for its change
    if (value === parseFloat(this.massInputText._prevValue)) {
      this.massInputText.value = value;
      return;
    }
    
    let data = {
      entities: this.gameObjects,
      prevValues: this.gameObjects.map((x) => x.customData.physics.mass),
      values: this.gameObjects.map((x) => value)
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_MASS,
      data
    );
  }
  
  changeFriction() {
    let value = DataValidator.stringToNumberOrDefault(
      this.frictionInputText.value,
      this.frictionInputText._prevValue
    );
    
    // If the validated value is equivalent to its previous value, don't
    // perform an action for its change
    if (value === parseFloat(this.frictionInputText._prevValue)) {
      this.frictionInputText.value = value;
      return;
    }
    
    let data = {
      entities: this.gameObjects,
      prevValues: this.gameObjects.map((x) => x.customData.physics.friction),
      values: this.gameObjects.map((x) => value)
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_FRICTION,
      data
    );
  }
  
  changeRestitution() {
    let value = DataValidator.stringToNumberOrDefault(
      this.restitutionInputText.value,
      this.restitutionInputText._prevValue
    );
    
    // If the validated value is equivalent to its previous value, don't
    // perform an action for its change
    if (value === parseFloat(this.frictionInputText._prevValue)) {
      this.frictionInputText.value = value;
      return;
    }
    
    let data = {
      entities: this.gameObjects,
      prevValues: this.gameObjects.map(
                    (x) => x.customData.physics.restitution
                  ),
      values: this.gameObjects.map((x) => value)
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_RESTITUTION,
      data
    );
  }
  
  onActionEntitySelect(action) {
    this.clearProperties();
    this._enablePhysicsPropertiesDisplay();
    
    this.gameObjects = action.data.gameObjects;
    let props        = this._consolidateProps(this.gameObjects);
    
    for (const prop of props) {
      let key = prop.key;
      let val = prop.val;
      this.addProperty(key, val);
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionEntityDeselect(action) {
    this.reset();
  }
  
  onActionPropertyChangeSolid(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      this._validatePhysicsProperties(entity);
      entity.customData.physics.solid = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangeFixed(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      this._validatePhysicsProperties(entity);
      entity.customData.physics.fixed = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangePersists(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      this._validatePhysicsProperties(entity);
      entity.customData.physics.persists = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangePositionX(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      this._validatePhysicsProperties(entity);
      entity.customData.physics.x = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangePositionY(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      this._validatePhysicsProperties(entity);
      entity.customData.physics.y = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangeRotation(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      this._validatePhysicsProperties(entity);
      entity.customData.physics.rotation = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangeMass(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      this._validatePhysicsProperties(entity);
      entity.customData.physics.mass = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangeFriction(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      this._validatePhysicsProperties(entity);
      entity.customData.physics.friction = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangeRestitution(action) {
    let {values, entities} = action.data;
    
    for (let i = 0; i < entities.length; i++) {
      let entity = entities[i];
      this._validatePhysicsProperties(entity);
      entity.customData.physics.restitution = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
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
    let consolidatedPhysics = this._createDefaultPhysicsProperties();
    let physicsKeys         = Object.keys(consolidatedPhysics);
    
    // Add default physics to game objects that don't have physics properties
    // defined
    for (let gameObject of gameObjects) {
      this._validatePhysicsProperties(gameObject);
    }
    
    if (gameObjects.length > 0) {
      // Start comparisons against the first game object's physics propeties
      Object.assign(consolidatedPhysics, gameObjects[0].customData.physics);
    
      // Go through the selection and check if all game objects have the same
      // value for their physics properties. Otherwise, conflicting properties 
      // are in an "indeterminate" state
      if (gameObjects.length > 1) {
        for (let gameObject of gameObjects) {
          for (let key of physicsKeys) {
            this._consolidatePhysicsProperty(
              key,
              consolidatedPhysics,
              gameObject.customData.physics
            );
          }
        }
      }
    }
    
    return consolidatedPhysics;
  }
  
  _consolidatePhysicsProperty(key, consolidation, source) {
    if (consolidation[key] !== source[key]) {
      consolidation[key] = null;
    } else if (consolidation[key] !== null) {
      consolidation[key] = source[key];
    }
  }
  
  _createDefaultPhysicsProperties() {
    return {
      solid:       false,
      fixed:       false,
      persists:    false,
      x:           0,
      y:           0,
      rotation:    0,
      mass:        PhysicsObject.DEFAULT_MASS,
      friction:    PhysicsObject.DEFAULT_SURFACE_FRICTION,
      restitution: PhysicsObject.DEFAULT_SURFACE_RESTITUTION
    };
  }
  
  /**
   * Ensures gameObject has a valid value for all physics properties
   *
   * Note: Adds an object for default physics properties if none exists
   * Note: Adds properties with default values to gameObject's physics object
   * for any that don't exist
   */
  _validatePhysicsProperties(gameObject) {
    // TODO: Keep a single reference to default physics instead of creating one
    // for every function call?
    let defaultPhys = this._createDefaultPhysicsProperties();
    
    if (typeof gameObject.customData.physics === 'undefined') {
      gameObject.customData.physics = defaultPhys;
    } else {
      let phys = gameObject.customData.physics;
      let keys = Object.keys(defaultPhys);
      
      for (let key of keys) {
        if (typeof phys[key] === "undefined") {
          phys[key] = defaultPhys[key];
        }
      }
    }
  }
  
  /**
   * Reflects the current selection of gameObjects's physics properties in UI
   */
  _updatePhysicsPropertiesDisplay() {
    let physics = this._consolidatePhysics(this.gameObjects);
    let keys    = Object.keys(this.physicsUiMap);
    
    for (let key of keys) {
      this.physicsUiMap[key].value = physics[key];
    }
  }
  
  _enablePhysicsPropertiesDisplay() {
    for (let key of Object.keys(this.physicsUiMap)) {
      this.physicsUiMap[key].enable();
    }
  }
  
  _disablePhysicsPropertiesDisplay() {
    for (let key of Object.keys(this.physicsUiMap)) {
      this.physicsUiMap[key].disable();
    }
  }
}

module.exports = PropertiesView;