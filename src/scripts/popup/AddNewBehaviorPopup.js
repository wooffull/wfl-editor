"use strict";

const {Action,
       ActionPerformer} = require('../action');
const Popup             = require('./Popup');
const CssClass          = require('../CssClasses');
const behaviors         = require('../behaviors');
const {Menu,
       MenuItem,
       Button}          = require('../ui');

class AddNewBehaviorPopup extends Popup {
  constructor() {
    super();
    
    this.behaviorsMenu = new Menu('Add New Behavior');
    
    this.btnContainer  = $('<span>');
    this.addBtn        = new Button('Add');
    this.cancelBtn     = new Button('Cancel');
    
    this.popup.addClass(CssClass.ADD_NEW_BEHAVIOR_POPUP);
    this.btnContainer.addClass(CssClass.BUTTON_CONTAINER);
    
    this.popup.append(this.behaviorsMenu.element);
    this.popup.append($('<br>'));
    
    this.btnContainer.append(this.addBtn.element);
    this.btnContainer.append(this.cancelBtn.element);
    this.popup.append(this.btnContainer);
    
    $(this.cancelBtn).on('click', () => this.close());
    
    $(this.addBtn).on('click', () => this.addSelectedBehavior());
    
    // TODO: Update behaviors displayed when FileExplorerView updates
    let loadedBehaviors = behaviors.getLoadedBehaviors();
    let behaviorNames   = Object.keys(loadedBehaviors);
    
    for (let key of behaviorNames) {
      let behavior = loadedBehaviors[key];
      this._addBehaviorMenuItem(behavior);
    }
  }
  
  addSelectedBehavior() {
    let menuItem = this.behaviorsMenu.getLastSelected();
    let data     = {
      behaviorData: menuItem.data.clone()
    };
    
    ActionPerformer.do(
      Action.Type.PROPERTY_ADD_BEHAVIOR,
      data
    );
  }
  
  _addBehaviorMenuItem(behavior) {
    let menuItem = new MenuItem(behavior.name, behavior);
    this.behaviorsMenu.append(menuItem);
  }
}

module.exports = AddNewBehaviorPopup;