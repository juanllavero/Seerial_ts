import {ChapterData} from "@interfaces/ChapterData"
import {MediaInfoData} from "@interfaces/MediaInfoData"
import {AudioTrackData} from "@interfaces/AudioTrackData"
import {SubtitleTrackData} from "@interfaces/SubtitleTrackData"
import {VideoTrackData} from "@interfaces/VideoTrackData"

export interface EpisodeData{
    id: string;

    //Common data
    name: string;
    overview: string;
    year: string;
    nameLock: boolean;
    yearLock: boolean;
    overviewLock: boolean;

    //Show
    score: number;
    imdbScore: number;
    directedBy: string[];
    writtenBy: string[];
    directedLock: boolean;
    writtenLock: boolean;

    order: number;
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
}