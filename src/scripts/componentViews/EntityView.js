"use strict";

const $                = wfl.jquery;
const ComponentView    = require('./ComponentView');
const {ExpandableMenu} = require('../ui');

class EntityView extends ComponentView {
  constructor() {
    super();
    
    this.entitiesMenu = new ExpandableMenu();
    this.add(this.entitiesMenu);
  }
}

module.exports = EntityView;