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
      //
      //  data: {}
      FILE_REFRESH: 'file-refresh',
      
      // ProjectSettingsTool
      //
      //  data: {
      //    prevTileWidth: <Project's previous tile width>
      //    tileWidth: <Project's new tile width>
      //  }
      PROJECT_TILE_WIDTH_CHANGE: 'project-tile-width-change',
      //
      //  data: {
      //    prevTileHeight: <Project's previous tile height>
      //    tileHeight: <Project's new tile height>
      //  }
      PROJECT_TILE_HEIGHT_CHANGE: 'project-tile-height-change',
      //
      //  data: {
      //    value: <Project's new dynamic z-order value>
      //  }
      PROJECT_DYNAMIC_Z_ORDER_CHANGE: 'project-dynamic-z-order-change',
      
      
      // ToolBarTool
      //
      //  data: {
      //    tool: <Object filled with data pertinent to the tool>
      //      - type: <A key defining which tool it is>
      //      - classReference: <A reference to a function to be new'd to 
      //                         create the tool>
      //      - materialIconLabel: <The string used by Google's Material Icons>
      //    icon: <The <i> tag in the DOM associated with the tool>
      //  }
      MAIN_TOOL_SELECT: 'main-tool-select',
      
      
      // EntityTool
      //
      //  data: {
      //    project: <The data for the project loaded>
      //  }
      ENTITY_PROJECT_LOAD_COMPLETE: 'entity-project-load-complete',
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
      //    gameObject: <The game object selected>
      //    entity: <The entity that the game object is instanced from>
      //    layerId: <The layer that the game object was added to>
      //  }
      WORLD_ENTITY_SELECT: 'world-entity-select',
      //
      //  data: {}
      WORLD_ENTITY_DESELECT: 'world-entity-deselect',
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
      //    dThetaList: <dThetaList[i] is dTheta for gameObjects[i]>,
      //    unique: <If dThetaList has unique values (for snap), or just 
      //             contains one value dThetaList[0]>
      //  }
      WORLD_SELECTION_ROTATE: 'world-selection-rotate',
      
      
      // LayerTool
      //
      //  data: {
      //    layerId: <The layer's name>,
      //    layerIndex: <The layer's position in the layer menu>
      //  }
      LAYER_SELECT: 'layer-select',
      //
      //  data: {
      //    layerId: <The layer's name>,
      //    layerIndex: <The layer's position in the layer menu>
      //  }
      LAYER_ADD: 'layer-add',
      //
      //  data: {
      //    layerId: <The layer's name>,
      //    layerIndex: <The layer's position in the layer menu>
      //  }
      LAYER_LOCK: 'layer-lock',
      //
      //  data: {
      //    layerId: <The layer's name>,
      //    layerIndex: <The layer's position in the layer menu>
      //  }
      LAYER_UNLOCK: 'layer-unlock',
      //
      //  data: {
      //    layerId: <The layer's name>,
      //    layerIndex: <The layer's position in the layer menu before being 
      //                 removed>
      //    @entities: <An array of all the entities in the layer before being //                removed>
      //  }
      LAYER_REMOVE: 'layer-remove',
      
      
      // PropertiesTool
      //
      //  data: {
      //    gameObjects: <An array of all the gameObjects to have their name
      //                  attribute changed>
      //    prevValues: <The name value before any changes>
      //    values: <The new name value for all gameObjects>
      //  }
      PROPERTY_CHANGE_NAME: 'property-change-name',
      //
      //  data: {
      //    gameObjects: <An array of all the gameObjects to have their solid
      //                  attribute changed>
      //    prevValues: <The solid value before any changes>
      //    values: <Whether or not the gameObjects are solid>
      //  }
      PROPERTY_CHANGE_SOLID: 'property-change-solid',
      //
      //  data: {
      //    gameObjects: <An array of all the gameObjects to have their fixed
      //                  attribute changed>
      //    prevValues: <The fixed value before any changes>
      //    values: <Whether or not the gameObjects are fixed in space>
      //  }
      PROPERTY_CHANGE_FIXED: 'property-change-fixed',
      //
      //  data: {
      //    gameObjects: <An array of all the gameObjects to have their 
      //               persists attribute changed>
      //    prevValues: <The persists value before any changes>
      //    values: <Whether or not the gameObjects persist>
      //  }
      PROPERTY_CHANGE_PERSISTS: 'property-change-persists',
      //
      //  data: {
      //    gameObjects: <An array of all the gameObjects to have their mass
      //                  value changed>
      //    prevValues: <The mass value before any changes>
      //    values: <Mass value for corresponding gameObjects in the 
      //             selection>
      //  }
      PROPERTY_CHANGE_MASS: 'property-change-mass',
      //
      //  data: {
      //    gameObjects: <An array of all the gameObjects to have their 
      //                  friction value changed>
      //    prevValues: <The friction value before any changes>
      //    values: <Friction value for corresponding gameObjects in the 
      //             selection>
      //  }
      PROPERTY_CHANGE_FRICTION: 'property-change-friction',
      //
      //  data: {
      //    gameObjects: <An array of all the gameObjects to have their 
      //                  restitution value changed>
      //    prevValues: <The restitution value before any changes>
      //    values: <Restitution value for corresponding gameObjects in the 
      //             selection>
      //  }
      PROPERTY_CHANGE_RESTITUTION: 'property-change-restitution',
      //
      //  data: {
      //    behaviorData: <Data for the behavior>
      //      module: <The behavior's module.exports>
      //      absolutePath: <Absolute path of the module>
      //      basename: <The module's name with its extension>
      //      name: <The module's name>
      //    @gameObjects: <An array of all the game objects that will add the 
      //                  new behavior>
      //  }
      PROPERTY_ADD_BEHAVIOR: 'property-add-behavior',
      //
      //  data: {
      //    behaviorData: <Data for the behavior>
      //      module: <The behavior's module.exports>
      //      absolutePath: <Absolute path of the module>
      //      basename: <The module's name with its extension>
      //      name: <The module's name>
      //    gameObjects: <An array of all the game objects that will remove the
      //                  behavior>
      //  }
      PROPERTY_REMOVE_BEHAVIOR: 'property-remove-behavior',
      //
      //  data: {
      //    gameObjects: <An array of all the gameObjects with an arbitrary
      //                  property change>
      //    prevValues: <The property's value before any changes>
      //    values: <The new property value for all gameObjects>
      //    behaviorData: <Data for the behavior>
      //      module: <The behavior's module.exports>
      //      absolutePath: <Absolute path of the module>
      //      basename: <The module's name with its extension>
      //      name: <The module's name>
      //    propertyName: <Name of the property being changed>
      //  }
      PROPERTY_CHANGE_BEHAVIOR: 'property-change-behavior',
      //
      //  data: {
      //    popupType: <The type of popup to display over the editor>
      //  }
      GLOBAL_POPUP: 'global-popup',
      
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