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
      this.subwindowView.addLayer(layer, false);
      layerCounter++;
    }
    
    // TODO: Update layer count properly
    this.subwindowView._layerCount = layerCounter;
  }
  
  getData() {
    let layesrMenu   = this.subwindowView.layersMenu;
    
    // Layers are seen top-to-bottom, but added bottom-to-top, so reverse them
    let layerLabels  = layesrMenu.getLabels().reverse();
    let data         = {
      layers: layerLabels
    };
    
    return data;
  }
}

module.exports = LayerTool;