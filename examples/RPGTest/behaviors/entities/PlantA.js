"use strict";

const {GameObject, PhysicsObject} = wfl.core.entities;
const PIXI = wfl.PIXI;

var PlantA = function () {
  PhysicsObject.call(this);
  
  let gfx_0 = PIXI.loader.resources['PlantA'].texture;
  this.frame0 = GameObject.createFrame(gfx_0);
  this.stateDefault = GameObject.createState();
  this.stateDefault.addFrame(this.frame0);
  this.addState('default', this.stateDefault);
  this.setState('default');
  
  this.solid = true;
  this.fixed = true;
  
  this.customData.grabbable = true;
};

PlantA.prototype = Object.create(PhysicsObject.prototype, {
});

module.exports = PlantA;