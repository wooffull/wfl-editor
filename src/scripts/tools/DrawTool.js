"use strict";

var Tool       = require('./Tool');
var SelectTool = require('./SelectTool');

class DrawTool extends Tool {
    constructor(editor) {
        super(editor);

        this.selectTool = new SelectTool(editor);
    }

    reset() {
        super.reset();
        this.selectTool.reset();
    }

    draw(ctx) {
        var keyboard = this.editor.keyboard;

        // Holding Shift with the draw tool is a shortcut for the
        // Select tool, ONLY if the selection isn't being dragged
        if (!this.clickedSelection && keyboard.isPressed(keyboard.SHIFT)) {
            this.selectTool.draw(ctx);
        }
    }

    leftDown() {
        var keyboard      = this.editor.keyboard;
        var mouse         = this.editor.mouse;
        var selector      = this.editor.selector;
        var mouseWorldPos = this.editor.convertPagePosToWorldPos(mouse.position);
        var clickObj      = this.editor.find(mouseWorldPos.x, mouseWorldPos.y);

        // Clicked an object, so it should be selected
        // Shift key also functions as a shortcut for selecting objects
        if (clickObj ||
            selector.hitTestPoint(mouseWorldPos) ||
            keyboard.isPressed(keyboard.SHIFT)) {

            this.selectTool.leftDown();

        // Clicked on an empty spot on the canvas, so add the new game
        // object there
        } else {
            var tileSize     = this.editor.tileSize;
            var mouseTilePos = this.editor.getMouseTilePosition();
            var tileWorldPos = mouseTilePos.multiply(tileSize);
            var x            = tileWorldPos.x + tileSize * 0.5;
            var y            = tileWorldPos.y + tileSize * 0.5;
        }
    }

    leftUp() {
        var keyboard = this.editor.keyboard;

        // Holding Shift with the draw tool is a shortcut for the
        // Select tool
        if (keyboard.isPressed(keyboard.SHIFT)) {
            this.selectTool.leftUp();

        } else {
            var mouse          = this.editor.mouse;
            var leftMouseState = mouse.getState(1);
            var selector       = this.editor.selector;
            var mouseWorldPos  = this.editor.convertPagePosToWorldPos(mouse.position);

            // If a selection was being dragged, but the mouse was released off the
            // canvas, remove everything in the selection
            if (this.clickedSelection && !mouse.touchingCanvas) {
                var selectedObjects = selector.selectedObjects;

                for (var i = selectedObjects.length - 1; i >= 0; i--) {
                    this.editor.removeGameObject(selectedObjects[i]);
                }
            }
        }

        this.clickedSelection = false;
    }

    rightDown() {
        var keyboard      = this.editor.keyboard;
        var mouse         = this.editor.mouse;
        var mouseWorldPos = this.editor.convertPagePosToWorldPos(mouse.position);
        var clickObj      = this.editor.find(mouseWorldPos.x, mouseWorldPos.y);

        // Holding Shift with the draw tool is a shortcut for the
        // Select tool
        if (keyboard.isPressed(keyboard.SHIFT)) {
            this.selectTool.rightDown();

        } else {
            // Clicked an object, so remove it
            if (clickObj) {
                this.editor.removeGameObject(clickObj);
            }
        }
    }

    mouseMove() {
        var keyboard = this.editor.keyboard;
        var mouse    = this.editor.mouse;
        var selector = this.editor.selector;
        var scale    = this.editor.scale;

        // Holding Shift with the draw tool is a shortcut for the
        // Select tool, ONLY if the selection isn't being dragged
        if (!keyboard.isPressed(keyboard.SHIFT) ||
            (keyboard.isPressed(keyboard.SHIFT) && this.clickedSelection)) {

            var leftMouseState = mouse.getState(1);
            if (leftMouseState.dragging) {
                selector.pan(
                    (leftMouseState.dragEnd.x - leftMouseState.prevPos.x) / scale,
                    (leftMouseState.dragEnd.y - leftMouseState.prevPos.y) / scale
                );
            }
        }
    }

    pan(dx, dy) {
        var selector = this.editor.selector;

        if (this.clickedSelection) {
            selector.pan(dx, dy);
        }
    }
}

module.exports = DrawTool;
