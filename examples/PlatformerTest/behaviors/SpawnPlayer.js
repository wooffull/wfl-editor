"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Behavior, property} = wfl.behavior;

class SpawnPlayer extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    this.gameObject.visible = false;
    
    this._scene  = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName(this.playerName);
    
    this._scene.player = this._player;
    this._scene.camera.follow(this._player);
    
    this._player.position._x = this.gameObject.position._x;
    this._player.position._y = this.gameObject.position._y;
    
    this._scene.camera.position._x = this._player.position._x;
    this._scene.camera.position._y = this._player.position._y;
  }
}

SpawnPlayer.playerName = property.String('player');

module.exports = SpawnPlayer;