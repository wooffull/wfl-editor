"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;

class DestroyDoorWhenUnlocked extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
  }
  
  onCollide(physObj, collisionData) {
    if (physObj === this._player && this._player.customData.tokenCount > 0) {
      this._player.customData.tokenCount--;
      
      let doorPieces = this._scene.findGameObjectsByName(this.gameObject.name);
      for (let piece of doorPieces) {
        this._scene.removeGameObject(piece);
      }
    }
  }
}

module.exports = DestroyDoorWhenUnlocked;