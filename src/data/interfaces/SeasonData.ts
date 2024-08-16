import {EpisodeData} from "@interfaces/EpisodeData"
import {CastData} from "@interfaces/CastData"

export interface SeasonData{
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
    episodes: EpisodeData[];
    genres: string[];
    currentlyWatchingEpisode: number;
    cast: CastData[];
    creator: string;
    musicComposer: string;
    directedBy: string;
    writtenBy: string;
    productionStudios: string;
}