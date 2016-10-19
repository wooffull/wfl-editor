"use strict";

const $ = wfl.jquery;

class HtmlElement {
  constructor() {
    this.element = null;
  }
  
  hide() {
    if (this.element) {
      $(this.element).hide();
    }
  }
  
  show() {
    if (this.element) {
      $(this.element).show();
    }
  }
}

module.exports = HtmlElement;