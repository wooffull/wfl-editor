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

  draw(renderer) {
    let keyboard = this.editor.keyboard;

    // Holding Shift with the draw tool is a shortcut for the
    // Select tool, ONLY if the selection isn't being dragged
    if (!this.clickedSelection && keyboard.isPressed(keyboard.SHIFT)) {
      this.selectTool.draw(renderer);
    }
  }

  leftDown() {
    let keyboard      = this.editor.keyboard;
    let mouse         = this.editor.mouse;
    let mouseWorldPos = this.editor.convertPagePosToWorldPos(mouse.position);
    let clickObj      = this.editor.find(mouseWorldPos.x, mouseWorldPos.y);
    let selector      = this.editor.selector;
    
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
      this.editor.scheduleSelectionRotateSnap();
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
        let dragY  = leftMouseState.dragEnd.y - leftMouseState.prevPos.y;
        let dTheta = dragY % (4 * PhysicsObject.TOTAL_DISPLAY_ANGLES);
        
        // Snap dTheta to nearest display angle
        let dThetaSnapped =
            2 * Math.PI * (dTheta / (4 * PhysicsObject.TOTAL_DISPLAY_ANGLES));
        
        this.editor.rotateSelection(dThetaSnapped);
        
        selector.update();
      }
    }
  }
}

module.exports = RotateTool;