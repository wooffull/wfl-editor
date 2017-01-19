"use strict";

const $                = wfl.jquery;
const SubwindowView    = require('./SubwindowView');
const {ExpandableMenu,
       MenuItem,
       MenuButton}     = require('../ui');
const {Entity}         = require('../world');

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
      if (this.layersMenu.length > 1) {
        this.removeLayer();
      }
    });
    this.layersMenu.addButton(this.removeLayerBtn);
    
    this._layerCount = 0;
    
    // Add layer0 immediately
    this.addLayer();
  }
  
  reset() {
    while (this.getSelectedLayer()) {
      this.removeLayer();
    }
    
    this._layerCount = 0;
    this.addLayer();
  }
  
  addLayer() {
    let menuItem = new MenuItem('layer' + this._layerCount);
    this.layersMenu.prepend(menuItem);
    
    $(menuItem.element).on('click', () => {
      $(this).trigger('layer-select', this.getSelectedLayer().element.html());
    });
    
    this._layerCount++;
    $(this).trigger('layer-add', this.getSelectedLayer().element.html());
  }
  
  removeLayer() {
    $(this).trigger('layer-remove', this.getSelectedLayer().element.html());
    this.layersMenu.remove(this.getSelectedLayer());
  }
  
  getSelectedLayer() {
    return this.layersMenu.getLastSelected();
  }
}

module.exports = LayerView;