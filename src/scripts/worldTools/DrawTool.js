"use strict";

const WorldTool  = require('./WorldTool');
const SelectTool = require('./SelectTool');
const geom       = wfl.geom;

class DrawTool extends WorldTool {
  constructor(editor) {
    super(editor);

    this.selectTool = new SelectTool(editor);
    
    // The world position of the mouse when it leaves the canvas. This is used
    // for snapping dragged objects back to the mouse when entering the
    // canvas, especially after zooming while the mouse is off the canvas
    this._mouseLeaveWorldPosition = null;
    
    this._selectToolDragStart     = null;
  }

  reset() {
    super.reset();
    this.selectTool.reset();
    
    this._mouseLeaveWorldPosition = null;
    this._selectToolDragStart     = null;
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
      
      if (this._selectToolDragStart !== null) {
        if (mouse.touchingCanvas) {
          this._panSelectionToMouseAfterDrag(
            this._selectToolDragStart,
            mouse.position
          );
        }
        
        this._selectToolDragStart = null;
      }
    }

    this.clickedSelection            = false;
    this.selectTool.clickedSelection = false;
    this._mouseLeaveWorldPosition    = null;
    this._selectToolDragStart        = null;
  }

  rightDown() {
    let keyboard       = this.editor.keyboard;
    let mouse          = this.editor.mouse;
    let mouseWorldPos  = this.editor.convertPagePosToWorldPos(mouse.position);
    let clickObj       = this.editor.find(mouseWorldPos.x, mouseWorldPos.y);
    let leftMouseState = mouse.getState(1);
    
    if (leftMouseState.isDown) {
      return;
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
      if (this._selectToolDragStart !== null) {
        this._panSelectionToMouseAfterDrag(
          this._selectToolDragStart,
          mouse.position
        );
        this._selectToolDragStart = null;
      } else if (leftMouseState.dragging) {
        let dx = (leftMouseState.dragEnd.x - leftMouseState.prevPos.x) / zoom;
        let dy = (leftMouseState.dragEnd.y - leftMouseState.prevPos.y) / zoom;
        this.editor.panSelection(dx, dy);
      }
    } else {
      if (leftMouseState.dragging && 
          mouse.touchingCanvas &&
          this._selectToolDragStart === null) {
        
        leftMouseState.dragStart.x = mouse.position.x;
        leftMouseState.dragStart.y = mouse.position.y;
        this._selectToolDragStart = 
          this.editor.convertPagePosToWorldPos(mouse.position);
      }
    }
  }
  
  mouseLeave() {
    let keyboard = this.editor.keyboard;
    
    if (!keyboard.isPressed(keyboard.SHIFT)) {
      let mouse          = this.editor.mouse;
      let leftMouseState = mouse.getState(1);

      // If dragging the left-click, keep reference to the mouse's current
      // world position
      if (leftMouseState.dragging) {
        this._selectToolDragStart = 
          this.editor.convertPagePosToWorldPos(leftMouseState.prevPos);
      }
    }
  }
  
  mouseEnter() {
    let keyboard = this.editor.keyboard;
    
    if (!keyboard.isPressed(keyboard.SHIFT)) {
      // If we saved the mouse's current world position before leaving the
      // canvas, move all selected objects to the mouse's current position
      if (this._mouseLeaveWorldPosition) {
        let mouse = this.editor.mouse;
        /*this._panSelectionToMouseAfterDrag(
          this._mouseLeaveWorldPosition,
          mouse.position
        );*/
      }
    }
    
    this._mouseLeaveWorldPosition = null;
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
      this.editor.panSelection(worldDisplacement.x, worldDisplacement.y);
    }
  }
}

module.exports = DrawTool;
