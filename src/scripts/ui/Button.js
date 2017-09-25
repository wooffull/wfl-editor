"use strict";

const $ = wfl.jquery;
const HtmlElement = require('./HtmlElement');
const CssClass = require('../CssClasses');

class Button extends HtmlElement {
  constructor(label = "label") {
    super();
    
    this.element = $('<input type="button">');
    this.label = label;
    this.disabled = false;
    
    this.element.append(this.element);
  }
  
  get label() {
    return this.element.prop('value');
  }
  
  set label(value) {
    return this.element.prop('value', value);
  }
  
  enable() {
    this.element.prop('disabled', false);
    this.disabled = false;
    this.element.removeClass(CssClass.DISABLED);
  }
  
  disable() {
    this.element.prop('disabled', true);
    this.disabled = true;
    this.element.addClass(CssClass.DISABLED);
  }
}

module.exports = Button;