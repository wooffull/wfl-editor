"use strict";

const Tool           = require('./Tool');
const CssClasses     = require('../CssClasses');
const {Action}       = require('../action');
const subwindowViews = require('../subwindowViews');

class ToolBarTool extends Tool {
  constructor() {
    super('layers', new subwindowViews.ToolBarView());
    this.element.addClass(CssClasses.TOOL_BAR_TOOL_ICON);
    
    this.register(
      Action.Type.MAIN_TOOL_SELECT,
      (action) => this.subwindowView.onActionMainToolSelect(action)
    );
  }
  
  subwindowInit() {
    // Select the first tool
    $(this.subwindowView._tools[0].icon).click();
  }
}

module.exports = ToolBarTool;