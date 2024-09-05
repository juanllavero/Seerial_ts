import {ChapterData} from "@interfaces/ChapterData"
import {MediaInfoData} from "@interfaces/MediaInfoData"
import {AudioTrackData} from "@interfaces/AudioTrackData"
import {SubtitleTrackData} from "@interfaces/SubtitleTrackData"
import {VideoTrackData} from "@interfaces/VideoTrackData"

export interface EpisodeData{
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
    chapters: ChapterData[];
    mediaInfo?: MediaInfoData;
    videoTracks: VideoTrackData[];
    audioTracks: AudioTrackData[];
    subtitleTracks: SubtitleTrackData[];
    directedBy: string;
    writtenBy: string;
    nameLock: boolean;
    yearLock: boolean;
    orderLock: boolean;
    overviewLock: boolean;
    directedLock: boolean;
    writtenLock: boolean;
}