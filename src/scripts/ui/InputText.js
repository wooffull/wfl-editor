"use strict";

const $ = wfl.jquery;
const HtmlElement = require('./HtmlElement');
const CssClass = require('../CssClasses');

class InputText extends HtmlElement {
  constructor(label = "Key", data = "Val") {
    super();
    
    this.element = $('<div>');
    
    console.log(label, data);
    this.label = $("<input type=\"text\">").val(label);
    this.data = $("<input type=\"text\">").val(data);
    
    this.label.addClass(CssClass.INPUT_TEXT);
    this.data.addClass(CssClass.INPUT_TEXT);
    
    this.element.append(this.label);
    this.element.append(this.data);
    
    $(document).click(this.onClick.bind(this));
  }
  
  onClick(e) {
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

module.exports = InputText;