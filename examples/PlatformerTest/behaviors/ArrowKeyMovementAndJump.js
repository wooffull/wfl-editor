"use strict";

const geom = wfl.geom;
const {Keyboard} = wfl.input;
const {Behavior, property} = wfl.behavior;

const DOWN = new geom.Vec2(0, 1);

class ArrowKeyMovement extends Behavior {
  constructor() {
    super();
    
    // The top of the stack determines which direction to face
    this._walkDirectionStack = [];
    
    this._isGrounded       = false;
    this._canJump          = false;
    this._timeOnGround     = 0;
    this._currentJumpTimer = 0;
  }
  
  begin() {
    // Whether or not this game object's "head" counts as a hit for the thing it jumps into
    this.gameObject.customData.hittingJump = true;
    this.gameObject.customData.justHitHead = false;
    
    // TODO: Make default max speed higher
    this.gameObject.maxSpeed        = Infinity;
    this.gameObject.maxAcceleration = this.maxAcceleration;
  }
  
  update(dt) {
    this.gameObject.acceleration.multiply(0);
  
    this.applyFriction();
    this.handleInput();
    this.updateJump(dt);
    
    if (this.gameObject.velocity.x < -this.maxSpeedX) {
      this.gameObject.velocity.x = -this.maxSpeedX;
    } else if (this.gameObject.velocity.x > this.maxSpeedX) {
      this.gameObject.velocity.x = this.maxSpeedX;
    }
    
    if (this.gameObject.velocity.y < -this.maxSpeedY) {
      this.gameObject.velocity.y = -this.maxSpeedY;
    } else if (this.gameObject.velocity.y > this.maxSpeedY) {
      this.gameObject.velocity.y = this.maxSpeedY;
    }
    
    if (this._isGrounded) {
      this._timeOnGround += dt;
    } else {
      this._timeOnGround = 0;
    }
    
    // Reset the hitting jump if the game object just hit its "head"
    if (this.gameObject.customData.justHitHead) {
      this.gameObject.customData.hittingJump = false;
    }
    
    this._isGrounded = false;
    this.gameObject.customData.justHitHead = false;
  }
  
  onCollide(physObj, collisionData) {
    let direction = collisionData.direction.x * DOWN._x + collisionData.direction.y * DOWN._y;
    
    if (this.gameObject.velocity.y >= 0 && direction > 0.75) {
      if (physObj.customData.preventLanding !== true) {
        this._isGrounded = true;
        this.gameObject.customData.hittingJump = true;
      
        if (this.canResetJump()) {
          this.resetJump();
        }
      }
    
    // If the player hits its head, end the jump
    } else if (direction < -0.75) {
      if (this.gameObject.customData.hittingJump) {
        this.gameObject.customData.justHitHead = true;
        this._currentJumpTimer = this.jumpTime - this.hitHeadHoldTime;
      }
    }
  }
  
  applyFriction() {
    if (this.gameObject.velocity) {
      this.gameObject.velocity.multiply(this.airResistance);
      this.gameObject.acceleration.multiply(this.airResistance);
    }
  }
  
  applyGravity() {
    let gravityForce = new geom.Vec2(0, 1);
    gravityForce.multiply(this.gravity * this.gameObject.mass);
    this.gameObject.addForce(gravityForce);
  }

  calculateJumpIncrement(t0, t1) {
    let offset0 = t0 - this.jumpTime;
    let offset1 = t1 - this.jumpTime;
    return (this.jumpHeight / (this.jumpTime * this.jumpTime * this.jumpTime)) * (offset1 * offset1 * offset1 - offset0 * offset0 * offset0);
  }

  resetJump() {
    this._currentJumpTimer = 0;
    this._canJump          = true;
  }
  
