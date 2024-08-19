import { app, BrowserWindow, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'path';
import * as fs from 'fs';

import { MPVController } from '../src/data/objects/MPVController';

import propertiesReader from 'properties-reader';
import { MovieDb } from 'moviedb-promise';

// Leer el archivo de propiedades
const properties = propertiesReader('keys.properties');

// Obtener la clave API
const apiKey = properties.get('TMDB_API_KEY');

if (apiKey) {
    const moviedb = new MovieDb(String(apiKey));

    if (!moviedb)
      console.error('This App needs an API Key from TheMovieDB');
} else {
    console.error('This App needs an API Key from TheMovieDB');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

let win: BrowserWindow | null;
let controlsWindow: BrowserWindow | null;
let mpvController: MPVController | null = null;

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
    fs.writeFileSync(jsonFilePath, JSON.stringify(newData), 'utf8');
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
    alwaysOnTop: false,
    icon: "./src/assets/icon.ico",
    frame: false, // Quita la barra de título del sistema operativo
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      offscreen: false,  // Para evitar la renderización offscreen si no es necesario
      webgl: true,       // Habilitar WebGL
      webSecurity: false,
      plugins: true
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

  /*const mpvPath = path.join(__dirname, '../src/mpv/win/test/mpv.exe');
  const videoPath = path.join(__dirname, '../src/test.mkv');

  console.log(mpvPath);

  const mpv = new MPV({
    "audio_only": false,
    "verbose": true,
  });

  mpv.load(videoPath); // Reemplaza con la ruta a tu vídeo
  mpv.play();

  mpv.on('statuschange', (status) => {
    console.log('Cambio de estado en MPV:', status);
  });

  mpv.on('error', (err) => {
    console.error('Error en MPV:', err);
  });*/
}

// Crear una ventana de controles
function createControlWindow() {
  controlsWindow = new BrowserWindow({
    parent: win!,
    width: win?.getBounds().width,
    height: win?.getBounds().height,
    minWidth: 720,
    minHeight: 400,
    alwaysOnTop: false,
    icon: "./src/assets/icon.ico",
    transparent: true,
    frame: false,
    hasShadow: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true
    }
  });

  controlsWindow.loadFile(path.join(__dirname, '../controls.html'));

  // Mantener el tamaño y posición sincronizados con la ventana principal
  if (win) {
    win.setBounds(controlsWindow.getBounds());
    win.on('resize', () => {
      if (win)
        win.setBounds(controlsWindow!.getBounds());
    });
    win.on('move', () => {
      if (win)
        win.setBounds(controlsWindow!.getBounds());
    });
  }

  controlsWindow.on('closed', () => {
    controlsWindow = null;
  });
}

ipcMain.on('play-video', (_event, videoSrc) => {
  if (!mpvController)
    mpvController = new MPVController(win!);

  mpvController.startMPV(videoSrc);
  //createControlWindow();
  win?.webContents.send('video-playing');
});

ipcMain.on('stop-video', () => {
  if (mpvController) {
    mpvController.stop();
    controlsWindow?.close();
    win?.webContents.send('video-stopped');
  }
});

ipcMain.on('mpv-command', (_event, command, args) => {
  if (mpvController) {
    mpvController.sendCommand(command, args);
  }
});

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

ipcMain.handle('window-is-maximized', async () => {
  return win?.isMaximized();
});

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

app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.disableHardwareAcceleration(); 

app.whenReady().then(createWindow)