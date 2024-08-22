export interface ElectronAPI {
  on(arg0: string, handleResize: () => Promise<void>): void;
  off(arg0: string, handleResize: () => Promise<void>): void;
  setFullscreenControls: () => void,
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  startMPV: (videoPath: string) => void;
  stopMPV: () => void;
  sendCommand: (args: string[]) => void;
  onWindowStateChange: (callback: (state: string) => void) => void;
}
  
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}