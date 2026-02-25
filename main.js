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
    alwaysOnTop: false,
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

  // Clamp window position to screen bounds
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const [wx, wy] = mainWindow.getPosition();
  const clampedX = Math.min(Math.max(0, wx), sw - COLLAPSED_SIZE);
  const clampedY = Math.min(Math.max(0, wy), sh - COLLAPSED_SIZE);
  mainWindow.setPosition(clampedX, clampedY);
}

// IPC: set mouse event passthrough for transparent areas
ipcMain.on('set-ignore-mouse', (event, { ignore, forward }) => {
  if (mainWindow) {
    mainWindow.setIgnoreMouseEvents(ignore, { forward: forward || false });
  }
});

// IPC: resize window from renderer
ipcMain.on('resize-window', (event, { width, height }) => {
  if (mainWindow) {
    mainWindow.setSize(Math.round(width), Math.round(height));
  }
});

// IPC: move window position (for manual drag)
ipcMain.on('move-window', (event, { x, y }) => {
  if (mainWindow) {
    mainWindow.setPosition(Math.round(x), Math.round(y));
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
  // Notify main dock window to reload config
  if (mainWindow) {
    mainWindow.webContents.send('config-updated');
  }
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
ipcMain.handle('extract-icon', async (event, filePath) => {
  return new Promise((resolve) => {
    const escapedPath = filePath.replace(/'/g, "''");
    const ps = `Add-Type -AssemblyName System.Drawing; $icon = [System.Drawing.Icon]::ExtractAssociatedIcon('${escapedPath}'); if ($icon) { $bmp = $icon.ToBitmap(); $ms = New-Object System.IO.MemoryStream; $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png); [Convert]::ToBase64String($ms.ToArray()) }`;
    exec(`powershell.exe -NoProfile -Command "${ps}"`,
      { maxBuffer: 1024 * 1024, timeout: 5000 },
      (err, stdout) => {
        if (err || !stdout.trim()) {
          resolve(null);
          return;
        }
        resolve('data:image/png;base64,' + stdout.trim());
      }
    );
  });
});

app.whenReady().then(() => {
  createWindow();
});
app.on('window-all-closed', () => app.quit());
