import {SeasonData} from "@interfaces/SeasonData"

export interface SeriesData{
    id: string;
    themdbID: number;
    name: string;
    overview: string;
    year: string;
    score: number;
    order: number;
    numberOfSeasons: number;
    coverSrc: string;
    logoSrc: string;
    folder: string;
    videoZoom: number;
    episodeGroupID: string;
    seasons: SeasonData[];
    genres: string[];
    playSameMusic: boolean;
    analyzingFiles: boolean;
    currentlyWatchingSeason: number;
    productionStudios: string;
    isCollection: boolean;
}