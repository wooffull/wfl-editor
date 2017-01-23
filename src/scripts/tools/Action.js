"use strict";

class Action {
  constructor(type = Action.Type.DEFAULT, data = {}, reversable = true, state = Action.State.IN_PROGRESS) {
    this.time       = Date.now();
    this.type       = type;
    this.data       = data;
    this.reversable = reversable;
    this.state      = state;
  }
}

Object.defineProperties(Action, {
  State: {
    value: {
      FAILED:      0, // The action was unable to be performed
      IN_PROGRESS: 1, // The action has been sent out to be parsed
      BUSY:        2, // The action will be COMPLETED asyncronously later on
      COMPLETED:   3  // The action is finished
    }
  },
  
  Type: {
    value: {
      DEFAULT:              'default',
      
      // ToolBarTool
      MAIN_TOOL_SELECT:     'main-tool-select',
      
      // EntityTool
      ENTITY_SELECT:        'entity-select',
      
      // WorldTool
      WORLD_ENTITY_ADD:     'world-entity-add',
      WORLD_ENTITY_REMOVE:  'world-entity-remove',
      WORLD_SELECTION_MOVE: 'world-selection-move',
      
      // LayerTool
      LAYER_SELECT:         'layer-select',
      LAYER_ADD:            'layer-add',
      LAYER_REMOVE:         'layer-remove'
    }
  },
  
  Event: {
    value: {
      DEFAULT: 'tool-action'
    }
  }
});

module.exports = Action;