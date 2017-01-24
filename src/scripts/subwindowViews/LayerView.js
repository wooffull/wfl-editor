"use strict";

const $                = wfl.jquery;
const SubwindowView    = require('./SubwindowView');
const {ExpandableMenu,
       MenuItem,
       MenuButton}     = require('../ui');
const {Entity}         = require('../world');
const {Action}         = require('../tools');

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
    
    this.reset();
  }
  
  reset() {
    this.layersMenu.clear();
    
    this._layerCount = 0;
    
    // Add layer0 immediately
    this.addLayer();
  }
  
  addLayer(layerId, _actionDirection = Action.Direction.DEFAULT) {
    // If it's the first layer, the action cannot be undone
    let isFirstLayer = this._layerCount === 0;
    
    if (typeof layerId === 'undefined') {
      layerId = 'layer' + this._layerCount;
      this._layerCount++;
    }
    
    let menuItem = new MenuItem(layerId);
    this.layersMenu.prepend(menuItem);
    
    $(menuItem.element).on('click', () => {
      this.perform(
        Action.Type.LAYER_SELECT,
        this.getSelectedLayer().element.html(),
        false
      );
    });
    
    // Select the new layer
    this.layersMenu._onItemSelect(menuItem);
    
    this.perform(
      Action.Type.LAYER_ADD,
      this.getSelectedLayer().element.html(),
      !isFirstLayer,
      _actionDirection
    );
    
    // Select the newest layer
    this.perform(
      Action.Type.LAYER_SELECT,
      this.getSelectedLayer().element.html(),
      false
    );
  }
  
  removeLayer() {
    this.perform(
      Action.Type.LAYER_REMOVE,
      this.getSelectedLayer().element.html()
    );
    this.layersMenu.remove(this.getSelectedLayer());
    
    // Select the newest layer
    this.perform(
      Action.Type.LAYER_SELECT,
      this.getSelectedLayer().element.html(),
      false
    );
  }
  
  getSelectedLayer() {
    return this.layersMenu.getLastSelected();
  }
}

module.exports = LayerView;