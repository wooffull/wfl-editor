"use strict";

var $           = wfl.jquery;
var geom        = wfl.geom;
var input       = wfl.input;
var Mouse       = input.Mouse;
var EditorScene = require('./EditorScene');
var tools       = require('../tools');
var util        = require('../util');

class WorldEditorScene extends EditorScene {
    constructor(canvas, mouse, keyboard) {
        super(canvas, mouse, keyboard);

        this.selector = new util.Selector();
        this.scale    = WorldEditorScene.DEFAULT_SCALE;
        this.tileSize = WorldEditorScene.DEFAULT_TILE_SIZE;

        // Add tools
        this.tools.push(tools.ids.DRAW);
        this.tools.push(tools.ids.SELECT);

        // Set up listeners
        $(this.mouse).on(Mouse.Event.MOVE,      ($e, e) => this.onMouseMove(e));
        $(this.mouse).on(Mouse.Event.DOWN,      ($e, e) => this.onMouseDown(e));
        $(this.mouse).on(Mouse.Event.BEFORE_UP, ($e, e) => this.onBeforeMouseUp(e));
        $(this.mouse).on(Mouse.Event.LEAVE,     ($e, e) => this.onMouseLeave(e));
        $(this.mouse).on(Mouse.Event.ENTER,     ($e, e) => this.onMouseEnter(e));
        $(this.canvas).on("contextmenu",        ($e, e) => this.onContextMenu(e));
    }

    reset() {
        super.reset();

        // Check if the selector exists because constructor's call to super()
        // will call reset() before selector is defined
        if (this.selector) {
            this.selector.clear();
        }

        this.camera.position.x = 0;
        this.camera.position.y = 0;
        this.scale             = WorldEditorScene.DEFAULT_SCALE;
    }

    update(dt) {
        this.handleInput();
    }

    draw(ctx) {
        // Draw the background and all game objects in the world
        super.draw(ctx);

        this.drawMouseHoverTile(ctx);

        // Only draw the grid if not zoomed too far out.
        // It makes everything look less cluttered with that small of a scale.
        if (this.scale >= WorldEditorScene.GRID.MIN_SCALE) {
            this.drawGrid(ctx);
        }

        this.drawSelection(ctx);

        if (this.tool) {
            this.tool.draw(ctx);
        }
    }

