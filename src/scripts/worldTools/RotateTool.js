"use strict";

const PhysicsObject = wfl.core.entities.PhysicsObject;
const WorldTool     = require('./WorldTool');
const SelectTool    = require('./SelectTool');

class RotateTool extends WorldTool {
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
    
    // Clicked an object, so it should be selected
    // Shift key also functions as a shortcut for selecting objects
    if (clickObj ||
      selector.hitTestPoint(mouseWorldPos) ||
      keyboard.isPressed(keyboard.SHIFT)) {

      this.selectTool.leftDown();
      this.clickedSelection = this.selectTool.clickedSelection;
    }
  }
  
  rightDown() {
    let keyboard = this.editor.keyboard;
    let selector = this.editor.selector;
    
    // Holding Shift with the rotate tool is a shortcut for the Select tool
    if (keyboard.isPressed(keyboard.SHIFT)) {
      this.selectTool.rightDown();
    } else {
      let selectedObjects = selector.selectedObjects;
      
      // Snap rotations to the nearest Math.PI/4
      for (const obj of selectedObjects) {
        let curRotation = obj.getRotation();
        let newRotation = Math.round(8 * curRotation / (2 * Math.PI)) *
                          (2 * Math.PI) / 8;
        obj.setRotation(newRotation);
      }
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
  
  mouseMove() {
    let keyboard        = this.editor.keyboard;
    let mouse           = this.editor.mouse;
    let selector        = this.editor.selector;
    let selectedObjects = selector.selectedObjects;
    
    // Holding Shift with the align tool is a shortcut for the Select tool,
    // ONLY if the selection isn't being dragged
    if (!keyboard.isPressed(keyboard.SHIFT)) {
      let leftMouseState = mouse.getState(1);
      
      if (leftMouseState.dragging) {
        let dragY    = leftMouseState.dragEnd.y - leftMouseState.prevPos.y;
        let dTheta   = dragY % (4 * PhysicsObject.TOTAL_DISPLAY_ANGLES);
        let rotation =
            2 * Math.PI * (dTheta / (4 * PhysicsObject.TOTAL_DISPLAY_ANGLES));
        
        for (const obj of selectedObjects) {
          obj.rotate(rotation);
        }
        
        selector.update();
      }
    }
  }
}

module.exports = RotateTool;