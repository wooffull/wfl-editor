"use strict";

const Scene =             wfl.display.Scene;
const {GameObject,
       PhysicsObject}   = wfl.core.entities;

class EditorScene extends Scene {
  constructor(canvas) {
    super(canvas);
    
    this.useDynamicZOrder = false;
  }
  
  drawSort(renderer) {
    if (this.useDynamicZOrder) {
      return this._findSurroundingGameObjects(this.camera, 2).sort(
        (a, b) => {
          // Sort objects on the same layer by their bottom Y-coordinate
          if (a.layer === b.layer) {
            return (a.transform.position._y + a.calculationCache.height * 0.5)
                 - (b.transform.position._y + b.calculationCache.height * 0.5)

          // Otherwise, sort them by layer
          } else {
            return a.layer - b.layer;
          }
        }
      );
    } else {
      return super.drawSort(renderer);
    }
  }
  
  enableMouseEvents()  {}
  disableMouseEvents() {}
}

module.exports = EditorScene;