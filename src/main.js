const electron = require('electron');

// Module to control application life.
const {app} = electron;

// Module to create native browser window.
const {BrowserWindow} = electron;

// Module to handling sending and receiving messages between render and main
// processes
const {ipcMain} = electron;

const file = require('./scripts/file');




// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    backgroundColor: '#333333',
    icon: './src/media/icon.png'
  });
  
  win.setMinimumSize(720, 540);
  win.maximize();

  // and load the index.html of the app.
  win.loadURL(`file://${__dirname}/index.html`);

  // Open the DevTools.
  win.webContents.openDevTools();
  
  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });
  
  // Create a new project on start-up
  file.Project.reset(win);
}




// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});




// Set up listeners on renderer
ipcMain.on('window-close', () => {
  file.Project.confirmSavedChanges(() => win.close());
});

ipcMain.on('window-minimize', () => {
  win.minimize();
});

ipcMain.on('window-maximize', () => {
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();   
  }
});

ipcMain.on('project-new', () => {
  file.Project.reset(win);
});

ipcMain.on('project-save', () => {
  file.Project.save();
});

ipcMain.on('project-save-as', () => {
  file.Project.saveAs();
});

ipcMain.on('project-load', () => {
  file.Project.load();
});

ipcMain.on('history-update', (e, time) => {
  // When time is sent from ipcRenderer as undefined, it's forced to null,
  // so switch it back for consistency
  if (!time) time = undefined;
  file.Project.updateHistory(time);
});

ipcMain.on('game-export', () => {
});