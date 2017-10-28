"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Behavior, property} = wfl.behavior;

const UP = new geom.Vec2(0, -1);

class RespawnWhenHitFromAbove extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    this.gameObject.customData.preventLanding = true;
    
    this.direction         = new geom.Vec2(0, -1);
    this._previousRotation = Infinity;
    
    this._scene      = world.findScene('wfl');
    this._spawnPoint = this._scene.findGameObjectByName(this.spawnPointName);
    this._player     = this._scene.findGameObjectByName(this.playerName);
  }
  
  update(dt) {
    if (this.adjustToRotation) {
      this._updateDirection();
    }
  }
  
  _updateDirection() {
    if (this.gameObject.rotation !== this._previousRotation) {
      this.direction = this.gameObject.forward.getOrthogonal();
      this._previousRotation = this.gameObject.rotation;
      
      // If the direction is mainly upward, this game object shouldn't be treated as a platform.
      // Otherwise, it may be on its side, in which case it can be a platform.
      let direction = UP.x * this.direction._x + UP.y * this.direction._y;
      this.gameObject.customData.preventLanding = direction > 0.75;
    }
  }
  
  onCollide(physObj, collisionData) {
    if (physObj === this._player) {
      let direction = collisionData.direction.x * this.direction._x + collisionData.direction.y * this.direction._y;
      
      if (direction > 0.75) {
        this._player.position._x = this._spawnPoint.position._x;
        this._player.position._y = this._spawnPoint.position._y;
        this._player.acceleration.multiply(0);
        this._player.velocity.multiply(0);
        this._player._previousVelocity.multiply(0);
        this._player.cacheCalculations();
      }
    }
  }
}

RespawnWhenHitFromAbove.spawnPointName   = property.String('spawn');
RespawnWhenHitFromAbove.playerName       = property.String('player');
RespawnWhenHitFromAbove.adjustToRotation = property.Boolean(true);

module.exports = RespawnWhenHitFromAbove;