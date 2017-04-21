"use strict";

class Action {
  constructor(type = Action.Type.DEFAULT, data = {}, reversable = true, direction = Action.Direction.DEFAULT, state = Action.State.IN_PROGRESS) {
    this.time       = Date.now();
    this.type       = type;
    this.data       = data;
    this.reversable = reversable;
    this.direction  = direction;
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
  
  // A template is provided in comments before each Action type to show
  // what data it contains in its COMPLETED state (for DEFAULT directions)
  //
  // Search for DATA_APPEND in comments to see where data is added onto
  // Actions while they are IN_PROGRESS, or see which properties are prepended
  // with a @ symbol below
  Type: {
    value: {
      //  data: {}
      DEFAULT: 'default',
      
      
      // FileExplorerTool
      //
      //  data: {}
      FILE_INIT: 'file-init',
      
      
      // ToolBarTool
      //
      //  data: {
      //    tool: <Object filled with data pertinent to the tool>
      //      - type: <A key defining which tool it is>
      //      - classReference: <A reference to a function to be new'd to create the tool>
      //      - materialIconLabel: <The string used by Google's Material Icons>
      //    icon: <The <i> tag in the DOM associated with the tool>
      //  }
      MAIN_TOOL_SELECT: 'main-tool-select',
      
      
      // EntityTool
      //
      //  data: {
      //    entityId: <The entity's name in the entity list>
      //    entity: <TODO: Finish Entity -- An Entity instance>
      //      - name: <Same as entityId>
      //      - imageSource: <Path to the entity's image>
      //  }
      ENTITY_SELECT: 'entity-select',
      //
      //  data: {
      //    entityId: <The entity's name in the entity list>
      //    entity: <TODO: Finish Entity -- An Entity instance>
      //      - name: <Same as entityId>
      //      - imageSource: <Path to the entity's image>
      //  }
      ENTITY_ADD: 'entity-add',
      //
      //  data: {
      //    entityId: <The entity's name in the entity list>
      //  }
      ENTITY_REMOVE: 'entity-remove',
      
      
      // WorldTool
      //
      //  data: {
      //    gameObject: <The game object added>
      //    entity: <The entity that the game object is instanced from>
      //    layerId: <The layer that the game object was added to>
      //  }
      WORLD_ENTITY_ADD: 'world-entity-add',
      //
      //  data: {
      //    gameObject: <The game object removed>
      //    layerId: <The layer that the game object was removed from>
      //  }
      WORLD_ENTITY_REMOVE: 'world-entity-remove',
      //
      //  data: {
      //    gameObjects: <The game objects added>
      //    layers: <layers[i] is the layer that contains gameObjects[i]>
      //  }
      WORLD_ENTITY_ADD_BATCH: 'world-entity-add-batch',
      //
      //  data: {
      //    gameObjects: <The game objects removed>
      //    layers: <layers[i] is the layer that contains gameObjects[i]>
      //  }
      WORLD_ENTITY_REMOVE_BATCH: 'world-entity-remove-batch',
      //
      //  data: {
      //    gameObjects: <The game objects that were moved with the action>
      //    dx: <Amount of pixels moved horizontally>
      //    dy: <Amount of pixels moved vertically>
      //  }
      WORLD_SELECTION_MOVE: 'world-selection-move',
      //
      //  data: {
      //    gameObjects: <The game objects that were moved with the action>
      //    dxList: <dxList[i] is dx for gameObjects[i]>
      //    dyList: <dyList[i] is dy for gameObjects[i]>
      //  }
      WORLD_SELECTION_ALIGN: 'world-selection-align',
      //
      //  data: {
      //    gameObjects: <The game objects that were moved with the action>
      //    dThetaList: <dThetaList[i] is dTheta for gameObjects[i]>
      //  }
      WORLD_SELECTION_ROTATE: 'world-selection-rotate',
      
      
      // LayerTool
      //
      //  data: {
      //    layerId: <The layer's name>
      //  }
      LAYER_SELECT: 'layer-select',
      //
      //  data: {
      //    layerId: <The layer's name>
      //  }
      LAYER_ADD: 'layer-add',
      //
      //  data: {
      //    layerId: <The layer's name>,
      //    @layerIndex: <The layer's position in the layer menu before being removed>
      //    @entities: <An array of all the entities in the layer before being removed>
      //  }
      LAYER_REMOVE: 'layer-remove',
      
      
      HISTORY_CLEAR: 'history-clear'
    }
  },
  
  Event: {
    value: {
      DEFAULT: 'tool-action'
    }
  },
  
  Direction: {
    value: {
      DEFAULT: 'default',
      UNDO:    'undo',
      REDO:    'redo'
    }
  }
});

module.exports = Action;