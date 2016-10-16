"use strict";

class Tool {
  constructor(editor) {
    this.editor           = editor;
    this.clickedSelection = false;
  }

  reset()     { this.clickedSelection = false; }
  draw(ctx)   { }
  leftDown()  { }
  leftUp()    { }
  rightDown() { }
  rightUp()   { }
  mouseMove() { }
  pan(dx, dy) { }
}

module.exports = Tool;
