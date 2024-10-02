import { app, BrowserWindow, dialog, ipcMain, screen } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'path';
import * as fs from 'fs';
import axios from 'axios';

import { MPVController } from '../src/data/objects/MPVController';
import propertiesReader from 'properties-reader';

import { MovieDb } from 'moviedb-promise';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import Configuration from '../src/data/utils/Configuration';
import { LibraryData } from '@interfaces/LibraryData';
import { SeriesData } from '@interfaces/SeriesData';
import { SeasonData } from '@interfaces/SeasonData';
import { EpisodeData } from '@interfaces/EpisodeData';
import { Utils } from '../src/data/utils/Utils';
import { Library } from '../src/data/objects/Library';
import { DataManager } from '../src/data/utils/DataManager';

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
let fullScreenWindow: BrowserWindow | null;
let controlsWindow: BrowserWindow | null;
let mpvController: MPVController | null = null;

//#endregion

//#region EXTERNAL PATHS
/**
 * Returns the absolute path to a relative external path by checking if the application is in development or production.
 * @param relativePath Relative path to a file or folder outside the application
 * @returns The absolute path to that file or folder
 */

ipcMain.handle('get-external-path', async (_event, relativePath: string) => {
  try {
    // Llama a la función para obtener la ruta absoluta
    const absolutePath = Utils.getExternalPath(relativePath);

    // Verifica que el path sea una cadena válida
    if (typeof absolutePath !== 'string') {
      throw new Error('Invalid path type');
    }

    return absolutePath;
  } catch (error) {
    console.error('Error in IPC handler for get-external-path:', error);
    throw error; // Propagar el error para que pueda ser manejado en el renderer
  }
});

// Set Configuration file path
Configuration.setConfigFile(Utils.getExternalPath('resources/config/config.properties'));
//#endregion

//#region LOCALIZATION
i18next
  .use(Backend)
  .init({
    fallbackLng: 'en-US',
    supportedLngs: ['en-US', 'es-ES', 'de-DE', 'fr-FR', 'it-IT'],
    backend: {
      loadPath: './src/locales/{{lng}}.json',
    },
});

// Manejar solicitudes de traducción desde las ventanas renderizadas
ipcMain.handle('translate', (_event, key) => {
  return i18next.t(key);
});
//#endregion

//#region GET FILES
ipcMain.handle('get-images', async (_event, dirPath) => {
  return DataManager.getImages(dirPath);
});
//#endregion

//#region DOWNLOAD IMAGES
ipcMain.on('download-image-url', async (event, imageUrl: string, downloadDir: string) => {
  try {
      // Definir la carpeta donde se guardará la imagen
      const folderPath = Utils.getExternalPath(downloadDir);
      if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath);
      }

      // Obtener el número de archivos en la carpeta
      const files = fs.readdirSync(folderPath);
      const newFileName = `${files.length + 1}.jpg`; // Sumar 1 para que no haya duplicados
      const imagePath = path.join(folderPath, newFileName);

      // Descargar la imagen usando axios
      const response = await axios({
          url: imageUrl,
          responseType: 'stream',
      });

      // Guardar la imagen en la carpeta
      const writer = fs.createWriteStream(imagePath);
      response.data.pipe(writer);

      writer.on('finish', () => {
          event.reply('download-complete', `Imagen guardada en ${imagePath}`);
      });

      writer.on('error', (err) => {
          event.reply('download-error', `Error al guardar la imagen: ${err.message}`);
      });
  } catch (error: any) {
      event.reply('download-error', `Error al descargar la imagen: ${error.message}`);
  }
});
//#endregion

//#region MEDIA INFO
const getMediaInfo = async (episode: EpisodeData) => {
  return await Utils.getMediaInfo(episode);
};

ipcMain.handle('get-video-data', async (_event, episode: EpisodeData) => {
  return getMediaInfo(episode);
});
//#endregion

//#region METADATA DOWNLOAD

DataManager.initFolders();

ipcMain.handle('scan-files', async (_event, library: LibraryData) => {
  let newLibrary: Library | undefined = new Library(library.name, library.language, library.type, library.order, library.folders);
  newLibrary = await DataManager.scanFiles(newLibrary);
});

ipcMain.on('update-library', (_event, library: LibraryData) => {
  win?.webContents.send('update-library', library);
});

ipcMain.on('get-libraries', async (_event) => {
  let libraries = DataManager.getLibraries();

  win?.webContents.send('send-libraries', libraries.map((library: Library) => library.toLibraryData()));
});

export function sendLibraries(libraries: LibraryData[]) {  
  if (win){
    win.webContents.send('send-libraries', libraries);
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
    backgroundColor: '#00FFFFFF',
    icon: "./src/assets/icon.ico",
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: true,
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
    win?.show();
    DataManager.initConnection(win);
  })

  mpvController = new MPVController(win!);
}

// Crear una ventana de controles
function createControlWindow(library: LibraryData, series: SeriesData, season: SeasonData, episode: EpisodeData) {
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

  controlsWindow.webContents.on('did-finish-load', () => {
    controlsWindow?.webContents.send('data-to-controls', library, series, season, episode);
  });
}

function createFullscreenWindow() {
  fullScreenWindow = new BrowserWindow({
    fullscreen: false,
    alwaysOnTop: false,
    icon: "./src/assets/icon.ico",
    transparent: false,
    frame: false,
    hasShadow: false,
    resizable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: true,
      webSecurity: false,
      plugins: true
    }
  });

  if (VITE_DEV_SERVER_URL) {
    fullScreenWindow.loadURL(path.join(VITE_DEV_SERVER_URL, 'fullscreen'))
  } else {
    fullScreenWindow.loadFile(path.join(RENDERER_DIST, '../fullscreen.html'))
  } 
}

//#endregion

//#region VIDEO PLAYER INTERACTION
ipcMain.on('play-video', async (_event, library: LibraryData, series: SeriesData, season: SeasonData, episode: EpisodeData) => {
  if (!controlsWindow){
    if (!mpvController)
      mpvController = new MPVController(win!);

    mpvController.startMPV(episode.videoSrc);

    createControlWindow(library, series, season, episode);
  }
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

//#region FOLDER AND FILES SELECTION
ipcMain.handle('dialog:openFolder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory'],
  });
  return result.filePaths;
});
//#endregion

//#region LIBRARY DATA COMMUNICATION
ipcMain.handle('get-library-data', async () => {
  return DataManager.loadData();
});

ipcMain.handle('save-library-data', async (_event, newData) => {
  return DataManager.saveData(newData);
});
//#endregion

//#region DELETE ELEMENTS
ipcMain.on('delete-library', async (_event, library) => {
  DataManager.deleteLibrary(library);
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

app.whenReady().then(() => {
  if (process.env.WINDOW_TYPE !== 'fullscreen'){
    createWindow();
  }else {
    createFullscreenWindow();
  }
});