export interface ElectronAPI {
    isWindowMaximized(): boolean;
    minimizeWindow: () => void;
    maximizeWindow: () => void;
    closeWindow: () => void;
  }
  
  declare global {
    interface Window {
      electronAPI: ElectronAPI;
    }
  }