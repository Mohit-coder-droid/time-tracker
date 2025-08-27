// In main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('better-sqlite3');

// Define the database connection.
// This will create the file 'my_database.db' in a user-safe location.
const dbPath = path.join(app.getPath('userData'), 'my_database.db');
const db = new Database(dbPath);

// Create a table for your data if it doesn't exist.
// Run this once to set up your structure.
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  )
`);

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // This is where we attach our 'waiter' script
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // Load your React app. 
  // Make sure the URL is correct for your setup (often http://localhost:3000)
  win.loadURL('http://localhost:3000'); 
}

// === LISTENER FOR YOUR REACT APP ===
// This is the 'kitchen' receiving an order from the 'waiter'
ipcMain.handle('db:getAllItems', () => {
  const stmt = db.prepare('SELECT * FROM items');
  const items = stmt.all();
  return items;
});

app.whenReady().then(createWindow);