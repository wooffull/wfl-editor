"use strict";

const {GameObject,
       PhysicsObject}   = wfl.core.entities;
const geom              = wfl.geom;
const EditorScene       = require('./EditorScene');

class PlayGameScene extends EditorScene {
  constructor(canvas, mouse, keyboard) {
    super(canvas);

    this.canvas   = canvas;
    this.mouse    = mouse;
    this.keyboard = keyboard;
  }
  
  createFinalizedGameObject(original) {
    let gameObject  = null;
    let physics     = null;
    let usesPhysics = false;
    
    // TODO: Add proper checks for usesPhysics
    if (original.customData.physics) {
      physics     = original.customData.physics;
      usesPhysics = physics.solid === true || physics.fixed === true;
    }
    
    if (usesPhysics) {
      gameObject = new PhysicsObject();
      gameObject.solid = physics.solid || false;
      gameObject.fixed = physics.fixed || false;
    } else {
      gameObject = new GameObject();
    }
    
    let entity  = original.customData.entity;
    let graphic = wfl.PIXI.loader.resources[entity.name];
    let state   = GameObject.createState();
    let frame   = GameObject.createFrame(graphic.texture);
    
    state.addFrame(frame);
    gameObject.addState(GameObject.STATE.DEFAULT, state);
    gameObject.customData.entity = entity;
    
    // Copy over necessary properties
    gameObject.position._x = original.position._x;
    gameObject.position._y = original.position._y;
    gameObject.rotate(original.rotation);
    gameObject.allowVertexRotation = original.allowVertexRotation;
    
    return gameObject;
  }

  update(dt) {
    super.update(dt);
  }
}

module.exports = PlayGameScene;