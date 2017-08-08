"use strict";

const Tool           = require('./Tool');
const {Action}       = require('../action');
const subwindowViews = require('../subwindowViews');

class LayerTool extends Tool {
  constructor() {
    super('layers', new subwindowViews.LayerView());
    
    this.register(
      Action.Type.LAYER_SELECT,
      (action) => this.subwindowView.onActionLayerSelect(action)
    );
    this.register(
      Action.Type.LAYER_ADD,
      (action) => this.subwindowView.onActionLayerAdd(action)
    );
    this.register(
      Action.Type.LAYER_REMOVE,
      (action) => this.subwindowView.onActionLayerRemove(action)
    );
    this.register(
      Action.Type.LAYER_LOCK,
      (action) => this.subwindowView.onActionLayerLock(action)
    );
    this.register(
      Action.Type.LAYER_UNLOCK,
      (action) => this.subwindowView.onActionLayerUnlock(action)
    );
  }
  
  onProjectUpdate(project) {
    // If no level data, exit early
    if (!project.level) return;
      
    let {layers} = project.level;

    // If no game object data, exit early
    if (!layers) return;
    
    // If there are layers in the project, remove layer0 (since it's added by
    // default)
    this.subwindowView.removeLayer(undefined, false);
    
    let layerCounter = 0;
    
    for (const layer of layers) {
      this.subwindowView.addLayer(layer.label, false, layer.index);
      
      // If the saved layer's label is "labelX" where "X" is an integer,
      // it has been saved with a default layer name, so increment the default
      // counter so newly added layers can start with that number
      let hasDefaultLayerName = layer.label.match(/(layer).*[\d+]/);
      if (hasDefaultLayerName !== null) {
        let defaultLayerNumber = parseInt(layer.label.match(/\d+/)[0]);
        layerCounter = Math.max(layerCounter, defaultLayerNumber + 1);
      }
    }
    
    this.subwindowView._layerCount = layerCounter;
  }
  
  getData() {
    let layersMenu = this.subwindowView.layersMenu;
    let list       = layersMenu.list;
    let layers     = [];
    
    for (let menuItem of list) {
      layers.push({
        label: menuItem.label,
        index: menuItem.data.layerIndex
      });
    }
    
    // Layers are seen top-to-bottom, but added bottom-to-top, so reverse them
    layers.reverse();
    
    let data = {
      layers: layers
    };
    
    return data;
  }
}

module.exports = LayerTool;