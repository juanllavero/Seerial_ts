import { Season } from './Season';

export class Series {
  id: string;
  themdbID: number;
  name: string;
  overview: string;
  year: string;
  score: number;
  order: number;
  numberOfEpisodes: number;
  numberOfSeasons: number;
  coverSrc: string;
  logoSrc: string;
  folder: string;
  videoZoom: number;
  episodeGroupID: string;
  seasons: Season[] = [];
  genres: string[] = [];
  playSameMusic: boolean;
  analyzingFiles: boolean;
  currentlyWatchingSeason: number;
  productionStudios: string;

  constructor(order: number) {
    this.id = crypto.randomUUID();
    this.themdbID = -1;
    this.name = '';
    this.overview = '';
    this.year = '';
    this.score = 0;
    this.order = order;
    this.numberOfEpisodes = 0;
    this.numberOfSeasons = 0;
    this.coverSrc = '';
    this.logoSrc = '';
    this.folder = '';
    this.videoZoom = 0;
    this.episodeGroupID = '';
    this.playSameMusic = false;
    this.analyzingFiles = false;
    this.currentlyWatchingSeason = -1;
    this.productionStudios = '';
  }

  toJSON(): any {
    return {
      id: this.id,
      themdbID: this.themdbID,
      name: this.name,
      overview: this.overview,
      year: this.year,
      score: this.score,
      order: this.order,
      numberOfEpisodes: this.numberOfEpisodes,
      numberOfSeasons: this.numberOfSeasons,
      coverSrc: this.coverSrc,
      logoSrc: this.logoSrc,
      folder: this.folder,
      videoZoom: this.videoZoom,
      episodeGroupID: this.episodeGroupID,
      seasons: this.seasons.map(s => s.toJSON()),
      genres: this.genres,
      playSameMusic: this.playSameMusic,
      analyzingFiles: this.analyzingFiles,
      currentlyWatchingSeason: this.currentlyWatchingSeason,
      productionStudios: this.productionStudios
    };
  }

  static fromJSON(jsonData: any): Series {
    const series = new Series(jsonData.order);
    series.id = jsonData.id;
    series.themdbID = jsonData.themdbID;
    series.name = jsonData.name;
    series.overview = jsonData.overview;
    series.year = jsonData.year;
    series.score = jsonData.score;
    series.numberOfEpisodes = jsonData.numberOfEpisodes;
    series.numberOfSeasons = jsonData.numberOfSeasons;
    series.coverSrc = jsonData.coverSrc;
    series.logoSrc = jsonData.logoSrc;
    series.folder = jsonData.folder;
    series.videoZoom = jsonData.videoZoom;
    series.episodeGroupID = jsonData.episodeGroupID;
    series.seasons = jsonData.seasons.map((s: any) => Season.fromJSON(s));
    series.genres = jsonData.genres;
    series.playSameMusic = jsonData.playSameMusic;
    series.analyzingFiles = jsonData.analyzingFiles;
    series.currentlyWatchingSeason = jsonData.currentlyWatchingSeason;
    series.productionStudios = jsonData.productionStudios;

    return series;
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

  getCoverSrc(): string {
    return this.coverSrc;
  }

  setCoverSrc(coverSrc: string): void {
    this.coverSrc = coverSrc;
  }

  getVideoZoom(): number {
    return this.videoZoom;
  }

  setVideoZoom(videoZoom: number): void {
    this.videoZoom = videoZoom;
  }

  getSeasons(): Season[] {
    return this.seasons;
  }

  addSeason(season: Season): void {
    this.seasons.push(season);
  }

  removeSeason(season: Season): void {
    this.seasons = this.seasons.filter(s => s.getId() !== season.getId());
    this.numberOfSeasons--;
    this.genres = [];
  }

  getEpisodeGroupID(): string {
    return this.episodeGroupID;
  }

  setEpisodeGroupID(episodeGroupID: string): void {
    this.episodeGroupID = episodeGroupID;
  }

  getOrder(): number {
    return this.order;
  }

  setOrder(order: number): void {
    this.order = order;
  }

  getGenres(): string {
    return Series.getString(this.genres);
  }

  setGenres(genres: string[]): void {
    this.genres = genres;
  }

  getThemdbID(): number {
    return this.themdbID;
  }

  setThemdbID(themdbID: number): void {
    this.themdbID = themdbID;
  }

  getOverview(): string {
    return this.overview;
  }

  setOverview(overview: string): void {
    this.overview = overview;
  }

  getScore(): number {
    return this.score;
  }

  setScore(score: number): void {
    this.score = score;
  }

  getYear(): string {
    return this.year;
  }

  setYear(year: string): void {
    this.year = year;
  }

  getNumberOfSeasons(): number {
    return this.numberOfSeasons;
  }

  setNumberOfSeasons(numberOfSeasons: number): void {
    this.numberOfSeasons = numberOfSeasons;
  }

  getNumberOfEpisodes(): number {
    return this.numberOfEpisodes;
  }

  setNumberOfEpisodes(numberOfEpisodes: number): void {
    this.numberOfEpisodes = numberOfEpisodes;
  }

  getLogoSrc(): string {
    return this.logoSrc;
  }

  setLogoSrc(logoSrc: string): void {
    this.logoSrc = logoSrc;
  }

  getFolder(): string {
    return this.folder;
  }

  setFolder(folder: string): void {
    this.folder = folder;
  }

  isPlaySameMusic(): boolean {
    return this.playSameMusic;
  }

  setPlaySameMusic(playSameMusic: boolean): void {
    this.playSameMusic = playSameMusic;
  }

  isAnalyzingFiles(): boolean {
    return this.analyzingFiles;
  }

  setAnalyzingFiles(analyzingFiles: boolean): void {
    this.analyzingFiles = analyzingFiles;
  }

  isBeingWatched(): boolean {
    return this.currentlyWatchingSeason !== -1;
  }

  getCurrentlyWatchingSeason(): Season | null {
    if (this.currentlyWatchingSeason !== -1 && this.currentlyWatchingSeason < this.seasons.length) {
      return this.seasons[this.currentlyWatchingSeason];
    }
    return null;
  }

  getCurrentlyWatchingSeasonIndex(): number {
    if (this.currentlyWatchingSeason < this.seasons.length) {
      return this.currentlyWatchingSeason;
    }
    return -1;
  }

  setCurrentlyWatchingSeason(index: number): void {
    this.currentlyWatchingSeason = index;
  }

  getProductionStudios(): string {
    return this.productionStudios;
  }

  setProductionStudios(productionStudios: string): void {
    this.productionStudios = productionStudios;
  }

  private static getString(genres: string[]): string {
    return genres.join(', ');
  }
}