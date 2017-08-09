"use strict";

const $ = wfl.jquery;
const HtmlElement = require('./HtmlElement');
const CssClass = require('../CssClasses');

class CheckBox extends HtmlElement {
  constructor(label = "Key") {
    super();
    
    this.label = $("<span>").html(label);
    this.label.addClass(CssClass.INPUT_TEXT_LABEL);
    
    this.checkbox = $('<input type="checkbox">');
    
    this.element = $('<div>');
    this.element.addClass(CssClass.CHECK_BOX);
    
    this.element.append(this.label);
    this.element.append(this.checkbox);
    
    this.disabled = false;
    
    this.checkbox.on('change', this.onChange.bind(this));
  }
  
  get value() {
    return this.checkbox.prop('checked');
  }
  
  set value(val) {
    if (val === true) {
      this.check();
      this.checkbox.prop('indeterminate', false);
    } else if (val === false) {
      this.uncheck();
      this.checkbox.prop('indeterminate', false);
    } else {
      this.checkbox.prop('indeterminate', true);
    }
  }
  
  check() {
    this.checkbox.prop('checked', true);
  }
  
  uncheck() {
    this.checkbox.prop('checked', false);
  }
  
  enable() {
    this.checkbox.prop('disabled', false);
    this.disabled = false;
    
    this.element.removeClass(CssClass.DISABLED);
  }
  
  disable() {
    this.checkbox.prop('disabled', true);
    this.disabled = true;
    
    this.element.addClass(CssClass.DISABLED);
  }
  
  onChange(e) {
    $(this).trigger('change');
  }
}

module.exports = CheckBox;