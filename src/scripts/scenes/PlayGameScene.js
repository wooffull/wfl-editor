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
  
  reset() {
    super.reset();
    
    // TODO: Allow for configurable scene names
    this.register('wfl');
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
      
      gameObject.solid = physics.solid;
      gameObject.fixed = physics.fixed;
      
      gameObject.mass = 'mass' in physics
                      ? parseFloat(physics.mass)
                      : PhysicsObject.DEFAULT_MASS;
      
      gameObject.friction = 'friction' in physics
                      ? parseFloat(physics.friction)
                      : PhysicsObject.DEFAULT_SURFACE_FRICTION;
      
      gameObject.restitution = 'restitution' in physics
                      ? parseFloat(physics.restitution)
                      : PhysicsObject.DEFAULT_SURFACE_RESTITUTION;
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
    gameObject.allowVertexRotation  = original.allowVertexRotation;
    gameObject.customData.behaviors = original.customData.behaviors;
    
    // Add behaviors
    if (gameObject.customData.behaviors) {
      let behaviorKeys = Object.keys(gameObject.customData.behaviors);
      for (let key of behaviorKeys) {
        let behavior = gameObject.customData.behaviors[key];
        let instance = new behavior.module(this.keyboard);
        gameObject.addBehavior(instance);
      }
    }
    
    return gameObject;
  }

  update(dt) {
    try {
      super.update(dt);
    } catch (err) {
      $(this).trigger('throw-error', [err]);
    }
  }
}

module.exports = PlayGameScene;