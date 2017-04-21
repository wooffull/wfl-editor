"use strict";

const $                 = wfl.jquery;
const geom              = wfl.geom;
const input             = wfl.input;
const Mouse             = input.Mouse;
const Scene             = wfl.display.Scene;
const EditorScene       = require('./EditorScene');
const {Action,
       ActionPerformer} = require('../action');
const worldTools        = require('../worldTools');
const util              = require('../util');

class WorldEditorScene extends EditorScene {
  constructor(canvas, mouse, keyboard) {
    super(canvas);

    this.canvas    = canvas;
    this.mouse     = mouse;
    this.keyboard  = keyboard;
    this.tool      = undefined;
    this.curEntity = undefined;
    this.layerId   = 0;

    this.selector = new util.Selector();
    this.tileSize = WorldEditorScene.DEFAULT_TILE_SIZE;
    
    this.camera.zoom = WorldEditorScene.DEFAULT_SCALE;
    
    // Increments every time an entity is added -- used for IDs
    this._entityCounter = 0;
    
    // Used to send out action data for panning entites only when the
    // action is ready (mouse up)
    this._panActionData = {dx: 0, dy: 0};
    
    // Used to send out action data for adding entities only when the
    // action is ready (mouse up)
    this._addEntityActionData = {gameObject: undefined, layerId: undefined};

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
    this.camera.zoom       = WorldEditorScene.DEFAULT_SCALE;
    this._entityCounter    = 0;
    this.curEntity         = undefined;
    this.layerId           = 0;
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
    if (this.camera.zoom >= WorldEditorScene.GRID.MIN_SCALE) {
      this.drawGrid(ctx);
    }

    this.drawSelection(ctx);

    if (this.tool) {
      this.tool.draw(ctx);
    }
  }

