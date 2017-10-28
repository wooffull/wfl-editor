"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;

const LEFT = new geom.Vec2(-1, 0);
const RIGHT = new geom.Vec2(1, 0);

class DoorEyeFollowPlayer extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    // Get rid of any previous graphics
    this.gameObject.removeChildren();
    
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
    
    let gfx_defaultL = PIXI.loader.resources['DoorClosed_TopLeft'].texture;
    let gfx_defaultM = PIXI.loader.resources['DoorClosed_TopMid'].texture;
    let gfx_defaultR = PIXI.loader.resources['DoorClosed_TopRight'].texture;
    
    this.frameL = GameObject.createFrame(gfx_defaultL);
    this.frameM = GameObject.createFrame(gfx_defaultM);
    this.frameR = GameObject.createFrame(gfx_defaultR);
    
    this.leftState = GameObject.createState();
    this.leftState.addFrame(this.frameL);
    
    this.midState = GameObject.createState();
    this.midState.addFrame(this.frameM);
    
    this.rightState = GameObject.createState();
    this.rightState.addFrame(this.frameR);
    
    this.gameObject.addState('left', this.leftState);
    this.gameObject.addState('middle', this.midState);
    this.gameObject.addState('right', this.rightState);
    this.gameObject.setState('middle');
  }
  
  update(dt) {
    let displacement = geom.Vec2.subtract(this._player.position, this.gameObject.position);
    displacement.normalize();
    
    let leftDirection = geom.Vec2.dot(LEFT, displacement);
    let rightDirection = geom.Vec2.dot(RIGHT, displacement);
    
    if (leftDirection >= 0.3) {
      this.gameObject.setState('left');
    } else if (rightDirection >= 0.3) {
      this.gameObject.setState('right');
    } else {
      this.gameObject.setState('middle');
    }
  }
}

module.exports = DoorEyeFollowPlayer;