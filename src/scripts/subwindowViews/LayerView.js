"use strict";

const $                 = wfl.jquery;
const SubwindowView     = require('./SubwindowView');
const {ExpandableMenu,
       MenuItem,
       MenuButton}      = require('../ui');
const {Entity}          = require('../world');
const {Action,
       ActionPerformer} = require('../action');

class LayerView extends SubwindowView {
  constructor() {
    super();
    
    this.layersMenu = new ExpandableMenu('Layers');
    this.add(this.layersMenu);
    
    this.addLayerBtn = new MenuButton('add_box');
    this.addLayerBtn.element.on('click', () => this.addLayer());
    this.layersMenu.addButton(this.addLayerBtn);
    
    this.removeLayerBtn = new MenuButton('indeterminate_check_box');
    this.removeLayerBtn.element.on('click', () => {
      if (this.layersMenu.list.length > 1) {
        this.removeLayer();
      }
    });
    this.layersMenu.addButton(this.removeLayerBtn);
    
    $(this.layersMenu).on("change", (e, data) => this.onMenuChange(e, data));
    
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

  onMenuChange(e, data) {
    console.log(data);
    var layerId = data.element[0].innerHTML;
    this.selectLayer(layerId);
  }
  
  selectLayer(layerId) {
    let layerData = {
      layerId: layerId
    };
    
    // Select the newest layer
    ActionPerformer.do(
      Action.Type.LAYER_SELECT,
      layerData,
      false
    );
  }
  
  addLayer(layerId) {
    // If it's the first layer, the action cannot be undone
    let isFirstLayer = this._layerCount === 0;
    
    if (typeof layerId === 'undefined') {
      layerId = 'layer' + this._layerCount;
      this._layerCount++;
    }
    
    let layerData = {
      layerId: layerId
    };
    
    ActionPerformer.do(
      Action.Type.LAYER_ADD,
      layerData,
      !isFirstLayer
    );
  }
  
  removeLayer(layerId) {
    // Use the selected element's label if no layerId is provided
    if (typeof layerId === 'undefined') {
      layerId = this.getSelectedLayer().element.html();
    }
    
    let layerData = {
      layerId: layerId
    };
    
    ActionPerformer.do(
      Action.Type.LAYER_REMOVE,
      layerData
    );
  }
  
  
  
  onActionLayerSelect(action) {
    let {layerId} = action.data;
    let menuItem  = this.layersMenu.find(layerId);
    this.layersMenu.select(menuItem);
  }
  
  onActionLayerAdd(action) {
    let {layerId} = action.data;
    let menuItem  = new MenuItem(layerId);
    
    // If the layer index is defined, add the layer to that position
    if (typeof action.data.layerIndex !== 'undefined') {
      this.layersMenu.insert(menuItem, action.data.layerIndex);
      
    // Otherwise, add it to the top of the list
    } else {
      this.layersMenu.prepend(menuItem);
    }
    this.selectLayer(layerId);
  }
  
  onActionLayerRemove(action) {
    let {layerId} = action.data;
    let menuItem  = this.layersMenu.find(layerId);
    
    // When the layer is removed, the action holds onto the layer's index
    // (so that during undo, it can be added back to that spot)
    if (typeof action.data.layerIndex === 'undefined') {
      // DATA_APPEND
      action.data.layerIndex = this.layersMenu.indexOf(menuItem);
    }
    
    this.layersMenu.remove(menuItem);
    this.selectLayer(this.getSelectedLayer().element.html());
  }
}

module.exports = LayerView;