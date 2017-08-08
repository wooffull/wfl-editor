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
    
    this.gameObject = null;
    
    this.reset();
  }
  
  reset() {
    this.gameObject = null;
    this.clearProperties();
    
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
    if (this.gameObject) {
      let newInput = new InputTextPair(key, value);
      this.propertiesContainer.append(newInput.element);
      this.properties.push(newInput);
    }
  }
  
  saveProperties() {
    if (this.gameObject) {
      let props = [];
      
      for (const prop of this.properties) {
        let key = prop.label.val();
        let val = prop.data.val();
        props.push({
          key: key,
          value: val
        })
      }
      
      this.gameObject.customData.props = props;
    }
  }
  
  changeSolid() {
    let data = {
      entities: [this.gameObject],
      value: this.solidCheckbox.value
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_SOLID,
      data
    );
  }
  
  changeFixed() {
    let data = {
      entities: [this.gameObject],
      value: this.fixedCheckbox.value
    };
    ActionPerformer.do(
      Action.Type.PROPERTY_CHANGE_FIXED,
      data
    );
  }
  
  changePersists() {
    let data = {
      entities: [this.gameObject],
      value: this.persistsCheckbox.value
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
    
    this.gameObject = action.data.gameObject;
    let props   = this.gameObject.customData.props;
    let physics = this.gameObject.customData.physics;
    
    if (!props) {
      this.gameObject.customData.props = [];
      props = this.gameObject.customData.props;
    }
    
    if (!physics) {
      this.gameObject.customData.physics = {
        solid:    false,
        fixed:    false,
        persists: false
      }
      
      physics = this.gameObject.customData.physics;
    }
    
    for (const prop of props) {
      let key = prop.key;
      let val = prop.value;
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
    let {value, entities} = action.data;
    
    this.solidCheckbox.value = value;
    
    for (let entity of entities) {
      entity.customData.physics.solid = value;
    }
  }
  
  onActionPropertyChangeFixed(action) {
    let {value, entities} = action.data;
    
    this.fixedCheckbox.value = value;
    
    for (let entity of entities) {
      entity.customData.physics.fixed = value;
    }
  }
  
  onActionPropertyChangePersists(action) {
    let {value, entities} = action.data;
    
    this.persistsCheckbox.value = value;
    
    for (let entity of entities) {
      entity.customData.physics.persists = value;
    }
  }
}

module.exports = PropertiesView;