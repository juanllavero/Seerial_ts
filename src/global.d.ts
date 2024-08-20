export interface ElectronAPI {
  isWindowMaximized(): boolean;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  startMPV: (videoPath: string) => void;
  stopMPV: () => void;
  sendCommand: (command: string, args: string[]) => void;
}
  
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}