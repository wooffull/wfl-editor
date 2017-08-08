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
  }
  
  subwindowInit() {
    this.subwindowView.reset();
  }
  
  onProjectUpdate(project) {
    // If no level data, exit early
    if (!project.level) return;
      
    let {tileSize} = project.level;
    
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
  }
}

module.exports = ProjectSettingsTool;