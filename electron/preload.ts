import { ipcRenderer, contextBridge } from 'electron'

// Exponer la API de Electron a través del contexto seguro
contextBridge.exposeInMainWorld('electronAPI', {
  setFullscreenControls: () => ipcRenderer.send('fullscreen-controls'),
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),
  getLibraryData: () => ipcRenderer.invoke('get-library-data'),
  saveLibraryData: (newData: any) => ipcRenderer.invoke('save-library-data', newData),
  startMPV: (videoPath: string) => ipcRenderer.send('play-video', videoPath),
  stopMPV: () => ipcRenderer.send('stop-video'),
  sendCommand: (args: string[] = []) => ipcRenderer.send('mpv-command', args),
  getMPVController: () => ipcRenderer.invoke('get-mpv-controller'),
  onWindowStateChange: (callback: (state: string) => void) => {
    ipcRenderer.on('window-state-change', (_, state) => callback(state));
  },
})

// Mantén las otras exposiciones si es necesario
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  }
})