const { app, BrowserWindow, ipcMain, Notification} = require('electron');
const path = require('path');
const { setInterval } = require('timers/promises');
const {autoUpdater} = require('electron-updater')
const ipc = ipcMain

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    resizable: false,
    icon: './src/images/legends.png',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      devTools: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });

  autoUpdater.on('update-available', () => {
    mainWindow.webContents.send('update_available');
  });
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update_downloaded');
  });

  ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
  });

  // setInterval(() => {
  //   console.log('adding icon..')
  //   mainWindow.setOverlayIcon('./src/images/1.png', 'A tool that notifies you whenever theres a war.')
  // },3000)

  ipc.on('appclose', () => {
    mainWindow.close()
  })

  ipc.on('notify', ()=>{
    new Notification({
      title: 'Call for war!',
      subtitle: 'Hey member, theres a war going on!',
      body: 'Check the #war-pings channel',
      silent: false,
      icon: './src/images/legends.png',
      hasReply: true,  
      timeoutType: 'never',
      urgency: 'critical',
      closeButtonText: 'Close Button'
    }).show()
  })

  ipc.on('enable-icon', () => {
    mainWindow.setOverlayIcon('./src/images/1.png', 'A tool that notifies you whenever theres a war.')
  })

  ipc.on('disable-icon', () => {
    mainWindow.setOverlayIcon(null,"")
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
