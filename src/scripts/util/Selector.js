"use strict";

class Selector {
  constructor() {
    this.selectedObjects = undefined;
    this.selectionBox    = undefined;

    this.clear();
  }

  clear() {
    this.selectedObjects = [];
    this.selectionBox  = {
      x:      -Infinity,
      y:      -Infinity,
      width:  0,
      height: 0
    };
  }

  update() {
    // No selected game objects, so no need to draw anything
    if (this.selectedObjects.length === 0) {
      this.selectionBox.x      = 0;
      this.selectionBox.y      = 0;
      this.selectionBox.width  = 0;
      this.selectionBox.height = 0;

      return;
    }

    // Coordinates for the selection box
    var min = { x :  Infinity, y :  Infinity };
    var max = { x : -Infinity, y : -Infinity };

    // Find the selection box to draw around the selected game objects
    for (var i = 0; i < this.selectedObjects.length; i++) {
      var cur    = this.selectedObjects[i];
      var curPos   = cur.position;
      var halfWidth  = cur.getWidth()  * 0.5;
      var halfHeight = cur.getHeight() * 0.5;

      // Update bounds when an object is outside of them
      if (curPos.x - halfWidth  < min.x) min.x = curPos.x - halfWidth;
      if (curPos.y - halfHeight < min.y) min.y = curPos.y - halfHeight;
      if (curPos.x + halfWidth  > max.x) max.x = curPos.x + halfWidth;
      if (curPos.y + halfHeight > max.y) max.y = curPos.y + halfHeight;
    }

    this.selectionBox.x    = min.x;
    this.selectionBox.y    = min.y;
    this.selectionBox.width  = max.x - min.x;
    this.selectionBox.height = max.y - min.y;
  }

  draw(ctx) {
    var box = this.selectionBox;

    ctx.save();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
    ctx.fillStyle   = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth   = 2;

    // Draw the selection box around all selected elements
    ctx.beginPath();
    ctx.rect(box.x, box.y, box.width, box.height);
    ctx.stroke();
    ctx.fill();

    // Draw all selected game objects over the selection box
    for (var i = 0; i < this.selectedObjects.length; i++) {
      var cur = this.selectedObjects[i];

      ctx.save();
      ctx.translate(cur.position.x, cur.position.y);
      cur.draw(ctx);
      ctx.restore();
    }

    ctx.restore();
  }

  add(obj) {
    // Remove it first just in case to prevent duplicates
    this.remove(obj);

    this.selectedObjects.push(obj);
    this.update();
  }

  remove(obj) {
    var selectedIndex = this.selectedObjects.indexOf(obj);

    // Remove the game object from the list of selected game objects
    if (selectedIndex >= 0 &&
      selectedIndex < this.selectedObjects.length) {

      this.selectedObjects.splice(selectedIndex, 1);
      this.update();
    }
  }

  isSelected(obj) {
    return (this.selectedObjects.indexOf(obj) >= 0);
  }

  hitTestPoint(point) {
    var box = this.selectionBox;

    return (point.x >= box.x && point.x <= box.x + box.width &&
        point.y >= box.y && point.y <= box.y + box.height);
  }

  pan(dx, dy) {
    for (var i = 0; i < this.selectedObjects.length; i++) {
      var cur = this.selectedObjects[i];

      cur.position.x += dx;
      cur.position.y += dy;
    }

    this.selectionBox.x += dx;
    this.selectionBox.y += dy;
  }
}

module.exports = Selector;
