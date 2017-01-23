"use strict";

const Tool           = require('./Tool');
const CssClasses     = require('../CssClasses');
const Action         = require('./Action');
const subwindowViews = require('../subwindowViews');

class ToolBarTool extends Tool {
  constructor() {
    super('layers', new subwindowViews.ToolBarView());
    this.element.addClass(CssClasses.TOOL_BAR_TOOL_ICON);
  }
  
  subwindowInit() {
    // Select the first tool
    $(this.subwindowView._toolIcons[0]).click();
  }
}

module.exports = ToolBarTool;