"use strict";

const Vec2      = wfl.geom.Vec2;
const WorldTool = require('./WorldTool');

class SelectTool extends WorldTool {
  constructor(editor) {
    super(editor);
    
    this._lastSelected = null;
  }
  
  reset() {
    super.reset();
    
    this._lastSelected = null;
  }

  draw(renderer) {
    let mouse          = this.editor.mouse;
    let leftMouseState = mouse.getState(1);

    if (leftMouseState.dragging) {
      let offset    = this.editor.getCenterOffset();
      let zoom      = this.editor.camera.zoom;
      let cameraPos = this.editor.camera.position.clone();

      // Multiply cameraPos by zoom to keep drag start's position at the
      // world position that the user clicked. This way, the user can zoom
      // while dragging and their drag start position won't change.
      cameraPos.multiply(zoom);

      // Create drag start point (in world)
      let dragStart = new Vec2(
        leftMouseState.dragStart.x,
        leftMouseState.dragStart.y
      );
      dragStart = this.editor.convertPagePosToWorldPos(dragStart);

      // Create drag end point (in world)
      let dragEnd = new Vec2(
        leftMouseState.dragEnd.x,
        leftMouseState.dragEnd.y
      );
      dragEnd = this.editor.convertPagePosToWorldPos(dragEnd);

      let minX = Math.min(dragStart.x, dragEnd.x);
      let minY = Math.min(dragStart.y, dragEnd.y);
      let maxX = Math.max(dragStart.x, dragEnd.x);
      let maxY = Math.max(dragStart.y, dragEnd.y);

      let lineSize       = Math.max(1, 1 / this.editor.camera.zoom);
      let debugContainer = wfl.debug.getContainer();
      debugContainer.lineStyle(lineSize, 0xC8E696, 0.75);
      debugContainer.beginFill(0xC8E696, 0.5);
      debugContainer.drawRect(
        minX,
        minY,
        maxX - minX,
        maxY - minY
      );
      debugContainer.endFill();
    }
  }

  leftDown() {
    let keyboard        = this.editor.keyboard;
    let mouse           = this.editor.mouse;
    let selector        = this.editor.selector;
    let mouseWorldPos   = this.editor.convertPagePosToWorldPos(mouse.position);
    let clickObj        = this.editor.find(mouseWorldPos.x, mouseWorldPos.y);
    let selectorClicked = selector.hitTestPoint(mouseWorldPos);

    // Not holding Shift key, so no additions to the selection will
    // be made
    if (!keyboard.isPressed(keyboard.SHIFT)) {
      selector.clear();
    }

    // Clicked an object that isn't selected yet, so select it
    if (clickObj && !selector.isSelected(clickObj)) {
      // Shift Key + Click -- Add clicked object to selection
      if (keyboard.isPressed(keyboard.SHIFT)) {
        selector.add(clickObj);

      // Click only -- Select clicked object
      } else {
        selector.clear();
        selector.add(clickObj);
      }
      
      this._lastSelected = clickObj;
    }
    
    if (selectorClicked || clickObj) {
      this.clickedSelection = true;
    }
  }

  leftUp() {
    let keyboard        = this.editor.keyboard;
    let mouse           = this.editor.mouse;
    let leftMouseState  = mouse.getState(1);
    let selector        = this.editor.selector;
    let mouseWorldPos   = this.editor.convertPagePosToWorldPos(mouse.position);
    let clickObj        = this.editor.find(mouseWorldPos.x, mouseWorldPos.y);

    // Dragging the mouse to select new elements
    if (leftMouseState.dragging) {
      let dragStart = this.editor.convertPagePosToWorldPos(
        leftMouseState.dragStart
      );
      let dragEnd   = this.editor.convertPagePosToWorldPos(
        leftMouseState.dragEnd
      );
      let minX = Math.min(dragStart.x, dragEnd.x);
      let minY = Math.min(dragStart.y, dragEnd.y);
      let maxX = Math.max(dragStart.x, dragEnd.x);
      let maxY = Math.max(dragStart.y, dragEnd.y);

      let selected = this.editor.find(
        minX,
        minY,
        maxX - minX,
        maxY - minY
      );

      // Shift key is a shortcut for the Select tool, but should only
      // add extra items when dragging
      if (!keyboard.isPressed(keyboard.SHIFT)) {
        selector.clear();
      }

      for (let i = 0; i < selected.length; i++) {
        selector.add(selected[i]);
      }
    } else {
      // Remove the last clicked object from the selector if the mouse wasn't
      // dragged (and if the last clicked object isn't the last selected one)
      if (this.clickedSelection &&
          clickObj &&
          clickObj !== this._lastSelected) {
        
        selector.remove(clickObj);
      }
    }

    this.clickedSelection = false;
    this._lastSelected    = null;
  }

  rightDown() {
    let keyboard      = this.editor.keyboard;
    let mouse         = this.editor.mouse;
    let selector      = this.editor.selector;
    let mouseWorldPos = this.editor.convertPagePosToWorldPos(mouse.position);

    // Only remove clicked items if the Shift key isn't down
    if (!keyboard.isPressed(keyboard.SHIFT)) {
      let clickObj = this.editor.find(mouseWorldPos.x, mouseWorldPos.y);

      // Clicked an object that is selected, so deselect it
      if (clickObj && !selector.isSelected(clickObj)) {
        selector.remove(clickObj);

      // Clicked on nothing, so deselect all
      } else if (clickObj === null) {
        selector.clear();
      }
    }
  }
}

module.exports = SelectTool;
