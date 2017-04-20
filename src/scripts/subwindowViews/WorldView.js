"use strict";

const $                 = wfl.jquery;
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
    this.worldEditorScene.camera.zoom = 1;
    this.worldEditorScene.camera.position.x = 0;
    this.worldEditorScene.camera.position.y = 0;
  }
  
  resize(e) {
    let parent  = this.element.parent().parent();
    let toolbar = parent.find('.' + CssClasses.SUBWINDOW_TOOLBAR);
    
    let style   = window.getComputedStyle(parent[0], null);
    let width   = parseInt(style.getPropertyValue("width"));
    let height  = parseInt(style.getPropertyValue("height"));
    let padding = parseInt(style.getPropertyValue("padding"));

    this.canvas.width  = width  - padding * 2;
    this.canvas.height = height - padding * 2 - toolbar.outerHeight();
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
    let {layerId} = action.data;
    let scene     = this.worldEditorScene;
    scene.layerId = layerId;
  }
  
  onActionLayerAdd(action) {
    let {layerId} = action.data;
    let scene     = this.worldEditorScene;
    scene.addLayer(layerId);
    
    if (typeof action.data.entities !== 'undefined') {
      for (let entity of action.data.entities) {
        scene.addGameObject(entity, layerId, false);
      }
    }
  }
  
  onActionLayerRemove(action) {
    let {layerId}        = action.data;
    let scene            = this.worldEditorScene;
    let existingEntities = scene._gameObjectLayers[layerId].concat();
    
    // When the layer is removed, the action holds onto the entities removed with it
    // (so that during undo, they can be added back)
    if (typeof action.data.entities === 'undefined') {
      // DATA_APPEND
      action.data.entities = existingEntities;
    }
    
    scene.removeLayer(layerId);
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
}

module.exports = WorldView;