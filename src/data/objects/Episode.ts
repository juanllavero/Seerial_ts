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
    nameLock: boolean;
    yearLock: boolean;
    orderLock: boolean;
    overviewLock: boolean;
    directedLock: boolean;
    writtenLock: boolean;
  
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
      this.nameLock = false;
      this.yearLock = false;
      this.orderLock = false;
      this.overviewLock = false;
      this.directedLock = false;
      this.writtenLock = false;
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
      episode.chapters = json.chapters;
      episode.mediaInfo = json.mediaInfo;
      episode.videoTracks = json.videoTracks;
      episode.audioTracks = json.audioTracks;
      episode.subtitleTracks = json.subtitleTracks;
      episode.directedBy = json.directedBy;
      episode.writtenBy = json.writtenBy;
      episode.nameLock = json.nameLock;
      episode.yearLock = json.yearLock;
      episode.orderLock = json.orderLock;
      episode.overviewLock = json.overviewLock;
      episode.directedLock = json.directedLock;
      episode.writtenLock = json.writtenLock;
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
        writtenBy: this.writtenBy,
        nameLock: this.nameLock,
        yearLock: this.yearLock,
        orderLock: this.orderLock,
        overviewLock: this.overviewLock,
        directedLock: this.directedLock,
        writtenLock: this.writtenLock,
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

    getChapters(): Chapter[] {
      return this.chapters;
    }

    addChapter(chapter: Chapter): void {
      this.chapters.push(chapter);
    }

    getMediaInfo(): MediaInfo | undefined {
      return this.mediaInfo;
    }

    setMediaInfo(mediaInfo: MediaInfo): void {
      this.mediaInfo = mediaInfo;
    }

    getVideoTracks(): VideoTrack[] {
      return this.videoTracks;
    }

    setVideoTracks(videoTracks: VideoTrack[]): void {
      this.videoTracks = videoTracks;
    }

    getAudioTracks(): AudioTrack[] {
      return this.audioTracks;
    }

    setAudioTracks(audioTracks: AudioTrack[]): void {
      this.audioTracks = audioTracks;
    }

    getSubtitleTracks(): SubtitleTrack[] {
      return this.subtitleTracks;
    }

    setSubtitleTracks(subtitleTracks: SubtitleTrack[]): void {
      this.subtitleTracks = subtitleTracks;
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
  }