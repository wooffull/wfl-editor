"use strict";

const $               = wfl.jquery;
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
    this.propertiesContainer = $('<div>')
      .html('No properties');
    
    this.expandMoreBtn = new MenuButton('expand_more');
    this.expandLessBtn = new MenuButton('expand_less');
    this.removeBtn     = new MenuButton('remove');
    
    this.expandMoreBtn.element.on('click', (e) => this.expand());
    this.expandLessBtn.element.on('click', (e) => this.collapse());
    this.removeBtn.element.on('click',     (e) => this.destroy());
    
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
    
    this.element.trigger('remove');
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
  
  addProperty(label, data) {
    if (this.properties.length === 0) {
      this.propertiesContainer.html('');
    }
    
    let container = $('<div>');
    let propertyHtmlElement = null;
    this.propertiesContainer.append(container);
    
    if (data && ('type' in data)) {
      switch (data.type) {
      case 'string':
        propertyHtmlElement = this._createStringProperty(label, data);
        break;
          
      case 'number':
        propertyHtmlElement = this._createNumberProperty(label, data);
        break;
          
      case 'integer':
        propertyHtmlElement = this._createIntegerProperty(label, data);
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
  
  _createStringProperty(label, data) {
    let inputText = new InputText(
      label,
      '',
      10
    );
    return inputText;
  }
  
  _createNumberProperty(label, data) {
    let inputText = new InputText(
      label,
      0,
      10,
      DataValidator.keyValidatorForNumbers
    );
    return inputText;
  }
  
  _createIntegerProperty(label, data) {
    let inputText = new InputText(
      label,
      0,
      10,
      DataValidator.keyValidatorForIntegers
    );
    return inputText;
  }
}

module.exports = BehaviorMenuItem;