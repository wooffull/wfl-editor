"use strict";

const $                 = wfl.jquery;
const SubwindowView     = require('./SubwindowView');
const CssClasses        = require('../CssClasses');
const worldTools        = require('../worldTools');
const {Action,
       ActionPerformer} = require('../action');

class ToolBarView extends SubwindowView {
  constructor() {
    super();
    
    this._tools           = [];
    this._currentToolIcon = null;
    this._currentToolData = null;
    
    let toolMap = worldTools.toolData;
    
    for (const key of Object.keys(toolMap)) {
      let toolData     = toolMap[key];
      let toolIcon     = this.addWorldTool(toolData.materialIconLabel);
      let toolInstance = {
        tool: toolData,
        icon: toolIcon
      };
      this._tools.push(toolInstance);
      $(toolIcon).on('click', () => this.selectTool(toolInstance));
    }
  }
  
  selectTool(tool) {
    ActionPerformer.do(
      Action.Type.MAIN_TOOL_SELECT,
      tool,
      false
    );
  }
  
  addWorldTool(materialIconLabel) {
    let icon = $('<i>');
    icon.html(materialIconLabel);
    icon.addClass(CssClasses.MATERIAL_ICON);
    icon.addClass(CssClasses.TOOL);
    this.element.append(icon);
    return icon;
  }
  
  
  
  onActionMainToolSelect(action) {
    let {tool, icon} = action.data;
    
    if (this._currentToolIcon !== null) {
      $(this._currentToolIcon).removeClass('selected');
    }

    this._currentToolData = tool;
    this._currentToolIcon = icon;

    $(this._currentToolIcon).addClass('selected');
  }
}

module.exports = ToolBarView;