"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {GameObject} = wfl.core.entities;
const {Behavior, property} = wfl.behavior;
const PIXI = wfl.PIXI;
const GridHelper = require('./_GridHelper');

class MarkTileAheadOfPlayer extends Behavior {
  constructor() {
    super();
  }
  
  begin() {
    // Get rid of any previous graphics
    this.gameObject.removeChildren();
    
    this._scene = world.findScene('wfl');
    this._player = this._scene.findGameObjectByName('player');
    
    let gfx0 = PIXI.loader.resources['TileMarker0'].texture;
    let gfx1 = PIXI.loader.resources['TileMarker1'].texture;
    
    this.frame0 = GameObject.createFrame(gfx0, this.animationSpeed);
    this.frame1 = GameObject.createFrame(gfx1, this.animationSpeed);
    
    this.state = GameObject.createState();
    this.state.addFrame(this.frame0);
    this.state.addFrame(this.frame1);
    
    this.gameObject.addState('default', this.state);
    this.gameObject.setState('default');
  }
  
  update(dt) {
    let directionAhead = GridHelper.directionNameToVector(this._player.customData.direction);
    let aheadTilePos = GridHelper.tileAhead(this._player.position, directionAhead);
    let aheadWorldPos = GridHelper.tileToWorld(aheadTilePos);
    this.gameObject.position.x = aheadWorldPos.x;
    this.gameObject.position.y = aheadWorldPos.y;
  }
}

MarkTileAheadOfPlayer.animationSpeed = property.Number(10, 1);

module.exports = MarkTileAheadOfPlayer;