  updateJump(dt) {
    let key = Keyboard;
    let jumpKeyDown = key.isPressed(key.SPACEBAR) || (this._currentJumpTimer > 0 && key.isPressed(key.SPACEBAR));
    let prevJumpTimer = this._currentJumpTimer;
    let deltaTimeSinceLastJump = dt;

    // If no jump key is down, or the jump has finished, the player can no longer jump
    if (!jumpKeyDown || this._currentJumpTimer >= this.jumpTime) {
      this._canJump = false;

    // Otherwise, if the player can jump, jump!
    } else if (this._canJump) {
      if (this._currentJumpTimer < this.jumpTime) {
        this._currentJumpTimer += deltaTimeSinceLastJump;

        // Do not allow the jump timer to exceed the total time allow for holding a jump
        if (this._currentJumpTimer > this.jumpTime) {
          deltaTimeSinceLastJump = this._currentJumpTimer - this.jumpTime;
          this._currentJumpTimer = this.jumpTime;
        }
      }
    }

    // If the player is jumping, prepare to move this game object up in space
    if (this._canJump && this._currentJumpTimer > 0) {
      let jumpIncrement = this.calculateJumpIncrement(prevJumpTimer, this._currentJumpTimer);
      let jumpForce = new geom.Vec2(0, -1);
      jumpForce.multiply(jumpIncrement * this.gameObject.mass);
      
      // Nullify the affects of all previous jump forces
      this.gameObject.velocity.y = 0;
      
      this.gameObject.addImpulse(jumpForce);
    } else {
      this.applyGravity();
    }

    // Reset jump variables if grounded and can't jump
    if (this._isGrounded && !this._canJump && this.canResetJump()) {
      this.resetJump();
    }
  }
  
  canResetJump() {
    return this._timeOnGround >= this.minGroundTime && this._currentJumpTimer + this._timeOnGround >= this.minJumpTime;
  }
  
  handleInput() {
    let key           = Keyboard;
    let leftPriority  = -1;
    let rightPriority = -1;

    // Remove values that shouldn't be in the stack
    for (let i = this._walkDirectionStack.length; i >= 0; i--) {
      if (!key.isPressed(this._walkDirectionStack[i])) {
        this._walkDirectionStack.splice(i, 1);
      }
    }

    // Add the current direction of movement to the stack (if any)
    if (key.isPressed(key.LEFT) && this._walkDirectionStack.indexOf(key.LEFT) < 0) {
      this._walkDirectionStack.push(key.LEFT);
    }
    if (key.isPressed(key.RIGHT) && this._walkDirectionStack.indexOf(key.RIGHT) < 0) {
      this._walkDirectionStack.push(key.RIGHT);
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
      }
    }

    // Move the physics object in the appropriate direction
    if (this.gameObject.velocity) {
      if (leftPriority > rightPriority) {
        let movementForce = new geom.Vec2(-1, 0);
        movementForce.multiply(this.moveSpeed * this.gameObject.mass);
        this.gameObject.addImpulse(movementForce);
        this.gameObject.scale.x = -1;
      }
      if (rightPriority > leftPriority) {
        let movementForce = new geom.Vec2(1, 0);
        movementForce.multiply(this.moveSpeed * this.gameObject.mass);
        this.gameObject.addImpulse(movementForce);
        this.gameObject.scale.x = 1;
      }
    }
  }
}

ArrowKeyMovement.gravity         = property.Number(5, 0);
ArrowKeyMovement.moveSpeed       = property.Number(1, 0);
ArrowKeyMovement.jumpHeight      = property.Number(200, 0);
ArrowKeyMovement.jumpTime        = property.Number(15, 0);
ArrowKeyMovement.minJumpTime     = property.Number(5, 0);
ArrowKeyMovement.minGroundTime   = property.Number(5, 0);
ArrowKeyMovement.hitHeadHoldTime = property.Number(5, 0);
ArrowKeyMovement.airResistance   = property.Number(0.9, 0, 1);
ArrowKeyMovement.maxSpeedX       = property.Number(12, 0);
ArrowKeyMovement.maxSpeedY       = property.Number(12, 0);
ArrowKeyMovement.maxAcceleration = property.Number(12, 0);

module.exports = ArrowKeyMovement;