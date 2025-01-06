const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const windowsState = require('electron-window-state');

let mainWindow;

// Function to create the main window
function createWindow() {
    const winState = windowsState({
        defaultWidth: 800,
        defaultHeight: 600,
    });

    mainWindow = new BrowserWindow({
        width: winState.width,
        height: winState.height,
        x: winState.x,
        y: winState.y,
        show: false, // Start hidden, show after ready-to-show
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true, // Isolate context for security
            nodeIntegration: false, // Disable Node.js integration in renderer
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    // Manage window state
    winState.manage(mainWindow);

    // Load the login page first
    loadPage('login.html');

    // Show the window when it's ready
    mainWindow.once('ready-to-show', () => mainWindow.show());
}

// Helper function to load pages
function loadPage(fileName) {
    const filePath = path.join(__dirname, 'public', fileName);
    console.log('Loading file:', filePath); // Debug log to check if the path is correct
    mainWindow.loadFile(filePath).catch((err) => {
        console.error(`Error loading ${fileName}:`, err.message);
    });
}

// Listen for login success from renderer process
ipcMain.on('login-success', () => {
    console.log("Login successful, loading user page...");
    loadPage('user.html');
});

// App lifecycle events
app.whenReady().then(() => {
    createWindow();

    // macOS: Recreate a window when the dock icon is clicked and no windows are open
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Close app when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
