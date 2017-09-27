"use strict";

const $      = wfl.jquery;
const Action = require('./Action');

const ActionPerformer = {
  do: (type, data, reversable, direction, state) => {
    let action;
    
    if (type instanceof Action) {
      action = type;
    } else {
      action = new Action(type, data, reversable, direction, state);
    }
    
    $(ActionPerformer).trigger(Action.Event.DEFAULT, action);
  },
  
  undo: (action) => {
    let reversedAction = ActionPerformer._reverse(action);
    
    reversedAction.reversable = false;
    reversedAction.direction  = Action.Direction.UNDO;
    ActionPerformer.do(reversedAction);
  },
  
  redo: (action) => {
    action.reversable = false;
    action.direction = Action.Direction.REDO;
    action.state     = Action.State.IN_PROGRESS;
    ActionPerformer.do(action);
  },
  
  _reverse: (action) => {
    let {data} = action;
    let revAction;
    
    switch (action.type) {
      case Action.Type.PROJECT_TILE_WIDTH_CHANGE:
        revAction = new Action(
          Action.Type.PROJECT_TILE_WIDTH_CHANGE,
          {
            prevTileWidth: data.tileWidth,
            tileWidth: data.prevTileWidth
          }
        );
        break;
        
      case Action.Type.PROJECT_TILE_HEIGHT_CHANGE:
        revAction = new Action(
          Action.Type.PROJECT_TILE_HEIGHT_CHANGE,
          {
            prevTileHeight: data.tileHeight,
            tileHeight: data.prevTileHeight
          }
        );
        break;
      
      case Action.Type.LAYER_ADD:
        revAction = new Action(
          Action.Type.LAYER_REMOVE,
          data
        );
        break;
      
      case Action.Type.LAYER_REMOVE:
        revAction = new Action(
          Action.Type.LAYER_ADD,
          data
        );
        break;
      
      case Action.Type.LAYER_LOCK:
        revAction = new Action(
          Action.Type.LAYER_UNLOCK,
          data
        );
        break;
      
      case Action.Type.LAYER_UNLOCK:
        revAction = new Action(
          Action.Type.LAYER_LOCK,
          data
        );
        break;
      
      case Action.Type.ENTITY_ADD:
        revAction = new Action(
          Action.Type.ENTITY_REMOVE,
          data
        );
        break;
      
      case Action.Type.WORLD_ENTITY_ADD:
        revAction = new Action(
          Action.Type.WORLD_ENTITY_REMOVE,
          data
        );
        break;
      
      case Action.Type.WORLD_ENTITY_REMOVE:
        revAction = new Action(
          Action.Type.WORLD_ENTITY_ADD,
          data
        );
        break;
      
      case Action.Type.WORLD_ENTITY_ADD_BATCH:
        revAction = new Action(
          Action.Type.WORLD_ENTITY_REMOVE_BATCH,
          data
        );
        break;
      
      case Action.Type.WORLD_ENTITY_REMOVE_BATCH:
        revAction = new Action(
          Action.Type.WORLD_ENTITY_ADD_BATCH,
          data
        );
        break;
      
      case Action.Type.WORLD_SELECTION_MOVE:
        revAction = new Action(
          Action.Type.WORLD_SELECTION_MOVE,
          {
            gameObjects: data.gameObjects,
            dx: -data.dx,
            dy: -data.dy
          }
        );
        break;
      
      case Action.Type.WORLD_SELECTION_ALIGN:
        revAction = new Action(
          Action.Type.WORLD_SELECTION_ALIGN,
          {
            gameObjects: data.gameObjects,
            dxList: data.dxList.map((dx) => -dx),
            dyList: data.dyList.map((dy) => -dy)
          }
        );
        break;
      
      case Action.Type.WORLD_SELECTION_ROTATE:
        revAction = new Action(
          Action.Type.WORLD_SELECTION_ROTATE,
          {
            gameObjects: data.gameObjects,
            dThetaList: data.dThetaList.map((dTheta) => -dTheta),
            unique: data.unique
          }
        );
        break;
      
      case Action.Type.PROPERTY_CHANGE_NAME:
      case Action.Type.PROPERTY_CHANGE_SOLID:
      case Action.Type.PROPERTY_CHANGE_FIXED:
      case Action.Type.PROPERTY_CHANGE_PERSISTS:
      case Action.Type.PROPERTY_CHANGE_MASS:
      case Action.Type.PROPERTY_CHANGE_FRICTION:
      case Action.Type.PROPERTY_CHANGE_RESTITUTION:
        revAction = new Action(
          action.type,
          {
            gameObjects: data.gameObjects,
            prevValues: data.values,
            values: data.prevValues
          }
        );
        break;
        
      case Action.Type.PROPERTY_ADD_BEHAVIOR:
        revAction = new Action(
          Action.Type.PROPERTY_REMOVE_BEHAVIOR,
          data
        );
        break;
        
      case Action.Type.PROPERTY_REMOVE_BEHAVIOR:
        revAction = new Action(
          Action.Type.PROPERTY_ADD_BEHAVIOR,
          data
        );
        break;
        
      case Action.Type.PROPERTY_CHANGE_BEHAVIOR:
        revAction = new Action(
          action.type,
          {
            gameObjects: data.gameObjects,
            prevValues: data.values,
            values: data.prevValues,
            behaviorData: data.behaviorData,
            propertyName: data.propertyName
          }
        );
        break;
      
      default:
        console.error("Missing Reverse Action for: " + action.type);
        revAction = new Action();
    }
    
    return revAction;
  }
};

module.exports = ActionPerformer;