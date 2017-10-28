"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Keyboard} = wfl.input;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;
const GridHelper = require('./_GridHelper');
const entities = require('./entities');

class PressButtonToAddEntityAheadOfPlayer extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    const MovementManager = require('./MovementManager');
  
    this._movementManager = null;
    
    // Find MovementManager
    for (let behavior of this.gameObject._behaviors) {
      if (behavior instanceof MovementManager) {
        this._movementManager = behavior;
      }
    }
  
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
    this._entityClass = entities[this.entityModuleName];
    this._objPool = [];
    this._lastPlacementTimer = Infinity;
    
    // Register buttons for this behavior
    if (this._movementManager) {
      this._movementManager.registerButton(
        'place-entity',
        [this.keyPrimary, this.keySecondary],
        [this.buttonPrimary, this.buttonSecondary]
      );
    }
  }
  
  update(dt) {
    this._lastPlacementTimer += dt;
  
    if (this._lastPlacementTimer >= this.placementTimer &&
        this._movementManager &&
        this._movementManager.checkButton('place-entity')) {
      
      let directionAhead = GridHelper.directionNameToVector(this._player.customData.direction);
      let aheadTilePos = GridHelper.tileAhead(this._player.position, directionAhead);
      let aheadWorldPos = GridHelper.tileToWorld(aheadTilePos);
      let aheadObjects = this._scene.findGameObjectsInRect(
        aheadWorldPos.x - 15,
        aheadWorldPos.y - 15,
        30,
        30
      );
      
      let canAdd = true;
      for (let obj of aheadObjects) {
        if (obj !== this._player) {
          canAdd = false;
          
          if (obj.customData.grabbable) {
            this.removeObj(obj);
            this._lastPlacementTimer = 0;
            break;
          }
        }
      }
      
      if (canAdd && this._entityClass) {
        let gameObject = this.createObj();
        gameObject.position.x = aheadWorldPos.x;
        gameObject.position.y = aheadWorldPos.y;
        this._lastPlacementTimer = 0;
      }
    }
  }
  
  createObj() {
    let obj = null;
  
    if (this._objPool.length > 0) {
      obj = this._objPool[this._objPool.length - 1];
      obj.solid = true;
      obj.fixed = true;
      obj.visible = true;
      this._objPool.splice(this._objPool.length - 1, 1);
    } else {
      obj = new this._entityClass();
      this._scene.addGameObject(obj, this.entityLayer);
    }
    
    return obj;
  }
  
  removeObj(obj) {
    if (obj) {
      obj.solid = false;
      obj.fixed = false;
      obj.visible = false;
      this._objPool.push(obj);
    }
  }
}

PressButtonToAddEntityAheadOfPlayer.entityModuleName = property.String();
PressButtonToAddEntityAheadOfPlayer.entityLayer = property.Integer(0, 0);
PressButtonToAddEntityAheadOfPlayer.keyPrimary = property.Integer(Keyboard.SPACEBAR, 0, 255);
PressButtonToAddEntityAheadOfPlayer.keySecondary = property.Integer(0, 0, 255);
PressButtonToAddEntityAheadOfPlayer.buttonPrimary = property.Integer(0, 0, 255);
PressButtonToAddEntityAheadOfPlayer.buttonSecondary = property.Integer(2, 0, 255);
PressButtonToAddEntityAheadOfPlayer.placementTimer = property.Integer(30, 0);

module.exports = PressButtonToAddEntityAheadOfPlayer;