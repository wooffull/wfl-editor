"use strict";

const $                 = wfl.jquery;
const SubwindowView     = require('./SubwindowView');
const CssClass          = require('../CssClasses'); 
const {InputText,
       MenuItem,
       MenuButton}      = require('../ui');
const {Action,
       ActionPerformer} = require('../action');

class ProjectSettingsView extends SubwindowView {
  constructor() {
    super();
    
    this.label = $("<div>").html("Project Settings");
    this.label.addClass(CssClass.MENU_LABEL);
    
    this.element.append(this.label);
    
    this.reset();
  }
  
  reset() {
  }
}

module.exports = ProjectSettingsView;