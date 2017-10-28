"use strict";

const geom = wfl.geom;
const {Behavior, property} = wfl.behavior;

const UP = new geom.Vec2(0, -1);

class LaunchUpwardWhenHitFromAbove extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    this.gameObject.customData.preventLanding = true;
    
    this.direction         = new geom.Vec2(0, -1);
    this._previousRotation = Infinity;
  }
  
  update(dt) {
    if (this.adjustToRotation) {
      this._updateDirection();
    }
  
    if (this.gameObject.collisions.length > 0) {
      this._checkForLaunch();
    }
  }
  
  _updateDirection() {
    if (this.gameObject.rotation !== this._previousRotation) {
      this.direction = this.gameObject.forward.getOrthogonal();
      this._previousRotation = this.gameObject.rotation;
      
      // If the direction is mainly upward, this game object shouldn't be treated as a platform.
      // Otherwise, it may be on its side, in which case it can be a platform.
      let direction = UP.x * this.direction._x + UP.y * this.direction._y;
      this.gameObject.customData.preventLanding = direction > 0.75;
    }
  }
  
  _checkForLaunch() {
    for (let data of this.gameObject.collisions) {
      let {obj, collisionData} = data;
      let direction = collisionData.direction.x * this.direction._x + collisionData.direction.y * this.direction._y;
      
      if (direction > 0.75) {
        let launchForce = this.direction.clone();
        launchForce.multiply(this.launchPower * obj.mass);
        obj.addImpulse(launchForce);
      }
    }
  }
}

LaunchUpwardWhenHitFromAbove.launchPower      = property.Number(100, 0);
LaunchUpwardWhenHitFromAbove.adjustToRotation = property.Boolean(true);

module.exports = LaunchUpwardWhenHitFromAbove;