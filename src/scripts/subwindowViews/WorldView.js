"use strict";

const $                 = wfl.jquery;
const debug             = wfl.debug;
const {Action,
       ActionPerformer} = require('../action');
const SubwindowView     = require('./SubwindowView');
const CssClasses        = require('../CssClasses');
const scenes            = require('../scenes');

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
    this.wflGame.setScene(this.worldEditorScene);
    
    this.element = $(this.canvas);
  }
  
  reset() {
    this.worldEditorScene.reset();
  }
  
  resize(e) {
    let parent  = this.element.parent().parent();
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
    if (action.data.unique) {
      let {dThetaList, gameObjects} = action.data;
      let scene                     = this.worldEditorScene;

      // dThetas are negated if necessary by the ActionPerformer, so
      // use addition
      for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].rotate(dThetaList[i]);
      }

      scene.selector.update();
      
    } else if (action.direction !== Action.Direction.DEFAULT) {
      // If not unique, then there's only one value at dThetaList[0] for all
      // object rotations
      let {dThetaList, gameObjects} = action.data;
      let dTheta                    = dThetaList[0];
      let scene                     = this.worldEditorScene;

      // dThetas are negated if necessary by the ActionPerformer, so
      // use addition
      for (let i = 0; i < gameObjects.length; i++) {
        gameObjects[i].rotate(dTheta);
      }

      scene.selector.update();
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