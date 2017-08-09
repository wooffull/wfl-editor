"use strict";

const debug             = wfl.debug;
const {Action,
       ActionPerformer} = require('../action');

class Selector {
  constructor() {
    this.selectedObjects = undefined;
    this.selectionBox    = undefined;

    this.clear();
  }

  clear() {
    this.selectedObjects = [];
    this.selectionBox  = {
      x:      0,
      y:      0,
      width:  0,
      height: 0
    };
    
    this._deselect();
  }

  update() {
    // No selected game objects, so no need to draw anything
    if (this.selectedObjects.length === 0) {
      this.clear();
      
    } else {
      // Coordinates for the selection box
      var min = { x :  Infinity, y :  Infinity };
      var max = { x : -Infinity, y : -Infinity };

      // Find the selection box to draw around the selected game objects
      for (var i = 0; i < this.selectedObjects.length; i++) {
        var cur        = this.selectedObjects[i];
        var curPos     = cur.position;
        var cache      = cur.calculationCache;
        var halfWidth  = cache.aabbHalfWidth;
        var halfHeight = cache.aabbHalfHeight;

        // Update bounds when an object is outside of them
        if (curPos.x - halfWidth  < min.x) min.x = curPos.x - halfWidth;
        if (curPos.y - halfHeight < min.y) min.y = curPos.y - halfHeight;
        if (curPos.x + halfWidth  > max.x) max.x = curPos.x + halfWidth;
        if (curPos.y + halfHeight > max.y) max.y = curPos.y + halfHeight;
      }

      this.selectionBox.x      = min.x;
      this.selectionBox.y      = min.y;
      this.selectionBox.width  = max.x - min.x;
      this.selectionBox.height = max.y - min.y;
      
      let gameObjects = this.selectedObjects.slice(0);
      
      let data = {
        gameObjects: gameObjects,
        entities: gameObjects.map((x) => x.customData.entity),
        layerIds: gameObjects.map((x) => x.layer)
      };

      ActionPerformer.do(
        Action.Type.WORLD_ENTITY_SELECT,
        data,
        false
      );
    }
  }

  draw(scene) {
    let box            = this.selectionBox;
    let lineSize       = Math.max(1, 1 / scene.camera.zoom);
    let debugContainer = debug.getContainer();
    debugContainer.lineStyle(lineSize, 0xFFFFFF, 0.75);
    debugContainer.beginFill(0xFFFFFF, 0.3);
    debugContainer.drawRect(
      box.x,
      box.y,
      box.width,
      box.height
    );
    debugContainer.endFill();
  }

  add(obj, _allowUpdate = true) {
    // Remove it first just in case to prevent duplicates
    this.remove(obj, false);

    this.selectedObjects.push(obj);
    
    if (_allowUpdate) {
      this.update();
    }
  }

  remove(obj, _allowUpdate = true) {
    var selectedIndex = this.selectedObjects.indexOf(obj);

    // Remove the game object from the list of selected game objects
    if (selectedIndex >= 0 &&
      selectedIndex < this.selectedObjects.length) {

      this.selectedObjects.splice(selectedIndex, 1);
      
      if (_allowUpdate) {
        this.update();
      }
    }
  }

  isSelected(obj) {
    return (this.selectedObjects.indexOf(obj) >= 0);
  }

  hitTestPoint(point) {
    var box = this.selectionBox;

    return (point.x >= box.x && point.x <= box.x + box.width &&
            point.y >= box.y && point.y <= box.y + box.height);
  }

  pan(dx, dy) {
    for (var i = 0; i < this.selectedObjects.length; i++) {
      var cur = this.selectedObjects[i];

      cur.position.x += dx;
      cur.position.y += dy;
    }

    this.selectionBox.x += dx;
    this.selectionBox.y += dy;
  }
  
  rotate(dTheta) {
    for (var i = 0; i < this.selectedObjects.length; i++) {
      var cur = this.selectedObjects[i];
      cur.rotate(dTheta);
    }
    
    this.update();
  }
  
  _deselect() {
    ActionPerformer.do(
      Action.Type.WORLD_ENTITY_DESELECT,
      {},
      false
    );
  }
}

module.exports = Selector;
