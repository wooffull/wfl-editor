"use strict";

const $                 = wfl.jquery;
const PhysicsObject     = wfl.core.entities.PhysicsObject;
const SubwindowView     = require('./SubwindowView');
const CssClass          = require('../CssClasses');
const popup             = require('../popup');
const {DataValidator}   = require('../util');
const {CheckBox,
       InputText,
       Menu,
       BehaviorMenuItem,
       Button}          = require('../ui');
const {Action,
       ActionPerformer} = require('../action');

class PropertiesView extends SubwindowView {
  constructor() {
    super();
    
    this.label = $("<div>").html("Properties");
    this.label.addClass(CssClass.MENU_LABEL);
    
    /**
     * CREATE UI ELEMENTS
     */
    // -------------------- CHECKBOXES --------------------
    this.solidCheckbox      = new CheckBox('Solid');
    this.fixedCheckbox      = new CheckBox('Fixed');
    this.persistsCheckbox   = new CheckBox('Persists');
    
    // -------------------- INPUT TEXT --------------------
    this.nameInputText = new InputText(
      "Name",
      0,
      3
    );
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
    
    // Maps from property keys to UI element.
    // Used to quickly iterate over UI elements and assign values
    this.propertiesUiMap = {
      name:     this.nameInputText,
      x:        this.positionXInputText,
      y:        this.positionYInputText,
      rotation: this.rotationInputText
    };
    this.physicsUiMap = {
      solid:       this.solidCheckbox,
      fixed:       this.fixedCheckbox,
      persists:    this.persistsCheckbox,
      mass:        this.massInputText,
      friction:    this.frictionInputText,
      restitution: this.restitutionInputText
    };
    
    $(this.nameInputText).on('change',        (e) => this.changeName());
    $(this.positionXInputText).on('change',   (e) => this.changePosition());
    $(this.positionYInputText).on('change',   (e) => this.changePosition());
    $(this.rotationInputText).on('change',    (e) => this.changeRotation());
    $(this.solidCheckbox).on('change',        (e) => this.changeSolid());
    $(this.fixedCheckbox).on('change',        (e) => this.changeFixed());
    $(this.persistsCheckbox).on('change',     (e) => this.changePersists());
    $(this.massInputText).on('change',        (e) => this.changeMass());
    $(this.frictionInputText).on('change',    (e) => this.changeFriction());
    $(this.restitutionInputText).on('change', (e) => this.changeRestitution());
    
    // Set up UI for Behaviors
    this.behaviorsLabel = $("<div>").html("Behaviors");
    this.behaviorsLabel.addClass(CssClass.MENU_LABEL);
    
    this.addBehaviorBtn = new Button("Add New Behavior");
    $(this.addBehaviorBtn).on('click', () => this._onAddBehaviorBtnClick());
    
    this.behaviorMenu = new Menu('');
    
    this.element.append(this.label);
    this.element.append(this.nameInputText.element);
    this.element.append(this.positionXInputText.element);
    this.element.append(this.positionYInputText.element);
    this.element.append(this.rotationInputText.element);
    this.element.append(this.solidCheckbox.element);
    this.element.append(this.fixedCheckbox.element);
    this.element.append(this.persistsCheckbox.element);
    this.element.append(this.massInputText.element);
    this.element.append(this.frictionInputText.element);
    this.element.append(this.restitutionInputText.element);
    this.element.append($("<br>"));
    this.element.append(this.behaviorsLabel);
    this.element.append(this.addBehaviorBtn.element);
    this.element.append(this.behaviorMenu.element);
    
    this.reset();
  }
  
  reset() {
    this.gameObjects = [];
    this.physics     = [];
    
    this.solidCheckbox.uncheck();
    this.fixedCheckbox.uncheck();
    this.persistsCheckbox.uncheck();
    
    this._disablePropertiesDisplay();
    this._disablePhysicsPropertiesDisplay();
    this._disableBehaviorsDisplay();
    
    this._updatePropertiesDisplay();
    this._updatePhysicsPropertiesDisplay();
    this._updateBehaviorsDisplay();
    
    this.nameInputText.value        = '';
    this.positionXInputText.value   = '';
    this.positionYInputText.value   = '';
    this.rotationInputText.value    = '';
    this.solidCheckbox.value        = false;
    this.fixedCheckbox.value        = false;
    this.persistsCheckbox.value     = false;
    this.massInputText.value        = '';
    this.frictionInputText.value    = '';
    this.restitutionInputText.value = '';
  }
  
