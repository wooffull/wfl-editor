"use strict";

const Popup               = require('./Popup');
const AddNewBehaviorPopup = require('./AddNewBehaviorPopup');

module.exports = {
  Popup:               Popup,
  AddNewBehaviorPopup: AddNewBehaviorPopup,
  
  Type: {
    ADD_NEW_BEHAVIOR: AddNewBehaviorPopup
  }
};