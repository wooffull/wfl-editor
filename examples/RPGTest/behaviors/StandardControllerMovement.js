"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Keyboard} = wfl.input;
const {Behavior, property} = wfl.behavior;

let gamepadEventsAvailable = 'ongamepadconnected' in window;
let controllers = {};

function addGamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
}

function removeGamepad(gamepad) {
  delete controllers[gamepad.index];
}

function scanGamepads() {
  let gamepads = navigator.getGamepads ? navigator.getGamepads() :
                (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  for (let i = 0; i < gamepads.length; i++) {
    if (gamepads[i]) {
      if (gamepads[i].index in controllers) {
        controllers[gamepads[i].index] = gamepads[i];
      } else {
        addGamepad(gamepads[i]);
      }
    }
  }
}

function onGamepadConnect(e) {
  addGamepad(e.gamepad);
}

function onGamepadDisconnect(e) {
  removeGamepad(e.gamepad);
}

window.addEventListener('gamepadconnected', onGamepadConnect);
window.addEventListener('gamepaddisconnected', onGamepadDisconnect);

class StandardControllerMovement extends Behavior {
  constructor() {
    super();
    
    // Whether or not the update should be handled from an external behavior
    this.waitForExternalUpdate = false;
    this.controllers = controllers;
    this.currentController = null;
  }
  
  begin() {
    // TODO: Make default max speed higher
    this.gameObject.maxSpeed = this.moveSpeed;
    
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
    this._player.customData.direction = 'down';
  }
  
  update(dt) {
    this._updateCurrentController();
  
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
    if (!this.currentController || !this.currentController.connected) {
      return false;
    }
    
    for (let button of this.currentController.buttons) {
      if (button.pressed) {
        return true;
      }
    }
    
    for (let axis of this.currentController.axes) {
      if (Math.abs(axis) >= this.deadzoneX) {
        return true;
      }
    }
    
    return false;
  }
  
  _updateCurrentController() {
    if (!gamepadEventsAvailable) {
      scanGamepads();
    }
  
    let controllerKeys = Object.keys(this.controllers);
    let currentController = null;
    
    for (let key of controllerKeys) {
      if (this.controllers[key].mapping === 'standard' || this.allowNonStandardGamepads) {
        currentController = this.controllers[key];
        break;
      }
    }
    
    // No current controller, so use the first one found
    if (this.currentController === null) {
      this.currentController = currentController;
    
    // There is a current controller, but it doesn't match the one found, so clear it
    } else if (this.currentController !== currentController) {
      this.currentController = null;
    }
  }
  
  handleInput() {
    if (!this.currentController) {
      return;
    }
    
    let xAxis = 0;
    let yAxis = 0;
    
    // Take values from the dpad if it dictates movement
    if (this.dpad) {
      if (this.currentController.buttons.length > 14 &&
          this.currentController.buttons[14].pressed) {
        xAxis = -1;
      }
      if (this.currentController.buttons.length > 15 &&
          this.currentController.buttons[15].pressed) {
        xAxis = 1;
      }
      if (this.currentController.buttons.length > 12 &&
          this.currentController.buttons[12].pressed) {
        yAxis = -1;
      }
      if (this.currentController.buttons.length > 13 &&
          this.currentController.buttons[13].pressed) {
        yAxis = 1;
      }
    
    // Otherwise take values from analog sticks
    } else {
      if (this.currentController.axes.length > 0) {
        xAxis = this.currentController.axes[0];
      }
      if (this.currentController.axes.length > 1) {
        yAxis = this.currentController.axes[1];
      }
      
      if (Math.abs(xAxis) < this.deadzoneX) {
        xAxis = 0;
      }
      if (Math.abs(yAxis) < this.deadzoneY) {
        yAxis = 0;
      }
    }
    
    if (Math.abs(xAxis) >= Math.abs(yAxis)) {
      if (xAxis > 0) {
        this._player.customData.direction = 'right';
      } else if (xAxis < 0) {
        this._player.customData.direction = 'left';
      }
    } else {
      if (yAxis > 0) {
        this._player.customData.direction = 'down';
      } else if (yAxis < 0) {
        this._player.customData.direction = 'up';
      }
    }

    // Move the physics object in the appropriate direction
    if (this.gameObject.velocity) {
      let xMovementForce = new geom.Vec2(xAxis, 0);
      xMovementForce.multiply(this.moveSpeed * this.gameObject.mass);
      this.gameObject.addImpulse(xMovementForce);
      
      let yMovementForce = new geom.Vec2(0, yAxis);
      yMovementForce.multiply(this.moveSpeed * this.gameObject.mass);
      this.gameObject.addImpulse(yMovementForce);
      
    // If not a physics object, still allow basic movement
    } else {
      let dx = this.moveSpeed * xAxis;
      let dy = this.moveSpeed * yAxis;
      
      this.gameObject.position._x += dx;
      this.gameObject.position._y += dy;
    }
  }
}

StandardControllerMovement.moveSpeed = property.Number(5);
StandardControllerMovement.friction  = property.Number(0.9, 0, 1);
StandardControllerMovement.deadzoneX = property.Number(0.03, 0, 1);
StandardControllerMovement.deadzoneY = property.Number(0.03, 0, 1);
StandardControllerMovement.dpad      = property.Boolean(false);
StandardControllerMovement.allowNonStandardGamepads = property.Boolean(false);

module.exports = StandardControllerMovement;