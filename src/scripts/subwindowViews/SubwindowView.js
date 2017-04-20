"use strict";

const $             = wfl.jquery;
const {HtmlElement} = require('../ui');
const {Action}      = require('../action');
const CssClasses    = require('../CssClasses');

class SubwindowView extends HtmlElement {
  constructor() {
    super();
    
    this.element = $('<div>');
    this.element.addClass(CssClasses.SUBWINDOW_VIEW);
  }
  
  destroy() {
    this.element.remove();
  }
  
  reset() {}
  
  add(htmlElement) {
    this.element.append(htmlElement.element);
  }
  
  resize(e) {}
}

module.exports = SubwindowView;