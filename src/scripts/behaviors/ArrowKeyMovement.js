"use strict";

const {Behavior} = wfl.behavior;

const MOVE_SPEED = 5;

class ArrowKeyMovement extends Behavior {
  constructor(gameObject, keyboard) {
    super(gameObject);
    
    this.keyboard = keyboard;
  }
  
  update(dt) {
    let key = this.keyboard;
    let dx  = 0;
    let dy  = 0;

    if (key.isPressed(key.UP)) {
      dy -= MOVE_SPEED;
    }
    if (key.isPressed(key.DOWN)) {
      dy += MOVE_SPEED;
    }

    if (key.isPressed(key.RIGHT)) {
      dx += MOVE_SPEED;
    }
    if (key.isPressed(key.LEFT)) {
      dx -= MOVE_SPEED;
    }

    this.gameObject.position._x += dx * dt;
    this.gameObject.position._y += dy * dt;
  }
}

module.exports = ArrowKeyMovement;