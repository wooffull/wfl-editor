"use strict";

const PhysicsObject = wfl.core.entities.PhysicsObject;
const WorldTool     = require('./WorldTool');
const SelectTool    = require('./SelectTool');

class RotateTool extends WorldTool {
  constructor(editor) {
    super(editor);

    this.selectTool = new SelectTool(editor);
    
    this._dragTheta = 0;
  }
  
  reset() {
    super.reset();
    this.selectTool.reset();
    
    this._dragTheta = 0;
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
    }
  }
  
  rightDown() {
    let keyboard       = this.editor.keyboard;
    let selector       = this.editor.selector;
    let mouse          = this.editor.mouse;
    let leftMouseState = mouse.getState(1);
    
    if (leftMouseState.isDown) {
      return;
    }
    
    // Holding Shift with the rotate tool is a shortcut for the Select tool
    if (keyboard.isPressed(keyboard.SHIFT)) {
      this.selectTool.rightDown();
    } else {
      this.editor.scheduleSelectionRotateSnap();
    }
    
    this.editor.selector.clear();
  }
  
  leftUp() {
    let keyboard = this.editor.keyboard;

    // Holding Shift with the align tool is a shortcut for the Select tool
    if (keyboard.isPressed(keyboard.SHIFT)) {
      this.selectTool.leftUp();
    }
    
    this.clickedSelection            = false;
    this.selectTool.clickedSelection = false;
    this._dragTheta                  = 0;
  }
  
  mouseMove() {
    let keyboard        = this.editor.keyboard;
    let mouse           = this.editor.mouse;
    let selector        = this.editor.selector;
    
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
        
        this._dragTheta += dThetaSnapped;
        
        this.editor.rotateSelection(dThetaSnapped);
        
        selector.update();
      }
    }
  }
  
  handleInput() {
    let keyboard = this.editor.keyboard;
    
    if (keyboard.justPressed(keyboard.SHIFT)) {
      this.editor.rotateSelection(-this._dragTheta);
      this._dragTheta = 0;
    }
  }
}

module.exports = RotateTool;