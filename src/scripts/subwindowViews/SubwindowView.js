"use strict";

const $             = wfl.jquery;
const {HtmlElement} = require('../ui');

class SubwindowView extends HtmlElement {
  constructor() {
    super();
    
    this.element = $('<div>');
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