import propertiesReader from 'properties-reader';
import { MovieDb, ShowResponse, TvEpisodeGroupsResponse, TvSeasonResponse } from 'moviedb-promise';
import { Series } from './Series';
import { Library } from './Library';
import * as fs from 'fs';
import * as path from 'path';
import { Utils } from './Utils';
import { Season } from './Season';

export class MetadataManager {
    static moviedb: MovieDb | undefined;

    public static initConnection = (): boolean => {
        const properties = propertiesReader('keys.properties');

        // Obtener la clave API
        const apiKey = properties.get('TMDB_API_KEY');

        if (apiKey) {
            this.moviedb = new MovieDb(String(apiKey));

            if (!this.moviedb){
                console.error('This App needs an API Key from TheMovieDB');
                return false;
            }

            return true;
        } else {
            console.error('This App needs an API Key from TheMovieDB');
            return false;
        }
    };

    public static scanShow = async (library: Library, folder: string): Promise<Series | undefined> => {
        if (!this.moviedb)
            return undefined;

        const videoFiles = await Utils.getValidVideoFiles(folder);

        if (videoFiles.length === 0)
            return undefined;

        let showData;
        let show: Series | null;

        let exists: boolean = false;
        if (library.getAnalyzedFolders().get(folder)){
            show = library.getSeriesById(library.getAnalyzedFolders().get(folder) ?? "");

            if (show === null)
                return undefined;

            exists = true;
        }else{
            show = new Series();
            show.setFolder(folder);
            library.getAnalyzedFolders().set(folder, show.getId());
        }

        let themdbID = show.getThemdbID();

        if (themdbID === -1){
            //#region EXTRACT NAME AND YEAR
            let finalName: string = folder.split(/[/\\]/).pop() ?? "";

            // Remove parenthesis
            const nameWithoutParenthesis: string = finalName.replace(/[()]/g, "");

            // Regular expression to extract name and year
            const pattern = /^(.*?)(?:\s(\d{4}))?$/;

            let year: string | undefined = undefined;

            const matcher = nameWithoutParenthesis.match(pattern);

            if (matcher) {
                finalName = matcher[1];
                year = matcher[2];
            }
            //#endregion

            // Search for the show
            try{
                const res = await this.moviedb.searchTv({ query: `${finalName}`, page: 1 });
                if (res && res.results){
                    themdbID = res.results[0].id ?? -1;
                    show.themdbID = themdbID;

                    if (themdbID === -1)
                        return undefined;
                }else{
                    console.log("scanShow: show not found" + folder);
                    return undefined;
                }
            } catch (e) {
                console.log("scanShow: search for show has failed with error " + e);
                return undefined;
            }
        }

        showData = await this.moviedb.tvInfo({ id: `${themdbID}`, language: library.getLanguage() });

        this.setSeriesMetadataAndImages(library, show, showData, exists);

        // Download metadata for each season
        let seasonsMetadata: TvSeasonResponse[];
        showData.seasons?.forEach(async seasonBasic => {
            if (this.moviedb && showData.id && seasonBasic.season_number){
                const seasonFull = await this.moviedb.seasonInfo({ id: showData.id, season_number: seasonBasic.season_number, language: library.getLanguage() });
                
                if (seasonFull !== null)
                    seasonsMetadata.push(seasonFull);
            }
        });

        // Download Episodes Group Metadata
        let episodesGroup = null;
        if (show.episodeGroupID !== "")
            episodesGroup = await this.moviedb?.episodeGroup({ id: show.themdbID});

        // Process each episode
        videoFiles.forEach(video => {
            if (library.getAnalyzedFiles().get(video) == null){
                this.processEpisode(library, show, video, seasonsMetadata, episodesGroup, exists);
            }
        });

        // Change the name of every season to match the Episodes Group
        if (show.getEpisodeGroupID() !== "" && episodesGroup != null) {
            show.seasons.forEach(season => {
                if (episodesGroup.groups){
                    episodesGroup.groups.forEach(group => {
                        if (group.order == season.getSeasonNumber()) {
                            season.setName(group.name ?? season.name);
                        }
                    });
                }
            });
        }else if (series.getSeasons().size() > 1){
            //If two seasons have the same name
            if (series.getSeasons().getFirst().getName().equals(series.getSeasons().get(1).getName())){
                for (Season season : series.getSeasons()){
                    if (season.getSeasonNumber() != 0)
                        season.setName(App.textBundle.getString("season") + " " + season.getSeasonNumber());
                }
            }
        }

        if (series.getSeasons().isEmpty())
            library.getAnalyzedFolders().remove(series.getFolder());
    };

    private static async processEpisode(libary: Library, video: string, seasonsMetadata: TvSeasonResponse, episodesGroup: TvEpisodeGroupsResponse, exist: boolean) {

    };

    private static async setSeriesMetadataAndImages(library: Library, show: Series, showData: ShowResponse, exists: boolean) {
        show.name = showData.name ?? "";
        show.year = showData.first_air_date ?? "";
        show.overview = showData.overview ?? "";
        show.score = showData.vote_average ? (((showData.vote_average * 10.0)) / 10.0) : 0;
        show.numberOfSeasons = showData.number_of_seasons ?? 0;
        show.numberOfEpisodes = showData.number_of_episodes ?? 0;
        show.productionStudios = showData.production_companies ? showData.production_companies.map(company => company.name ?? "") : [""];
        show.genres = showData.genres ? showData.genres.map(genre => genre.name ?? "") : [""];
        show.tagline = showData.tagline ?? "";
        show.playSameMusic = true;

        this.downloadLogosAndPosters(library, show.themdbID, show, false);

        // Mandar library y show a React
    };

    private static async downloadLogosAndPosters(library: Library, themoviedbID: number, show: Series, onlyPosters: boolean) {
        if (!this.moviedb)
            return;

        try {
            // Get images
            const images = await this.moviedb.tvImages({ id: themoviedbID });
        
            const baseUrl = 'https://image.tmdb.org/t/p/original';
        
            const logos = images.logos || [];
            const posters = images.posters || [];
        
            // Create folders if they do not exist
            const outputLogosDir = Utils.getExternalPath('resources/img/logos/' + show.id);
            if (!fs.existsSync(outputLogosDir)) {
              fs.mkdirSync(outputLogosDir);
            }

            const outputPostersDir = Utils.getExternalPath('resources/img/posters/' + show.id);
            if (!fs.existsSync(outputPostersDir)) {
              fs.mkdirSync(outputPostersDir);
            }
        
            // Download logos
            for (const logo of logos) {
                if (logo.file_path){
                    const logoUrl = `${baseUrl}${logo.file_path}`;
                    const logoFilePath = path.join(outputLogosDir, `${logo.file_path.split('/').pop()}`);
                    await Utils.downloadImage(logoUrl, logoFilePath);

                    if (logos.indexOf(logo) === 0){
                        show.logoSrc = logoFilePath;
                    }
                }
            }
        
            // Download posters
            for (const poster of posters) {
                if (poster.file_path){
                    const posterUrl = `${baseUrl}${poster.file_path}`;
                    const posterFilePath = path.join(outputPostersDir, `${poster.file_path.split('/').pop()}`);
                    await Utils.downloadImage(posterUrl, posterFilePath);

                    if (posters.indexOf(poster) === 0){
                        show.coverSrc = posterFilePath;
                    }
                }
            }
          } catch (error) {
            console.error('Error al descargar imágenes:', error);
          }
    };

    public static async scanMovie(): Promise<string> {
        return '';
    };
}