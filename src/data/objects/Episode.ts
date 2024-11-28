import { SubtitleTrack } from './SubtitleTrack';
import { MediaInfoData } from '@interfaces/MediaInfoData';
import { VideoTrackData } from '@interfaces/VideoTrackData';
import { AudioTrackData } from '@interfaces/AudioTrackData';
import { SubtitleTrackData } from '@interfaces/SubtitleTrackData';
import { ChapterData } from '@interfaces/ChapterData';

export class Episode {
  id: string;

  //Common data
  name: string;
  overview: string;
  year: string;
  nameLock: boolean;
  yearLock: boolean;
  overviewLock: boolean;
  imdbScore: number;

  //Show
  score: number;
  directedBy: string[];
  writtenBy: string[];
  directedLock: boolean;
  writtenLock: boolean;

  //Song
  album: string;
  albumArtist: string;

  order: number;
  runtime: number;
  runtimeInSeconds: number;
  episodeNumber: number;
  seasonNumber: number;
  videoSrc: string;
  imgSrc: string;
  imgUrls: string[];
  seasonID: string;
  watched: boolean;
  timeWatched: number;
  chapters: ChapterData[];
  mediaInfo?: MediaInfoData;
  videoTracks: VideoTrackData[];
  audioTracks: AudioTrackData[];
  subtitleTracks: SubtitleTrackData[];
  
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
    this.imgUrls = [];
    this.seasonID = '';
    this.watched = false;
    this.timeWatched = 0;
    this.chapters = [];
    this.mediaInfo = undefined;
    this.videoTracks = [];
    this.audioTracks = [];
    this.subtitleTracks = [];
    this.directedBy = [];
    this.writtenBy = [];
    this.nameLock = false;
    this.yearLock = false;
    this.overviewLock = false;
    this.directedLock = false;
    this.writtenLock = false;
    this.album = '';
    this.albumArtist = '';
  }

  static fromJSON(json: any): Episode {
    const episode = new Episode();

    // Asignar atributos solo si están presentes en json
    episode.id = json.id || episode.id;
    episode.name = json.name || episode.name;
    episode.overview = json.overview || episode.overview;
    episode.year = json.year || episode.year;
    episode.order = json.order !== undefined ? json.order : episode.order;
    episode.score = json.score !== undefined ? json.score : episode.score;
    episode.imdbScore = json.imdbScore !== undefined ? json.imdbScore : episode.imdbScore;
    episode.runtime = json.runtime !== undefined ? json.runtime : episode.runtime;
    episode.runtimeInSeconds = json.runtimeInSeconds !== undefined ? json.runtimeInSeconds : episode.runtimeInSeconds;
    episode.episodeNumber = json.episodeNumber !== undefined ? json.episodeNumber : episode.episodeNumber;
    episode.seasonNumber = json.seasonNumber !== undefined ? json.seasonNumber : episode.seasonNumber;
    episode.videoSrc = json.videoSrc || episode.videoSrc;
    episode.imgSrc = json.imgSrc || episode.imgSrc;
    episode.imgUrls = json.imgUrls || episode.imgUrls;
    episode.seasonID = json.seasonID || episode.seasonID;
    episode.watched = json.watched !== undefined ? json.watched : episode.watched;
    episode.timeWatched = json.timeWatched !== undefined ? json.timeWatched : episode.timeWatched;
    episode.chapters = json.chapters ? json.chapters : episode.chapters;
    episode.mediaInfo = json.mediaInfo ? json.mediaInfo : episode.mediaInfo;
    episode.videoTracks = json.videoTracks ? json.videoTracks : episode.videoTracks;
    episode.audioTracks = json.audioTracks ? json.audioTracks : episode.audioTracks;
    episode.subtitleTracks = json.subtitleTracks ? json.subtitleTracks : episode.subtitleTracks;
    episode.directedBy = json.directedBy ? json.directedBy : episode.directedBy;
    episode.writtenBy = json.writtenBy ? json.writtenBy : episode.writtenBy;
    episode.nameLock = json.nameLock !== undefined ? json.nameLock : episode.nameLock;
    episode.yearLock = json.yearLock !== undefined ? json.yearLock : episode.yearLock;
    episode.overviewLock = json.overviewLock !== undefined ? json.overviewLock : episode.overviewLock;
    episode.directedLock = json.directedLock !== undefined ? json.directedLock : episode.directedLock;
    episode.writtenLock = json.writtenLock !== undefined ? json.writtenLock : episode.writtenLock;
    episode.album = json.album !== undefined ? json.album : episode.album;
    episode.albumArtist = json.albumArtist !== undefined ? json.albumArtist : episode.albumArtist;

    return episode;
  }

  toJSON(): any {
    const json: any = {
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
      imgUrls: this.imgUrls,
      seasonID: this.seasonID,
      watched: this.watched,
      timeWatched: this.timeWatched,
      chapters: this.chapters.length ? this.chapters : undefined,
      mediaInfo: this.mediaInfo ? this.mediaInfo : undefined,
      videoTracks: this.videoTracks.length ? this.videoTracks : undefined,
      audioTracks: this.audioTracks.length ? this.audioTracks : undefined,
      subtitleTracks: this.subtitleTracks.length ? this.subtitleTracks : undefined,
      directedBy: this.directedBy.length ? this.directedBy : undefined,
      writtenBy: this.writtenBy.length ? this.writtenBy : undefined,
      nameLock: this.nameLock,
      yearLock: this.yearLock,
      overviewLock: this.overviewLock,
      directedLock: this.directedLock,
      writtenLock: this.writtenLock,
      album: this.album,
      albumArtist: this.albumArtist
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

  getOrder(): number {
    return this.order;
  }

  setOrder(order: number): void {
    this.order = order;
  }

  getSeasonID(): string {
    return this.seasonID;
  }

  setSeasonID(seasonID: string): void {
    this.seasonID = seasonID;
  }

  getVideoSrc(): string {
    return this.videoSrc;
  }

  setVideoSrc(videoSrc: string): void {
    this.videoSrc = videoSrc;
  }

  getEpisodeNumber(): number {
    return this.episodeNumber;
  }

  setEpisodeNumber(episodeNumber: number): void {
    this.episodeNumber = episodeNumber;
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

  getScore(): number {
    return this.score;
  }

  setScore(score: number): void {
    this.score = score;
  }

  getImdbScore(): number {
    return this.imdbScore;
  }

  setImdbScore(imdbScore: number): void {
    this.imdbScore = imdbScore;
  }

  getRuntime(): number {
    return this.runtime;
  }

  setRuntime(runtime: number): void {
    this.runtime = runtime;
  }

  getRuntimeInSeconds(): number {
    if (this.runtimeInSeconds <= 0) {
      return this.runtime * 60;
    }
    return this.runtimeInSeconds;
  }

  setRuntimeInSeconds(runtimeInSeconds: number): void {
    this.runtimeInSeconds = runtimeInSeconds;
    this.runtime = Math.floor(runtimeInSeconds / 60);
  }

  getSeasonNumber(): number {
    return this.seasonNumber;
  }

  setSeasonNumber(seasonNumber: number): void {
    this.seasonNumber = seasonNumber;
  }

  getImgSrc(): string {
    return this.imgSrc;
  }

  setImgSrc(imgSrc: string): void {
    this.imgSrc = imgSrc;
  }

  setWatched(): void {
    this.timeWatched = 0;
    this.watched = true;
  }

  setUnWatched(): void {
    this.timeWatched = 0;
    this.watched = false;
  }

  isWatched(): boolean {
      return this.watched;
  }

  setTimeWatched(seconds: number): void {
    this.timeWatched = seconds;

    // If we have watched more than 90% of the video, it is marked as watched
    if (this.timeWatched > (this.getRuntimeInSeconds() * 0.9)) {
      this.setWatched();
    }
  }

  getTimeWatched(): number {
    return this.timeWatched;
  }

  getChapters(): ChapterData[] {
    return this.chapters;
  }

  addChapter(chapter: ChapterData): void {
    this.chapters.push(chapter);
  }

  getMediaInfo(): MediaInfoData | undefined {
    return this.mediaInfo;
  }

  setMediaInfo(mediaInfo: MediaInfoData): void {
    this.mediaInfo = mediaInfo;
  }

  getVideoTracks(): VideoTrackData[] {
    return this.videoTracks;
  }

  setVideoTracks(videoTracks: VideoTrackData[]): void {
    this.videoTracks = videoTracks;
  }

  getAudioTracks(): AudioTrackData[] {
    return this.audioTracks;
  }

  setAudioTracks(audioTracks: AudioTrackData[]): void {
    this.audioTracks = audioTracks;
  }

  getSubtitleTracks(): SubtitleTrackData[] {
    return this.subtitleTracks;
  }

  setSubtitleTracks(subtitleTracks: SubtitleTrack[]): void {
    this.subtitleTracks = subtitleTracks;
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
}