const { app, BrowserWindow, ipcMain, shell, screen } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');

const CONFIG_PATH = path.join(__dirname, 'dock-config.json');
const COLLAPSED_SIZE = 48;

let mainWindow;

function createWindow() {
  const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: COLLAPSED_SIZE,
    height: COLLAPSED_SIZE,
    x: screenWidth - COLLAPSED_SIZE - 20,
    y: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile('renderer/index.html');
  mainWindow.setVisibleOnAllWorkspaces(true);
}

// IPC: resize window from renderer
ipcMain.on('resize-window', (event, { width, height }) => {
  if (mainWindow) {
    mainWindow.setSize(Math.round(width), Math.round(height));
  }
});

// IPC: launch a shortcut
ipcMain.on('launch', (event, { action, target }) => {
  switch (action) {
    case 'openPath':
      shell.openPath(target);
      break;
    case 'openExternal':
      shell.openExternal(target);
      break;
    case 'exec':
      exec(target, { windowsHide: false });
      break;
  }
});

// IPC: load config
ipcMain.handle('load-config', () => {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    return { categories: [] };
  }
});

// IPC: save config
ipcMain.handle('save-config', (event, config) => {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
});

// IPC: open settings window
let settingsWindow = null;
ipcMain.on('open-settings', () => {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }
  settingsWindow = new BrowserWindow({
    width: 500,
    height: 600,
    frame: true,
    transparent: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  settingsWindow.loadFile('settings/settings.html');
  settingsWindow.on('closed', () => { settingsWindow = null; });
});

// IPC: get icon for exe (returns base64 data URL or null)
ipcMain.handle('extract-icon', async (event, exePath) => {
  // Placeholder — Task 8 will implement real icon extraction
  return null;
});

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
