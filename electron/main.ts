import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import * as fs from 'fs';

const MovieDB = require('moviedb-promise');
require('dotenv').config();

const THEMOVIEDB_API_KEY = process.env.TheMovieDBAPI;
const moviedb = new MovieDB(THEMOVIEDB_API_KEY);

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

let win: BrowserWindow | null

const jsonFilePath = "./src/data/data.json";

// Read data from JSON
const loadData = (): any => {
  try {
    const data = fs.readFileSync(jsonFilePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading data.json:", err);
    return [];
  }
};

// Save data in JSON
const saveData = (newData: any) => {
  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(newData, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error("Error saving data:", err);
    return false;
  }
};

function createWindow() {
  win = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 720,
    minHeight: 400,
    icon: "./src/assets/icon.ico",
    frame: false, // Quita la barra de título del sistema operativo
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true
    },
  })

  // Quitar el menú de la aplicación
  win.removeMenu()

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Process comunication for library data
ipcMain.handle('get-library-data', async () => {
  return loadData();
});

ipcMain.handle('save-library-data', async (_event, newData) => {
  return saveData(newData);
});

// Listen events to control window states
ipcMain.on('minimize-window', () => {
  win?.minimize()
})

ipcMain.on('maximize-window', () => {
  if (win?.isMaximized()) {
    win?.unmaximize()
  } else {
    win?.maximize()
  }
})

ipcMain.on('close-window', () => {
  win?.close()
})

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)