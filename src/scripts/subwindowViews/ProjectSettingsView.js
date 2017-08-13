"use strict";

const $                  = wfl.jquery;
const SubwindowView      = require('./SubwindowView');
const CssClass           = require('../CssClasses'); 
const {WorldEditorScene} = require('../scenes');
const {InputText,
       MenuItem,
       MenuButton}       = require('../ui');
const {Action,
       ActionPerformer}  = require('../action');

class ProjectSettingsView extends SubwindowView {
  constructor() {
    super();
    
    this.label = $("<div>").html("Project Settings");
    this.label.addClass(CssClass.MENU_LABEL);
    
    this.tileSizeXInputText = new InputText(
      "Tile Size X",
      WorldEditorScene.DEFAULT_TILE_SIZE.x
    );
    this.tileSizeYInputText = new InputText(
      "Tile Size Y",
      WorldEditorScene.DEFAULT_TILE_SIZE.y
    );
    
    this.element.append(this.label);
    
    this.add(this.tileSizeXInputText);
    this.add(this.tileSizeYInputText);
    
    $(this.tileSizeXInputText).on("change", ($e) => this.onTileSizeChange($e));
    $(this.tileSizeYInputText).on("change", ($e) => this.onTileSizeChange($e));
    
    this.reset();
  }
  
  reset() {
    // Set the project's tile size to default values
    this.setTileSizeX(WorldEditorScene.DEFAULT_TILE_SIZE.x, false);
    this.setTileSizeY(WorldEditorScene.DEFAULT_TILE_SIZE.y, false);
  }
  
  onTileSizeChange(e) {
    let inputText = e.target;
    let isX       = true;
    let value     = 0;
    
    if (inputText === this.tileSizeYInputText) {
      isX = false;
    }
    
    value = inputText.value;
    
    // Ensure the value is above 0
    if (isNaN(value) || value < 1) {
      value = inputText.prevValue;
    }
    
    // Only send out a change if the value has changed from the previous one
    if (parseInt(value) !== parseInt(inputText.prevValue)) {
      if (isX) {
        this.setTileSizeX(value);
      } else {
        this.setTileSizeY(value);
      }
    
    // Otherwise, just change the text field to that value without sending out
    // an action
    } else {
      if (isX) {
        this.tileSizeXInputText.value = value;
      } else {
        this.tileSizeYInputText.value = value;
      }
    }
  }
  
  setTileSizeX(value, reversable = true) {
    let tileWidthData = {
      prevTileWidth: this.tileSizeXInputText.prevValue,
      tileWidth: value
    };
    
    ActionPerformer.do(
      Action.Type.PROJECT_TILE_WIDTH_CHANGE,
      tileWidthData,
      reversable
    );
  }
  
  setTileSizeY(value, reversable = true) {
    let tileHeightData = {
      prevTileHeight: this.tileSizeYInputText.prevValue,
      tileHeight: value
    };
    
    ActionPerformer.do(
      Action.Type.PROJECT_TILE_HEIGHT_CHANGE,
      tileHeightData,
      reversable
    );
  }
  
  onActionTileWidthChange(action) {
    let {tileWidth} = action.data;
    this.tileSizeXInputText.value = tileWidth;
    this.tileSizeXInputText.prevValue = this.tileSizeXInputText.value;
  }
  
  onActionTileHeightChange(action) {
    let {tileHeight} = action.data;
    this.tileSizeYInputText.value = tileHeight;
    this.tileSizeYInputText.prevValue = this.tileSizeYInputText.value;
  }
}

module.exports = ProjectSettingsView;