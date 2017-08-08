"use strict";

const $ = wfl.jquery;
const HtmlElement = require('./HtmlElement');
const CssClass = require('../CssClasses');

class InputTextPair extends HtmlElement {
  constructor(label = "Key", data = "Val") {
    super();
    
    this.element = $('<div>');
    
    this.label = $("<input type=\"text\">").val(label);
    this.data = $("<input type=\"text\">").val(data);
    
    this.label.addClass(CssClass.INPUT_TEXT);
    this.data.addClass(CssClass.INPUT_TEXT);
    
    this.element.append(this.label);
    this.element.append(this.data);
    
    this._onClickRef = this.onClick.bind(this);
    
    $(document).on('click', this._onClickRef);
  }
  
  destroy() {
    $(document).off('click', this._onClickRef);
  }
  
  onClick(e) {
    if (typeof e.which === "undefined" || e.which === 1) {
      if (e.target === this.label[0]) {
        this.label.focus();
        this.data.blur();
      } else if (e.target === this.data[0]) {
        this.label.blur();
        this.data.focus();
      } else {
        this.label.blur();
        this.data.blur();
      }
    }
  }
}

module.exports = InputTextPair;