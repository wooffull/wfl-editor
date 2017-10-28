'use strict';

const geom = wfl.geom;

module.exports = {
  tileToWorld: function (pos) {
    return new geom.Vec2(
      pos.x * 32 + 16,
      pos.y * 32 + 16
    );
  },
  
  worldToTile: function (pos) {
    return new geom.Vec2(
      Math.floor(pos.x / 32),
      Math.floor(pos.y / 32)
    );
  },
  
  directionNameToVector: function (name) {
    switch (name) {
      case 'up':
        return new geom.Vec2(0, -1);
      
      case 'down':
        return new geom.Vec2(0, 1);
      
      case 'left':
        return new geom.Vec2(-1, 0);
      
      case 'right':
        return new geom.Vec2(1, 0);
      
      default:
        return new geom.Vec2();
    }
  },
  
  tileAhead: function (worldPos, direction) {
    let tilePos = this.worldToTile(worldPos);
    let aheadTilePos = new geom.Vec2(
      tilePos.x + direction.x,
      tilePos.y + direction.y
    );
    return aheadTilePos;
  }
};