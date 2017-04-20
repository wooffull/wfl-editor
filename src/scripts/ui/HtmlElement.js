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
      
      // jQuery will make the element's CSS display: block, but by setting it
      // to an empty string after show(), it will take the default display
      // value it had before
      $(this.element).css({"display": ""});
    }
  }
}

module.exports = HtmlElement;