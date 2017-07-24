"use strict";

const Scene =             wfl.display.Scene;
const {GameObject,
       PhysicsObject}   = wfl.core.entities;

class EditorScene extends Scene {
  constructor(canvas) {
    super(canvas);
  }
  
  enableMouseEvents()  {}
  disableMouseEvents() {}
  
  cloneGameObject(original) {
    let gameObject = new GameObject();
    let entity     = original.customData.entity;
    let graphic    = wfl.PIXI.loader.resources[entity.name];
    let state      = GameObject.createState();
    let frame      = GameObject.createFrame(graphic.texture);
    
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
}

module.exports = EditorScene;