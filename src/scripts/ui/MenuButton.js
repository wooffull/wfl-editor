"use strict";

const $ = wfl.jquery;
const HtmlElement = require('./HtmlElement');
const CssClass = require('../CssClasses');

class MenuButton extends HtmlElement {
  constructor(label = "add_box") {
    super();
    
    this.element = $('<span>');
    this.element.addClass(CssClass.MENU_BUTTON);
    this.element.addClass(CssClass.FLOAT_RIGHT);
    
    this.icon = $('<i>');
    this.icon.addClass('material-icons');
    this.icon.addClass('tool');
    this.icon.html(label);
    
    this.element.append(this.icon);
  }
}

module.exports = MenuButton;