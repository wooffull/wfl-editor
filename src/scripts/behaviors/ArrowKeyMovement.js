"use strict";

const geom = wfl.geom;
const {Behavior} = wfl.behavior;

const MOVE_SPEED = 5;
const FRICTION   = 0.9;

class ArrowKeyMovement extends Behavior {
  constructor(keyboard) {
    super();
    
    this.keyboard = keyboard;

    // The top of the stack determines which direction to face
    this._walkDirectionStack = [];
  }
  
  start() {
    // TODO: Add max speed input fields
    // TODO: Make default max speed higher
    this.gameObject.maxSpeed = MOVE_SPEED;
  }
  
  update(dt) {
    this.applyFriction();
    this.handleInput();
  }
  
  // TODO: Handle friction better. Make friction input fields?
  applyFriction() {
    this.gameObject.velocity.multiply(FRICTION);
    this.gameObject.acceleration.multiply(FRICTION);
  }
  
  handleInput() {
    let key           = this.keyboard;
    let lastPressed   = key.getKeyJustPressed();
    let leftPriority  = -1;
    let rightPriority = -1;
    let upPriority    = -1;
    let downPriority  = -1;

    // Remove values that shouldn't be in the stack
    for (let i = this._walkDirectionStack.length; i >= 0; i--) {
      if (!key.isPressed(this._walkDirectionStack[i])) {
        this._walkDirectionStack.splice(i, 1);
      }
    }

    // Add the current direction of movement to the stack (if any)
    if (lastPressed > -1) {
      switch (lastPressed) {
        case key.LEFT:
        case key.RIGHT:
        case key.UP:
        case key.DOWN:
          this._walkDirectionStack.push(lastPressed);
          break;
      }
    }

    // Determine the priorities of the directions
    var priorityCounter = 0;
    for (let i = 0; i < this._walkDirectionStack.length; i++) {
      switch (this._walkDirectionStack[i]) {
        case key.LEFT:
          leftPriority = priorityCounter;
          priorityCounter++;
          break;
        case key.RIGHT:
          rightPriority = priorityCounter;
          priorityCounter++;
          break;
        case key.UP:
          upPriority = priorityCounter;
          priorityCounter++;
          break;
        case key.DOWN:
          downPriority = priorityCounter;
          priorityCounter++;
          break;
      }
    }

    // Move the player in the appropriate direction
    if (leftPriority > rightPriority) {
      let movementForce = new geom.Vec2(-1, 0);
      movementForce.multiply(MOVE_SPEED * this.gameObject.mass);
      this.gameObject.addImpulse(movementForce);
    }
    if (rightPriority > leftPriority) {
      let movementForce = new geom.Vec2(1, 0);
      movementForce.multiply(MOVE_SPEED * this.gameObject.mass);
      this.gameObject.addImpulse(movementForce);
    }
    if (upPriority > downPriority) {
      let movementForce = new geom.Vec2(0, -1);
      movementForce.multiply(MOVE_SPEED * this.gameObject.mass);
      this.gameObject.addImpulse(movementForce);
    }
    if (downPriority > upPriority) {
      let movementForce = new geom.Vec2(0, 1);
      movementForce.multiply(MOVE_SPEED * this.gameObject.mass);
      this.gameObject.addImpulse(movementForce);
    }
  }
}

module.exports = ArrowKeyMovement;