"use strict";

const $             = wfl.jquery;
const CssClasses    = require('../CssClasses');
const {HtmlElement} = require('../ui');
const Action        = require('./Action');

class Tool extends HtmlElement {
  constructor(materialIconLabel, subwindowView) {
    super();
    
    this.subwindowView = subwindowView;
    this.element = $('<i>');
    this.element.html(materialIconLabel);
    this.element.addClass(CssClasses.MATERIAL_ICON);
    this.element.addClass(CssClasses.TOOL);
    
    if (this.subwindowView) {
      $(this.subwindowView).on(Action.Event.DEFAULT, (e, action) => {
        $(this).trigger(Action.Event.DEFAULT, action);
      });
    }
  }
  
  reset() {
    if (this.subwindowView) {
      this.subwindowView.reset();
    }
  }
  
  /**
   * This init happens some time after the constructor is called.
   * It's intended to be called whenever a tool is added to a subwindow.
   * This late init is intended for catching events after construction.
   */
  subwindowInit() {}
  
  /**
   * This update is called when something significant changes in the project,
   * like loading a new project
   */
  projectUpdate(project) {}
  
  /**
   * This is how tools communicate with each other. They dispatch actions (events)
   * and other tools will parse the action based on its type if necessary.
   */
  parseAction(action) {}
}

module.exports = Tool;