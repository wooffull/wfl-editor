"use strict";

const $                 = wfl.jquery;
const {Subwindow}       = require('./ui');
const {Action,
       ActionPerformer} = require('./action');
const tools             = require('./tools');

class WflEditor {
  constructor() {
    // Create tools
    this.toolBarTool         = new tools.ToolBarTool();
    this.fileExplorerTool    = new tools.FileExplorerTool();
    this.entityTool          = new tools.EntityTool();
    this.historyTool         = new tools.HistoryTool();
    this.worldTool           = new tools.WorldTool();
    this.layerTool           = new tools.LayerTool();
    this.propertiesTool      = new tools.PropertiesTool();
    this.projectSettingsTool = new tools.ProjectSettingsTool();
    
    // Ordered in terms of which should be reset first
    this.tools = [];
    this.tools.push(this.historyTool);
    this.tools.push(this.toolBarTool);
    this.tools.push(this.fileExplorerTool);
    this.tools.push(this.entityTool);
    this.tools.push(this.worldTool);
    this.tools.push(this.layerTool);
    this.tools.push(this.propertiesTool);
    this.tools.push(this.projectSettingsTool);
    
    // Set up listeners for Actions
    $(ActionPerformer).on(Action.Event.DEFAULT, (e, action) => {
      if (action.state === Action.State.IN_PROGRESS) {
        for (let tool of this.tools) {
          tool.parseAction(action);
        }
        
        // If the action's state hasn't changed, it can be treated
        // as COMPLETED
        if (action.state === Action.State.IN_PROGRESS) {
          action.state = Action.State.COMPLETED;
        }
      }
      
      if (action.state === Action.State.COMPLETED) {
        if (action.reversable && action.direction === Action.Direction.DEFAULT) {
          this.historyTool.addAction(action);
        }

        if (action.reversable || action.direction !== Action.Direction.DEFAULT) {
          $(this).trigger(
            'history-update',
            this.historyTool.subwindowView.getLastChangedTime()
          );
        }
      }
    });
    
    // Create subwindows
    this.toolSubwindow = new Subwindow();
    this.toolSubwindow.element[0].id = 'tool-bar-subwindow';
    this.toolSubwindow.addTool(this.toolBarTool);
    
    this.componentSubwindow = new Subwindow();
    this.componentSubwindow.element[0].id = 'component-subwindow';
    this.componentSubwindow.addTool(this.fileExplorerTool);
    this.componentSubwindow.addTool(this.entityTool);
    this.componentSubwindow.addTool(this.propertiesTool);
    this.componentSubwindow.addTool(this.projectSettingsTool);
    this.componentSubwindow.addTool(this.historyTool);
    
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
    this.reset();
  }
  
  reset() {
    for (const tool of this.tools) {
      tool.reset();
    }
  }
  
  onResize(e) {
    for (const subwindow of this.subwindows) {
      subwindow.resize(e);
    }
  }
  
  onProjectUpdateSaved(project) {
    // Only update the file explorer tool
    this.fileExplorerTool.onProjectUpdate(project);
  }
  
  onProjectUpdateLoaded(project) {
    // Update all tools
    for (const tool of this.tools) {
      tool.onProjectUpdate(project);
    }
  }
  
  getData() {
    let project = {};
    
    for (const tool of this.tools) {
      let toolData = tool.getData();
      Object.assign(project, toolData);
    }
    
    return project;
  }
}

module.exports = WflEditor;
