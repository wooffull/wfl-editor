"use strict";

const $             = wfl.jquery;
const SubwindowView = require('./SubwindowView');
const CssClasses    = require('../CssClasses');
const worldTools    = require('../worldTools');
const {Action}      = require('../tools');

class ToolBarView extends SubwindowView {
  constructor() {
    super();
    
    this._toolIcons       = [];
    this._currentToolIcon = null;
    this._currentToolData = null;
    
    let toolData = worldTools.toolData;
    
    for (const key of Object.keys(toolData)) {
      let toolIcon = this.addWorldTool(toolData[key].materialIconLabel);
      $(toolIcon).on('click', () => {
        if (this._currentToolIcon !== null) {
          $(this._currentToolIcon).removeClass('selected');
        }
        
        this._currentToolIcon = toolIcon;
        this._currentToolData = toolData[key];
        
        $(this._currentToolIcon).addClass('selected');
        
        this.perform(
          Action.Type.MAIN_TOOL_SELECT,
          toolData[key],
          false
        );
      });
      this._toolIcons.push(toolIcon);
    }
  }
  
  addWorldTool(materialIconLabel) {
    let icon = $('<i>');
    icon.html(materialIconLabel);
    icon.addClass(CssClasses.MATERIAL_ICON);
    icon.addClass(CssClasses.TOOL);
    this.element.append(icon);
    return icon;
  }
}

module.exports = ToolBarView;