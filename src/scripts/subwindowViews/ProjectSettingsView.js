"use strict";

const $                  = wfl.jquery;
const SubwindowView      = require('./SubwindowView');
const CssClass           = require('../CssClasses'); 
const {WorldEditorScene} = require('../scenes');
const {DataValidator}    = require('../util');
const {InputText,
       MenuItem,
       MenuButton,
       CheckBox}         = require('../ui');
const {Action,
       ActionPerformer}  = require('../action');

class ProjectSettingsView extends SubwindowView {
  constructor() {
    super();
    
    this.label = $("<div>").html("Project Settings");
    this.label.addClass(CssClass.MENU_LABEL);
    
    this.tileSizeXInputText = new InputText(
      "Tile Width",
      WorldEditorScene.DEFAULT_TILE_SIZE.x,
      3,
      DataValidator.keyValidatorForPositiveNumbers
    );
    this.tileSizeYInputText = new InputText(
      "Tile Height",
      WorldEditorScene.DEFAULT_TILE_SIZE.y,
      3,
      DataValidator.keyValidatorForPositiveNumbers
    );
    this.dynamicZOrderCheckBox = new CheckBox('Dynamic Z-Order');
    
    this.element.append(this.label);
    
    this.add(this.tileSizeXInputText);
    this.add(this.tileSizeYInputText);
    this.add(this.dynamicZOrderCheckBox);
    
    $(this.tileSizeXInputText).on("change", (e) => this.onTileSizeChange(e));
    $(this.tileSizeYInputText).on("change", (e) => this.onTileSizeChange(e));
    $(this.dynamicZOrderCheckBox).on(
      "change",
      (e) => this.changeDynamicZOrder()
    );
    
    this.reset();
  }
  
  reset() {
    // Set the project's tile size to default values
    this.setTileSizeX(WorldEditorScene.DEFAULT_TILE_SIZE.x, false);
    this.setTileSizeY(WorldEditorScene.DEFAULT_TILE_SIZE.y, false);
    
    this.dynamicZOrderCheckBox.check();
    this.changeDynamicZOrder(false);
  }
  
  onTileSizeChange(e) {
    let inputText = e.target;
    let isX       = (inputText === this.tileSizeXInputText);
    let value     = this._validateTileSize(inputText);
    
    // Only send out a change if the value has changed from the previous one
    if (value !== parseFloat(inputText._prevValue)) {
      if (isX) this.setTileSizeX(value);
      else     this.setTileSizeY(value);
    
    // Otherwise, just change the text field to that value without sending out
    // an action
    } else {
      if (isX) this.tileSizeXInputText.value = value;
      else     this.tileSizeYInputText.value = value;
    }
  }
  
  setTileSizeX(value, reversable = true) {
    let tileWidthData = {
      prevTileWidth: this.tileSizeXInputText._prevValue,
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
      prevTileHeight: this.tileSizeYInputText._prevValue,
      tileHeight: value
    };
    
    ActionPerformer.do(
      Action.Type.PROJECT_TILE_HEIGHT_CHANGE,
      tileHeightData,
      reversable
    );
  }
  
  changeDynamicZOrder(reversable = true) {
    let data = {
      value: this.dynamicZOrderCheckBox.value
    };
    
    ActionPerformer.do(
      Action.Type.PROJECT_DYNAMIC_Z_ORDER_CHANGE,
      data,
      reversable
    );
  }
  
  onActionTileWidthChange(action) {
    let {tileWidth} = action.data;
    this.tileSizeXInputText.value = tileWidth;
  }
  
  onActionTileHeightChange(action) {
    let {tileHeight} = action.data;
    this.tileSizeYInputText.value = tileHeight;
  }
  
  onActionDynamicZOrderChange(action) {
    let {value} = action.data;
    this.dynamicZOrderCheckBox.value = value;
  }
  
  _validateTileSize(inputText) {
    // Ensure the value is between [1, Infinity)
    return DataValidator.stringToMatchedNumberRangeOrDefault(
      inputText.value,
      1,
      Infinity,
      inputText._prevValue
    );
  }
}

module.exports = ProjectSettingsView;