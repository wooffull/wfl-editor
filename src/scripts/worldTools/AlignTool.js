"use strict";

const WorldTool  = require('./WorldTool');
const SelectTool = require('./SelectTool');

class AlignTool extends WorldTool {
  constructor(editor) {
    super(editor);

    this.selectTool = new SelectTool(editor);
  }
  
  reset() {
    super.reset();
    this.selectTool.reset();
  }

  draw(ctx) {
    let keyboard = this.editor.keyboard;

    // Holding Shift with the draw tool is a shortcut for the
    // Select tool, ONLY if the selection isn't being dragged
    if (!this.clickedSelection && keyboard.isPressed(keyboard.SHIFT)) {
      this.selectTool.draw(ctx);
    }
  }

  leftDown() {
    let keyboard        = this.editor.keyboard;
    let mouse           = this.editor.mouse;
    let mouseWorldPos   = this.editor.convertPagePosToWorldPos(mouse.position);
    let clickObj        = this.editor.find(mouseWorldPos.x, mouseWorldPos.y);
    let selector        = this.editor.selector;
    let selectedObjects = selector.selectedObjects;
    
    // Clicked an object, so it should be selected
    // Shift key also functions as a shortcut for selecting objects
    if (clickObj ||
      selector.hitTestPoint(mouseWorldPos) ||
      keyboard.isPressed(keyboard.SHIFT)) {

      this.selectTool.leftDown();
      this.clickedSelection = this.selectTool.clickedSelection; 
    
    // Clicked on an empty spot on the canvas, so align the selected objects
    } else {
      for (const obj of selectedObjects) {
        let tilePos  = this.editor.convertWorldPosToTilePos(obj.position);
        let worldPos = this.editor.convertTilePosToWorldPos(tilePos);

        obj.position.x = worldPos.x;
        obj.position.y = worldPos.y;
      }

      selector.update();
    }
  }
  
  leftUp() {
    let keyboard = this.editor.keyboard;

    // Holding Shift with the align tool is a shortcut for the Select tool
    if (keyboard.isPressed(keyboard.SHIFT)) {
      this.selectTool.leftUp();
    }
    
    this.clickedSelection = false;
    this.selectTool.clickedSelection = false;
  }
  
  rightDown() {
    let keyboard       = this.editor.keyboard;
    let mouse          = this.editor.mouse;
    let leftMouseState = mouse.getState(1);
    
    if (leftMouseState.isDown) {
      return;
    }
    
    // Holding Shift with the align tool is a shortcut for the Select tool
    if (keyboard.isPressed(keyboard.SHIFT)) {
      this.selectTool.rightDown();
    }
  }
}

module.exports = AlignTool;