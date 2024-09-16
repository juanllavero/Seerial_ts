import { EpisodeData } from "@interfaces/EpisodeData";
import { LibraryData } from "@interfaces/LibraryData";
import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";

export interface ElectronAPI {
  on(arg0: string, handleResize: () => Promise<void>): void;
  off(arg0: string, handleResize: () => Promise<void>): void;
  translate: (key) => String,
  setFullscreenControls: () => void,
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  startMPV: (library: LibraryData, series: SeriesData, season: SeasonData, episode: EpisodeData) => void;
  stopMPV: () => void;
  sendCommand: (args: string[]) => void;
  togglePause: () => void;
  onWindowStateChange: (callback: (state: string) => void) => void;
  showControls: () => void;
  hideControls: () => void;
  getExternalPath: (relativePath: string) => string;
  openFolderDialog: () => Promise<string[]>;
  getImages: (dirPath) => Promise<string[]>;
  getMediaInfo: (episode: EpisodeData) => EpisodeData;
  scanFiles: (library: LibraryData) => LibraryData;
  updateLibrary: (library: LibraryData) => void;
  extractColorsFromImage: (imgSrc: string) => string[];
}
  
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}