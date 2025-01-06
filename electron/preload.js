const { contextBridge, ipcRenderer } = require('electron');

// Expose functionality to renderer
contextBridge.exposeInMainWorld('electronAPI', {
    onLoginSuccess: () => ipcRenderer.send('login-success'),
});
