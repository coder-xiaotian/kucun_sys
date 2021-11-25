const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isPro = process.env.NODE_ENV !== 'development';
function renderWindow() {
  const mainWindow = new BrowserWindow({
    width: 750,
    height: 550,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      // preload: path.resolve(__dirname, 'preload.js')
    },
  });

  if (isPro) {
    mainWindow.loadURL(
      require('url').format({
        pathname: path.join(__dirname, 'build/index.html'),
        protocol: 'file:',
        slashes: true,
      }),
    );
  } else {
    mainWindow.loadURL('http://localhost:8000/');
    // 打开开发者工具，默认不打开
    mainWindow.webContents.openDevTools();
  }

  ipcMain.on('read-laihuo-excel', async (evt) => {
    const { filePaths } = await dialog.showOpenDialog({
      filters: [
        {
          name: 'Excel',
          extensions: ['xlsx'],
        },
      ],
    });
    evt.reply(
      'read-laihuo-success',
      filePaths[0],
      fs.readFileSync(filePaths[0]),
    );
  });
  ipcMain.on('read-fahuo-excel', async (evt) => {
    const { filePaths } = await dialog.showOpenDialog({
      filters: [
        {
          name: 'Excel',
          extensions: ['xlsx'],
        },
      ],
    });
    evt.reply(
      'read-fahuo-success',
      filePaths[0],
      fs.readFileSync(filePaths[0]),
    );
  });
}

app.whenReady().then(() => {
  renderWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) renderWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') return;

  app.quit();
});
