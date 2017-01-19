"use strict";

const $             = wfl.jquery;
const SubwindowView = require('./SubwindowView');
const CssClasses    = require('../CssClasses');
const scenes        = require('../scenes');

class WorldView extends SubwindowView {
  constructor() {
    super();
    
    this.canvas    = $('<canvas>')[0];
    this.canvas.id = CssClasses.WORLD_CANVAS;
    this.wflGame   = wfl.create(this.canvas);
    
    this.worldEditorScene = new scenes.WorldEditorScene(
      this.canvas,
      this.wflGame.mouse,
      this.wflGame.keyboard
    );
    this.wflGame.setScene(this.worldEditorScene);
    
    this.element = $(this.canvas);
  }
  
  resize(e) {
    let parent  = this.element.parent().parent();
    let toolbar = parent.find('.' + CssClasses.SUBWINDOW_TOOLBAR);
    
    let style   = window.getComputedStyle(parent[0], null);
    let width   = parseInt(style.getPropertyValue("width"));
    let height  = parseInt(style.getPropertyValue("height"));
    let padding = parseInt(style.getPropertyValue("padding"));

    this.canvas.width  = width  - padding * 2;
    this.canvas.height = height - padding * 2 - toolbar.outerHeight();
  }
}

module.exports = WorldView;