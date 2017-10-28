"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;

class MovementManager extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    const ArrowKeyMovement = require('./ArrowKeyMovement');
    const StandardControllerMovement = require('./StandardControllerMovement');
    
    // TODO: Make default max speed higher
    this.gameObject.maxSpeed = this.moveSpeed;
  
    this._movementBehaviors = [];
    this._keyboardMovement = null;
    this._controllerMovement = null;
    
    // Find all movement schemes
    for (let behavior of this.gameObject._behaviors) {
      if (behavior instanceof ArrowKeyMovement) {
        this._keyboardMovement = behavior;
        this._movementBehaviors.push(behavior);
      }
      if (behavior instanceof StandardControllerMovement) {
        this._controllerMovement = behavior;
        this._movementBehaviors.push(behavior);
      }
    }
    
    // Unify properties for all movement behaviors
    for (let behavior of this._movementBehaviors) {
      behavior.moveSpeed = this.moveSpeed;
      behavior.friction  = this.friction;
      behavior.waitForExternalUpdate = true;
    }
  
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
  }
  
  update(dt) {
    // Keyboard takes priority
    if (this._keyboardMovement && this._keyboardMovement.checkAvailability()) {
      this._keyboardMovement.applyFriction();
      this._keyboardMovement.handleInput();
    
    // Use controller movement if keyboard isn't in use
    } else if (this._controllerMovement && this._controllerMovement.checkAvailability()) {
      this._controllerMovement.applyFriction();
      this._controllerMovement.handleInput();
    }
  }
}

MovementManager.moveSpeed = property.Number(5);
MovementManager.friction  = property.Number(0.9, 0, 1);

module.exports = MovementManager;