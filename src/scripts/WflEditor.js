"use strict";

const $           = wfl.jquery;
const {Subwindow} = require('./ui');
const tools       = require('./tools');

class WflEditor {
  constructor() {
    // Create tools
    this.toolBarTool = new tools.ToolBarTool();
    this.entityTool  = new tools.EntityTool();
    this.worldTool   = new tools.WorldTool();
    this.layerTool   = new tools.LayerTool();
    
    // Set up listeners for tools
    $(this.toolBarTool.subwindowView).on('icon-click', (e, toolData) => {
      let scene = this.worldTool.subwindowView.worldEditorScene;
      scene.tool = new toolData.classReference(scene);
    });
    
    $(this.entityTool.subwindowView).on('entity-select', (e, entity) => {
      let scene = this.worldTool.subwindowView.worldEditorScene;
      scene.curEntity = entity;
    });
    
    // Create subwindows
    this.toolSubwindow = new Subwindow();
    this.toolSubwindow.element[0].id = 'tool-bar-subwindow';
    this.toolSubwindow.addTool(this.toolBarTool);
    
    this.componentSubwindow = new Subwindow();
    this.componentSubwindow.element[0].id = 'component-subwindow';
    this.componentSubwindow.addTool(this.entityTool);
    
    this.primarySubwindow = new Subwindow();
    this.primarySubwindow.element[0].id = 'world-subwindow';
    this.primarySubwindow.addTool(this.worldTool);
    
    this.secondarySubwindow = new Subwindow();
    this.secondarySubwindow.element[0].id = 'layer-subwindow';
    this.secondarySubwindow.addTool(this.layerTool);
    
    $('#subwindow-container').append(this.toolSubwindow.element);
    $('#subwindow-container').append(this.componentSubwindow.element);
    $('#subwindow-container').append(this.primarySubwindow.element);
    $('#subwindow-container').append(this.secondarySubwindow.element);
    
    this.subwindows = [];
    this.subwindows.push(this.toolSubwindow);
    this.subwindows.push(this.componentSubwindow);
    this.subwindows.push(this.primarySubwindow);
    this.subwindows.push(this.secondarySubwindow);
    
    // Resize main editor's canvas when window resizes
    $(window).on("resize", () => this.onResize());

    // Give canvas its initial size
    this.onResize();
  }
  
  onResize(e) {
    for (const subwindow of this.subwindows) {
      subwindow.resize(e);
    }
  }
}

module.exports = WflEditor;
