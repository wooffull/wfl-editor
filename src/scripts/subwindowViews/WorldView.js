"use strict";

const $                 = wfl.jquery;
const debug             = wfl.debug;
const {MenuButton}      = require('../ui');
const {Action,
       ActionPerformer} = require('../action');
const SubwindowView     = require('./SubwindowView');
const CssClasses        = require('../CssClasses');
const behaviors         = require('../behaviors');
const scenes            = require('../scenes');

const MIN_ROTATION_RADIAN_EPSILON = 0.0005 / (Math.PI * 2);

class WorldView extends SubwindowView {
  constructor() {
    super();
    
    this.canvas    = $('<canvas>')[0];
    this.canvas.id = CssClasses.WORLD_CANVAS;
    this.wflGame   = wfl.create(this.canvas);
    
    // Enable debug drawing for custom-drawn lines
    this.wflGame.debug = {vectors: true, vertices: false};
    
    this.worldEditorScene = new scenes.WorldEditorScene(
      this.canvas,
      this.wflGame.mouse,
      this.wflGame.keyboard
    );
    this.playGameScene = new scenes.PlayGameScene(
      this.canvas,
      this.wflGame.mouse,
      this.wflGame.keyboard
    );
    this.wflGame.setScene(this.worldEditorScene);
    
    this.editBtn = new MenuButton('mode_edit');
    this.editBtn.element.removeClass(CssClasses.FLOAT_RIGHT);
    this.editBtn.element.addClass(CssClasses.FLOAT_LEFT);
    
    this.playBtn = new MenuButton('play_arrow');
    this.playBtn.element.removeClass(CssClasses.FLOAT_RIGHT);
    this.playBtn.element.addClass(CssClasses.FLOAT_LEFT);
    
    this.buttonContainer = $('<div>');
    this.buttonContainer.append(this.editBtn.element);
    this.buttonContainer.append(this.playBtn.element);
    
    this.canvasContainer = $('<div>');
    this.canvasContainer.append($(this.canvas));
    this.canvasContainer.addClass(CssClasses.SUBWINDOW_FLEX_COLUMN);
    
    this.viewContainer = $('<div>');
    this.viewContainer.append(this.buttonContainer);
    this.viewContainer.append(this.canvasContainer);
    this.viewContainer.addClass(CssClasses.SUBWINDOW_FLEX_COLUMN);
    
    this.element = this.viewContainer;
    
    // Set up listeners
    $(this.editBtn.element).on('click', (e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        this.onGameEdit();
      }
    });
    $(this.playBtn.element).on('click', (e) => {
      if (typeof e.which === "undefined" || e.which === 1) {
        this.onGamePlay();
      }
    });
    $(this.playGameScene).on('throw-error', (e, err) => {
      console.error(err);
      this.onGameEdit();
    });
  }
  
  onGameEdit() {
    if (this.wflGame.getScene() !== this.worldEditorScene) {
      this.wflGame.setScene(this.worldEditorScene);
      this.worldEditorScene.enableMouseEvents();
      this.playGameScene.disableMouseEvents();
    }
  }
  
  onGamePlay() {
    if (this.wflGame.getScene() !== this.playGameScene) {
      // Reset the game scene
      this.playGameScene.reset();
      this.playGameScene._bucketConfig.size =
        this.worldEditorScene._bucketConfig.size;
      
      // Add all game objects to the game world
      let gameObjects = this.worldEditorScene.getGameObjects();
      let finalObj    = null;
      let layer       = 0;
      let persists    = false;
      for (let gameObject of gameObjects) {
        finalObj = this.playGameScene.createFinalizedGameObject(gameObject);
        layer = gameObject.layer;
        
        if (gameObject.customData.physics) {
          persists = gameObject.customData.physics.persists || false;
        } else {
          persists = false;
        }
        
        this.playGameScene.addGameObject(finalObj, layer, persists);
      }
      
      // TODO: Remove this. This is only to test having a player in the test
      // game scene.
      let defaultPlayer = this.playGameScene.findGameObjectByName('player');
      if (defaultPlayer) {
        this.playGameScene.player = defaultPlayer;
        this.playGameScene.camera.follow(this.playGameScene.player);
        this.playGameScene.camera.position._x = defaultPlayer.x;
        this.playGameScene.camera.position._y = defaultPlayer.y;
      }
      
      this.wflGame.setScene(this.playGameScene);
      this.playGameScene.enableMouseEvents();
      this.worldEditorScene.disableMouseEvents();
    }
  }
  
  reset() {
    this.worldEditorScene.reset();
  }
  
  resize(e) {
    let parent  = this.canvasContainer;
    let toolbar = parent.find('.' + CssClasses.SUBWINDOW_TOOLBAR);
    
    let style   = window.getComputedStyle(parent[0], null);
    let width   = parseInt(style.getPropertyValue("width"));
    let height  = parseInt(style.getPropertyValue("height"));
    let padding = parseInt(style.getPropertyValue("padding"));
    
    let w = width  - padding * 2;
    let h = height - padding * 2 - toolbar.outerHeight();

    this.canvas.width  = w;
    this.canvas.height = h;
    this.wflGame.renderer.view.style.width  = w + 'px';
    this.wflGame.renderer.view.style.height = h + 'px';
    this.wflGame.renderer.resize(w, h);
    this.worldEditorScene._onResize(e);
  }
  
  
  
  onActionMainToolSelect(action) {
    let {tool} = action.data;
    let scene  = this.worldEditorScene;
    scene.tool = new tool.classReference(scene);
  }
  
  onActionTileWidthChange(action) {
    let {tileWidth}  = action.data;
    let scene        = this.worldEditorScene;
    scene.tileSize.x = parseInt(tileWidth);
  }
  
  onActionTileHeightChange(action) {
    let {tileHeight} = action.data;
    let scene        = this.worldEditorScene;
    scene.tileSize.y = parseInt(tileHeight);
  }
  
  onActionDynamicZOrderChange(action) {
    let {value}                            = action.data;
    this.worldEditorScene.useDynamicZOrder = value;
    this.playGameScene.useDynamicZOrder    = value;
  }
  
  onActionEntitySelect(action) {
    let {entity}    = action.data;
    let scene       = this.worldEditorScene;
    scene.curEntity = entity;
  }
  
  onActionLayerSelect(action) {
    let {layerIndex} = action.data;
    let scene        = this.worldEditorScene;
    scene.layerIndex = layerIndex;
  }
  
  onActionLayerAdd(action) {
    let {layerIndex} = action.data;
    let scene        = this.worldEditorScene;
    scene.addLayer(layerIndex);
    
    if (typeof action.data.entities !== 'undefined') {
      for (let entity of action.data.entities) {
        scene.addGameObject(entity, layerIndex, false);
      }
    }
  }
  
  onActionLayerRemove(action) {
    let {layerIndex}     = action.data;
    let scene            = this.worldEditorScene;
    let existingEntities = scene._gameObjectLayers[layerIndex].concat();
    
    // When the layer is removed, the action holds onto the entities removed with it
    // (so that during undo, they can be added back)
    if (typeof action.data.entities === 'undefined') {
      // DATA_APPEND
      action.data.entities = existingEntities;
    }
    
    scene.removeLayer(layerIndex);
  }
  
  onActionLayerLock(action) {
    let {layerIndex} = action.data;
    let scene        = this.worldEditorScene;
    
    if (scene.lockedLayers.indexOf(layerIndex) < 0) {
      scene.lockedLayers.push(layerIndex);
    }
  }
  
  onActionLayerUnlock(action) {
    let {layerIndex} = action.data;
    let scene        = this.worldEditorScene;
    
    if (scene.lockedLayers.indexOf(layerIndex) >= 0) {
      scene.lockedLayers.splice(scene.lockedLayers.indexOf(layerIndex), 1);
    }
  }
  
  onActionWorldEntityAdd(action) {
    let {layerId, gameObject} = action.data;
    let scene                 = this.worldEditorScene;
    scene.addGameObject(gameObject, layerId);
  }
  
  onActionWorldEntityRemove(action) {
    let {layerId, gameObject} = action.data;
    let scene                 = this.worldEditorScene;
    scene.removeGameObject(gameObject, layerId);
  }
  
  onActionWorldEntityAddBatch(action) {
    let {gameObjects, layers} = action.data;
    let scene                 = this.worldEditorScene;
    
    for (let i = 0; i < gameObjects.length; i++) {
      scene.addGameObject(gameObjects[i], layers[i]);
    }
  }
  
  onActionWorldEntityRemoveBatch(action) {
    let {gameObjects, layers} = action.data;
    let scene                 = this.worldEditorScene;
    
    for (let i = 0; i < gameObjects.length; i++) {
      scene.removeGameObject(gameObjects[i], layers[i]);
    }
  }
  
  onActionWorldSelectionMove(action) {
    if (action.direction !== Action.Direction.DEFAULT) {
      let {dx, dy, gameObjects} = action.data;
      let scene                 = this.worldEditorScene;
      
      // dx and dy are negated if necessary by the ActionPerformer, so
      // use addition
      for (let obj of gameObjects) {
        obj.position.x += dx;
        obj.position.y += dy;
      }
      
      scene.selector.update();
    }
  }
  
  onActionWorldSelectionAlign(action) {
    let {dxList, dyList, gameObjects} = action.data;
    let scene                         = this.worldEditorScene;

    // dx and dy are negated if necessary by the ActionPerformer, so
    // use addition
    for (let i = 0; i < gameObjects.length; i++) {
      gameObjects[i].position.x += dxList[i];
      gameObjects[i].position.y += dyList[i];
    }

    scene.selector.update();
  }
  
  onActionWorldSelectionRotate(action) {
    let scene                     = this.worldEditorScene;
    let rotationPerformed         = false;
    let {dThetaList, gameObjects} = action.data;
    
    // If dThetaList contains unique values, this is a rotation snap
    if (action.data.unique) {
      for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].rotate(dThetaList[i]);
      }
      rotationPerformed = true;
    
    // Otherwise, a rotation Action is only sent at the end of rotation a
    // selection so that live updates on rotation is possible. That's why
    // normal rotations are only handled for undos and redos.
    } else if (action.direction !== Action.Direction.DEFAULT) {
      // If not unique, then there's only one value at dThetaList[0] for all
      // object rotations
      let dTheta = dThetaList[0];
      for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].rotate(dTheta);
      }
      rotationPerformed = true;
    }
    
    if (rotationPerformed) {
      this._snapRotations(gameObjects);
    }
    
    scene.selector.update();
  }
  
  _snapRotations(gameObjects) {
    // Check for floating point errors to see if all rotations are within
    // a specified epsilon of degrees away from each other. If so, they should
    // have their rotation (degrees) rounded to the nearest 1000th place.
    if (gameObjects.length > 0) {
      let startRotation      = gameObjects[0].rotation;
      let approximatelyEqual = true;

      for (let i = 0; i < gameObjects.length; i++) {
        let difference = Math.abs(gameObjects[i].rotation - startRotation);
        if (difference > MIN_ROTATION_RADIAN_EPSILON) {
          approximatelyEqual = false;
          break;
        }
      }

      if (approximatelyEqual) {
        let snappedRotationDegrees =
            Math.round(1000 * startRotation * 180 / Math.PI) / 1000;
        let snappedRotationRadians = snappedRotationDegrees * Math.PI / 180;
        for (let i = 0; i < gameObjects.length; i++) {
          gameObjects[i].rotate(
            snappedRotationRadians - gameObjects[i].rotation
          );
          gameObjects[i].cacheCalculations();
        }
      }
    }
  }
  
  onActionEntityRemove(action) {
    // Removes all instances of the entity being removed
    let {entityId}  = action.data;
    let scene       = this.worldEditorScene;
    let gameObjects = scene.getGameObjects();
    
    for (let obj of gameObjects) {
      if (obj.customData.entity.name === entityId) {
        scene.scheduleRemoveGameObject(obj, obj.layer, false);
      }
    }
  }
}

module.exports = WorldView;