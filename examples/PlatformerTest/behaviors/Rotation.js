"use strict";

const {Behavior, property} = wfl.behavior;

class Rotation extends Behavior {
  constructor() {
    super();
  }
  
  update(dt) {
    if (!this.clockwise) {
      dt *= -1;
    }
    
    this.gameObject.rotate(this.rotationSpeed * dt);
  }
}

Rotation.rotationSpeed = property.Number(0.01, 0);
Rotation.clockwise     = property.Boolean(true);

module.exports = Rotation;