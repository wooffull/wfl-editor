"use strict";

const geom = wfl.geom;
const {Behavior, property} = wfl.behavior;

class FallFromGravity extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    // TODO: Make default max speed higher
    this.gameObject.maxSpeed        = Infinity;
    this.gameObject.maxAcceleration = this.maxAcceleration;
  }
  
  update(dt) {
    this.gameObject.acceleration.multiply(0);
  
    this.applyFriction();
    this.applyGravity();
    
    if (this.gameObject.velocity.x < -this.maxSpeedX) {
      this.gameObject.velocity.x = -this.maxSpeedX;
    } else if (this.gameObject.velocity.x > this.maxSpeedX) {
      this.gameObject.velocity.x = this.maxSpeedX;
    }
    
    if (this.gameObject.velocity.y < -this.maxSpeedY) {
      this.gameObject.velocity.y = -this.maxSpeedY;
    } else if (this.gameObject.velocity.y > this.maxSpeedY) {
      this.gameObject.velocity.y = this.maxSpeedY;
    }
  }
  
  applyGravity() {
    let gravityForce = new geom.Vec2(0, 1);
    gravityForce.multiply(this.gravity * this.gameObject.mass);
    this.gameObject.addForce(gravityForce);
  }
  
  applyFriction() {
    if (this.gameObject.velocity) {
      this.gameObject.velocity.multiply(this.airResistance);
      this.gameObject.acceleration.multiply(this.airResistance);
    }
  }
}

FallFromGravity.gravity         = property.Number(5, 0);
FallFromGravity.airResistance   = property.Number(0.9, 0, 1);
FallFromGravity.maxSpeedX       = property.Number(12, 0);
FallFromGravity.maxSpeedY       = property.Number(12, 0);
FallFromGravity.maxAcceleration = property.Number(12, 0);

module.exports = FallFromGravity;