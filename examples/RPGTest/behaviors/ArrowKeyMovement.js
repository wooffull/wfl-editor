"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Keyboard} = wfl.input;
const {Behavior, property} = wfl.behavior;

class ArrowKeyMovement extends Behavior {
  constructor() {
    super();
    
    // Whether or not the update should be handled from an external behavior
    this.waitForExternalUpdate = false;

    // The top of the stack determines which direction to face
    this._walkDirectionStack = [];
  }
  
  begin() {
    // TODO: Make default max speed higher
    this.gameObject.maxSpeed = this.moveSpeed;
    
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
    this._player.customData.direction = 'down';
    
    this._lastDirection = Keyboard.DOWN;
  }
  
  update(dt) {
    if (!this.waitForExternalUpdate) {
      this.applyFriction();
      this.handleInput();
    }
  }
  
  applyFriction() {
    if (this.gameObject.velocity) {
      this.gameObject.velocity.multiply(this.friction);
      this.gameObject.acceleration.multiply(this.friction);
    }
  }
  
  checkAvailability() {
    return Keyboard.anyKeyPressed;
  }
  
  handleInput() {
    let key           = Keyboard;
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
    
    if (this._walkDirectionStack.length > 0) {
      this._lastDirection = this._walkDirectionStack[this._walkDirectionStack.length - 1];
    }
    
    switch (this._lastDirection) {
      case key.LEFT:
        this._player.customData.direction = 'left';
        break;
      case key.RIGHT:
        this._player.customData.direction = 'right';
        break;
      case key.UP:
        this._player.customData.direction = 'up';
        break;
      case key.DOWN:
        this._player.customData.direction = 'down';
        break;
    }

    // Move the physics object in the appropriate direction
    if (this.gameObject.velocity) {
      if (leftPriority > rightPriority) {
        let movementForce = new geom.Vec2(-1, 0);
        movementForce.multiply(this.moveSpeed * this.gameObject.mass);
        this.gameObject.addImpulse(movementForce);
      }
      if (rightPriority > leftPriority) {
        let movementForce = new geom.Vec2(1, 0);
        movementForce.multiply(this.moveSpeed * this.gameObject.mass);
        this.gameObject.addImpulse(movementForce);
      }
      if (upPriority > downPriority) {
        let movementForce = new geom.Vec2(0, -1);
        movementForce.multiply(this.moveSpeed * this.gameObject.mass);
        this.gameObject.addImpulse(movementForce);
      }
      if (downPriority > upPriority) {
        let movementForce = new geom.Vec2(0, 1);
        movementForce.multiply(this.moveSpeed * this.gameObject.mass);
        this.gameObject.addImpulse(movementForce);
      }
      
    // If not a physics object, still allow basic movement
    } else {
      let dx = 0;
      let dy = 0;
      
      if (leftPriority > rightPriority) {
        dx += -this.moveSpeed;
      }
      if (rightPriority > leftPriority) {
        dx += this.moveSpeed;
      }
      if (upPriority > downPriority) {
        dy += -this.moveSpeed;
      }
      if (downPriority > upPriority) {
        dy += this.moveSpeed;
      }
      
      this.gameObject.position._x += dx;
      this.gameObject.position._y += dy;
    }
  }
}

ArrowKeyMovement.moveSpeed = property.Number(5);
ArrowKeyMovement.friction  = property.Number(0.9, 0, 1);

module.exports = ArrowKeyMovement;