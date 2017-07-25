"use strict";

const WorldTool  = require('./WorldTool');
const SelectTool = require('./SelectTool');
const geom       = wfl.geom;

class DrawTool extends WorldTool {
  constructor(editor) {
    super(editor);

    this.selectTool = new SelectTool(editor);
    
    this._dragStartWorldPosition  = null;
    this._mouseLeaveWorldPosition = null;
    
    this._dragX = 0;
    this._dragY = 0;
  }

  reset() {
    super.reset();
    this.selectTool.reset();
    
    this._dragStartWorldPosition = null;
    this._mouseLeaveWorldPosition = null;
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
      
    // Clicked on an empty spot on the canvas, so add the new game
    // object there
    } else {
      let tileSize     = this.editor.tileSize;
      let mouseTilePos = this.editor.getMouseTilePosition();
      let tileWorldPos = mouseTilePos;
      tileWorldPos.x *= tileSize.x;
      tileWorldPos.y *= tileSize.y;
      
      let x            = tileWorldPos.x + tileSize.x * 0.5;
      let y            = tileWorldPos.y + tileSize.y * 0.5;
      let addedObj     = this.editor.addCurrentGameObject(x, y);
      
      if (addedObj) {
        selector.clear();
        selector.add(addedObj);
      }
    }
    
