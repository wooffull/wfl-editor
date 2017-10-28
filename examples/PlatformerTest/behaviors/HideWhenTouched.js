"use strict";

const geom = wfl.geom;
const {Behavior, property} = wfl.behavior;

class HideWhenTouched extends Behavior {
  constructor() {
    super();
  }
  
  onOverlap(physObj) {
    if (!physObj.fixed && this.gameObject.visible) {
      this.gameObject.visible = false;
    }
  }
}

module.exports = HideWhenTouched;