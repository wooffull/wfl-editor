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
    
    this._scene.camera.follow(this.gameObject);
    this._scene.camera.position.x = this.gameObject.position.x;
    this._scene.camera.position.y = this.gameObject.position.y;
    
    let gfx_U0 = PIXI.loader.resources['Player_Up0'].texture;
    let gfx_U1 = PIXI.loader.resources['Player_Up1'].texture;
    let gfx_U2 = PIXI.loader.resources['Player_Up2'].texture;
    let gfx_U3 = PIXI.loader.resources['Player_Up3'].texture;
    let gfx_D0 = PIXI.loader.resources['Player_Down0'].texture;
    let gfx_D1 = PIXI.loader.resources['Player_Down1'].texture;
    let gfx_D2 = PIXI.loader.resources['Player_Down2'].texture;
    let gfx_D3 = PIXI.loader.resources['Player_Down3'].texture;
    let gfx_L0 = PIXI.loader.resources['Player_Left0'].texture;
    let gfx_L1 = PIXI.loader.resources['Player_Left1'].texture;
    let gfx_L2 = PIXI.loader.resources['Player_Left2'].texture;
    let gfx_L3 = PIXI.loader.resources['Player_Left3'].texture;
    let gfx_R0 = PIXI.loader.resources['Player_Right0'].texture;
    let gfx_R1 = PIXI.loader.resources['Player_Right1'].texture;
    let gfx_R2 = PIXI.loader.resources['Player_Right2'].texture;
    let gfx_R3 = PIXI.loader.resources['Player_Right3'].texture;
    
    this.frameU0 = GameObject.createFrame(gfx_U0, this.animationSpeed);
    this.frameU1 = GameObject.createFrame(gfx_U1, this.animationSpeed);
    this.frameU2 = GameObject.createFrame(gfx_U2, this.animationSpeed);
    this.frameU3 = GameObject.createFrame(gfx_U3, this.animationSpeed);
    
    this.frameD0 = GameObject.createFrame(gfx_D0, this.animationSpeed);
    this.frameD1 = GameObject.createFrame(gfx_D1, this.animationSpeed);
    this.frameD2 = GameObject.createFrame(gfx_D2, this.animationSpeed);
    this.frameD3 = GameObject.createFrame(gfx_D3, this.animationSpeed);
    
    this.frameL0 = GameObject.createFrame(gfx_L0, this.animationSpeed);
    this.frameL1 = GameObject.createFrame(gfx_L1, this.animationSpeed);
    this.frameL2 = GameObject.createFrame(gfx_L2, this.animationSpeed);
    this.frameL3 = GameObject.createFrame(gfx_L3, this.animationSpeed);
    
    this.frameR0 = GameObject.createFrame(gfx_R0, this.animationSpeed);
    this.frameR1 = GameObject.createFrame(gfx_R1, this.animationSpeed);
    this.frameR2 = GameObject.createFrame(gfx_R2, this.animationSpeed);
    this.frameR3 = GameObject.createFrame(gfx_R3, this.animationSpeed);
    
    this.stateIdleU = GameObject.createState();
    this.stateIdleU.addFrame(this.frameU0);
    
    this.stateIdleD = GameObject.createState();
    this.stateIdleD.addFrame(this.frameD0);
    
    this.stateIdleL = GameObject.createState();
    this.stateIdleL.addFrame(this.frameL0);
    
    this.stateIdleR = GameObject.createState();
    this.stateIdleR.addFrame(this.frameR0);
    
    this.stateWalkU = GameObject.createState();
    this.stateWalkU.addFrame(this.frameU0);
    this.stateWalkU.addFrame(this.frameU1);
    this.stateWalkU.addFrame(this.frameU2);
    this.stateWalkU.addFrame(this.frameU3);
    
    this.stateWalkD = GameObject.createState();
    this.stateWalkD.addFrame(this.frameD0);
    this.stateWalkD.addFrame(this.frameD1);
    this.stateWalkD.addFrame(this.frameD2);
    this.stateWalkD.addFrame(this.frameD3);
    
    this.stateWalkL = GameObject.createState();
    this.stateWalkL.addFrame(this.frameL0);
    this.stateWalkL.addFrame(this.frameL1);
    this.stateWalkL.addFrame(this.frameL2);
    this.stateWalkL.addFrame(this.frameL3);
    
    this.stateWalkR = GameObject.createState();
    this.stateWalkR.addFrame(this.frameR0);
    this.stateWalkR.addFrame(this.frameR1);
    this.stateWalkR.addFrame(this.frameR2);
    this.stateWalkR.addFrame(this.frameR3);
    
    this.gameObject.addState('idle_u', this.stateIdleU);
    this.gameObject.addState('idle_d', this.stateIdleD);
    this.gameObject.addState('idle_l', this.stateIdleL);
    this.gameObject.addState('idle_r', this.stateIdleR);
    this.gameObject.addState('walk_u', this.stateWalkU);
    this.gameObject.addState('walk_d', this.stateWalkD);
    this.gameObject.addState('walk_l', this.stateWalkL);
    this.gameObject.addState('walk_r', this.stateWalkR);
    this.gameObject.setState('idle_d');
  }
}

SpawnPlayer.animationSpeed = property.Number(5, 1);

module.exports = SpawnPlayer;