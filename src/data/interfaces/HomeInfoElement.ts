import { EpisodeData } from "./EpisodeData";
import { LibraryData } from "./LibraryData";
import { SeasonData } from "./SeasonData";
import { SeriesData } from "./SeriesData";

export interface HomeInfoElement {
    library: LibraryData, 
    show: SeriesData, 
    season: SeasonData,
    episode: EpisodeData
}