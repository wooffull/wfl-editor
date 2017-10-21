'use strict';

const {ipcRenderer} = require('electron');

const $             = wfl.jquery;
const {Keyboard}    = wfl.input;
const WflEditor     = require('./scripts/WflEditor');
const {remote}      = require('electron');
const {Menu,
       MenuItem}    = remote;

// Create a new WFL Editor when the window loads
let editor;
$(window).on('load', () => {
  editor = new WflEditor();
  
  $(editor).on('history-update', (e, lastChanged) => ipcRenderer.send('history-update', lastChanged));
});

// Prevent highlighting elements when dragging on UI
$('.ui-element-container').on('mousedown', (e) => {
  // TODO: Is this needed? With it, input text fields don't work properly
  /*
  if (e.stopPropagation) e.stopPropagation();
  if (e.preventDefault)  e.preventDefault();
  e.cancelBubble = true;
  e.returnValue  = false;
  return false;
  */
});

$('.app-icon').on('click', (e) => {
  
});

$('.close').on('click',    (e) => {
  if (typeof e.which === "undefined" || e.which === 1) {
    ipcRenderer.send('window-close');
  }
});
$('.minimize').on('click', (e) => {
  if (typeof e.which === "undefined" || e.which === 1) {
    ipcRenderer.send('window-minimize');
  }
});
$('.maximize').on('click', (e) => {
  if (typeof e.which === "undefined" || e.which === 1) {
    ipcRenderer.send('window-maximize');
  }
});


// Listener for when project updates are received
ipcRenderer.on('project-new-finalize', (e, project) => {
  $('#project-title').html('untitled');
  editor.reset(project);
});

ipcRenderer.on('project-save-finalize', (e, project) => {
  $('#project-title').html(project.title);
  editor.onProjectUpdateSaved(project);
});

ipcRenderer.on('project-load-finalize', (e, project) => {
  $('#project-title').html(project.title);
  
  // First, reset all tools so that updates don't also need to reset data
  editor.reset(project);
  
  // Then update the tools
  editor.onProjectUpdateLoaded(project);
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

// Key Shortcuts:
let lastPressed = -1;
$(Keyboard).on('keypressed', (e) => {
  let justPressed = Keyboard.getKeyJustPressed();
  if (justPressed !== -1 && justPressed !== lastPressed) {
    lastPressed = justPressed;
  }
  
  if (Keyboard.isPressed(Keyboard.CONTROL)) {
    switch (lastPressed) {
      // CTRL+A: Select all entities
      case Keyboard.A:
        editor.worldTool.selectAllEntities();
        break;
        
      case Keyboard.S:
        // CTRL+SHIFT+S: Save project as...
        if (Keyboard.isPressed(Keyboard.SHIFT)) {
          ipcRenderer.send('project-save-as');
          
        // CTRL+S: Save project
        } else {
          ipcRenderer.send('project-save'); 
        }
        Keyboard.clear();
        break;

      // CTRL+N: New project
      case Keyboard.N:
        ipcRenderer.send('project-new');
        Keyboard.clear();
        break;

      // CTRL+O: Open project
      case Keyboard.O:
        ipcRenderer.send('project-load');
        Keyboard.clear();
        break;

      // CTRL+Z: Undo last action
      case Keyboard.Z:
        editor.historyTool.undo();
        break;

      // CTRL+Y: Redo last action
      case Keyboard.Y:
        editor.historyTool.redo();
        break;

      // CTRL+Q: Quit program
      case Keyboard.Q:
        ipcRenderer.send('window-close');
        break;
      
      // CTRL+E: Export game
      case Keyboard.E:
        ipcRenderer.send('game-export');
        Keyboard.clear();
        break;
    }
  } else {
    // DELETE: Removes all currently selected game objects
    if (lastPressed === Keyboard.DELETE) {
      if (editor.worldTool.element.hasClass('selected')) {
        editor.worldTool.removeSelection();
      }
    }
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
    accelerator: 'Ctrl+O',
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
    accelerator: 'Ctrl+E',
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
    accelerator: 'CommandOrControl+Z',
    //role: 'undo',
    click: () => editor.historyTool.undo()
  },
  {
    label: 'Redo',
    accelerator: 'CommandOrControl+Y',
    //role: 'redo',
    click: () => editor.historyTool.redo()
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
  
  if (typeof e.which === "undefined" || e.which === 1) {
    fileMenu.popup(remote.getCurrentWindow());
  }
});

$('#menu-edit').on('click', (e) => {
  e.preventDefault();
  
  if (typeof e.which === "undefined" || e.which === 1) {
    editMenu.popup(remote.getCurrentWindow());
  }
});

$('#menu-help').on('click', (e) => {
  e.preventDefault();
  
  if (typeof e.which === "undefined" || e.which === 1) {
    helpMenu.popup(remote.getCurrentWindow());
  }
});