// Modules to control application life and create native browser window
const electron = require('electron');
const path = require('path');
const {globalShortcut} = require('electron');
const {app, BrowserWindow, Tray, Menu } = electron;
const {registerGlobalShortcuts, unregisterGlobalShortcuts} = require('./src/shortcutActions');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let tray = null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 210,
    height: 80,
    // https://stackoverflow.com/a/31538436
    // icon: path.join(__dirname, 'src/icons/png/64x64.png'),
    webPreferences: {
      nodeIntegration: true
    },
    // transparent: true,
    frame: false,
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('ready', registerGlobalShortcuts)

app.on('ready', function () {
  tray = new Tray(path.join(__dirname, 'src/icons/png/16x16.png'));
  // const contextMenu = Menu.buildFromTemplate([
  //   {label: 'Item1', type: 'radio'},
  //   {label: 'Item2', type: 'radio'},
  //   {label: 'Item3', type: 'radio', checked: true},
  //   {label: 'Item4', type: 'radio'}
  // ])
  // tray.setToolTip('This is my application.');
  // tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    mainWindow.focus();
    console.warn('clicked on tray');
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', unregisterGlobalShortcuts);

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