    drawGrid(ctx) {
        var cameraPos       = this.camera.position;
        var offset          = this.getCenterOffset();
        var totalHorizontal = Math.round((this.canvas.width  / this.scale) / this.tileSize + 2);
        var totalVertical   = Math.round((this.canvas.height / this.scale) / this.tileSize + 2);

        ctx.save();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth   = 0.5;

        // Offset the drawing from the center of the screen
        ctx.translate(offset.x, offset.y);
        ctx.scale(this.scale, this.scale);

        for (var i = -Math.round(totalHorizontal * 0.5); i < Math.round(totalHorizontal * 0.5); i++) {
            for (var j = -Math.round(totalVertical * 0.5); j < Math.round(totalVertical * 0.5); j++) {
                var x = i * this.tileSize - cameraPos.x % this.tileSize;
                var y = j * this.tileSize - cameraPos.y % this.tileSize;

                ctx.beginPath();
                ctx.rect(Math.round(x), Math.round(y), this.tileSize, this.tileSize);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    drawMouseHoverTile(ctx) {
        var cameraPos = this.camera.position;
        var offset    = this.getCenterOffset();

        ctx.save();

        ctx.fillStyle = "rgba(255, 255, 200, 0.2)";

        // Offset the drawing from the center of the screen
        ctx.translate(offset.x, offset.y);
        ctx.scale(this.scale, this.scale);

        // Get the mouse's tile position
        var mouseTilePos = this.getMouseTilePosition();
        var tileWorldPos = mouseTilePos.multiply(this.tileSize);

        ctx.translate(-cameraPos.x, -cameraPos.y);

        ctx.beginPath();
        ctx.rect(tileWorldPos.x, tileWorldPos.y, this.tileSize, this.tileSize);
        ctx.fill();

        ctx.restore();
    }

    drawSelection(ctx) {
        var selectedObjects = this.selector.selectedObjects;
        var cameraPos       = this.camera.position;
        var offset          = this.getCenterOffset();

        // Only draw when there are selected objects
        if (selectedObjects.length > 0) {
            ctx.save();

            // Offset the drawing from the center of the screen
            ctx.translate(offset.x, offset.y);

            // Scale appropriately and translate with the (scaled) camera position
            ctx.scale(this.scale, this.scale);
            ctx.translate(-cameraPos.x, -cameraPos.y);

            // Draw the selection
            this.selector.draw(ctx);

            ctx.restore();
        }
    }

    /**
     * Gets the offset to the center of the canvas
     */
    getCenterOffset() {
        var canvasWidth  = this.canvas.width;
        var canvasHeight = this.canvas.height;
        var offset       = new geom.Vec2(
            canvasWidth  * 0.5,
            canvasHeight * 0.5
        );
        return offset;
    }

    getMouseWorldPosition() {
        return this.convertPagePosToWorldPos(this.mouse.position);
    }

    getMouseTilePosition() {
        var mouseWorldPos = this.getMouseWorldPosition();
        var mouseTilePos  = this.convertWorldPosToTilePos(mouseWorldPos);
        return mouseTilePos;
    }

    convertPagePosToWorldPos(point) {
        var offset   = this.getCenterOffset();
        var worldPos = geom.Vec2.add(
            point.clone().divide(this.scale),
            this.camera.position
        );
        worldPos.subtract(
            offset.divide(this.scale)
        );

        return worldPos;
    }

    convertWorldPosToTilePos(point) {
        // Clone the reference point before applying operations on it
        var tilePos = point.clone();

        // Divide by tile size then round to the nearest tile coordinate
        tilePos.divide(this.tileSize);
        tilePos.x = Math.round(tilePos.x - 0.5);
        tilePos.y = Math.round(tilePos.y - 0.5);

        return tilePos;
    }

    handleInput() {
        var key = this.keyboard;
        var dx  = 0;
        var dy  = 0;
        var dz  = 0; // Scale (zoom) increment

        // WASD Keys -- Pan camera around the level
        if (key.isPressed(key.W)) dy -= WorldEditorScene.PAN.SPEED;
        if (key.isPressed(key.S)) dy += WorldEditorScene.PAN.SPEED;
        if (key.isPressed(key.A)) dx -= WorldEditorScene.PAN.SPEED;
        if (key.isPressed(key.D)) dx += WorldEditorScene.PAN.SPEED;

        // [] Keys -- Adjust scale
        if (key.isPressed(key.LEFT_SQUARE_BRACKET))  dz -= WorldEditorScene.SCALE.SPEED;
        if (key.isPressed(key.RIGHT_SQUARE_BRACKET)) dz += WorldEditorScene.SCALE.SPEED;

        // \ Key -- Reset scale
        if (key.isPressed(key.BACKSLASH)) {
            dz         = 0;
            this.scale = 1;
        }

        // Shift Key -- Doubles pan and scale speed
        if (key.isPressed(key.SHIFT)) {
            dx *= 2;
            dy *= 2;
            dz *= 2;
        }

        // Spacebar Key -- Halves pan and scale speed
        if (key.isPressed(key.SPACEBAR)) {
            dx *= 0.5;
            dy *= 0.5;
            dz *= 0.5;
        }

        // Ctrl Key -- Prevent panning and scaling
        if (key.isPressed(key.CONTROL)) {
            dx = 0;
            dy = 0;
            dz = 0;
        }

        // Apply adjustments to scale
        this.scale += dz;
        this.scale = Math.max(WorldEditorScene.SCALE.MIN, Math.min(WorldEditorScene.SCALE.MAX, this.scale));

        // Apply adjustments to pan based on current scale
        dx /= this.scale;
        dy /= this.scale;
        this.camera.position.x += dx;
        this.camera.position.y += dy;

        if (this.tool) this.tool.pan(dx, dy);
    }

    find(x, y, width = undefined, height = undefined) {
        if (!isNaN(width) && !isNaN(height)) {
            return this._findGameObjectsInArea(x, y, width, height);
        } else {
            return this._findGameObjectAt(x, y);
        }
    }

    /**
     * Finds game objects in the given box
     */
    _findGameObjectsInArea(x, y, width, height) {
        var gameObjects = this.getGameObjects();
        var selected    = [];

        for (var i = 0; i < gameObjects.length; i++) {
            var cur = gameObjects[i];

            if (x          <= cur.position.x &&
                x + width  >= cur.position.x &&
                y          <= cur.position.y &&
                y + height >= cur.position.y) {

                selected.push(cur);
            }
        }

        return selected;
    }

    /**
     * Finds the game object that's colliding with the point (x, y)
     * Returns null if no such game object exists
     */
    _findGameObjectAt(x, y) {
        var gameObjects = this.getGameObjects();

        for (var i = 0; i < gameObjects.length; i++) {
            var cur    = gameObjects[i];
            var width  = cur.getWidth();
            var height = cur.getHeight();

            if (x >= cur.position.x - width  * 0.5 &&
                x <= cur.position.x + width  * 0.5 &&
                y >= cur.position.y - height * 0.5 &&
                y <= cur.position.y + height * 0.5) {

                return cur;
            }
        }

        return null;
    }

    onMouseMove(e) {
        if (this.tool) this.tool.mouseMove();
    }

    onMouseDown(e) {
        if (this.tool) {
            if (e.which === 1) {
                this.tool.leftDown();
            } else if (e.which === 3) {
                this.tool.rightDown();
            }
        }

        e.stopPropagation();
        e.preventDefault();
    }

    onBeforeMouseUp(e) {
        if (this.tool) {
            if (e.which === 1) {
                this.tool.leftUp();
            } else if (e.which === 3) {
                this.tool.rightUp();
            }
        }

        e.stopPropagation();
        e.preventDefault();
    }

    onMouseLeave(e) {
    }

    onMouseEnter(e) {
    }

    onContextMenu(e) {
        this.selector.clear();
        return false;
    }
}

// Define constants
Object.defineProperties(WorldEditorScene, {
    DEFAULT_SCALE: {
        value: 1.0
    },

    DEFAULT_TILE_SIZE: {
        value: 32
    },

    PAN: {
        value: {
            SPEED: 5
        }
    },

    SCALE: {
        value: {
            MIN:   0.15,
            MAX:   1.5,
            SPEED: 0.015
        }
    },

    GRID: {
        value: {
            MIN_SCALE: 0.3
        }
    }
});

module.exports = WorldEditorScene;
