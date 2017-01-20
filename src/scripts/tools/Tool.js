"use strict";

const $             = wfl.jquery;
const CssClasses    = require('../CssClasses');
const {HtmlElement} = require('../ui');

class Tool extends HtmlElement {
  constructor(materialIconLabel) {
    super();
    
    this.subwindowView = null;
    this.element = $('<i>');
    this.element.html(materialIconLabel);
    this.element.addClass(CssClasses.MATERIAL_ICON);
    this.element.addClass(CssClasses.TOOL);
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
}

module.exports = Tool;