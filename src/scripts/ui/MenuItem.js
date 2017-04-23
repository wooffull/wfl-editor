"use strict";

const $           = wfl.jquery;
const HtmlElement = require('./HtmlElement');
const CssClass    = require('../CssClasses');

class MenuItem extends HtmlElement {
  constructor(label, data) {
    super();
    
    this.data = data;
    this.label = label;
    
    this.element = $('<div>');
    this.element.html(label);
    this.element.addClass(CssClass.MENU_ITEM);
  }
}

module.exports = MenuItem;