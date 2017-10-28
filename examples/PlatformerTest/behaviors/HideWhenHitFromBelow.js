"use strict";

const geom = wfl.geom;
const {Behavior, property} = wfl.behavior;

const DOWN = new geom.Vec2(0, 1);

class HideWhenHitFromBelow extends Behavior {
  constructor() {
    super();
  }
  
  onCollide(physObj, collisionData) {
    if (physObj.customData.hittingJump) {
      let direction = collisionData.direction.x * DOWN._x + collisionData.direction.y * DOWN._y;
      
      if (direction > 0.75) {
        this.gameObject.visible = false;
      }
    }
  }
}

module.exports = HideWhenHitFromBelow;