  changeName() {
    let value = this.nameInputText.value;
    
    // If the value is equivalent to its previous value, don't perform an
    // action for its change
    if (value === this.nameInputText._prevValue) {
      return;
    }
    
    let data = {
      gameObjects: this.gameObjects,
      prevValues:  this.gameObjects.map((x) => x.name),
      values:      this.gameObjects.map((x) => value)
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_NAME,
      data
    );
  }
  
  changePosition() {
    let prevValueX = parseFloat(this.positionXInputText._prevValue);
    let prevValueY = parseFloat(this.positionYInputText._prevValue);
    let valueX = DataValidator.stringToNumberOrDefault(
      this.positionXInputText.value,
      prevValueX
    );
    let valueY = DataValidator.stringToNumberOrDefault(
      this.positionYInputText.value,
      prevValueY
    );
    
    // If the validated value is equivalent to its previous value, don't
    // perform an action for its change
    if (valueX === prevValueX) {
      this.positionXInputText.value = valueX;
    }
    
    // If the validated value is equivalent to its previous value, don't
    // perform an action for its change
    if (valueY === prevValueY) {
      this.positionYInputText.value = valueY;
    }
    
    let xChanged = !isNaN(valueX) && prevValueX !== valueX;
    let yChanged = !isNaN(valueY) && prevValueY !== valueY;
    
    if (!xChanged && !yChanged) {
      return;
    }
    
    let data = {
      gameObjects: this.gameObjects,
      dxList:      this.gameObjects.map(
        (obj) => xChanged ? valueX - obj.x : 0
      ),
      dyList:      this.gameObjects.map(
        (obj) => yChanged ? valueY - obj.y : 0
      )
    };
    ActionPerformer.do(
      Action.Type.WORLD_SELECTION_ALIGN,
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
    
    let radians = (value * Math.PI / 180) % (Math.PI * 2);
    
    let data = {
      gameObjects: this.gameObjects,
      dThetaList:  this.gameObjects.map((obj) => radians - obj.rotation),
      unique:      true
    };
    ActionPerformer.do(
      Action.Type.WORLD_SELECTION_ROTATE,
      data
    );
  }
  
  changeSolid() {
    let data = {
      gameObjects: this.gameObjects,
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
      gameObjects: this.gameObjects,
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
      gameObjects: this.gameObjects,
      prevValues: this.gameObjects.map((x) => x.customData.physics.persists),
      values: this.gameObjects.map((x) => this.persistsCheckbox.value)
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_PERSISTS,
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
      gameObjects: this.gameObjects,
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
      gameObjects: this.gameObjects,
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
      gameObjects: this.gameObjects,
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
  
  changeBehaviorProperty(propertyData) {
    let behaviorName  = propertyData.behavior.name;
    let propertyName  = propertyData.propertyName;
    let propertyValue = propertyData.property.value;
    
    let data = {
      gameObjects: this.gameObjects,
      prevValues: this.gameObjects.map(
                    (x) => {
                      let behavior = x.customData.behaviors[behaviorName];
                      return behavior.properties[propertyName].value;
                    }
                  ),
      values: this.gameObjects.map((x) => propertyValue),
      behaviorData: propertyData.behavior,
      propertyName: propertyName
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_BEHAVIOR,
      data
    );
  }
  
  onActionEntitySelect(action) {
    this.gameObjects = action.data.gameObjects;
    
    this._enablePropertiesDisplay();
    this._enablePhysicsPropertiesDisplay();
    this._enableBehaviorsDisplay();
    
    this._updatePropertiesDisplay();
    this._updatePhysicsPropertiesDisplay();
    this._updateBehaviorsDisplay();
  }
  
  onActionEntityDeselect(action) {
    this.reset();
  }
  
  onActionWorldSelectionMove(action) {
    this._updatePropertiesDisplay();
  }
  onActionWorldSelectionAlign(action) {
    this._updatePropertiesDisplay();
  }
  
  onActionWorldSelectionRotate(action) {
    this._updatePropertiesDisplay();
  }
  
  onActionPropertyChangeName(action) {
    let {values, gameObjects} = action.data;
    
    for (let i = 0; i < gameObjects.length; i++) {
      let gameObject = gameObjects[i];
      this._validateProperties(gameObject);
      gameObject.name = values[i];
    }
    
    this._updatePropertiesDisplay();
  }
  
  onActionPropertyChangeSolid(action) {
    let {values, gameObjects} = action.data;
    
    for (let i = 0; i < gameObjects.length; i++) {
      let gameObject = gameObjects[i];
      this._validatePhysicsProperties(gameObject);
      gameObject.customData.physics.solid = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangeFixed(action) {
    let {values, gameObjects} = action.data;
    
    for (let i = 0; i < gameObjects.length; i++) {
      let gameObject = gameObjects[i];
      this._validatePhysicsProperties(gameObject);
      gameObject.customData.physics.fixed = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangePersists(action) {
    let {values, gameObjects} = action.data;
    
    for (let i = 0; i < gameObjects.length; i++) {
      let gameObject = gameObjects[i];
      this._validatePhysicsProperties(gameObject);
      gameObject.customData.physics.persists = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangeMass(action) {
    let {values, gameObjects} = action.data;
    
    for (let i = 0; i < gameObjects.length; i++) {
      let gameObject = gameObjects[i];
      this._validatePhysicsProperties(gameObject);
      gameObject.customData.physics.mass = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangeFriction(action) {
    let {values, gameObjects} = action.data;
    
    for (let i = 0; i < gameObjects.length; i++) {
      let gameObject = gameObjects[i];
      this._validatePhysicsProperties(gameObject);
      gameObject.customData.physics.friction = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyChangeRestitution(action) {
    let {values, gameObjects} = action.data;
    
    for (let i = 0; i < gameObjects.length; i++) {
      let gameObject = gameObjects[i];
      this._validatePhysicsProperties(gameObject);
      gameObject.customData.physics.restitution = values[i];
    }
    
    this._updatePhysicsPropertiesDisplay();
  }
  
  onActionPropertyAddBehavior(action) {
    let {behaviorData} = action.data;
    
    if (typeof action.data.gameObjects === 'undefined') {
      // DATA_APPEND
      action.data.gameObjects = this.gameObjects.concat();
    }
    
    let gameObjects = action.data.gameObjects;
    for (let i = 0; i < gameObjects.length; i++) {
      let gameObject = gameObjects[i];
      gameObject.customData.behaviors[behaviorData.name] =
        behaviorData.clone();
    }
    
    this._updateBehaviorsDisplay();
  }
  
  onActionPropertyRemoveBehavior(action) {
    let {behaviorData, gameObjects} = action.data;
    
    for (let i = 0; i < gameObjects.length; i++) {
      let gameObject = gameObjects[i];
      gameObject.customData.behaviors[behaviorData.name] = null;
      delete gameObject.customData.behaviors[behaviorData.name];
    }
    
    this._updateBehaviorsDisplay();
  }
  
  onActionPropertyChangeBehavior(action) {
    let {values, behaviorData, propertyName, gameObjects} = action.data;
    
    for (let i = 0; i < gameObjects.length; i++) {
      let gameObject = gameObjects[i];
      let behavior = gameObject.customData.behaviors[behaviorData.name];
      behavior.properties[propertyName].value = values[i];
    }
    
    this._updateBehaviorsDisplay();
  }
  
  _onAddBehaviorBtnClick() {
    let data = {
      popupType: popup.Type.ADD_NEW_BEHAVIOR
    };
    ActionPerformer.do(
      Action.Type.GLOBAL_POPUP,
      data
    );
  }
  
  _removeBehavior(menuItem) {
    let data = {
      behaviorData: menuItem.data,
      gameObjects:  this.gameObjects.concat()
    };
    
    ActionPerformer.do(
      Action.Type.PROPERTY_REMOVE_BEHAVIOR,
      data
    );
  }
  
  _consolidateGameObjectBehaviors(gameObjects) {
    let consolidatedBehaviors = {};
    
    // Validate behaviors
    for (let gameObject of gameObjects) {
      if (!('behaviors' in gameObject.customData)) {
        gameObject.customData.behaviors = {};
      }
    }
    
    if (gameObjects.length > 0) {
      // Start comparisons against the first game object's behaviors
      let firstBehaviors = gameObjects[0].customData.behaviors;
      let firstBehaviorKeys = Object.keys(firstBehaviors);
      for (let key of firstBehaviorKeys) {
        consolidatedBehaviors[key] = firstBehaviors[key].clone();
      }
    
      // Go through the selection and check if all game objects have the same
      // properties for their behaviors. Otherwise, conflicting properties are
      // in an "indeterminate" state
      if (gameObjects.length > 1) {
        for (let gameObject of gameObjects) {
          this._consolidateBehaviors(
            consolidatedBehaviors,
            gameObject.customData.behaviors
          );
        }
      }
    }
    
    return consolidatedBehaviors;
  }
  
  _consolidateBehaviors(consolidations, sourceBehaviors) {
    let sourceBehaviorKeys = Object.keys(sourceBehaviors);
    let consolidatedKeys   = Object.keys(consolidations);
    let consolidatedBools  = {};
    
    for (let key of consolidatedKeys) {
      consolidatedBools[key] = false;
    }
    
    for (let sourceBehaviorKey of sourceBehaviorKeys) {
      let sourceBehavior = sourceBehaviors[sourceBehaviorKey];
      let behaviorName   = sourceBehavior.name;
      
      if (typeof consolidations[behaviorName] !== 'undefined') {
        this._consolidateBehaviorProperties(
          consolidations[behaviorName],
          sourceBehavior
        );
        consolidatedBools[behaviorName] = true;
      }
    }
    
    // If a behavior wasn't consolidated, it doesn't exist in both the source
    // and consolidations. Therefore, it cannot be consolidated and should be
    // removed from the consolidations.
    for (let key of consolidatedKeys) {
      if (!consolidatedBools[key]) {
        consolidations[key] = null;
        delete consolidations[key];
      }
    }
  }
  
  _consolidateBehaviorProperties(consolidatedBehavior, sourceBehavior) {
    let consolidatedKeys = Object.keys(consolidatedBehavior.module);
    
    for (const key of consolidatedKeys) {
      this._consolidateBehaviorProperty(
        key,
        consolidatedBehavior,
        sourceBehavior
      );
    }
  }
  
  _consolidateBehaviorProperty(key, consolidatedBehavior, sourceBehavior) {
    let sourceProperty = sourceBehavior.properties[key];
    let consolidatedProperty = consolidatedBehavior.properties[key];
    
    if (consolidatedBehavior.indeterminate !== true) {
      if (sourceProperty.value !== consolidatedProperty.value) {
        consolidatedProperty.indeterminate = true;
      } else {
        consolidatedProperty.value = sourceProperty.value;
      }
    }
  }
  
  _consolidateGameObjectProperties(gameObjects) {
    let consolidatedProperties = this._createDefaultProperties();
    let propertyKeys           = Object.keys(consolidatedProperties);
    
    // Add default values to game objects that don't have properties defined
    for (let gameObject of gameObjects) {
      this._validateProperties(gameObject);
    }
    
    if (gameObjects.length > 0) {
      // Start comparisons against the first game object's propeties
      Object.assign(
        consolidatedProperties,
        this._getGameObjectProperties(gameObjects[0])
      );
    
      // Go through the selection and check if all game objects have the same
      // value for their properties. Otherwise, conflicting properties are in
      // an "indeterminate" state
      if (gameObjects.length > 1) {
        for (let gameObject of gameObjects) {
          for (let key of propertyKeys) {
            this._consolidateProperty(
              key,
              consolidatedProperties,
              gameObject
            );
          }
        }
      }
    }
    
    return consolidatedProperties;
  }
  
  _consolidateGameObjectPhysics(gameObjects) {
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
            this._consolidateProperty(
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
  
  _consolidateProperty(key, consolidation, source) {
    if (consolidation[key] !== source[key]) {
      consolidation[key] = null;
    } else if (consolidation[key] !== null) {
      consolidation[key] = source[key];
    }
  }
  
  _getGameObjectProperties(gameObject) {
    let properties = this._createDefaultProperties();
    let keys       = Object.keys(properties);

    for (let key of keys) {
      properties[key] = gameObject[key];
    }
    
    return properties;
  }
  
  _createDefaultProperties() {
    return {
      name:     '',
      layer:    0,
      x:        0,
      y:        0,
      rotation: 0
    };
  }
  
  _createDefaultPhysicsProperties() {
    return {
      solid:       false,
      fixed:       false,
      persists:    false,
      mass:        PhysicsObject.DEFAULT_MASS,
      friction:    PhysicsObject.DEFAULT_SURFACE_FRICTION,
      restitution: PhysicsObject.DEFAULT_SURFACE_RESTITUTION
    };
  }
  
  /**
   * Ensures gameObject has a valid value for all customizable properties
   *
   * Note: Adds properties with default values to gameObject for any that don't
   * exist
   */
  _validateProperties(gameObject) {
    // TODO: Keep a single reference to default properties instead of creating
    // one for every function call?
    let defaultProps = this._createDefaultProperties();
    let keys         = Object.keys(defaultProps);

    for (let key of keys) {
      if (typeof gameObject[key] === "undefined") {
        gameObject[key] = defaultProps[key];
      }
    }
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
  
  _updateBehaviorsDisplay() {
    // First, remove the 'remove' listener for all menu items
    let behaviorLabels = this.behaviorMenu.getLabels();
    for (let label of behaviorLabels) {
      let behaviorMenuItem = this.behaviorMenu.find(label);
      $(behaviorMenuItem).off('remove');
    }
    
    // Then, consolidate the behaviors for the current game objects
    let consolidatedBehaviors =
        this._consolidateGameObjectBehaviors(this.gameObjects);
    let keys = Object.keys(consolidatedBehaviors);
    
    // Then, clear the menu from before
    this.behaviorMenu.clear();
    
    // Finally, add all the new menu items and add 'remove' listeners to them
    for (let key of keys) {
      let behavior         = consolidatedBehaviors[key];
      let behaviorMenuItem = new BehaviorMenuItem(behavior.name, behavior);
      behaviorMenuItem.update();
      this.behaviorMenu.insert(behaviorMenuItem);
      
      $(behaviorMenuItem).on('remove', () => {
        this._removeBehavior(behaviorMenuItem);
      });
      $(behaviorMenuItem).on('change', (e, propertyData) => {
        this.changeBehaviorProperty(propertyData);
      });
    }
  }
  
  _enableBehaviorsDisplay() {
    this.addBehaviorBtn.enable();
  }
  
  _disableBehaviorsDisplay() {
    this.addBehaviorBtn.disable();
  }
  
  /**
   * Reflects the current selection of gameObjects's properties in UI
   */
  _updatePropertiesDisplay() {
    let properties = this._consolidateGameObjectProperties(this.gameObjects);
    let keys       = Object.keys(this.propertiesUiMap);
    
    for (let key of keys) {
      this.propertiesUiMap[key].value = properties[key];
    }
    
    // Convert rotation's input text from radians to angles
    let rotation = parseFloat(this.rotationInputText.value);
    if (!isNaN(rotation)) {
      rotation = (rotation * 180 / Math.PI) % 360;
      rotation = Math.round(rotation * 100) / 100;
      this.rotationInputText.value = rotation
    }
  }
  
  _enablePropertiesDisplay() {
    for (let key of Object.keys(this.propertiesUiMap)) {
      this.propertiesUiMap[key].enable();
    }
  }
  
  _disablePropertiesDisplay() {
    for (let key of Object.keys(this.propertiesUiMap)) {
      this.propertiesUiMap[key].disable();
    }
  }
  
  /**
   * Reflects the current selection of gameObjects's physics properties in UI
   */
  _updatePhysicsPropertiesDisplay() {
    let physics = this._consolidateGameObjectPhysics(this.gameObjects);
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