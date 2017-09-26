"use strict";

const $             = wfl.jquery;
const CssClass      = require('../CssClasses');
const {HtmlElement} = require('../ui');

class Popup extends HtmlElement {
  constructor() {
    super();
    
    this.element = $('<div>');
    
    this.shadowBox = $('<div>');
    this.shadowBox.addClass(CssClass.POPUP_SHADOW_BOX);
    
    this.popup = $('<div>');
    this.popup.addClass(CssClass.POPUP);
    this.popup.addClass(CssClass.SUBWINDOW);
    this.popup.addClass(CssClass.SUBWINDOW_FLEX_COLUMN);
    
    this.element.append(this.shadowBox);
    this.element.append(this.popup);
    
    this.shadowBox.on('click', () => this.close());
  }
  
  close() {
    this.shadowBox.off();
    $(this).trigger('remove');
  }
}

module.exports = Popup;