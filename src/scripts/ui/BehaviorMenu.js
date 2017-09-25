"use strict";

const $             = wfl.jquery;
const Menu          = require('./Menu');
const HtmlElement   = require('./HtmlElement');

class BehaviorMenu extends Menu {
  constructor(label) {
    super(label);
  }
  
  _addElement(htmlElement, position) {
    htmlElement.element.on('remove', () => this.remove(htmlElement));
    
    super._addElement(htmlElement, position);
  }
  
  remove(htmlElement) {
    htmlElement.element.off('remove');
    super.remove(htmlElement);
  }
}

module.exports = BehaviorMenu;