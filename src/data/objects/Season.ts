import { Episode } from './Episode';
import { Cast } from './Cast';

export class Season {
  id: string;

  //Common data
  name: string;
  year: string;
  overview: string;
  nameLock: boolean;
  orderLock: boolean;
  yearLock: boolean;
  overviewLock: boolean;

  //Movie
  score: number;
  tagline: string;
  creator: string[];
  genres: string[];
  cast: Cast[];
  musicComposer: string[];
  productionStudios: string[];
  directedBy: string[];
  writtenBy: string[];
  creatorLock: boolean;
  musicLock: boolean;
  directedLock: boolean;
  writtenLock: boolean;
  genresLock: boolean;
  studioLock: boolean;
  taglineLock: boolean;
  
  //Other
  order: number;
  seasonNumber: number;
  logoSrc: string;
  logosUrls: string[];
  coverSrc: string;
  coversUrls: string[];
  backgroundSrc: string;
  videoSrc: string;
  musicSrc: string;
  seriesID: string;
  themdbID: number;
  imdbID: string;
  lastDisc: number;
  folder: string;
  showName: boolean;
  audioTrackLanguage: string;
  selectedAudioTrack: number;
  subtitleTrackLanguage: string;
  selectedSubtitleTrack: number;
  episodes: Episode[];
  currentlyWatchingEpisode: number;
  watched: boolean;

  constructor() {
    this.id = crypto.randomUUID();
    this.name = '';
    this.overview = '';
    this.year = '';
    this.order = 0;
    this.score = 0;
    this.seasonNumber = 0;
    this.logoSrc = '';
    this.logosUrls = [];
    this.coverSrc = '';
    this.coversUrls = [];
    this.backgroundSrc = '';
    this.videoSrc = '';
    this.musicSrc = '';
    this.seriesID = '';
    this.themdbID = -1;
    this.imdbID = '';
    this.lastDisc = 0;
    this.folder = '';
    this.showName = true;
    this.audioTrackLanguage = '';
    this.selectedAudioTrack = -1;
    this.subtitleTrackLanguage = '';
    this.selectedSubtitleTrack = -1;
    this.episodes = [];
    this.genres = [];
    this.currentlyWatchingEpisode = -1;
    this.cast = [];
    this.creator = [];
    this.musicComposer = [];
    this.directedBy = [];
    this.writtenBy = [];
    this.productionStudios = [];
    this.tagline = '';
    this.nameLock = false;
    this.orderLock = false;
    this.yearLock = false;
    this.overviewLock = false;
    this.studioLock = false;
    this.taglineLock = false;
    this.creatorLock = false;
    this.musicLock = false;
    this.directedLock = false;
    this.writtenLock = false;
    this.genresLock = false;
    this.watched = false;
  }

  static fromJSON(json: any): Season {
    const season = new Season();

    // Asignar atributos solo si están presentes en json
    season.id = json.id || season.id;
    season.name = json.name || season.name;
    season.overview = json.overview || season.overview;
    season.year = json.year || season.year;
    season.order = json.order || season.order;
    season.score = json.score || season.score;
    season.seasonNumber = json.seasonNumber || season.seasonNumber;
    season.logoSrc = json.logoSrc || season.logoSrc;
    season.logosUrls = json.logosUrls || season.logosUrls;
    season.coverSrc = json.coverSrc || season.coverSrc;
    season.coversUrls = json.coversUrls || season.coversUrls;
    season.backgroundSrc = json.backgroundSrc || season.backgroundSrc;
    season.videoSrc = json.videoSrc || season.videoSrc;
    season.musicSrc = json.musicSrc || season.musicSrc;
    season.seriesID = json.seriesID || season.seriesID;
    season.themdbID = json.themdbID || season.themdbID;
    season.imdbID = json.imdbID || season.imdbID;
    season.lastDisc = json.lastDisc || season.lastDisc;
    season.folder = json.folder || season.folder;
    season.showName = json.showName !== undefined ? json.showName : season.showName;
    season.audioTrackLanguage = json.audioTrackLanguage || season.audioTrackLanguage;
    season.selectedAudioTrack = json.selectedAudioTrack !== undefined ? json.selectedAudioTrack : season.selectedAudioTrack;
    season.subtitleTrackLanguage = json.subtitleTrackLanguage || season.subtitleTrackLanguage;
    season.selectedSubtitleTrack = json.selectedSubtitleTrack !== undefined ? json.selectedSubtitleTrack : season.selectedSubtitleTrack;
    season.episodes = json.episodes ? json.episodes.map((e: any) => Episode.fromJSON(e)) : season.episodes;
    season.genres = json.genres || season.genres;
    season.currentlyWatchingEpisode = json.currentlyWatchingEpisode !== undefined ? json.currentlyWatchingEpisode : season.currentlyWatchingEpisode;
    season.cast = json.cast || season.cast; // Ajustar si tienes una clase Cast
    season.creator = json.creator || season.creator;
    season.musicComposer = json.musicComposer || season.musicComposer;
    season.directedBy = json.directedBy || season.directedBy;
    season.writtenBy = json.writtenBy || season.writtenBy;
    season.productionStudios = json.productionStudios || season.productionStudios;
    season.tagline = json.tagline || season.tagline;
    season.nameLock = json.nameLock !== undefined ? json.nameLock : season.nameLock;
    season.orderLock = json.orderLock !== undefined ? json.orderLock : season.orderLock;
    season.yearLock = json.yearLock !== undefined ? json.yearLock : season.yearLock;
    season.overviewLock = json.overviewLock !== undefined ? json.overviewLock : season.overviewLock;
    season.studioLock = json.studioLock !== undefined ? json.studioLock : season.studioLock;
    season.taglineLock = json.taglineLock !== undefined ? json.taglineLock : season.taglineLock;
    season.creatorLock = json.creatorLock !== undefined ? json.creatorLock : season.creatorLock;
    season.musicLock = json.musicLock !== undefined ? json.musicLock : season.musicLock;
    season.directedLock = json.directedLock !== undefined ? json.directedLock : season.directedLock;
    season.writtenLock = json.writtenLock !== undefined ? json.writtenLock : season.writtenLock;
    season.genresLock = json.genresLock !== undefined ? json.genresLock : season.genresLock;
    season.watched = json.watched !== undefined ? json.watched : season.watched;

    return season;
  }

