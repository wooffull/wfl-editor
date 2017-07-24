"use strict";

const {GameObject,
       PhysicsObject}   = wfl.core.entities;
const geom              = wfl.geom;
const EditorScene       = require('./EditorScene');

class PlayGameScene extends EditorScene {
  constructor(canvas, mouse, keyboard) {
    super(canvas);

    this.canvas     = canvas;
    this.mouse      = mouse;
    this.keyboard   = keyboard;
  }

  update(dt) {
    this.handleInput();
    super.update(dt);
  }

  handleInput() {
    let key = this.keyboard;
    
    if (this.player) {
      let dx = 0;
      let dy = 0;
      
      if (key.isPressed(key.UP)) {
        dy -= 5;
      }
      if (key.isPressed(key.DOWN)) {
        dy += 5;
      }
      
      if (key.isPressed(key.RIGHT)) {
        dx += 5;
      }
      if (key.isPressed(key.LEFT)) {
        dx -= 5;
      }
      
      this.player.position._x += dx;
      this.player.position._y += dy;
    }
  }
}

module.exports = PlayGameScene;