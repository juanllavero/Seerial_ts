import { app, BrowserWindow, ipcMain, Rectangle, screen } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'path';
import * as fs from 'fs';

import { MPVController } from '../src/data/objects/MPVController';
import propertiesReader from 'properties-reader';

import { MovieDb } from 'moviedb-promise';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

//#region LOCALIZATION
i18next
  .use(Backend)
  .init({
    fallbackLng: 'en',
    supportedLngs: ['en', 'es', 'de', 'fr', 'it'],
    backend: {
      loadPath: './src/locales/{{lng}}.json',
    },
});

// Manejar solicitudes de traducción desde las ventanas renderizadas
ipcMain.handle('translate', (_event, key) => {
  return i18next.t(key);
});
//#endregion

//#region PROPERTIES AND DATA READING

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

//#endregion

//#region WINDOWS CREATION
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  
  const windowWidth = Math.floor(width * 0.7);
  const windowHeight = Math.floor(height * 0.8);

  win = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    minWidth: 720,
    minHeight: 400,
    alwaysOnTop: false,
    transparent: false,
    titleBarStyle: 'hidden',
    icon: "./src/assets/icon.ico",
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      webSecurity: false,
      plugins: true
    },
  })

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.on('maximize', () => {
    win?.webContents.send('window-state-change', 'maximized');
  });

  win.on('unmaximize', () => {
    win?.webContents.send('window-state-change', 'restored');
  });

  win.once('ready-to-show', () => {
    win?.show()
  })

  mpvController = new MPVController(win!);
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
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: true,
      webSecurity: false,
      plugins: true
    }
  });

  if (VITE_DEV_SERVER_URL) {
    controlsWindow.loadURL(path.join(VITE_DEV_SERVER_URL, 'controls'))
  } else {
    controlsWindow.loadFile(path.join(RENDERER_DIST, '../controls.html'))
  }  

  // Adjust the size of the two windows to be the same
  if (win)
    controlsWindow.setBounds(win.getBounds());

  win?.on('resize', () => {
    if (win)
      controlsWindow?.setBounds(win.getBounds());
  });

  win?.on('move', () => {
    if (win)
      controlsWindow?.setBounds(win.getBounds());
  });

  controlsWindow.on('enter-full-screen', () => {
    controlsWindow?.webContents.send('window-state-change', 'fullscreen');
  })

  controlsWindow.on('leave-full-screen', () => {
    controlsWindow?.webContents.send('window-state-change', 'exit-fullscreen');
  })

  controlsWindow.on('closed', () => {
    controlsWindow = null;
  });
}

//#endregion

//#region VIDEO PLAYER INTERACTION
ipcMain.on('play-video', async (_event, videoSrc) => {
  if (!controlsWindow){
    if (!mpvController)
      mpvController = new MPVController(win!);

    mpvController.startMPV(videoSrc);

    createControlWindow();
  }
});

ipcMain.on('send-data-controls', (_event, library, series, season, episode) => {
  controlsWindow?.webContents.on('did-finish-load', () => {
    controlsWindow?.webContents.send('data-to-controls', library, series, season, episode);
  });
});

ipcMain.on('toggle-pause', () => {
  controlsWindow?.webContents.send('toggle-pause');
});

ipcMain.on('stop-video', () => {
  if (mpvController) {
    mpvController.stop();
    controlsWindow?.close();
    controlsWindow = null;
    win?.setResizable(true);
    win?.webContents.send('video-stopped');
  }
});

ipcMain.on('mpv-command', (_event, args) => {
  if (mpvController) {
    mpvController.sendCommand(args);
  }
});

ipcMain.on('show-controls', () => {
  controlsWindow?.webContents.send('show-controls');
});

ipcMain.on('hide-controls', () => {
  controlsWindow?.webContents.send('hide-controls');
});
//#endregion

//#region LIBRARY DATA COMMUNICATION

ipcMain.handle('get-library-data', async () => {
  return loadData();
});

ipcMain.handle('save-library-data', async (_event, newData) => {
  return saveData(newData);
});

//#endregion

//#region WINDOW CONTROLS
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

ipcMain.on('fullscreen-controls', () => {
  if (win?.isSimpleFullScreen()){
    controlsWindow?.setSimpleFullScreen(false);
    win.setSimpleFullScreen(false);

    controlsWindow?.setBounds(win.getBounds());
  }else{
    win?.setSimpleFullScreen(true);
    controlsWindow?.setSimpleFullScreen(true);
  }
})

ipcMain.on('close-window', () => {
  win?.close()
})

//#endregion

// Quit when all windows are closed, except on macOS.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
    controlsWindow = null
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