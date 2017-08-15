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
      Action.Type.PROPERTY_CHANGE_POSITION_X,
      (action) => this.subwindowView.onActionPropertyChangePositionX(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_POSITION_Y,
      (action) => this.subwindowView.onActionPropertyChangePositionY(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_ROTATION,
      (action) => this.subwindowView.onActionPropertyChangeRotation(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_FRICTION,
      (action) => this.subwindowView.onActionPropertyChangeFriction(action)
    );
    this.register(
      Action.Type.PROPERTY_CHANGE_RESTITUTION,
      (action) => this.subwindowView.onActionPropertyChangeRestitution(action)
    );
  }
}

module.exports = PropertiesTool;