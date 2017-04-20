'use strict';

const {ipcRenderer} = require('electron');

const $                = wfl.jquery;
const WflEditor        = require('./scripts/WflEditor');
const {remote}         = require('electron');
const {Menu, MenuItem} = remote;

// Create a new WFL Editor when the window loads
let editor;
$(window).on('load', () => {
  editor = new WflEditor();
  
  $(editor).on('history-update', (e, lastChanged) => ipcRenderer.send('history-update', lastChanged));
});

// Prevent highlighting elements when dragging on UI
$('.ui-element-container').on('mousedown', (e) => {
  if (e.stopPropagation) e.stopPropagation();
  if (e.preventDefault)  e.preventDefault();
  e.cancelBubble = true;
  e.returnValue  = false;
  return false;
});

$('.app-icon').on('click', (e) => {
  
});

$('.close').on('click',    () => ipcRenderer.send('window-close'));
$('.minimize').on('click', () => ipcRenderer.send('window-minimize'));
$('.maximize').on('click', () => ipcRenderer.send('window-maximize'));


// Listener for when project updates are received
ipcRenderer.on('project-new-finalize', (e, project) => {
  $('#project-title').html('untitled');
  editor.reset(project);
});

ipcRenderer.on('project-save-finalize', (e, project) => {
  $('#project-title').html(project.title);
  editor.projectUpdate(project);
});

ipcRenderer.on('project-load-finalize', (e, project) => {
  $('#project-title').html(project.title);
  editor.reset(project);
  editor.projectUpdate(project);
});

ipcRenderer.on('project-altered', (e, project, altered) => {
  let prefix = altered ? '*' : '';
  if (!project.title) project.title = 'untitled';
  $('#project-title').html(prefix + project.title);
});

// Listener for when project data is requested externally from the main process
// (i.e. when saving)
ipcRenderer.on('request-project-data', (e, nextEvent) => {
  let projectData = editor.getData();
  
  if (nextEvent) {
    ipcRenderer.send(nextEvent, projectData);
  }
});

// Create context menus
const fileMenuTemplate = [
  {
    label: 'New Project',
    accelerator: 'Ctrl+N',
    role: 'new',
    click: () => ipcRenderer.send('project-new')
  },
  {
    label: 'Open...',
    role: 'open',
    click: () => ipcRenderer.send('project-load')
  },
  {
    label: 'Save',
    accelerator: 'Ctrl+S',
    role: 'save',
    click: () => ipcRenderer.send('project-save')
  },
  {
    label: 'Save As...',
    accelerator: 'Ctrl+Shift+S',
    role: 'save as',
    click: () => ipcRenderer.send('project-save-as')
  },
  {
    type: 'separator'
  },
  {
    label: 'Export Game',
    role: 'export',
    click: () => ipcRenderer.send('game-export')
  },
  {
    type: 'separator'
  },
  {
    label: 'Exit',
    accelerator: 'Ctrl+Q',
    role: 'exit',
    click: () => ipcRenderer.send('window-close')
  }
];

const editMenuTemplate = [
  {
    label: 'Undo',
    accelerator: 'Ctrl+Z',
    role: 'undo'
  },
  {
    label: 'Redo',
    accelerator: 'Ctrl+Y',
    role: 'redo'
  },
  {
    type: 'separator'
  },
  {
    label: 'Cut',
    accelerator: 'Ctrl+X',
    role: 'cut'
  },
  {
    label: 'Copy',
    accelerator: 'Ctrl+C',
    role: 'copy'
  },
  {
    label: 'Paste',
    accelerator: 'Ctrl+V',
    role: 'paste'
  }
];

const helpMenuTemplate = [
  {
    label: 'About WFL',
    role: 'about'
  },
  {
    label: 'Report Bug',
    role: 'report'
  }
];

const fileMenu = Menu.buildFromTemplate(fileMenuTemplate);
const editMenu = Menu.buildFromTemplate(editMenuTemplate);
const helpMenu = Menu.buildFromTemplate(helpMenuTemplate);

$('#menu-file').on('click', (e) => {
  e.preventDefault();
  fileMenu.popup(remote.getCurrentWindow());
});

$('#menu-edit').on('click', (e) => {
  e.preventDefault();
  editMenu.popup(remote.getCurrentWindow());
});

$('#menu-help').on('click', (e) => {
  e.preventDefault();
  helpMenu.popup(remote.getCurrentWindow());
});