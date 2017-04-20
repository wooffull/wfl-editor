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
      
      case Action.Type.WORLD_SELECTION_MOVE:
        revAction = new Action(
          Action.Type.WORLD_SELECTION_MOVE,
          {
            dx: -data.dx,
            dy: -data.dy,
            gameObjects: data.gameObjects
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