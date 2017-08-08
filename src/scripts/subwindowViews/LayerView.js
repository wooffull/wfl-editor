"use strict";

const $                 = wfl.jquery;
const SubwindowView     = require('./SubwindowView');
const CssClass          = require('../CssClasses'); 
const {LayerMenu,
       MenuItem,
       MenuButton}      = require('../ui');
const {Entity}          = require('../world');
const {Action,
       ActionPerformer} = require('../action');

class LayerView extends SubwindowView {
  constructor() {
    super();
    
    this.layersMenu = new LayerMenu('Layers');
    this.add(this.layersMenu);
    
    this.addLayerBtn = new MenuButton('add_box');
    this.addLayerBtn.element.on('click', (e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        this.addLayer();
      }
    });
    this.layersMenu.addButton(this.addLayerBtn);
    
    this.removeLayerBtn = new MenuButton('indeterminate_check_box');
    this.removeLayerBtn.element.on('click', (e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        if (this.layersMenu.list.length > 1) {
          this.removeLayer();
        }
      }
    });
    this.layersMenu.addButton(this.removeLayerBtn);
    
    $(this.layersMenu).on("change", (e, ele) => this.onMenuChange(e, ele));
    
    this._layerCount = 0;
    this.reset();
  }
  
  getSelectedLayer() {
    return this.layersMenu.getLastSelected();
  }
  
  reset() {
    this.layersMenu.clear();
    
    this._layerCount = 0;
    
    // Add layer0 immediately
    this.addLayer();
  }

  onMenuChange(e, element) {
    var layerId = element.label;
    this.selectLayer(layerId);
  }
  
  selectLayer(layerId) {
    let menuItem  = this.layersMenu.find(layerId);
    let layerIndex = null;
    
    if (menuItem) {
      layerIndex = menuItem.data.layerIndex;
    }
    
    let layerData = {
      layerId: layerId,
      layerIndex: layerIndex
    };
    
    // Select the newest layer
    ActionPerformer.do(
      Action.Type.LAYER_SELECT,
      layerData,
      false
    );
  }
  
  addLayer(layerId, reversable = true, uniqueId = -1) {
    // If it's the first layer, the action cannot be undone
    if (this._layerCount === 0) {
      reversable = false;
    }
    
    if (typeof layerId === 'undefined') {
      layerId = 'layer' + this._layerCount;
      this._layerCount++;
    }
    
    // If no unique ID is assigned to the layer, generate one
    if (isNaN(uniqueId) || uniqueId < 0) {
      uniqueId = this.layersMenu.generateUniqueId();
    
    // Otherwise, use the one provided and offset the next one to be generated
    // so that it has to come after the currently provided ID
    } else {
      this.layersMenu.setUniqueIdOffset(uniqueId + 1);
    }
    
    let layerData = {
      layerId: layerId,
      layerIndex: uniqueId
    };
    
    ActionPerformer.do(
      Action.Type.LAYER_ADD,
      layerData,
      reversable
    );
  }
  
  removeLayer(layerId, reversable = true) {
    // Use the selected element's label if no layerId is provided
    if (typeof layerId === 'undefined') {
      layerId = this.getSelectedLayer().label;
    }
    
    let menuItem  = this.layersMenu.find(layerId);
    let layerData = {
      layerId: layerId,
      layerIndex: menuItem.data.layerIndex
    };
    
    ActionPerformer.do(
      Action.Type.LAYER_REMOVE,
      layerData,
      reversable
    );
  }
  
  lockLayer(layerId) {
    let menuItem  = this.layersMenu.find(layerId);
    let layerData = {
      layerId: layerId,
      layerIndex: menuItem.data.layerIndex
    };
    
    ActionPerformer.do(
      Action.Type.LAYER_LOCK,
      layerData
    );
  }
  
  unlockLayer(layerId) {
    let menuItem  = this.layersMenu.find(layerId);
    let layerData = {
      layerId: layerId,
      layerIndex: menuItem.data.layerIndex
    };
    
    ActionPerformer.do(
      Action.Type.LAYER_UNLOCK,
      layerData
    );
  }
  
  onActionLayerSelect(action) {
    let {layerId} = action.data;
    let menuItem  = this.layersMenu.find(layerId);
    
    if (menuItem) {
      this.layersMenu.select(menuItem);
    }
  }
  
  onActionLayerAdd(action) {
    let {layerId, layerIndex} = action.data;
    let lockButton = new MenuButton('lock_open');
    let menuItem  = new MenuItem(layerId, lockButton);
    menuItem.data.layerIndex = layerIndex;
    
    lockButton.element.addClass(CssClass.LOCK_BUTTON);
    menuItem.element.append(lockButton.element);
    
    lockButton.element.click((e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        if (lockButton.element.hasClass(CssClass.LOCK_BUTTON)) {
          this.lockLayer(layerId);
        } else {
          this.unlockLayer(layerId);
        }
      }
    });
    
    this.layersMenu.insert(menuItem, action.data.layerIndex);
    this.selectLayer(layerId);
  }
  
  onActionLayerRemove(action) {
    let {layerId} = action.data;
    let menuItem  = this.layersMenu.find(layerId);
    
    this.layersMenu.remove(menuItem);
    
    // After removing the layer, get the currently selected one and
    // perform a LAYER_SELECT
    let selected = this.getSelectedLayer();

    if (selected) {
      this.selectLayer(selected.label);
    } else {
      // Still perform a LAYER_SELECT on null so that other tools can
      // handle when no more layers are remaining in the project
      this.selectLayer(null);
    }
  }
  
  onActionLayerLock(action) {
    let {layerId} = action.data;
    let menuItem  = this.layersMenu.find(layerId);
    let lockButton = menuItem.data;
    
    lockButton.icon.html('lock');
    lockButton.element.removeClass(CssClass.LOCK_BUTTON);
    lockButton.element.addClass(CssClass.UNLOCK_BUTTON);
  }
  
  onActionLayerUnlock(action) {
    let {layerId} = action.data;
    let menuItem  = this.layersMenu.find(layerId);
    let lockButton = menuItem.data;
    
    lockButton.icon.html('lock_open');
    lockButton.element.addClass(CssClass.LOCK_BUTTON);
    lockButton.element.removeClass(CssClass.UNLOCK_BUTTON);
  }
}

module.exports = LayerView;