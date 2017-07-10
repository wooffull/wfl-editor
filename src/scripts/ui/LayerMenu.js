"use strict";

const Menu = require('./Menu');

class LayerMenu extends Menu {
  constructor(label) {
    super(label);
    
    this._addId = 0;
  }
  
  clear() {
    super.clear();
    this._addId = 0;
  }
  
  generateUniqueId() {
    let uniqueId = this._addId;
    this._addId++;
    return uniqueId;
  }
  
  setUniqueIdOffset(uniqueId) {
    this._addId = uniqueId;
  }
  
  // The layers menu goes from bottom to top, so the position must be flipped
  insert(htmlElement, position) {
    let flippedPosition = this.list.length - position;
    super.insert(htmlElement, flippedPosition);
  }
}

module.exports = LayerMenu;