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
    analyzedFiles: Map<string, string>;
    analyzedFolders: Map<string, string>;
    seasonFolders: Map<string, string>;
  }