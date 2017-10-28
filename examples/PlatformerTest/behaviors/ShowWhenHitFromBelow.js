"use strict";

const geom = wfl.geom;
const {Behavior, property} = wfl.behavior;

const UP = new geom.Vec2(0, -1);
const DOWN = new geom.Vec2(0, 1);

class ShowWhenHitFromBelow extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    this.gameObject.visible = false;
  }
  
  onOverlap(physObj) {
    if (physObj.customData.hittingJump) {
      let velocityDirection = physObj.velocity.clone().normalize();
      let velocityDotUp = velocityDirection.x * UP._x + velocityDirection.y * UP._y;
      
      let displacementDirection = geom.Vec2.subtract(physObj.position, this.gameObject.position).normalize();
      let displacementDotDown = displacementDirection.x * DOWN._x + displacementDirection.y * DOWN._y;
      
      if (velocityDotUp > 0.75 && displacementDotDown > 0.75) {
        this.gameObject.solid = true;
        this.gameObject.visible = true;
      }
    }
  }
}

module.exports = ShowWhenHitFromBelow;