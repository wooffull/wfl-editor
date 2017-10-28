"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;

class SnapCamToNearestCamPoint extends Behavior {
  constructor() {
    super();
    
    this._camPoints = [];
  }
  
  begin() {
    // Get rid of any previous graphics
    this.gameObject.removeChildren();
    
    this._scene     = world.findScene('wfl');
    this._player    = this._scene.findGameObjectByName('player');
    this._camPoints = this._scene.findGameObjectsByName('campoint');
    
    for (let point of this._camPoints) {
      point.removeChildren();
    }
    
    // If the player spawns near a cam point, instantly snap the camera there
    let nearestCam = this._getNearestCamPoint();
    if (this._canSnap(nearestCam)) {
      this._scene.camera.follow(nearestCam);
      this._scene.camera.position.x = nearestCam.position.x;
      this._scene.camera.position.y = nearestCam.position.y;
    }
  }
  
  update() {
    this._snapToNearbyCamPoint();
  }
  
  _getNearestCamPoint() {
    let nearestPoint    = null;
    let nearestDistance = Infinity;
  
    for (let point of this._camPoints) {
      let displacement = geom.Vec2.subtract(this._player.position, point.position);
      let magSquared = displacement.getMagnitudeSquared();
      
      if (magSquared < nearestDistance) {
        nearestDistance = magSquared;
        nearestPoint = point;
      }
    }
    
    return nearestPoint;
  }
  
  _canSnap(camPoint) {
    if (camPoint) {
      let displacement = geom.Vec2.subtract(this._player.position, camPoint.position);
      let magSquared = displacement.getMagnitudeSquared();
      
      if (magSquared <= this.snapRadius * this.snapRadius) {
        return true;
      }
    }
    
    return false;
  }
  
  _snapToNearbyCamPoint() {
    let nearestCam = this._getNearestCamPoint();
    
    if (this._canSnap(nearestCam)) {
      this._scene.camera.follow(nearestCam);
    } else {
      this._scene.camera.follow(this._player);
    }
  }
}

SnapCamToNearestCamPoint.snapRadius = property.Number(100, 1);

module.exports = SnapCamToNearestCamPoint;