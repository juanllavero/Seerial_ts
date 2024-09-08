import propertiesReader from 'properties-reader';
import { Episode, EpisodeGroupResponse, MovieDb, ShowResponse, TvSeasonResponse } from 'moviedb-promise';
import { Series } from './Series';
import { Library } from './Library';
import * as fs from 'fs';
import * as path from 'path';
import { Utils } from './Utils';
import { Season } from './Season';
import { Episode as EpisodeLocal } from './Episode';
import { Cast } from './Cast';
import { EpisodeData } from '@interfaces/EpisodeData';
import { BrowserWindow } from 'electron';

export class MetadataManager {
    static win: BrowserWindow | null;
    static moviedb: MovieDb | undefined;
    static library: Library;

    public static initConnection = (window: BrowserWindow | null): boolean => {
        if (this.moviedb)
            return true;

        this.win = window;

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

    public static async scanFiles(newLibrary: Library): Promise<Library | undefined> {
        if (!newLibrary)
            return undefined;
        
        this.library = newLibrary;
        
        let showsLibrary: boolean = this.library.type === "Shows";
        for (const rootFolder of this.library.folders) {
            const filesInFolder = await Utils.getFilesInFolder(rootFolder);

            for (const file of filesInFolder) {
                if (showsLibrary){
                    await this.scanTVShow(file.parentPath + "\\" + file.name);
                }else{
                    console.log("MovieScan");
                }
            }
        }

        return newLibrary;
    };

    public static async scanTVShow(folder: string): Promise<Series | undefined> {
        if (!this.moviedb)
            return undefined;

        const videoFiles = await Utils.getValidVideoFiles(folder);

        if (videoFiles.length === 0)
            return undefined;

        let showData;
        let show: Series | null;

        let exists: boolean = false;
        if (this.library.getAnalyzedFolders().get(folder)){
            show = this.library.getSeriesById(this.library.getAnalyzedFolders().get(folder) ?? "");

            if (show === null)
                return undefined;

            exists = true;
        }else{
            show = new Series();
            show.setFolder(folder);
            this.library.getAnalyzedFolders().set(folder, show.getId());
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

            if (!year)
                year = "1";
            //#endregion

            // Search for the show
            try{
                const res = await this.moviedb.searchTv({ query: `${finalName}`, year: Number.parseInt(year), page: 1 });
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

        showData = await this.moviedb.tvInfo({ id: `${themdbID}`, language: this.library.getLanguage() });

        await this.setSeriesMetadataAndImages(show, showData, exists);

        // Descargar metadatos de cada temporada
        let seasonsMetadata: TvSeasonResponse[] = [];
        if (showData.seasons) {
            const seasonPromises = showData.seasons.map(async seasonBasic => {
                if (this.moviedb && showData.id && seasonBasic.season_number) {
                    const seasonFull = await this.moviedb.seasonInfo({ id: showData.id, season_number: seasonBasic.season_number, language: this.library.getLanguage() });
                    return seasonFull; // Devolver el resultado para añadirlo a seasonsMetadata
                }
            });

            // Esperar a que todas las promesas se resuelvan
            seasonsMetadata = (await Promise.all(seasonPromises)).filter(Boolean) as TvSeasonResponse[];
        }

        if (seasonsMetadata?.length === 0)
            return;

        // Download Episodes Group Metadata
        let episodesGroup = undefined;
        if (show.episodeGroupID !== "")
            episodesGroup = await this.moviedb?.episodeGroup({ id: show.themdbID});

        await this.processEpisodes(videoFiles, show, seasonsMetadata, episodesGroup, exists);
        
        if (show.getSeasons().length === 0){
            this.library.getAnalyzedFolders().delete(show.getFolder());
            return undefined;
        }

        this.library.series.push(show);
        return show;
    };

    private static async processEpisodes(videoFiles: string[], show: Series, seasonsMetadata: TvSeasonResponse[], episodesGroup: EpisodeGroupResponse | undefined, exists: boolean) {
        // Process each episode
        const processPromises = videoFiles.map(async video => {
            if (this.library.getAnalyzedFiles().get(video) == null) {
                await this.processEpisode(show, video, seasonsMetadata, episodesGroup, exists);
            }
        });
        
        // Esperar a que todas las promesas se resuelvan
        await Promise.all(processPromises);

        // Change the name of every season to match the Episodes Group
        if (show.getEpisodeGroupID() !== "" && episodesGroup) {
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
    }

    private static async processEpisode(show: Series, video: string, seasonsMetadata: TvSeasonResponse[], episodesGroup: EpisodeGroupResponse | undefined, exists: boolean) {
        //SeasonMetadataBasic and episode metadata to find for the current file
        let seasonMetadata: TvSeasonResponse | null = null;
        let episodeMetadata: Episode | null = null;

        let realSeason: number | undefined = 0;
        let realEpisode: number | undefined = -1;

        //Name of the file without the extension
        let fullName = path.parse(video).name;
        let seasonEpisode: [number, number?] = this.extractEpisodeSeason(fullName);

        if (Number.isNaN(seasonEpisode))
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
    
            if (toFindMetadata && show.getEpisodeGroupID() !== "") {
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
            }
        }

        if (!seasonMetadata || !episodeMetadata) return;
    
        let season: Season | undefined;
        if (realEpisode !== -1 && realSeason) {
            season = show.getSeason(realSeason);
        } else if (seasonMetadata.season_number) {
            season = show.getSeason(seasonMetadata.season_number);
        }
    
        if (!season) {
            season = new Season();
            show.addSeason(season);
    
            season.setName(seasonMetadata.name ?? "");
            season.setOverview(seasonMetadata.overview ?? "");
            season.setYear(seasonMetadata.episodes && seasonMetadata.episodes[0] && seasonMetadata.episodes[0].air_date ? seasonMetadata.episodes[0].air_date : "");
            season.setSeasonNumber(realEpisode !== -1 ? realSeason ?? 0 : (seasonMetadata.season_number ?? 0));
    
            if (!season.getBackgroundSrc() || season.getBackgroundSrc() === 'resources/img/DefaultBackground.png') {
                if (show.getSeasons().length > 1) {
                    let s: any = undefined;

                    show.seasons.forEach(seasonToFind => {
                        if (seasonToFind.getBackgroundSrc() !== "")
                            s = seasonToFind;
                    });

                    if (s)
                        await Utils.saveBackground(season, s.getBackgroundSrc(), true);
                } else {
                    const filePath: string = "resources/img/DownloadCache/" + show.getThemdbID() + ".jpg";
                    if (Utils.fileExists(filePath))
                        await Utils.saveBackground(season, filePath, false);
                    else
                        await Utils.saveBackground(season, "resources/img/DefaultBackground.png", false);
                }
            }

            if (season.getSeasonNumber() === 0)
                season.setOrder(100);
        }
    
        let episode: EpisodeLocal | undefined;
        if (realEpisode && realEpisode !== -1) {
            episode = season.getEpisode(realEpisode);
        } else if (episodeMetadata.episode_number){
            episode = season.getEpisode(episodeMetadata.episode_number);
        }
    
        if (episode) {
            episode.setVideoSrc(video);
        } else {
            episode = new EpisodeLocal();
            season.addEpisode(episode);
            episode.setSeasonID(season.getId());
            episode.setVideoSrc(video);
            episode.setSeasonNumber(season.seasonNumber);

            this.library.getAnalyzedFiles().set(video, episode.id);

            // Set Metadata
            episode.setName(episodeMetadata?.name ?? "");
            episode.setOverview(episodeMetadata?.overview ?? "");
            episode.setYear(episodeMetadata?.air_date ?? "");
            episode.setScore(episodeMetadata?.vote_average ? (((episodeMetadata.vote_average * 10.0)) / 10.0) : 0);
            episode.setRuntime(episodeMetadata?.runtime ?? 0);

            if (realEpisode && realEpisode != -1)
                episode.setEpisodeNumber(realEpisode);
            else
                episode.setEpisodeNumber(episodeMetadata.episode_number ?? 0);

            if (episodeMetadata.crew){
                if (!episode.directedLock){
                    episode.directedBy.splice(0, episode.directedBy.length);
                    episodeMetadata.crew.forEach(person => {
                        if (person.name && person.job === "Director") episode?.directedBy.push(person.name);
                    });
                }

                if (!episode.writtenLock){
                    episode.writtenBy.splice(0, episode.writtenBy.length);
                    episodeMetadata.crew.forEach(person => {
                        if (person.name && person.job === "Writer") episode?.writtenBy.push(person.name);
                    });
                }
            }

            let episodeData: EpisodeData | undefined = await Utils.getMediaInfo(episode);

            if (episodeData){
                if (episodeData.mediaInfo)
                    episode.mediaInfo = episodeData.mediaInfo;

                if (episodeData.videoTracks)
                    episode.videoTracks = episodeData.videoTracks;

                if (episodeData.audioTracks)
                    episode.audioTracks = episodeData.audioTracks;

                if (episodeData.subtitleTracks)
                    episode.subtitleTracks = episodeData.subtitleTracks;

                if (episodeData.chapters)
                    episode.chapters = episodeData.chapters;
            }

            if (episodeMetadata.season_number && episodeMetadata.episode_number){
                const images = await this.moviedb?.episodeImages({ id: show.themdbID, season_number: episodeMetadata.season_number, episode_number: episodeMetadata.episode_number })
            
                let imageBaseURL = "https://image.tmdb.org/t/p/original";
                let thumbnails = images?.stills || [];

                const outputDir = Utils.getExternalPath('resources/img/thumbnails/video/' + episode.id + "/");
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir);
                }

                // Download thumbnails
                for (const thumbnail of thumbnails) {
                    if (thumbnail.file_path){
                        const url = `${imageBaseURL}${thumbnail.file_path}`;
                        const imageFilePath = path.join(outputDir, thumbnails.indexOf(thumbnail) + ".jpg");
                        await Utils.downloadImage(url, imageFilePath);

                        if (thumbnails.indexOf(thumbnail) === 0){
                            episode.imgSrc = "resources/img/thumbnails/video/" + episode.id + "/" + thumbnails.indexOf(thumbnail) + ".jpg";
                        }
                    }
                }
            }
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
            /(?:\b|^)(\d{1,4})(?:[^\d]+(\d{1,4}))?/i, // General case, exclude the first number for episodes
        ];
    
        for (const regex of regexPatterns) {
            const match = filename.match(regex);
            if (match) {
                let episode, season;
                if (regex === regexPatterns[3] && match[2]) {
                    // Only consider the second number as the episode if two numbers are present
                    episode = parseInt(match[2], 10);
                    season = undefined;
                } else {
                    episode = parseInt(match[2] ?? match[1], 10);
                    season = match[2] ? parseInt(match[1], 10) : undefined;
                }
                return season ? [episode, season] : [episode];
            }
        }
    
        return [NaN]; // Return NaN if no episode found
    }

    private static async setSeriesMetadataAndImages(show: Series, showData: ShowResponse, exists: boolean) {
        show.name = !show.nameLock ? showData.name ?? "" : "";
        show.year = !show.yearLock ? showData.first_air_date ?? "" : "";
        show.overview = !show.overviewLock ? showData.overview ?? "" : "";
        show.score = showData.vote_average ? (((showData.vote_average * 10.0)) / 10.0) : 0;
        show.numberOfSeasons = showData.number_of_seasons ?? 0;
        show.numberOfEpisodes = showData.number_of_episodes ?? 0;
        show.productionStudios = show.studioLock ? showData.production_companies ? showData.production_companies.map(company => company.name ?? "") : [""] : [""];
        show.genres = !show.genresLock ? showData.genres ? showData.genres.map(genre => genre.name ?? "") : [""] : [""];
        show.tagline = !show.taglineLock ? showData.tagline ?? "" : "";
        show.playSameMusic = true;

        show.creator = !show.creatorLock ? showData.created_by ? showData.created_by.map(creator => creator.name ?? "") : [""] : [""];

        const credits = await this.moviedb?.tvCredits({ id: show.themdbID });
        
        if (credits && credits.cast){
            if (show.cast.length > 0)
                show.cast.splice(0, show.cast.length);

            credits.cast.forEach(person => {
                show.cast?.push(new Cast(person.name, person.character));
            });
        }

        if (credits && credits.crew){
            if (show.creator.length > 0)
                show.creator.splice(0, show.creator.length);

            if (show.musicComposer.length > 0)
                show.musicComposer.splice(0, show.musicComposer.length);

            credits.crew.forEach(person => {
                if (person.job && (person.job === "Author" || person.job === "Novel" || person.job === "Original Series Creator"
                        || person.job === "Comic Book" || person.job === "Idea" || person.job === "Original Story" || person.job === "Story"
                        || person.job === "Story by" || person.job === "Book"))
                    if (person.name && !show.creatorLock) show.creator.push(person.name);
                
                if (person.job && person.job === "Original Music Composer")
                    if (person.name && !show.musicLock) show.musicComposer.push(person.name);
            });
        }

        await this.downloadLogosAndPosters(show.themdbID, show, false);

        // Mandar library y show a React
    };

    private static async downloadLogosAndPosters(themoviedbID: number, show: Series, onlyPosters: boolean) {
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

            const outputImageDir = Utils.getExternalPath('resources/img/DownloadCache');
            if (!fs.existsSync(outputImageDir)) {
              fs.mkdirSync(outputImageDir);
            }

            // Download season background
            if (!onlyPosters && images.backdrops && images.backdrops.length > 1 && images.backdrops[0].file_path){
                const imageUrl = `${baseUrl}${images.backdrops[0].file_path}`;
                const imageFilePath = path.join(outputImageDir, show.themdbID + ".jpg");
                await Utils.downloadImage(imageUrl, imageFilePath);
            }
        
            // Download logos
            for (const logo of logos) {
                if (logo.file_path){
                    const logoUrl = `${baseUrl}${logo.file_path}`;
                    const logoFilePath = path.join(outputLogosDir, `${logo.file_path.split('/').pop()}`);
                    await Utils.downloadImage(logoUrl, logoFilePath);

                    if (logos.indexOf(logo) === 0){
                        show.logoSrc = "resources/img/logos/" + show.id + "/" + `${logo.file_path.split('/').pop()}`;
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
                        console.log(show.name);
                        show.coverSrc = "resources/img/posters/" + show.id + "/" + `${poster.file_path.split('/').pop()}`;;
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