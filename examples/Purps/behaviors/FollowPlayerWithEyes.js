"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Behavior, property} = wfl.behavior;

class FollowPlayerWithEyes extends Behavior {
  constructor() {
    super();
    
    this.inactiveEyeData = [];
    this.activeEyeData = [];
    this.prevEyePos = new geom.Vec2();
  }
  
  begin() {
    this.gameObject.visible = false;
    
    this._scene = world.findScene('wfl');
    
    this._player = this._scene.findGameObjectByName('player');
    
    this._eye_a0 = this._scene.findGameObjectByName('eye_a0');
    this._eye_a1 = this._scene.findGameObjectByName('eye_a1');
    this._eye_b0 = this._scene.findGameObjectByName('eye_b0');
    this._eye_b1 = this._scene.findGameObjectByName('eye_b1');
    this._eye_c0 = this._scene.findGameObjectByName('eye_c0');
    this._eye_c1 = this._scene.findGameObjectByName('eye_c1');
    this._eye_d0 = this._scene.findGameObjectByName('eye_d0');
    this._eye_d1 = this._scene.findGameObjectByName('eye_d1');
    
    this._eye_a0.visible = false;
    this._eye_a1.visible = false;
    this._eye_b0.visible = false;
    this._eye_b1.visible = false;
    this._eye_c0.visible = false;
    this._eye_c1.visible = false;
    this._eye_d0.visible = false;
    this._eye_d1.visible = false;
    
    this._addAnimation([this._eye_a0, this._eye_a1, this._eye_a0]);
    this._addAnimation([this._eye_b0, this._eye_b1, this._eye_b0]);
    this._addAnimation([this._eye_c0, this._eye_c1, this._eye_c0]);
    this._addAnimation([this._eye_d0, this._eye_d1, this._eye_d0]);
    
    this.prevEyePos.x = this._player.position.x;
    this.prevEyePos.y = this._player.position.y;
  }
  
  update(dt) {
    let prevToCur = geom.Vec2.subtract(this._player.position, this.prevEyePos);
    if (this.inactiveEyeData.length > 0 && prevToCur.getMagnitudeSquared() >= 32 * 32) {
      this.prevEyePos.x = this._player.position.x;
      this.prevEyePos.y = this._player.position.y;
      
      let activeAnimation = this.inactiveEyeData[0];
      this.inactiveEyeData.splice(0, 1);
      this.activeEyeData.push(activeAnimation);
      
      for (let frame of activeAnimation.frames) {
        frame.position.x = this._player.position.x;
        frame.position.y = this._player.position.y;
      }
    }
    
    this.animateEyes();
  }
  
  animateEyes() {
    for (let animation of this.activeEyeData) {
      // Hide previous frame then increment
      animation.frames[animation.currentFrame].visible = false;
      animation.counter++;
      animation.currentFrame = Math.floor(animation.counter / animation.frameLength);
      
      // Make the animation inactive once it finishes
      if (animation.counter >= animation.frameLength * animation.frames.length) {
        animation.counter = 0;
        animation.currentFrame = 0;
        this.activeEyeData.splice(this.activeEyeData.indexOf(animation), 1);
        this.inactiveEyeData.push(animation);
        
      // Otherwise, show current frame
      } else {
        animation.frames[animation.currentFrame].visible = true;
      }
    }
  }
  
  _addAnimation(frames) {
    let animation = {
      frames: frames,
      frameLength: 12,
      currentFrame: 0,
      counter: 0
    };
    this.inactiveEyeData.push(animation);
  }
}

module.exports = FollowPlayerWithEyes;