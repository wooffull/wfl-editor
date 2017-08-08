"use strict";

const Tool           = require('./Tool');
const {Action}       = require('../action');
const subwindowViews = require('../subwindowViews');

class ProjectSettingsTool extends Tool {
  constructor() {
    super('settings', new subwindowViews.ProjectSettingsView());
  }
}

module.exports = ProjectSettingsTool;