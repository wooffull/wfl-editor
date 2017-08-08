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

  update(dt) {
    super.update(dt);
  }
}

module.exports = PlayGameScene;