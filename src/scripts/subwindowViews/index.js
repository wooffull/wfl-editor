"use strict";

const SubwindowView       = require('./SubwindowView');
const EntityView          = require('./EntityView');
const HistoryView         = require('./HistoryView');
const WorldView           = require('./WorldView');
const ToolBarView         = require('./ToolBarView');
const LayerView           = require('./LayerView');
const PropertiesView      = require('./PropertiesView');
const FileExplorerView    = require('./FileExplorerView');
const ProjectSettingsView = require('./ProjectSettingsView');

module.exports = {
  SubwindowView:       SubwindowView,
  EntityView:          EntityView,
  HistoryView:         HistoryView,
  WorldView:           WorldView,
  ToolBarView:         ToolBarView,
  LayerView:           LayerView,
  PropertiesView:      PropertiesView,
  FileExplorerView:    FileExplorerView,
  ProjectSettingsView: ProjectSettingsView
};