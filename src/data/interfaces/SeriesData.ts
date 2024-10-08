import {SeasonData} from "@interfaces/SeasonData"
import { CastData } from "./CastData";

export interface SeriesData{
    id: string;
    
    //Common data
    name: string;
    overview: string;
    coverSrc: string;
    nameLock: boolean;
    overviewLock: boolean;

    //Show
    year: string;
    score: number;
    tagline: string;
    logoSrc: string;
    creator: string[];
    genres: string[];
    cast: CastData[];
    musicComposer: string[];
    productionStudios: string[];
    yearLock: boolean;
    studioLock: boolean;
    taglineLock: boolean;
    creatorLock: boolean;
    musicLock: boolean;
    genresLock: boolean;

    //Other
    themdbID: number;
    isCollection: boolean;
    order: number;
    numberOfSeasons: number;
    numberOfEpisodes: number;
    folder: string;
    videoZoom: number;
    episodeGroupID: string;
    seasons: SeasonData[];
    playSameMusic: boolean;
    analyzingFiles: boolean;
    currentlyWatchingSeason: number;
}