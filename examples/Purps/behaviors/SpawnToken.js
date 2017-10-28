"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;
const PIXI = wfl.PIXI;

class SpawnToken extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    // Get rid of any previous graphics
    this.gameObject.removeChildren();
    this._scene     = world.findScene('wfl');
    this._player    = this._scene.findGameObjectByName('player');
    
    if (typeof this._player.customData.tokenCount === 'undefined') {
      this._player.customData.tokenCount = 0;
    }
    
    let gfx_default0 = PIXI.loader.resources['Token_0'].texture;
    let gfx_default1 = PIXI.loader.resources['Token_1'].texture;
    let gfx_default2 = PIXI.loader.resources['Token_2'].texture;
    let gfx_default3 = PIXI.loader.resources['Token_3'].texture;
    
    this.frame0 = GameObject.createFrame(gfx_default0, 8);
    this.frame1 = GameObject.createFrame(gfx_default1, 4);
    this.frame2 = GameObject.createFrame(gfx_default2, 4);
    this.frame3 = GameObject.createFrame(gfx_default3, 4);
    
    this.defaultState = GameObject.createState();
    this.defaultState.addFrame(this.frame0);
    this.defaultState.addFrame(this.frame1);
    this.defaultState.addFrame(this.frame2);
    this.defaultState.addFrame(this.frame3);
    
    this.gameObject.addState('default', this.defaultState);
    this.gameObject.setState('default');
  }
  
  onOverlap(physObj) {
    if (physObj === this._player) {
      this._player.customData.tokenCount++;
      this._scene.removeGameObject(this.gameObject);
    }
  }
}

module.exports = SpawnToken;