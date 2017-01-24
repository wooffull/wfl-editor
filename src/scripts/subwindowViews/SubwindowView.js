"use strict";

const $             = wfl.jquery;
const {HtmlElement} = require('../ui');
const {Action}      = require('../tools');

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
  
  perform(type, data, reversable, direction, state) {
    let action;
    
    if (type instanceof Action) {
      action = type;
    } else {
      action = new Action(type, data, reversable, direction, state);
    }
    
    $(this).trigger(Action.Event.DEFAULT, action);
  }
}

module.exports = SubwindowView;