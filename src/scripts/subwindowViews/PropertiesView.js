"use strict";

const $                 = wfl.jquery;
const SubwindowView     = require('./SubwindowView');
const CssClass          = require('../CssClasses'); 
const {InputText,
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
    
    this.propertiesContainer = $("<div>");
    
    this.properties = [];
    
    this.element.append(this.label);
    this.element.append(this.propertiesContainer);
    this.element.append(this.saveBtn.element);
    
    this.gameObject = null;
    
    this.reset();
  }
  
  reset() {
    this.gameObject = null;
    this.clearProperties();
  }
  
  clearProperties() {
    this.propertiesContainer.empty();
    this.properties = []
  }
  
  addProperty(key, value) {
    if (this.gameObject) {
      let newInput = new InputText(key, value);
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
  
  
  onActionEntitySelect(action) {
    this.clearProperties();
    
    this.gameObject = action.data.gameObject;
    let props = this.gameObject.customData.props;
    
    if (!props) {
      props = this.gameObject.customData.props = [];
    }
    
    for (const prop of props) {
      let key = prop.key;
      let val = prop.value;
      
      this.addProperty(key, val);
    }
  }
  
  onActionEntityDeselect(action) {
  }
}

module.exports = PropertiesView;