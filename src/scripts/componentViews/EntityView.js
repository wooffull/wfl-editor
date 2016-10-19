"use strict";

const $                = wfl.jquery;
const ComponentView    = require('./ComponentView');
const {ExpandableMenu,
       MenuItem}       = require('../ui');
const {Entity}         = require('../world');

class EntityView extends ComponentView {
  constructor() {
    super();
    
    this.entitiesMenu = new ExpandableMenu('Entities');
    this.add(this.entitiesMenu);
    
    // TODO: Remove these test entities and add scroll bars when
    // there are too many entities
    for (let i = 0; i < 10; i++) {
      let ent = null;
      
      if (i % 2 === 1) {
        ent = new Entity({name: i, imageSource: './media/Sprites1.png'});
      } else {
        ent = new Entity({name: i, imageSource: './media/icon.png'});
      }
      
      this.addEntity(ent);
    }
  }
  
  addEntity(entity) {
    let menuItem = new MenuItem(entity.name, entity);
    this.entitiesMenu.add(menuItem);
  }
}

module.exports = EntityView;