  toJSON(): any {
    const json: any = {
      id: this.id,
      name: this.name,
      overview: this.overview,
      year: this.year,
      order: this.order,
      score: this.score,
      seasonNumber: this.seasonNumber,
      logoSrc: this.logoSrc,
      logosUrls: this.logosUrls,
      coverSrc: this.coverSrc,
      coversUrls: this.coversUrls,
      backgroundSrc: this.backgroundSrc,
      videoSrc: this.videoSrc,
      musicSrc: this.musicSrc,
      seriesID: this.seriesID,
      themdbID: this.themdbID,
      imdbID: this.imdbID,
      lastDisc: this.lastDisc,
      folder: this.folder,
      showName: this.showName,
      audioTrackLanguage: this.audioTrackLanguage,
      selectedAudioTrack: this.selectedAudioTrack,
      subtitleTrackLanguage: this.subtitleTrackLanguage,
      selectedSubtitleTrack: this.selectedSubtitleTrack,
      episodes: this.episodes.map(e => e.toJSON()),
      genres: this.genres,
      currentlyWatchingEpisode: this.currentlyWatchingEpisode,
      cast: this.cast, // Ajustar si tienes una clase Cast
      creator: this.creator,
      musicComposer: this.musicComposer,
      directedBy: this.directedBy,
      writtenBy: this.writtenBy,
      productionStudios: this.productionStudios,
      tagline: this.tagline,
      nameLock: this.nameLock,
      orderLock: this.orderLock,
      yearLock: this.yearLock,
      overviewLock: this.overviewLock,
      studioLock: this.studioLock,
      taglineLock: this.taglineLock,
      creatorLock: this.creatorLock,
      musicLock: this.musicLock,
      directedLock: this.directedLock,
      writtenLock: this.writtenLock,
      watched: this.watched
    };

    // Filtrar atributos solo si están asignados o tienen un valor definido
    Object.keys(json).forEach(key => {
      if (json[key] === undefined || json[key] === null || (Array.isArray(json[key]) && json[key].length === 0)) {
        delete json[key];
      }
    });

    return json;
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

  getOverview(): string {
    return this.overview;
  }

  setOverview(overview: string): void {
    this.overview = overview;
  }

  getYear(): string {
    return this.year;
  }

  setYear(year: string): void {
    this.year = year;
  }

  getOrder(): number {
    return this.order;
  }

  setOrder(order: number): void {
    this.order = order;
  }

  getScore(): number {
    return this.score;
  }

  setScore(score: number): void {
    this.score = score;
  }

  getSeasonNumber(): number {
    return this.seasonNumber;
  }

  setSeasonNumber(seasonNumber: number): void {
    this.seasonNumber = seasonNumber;
  }

  getLogoSrc(): string {
    return this.logoSrc;
  }

  setLogoSrc(logoSrc: string): void {
    this.logoSrc = logoSrc;
  }

  getCoverSrc(): string {
    return this.coverSrc;
  }

  setCoverSrc(coverSrc: string): void {
    this.coverSrc = coverSrc;
  }

  getBackgroundSrc(): string {
    return this.backgroundSrc;
  }

  setBackgroundSrc(backgroundSrc: string): void {
    this.backgroundSrc = backgroundSrc;
  }

  getVideoSrc(): string {
    return this.videoSrc;
  }

  setVideoSrc(videoSrc: string): void {
    this.videoSrc = videoSrc;
  }

  getMusicSrc(): string {
    return this.musicSrc;
  }

  setMusicSrc(musicSrc: string): void {
    this.musicSrc = musicSrc;
  }

  getSeriesID(): string {
    return this.seriesID;
  }

  setSeriesID(seriesID: string): void {
    this.seriesID = seriesID;
  }

  getThemdbID(): number {
    return this.themdbID;
  }

  setThemdbID(themdbID: number): void {
    this.themdbID = themdbID;
  }

  getImdbID(): string {
    return this.imdbID;
  }

  setImdbID(imdbID: string): void {
    this.imdbID = imdbID;
  }

  getLastDisc(): number {
    return this.lastDisc;
  }

  setLastDisc(lastDisc: number): void {
    this.lastDisc = lastDisc;
  }

  getFolder(): string {
    return this.folder;
  }

  setFolder(folder: string): void {
    this.folder = folder;
  }

  isShowName(): boolean {
    return this.showName;
  }

  setShowName(showName: boolean): void {
    this.showName = showName;
  }

  getAudioTrackLanguage(): string {
    return this.audioTrackLanguage;
  }

  setAudioTrackLanguage(audioTrackLanguage: string): void {
    this.audioTrackLanguage = audioTrackLanguage;
  }

  getSelectedAudioTrack(): number {
    return this.selectedAudioTrack;
  }

  setSelectedAudioTrack(selectedAudioTrack: number): void {
    this.selectedAudioTrack = selectedAudioTrack;
  }

  getSubtitleTrackLanguage(): string {
    return this.subtitleTrackLanguage;
  }

  setSubtitleTrackLanguage(subtitleTrackLanguage: string): void {
    this.subtitleTrackLanguage = subtitleTrackLanguage;
  }

  getSelectedSubtitleTrack(): number {
    return this.selectedSubtitleTrack;
  }

  setSelectedSubtitleTrack(selectedSubtitleTrack: number): void {
    this.selectedSubtitleTrack = selectedSubtitleTrack;
  }

  getEpisodes(): Episode[] {
    return this.episodes;
  }

  addEpisode(episode: Episode): void {
    this.episodes.push(episode);
  }

  removeEpisode(episode: Episode): void {
    this.episodes = this.episodes.filter(e => e.getId() !== episode.getId());
  }

  getGenres(): string {
    return Season.getString(this.genres);
  }

  setGenres(genres: string[]): void {
    this.genres = genres;
  }

  getCurrentlyWatchingEpisode(): Episode | null {
    if (this.currentlyWatchingEpisode !== -1 && this.currentlyWatchingEpisode < this.episodes.length) {
      return this.episodes[this.currentlyWatchingEpisode];
    }
    return null;
  }

  getCurrentlyWatchingEpisodeIndex(): number {
    return this.currentlyWatchingEpisode;
  }

  setCurrentlyWatchingEpisode(index: number): void {
    this.currentlyWatchingEpisode = index;
  }

  getCast(): Cast[] {
    return this.cast;
  }

  setCast(cast: Cast[]): void {
    this.cast = cast;
  }

  getCreator(): string[] {
    return this.creator;
  }

  setCreator(creator: string[]): void {
    this.creator = creator;
  }

  getMusicComposer(): string[] {
    return this.musicComposer;
  }

  setMusicComposer(musicComposer: string[]): void {
    this.musicComposer = musicComposer;
  }

  getDirectedBy(): string[] {
    return this.directedBy;
  }

  setDirectedBy(directedBy: string[]): void {
    this.directedBy = directedBy;
  }

  getWrittenBy(): string[] {
    return this.writtenBy;
  }

  setWrittenBy(writtenBy: string[]): void {
    this.writtenBy = writtenBy;
  }

  getEpisode(number: number): Episode | undefined {
    return this.episodes.find(episode => episode.episodeNumber === number);
  }

  getEpisodeById(id: string): Episode | undefined {
    return this.episodes.find(episode => episode.id === id);
  }

  private static getString(genres: string[]): string {
    return genres.join(', ');
  }
}