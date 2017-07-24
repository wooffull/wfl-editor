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

  draw(renderer) {
    let keyboard = this.editor.keyboard;

    // Holding Shift with the draw tool is a shortcut for the
    // Select tool
    if (keyboard.isPressed(keyboard.SHIFT)) {
      this.selectTool.draw(renderer);
    }
  }

  leftDown() {
    let keyboard        = this.editor.keyboard;
    let mouse           = this.editor.mouse;
    let selector        = this.editor.selector;
    let mouseWorldPos   = this.editor.convertPagePosToWorldPos(mouse.position);
    let selectorClicked = selector.hitTestPoint(mouseWorldPos);
    let clickObj        = this.editor.find(mouseWorldPos.x, mouseWorldPos.y);
    
    // Clicked an object that isn't yet selected, so it should be selected
    // Shift key also functions as a shortcut for selecting objects
    if (keyboard.isPressed(keyboard.SHIFT) ||
        (clickObj && !selector.isSelected(clickObj))) {
      
      this.selectTool.leftDown();
      this.clickedSelection = this.selectTool.clickedSelection;

    // If the selection was clicked, then prepare to drag the selection
    } else if (selectorClicked) {
      this.clickedSelection = true;
    
    // Clicked on an empty spot on the canvas, so align the selected objects
    } else {
      this.editor.scheduleSelectionAlign();
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