  drawGrid(ctx) {
    let cameraPos       = this.camera.position;
    let offset          = this.getCenterOffset();
    let totalHorizontal = Math.round((this.canvas.width  / this.camera.zoom) / this.tileSize + 2);
    let totalVertical   = Math.round((this.canvas.height / this.camera.zoom) / this.tileSize + 2);

    ctx.save();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
    ctx.lineWidth   = 0.5;

    // Offset the drawing from the center of the screen
    ctx.translate(offset.x, offset.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    for (let i = -Math.round(totalHorizontal * 0.5); i < Math.round(totalHorizontal * 0.5); i++) {
      for (let j = -Math.round(totalVertical * 0.5); j < Math.round(totalVertical * 0.5); j++) {
        let x = i * this.tileSize - cameraPos.x % this.tileSize;
        let y = j * this.tileSize - cameraPos.y % this.tileSize;

        ctx.beginPath();
        ctx.rect(Math.round(x), Math.round(y), this.tileSize, this.tileSize);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  drawMouseHoverTile(ctx) {
    let cameraPos = this.camera.position;
    let offset    = this.getCenterOffset();

    ctx.save();

    ctx.fillStyle = "rgba(255, 255, 200, 0.2)";

    // Offset the drawing from the center of the screen
    ctx.translate(offset.x, offset.y);
    ctx.scale(this.camera.zoom, this.camera.zoom);

    // Get the mouse's tile position
    let mouseTilePos = this.getMouseTilePosition();
    let tileWorldPos = mouseTilePos.multiply(this.tileSize);

    ctx.translate(-cameraPos.x, -cameraPos.y);

    ctx.beginPath();
    ctx.rect(tileWorldPos.x, tileWorldPos.y, this.tileSize, this.tileSize);
    ctx.fill();

    ctx.restore();
  }

  drawSelection(ctx) {
    let selectedObjects = this.selector.selectedObjects;
    let cameraPos       = this.camera.position;
    let offset          = this.getCenterOffset();

    // Only draw when there are selected objects
    if (selectedObjects.length > 0) {
      ctx.save();

      // Offset the drawing from the center of the screen
      ctx.translate(offset.x, offset.y);

      // Scale appropriately and translate with the (scaled) camera position
      ctx.scale(this.camera.zoom, this.camera.zoom);
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
    let canvasWidth  = this.canvas.width;
    let canvasHeight = this.canvas.height;
    let offset     = new geom.Vec2(
      canvasWidth  * 0.5,
      canvasHeight * 0.5
    );
    return offset;
  }

  getMouseWorldPosition() {
    return this.convertPagePosToWorldPos(this.mouse.position);
  }

  getMouseTilePosition() {
    let mouseWorldPos = this.getMouseWorldPosition();
    let mouseTilePos  = this.convertWorldPosToTilePos(mouseWorldPos);
    return mouseTilePos;
  }

  convertPagePosToWorldPos(point) {
    let offset   = this.getCenterOffset();
    let worldPos = geom.Vec2.add(
      point.clone().divide(this.camera.zoom),
      this.camera.position
    );
    worldPos.subtract(
      offset.divide(this.camera.zoom)
    );

    return worldPos;
  }

  convertWorldPosToTilePos(point) {
    // Clone the reference point before applying operations on it
    let tilePos = point.clone();

    // Divide by tile size then round to the nearest tile coordinate
    tilePos.divide(this.tileSize);
    tilePos.x = Math.round(tilePos.x - 0.5);
    tilePos.y = Math.round(tilePos.y - 0.5);

    return tilePos;
  }
  
  convertTilePosToWorldPos(point) {
    // Clone the reference point before applying operations on it
    let worldPos = point.clone();
    
    // Multiply by tile size
    worldPos.x *= this.tileSize;
    worldPos.y *= this.tileSize;
    
    // Add half the tile size to center the point in the middle of a tile
    worldPos.x += this.tileSize * 0.5;
    worldPos.y += this.tileSize * 0.5;
    
    return worldPos;
  }
  
  addLayer(layerId) {
    if (!(layerId in this._gameObjectLayers)) {
      this._gameObjectLayers[layerId] = [];
    }
  }
  
  removeLayer(layerId) {
    // Clear the selector so it can't draw a selected entity after it's
    // been removed with its layer
    this.selector.clear();
    
    if (layerId in this._gameObjectLayers) {
      let layer = this._gameObjectLayers[layerId].concat();

      for (let gameObject of layer) {
        // 'false' because each entity's removal shouldn't be added to history,
        // only the layer's removal
        this.removeGameObject(gameObject, layerId, false);
      }
    
      this._gameObjectLayers[layerId] = null;
      delete this._gameObjectLayers[layerId];
    }
  }
  
  addGameObject(obj, layerId) {
    super.addGameObject(obj, layerId);
  }
  
  removeGameObject(obj, layerId) {
    this.selector.remove(obj);
    super.removeGameObject(obj, layerId);
  }
  
  scheduleAddGameObject(obj, layerId, reversable = true) {
    let data = {
      gameObject: obj,
      entity:     obj.customData.entity,
      layerId:    layerId
    };
    
    ActionPerformer.do(
      Action.Type.WORLD_ENTITY_ADD,
      data,
      reversable
    );
  }
  
  scheduleRemoveGameObject(obj, layerId, reversable = true) {
    let data = {
      gameObject: obj,
      layerId:    layerId
    };
    
    ActionPerformer.do(
      Action.Type.WORLD_ENTITY_REMOVE,
      data,
      reversable
    );
  }
  
  scheduleAddGameObjectBatch(objs, reversable = true) {
    let data = {
      gameObjects: objs.slice(0),
      layers:      objs.map((obj) => obj.layer)
    };
    
    ActionPerformer.do(
      Action.Type.WORLD_ENTITY_ADD_BATCH,
      data,
      reversable
    );
  }
  
  scheduleRemoveGameObjectBatch(objs, reversable = true) {
    let data = {
      gameObjects: objs.slice(0),
      layers:      objs.map((obj) => obj.layer)
    };
    
    ActionPerformer.do(
      Action.Type.WORLD_ENTITY_REMOVE_BATCH,
      data,
      reversable
    );
  }
  
  scheduleSelectionMove(dx, dy) {
    let selectedGameObjects = this.selector.selectedObjects;
    
    if (selectedGameObjects.length > 0) {
      let data = {
        dx:          dx,
        dy:          dy,
        gameObjects: selectedGameObjects.slice(0)
      };

      ActionPerformer.do(
        Action.Type.WORLD_SELECTION_MOVE,
        data
      );
    }
  }
  
  addCurrentGameObject(x, y) {
    if (this.curEntity) {
      let gameObject = this.addEntity(this.curEntity);
      gameObject.position.x = x;
      gameObject.position.y = y;
      return gameObject;
    }
    
    return null;
  }
  
  addEntity(entity, layerId = this.layerId, reversable = true) {
    let gameObject = new wfl.core.entities.PhysicsObject();
    let image      = new Image();

    image.src = entity.imageSource;
    image.onload = function () {
      gameObject.graphic           = image;
      gameObject.customData.entity = entity;
      gameObject.customData.id     = this._entityCounter;

      // If the mouse is up, then the entity has been placed.
      // If the mouse is still down, the entity is being dragged and we'll 
      // add it later (onBeforeMouseUp)
      let leftMouseState = this.mouse.getState(1);
      if (!leftMouseState.isDown) {
        this.scheduleAddGameObject(gameObject, layerId, reversable);
      } else {
        this._addEntityActionData.gameObject = gameObject;
        this._addEntityActionData.layerId    = layerId;
      }
      
      this.selector.update();
      this._entityCounter++;
    }.bind(this);
    
    return gameObject;
  }

  handleInput() {
    let key = this.keyboard;
    let dx  = 0;
    let dy  = 0;
    let dz  = 0; // Scale (zoom) increment

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
      this.camera.zoom = 1;
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
    this.camera.zoom += dz;
    this.camera.zoom = Math.max(WorldEditorScene.SCALE.MIN, Math.min(WorldEditorScene.SCALE.MAX, this.camera.zoom));

    // Apply adjustments to pan based on current scale
    dx /= this.camera.zoom;
    dy /= this.camera.zoom;
    this.camera.position.x += dx;
    this.camera.position.y += dy;

    if (this.tool) this.tool.pan(dx, dy);
    
    // (HACK) Shift + Control -- Reset all keystates
    //
    // The globalShortcut module is used to register Ctrl+Shift+S for Save As,
    // and Shift's keyup event gets triggered while focused on a different
    // window, which causes Shift to appear "stuck" in the keydown state.
    //
    // TODO: Handle keyups appropriately when focus is off this window.
    if (key.isPressed(key.CONTROL) && key.isPressed(key.SHIFT)) {
      key.clear();
    }
  }
  
  panSelection(dx, dy) {
    this.selector.pan(dx, dy);
    
    this._panActionData.dx += dx;
    this._panActionData.dy += dy;
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
    let gameObjects = this.getGameObjects();
    let selected    = [];

    for (let i = 0; i < gameObjects.length; i++) {
      let cur = gameObjects[i];

      if (x <= cur.position.x &&
        x + width >= cur.position.x &&
        y <= cur.position.y &&
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
    let gameObjects = this.getGameObjects();

    for (let i = 0; i < gameObjects.length; i++) {
      let cur    = gameObjects[i];
      let width  = cur.getWidth();
      let height = cur.getHeight();

      if (x >= cur.position.x - width * 0.5 &&
        x <= cur.position.x + width * 0.5 &&
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
    
    // Just added a new entity (and possibly dragged it)
    if (this._addEntityActionData.gameObject) {
      this.scheduleAddGameObject(
        this._addEntityActionData.gameObject,
        this._addEntityActionData.layerId
      );
    
      // Clear our references for the next entity to be added
      this._addEntityActionData.gameObject = undefined;
      this._addEntityActionData.layerId    = undefined;
      
      // Reset the panning since the added entity's position will already
      // reflect the position it was moved to
      this._panActionData.dx = 0;
      this._panActionData.dy = 0;
    }
    
    // If no entity was added, send out action data if entities were just
    // being dragged
    else if (this._panActionData.dx !== 0 || this._panActionData.dy !== 0) {
      this.scheduleSelectionMove(
        this._panActionData.dx,
        this._panActionData.dy
      );
      
      this._panActionData.dx = 0;
      this._panActionData.dy = 0;
    }
  }

  onMouseLeave(e) {
  }

  onMouseEnter(e) {
  }

  onContextMenu(e) {
    let leftMouseState = this.mouse.getState(1);
    if (!leftMouseState.isDown) {
      this.selector.clear();
    }
    
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
      SPEED: 0.01
    }
  },

  GRID: {
    value: {
      MIN_SCALE: 0.5
    }
  }
});

module.exports = WorldEditorScene;
