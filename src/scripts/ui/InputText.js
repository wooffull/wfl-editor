"use strict";

const $ = wfl.jquery;
const HtmlElement = require('./HtmlElement');
const CssClass = require('../CssClasses');
const {keys} = wfl.input;

class InputText extends HtmlElement {
  constructor(label = "Key", data = "Val") {
    super();
    
    this.element = $('<div>');
    
    this.label = $("<span>").html(label);
    this.data = $("<input type=\"text\">").val(data);
    
    this.element.addClass(CssClass.INPUT_TEXT);
    this.label.addClass(CssClass.INPUT_TEXT_LABEL);
    this.data.addClass(CssClass.INPUT_TEXT_DATA);
    
    this.element.append(this.label);
    this.element.append(this.data);
    
    this.data.on("blur", this.onBlur.bind(this));
    this.data.on("focus", this.onFocus.bind(this));
    $(document).on("keydown", this.onKeyPress.bind(this));
    
    this.disabled  = false;
    this._selected = false;
    this._prevValue = data;
    
    this.size = InputText.DEFAULT_SIZE;
  }
  
  get value() {
    return this.data.val();
  }
  
  set value(val) {
    this.data.val(val);
    this._prevValue = val;
  }
  
  get size() {
    return this.data.prop('size');
  }
  
  set size(val) {
    if (isNaN(val) || val < 1) {
      val = 1;
    }
    
    this.data.prop('size', val);
  }
  
  onBlur(e) {
    if (this._selected) {
      this._onChange();
    }
  }
  
  onFocus(e) {
    if (!this._selected) {
      this._select();
    }
  }
  
  onKeyPress(e) {
    let isSubmitKey =
        e.keyCode === keys.ENTER ||
        e.keyCode === keys.TAB;
    
    if (this._selected && isSubmitKey) {
      this._onChange();
    }
  }
  
  enable() {
    this.data.prop('disabled', false);
    this.disabled = false;
    this.element.removeClass(CssClass.DISABLED);
  }
  
  disable() {
    this.data.prop('disabled', true);
    this.disabled = true;
    this.element.addClass(CssClass.DISABLED);
  }
  
  _select() {
    if (!this._selected) {
      this._selected = true;
      this.data.focus();
    }
  }
  
  _deselect() {
    if (this._selected) {
      this._selected = false;
      this._onChange();
      this.data.blur();
    }
  }
  
  _onChange() {
    if (!this.disabled && this._prevValue != this.data.val()) {
      $(this).trigger("change");
    }

    this._deselect();
  }
}

Object.defineProperties(InputText, {
  DEFAULT_SIZE: {
    value: 4
  }
});

module.exports = InputText;