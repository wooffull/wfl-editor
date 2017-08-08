"use strict";

const Scene =             wfl.display.Scene;
const {GameObject,
       PhysicsObject}   = wfl.core.entities;

class EditorScene extends Scene {
  constructor(canvas) {
    super(canvas);
  }
  
  enableMouseEvents()  {}
  disableMouseEvents() {}
}

module.exports = EditorScene;