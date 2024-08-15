import { Chapter } from './Chapter';
import { MediaInfo } from './MediaInfo';
import { VideoTrack } from './VideoTrack';
import { AudioTrack } from './AudioTrack';
import { SubtitleTrack } from './SubtitleTrack';

export class Episode {
    id: string;
    name: string;
    overview: string;
    year: string;
    order: number;
    score: number;
    imdbScore: number;
    runtime: number;
    runtimeInSeconds: number;
    episodeNumber: number;
    seasonNumber: number;
    videoSrc: string;
    imgSrc: string;
    seasonID: string;
    watched: boolean;
    timeWatched: number;
    chapters: Chapter[];
    mediaInfo?: MediaInfo;
    videoTracks: VideoTrack[];
    audioTracks: AudioTrack[];
    subtitleTracks: SubtitleTrack[];
    directedBy: string;
    writtenBy: string;
  
    constructor() {
      this.id = crypto.randomUUID();
      this.name = '';
      this.overview = '';
      this.year = '';
      this.order = 0;
      this.score = 0;
      this.imdbScore = 0;
      this.runtime = 0;
      this.runtimeInSeconds = 0;
      this.episodeNumber = 0;
      this.seasonNumber = 0;
      this.videoSrc = '';
      this.imgSrc = '';
      this.seasonID = '';
      this.watched = false;
      this.timeWatched = 0;
      this.chapters = [];
      this.mediaInfo = undefined;
      this.videoTracks = [];
      this.audioTracks = [];
      this.subtitleTracks = [];
      this.directedBy = '';
      this.writtenBy = '';
    }
  
    static fromJSON(json: any): Episode {
      const episode = new Episode();
      episode.id = json.id;
      episode.name = json.name;
      episode.overview = json.overview;
      episode.year = json.year;
      episode.order = json.order;
      episode.score = json.score;
      episode.imdbScore = json.imdbScore;
      episode.runtime = json.runtime;
      episode.runtimeInSeconds = json.runtimeInSeconds;
      episode.episodeNumber = json.episodeNumber;
      episode.seasonNumber = json.seasonNumber;
      episode.videoSrc = json.videoSrc;
      episode.imgSrc = json.imgSrc;
      episode.seasonID = json.seasonID;
      episode.watched = json.watched;
      episode.timeWatched = json.timeWatched;
      episode.chapters = json.chapters; // Ajustar si tienes una clase Chapter
      episode.mediaInfo = json.mediaInfo; // Ajustar si tienes una clase MediaInfo
      episode.videoTracks = json.videoTracks; // Ajustar si tienes una clase VideoTrack
      episode.audioTracks = json.audioTracks; // Ajustar si tienes una clase AudioTrack
      episode.subtitleTracks = json.subtitleTracks; // Ajustar si tienes una clase SubtitleTrack
      episode.directedBy = json.directedBy;
      episode.writtenBy = json.writtenBy;
      return episode;
    }
  
    toJSON(): any {
      return {
        id: this.id,
        name: this.name,
        overview: this.overview,
        year: this.year,
        order: this.order,
        score: this.score,
        imdbScore: this.imdbScore,
        runtime: this.runtime,
        runtimeInSeconds: this.runtimeInSeconds,
        episodeNumber: this.episodeNumber,
        seasonNumber: this.seasonNumber,
        videoSrc: this.videoSrc,
        imgSrc: this.imgSrc,
        seasonID: this.seasonID,
        watched: this.watched,
        timeWatched: this.timeWatched,
        chapters: this.chapters, // Ajustar si tienes una clase Chapter
        mediaInfo: this.mediaInfo, // Ajustar si tienes una clase MediaInfo
        videoTracks: this.videoTracks, // Ajustar si tienes una clase VideoTrack
        audioTracks: this.audioTracks, // Ajustar si tienes una clase AudioTrack
        subtitleTracks: this.subtitleTracks, // Ajustar si tienes una clase SubtitleTrack
        directedBy: this.directedBy,
        writtenBy: this.writtenBy
      };
    }
  }