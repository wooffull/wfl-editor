"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Keyboard} = wfl.input;
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
    this._registered = {};
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
    
    this._updatePlayerState();
  }
  
  registerButton(key, keyCodes, gamePadButtons) {
    this._registered[key] = {
      keyCodes: keyCodes,
      gamePadButtons: gamePadButtons
    };
  }
  
  checkButton(key) {
    let registered = this._registered[key];
    
    if (this._keyboardMovement) {
      for (let keyCode of registered.keyCodes) {
        if (Keyboard.isPressed(keyCode)) {
          return true;
        }
      }
    }
    
    if (this._controllerMovement && this._controllerMovement.currentController) {
      let currentController = this._controllerMovement.currentController;
      for (let gamePadButton of registered.gamePadButtons) {
        if (currentController.buttons[gamePadButton].pressed) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  _updatePlayerState() {
    let direction = this._player.customData.direction;
    let state     = null;
    let walking   = false;
    
    switch (direction) {
      case 'up':
        walking = this._player.velocity._y < -0.05;
        state = walking ? 'walk_u' : 'idle_u';
        break;
        
      case 'down':
        walking = this._player.velocity._y > 0.05;
        state = walking ? 'walk_d' : 'idle_d';
        break;
        
      case 'left':
        walking = this._player.velocity._x < -0.05;
        state = walking ? 'walk_l' : 'idle_l';
        break;
        
      case 'right':
        walking = this._player.velocity._x > 0.05;
        state = walking ? 'walk_r' : 'idle_r';
        break;
    }
    
    if (state) {
      this._player.setState(state);
    }
  }
}

MovementManager.moveSpeed = property.Number(5);
MovementManager.friction  = property.Number(0.9, 0, 1);

module.exports = MovementManager;