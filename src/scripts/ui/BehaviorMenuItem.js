"use strict";

const $               = wfl.jquery;
const PropertyType    = wfl.behavior.property.Type;
const HtmlElement     = require('./HtmlElement');
const CssClass        = require('../CssClasses');
const InputText       = require('./InputText');
const CheckBox        = require('./CheckBox');
const MenuButton      = require('./MenuButton');
const {DataValidator} = require('../util');

class BehaviorMenuItem extends HtmlElement {
  constructor(label, data) {
    super();
    
    this.element = $('<div>');
    
    this.topContainer = $('<div>');
    this.labelContainer = $('<span>');
    
    this.contentContainer = $('<div>');
    this.propertiesContainer = $('<div>').html('No properties');
    
    this.expandMoreBtn = new MenuButton('expand_more');
    this.expandLessBtn = new MenuButton('expand_less');
    this.removeBtn     = new MenuButton('remove');
    
    this.expandMoreBtn.element.on('click', (e) => this.expand());
    this.expandLessBtn.element.on('click', (e) => this.collapse());
    this.removeBtn.element.on('click',     (e) => this._onRemoveBtnClick());
    
    this.element.addClass(CssClass.BEHAVIOR_MENU_ITEM);
    this.topContainer.addClass(CssClass.BEHAVIOR_MENU_ITEM_TOP);
    this.labelContainer.addClass(CssClass.BEHAVIOR_MENU_ITEM_LABEL);
    this.contentContainer.addClass(CssClass.BEHAVIOR_MENU_ITEM_CONTENTS);
    this.propertiesContainer.addClass(
      CssClass.BEHAVIOR_MENU_ITEM_PROPERTY_CONTAINER
    );
    
    this.topContainer.append(this.labelContainer);
    this.topContainer.append(this.removeBtn.element);
    this.topContainer.append(this.expandMoreBtn.element);
    this.topContainer.append(this.expandLessBtn.element);
    this.element.append(this.topContainer);
    
    this.contentContainer.append(this.propertiesContainer);
    this.element.append(this.contentContainer);
    
    this.data = data;
    this.label = label;
    this.properties = [];
    this.expanded = true;
    
    this.expand();
    
    // Add any properties from the given data
    if ('properties' in data) {
      let keys = Object.keys(data.properties);
      for (let key of keys) {
        this.addProperty(key, data.properties[key]);
      }
    }
  }
  
  get label() {
    return this.labelContainer.html();
  }
  
  set label(value) {
    return this.labelContainer.html(value);
  }
  
  destroy() {
    $(this.expandMoreBtn.element).off();
    $(this.expandLessBtn.element).off();
    $(this.removeBtn.element).off();
    
    for (let property of this.properties) {
      $(property.htmlElement).off();
    }
  }
  
  expand() {
    this.element.removeClass('collapsed');
    this.expanded = true;
    
    this.expandMoreBtn.hide();
    this.expandLessBtn.show();
  }
  
  collapse() {
    this.element.addClass('collapsed');
    this.expanded = false;
    
    this.expandMoreBtn.show();
    this.expandLessBtn.hide();
  }
  
  update() {
    // Update to display indeterminate values
    for (let property of this.properties) {
      let {data, htmlElement} = property;
      
      if (data.value === null) {
        htmlElement.value = null;
      }
    }
  }
  
  addProperty(label, data) {
    if (this.properties.length === 0) {
      this.propertiesContainer.html('');
    }
    
    let container = $('<div>');
    let propertyHtmlElement = null;
    this.propertiesContainer.append(container);
    
    if (data && ('type' in data)) {
      switch (data.type) {
      case PropertyType.BOOLEAN:
        propertyHtmlElement = this._createBooleanProperty(label, data);
        break;
          
      case PropertyType.STRING:
        propertyHtmlElement = this._createStringProperty(label, data);
        break;
          
      case PropertyType.INTEGER:
        propertyHtmlElement = this._createIntegerProperty(label, data);
        break;
          
      case PropertyType.NUMBER:
        propertyHtmlElement = this._createNumberProperty(label, data);
        break;
        
      default:
        propertyHtmlElement = this._createDynamicProperty(label, data);
        break;
      }
      
      if (propertyHtmlElement) {
        propertyHtmlElement.element.addClass(
          CssClass.BEHAVIOR_MENU_ITEM_PROPERTY
        );
        container.append(propertyHtmlElement.element);
      }
    }
    
    let property = {
      container:   container,
      htmlElement: propertyHtmlElement,
      label:       label,
      data:        data
    };
    
    this.properties.push(property);
  }
  
  _createBooleanProperty(label, data) {
    let checkBox = new CheckBox(label);
    
    if (data.value === true) {
      checkBox.check();
    }
    
    $(checkBox).on('change', () => this._onPropertyChange(checkBox, data));
    return checkBox;
  }
  
  _createStringProperty(label, data) {
    let inputText = new InputText(
      label,
      data.value,
      10
    );
    $(inputText).on('change', () => this._onPropertyChange(inputText, data));
    return inputText;
  }
  
  _createIntegerProperty(label, data) {
    let inputText = new InputText(
      label,
      data.value,
      10,
      DataValidator.keyValidatorForIntegers
    );
    $(inputText).on('change', () => this._onPropertyChange(inputText, data));
    return inputText;
  }
  
  _createNumberProperty(label, data) {
    let inputText = new InputText(
      label,
      data.value,
      10,
      DataValidator.keyValidatorForNumbers
    );
    $(inputText).on('change', () => this._onPropertyChange(inputText, data));
    return inputText;
  }
  
  _createDynamicProperty(label, data) {
    let inputText = new InputText(
      label,
      data.value,
      10
    );
    $(inputText).on('change', () => this._onPropertyChange(inputText, data));
    return inputText;
  }
  
  _onPropertyChange(htmlElement, property) {
    let prevPropertyValue = property.value;
    
    // Try updating the value
    try {
      property.value = htmlElement.value;

      // If the update was successful, send out a notfication
      if (prevPropertyValue !== property.value) {
        let data = {
          property:     property,
          propertyName: htmlElement.label.html(),
          behavior:     this.data
        };
        $(this).trigger('change', [data]);

      // Otherwise keep the previous value
      } else {
        htmlElement.value = prevPropertyValue;
      }
    } catch (err) {
      property.value    = prevPropertyValue;
      htmlElement.value = prevPropertyValue;
    }
  }
  
  _onRemoveBtnClick() {
    $(this).trigger('remove');
  }
}

module.exports = BehaviorMenuItem;