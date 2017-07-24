"use strict";

const $                 = wfl.jquery;
const {GameObject,
       PhysicsObject}   = wfl.core.entities;
const debug             = wfl.debug;
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

    this.canvas     = canvas;
    this.mouse      = mouse;
    this.keyboard   = keyboard;
    this.tool       = undefined;

    this.selector = new util.Selector();

    this.enableMouseEvents();
  }
  
  enableMouseEvents() {
    $(this.mouse).on(Mouse.Event.MOVE,      ($e, e) => this.onMouseMove(e));
    $(this.mouse).on(Mouse.Event.DOWN,      ($e, e) => this.onMouseDown(e));
    $(this.mouse).on(Mouse.Event.BEFORE_UP, ($e, e) => this.onBeforeMouseUp(e));
    $(this.mouse).on(Mouse.Event.LEAVE,     ($e, e) => this.onMouseLeave(e));
    $(this.mouse).on(Mouse.Event.ENTER,     ($e, e) => this.onMouseEnter(e));
    $(this.canvas).on("contextmenu",        ($e, e) => this.onContextMenu(e));
    $(this.canvas).on("mousewheel",         ($e)    => this.onMouseWheel($e));
  }
  
  disableMouseEvents() {
    $(this.mouse).off(Mouse.Event.MOVE);
    $(this.mouse).off(Mouse.Event.DOWN);
    $(this.mouse).off(Mouse.Event.BEFORE_UP);
    $(this.mouse).off(Mouse.Event.LEAVE);
    $(this.mouse).off(Mouse.Event.ENTER);
    $(this.canvas).off("contextmenu");
    $(this.canvas).off("mousewheel");
  }

  reset() {
    if (this._bucketConfig) {
      // Keep track of the size of all buckets and set that size after
      // resetting
      let bucketSize = this._bucketConfig.size;
      super.reset();
      this._bucketConfig.size = bucketSize;
    } else {
      super.reset();
    }

    // Check if the selector exists because constructor's call to super()
    // will call reset() before selector is defined
    if (this.selector) {
      this.selector.clear();
    }

    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.zoom       = WorldEditorScene.DEFAULT_SCALE;
    this.draggingScene     = false;
    this.tileSize          = {
      x: WorldEditorScene.DEFAULT_TILE_SIZE.x,
      y: WorldEditorScene.DEFAULT_TILE_SIZE.y
    };
    this.curEntity         = undefined;
    this.layerIndex        = 0;
    this.lockedLayers      = [];
    
    // Increments every time an entity is added -- used for IDs
    this._entityCounter = 0;
    
    // Used to send out action data for panning entites only when the
    // action is ready (mouse up)
    this._panActionData = {dx: 0, dy: 0};
    
    // Used to send out action data for rotating entites only when the
    // action is ready (mouse up)
    this._rotateActionData = {dTheta: 0};
    
    // Used to send out action data for adding entities only when the
    // action is ready (mouse up)
    this._addEntityActionData = {gameObject: undefined, layerId: undefined};
  }

  update(dt) {
    this.handleInput();
    super.update(dt);
    
    // Update the entity to-be-added if it exists
    if (this._addEntityActionData.gameObject) {
      this._addEntityActionData.gameObject.update(dt);
    }
  }
      
  _handleCollisions(gameObjects) {}
  _handleOverlaps(gameObjects) {}

  draw(renderer) {
    // Draw all game objects in the world
    super.draw(renderer);
    
    if (this.mouse.touchingCanvas) {
      this.drawMouseHoverTile();
    }

    // Only draw the grid if not zoomed too far out.
    // It makes everything look less cluttered with that small of a scale.
    if (this.camera.zoom >= WorldEditorScene.GRID.MIN_SCALE) {
      this.drawGrid();
    }

    this.drawSelection();

    if (this.tool) {
      this.tool.draw(renderer);
    }
  }

  drawGrid() {
    let cameraPos       =  this.camera.position;
    let offset          =  this.getCenterOffset();
    let zoom            =  this.camera.zoom;
    let tileSize        =  this.tileSize;
    let canvas          =  this.canvas;
    let totalHorizontal =  Math.round((canvas.width  / zoom) / tileSize.x + 2);
    let totalVertical   =  Math.round((canvas.height / zoom) / tileSize.y + 2);
    let minHorizontal   = -Math.round(totalHorizontal * 0.5);
    let maxHorizontal   =  Math.round(totalHorizontal * 0.5);
    let minVertical     = -Math.round(totalVertical   * 0.5);
    let maxVertical     =  Math.round(totalVertical   * 0.5);
    let x               =  0;
    let y               =  0;
    
    debug.lineSize  = Math.max(1, 1 / zoom);
    debug.lineColor = 0xFFFFFF;
    debug.lineAlpha = 0.2;

    for (let i = minHorizontal; i < maxHorizontal; i++) {
      x = Math.round(i * tileSize.x - cameraPos.x % tileSize.x + cameraPos.x);
      debug.drawSegment(
        {x: x, y: cameraPos.y - offset.y / zoom},
        {x: x, y: cameraPos.y + offset.y / zoom}
      );
    }
    
    for (let j = minVertical; j < maxVertical; j++) {
      y = Math.round(j * tileSize.y - cameraPos.y % tileSize.y + cameraPos.y);
      debug.drawSegment(
        {x: cameraPos.x - offset.x / zoom, y: y},
        {x: cameraPos.x + offset.x / zoom, y: y}
      );
    }
  }

  drawMouseHoverTile() {
    // Get the mouse's tile position
    let tileSize       = this.tileSize;
    let zoom           = this.camera.zoom;
    let mouseTilePos   = this.getMouseTilePosition();
    let lineSize       = Math.max(1, 1 / zoom);
    let debugContainer = debug.getContainer();
    let tileWorldPos   = mouseTilePos;
    
    // Adjust from tile-position to world-position
    tileWorldPos.x *= tileSize.x;
    tileWorldPos.y *= tileSize.y;
    
    // Draw a filled rectangle denoting the mouse's position
    debugContainer.lineStyle(lineSize, 0xFFFFC8, 1);
    debugContainer.beginFill(0xFFFFC8, 0.2);
    debugContainer.drawRect(
      tileWorldPos.x,
      tileWorldPos.y,
      tileSize.x,
      tileSize.y
    );
    debugContainer.endFill();
  }

  drawSelection() {
    let selectedObjects = this.selector.selectedObjects;

    // Only draw when there are selected objects
    if (selectedObjects.length > 0) {
      this._stage.removeChild.apply(this._stage, selectedObjects);
      this._stage.addChild.apply(this._stage, selectedObjects);
      
      this.selector.draw(this);
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
    let zoom      = this.camera.zoom;
    let offset    = this.getCenterOffset();
    let cameraPos = this.camera.position;
    let worldPos  = new geom.Vec2(
      point.x / zoom + cameraPos.x - offset.x / zoom,
      point.y / zoom + cameraPos.y - offset.y / zoom 
    );
    worldPos.x = Math.round(worldPos.x);
    worldPos.y = Math.round(worldPos.y);
    return worldPos;
  }
  
  convertWorldPosToPagePos(point) {
    let zoom      = this.camera.zoom;
    let offset    = this.getCenterOffset();
    let cameraPos = this.camera.position;
    let pagePos   = new geom.Vec2(
      point.x * zoom - cameraPos.x * zoom + offset.x,
      point.y * zoom - cameraPos.y * zoom + offset.y
    );
    pagePos.x = Math.round(pagePos.x);
    pagePos.y = Math.round(pagePos.y);
    return pagePos;
  }

  convertWorldPosToTilePos(point) {
    // Clone the reference point before applying operations on it
    let tilePos = point.clone();

    // Divide by tile size then round to the nearest tile coordinate
    tilePos.x /= this.tileSize.x;
    tilePos.y /= this.tileSize.y;
    tilePos.x = Math.round(tilePos.x - 0.5);
    tilePos.y = Math.round(tilePos.y - 0.5);

    return tilePos;
  }
  
  convertTilePosToWorldPos(point) {
    // Clone the reference point before applying operations on it
    let worldPos = point.clone();
    
    // Multiply by tile size
    worldPos.x *= this.tileSize.x;
    worldPos.y *= this.tileSize.y;
    
    // Add half the tile size to center the point in the middle of a tile
    worldPos.x += this.tileSize.x * 0.5;
    worldPos.y += this.tileSize.y * 0.5;
    
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
        gameObjects: selectedGameObjects.slice(0),
        dx:          dx,
        dy:          dy
      };

      ActionPerformer.do(
        Action.Type.WORLD_SELECTION_MOVE,
        data
      );
    }
  }
  
  scheduleSelectionAlign(reversable = true) {
    let selectedGameObjects = this.selector.selectedObjects;
    
    if (selectedGameObjects.length > 0) {
      let dxList = [];
      let dyList = [];
      let hasChanges = false;

      for (const obj of selectedGameObjects) {
        let tilePos  = this.convertWorldPosToTilePos(obj.position);
        let worldPos = this.convertTilePosToWorldPos(tilePos);
        let dx       = worldPos.x - obj.position.x;
        let dy       = worldPos.y - obj.position.y;
        
        if (dx !== 0 || dy !== 0) {
          hasChanges |= true;
        }

        dxList.push(dx);
        dyList.push(dy);
      }
      
      if (!hasChanges) {
        return;
      }

      let data = {
        gameObjects: selectedGameObjects.slice(0),
        dxList:      dxList,
        dyList:      dyList
      };

      ActionPerformer.do(
        Action.Type.WORLD_SELECTION_ALIGN,
        data
      );
    }
  }
  
  scheduleSelectionRotate(dTheta = 0, reversable = true) {
    let selectedGameObjects = this.selector.selectedObjects;
    
    if (selectedGameObjects.length > 0 && dTheta !== 0) {
      let data = {
        gameObjects: selectedGameObjects.slice(0),
        dThetaList:  [dTheta],
        unique:      false
      };

      ActionPerformer.do(
        Action.Type.WORLD_SELECTION_ROTATE,
        data
      );
    }
  }
  
  scheduleSelectionRotateSnap(reversable = true) {
    let selectedGameObjects = this.selector.selectedObjects;
    
    if (selectedGameObjects.length > 0) {
      let dThetaList = [];

      for (const obj of selectedGameObjects) {
        let curRotation = obj.rotation;
        let newRotation = Math.round(8 * curRotation / (2 * Math.PI)) *
                          (2 * Math.PI) / 8;
        dThetaList.push(newRotation - curRotation);
      }

      let data = {
        gameObjects: selectedGameObjects.slice(0),
        dThetaList:  dThetaList,
        unique:      true
      };

      ActionPerformer.do(
        Action.Type.WORLD_SELECTION_ROTATE,
        data
      );
    }
  }
  
  addCurrentGameObject(x, y) {
    // Prevent adding objects to locked layers
    if (this.lockedLayers.indexOf(this.layerIndex) >= 0) {
      return;
    }
    
    if (this.curEntity) {
      let gameObject = this.addEntity(this.curEntity);
      gameObject.position.x = x;
      gameObject.position.y = y;
      return gameObject;
    }
    
    return null;
  }
  
  addEntity(entity, layerId = this.layerIndex, reversable = true) {
    let gameObject = new GameObject();
    let graphic    = wfl.PIXI.loader.resources[entity.name];
    let state      = GameObject.createState();
    let frame      = GameObject.createFrame(graphic.texture);
    
    state.addFrame(frame);
    gameObject.addState(GameObject.STATE.DEFAULT, state);
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
    this.zoom(dz);
    this.pan(dx, dy);
    
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
  
  zoom(dz, _forceCenterZoom = false) {
    if (this.mouse.touchingCanvas && !_forceCenterZoom) {
      this._zoomIntoMouse(dz);
    } else {
      this._zoomIntoCanvasCenter(dz);
    }
  }
  
  _zoomIntoMouse(dz) {
    var mousePos              = this.mouse.position;
    var preScaleOffset        = null;
    var postScaleOffset       = null;
    var mousePagePosPreScale  = null;
    var mousePagePosPostScale = null;
    var mouseAdjustment       = null;
    
    // Get the world position of the mouse before zooming
    preScaleOffset = this.convertPagePosToWorldPos(mousePos);
    
    // Zoom in...
    this._zoomIntoCanvasCenter(dz);
    
    // Get the world position of the mouse after zooming
    postScaleOffset = this.convertPagePosToWorldPos(mousePos);
    
    // Get the page position (in pixels) of the mouse before and after zooming
    mousePagePosPreScale  = this.convertWorldPosToPagePos(preScaleOffset);
    mousePagePosPostScale = this.convertWorldPosToPagePos(postScaleOffset);
    
    // Calculate the adjustment needed to pan the world after zooming so that
    // the mouse stays at the same WORLD position
    mouseAdjustment = geom.Vec2.subtract(
      mousePagePosPreScale,
      mousePagePosPostScale
    );
    
    // Pan the world by that adjustment so it looks like the user zoomed into
    // the mouse's position
    this.pan(mouseAdjustment.x, mouseAdjustment.y, true);
  }
  
  _zoomIntoCanvasCenter(dz) {
    this.camera.zoom += dz;
    this.camera.zoom = Math.max(
      WorldEditorScene.SCALE.MIN,
      Math.min(WorldEditorScene.SCALE.MAX, this.camera.zoom)
    );
  }
  
  pan(dx, dy, _ignoreToolPan = false) {
    // Apply adjustments to pan based on current scale
    dx /= this.camera.zoom;
    dy /= this.camera.zoom;
    this.camera.position.x += dx;
    this.camera.position.y += dy;

    if (this.tool && !_ignoreToolPan) this.tool.pan(dx, dy);
  }
  
  panSelection(dx, dy) {
    this.selector.pan(dx, dy);
    
    this._panActionData.dx += dx;
    this._panActionData.dy += dy;
  }
  
  /**
   * Moves the selection back to its original position before any dragging
   * started
   */
  clearSelectionPan() {
    let dx = -this._panActionData.dx;
    let dy = -this._panActionData.dy;
    this.selector.pan(dx, dy);
    
    this._panActionData.dx = 0;
    this._panActionData.dy = 0;
  }
  
  rotateSelection(dTheta) {
    this.selector.rotate(dTheta);
    this._rotateActionData.dTheta += dTheta;
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
      
      if (this.lockedLayers.indexOf(cur.layer) >= 0) {
        continue;
      }

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
      let width  = cur.width;
      let height = cur.height;
      
      if (this.lockedLayers.indexOf(cur.layer) >= 0) {
        continue;
      }

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
    if (this.draggingScene) {
      this.pan(-e.originalEvent.movementX, -e.originalEvent.movementY, true);
    } else {
      if (this.tool) this.tool.mouseMove();
    }
  }

  onMouseDown(e) {
    // Middle-click and drag lets the user move the camera around and pan
    if (e.which == 2) {
      this.draggingScene = true;
    } else {
      if (this.tool) {
        if (e.which === 1) {
          this.tool.leftDown();
        } else if (e.which === 3) {
          this.tool.rightDown();
        }
      }
    }

    e.stopPropagation();
    e.preventDefault();
  }

  onBeforeMouseUp(e) {
    // Middle-click and drag lets the user move the camera around and pan
    if (e.which == 2) {
      this.draggingScene = false;
    } else {
      if (this.tool) {
        if (e.which === 1) {
          this.tool.leftUp();
        } else if (e.which === 3) {
          this.tool.rightUp();
        }
      }

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

      // If no entities were dragged, send out action data if entities were
      // just being rotated
      } else if (this._rotateActionData.dTheta !== 0) {
        this.scheduleSelectionRotate(this._rotateActionData.dTheta);
        this._rotateActionData.dTheta = 0;
      }
    }

    e.stopPropagation();
    e.preventDefault();
  }

  onMouseLeave(e) {
    if (this.tool) {
      this.tool.mouseLeave();
    }
  }

  onMouseEnter(e) {
    if (this.tool) {
      this.tool.mouseEnter();
    }
  }

  onContextMenu(e) {
    let leftMouseState = this.mouse.getState(1);
    if (!leftMouseState.isDown) {
      this.selector.clear();
    }
    
    this.draggingScene = false;
    return false;
  }
  
  onMouseWheel(e) {
    var zoomSpeed = 
      WorldEditorScene.SCALE.SPEED *
      WorldEditorScene.SCALE.MOUSE_SCROLL_MULTIPLIER *
      e.originalEvent.wheelDelta;
    
    this.zoom(zoomSpeed);
  }
  
  _onResize(e) {
    super._onResize(e);
    this._bucketConfig.size *= this.camera.zoom / WorldEditorScene.SCALE.MIN;
    this._bucketConfig.size = Math.ceil(this._bucketConfig.size);
  }
}

// Define constants
Object.defineProperties(WorldEditorScene, {
  DEFAULT_SCALE: {
    value: 1.0
  },

  DEFAULT_TILE_SIZE: {
    value: {
      x: 168 * 0.25,
      y: 144 * 0.25
    }
  },

  PAN: {
    value: {
      SPEED: 5
    }
  },

  SCALE: {
    value: {
      MIN:                     0.15,
      MAX:                     1.5,
      SPEED:                   0.01,
      MOUSE_SCROLL_MULTIPLIER: 0.05
    }
  },

  GRID: {
    value: {
      MIN_SCALE: 0.35
    }
  }
});

module.exports = WorldEditorScene;
