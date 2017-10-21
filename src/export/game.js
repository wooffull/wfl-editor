"use strict";

const behaviors                   = require('./behaviors');
const Scene                       = wfl.display.Scene;
const {GameObject, PhysicsObject} = wfl.core.entities;

class GameScene extends Scene {
  constructor(canvas) {
    super(canvas);
    
    this.useDynamicZOrder = false;
  }
  
  reset() {
    super.reset();
    
    // TODO: Allow for configurable scene names
    this.register('wfl');
  }
  
  drawSort(renderer) {
    if (this.useDynamicZOrder) {
      return this._findSurroundingGameObjects(this.camera, 2).sort(
        (a, b) => {
          // Sort objects on the same layer by their bottom Y-coordinate
          if (a.layer === b.layer) {
            return (a.transform.position._y + a.calculationCache.height * 0.5)
                 - (b.transform.position._y + b.calculationCache.height * 0.5)

          // Otherwise, sort them by layer
          } else {
            return a.layer - b.layer;
          }
        }
      );
    } else {
      return super.drawSort(renderer);
    }
  }
  
  createFinalizedGameObject(original) {
    let gameObject = null;
    
    if (original.physics) {
      let physics = original.physics;
      gameObject = new PhysicsObject();
      
      gameObject.solid = physics.solid || false;
      gameObject.fixed = physics.fixed || false;
      
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
    
    let entity  = original.entity;
    let graphic = wfl.PIXI.loader.resources[entity.name];
    let state   = GameObject.createState();
    let frame   = GameObject.createFrame(graphic.texture);
    
    state.addFrame(frame);
    gameObject.addState(GameObject.STATE.DEFAULT, state);
    gameObject.customData.entity = entity;
    
    let rotation = 'rotation' in original ? original.rotation : 0;
    
    // Copy over necessary properties
    gameObject.name = original.name;
    gameObject.position._x = original.x;
    gameObject.position._y = original.y;
    gameObject.rotate(rotation);
    //gameObject.allowVertexRotation  = original.allowVertexRotation;
    gameObject.customData.behaviors = original.behaviors;
    
    // Add behaviors
    if (gameObject.customData.behaviors) {
      let behaviorKeys = Object.keys(gameObject.customData.behaviors);
      for (let key of behaviorKeys) {
        let behaviorData = gameObject.customData.behaviors[key];
        let behaviorClass = behaviors[key];
        let instance = new behaviorClass();
        
        // Set all properties
        let propertyKeys = Object.keys(behaviorData);
        for (let propertyKey of propertyKeys) {
          let propertyValue = behaviorData[propertyKey];
          instance[propertyKey] = propertyValue;
        }
        
        gameObject.addBehavior(instance);
      }
    }
    
    return gameObject;
  }
}








// Create game
var canvas   = document.querySelector("#game-canvas");
var game     = wfl.create(canvas);
var gameData = null;
//game.debug = true;//{vertices: true};

var onLoadWindow = function () {
  wfl.jquery.getJSON('./data.json', onLoadData);
  resize();
};

var onLoadData = function (data) {
  var l = game.loader;
  var level = data.level;
  var entities = level.entities;
  
  gameData = data;
  
  for (let entity of entities) {
    try {
      l = l.add(entity.name, `./assets/${entity.imageSource}`);
    } catch (e) {
    }
  }

  l.load(onLoadAssets);
};

var onLoadAssets = function () {
  let gameScene = new GameScene(canvas);
  gameScene.useDynamicZOrder = gameData.level.dynamicZOrder;
  
  let gameObjects = gameData.level.gameObjects;
  
  for (let gameObject of gameObjects) {
    let obj = gameScene.createFinalizedGameObject(gameObject);
    let layer = gameObject.layer;
    let persists = gameObject.persists || false;
    gameScene.addGameObject(obj, layer, persists);
  }
  
  game.setScene(gameScene);
};

var onResize = function (e) {
  resize();
};

var resize = function () {
  // Use the commented code if you want to limit the canvas size
  // var MAX_WIDTH  = 1366;
  // var MAX_HEIGHT = 768;
  var w = window.innerWidth;  // Math.min(window.innerWidth,  MAX_WIDTH);
  var h = window.innerHeight; // Math.min(window.innerHeight, MAX_HEIGHT);
  
  canvas.width  = w;
  canvas.height = h;
  game.renderer.view.style.width  = w + 'px';
  game.renderer.view.style.height = h + 'px';
  game.renderer.resize(w, h);
}

window.addEventListener('load', onLoadWindow);
window.addEventListener('resize', onResize);