import {SeriesData} from "@interfaces/SeriesData"

export interface LibraryData {
    id: string;
    name: string;
    language: string;
    type: string;
    isCollection: boolean;
    order: number;
    folders: string[];
    showOnFullscreen: boolean;
    series: SeriesData[];
    analyzedFiles: [string, string][];
    analyzedFolders: [string, string][];
    seasonFolders: [string, string][];
  }