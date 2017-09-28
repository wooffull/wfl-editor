"use strict";

const Tool           = require('./Tool');
const {Action}       = require('../action');
const subwindowViews = require('../subwindowViews');

class ProjectSettingsTool extends Tool {
  constructor() {
    super('settings', new subwindowViews.ProjectSettingsView());
    
    this.register(
      Action.Type.PROJECT_TILE_WIDTH_CHANGE,
      (action) => this.subwindowView.onActionTileWidthChange(action)
    );
    this.register(
      Action.Type.PROJECT_TILE_HEIGHT_CHANGE,
      (action) => this.subwindowView.onActionTileHeightChange(action)
    );
    this.register(
      Action.Type.PROJECT_DYNAMIC_Z_ORDER_CHANGE,
      (action) => this.subwindowView.onActionDynamicZOrderChange(action)
    );
  }
  
  subwindowInit() {
    this.subwindowView.reset();
  }
  
  onProjectUpdate(project) {
    // If no level data, exit early
    if (!project.level) return;
      
    let {tileSize, dynamicZOrder} = project.level;
    
    if (tileSize) {
      if (tileSize.x) {
        let tileWidth = parseInt(tileSize.x);
        
        if (tileWidth > 0) {
          this.subwindowView.setTileSizeX(tileWidth, false);
        }
      }
      
      if (tileSize.y) {
        let tileHeight = parseInt(tileSize.y);
        
        if (tileHeight > 0) {
          this.subwindowView.setTileSizeY(tileHeight, false);
        }
      }
    }
    
    if (dynamicZOrder === true) {
      this.subwindowView.dynamicZOrderCheckBox.value = true;
    } else {
      this.subwindowView.dynamicZOrderCheckBox.value = false;
    }
    
    this.subwindowView.changeDynamicZOrder(false);
  }
  
  getData() {
    let data = {
      tileSize: {
        x: this.subwindowView.tileSizeXInputText.value,
        y: this.subwindowView.tileSizeYInputText.value
      },
      dynamicZOrder: this.subwindowView.dynamicZOrderCheckBox.value
    };
    
    return data;
  }
}

module.exports = ProjectSettingsTool;