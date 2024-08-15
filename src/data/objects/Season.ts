import { Episode } from './Episode';
import { Cast } from './Cast';

export class Season {
  id: string;
  name: string;
  overview: string;
  year: string;
  order: number;
  score: number;
  seasonNumber: number;
  logoSrc: string;
  coverSrc: string;
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
  genres: string[];
  currentlyWatchingEpisode: number;
  cast: Cast[];
  creator: string;
  musicComposer: string;
  directedBy: string;
  writtenBy: string;
  productionStudios: string;

  constructor() {
    this.id = crypto.randomUUID();
    this.name = '';
    this.overview = '';
    this.year = '';
    this.order = 0;
    this.score = 0;
    this.seasonNumber = 0;
    this.logoSrc = '';
    this.coverSrc = '';
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
    this.creator = '';
    this.musicComposer = '';
    this.directedBy = '';
    this.writtenBy = '';
    this.productionStudios = '';
  }

  static fromJSON(json: any): Season {
    const season = new Season();
    season.id = json.id;
    season.name = json.name;
    season.overview = json.overview;
    season.year = json.year;
    season.order = json.order;
    season.score = json.score;
    season.seasonNumber = json.seasonNumber;
    season.logoSrc = json.logoSrc;
    season.coverSrc = json.coverSrc;
    season.backgroundSrc = json.backgroundSrc;
    season.videoSrc = json.videoSrc;
    season.musicSrc = json.musicSrc;
    season.seriesID = json.seriesID;
    season.themdbID = json.themdbID;
    season.imdbID = json.imdbID;
    season.lastDisc = json.lastDisc;
    season.folder = json.folder;
    season.showName = json.showName;
    season.audioTrackLanguage = json.audioTrackLanguage;
    season.selectedAudioTrack = json.selectedAudioTrack;
    season.subtitleTrackLanguage = json.subtitleTrackLanguage;
    season.selectedSubtitleTrack = json.selectedSubtitleTrack;
    season.episodes = json.episodes.map((e: any) => Episode.fromJSON(e));
    season.genres = json.genres;
    season.currentlyWatchingEpisode = json.currentlyWatchingEpisode;
    season.cast = json.cast; // Ajustar si tienes una clase Cast
    season.creator = json.creator;
    season.musicComposer = json.musicComposer;
    season.directedBy = json.directedBy;
    season.writtenBy = json.writtenBy;
    season.productionStudios = json.productionStudios;
    return season;
  }

  toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      overview: this.overview,
      year: this.year,
      order: this.order,
      score: this.score,
      seasonNumber: this.seasonNumber,
      logoSrc: this.logoSrc,
      coverSrc: this.coverSrc,
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
      productionStudios: this.productionStudios
    };
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

  getCreator(): string {
    return this.creator;
  }

  setCreator(creator: string): void {
    this.creator = creator;
  }

  getMusicComposer(): string {
    return this.musicComposer;
  }

  setMusicComposer(musicComposer: string): void {
    this.musicComposer = musicComposer;
  }

  getDirectedBy(): string {
    return this.directedBy;
  }

  setDirectedBy(directedBy: string): void {
    this.directedBy = directedBy;
  }

  getWrittenBy(): string {
    return this.writtenBy;
  }

  setWrittenBy(writtenBy: string): void {
    this.writtenBy = writtenBy;
  }

  private static getString(genres: string[]): string {
    return genres.join(', ');
  }
}