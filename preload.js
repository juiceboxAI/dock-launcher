const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('dock', {
  resizeWindow: (width, height) => ipcRenderer.send('resize-window', { width, height }),
  moveWindow: (x, y) => ipcRenderer.send('move-window', { x, y }),
  launch: (command) => ipcRenderer.send('launch', command),
  loadConfig: () => ipcRenderer.invoke('load-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  openSettings: () => ipcRenderer.send('open-settings'),
  extractIcon: (exePath) => ipcRenderer.invoke('extract-icon', exePath),
  onConfigUpdated: (callback) => ipcRenderer.on('config-updated', () => callback())
});
