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
}