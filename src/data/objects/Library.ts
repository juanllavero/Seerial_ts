import { Series } from './Series.ts';

export class Library {
  id: string;
  name: string;
  language: string;
  type: string;
  order: number;
  folders: string[];
  showOnFullscreen: boolean;
  series: Series[] = [];
  analyzedFiles: Map<string, string> = new Map();
  analyzedFolders: Map<string, string> = new Map();
  seasonFolders: Map<string, string> = new Map();

  constructor(name: string, lang: string, type: string, order: number, folders: string[], showOnFullscreen: boolean) {
    this.id = this.generateUUID();
    this.name = name;
    this.language = lang;
    this.type = type;
    this.order = order;
    this.folders = folders;
    this.showOnFullscreen = showOnFullscreen;
  }

  // Método para generar UUID (puedes ajustar si prefieres otra implementación)
  private generateUUID(): string {
    return crypto.randomUUID();
  }

  // Convertir Library a JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      language: this.language,
      type: this.type,
      order: this.order,
      folders: this.folders,
      showOnFullscreen: this.showOnFullscreen,
      series: this.series.map(s => s.toJSON()), // Convertir cada Series a JSON
      analyzedFiles: Array.from(this.analyzedFiles.entries()), // Convertir Map a array de pares
      analyzedFolders: Array.from(this.analyzedFolders.entries()),
      seasonFolders: Array.from(this.seasonFolders.entries())
    };
  }

  // Crear una instancia de Library desde JSON
  static fromJSON(jsonData: any): Library {
    const library = new Library(
      jsonData.name,
      jsonData.language,
      jsonData.type,
      jsonData.order,
      jsonData.folders,
      jsonData.showOnFullscreen
    );

    library.id = jsonData.id;
    library.series = jsonData.series.map((s: any) => Series.fromJSON(s));
    library.analyzedFiles = new Map(jsonData.analyzedFiles);
    library.analyzedFolders = new Map(jsonData.analyzedFolders);
    library.seasonFolders = new Map(jsonData.seasonFolders);

    return library;
  }
}