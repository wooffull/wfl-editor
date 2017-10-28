"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;
const PIXI = wfl.PIXI;

class SpawnPlayer extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    // Get rid of any previous graphics
    this.gameObject.removeChildren();
    
    this._scene = world.findScene('wfl');
    this._scene.player = this.gameObject;
    
    let gfx_defaultU = PIXI.loader.resources['Player_Up'].texture;
    let gfx_defaultD = PIXI.loader.resources['Player_Down'].texture;
    let gfx_defaultL = PIXI.loader.resources['Player_Left'].texture;
    let gfx_defaultR = PIXI.loader.resources['Player_Right'].texture;
    
    this.frameU = GameObject.createFrame(gfx_defaultU);
    this.frameD = GameObject.createFrame(gfx_defaultD);
    this.frameL = GameObject.createFrame(gfx_defaultL);
    this.frameR = GameObject.createFrame(gfx_defaultR);
    
    this.upState = GameObject.createState();
    this.upState.addFrame(this.frameU);
    
    this.downState = GameObject.createState();
    this.downState.addFrame(this.frameD);
    
    this.leftState = GameObject.createState();
    this.leftState.addFrame(this.frameL);
    
    this.rightState = GameObject.createState();
    this.rightState.addFrame(this.frameR);
    
    this.gameObject.addState('up', this.upState);
    this.gameObject.addState('down', this.downState);
    this.gameObject.addState('left', this.leftState);
    this.gameObject.addState('right', this.rightState);
    this.gameObject.setState('down');
  }
}

module.exports = SpawnPlayer;