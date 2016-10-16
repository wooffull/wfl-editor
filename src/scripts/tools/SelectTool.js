"use strict";

const Tool = require('./Tool');

class SelectTool extends Tool {
  constructor(editor) {
    super(editor);
  }

  draw(ctx) {
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
      let dragStart = leftMouseState.dragStart.clone().add(offset);
      dragStart = this.editor.convertPagePosToWorldPos(dragStart);
      dragStart.multiply(zoom);
      dragStart.subtract(cameraPos);

      // Create drag end point (in world)
      let dragEnd = leftMouseState.dragEnd.clone().add(offset);
      dragEnd = this.editor.convertPagePosToWorldPos(dragEnd);
      dragEnd.multiply(zoom);
      dragEnd.subtract(cameraPos);

      let minX = Math.min(dragStart.x, dragEnd.x);
      let minY = Math.min(dragStart.y, dragEnd.y);
      let maxX = Math.max(dragStart.x, dragEnd.x);
      let maxY = Math.max(dragStart.y, dragEnd.y);

      ctx.save();

      ctx.strokeStyle = "rgba(200, 230, 150, 0.75)";
      ctx.fillStyle   = "rgba(200, 230, 150, 0.5)";
      ctx.lineWidth   = 2;

      ctx.beginPath();
      ctx.rect(minX, minY, maxX - minX, maxY - minY);
      ctx.stroke();
      ctx.fill();

      ctx.restore();
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
      // Clicking off the selector's box will clear the selection
      if (!selectorClicked) {
        selector.clear();
      }
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

    // Clicked the selection box
    } else if (selectorClicked) {
      // Shift Key + Click -- Remove clicked object from selection
      if (keyboard.isPressed(keyboard.SHIFT)) {
        selector.remove(clickObj);
      }
    }

    if (selectorClicked) {
      this.clickedSelection = true;
    }
  }

  leftUp() {
    let keyboard        = this.editor.keyboard;
    let mouse           = this.editor.mouse;
    let leftMouseState  = mouse.getState(1);
    let selector        = this.editor.selector;
    let mouseWorldPos   = this.editor.convertPagePosToWorldPos(mouse.position);

    // Dragging the mouse to select new elements
    if (leftMouseState.dragging && !this.clickedSelection) {
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
    }

    this.clickedSelection = false;
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
