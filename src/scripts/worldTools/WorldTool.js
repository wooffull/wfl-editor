"use strict";

class WorldTool {
  constructor(editor) {
    this.editor           = editor;
    this.clickedSelection = false;
  }

  reset()     { this.clickedSelection = false; }
  draw(renderer)   { }
  leftDown()  { }
  leftUp()    { }
  rightDown() { }
  rightUp()   { }
  mouseMove() { }
  pan(dx, dy) { }
}

module.exports = WorldTool;