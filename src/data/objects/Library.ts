import { Series } from './Series.ts';

export class Library {
  id: string;
  name: string;
  language: string;
  type: string;
  isCollection: boolean;
  order: number;
  folders: string[];
  showOnFullscreen: boolean;
  series: Series[] = [];
  analyzedFiles: Map<string, string> = new Map();
  analyzedFolders: Map<string, string> = new Map();
  seasonFolders: Map<string, string> = new Map();

  constructor(name: string, lang: string, type: string, order: number, folders: string[], showOnFullscreen: boolean, isCollection: boolean) {
    this.id = crypto.randomUUID();
    this.name = name;
    this.language = lang;
    this.type = type;
    this.order = order;
    this.folders = folders;
    this.showOnFullscreen = showOnFullscreen;
    this.isCollection = isCollection;
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
      jsonData.showOnFullscreen,
      jsonData.isCollection ? jsonData.isCollection : false,
    );

    library.id = jsonData.id;
    library.series = jsonData.series.map((s: any) => Series.fromJSON(s));
    library.analyzedFiles = new Map(jsonData.analyzedFiles);
    library.analyzedFolders = new Map(jsonData.analyzedFolders);
    library.seasonFolders = new Map(jsonData.seasonFolders);

    return library;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  setName(name: string): void {
    this.name = name;
  }

  getLanguage(): string {
    return this.language;
  }

  setLanguage(language: string): void {
    this.language = language;
  }

  getType(): string {
    return this.type;
  }

  setType(type: string): void {
    this.type = type;
  }

  getFolders(): string[] {
    return this.folders;
  }

  setFolders(folders: string[]): void {
    this.folders = folders;
  }

  isShowOnFullscreen(): boolean {
    return this.showOnFullscreen;
  }

  setShowOnFullscreen(showOnFullscreen: boolean): void {
    this.showOnFullscreen = showOnFullscreen;
  }

  getSeries(): Series[] {
    return this.series;
  }

  getAnalyzedFiles(): Map<string, string> {
    return this.analyzedFiles;
  }

  setAnalyzedFiles(analyzedFiles: Map<string, string>): void {
    this.analyzedFiles = analyzedFiles;
  }

  getAnalyzedFolders(): Map<string, string> {
    return this.analyzedFolders;
  }

  setAnalyzedFolders(analyzedFolders: Map<string, string>): void {
    this.analyzedFolders = analyzedFolders;
  }

  getSeasonFolders(): Map<string, string> {
    return this.seasonFolders;
  }

  setSeasonFolders(seasonFolders: Map<string, string>): void {
    this.seasonFolders = seasonFolders;
  }

  removeSeries(s: Series): void {
    this.analyzedFolders.delete(s.getFolder());
    this.series = this.series.filter(serie => serie.getId() !== s.getId());
  }

  getSeriesById(id: string): Series | null {
    return this.series.find(serie => serie.getId() === id) || null;
  }

  getOrder(): number {
    return this.order;
  }

  setOrder(order: number): void {
    this.order = order;
  }
}