    this._dragStartWorldPosition = mouseWorldPos;
    this._dragX = 0;
    this._dragY = 0;
  }

  leftUp() {
    let keyboard = this.editor.keyboard;

    // Holding Shift with the draw tool is a shortcut for the
    // Select tool
    if (keyboard.isPressed(keyboard.SHIFT)) {
      this.selectTool.leftUp();

    } else {
      let mouse          = this.editor.mouse;
      let leftMouseState = mouse.getState(1);
      let selector       = this.editor.selector;
      let mouseWorldPos  = 
        this.editor.convertPagePosToWorldPos(mouse.position);

      // If a selection was being dragged, but the mouse was released off the
      // canvas, remove everything in the selection
      if (this.clickedSelection && !mouse.touchingCanvas) {
        let selectedObjects = selector.selectedObjects;
        this.editor.clearSelectionPan();
        this.editor.scheduleRemoveGameObjectBatch(selectedObjects);
      }
      
      // Round the position of dragged game objects to the nearest integer
      for (let gameObject of selector.selectedObjects) {
        gameObject.position.x = Math.round(gameObject.position.x);
        gameObject.position.y = Math.round(gameObject.position.y);
      }
    }

    this.clickedSelection            = false;
    this.selectTool.clickedSelection = false;
    this._dragStartWorldPosition     = null;
    this._mouseLeaveWorldPosition    = null;
  }

  rightDown() {
    let keyboard       = this.editor.keyboard;
    let mouse          = this.editor.mouse;
    let mouseWorldPos  = this.editor.convertPagePosToWorldPos(mouse.position);
    let clickObj       = this.editor.find(mouseWorldPos.x, mouseWorldPos.y);
    let leftMouseState = mouse.getState(1);
    
    if (leftMouseState.isDown) {
      return;
    } else {
      this.editor.selector.clear();
    }

    // Holding Shift with the draw tool is a shortcut for the
    // Select tool
    if (keyboard.isPressed(keyboard.SHIFT)) {
      this.selectTool.rightDown();

    } else {
      // Clicked an object, so remove it
      if (clickObj) {
        this.editor.scheduleRemoveGameObject(clickObj, clickObj.layer);
      }
    }
  }

  mouseMove() {
    let keyboard       = this.editor.keyboard;
    let mouse          = this.editor.mouse;
    let zoom           = this.editor.camera.zoom;
    let leftMouseState = mouse.getState(1);
    
    // Holding Shift with the draw tool is a shortcut for the
    // Select tool, ONLY if the selection isn't being dragged
    if (!keyboard.isPressed(keyboard.SHIFT)) {
      if (leftMouseState.dragging) {
        let dx = (leftMouseState.dragEnd.x - leftMouseState.prevPos.x) / zoom;
        let dy = (leftMouseState.dragEnd.y - leftMouseState.prevPos.y) / zoom;
        this._dragX += dx;
        this._dragY += dy;
        this.editor.panSelection(dx, dy);
      }
    }
  }
  
  mouseLeave() {
    let keyboard       = this.editor.keyboard;
    let mouse          = this.editor.mouse;
    let leftMouseState = mouse.getState(1);
    
    if (leftMouseState.dragging) {
      if (!keyboard.isPressed(keyboard.SHIFT)) {
        // If dragging the left-click, keep reference to the mouse's current
        // world position
        this._mouseLeaveWorldPosition = 
          this.editor.convertPagePosToWorldPos(leftMouseState.prevPos);
      } else {
        // Undo dragging of the selected game objects
        this.editor.panSelection(-this._dragX, -this._dragY);
        this._dragX = 0;
        this._dragY = 0;

        // Start dragging the selection box from the mouse's current position
        leftMouseState.dragStart.x = mouse.position.x;
        leftMouseState.dragStart.y = mouse.position.y;
        
        // The selection has been panned back to its original position,
        // so we can pan from that position instead of where the mouse left
        this._mouseLeaveWorldPosition = this._dragStartWorldPosition;
      }
    }
  }
  
  mouseEnter() {
    let keyboard       = this.editor.keyboard;
    let mouse          = this.editor.mouse;
    let leftMouseState = mouse.getState(1);
    
    if (!keyboard.isPressed(keyboard.SHIFT)) {
      if (leftMouseState.dragging && this._mouseLeaveWorldPosition) {
        this._panSelectionToMouseAfterDrag(
          this._mouseLeaveWorldPosition,
          mouse.position
        );
      }
      
    } else if (leftMouseState.dragging) {
      // Undo dragging of the selected game objects
      this.editor.panSelection(-this._dragX, -this._dragY);
      this._dragX = 0;
      this._dragY = 0;

      // Start dragging the selection box from the mouse's current position
      leftMouseState.dragStart.x = mouse.position.x;
      leftMouseState.dragStart.y = mouse.position.y;
    }
    
    this._mouseLeaveWorldPosition = null;
  }
  
  handleInput() {
    let keyboard       = this.editor.keyboard;
    let mouse          = this.editor.mouse;
    let leftMouseState = mouse.getState(1);
    let mouseWorldPos  = this.editor.convertPagePosToWorldPos(mouse.position);
    
    if (mouse.touchingCanvas && leftMouseState.dragging) {
      if (keyboard.justPressed(keyboard.SHIFT)) {
        // Undo dragging of the selected game objects
        this.editor.panSelection(-this._dragX, -this._dragY);
        this._dragX = 0;
        this._dragY = 0;

        // Start dragging the selection box from the mouse's current position
        leftMouseState.dragStart.x = mouse.position.x;
        leftMouseState.dragStart.y = mouse.position.y;

      } else if (keyboard.justReleased(keyboard.SHIFT)) {
        // If shift was just released, move the selection back to the mouse
        if (this._dragStartWorldPosition) {
          this._panSelectionToMouseAfterDrag(
            this._dragStartWorldPosition,
            mouse.position
          );
        }
      }
    }
  }

  pan(dx, dy) {
    if (this.clickedSelection) {
      this.editor.panSelection(dx, dy);
    }
  }
  
  _panSelectionToMouseAfterDrag(startDragWorldPosition, endDragPagePosition) {
    let mouse          = this.editor.mouse;
    let leftMouseState = mouse.getState(1);

    if (leftMouseState.dragging) {
      var endDragWorldPosition =
        this.editor.convertPagePosToWorldPos(endDragPagePosition);
      var worldDisplacement = geom.Vec2.subtract(
        endDragWorldPosition,
        startDragWorldPosition
      );
      this._dragX += worldDisplacement.x;
      this._dragY += worldDisplacement.y;
      this.editor.panSelection(worldDisplacement.x, worldDisplacement.y);
    }
  }
}

module.exports = DrawTool;
