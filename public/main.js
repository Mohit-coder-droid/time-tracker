import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url'; // Helper for file paths

// __dirname is not available in ES Modules, so we create it
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1536 ,
    height: 864,
  });

  // Load your React app.
  // In development, it loads from the dev server.
  // In production, it loads the built HTML file.
  const startUrl = process.env.ELECTRON_START_URL || new URL(path.join(__dirname, '../dist/index.html'), 'file:').href;
  win.loadURL(startUrl);

  // Optional: Open the DevTools for debugging.
  // win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});