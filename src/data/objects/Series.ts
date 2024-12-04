import { Cast } from './Cast';
import { Season } from './Season';

export class Series {
  id: string;
    
  //Common data
  name: string;
  overview: string;
  coverSrc: string;
  coversUrls: string[];
  nameLock: boolean;
  overviewLock: boolean;

  //Show
  year: string;
  score: number;
  tagline: string;
  logoSrc: string;
  logosUrls: string[];
  creator: string[];
  genres: string[];
  cast: Cast[];
  musicComposer: string[];
  productionStudios: string[];
  yearLock: boolean;
  studioLock: boolean;
  taglineLock: boolean;
  creatorLock: boolean;
  musicLock: boolean;
  genresLock: boolean;

  //Other
  watched: boolean;
  themdbID: number;
  isCollection: boolean;
  order: number;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  folder: string;
  videoZoom: number;
  episodeGroupID: string;
  seasons: Season[];
  playSameMusic: boolean;
  analyzingFiles: boolean;
  currentlyWatchingSeason: number;

  constructor() {
    this.id = crypto.randomUUID();
    this.themdbID = -1;
    this.name = '';
    this.overview = '';
    this.year = '';
    this.score = 0;
    this.order = 0;
    this.seasons = [];
    this.numberOfSeasons = 0;
    this.numberOfEpisodes = 0;
    this.coverSrc = '';
    this.coversUrls = [];
    this.logoSrc = '';
    this.logosUrls = [];
    this.folder = '';
    this.videoZoom = 0;
    this.episodeGroupID = '';
    this.playSameMusic = false;
    this.analyzingFiles = false;
    this.currentlyWatchingSeason = -1;
    this.productionStudios = [];
    this.isCollection = false;
    this.nameLock = false;
    this.overviewLock = false;
    this.tagline = '';
    this.creator = [];
    this.genres = [];
    this.cast = [];
    this.musicComposer = [];
    this.yearLock = false;
    this.studioLock = false;
    this.taglineLock = false;
    this.creatorLock = false;
    this.musicLock = false;
    this.genresLock = false;
    this.watched = false;
  }

  toJSON(): any {
    const json: any = {
      id: this.id,
      themdbID: this.themdbID,
      name: this.name,
      overview: this.overview,
      year: this.year,
      score: this.score,
      order: this.order,
      numberOfSeasons: this.numberOfSeasons,
      numberOfEpisodes: this.numberOfEpisodes,
      coverSrc: this.coverSrc,
      coversUrls: this.coversUrls,
      logoSrc: this.logoSrc,
      logosUrls: this.logosUrls,
      folder: this.folder,
      videoZoom: this.videoZoom,
      episodeGroupID: this.episodeGroupID,
      seasons: this.seasons.map(s => s.toJSON()),
      genres: this.genres,
      playSameMusic: this.playSameMusic,
      analyzingFiles: this.analyzingFiles,
      currentlyWatchingSeason: this.currentlyWatchingSeason,
      productionStudios: this.productionStudios,
      isCollection: this.isCollection,
      tagline: this.tagline,
      creator: this.creator,
      cast: this.cast,
      musicComposer: this.musicComposer,
      yearLock: this.yearLock,
      studioLock: this.studioLock,
      taglineLock: this.taglineLock,
      creatorLock: this.creatorLock,
      musicLock: this.musicLock,
      genresLock: this.genresLock,
      watched: this.watched
    };

    // Filter attributes
    Object.keys(json).forEach(key => {
      if (json[key] === undefined || json[key] === null || (Array.isArray(json[key]) && json[key].length === 0)) {
        delete json[key];
      }
    });

    return json;
  }

  static fromJSON(jsonData: any): Series {
    const series = new Series();
    series.id = jsonData.id || series.id;
    series.order = jsonData.order || series.order;
    series.themdbID = jsonData.themdbID || series.themdbID;
    series.name = jsonData.name || series.name;
    series.overview = jsonData.overview || series.overview;
    series.year = jsonData.year || series.year;
    series.score = jsonData.score || series.score;
    series.numberOfSeasons = jsonData.numberOfSeasons || series.numberOfSeasons;
    series.numberOfEpisodes = jsonData.numberOfEpisodes || series.numberOfEpisodes;
    series.coverSrc = jsonData.coverSrc || series.coverSrc;
    series.coversUrls = jsonData.coversUrls || series.coversUrls;
    series.logoSrc = jsonData.logoSrc || series.logoSrc;
    series.logosUrls = jsonData.logosUrls || series.logosUrls;
    series.folder = jsonData.folder || series.folder;
    series.videoZoom = jsonData.videoZoom || series.videoZoom;
    series.episodeGroupID = jsonData.episodeGroupID || series.episodeGroupID;
    series.seasons = jsonData.seasons ? jsonData.seasons.map((s: any) => Season.fromJSON(s)) : series.seasons;
    series.genres = jsonData.genres || series.genres;
    series.playSameMusic = jsonData.playSameMusic || series.playSameMusic;
    series.analyzingFiles = jsonData.analyzingFiles || series.analyzingFiles;
    series.currentlyWatchingSeason = jsonData.currentlyWatchingSeason || series.currentlyWatchingSeason;
    series.productionStudios = jsonData.productionStudios || series.productionStudios;
    series.isCollection = jsonData.isCollection || series.isCollection;
    series.tagline = jsonData.tagline || series.tagline;
    series.creator = jsonData.creator || series.creator;
    series.cast = jsonData.cast || series.cast;
    series.musicComposer = jsonData.musicComposer || series.musicComposer;
    series.yearLock = jsonData.yearLock || series.yearLock;
    series.studioLock = jsonData.studioLock || series.studioLock;
    series.taglineLock = jsonData.taglineLock || series.taglineLock;
    series.creatorLock = jsonData.creatorLock || series.creatorLock;
    series.musicLock = jsonData.musicLock || series.musicLock;
    series.genresLock = jsonData.genresLock || series.genresLock;
    series.watched = jsonData.watched || series.watched;

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

  getProductionStudios(): string[] {
    return this.productionStudios;
  }

  setProductionStudios(productionStudios: string[]): void {
    this.productionStudios = productionStudios;
  }

  private static getString(genres: string[]): string {
    return genres.join(', ');
  }

  getSeason(number: number): Season | undefined {
    return this.seasons.find(season => season.seasonNumber === number);
  }
}