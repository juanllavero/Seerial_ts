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
}