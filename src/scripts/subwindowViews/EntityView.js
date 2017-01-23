"use strict";

const $                = wfl.jquery;
const SubwindowView    = require('./SubwindowView');
const {ExpandableMenu,
       MenuItem,
       MenuButton}     = require('../ui');
const {Entity}         = require('../world');
const {Action}         = require('../tools');

class EntityView extends SubwindowView {
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
    
    this.addEntityEntryBtn = new MenuButton('add_box');
    this.addEntityEntryBtn.element.on('click', () => this.addEntityEntry());
    this.entitiesMenu.addButton(this.addEntityEntryBtn);
    
    this.removeEntityEntryBtn = new MenuButton('indeterminate_check_box');
    this.removeEntityEntryBtn.element.on('click', () => this.removeEntityEntry());
    this.entitiesMenu.addButton(this.removeEntityEntryBtn);
    
    $(this.entitiesMenu.element).on('click', () => {
      this.perform(
        Action.Type.ENTITY_SELECT,
        this.getSelectedEntity(),
        false
      );
    });
  }
  
  reset() {
    this.entitiesMenu.clear();
  }
  
  addEntityEntry() {
    console.log("Add Entity");
  }
  
  removeEntityEntry() {
    console.log("Remove Entity");
  }
  
  addEntity(entity) {
    let menuItem = new MenuItem(entity.name, entity);
    this.entitiesMenu.append(menuItem);
  }
  
  getSelectedEntity() {
    return this.entitiesMenu.getLastSelected();
  }
}

module.exports = EntityView;