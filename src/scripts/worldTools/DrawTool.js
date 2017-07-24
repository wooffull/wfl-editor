"use strict";

const WorldTool  = require('./WorldTool');
const SelectTool = require('./SelectTool');

class DrawTool extends WorldTool {
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
    let selector      = this.editor.selector;
    let mouseWorldPos = this.editor.convertPagePosToWorldPos(mouse.position);
    let clickObj      = this.editor.find(mouseWorldPos.x, mouseWorldPos.y);

    // Clicked an object, so it should be selected
    // Shift key also functions as a shortcut for selecting objects
    if (clickObj ||
      selector.hitTestPoint(mouseWorldPos) ||
      keyboard.isPressed(keyboard.SHIFT)) {

      this.selectTool.leftDown();
      this.clickedSelection = this.selectTool.clickedSelection;

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
      let mouseWorldPos  = this.editor.convertPagePosToWorldPos(mouse.position);

      // If a selection was being dragged, but the mouse was released off the
      // canvas, remove everything in the selection
      if (this.clickedSelection && !mouse.touchingCanvas) {
        let selectedObjects = selector.selectedObjects;
        this.editor.clearSelectionPan();
        this.editor.scheduleRemoveGameObjectBatch(selectedObjects);
      }
    }

    this.clickedSelection = false;
    this.selectTool.clickedSelection = false;
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
    let keyboard = this.editor.keyboard;
    let mouse    = this.editor.mouse;
    let zoom     = this.editor.camera.zoom;

    // Holding Shift with the draw tool is a shortcut for the
    // Select tool, ONLY if the selection isn't being dragged
    if (!keyboard.isPressed(keyboard.SHIFT) ||
        (keyboard.isPressed(keyboard.SHIFT) && this.clickedSelection)) {

      let leftMouseState = mouse.getState(1);
      if (leftMouseState.dragging) {
        let dx = (leftMouseState.dragEnd.x - leftMouseState.prevPos.x) / zoom;
        let dy = (leftMouseState.dragEnd.y - leftMouseState.prevPos.y) / zoom;
        this.editor.panSelection(dx, dy);
      }
    }
  }

  pan(dx, dy) {
    if (this.clickedSelection) {
      this.editor.panSelection(dx, dy);
    }
  }
}

module.exports = DrawTool;
