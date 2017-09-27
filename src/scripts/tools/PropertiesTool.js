"use strict";

const Tool           = require('./Tool');
const {Action}       = require('../action');
const subwindowViews = require('../subwindowViews');

class PropertiesTool extends Tool {
  constructor() {
    super('list', new subwindowViews.PropertiesView());
    
    this.register(
      Action.Type.WORLD_ENTITY_SELECT,
      (action) => this.subwindowView.onActionEntitySelect(action)
    );
    this.register(
      Action.Type.WORLD_ENTITY_DESELECT,
      (action) => this.subwindowView.onActionEntityDeselect(action)
    );
    this.register(
      Action.Type.WORLD_SELECTION_MOVE,
      (action) => this.subwindowView.onActionWorldSelectionMove(action)
    );
    this.register(
      Action.Type.WORLD_SELECTION_ALIGN,
      (action) => this.subwindowView.onActionWorldSelectionAlign(action)
    );
    this.register(
      Action.Type.WORLD_SELECTION_ROTATE,
      (action) => this.subwindowView.onActionWorldSelectionRotate(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_NAME,
      (action) => this.subwindowView.onActionPropertyChangeName(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_SOLID,
      (action) => this.subwindowView.onActionPropertyChangeSolid(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_FIXED,
      (action) => this.subwindowView.onActionPropertyChangeFixed(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_PERSISTS,
      (action) => this.subwindowView.onActionPropertyChangePersists(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_MASS,
      (action) => this.subwindowView.onActionPropertyChangeMass(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_FRICTION,
      (action) => this.subwindowView.onActionPropertyChangeFriction(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_RESTITUTION,
      (action) => this.subwindowView.onActionPropertyChangeRestitution(action)
    );
    this.register(
      Action.Type.PROPERTY_ADD_BEHAVIOR,
      (action) => this.subwindowView.onActionPropertyAddBehavior(action)
    );
    this.register(
      Action.Type.PROPERTY_REMOVE_BEHAVIOR,
      (action) => this.subwindowView.onActionPropertyRemoveBehavior(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_BEHAVIOR,
      (action) => this.subwindowView.onActionPropertyChangeBehavior(action)
    );
  }
}

module.exports = PropertiesTool;