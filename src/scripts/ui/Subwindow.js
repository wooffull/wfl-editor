"use strict";

const $           = wfl.jquery;
const HtmlElement = require('./HtmlElement');
const CssClasses  = require('../CssClasses');

class Subwindow extends HtmlElement {
  constructor() {
    super();
    
    this._tools       = [];
    this._currentTool = null;
    
    this._toolContainer = $('<div>');
    this._viewContainer = $('<div>');
    
    this._toolContainer.addClass(CssClasses.SUBWINDOW_TOOLBAR);
    this._viewContainer.addClass(CssClasses.SUBWINDOW_VIEW);
    
    this.element = $('<span>');
    this.element.append(this._toolContainer);
    this.element.append(this._viewContainer);
    this.element.addClass(CssClasses.SUBWINDOW);
  }
  
  addTool(tool) {
    this._tools.push(tool);
    this._toolContainer.append(tool.element);
    
    $(tool.element).on('click', (e) => {
      if (typeof e.which === "undefined" ||  e.which === 1) {
        this.selectTool(tool);
      }
    });
    
    // Select the tool being added if it's the first tool for the subwindow
    if (this._currentTool === null) {
      $(tool.element).click();
    }
    
    // Force the tool to init anything pertinent when being added to a subwindow
    tool.subwindowInit();
  }
  
  selectTool(tool) {
    if (this._currentTool) {
      this._currentTool.subwindowView.hide();
      this._currentTool.element.removeClass('selected');
    }
    
    tool.subwindowView.show();
    tool.element.addClass('selected');
    
    this._currentTool = tool;
    this.updateView();
    
    tool.onSelect();
  }
  
  updateView() {
    if (this._currentTool) {
      this._viewContainer.append(this._currentTool.subwindowView.element);
    }
  }
  
  resize(e) {
    for (let tool of this._tools) {
      if (tool.subwindowView) {
        tool.subwindowView.resize(e);
      }
    }
  }
}

module.exports = Subwindow;