"use strict";

const geom = wfl.geom;
const world = wfl.world;
const {Behavior, property} = wfl.behavior;

let id = 0;

class MoveAndWrap extends Behavior {
  constructor() {
    super();
    
    this.id = id;
    id++;
  }
  
  begin() {
    this.gameObject.name = 'cloud' + this.id;
  }
  
  update(dt) {
    let prevX = this.gameObject.position._x;
    
    this.gameObject.position._x += this.speedX * dt;
    this.gameObject.position._y += this.speedY * dt;
    
    if (this.gameObject.position._x < this.minX) this.gameObject.position._x = this.maxX;
    if (this.gameObject.position._x > this.maxX) this.gameObject.position._x = this.minX;
    if (this.gameObject.position._y < this.minY) this.gameObject.position._y = this.maxY;
    if (this.gameObject.position._y > this.maxY) this.gameObject.position._y = this.minY;
    
    //console.log(this.id, this.gameObject.position._x - prevX, this.speedX);
  }
}

MoveAndWrap.minX = property.Number(-1000);
MoveAndWrap.maxX = property.Number(1000);
MoveAndWrap.minY = property.Number(-1000);
MoveAndWrap.maxY = property.Number(1000);
MoveAndWrap.speedX = property.Number(1);
MoveAndWrap.speedY = property.Number(1);

module.exports = MoveAndWrap;