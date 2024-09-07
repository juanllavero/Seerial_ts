import propertiesReader from 'properties-reader';
import { Episode, EpisodeGroupResponse, EpisodeResult, MovieDb, ShowResponse, TvEpisodeGroupsResponse, TvSeasonResponse } from 'moviedb-promise';
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
                
                /*if (seasonFull !== null)
                    seasonsMetadata.push(seasonFull);*/
            }
        });

        // Download Episodes Group Metadata
        let episodesGroup = undefined;
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
        }else if (show.getSeasons().length > 1){
            //If two seasons have the same name
            if (show.getSeasons()[0].getName() === show.getSeasons()[1].getName()){
                show.seasons.forEach(season => {
                    if (season.getSeasonNumber() !== 0)
                        season.setName("Season " + season.getSeasonNumber());
                });
            }
        }

        if (show.getSeasons().length === 0)
            library.getAnalyzedFolders().delete(show.getFolder());
        else
            console.log(library);
    };

    private static async processEpisode(libary: Library, show: Series, video: string, seasonsMetadata: TvSeasonResponse[], episodesGroup: EpisodeGroupResponse | undefined, exist: boolean) {
        //SeasonMetadataBasic and episode metadata to find for the current file
        let seasonMetadata: TvSeasonResponse | null = null;
        let episodeMetadata: Episode | null = null;

        let realSeason: number | undefined = 0;
        let realEpisode: number | undefined = -1;

        //Name of the file without the extension
        let fullName = path.parse(video).name;
        let seasonEpisode: [number, number?] = this.extractEpisodeSeason(fullName);

        if (!Number.isNaN(seasonEpisode))
            return;

        //If there is no season and episode numbers
        if (!seasonEpisode[1]){
            const absoluteNumber = seasonEpisode[0];
            let episodeFound = false;
            let episodeNumber = 1;

            //Find the real season and episode for the file
            for (const season of seasonsMetadata) {
                if (season.season_number && season.season_number >= 1) {
                  if (season.episodes && (episodeNumber + season.episodes.length) < absoluteNumber) {
                    episodeNumber += season.episodes.length;
                    continue;
                  }

                  if (season.episodes){
                    for (let i = 0; i < season.episodes.length; i++) {
                        if (episodeNumber === absoluteNumber) {
                          episodeMetadata = season.episodes[i];
                          seasonMetadata = season;
                          episodeFound = true;
                          break;
                        }
                        episodeNumber++;
                      }
                  }
                }
        
                if (episodeFound) break;
            }
    
            if (!episodeFound) return;
        } else {
            const [episodeNumber, seasonNumber] = seasonEpisode;
    
            realSeason = seasonNumber;
            realEpisode = episodeNumber;
    
            let toFindMetadata = true;
            for (const season of seasonsMetadata) {
                if (season.season_number === seasonNumber) {
                    toFindMetadata = false;
                    break;
                }
            }
    
            if (toFindMetadata || !show.getEpisodeGroupID()) {
                if (!episodesGroup) {
                    episodesGroup = await this.moviedb?.episodeGroup({ id: show.episodeGroupID });
                }
    
                if (episodesGroup && episodesGroup.groups) {
                    let found = false;
                    for (const episodeGroup of episodesGroup.groups) {
                        if (episodeGroup.order !== seasonNumber || !episodeGroup.episodes) continue;
            
                        for (const episode of episodeGroup.episodes) {
                            if (episode.order && (episode.order + 1) === episodeNumber) {
                                realSeason = episode.season_number;
                                realEpisode = episode.episode_number;
                                found = true;
                                break;
                            }
                        }
            
                        if (found) break;
                    }   
        
                    for (const seasonMeta of seasonsMetadata) {
                        if (seasonMeta.season_number === realSeason && seasonMeta.episodes) {
                            seasonMetadata = seasonMeta;
            
                            for (const episodeMeta of seasonMeta.episodes) {
                                if (episodeMeta.episode_number === realEpisode) {
                                    episodeMetadata = episodeMeta;
                                    break;
                                }
                            }
            
                            break;
                        }
                    }
                } else return;
            } else {
                for (const seasonMeta of seasonsMetadata) {
                    if (seasonMeta.season_number === realSeason) {
                        seasonMetadata = seasonMeta;
            
                        for (const episodeMeta of seasonMeta.episodes) {
                            if (episodeMeta.episode_number === realEpisode) {
                                episodeMetadata = episodeMeta;
                                break;
                            }
                        }
        
                        break;
                    }
                }
            }
        }

        if (!seasonMetadata || !episodeMetadata) return;
    
        let season: Season | null = null;
        if (realEpisode !== -1) {
            season = show.getSeasons()[realSeason] ?? new Season();
        } else if (seasonMetadata.season_number) {
            season = show.getSeasons()[seasonMetadata.season_number] ?? new Season();
        }
    
        if (season === null) {
            season = new Season();
            show.addSeason(season);
    
            season.setName(seasonMetadata.name);
            season.setOverview(seasonMetadata.overview);
            season.setYear(seasonMetadata.episodes[0].air_date.split('-')[0]);
            season.setProductionStudios(series.getProductionStudios());
            season.setSeasonNumber(realEpisode !== -1 ? realSeason : seasonMetadata.season_number);
            season.setScore(seasonMetadata.vote_average);
    
            if (!season.getBackgroundSrc() || season.getBackgroundSrc() === 'resources/img/DefaultBackground.png') {
            // Add logic for saving backgrounds if needed
            }
    
            // Add additional functionality for downloading and setting credits, logos, etc.
        }
    
        let episode: Episode;
        if (realEpisode !== -1) {
            episode = season.getEpisode(realEpisode) ?? new Episode();
        } else {
            episode = season.getEpisode(episodeMetadata.episode_number) ?? new Episode();
        }
    
        if (episode) {
            episode.setVideoSrc(video);
        } else {
            episode = new Episode();
            season.addEpisode(episode);
            episode.setSeasonID(season.getId());
            episode.setVideoSrc(video);
            // Set episode data and fetch media info
        }
    };

    /**
     * Function to detec episode and season numbers in a video file name
     * @param filename path to the video file
     * @returns array of 1 to 2 elements corresponding with the episode and season number detected, or NaN if no episode was found
     */
    private static extractEpisodeSeason(filename: string): [number, number?] {
        const regexPatterns = [
          /[Ss](\d{1,4})[Ee](\d{1,4})/i,       // S01E02, s1e2, S1.E2
          /[Ss](\d{1,4})[\.]?E(\d{1,4})/i,     // S1.E2
          /[Ss](\d{1,4})[\s\-]+Ep?(\d{1,4})/i, // S01 E02, S1 E2
          /(?:\b|^)(\d{1,4})(?:[^\d]+(\d{1,4}))?/i, // 2 or "3 - 2" or "Title 720p - 2"
        ];
      
        for (const regex of regexPatterns) {
          const match = filename.match(regex);
          if (match) {
            const episode = parseInt(match[2] ?? match[1], 10); // Extract episode
            const season = match[2] ? parseInt(match[1], 10) : undefined; // Extract season if present
            return season ? [episode, season] : [episode];
          }
        }
      
        return [NaN]; // Return NaN if no episode found
    }

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