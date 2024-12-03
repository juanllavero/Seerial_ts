import propertiesReader from "properties-reader";
import {
	Episode,
	EpisodeGroupResponse,
	MovieDb,
	MovieResponse,
	ShowResponse,
	TvSeasonResponse,
} from "moviedb-promise";
import { Series } from "../objects/Series";
import { Library } from "../objects/Library";
import fs from "fs-extra";
import * as path from "path";
import { Utils } from "./Utils";
import { Season } from "../objects/Season";
import { Episode as EpisodeLocal } from "../objects/Episode";
import { Cast } from "../objects/Cast";
import { EpisodeData } from "@interfaces/EpisodeData";
import { BrowserWindow } from "electron";
import { LibraryData } from "@interfaces/LibraryData";
import ffmetadata from "ffmetadata";
import os from 'os';
import pLimit from 'p-limit';

export class DataManager {
	static DATA_PATH: string = "./src/data/data.json";
	static libraries: Library[] = [];

	// Number of threads (2 are already being used by this app, so -4 to leave some space for other apps)
	static availableThreads = Math.max(os.cpus().length - 4, 1);

	// Metadata attributes
	static win: BrowserWindow | null;
	static moviedb: MovieDb | undefined;
	static library: Library;
	static imageLangs: string[] = ["es", "en", "ja"];

	public static initFolders = async () => {
		this.createFolder("resources/");
		this.createFolder("resources/img/");
		this.createFolder("resources/img/posters/");
		this.createFolder("resources/img/logos/");
		this.createFolder("resources/img/backgrounds/");
		this.createFolder("resources/img/thumbnails/");
		this.createFolder("resources/img/thumbnails/video/");
		this.createFolder("resources/img/thumbnails/chapters/");
		this.createFolder("resources/img/DownloadCache/");
	};

	public static getLibraries(): Library[] {
		return this.libraries;
	}

	public static addLibrary(newLibrary: Library) {
		if (!this.libraries.includes(newLibrary)) this.libraries.push(newLibrary);
	}

	//#region JSON LOAD AND SAVE
	/**
	 * Function to load libraries stored in a JSON file
	 * @returns LibraryData[] array with libraries
	 */
	public static loadData = (): any => {
		if (this.libraries.length === 0) {
			try {
				const data = fs.readFileSync(this.DATA_PATH, "utf8");

				const jsonData: LibraryData[] = JSON.parse(data);

				this.libraries = jsonData.map((libraryData: any) =>
					Library.fromJSON(libraryData)
				);

				return jsonData;
			} catch (err) {
				console.error("Error reading data.json");
				return [];
			}
		} else {
			return this.libraries;
		}
	};

	// Save data in JSON
	public static saveData = (newData: any) => {
		try {
			fs.writeFileSync(this.DATA_PATH, JSON.stringify(newData), "utf8");
			return true;
		} catch (err) {
			console.error("Error saving data:", err);
			return false;
		}
	};
	//#endregion

	//#region ADD/UPDATE DATA
	public static updateEpisode(
		libraryId: string,
		seriesId: string,
		episode: EpisodeData
	) {
		const library = this.libraries.find(
			(library) => library.id === libraryId
		);

		if (library) {
			const series = library
				.getSeries()
				.find((series) => series.id === seriesId);

			if (series) {
				const season = series
					.getSeasons()
					.find((season) => season.id === episode.seasonID);

				if (season) {
					season.getEpisodes().forEach((item) => {
						if (item.id === episode.id) {
							item = EpisodeLocal.fromJSON(episode);
						}
					});
				}
			}
		}
	}
	//#endregion

	//#region DELETE DATA
	public static async deleteLibrary(library: LibraryData) {
		const libraryToFind = this.libraries.find((obj) => obj.id === library.id);

		if (!libraryToFind) return;

		for (const series of libraryToFind.series) {
			await this.deleteSeriesData(libraryToFind, series);
		}

		this.libraries = this.libraries.filter((obj) => obj.id !== library.id);

		if (this.library && this.library.id === library.id) {
			this.library = this.libraries[0] || undefined;
		}

		this.win?.webContents.send(
			"update-libraries",
			this.libraries.map((library: Library) => library.toLibraryData())
		);
	}

	public static async deleteSeriesData(library: Library, series: Series) {
		try {
			await fs.remove(path.join("resources", "img", "posters", series.id));
			await fs.remove(path.join("resources", "img", "logos", series.id));
		} catch (error) {
			console.error(
				"deleteSeriesData: Error deleting cover images directory",
				error
			);
		}

		for (const season of series.seasons) {
			await this.deleteSeasonData(library, season);
		}

		library.getAnalyzedFolders().delete(series.folder);
	}

	public static async deleteSeasonData(library: Library, season: Season) {
		try {
			await fs.remove(
				path.join("resources", "img", "backgrounds", season.id)
			);
			await fs.remove(path.join("resources", "img", "logos", season.id));
			await fs.remove(path.join("resources", "img", "posters", season.id));

			if (season.musicSrc) {
				await fs.remove(season.musicSrc);
			}
			if (season.videoSrc) {
				await fs.remove(season.videoSrc);
			}
		} catch (error) {
			console.error(
				"deleteSeasonData: Error deleting images files and directories",
				error
			);
		}

		for (const episode of season.episodes) {
			await this.deleteEpisodeData(library, episode);
		}

		library.getSeasonFolders().delete(season.folder);
	}

	public static async deleteEpisodeData(
		library: Library,
		episode: EpisodeLocal
	) {
		try {
			await fs.remove(
				path.join("resources", "img", "thumbnails", "video", episode.id)
			);
			await fs.remove(
				path.join("resources", "img", "thumbnails", "chapters", episode.id)
			);
		} catch (error) {
			console.error(
				"deleteEpisodeData: Error deleting directory: resources/img/discCovers/" +
					episode.id,
				error
			);
		}

		library.getAnalyzedFiles().delete(episode.videoSrc);
	}
	//#endregion

	//#region METADATA DOWNLOAD
	public static initConnection = (window: BrowserWindow | null): boolean => {
		if (this.moviedb) return true;

		this.win = window;

		const properties = propertiesReader("keys.properties");

		// Obtener la clave API
		const apiKey = properties.get("TMDB_API_KEY");

		if (apiKey) {
			this.moviedb = new MovieDb(String(apiKey));

			if (!this.moviedb) {
				console.error("This App needs an API Key from TheMovieDB");
				return false;
			}

			ffmetadata.setFfmpegPath(Utils.getInternalPath("lib/ffmpeg.exe"));

			return true;
		} else {
			console.error("This App needs an API Key from TheMovieDB");
			return false;
		}
	};

	public static async scanFiles(newLibrary: Library): Promise<Library | undefined> {
		if (!newLibrary) return undefined;
  
		this.library = newLibrary;
		this.addLibrary(newLibrary);
  
		this.win?.webContents.send(
			 "add-library",
			 this.library.toLibraryData(),
			 this.libraries.map((library: Library) => library.toLibraryData())
		);
  
		const isoLanguage = this.library.language.split("-")[0];
		if (!this.imageLangs.includes(isoLanguage)) this.imageLangs.push(isoLanguage);
  
		// Get available threads
		let availableThreads = Math.max(os.cpus().length - 3, 1);

		if (this.library.type === "Music") {
			availableThreads = Math.min(availableThreads, 4);
		}
		const limit = pLimit(availableThreads);
  
		const tasks: Promise<void>[] = [];
  
		for (const rootFolder of this.library.folders) {
			 const filesInFolder = await Utils.getFilesInFolder(rootFolder);
  
			 for (const file of filesInFolder) {
				  const filePath = file.parentPath + "\\" + file.name;
				  const task = limit(async () => {
						if (this.library.type === "Shows") {
							 await this.scanTVShow(filePath);
						} else if (this.library.type === "Movies") {
							 await this.scanMovie(filePath);
						} else {
							 await this.scanMusic(filePath);
						}
				  });
				  tasks.push(task);
			 }
		}
  
		Promise.all(tasks);
  
		this.win?.webContents.send(
			 "update-libraries",
			 this.libraries.map((library: Library) => library.toLibraryData())
		);
  
		return newLibrary;
  }

	public static async scanTVShow(folder: string) {
		if (!this.moviedb) return undefined;

		if (!(await Utils.isFolder(folder))) return undefined;

		const videoFiles = await Utils.getValidVideoFiles(folder);

		if (videoFiles.length === 0) return undefined;

		let showData;
		let show: Series | null;

		let exists: boolean = false;
		if (this.library.getAnalyzedFolders().get(folder)) {
			show = this.library.getSeriesById(
				this.library.getAnalyzedFolders().get(folder) ?? ""
			);

			if (show === null) return undefined;

			exists = true;
		} else {
			show = new Series();
			show.setFolder(folder);
			this.library.getAnalyzedFolders().set(folder, show.getId());
		}

		let themdbID = show.getThemdbID();

		if (themdbID === -1) {
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

			if (!year) year = "1";
			//#endregion

			// Search for the show
			try {
				const res = await this.moviedb.searchTv({
					query: `${finalName}`,
					year: Number.parseInt(year),
					page: 1,
				});
				if (res && res.results && res.results[0]) {
					themdbID = res.results[0].id ?? -1;
					show.themdbID = themdbID;

					if (themdbID === -1) return undefined;
				} else {
					console.log("scanShow: show not found" + folder);
					return undefined;
				}
			} catch (e) {
				console.log("scanShow: search for show has failed with error " + e);
				return undefined;
			}
		}

		showData = await this.moviedb.tvInfo({
			id: `${themdbID}`,
			language: this.library.getLanguage(),
		});

		await this.setSeriesMetadataAndImages(show, showData);

		show.setAnalyzingFiles(true);

		if (!exists) {
			// Add show to view
			this.win?.webContents.send(
				"series-added",
				this.library.id,
				show.toJSON()
			);
		}

		// Descargar metadatos de cada temporada
		let seasonsMetadata: TvSeasonResponse[] = [];
		if (showData.seasons) {
			const seasonPromises = showData.seasons.map(async (seasonBasic) => {
				if (this.moviedb && showData.id && seasonBasic.season_number) {
					const seasonFull = await this.moviedb.seasonInfo({
						id: showData.id,
						season_number: seasonBasic.season_number,
						language: this.library.getLanguage(),
					});
					return seasonFull; // Devolver el resultado para añadirlo a seasonsMetadata
				}
			});

			// Esperar a que todas las promesas se resuelvan
			seasonsMetadata = (await Promise.all(seasonPromises)).filter(
				Boolean
			) as TvSeasonResponse[];
		}

		if (seasonsMetadata?.length === 0) return;

		// Download Episodes Group Metadata
		let episodesGroup = undefined;
		if (show.episodeGroupID !== "")
			episodesGroup = await this.moviedb?.episodeGroup({
				id: show.themdbID,
			});

		await this.processEpisodes(
			videoFiles,
			show,
			seasonsMetadata,
			episodesGroup
		);

		if (show.getSeasons().length === 0) {
			this.library.getAnalyzedFolders().delete(show.getFolder());
			return undefined;
		}

		show.setAnalyzingFiles(false);
		this.library.series.push(show);

		// Update show in view
		this.win?.webContents.send(
			"series-updated",
			this.library.id,
			show.toJSON()
		);
	}

	private static async processEpisodes(
		videoFiles: string[],
		show: Series,
		seasonsMetadata: TvSeasonResponse[],
		episodesGroup: EpisodeGroupResponse | undefined
	) {
		// Process each episode
		const processPromises = videoFiles.map(async (video) => {
			if (this.library.getAnalyzedFiles().get(video) == null) {
				await this.processEpisode(
					show,
					video,
					seasonsMetadata,
					episodesGroup
				);
			}
		});

		// Esperar a que todas las promesas se resuelvan
		await Promise.all(processPromises);

		// Change the name of every season to match the Episodes Group
		if (show.getEpisodeGroupID() !== "" && episodesGroup) {
			show.seasons.forEach((season) => {
				if (episodesGroup.groups) {
					episodesGroup.groups.forEach((group) => {
						if (group.order == season.getSeasonNumber()) {
							season.setName(group.name ?? season.name);
						}
					});
				}
			});
		} else if (show.getSeasons().length > 1) {
			//If two seasons have the same name
			if (
				show.getSeasons()[0].getName() === show.getSeasons()[1].getName()
			) {
				show.seasons.forEach((season) => {
					if (season.getSeasonNumber() !== 0)
						season.setName("Season " + season.getSeasonNumber());
				});
			}
		}
	}

	private static async processEpisode(
		show: Series,
		video: string,
		seasonsMetadata: TvSeasonResponse[],
		episodesGroup: EpisodeGroupResponse | undefined
	) {
		//SeasonMetadataBasic and episode metadata to find for the current file
		let seasonMetadata: TvSeasonResponse | null = null;
		let episodeMetadata: Episode | null = null;

		let realSeason: number | undefined = 0;
		let realEpisode: number | undefined = -1;

		//Name of the file without the extension
		let fullName = path.parse(video).name;
		let seasonEpisode: [number, number?] =
			this.extractEpisodeSeason(fullName);

		if (Number.isNaN(seasonEpisode)) return;

		//If there is no season and episode numbers
		if (!seasonEpisode[1]) {
			const absoluteNumber = seasonEpisode[0];
			let episodeFound = false;
			let episodeNumber = 1;

			//Find the real season and episode for the file
			for (const season of seasonsMetadata) {
				if (season.season_number && season.season_number >= 1) {
					if (
						season.episodes &&
						episodeNumber + season.episodes.length < absoluteNumber
					) {
						episodeNumber += season.episodes.length;
						continue;
					}

					if (season.episodes) {
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
					episodesGroup = await this.moviedb?.episodeGroup({
						id: show.episodeGroupID,
					});
				}

				if (episodesGroup && episodesGroup.groups) {
					let found = false;
					for (const episodeGroup of episodesGroup.groups) {
						if (
							episodeGroup.order !== seasonNumber ||
							!episodeGroup.episodes
						)
							continue;

						for (const episode of episodeGroup.episodes) {
							if (episode.order && episode.order + 1 === episodeNumber) {
								realSeason = episode.season_number;
								realEpisode = episode.episode_number;
								found = true;
								break;
							}
						}

						if (found) break;
					}

					for (const seasonMeta of seasonsMetadata) {
						if (
							seasonMeta.season_number === realSeason &&
							seasonMeta.episodes
						) {
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
					if (
						seasonMeta.season_number === realSeason &&
						seasonMeta.episodes
					) {
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

			season.setSeriesID(show.id);
			season.setName(seasonMetadata.name ?? "");
			season.setOverview(seasonMetadata.overview ?? show.getOverview());
			season.setYear(
				seasonMetadata.episodes &&
					seasonMetadata.episodes[0] &&
					seasonMetadata.episodes[0].air_date
					? seasonMetadata.episodes[0].air_date
					: ""
			);
			season.setSeasonNumber(
				realEpisode !== -1
					? realSeason ?? 0
					: seasonMetadata.season_number ?? 0
			);

			const filePath: string =
				"resources/img/DownloadCache/" + show.getThemdbID() + ".jpg";
			if (Utils.fileExists(filePath))
				await Utils.saveBackground(season, filePath);
			else
				await Utils.saveBackground(
					season,
					"resources/img/DefaultBackground.png"
				);

			if (season.getSeasonNumber() === 0) season.setOrder(100);

			// Add season to view
			this.win?.webContents.send(
				"season-added",
				this.library.id,
				season.toJSON()
			);
		}

		let episode: EpisodeLocal | undefined;
		if (realEpisode && realEpisode !== -1) {
			episode = season.getEpisode(realEpisode);
		} else if (episodeMetadata.episode_number) {
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
			episode.setScore(
				episodeMetadata?.vote_average
					? (episodeMetadata.vote_average * 10.0) / 10.0
					: 0
			);
			episode.setRuntime(episodeMetadata?.runtime ?? 0);

			// Get runtime with ffmpeg
			if (episode.runtime === 0) {
				Utils.getOnlyRuntime(episode, episode.getVideoSrc());
			}

			if (realEpisode && realEpisode != -1)
				episode.setEpisodeNumber(realEpisode);
			else episode.setEpisodeNumber(episodeMetadata.episode_number ?? 0);

			if (episodeMetadata.crew) {
				if (!episode.directedLock) {
					episode.directedBy.splice(0, episode.directedBy.length);
					episodeMetadata.crew.forEach((person) => {
						if (person.name && person.job === "Director")
							episode?.directedBy.push(person.name);
					});
				}

				if (!episode.writtenLock) {
					episode.writtenBy.splice(0, episode.writtenBy.length);
					episodeMetadata.crew.forEach((person) => {
						if (person.name && person.job === "Writer")
							episode?.writtenBy.push(person.name);
					});
				}
			}

			await this.processMediaInfo(episode);

			if (episodeMetadata.season_number && episodeMetadata.episode_number) {
				const images = await this.moviedb?.episodeImages({
					id: show.themdbID,
					season_number: episodeMetadata.season_number,
					episode_number: episodeMetadata.episode_number,
				});

				let imageBaseURL = "https://image.tmdb.org/t/p/original";
				let thumbnails = images?.stills || [];

				const outputDir = Utils.getExternalPath(
					"resources/img/thumbnails/video/" + episode.id + "/"
				);
				if (!fs.existsSync(outputDir)) {
					fs.mkdirSync(outputDir);
				}

				// Download thumbnails
				for (const [index, thumbnail] of thumbnails.entries()) {
					if (thumbnail.file_path) {
						const url = `${imageBaseURL}${thumbnail.file_path}`;
						const imageFilePath = path.join(outputDir, index + ".jpg");

						if (episode.imgSrc === "") {
							await Utils.downloadImage(url, imageFilePath);
							episode.imgSrc = `resources/img/thumbnails/video/${episode.id}/${index}.jpg`;
						} else {
							Utils.downloadImage(url, imageFilePath);
						}
					}
				}
			}

			// Add episode to view
			this.win?.webContents.send(
				"episode-added",
				this.library.id,
				show.id,
				episode.toJSON()
			);
		}
	}

	/**
	 * Function to detec episode and season numbers in a video file name
	 * @param filename path to the video file
	 * @returns array of 1 to 2 elements corresponding with the episode and season number detected, or NaN if no episode was found
	 */
	private static extractEpisodeSeason(filename: string): [number, number?] {
		const regexPatterns = [
			/[Ss](\d{1,4})[Ee](\d{1,4})/i, // S01E02, s1e2, S1.E2
			/[Ss](\d{1,4})[\.]?E(\d{1,4})/i, // S1.E2
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

	private static async setSeriesMetadataAndImages(
		show: Series,
		showData: ShowResponse
	) {
		show.name = !show.nameLock ? showData.name ?? "" : "";
		show.year = !show.yearLock ? showData.first_air_date ?? "" : "";
		show.overview = !show.overviewLock ? showData.overview ?? "" : "";
		show.score = showData.vote_average
			? (showData.vote_average * 10.0) / 10.0
			: 0;
		show.numberOfSeasons = showData.number_of_seasons ?? 0;
		show.numberOfEpisodes = showData.number_of_episodes ?? 0;
		show.productionStudios = show.studioLock
			? show.productionStudios
			: showData.production_companies
			? showData.production_companies.map((company) => company.name ?? "")
			: [];
		show.genres = show.genresLock
			? show.genres
			: showData.genres
			? showData.genres.map((genre) => genre.name ?? "")
			: [];
		show.tagline = !show.taglineLock ? showData.tagline ?? "" : "";
		show.playSameMusic = true;

		const credits = await this.moviedb?.tvCredits({ id: show.themdbID });

		if (credits && credits.cast) {
			if (show.cast.length > 0) show.cast.splice(0, show.cast.length);

			credits.cast.forEach((person) => {
				show.cast?.push(new Cast(person.name, person.character));
			});
		}

		if (credits && credits.crew) {
			if (show.creator.length > 0)
				show.creator.splice(0, show.creator.length);

			if (show.musicComposer.length > 0)
				show.musicComposer.splice(0, show.musicComposer.length);

			credits.crew.forEach((person) => {
				if (
					person.job &&
					(person.job === "Author" ||
						person.job === "Novel" ||
						person.job === "Original Series Creator" ||
						person.job === "Comic Book" ||
						person.job === "Idea" ||
						person.job === "Original Story" ||
						person.job === "Story" ||
						person.job === "Story by" ||
						person.job === "Book" ||
						person.job === "Original Concept")
				)
					if (person.name && !show.creatorLock)
						show.creator.push(person.name);

				if (person.job && person.job === "Original Music Composer")
					if (person.name && !show.musicLock)
						show.musicComposer.push(person.name);
			});
		}

		if (show.creator.length === 0) {
			show.creator = showData.created_by
				? showData.created_by.map((person) => person.name ?? "")
				: [];
		}

		await this.downloadLogosAndPosters(show.themdbID, show, false);

		// Mandar library y show a React
	}

	private static async downloadLogosAndPosters(
		themoviedbID: number,
		show: Series,
		onlyPosters: boolean
	) {
		if (!this.moviedb) return;

		try {
			// Get images
			const images = await this.moviedb.tvImages({ id: themoviedbID });

			const baseUrl = "https://image.tmdb.org/t/p/original";

			const logos = images.logos || [];
			const posters = images.posters || [];

			// Create folders if they do not exist
			const outputLogosDir = Utils.getExternalPath(
				"resources/img/logos/" + show.id
			);
			if (!fs.existsSync(outputLogosDir)) {
				fs.mkdirSync(outputLogosDir);
			}

			const outputPostersDir = Utils.getExternalPath(
				"resources/img/posters/" + show.id
			);
			if (!fs.existsSync(outputPostersDir)) {
				fs.mkdirSync(outputPostersDir);
			}

			const outputImageDir = Utils.getExternalPath(
				"resources/img/DownloadCache"
			);
			if (!fs.existsSync(outputImageDir)) {
				fs.mkdirSync(outputImageDir);
			}

			// Download season background
			if (
				!onlyPosters &&
				images.backdrops &&
				images.backdrops.length > 1 &&
				images.backdrops[0].file_path
			) {
				const imageUrl = `${baseUrl}${images.backdrops[0].file_path}`;
				const imageFilePath = path.join(
					outputImageDir,
					show.themdbID + ".jpg"
				);
				await Utils.downloadImage(imageUrl, imageFilePath);
			}

			// Download logos
			for (const logo of logos) {
				if (
					logo.file_path &&
					(logo.iso_639_1 === null ||
						(logo.iso_639_1 && this.imageLangs.includes(logo.iso_639_1)))
				) {
					const logoUrl = `${baseUrl}${logo.file_path}`;
					const logoFilePath = path.join(
						outputLogosDir,
						logo.file_path.split("/").pop()!
					);

					if (show.logoSrc === "") {
						await Utils.downloadImage(logoUrl, logoFilePath);
						show.logoSrc = `resources/img/logos/${
							show.id
						}/${logo.file_path.split("/").pop()}`;
					} else {
						show.logosUrls = [...show.logosUrls, logoUrl];
						//Utils.downloadImage(logoUrl, logoFilePath);
					}
				}
			}

			// Download posters
			for (const poster of posters) {
				if (
					poster.file_path &&
					(poster.iso_639_1 === null ||
						(poster.iso_639_1 &&
							this.imageLangs.includes(poster.iso_639_1)))
				) {
					const posterUrl = `${baseUrl}${poster.file_path}`;
					const posterFilePath = path.join(
						outputPostersDir,
						poster.file_path.split("/").pop()!
					);

					if (show.coverSrc === "") {
						await Utils.downloadImage(posterUrl, posterFilePath);
						show.coverSrc = `resources/img/posters/${
							show.id
						}/${poster.file_path.split("/").pop()}`;
					} else {
						show.coversUrls = [...show.coversUrls, posterUrl];
						//Utils.downloadImage(posterUrl, posterFilePath);
					}
				}
			}
		} catch (error) {
			console.error("Error al descargar imágenes:", error);
		}
	}

	public static async scanMovie(root: string) {
		if (!this.moviedb) return;

		if (!(await Utils.isFolder(root))) {
			//#region MOVIE FILE ONLY
			if (!(await Utils.isVideoFile(root))) return;

			const fileFullName = await Utils.getFileName(root);
			const nameAndYear = this.extractNameAndYear(fileFullName);

			let name = nameAndYear[0];
			let year = nameAndYear[1];

			const movieMetadata = await this.searchMovie(name, year);

			let show = new Series();
			show.setName(name);
			show.setFolder(root);
			show.setAnalyzingFiles(true);
			this.library.getAnalyzedFolders().set(root, show.getId());

			// Add show to view
			this.win?.webContents.send(
				"series-added",
				this.library.id,
				show.toJSON()
			);

			let season = new Season();
			this.library.getAnalyzedFolders().set(root, season.getId());
			season.setSeriesID(show.getId());
			season.setFolder(root);
			show.addSeason(season);

			if (movieMetadata) {
				await this.setSeasonMetadata(
					show,
					season,
					movieMetadata,
					name,
					year
				);
			} else {
				//Save movie without metadata
				season.setName(name);
				season.setYear(year !== "1" ? year : "");
				season.setSeasonNumber(show.getSeasons().length);

				// Add season to view
				this.win?.webContents.send(
					"season-added",
					this.library.id,
					season.toJSON()
				);

				this.saveDiscWithoutMetadata(season, root);
				this.library.getSeries().push(show);
				return;
			}

			// Add season to view
			this.win?.webContents.send(
				"season-added",
				this.library.id,
				season.toJSON()
			);

			await this.processMovie(season, root);

			show.setAnalyzingFiles(false);
			this.library.series.push(show);
			//#endregion

			// Update show in view
			this.win?.webContents.send(
				"series-updated",
				this.library.id,
				show.toJSON()
			);
		} else {
			let show: Series | null;

			//let exists: boolean = false;
			if (this.library.getAnalyzedFolders().get(root)) {
				show = this.library.getSeriesById(
					this.library.getAnalyzedFolders().get(root) ?? ""
				);

				if (show === null) return;

				//exists = true;
			} else {
				show = new Series();
				show.setFolder(root);
				this.library.getAnalyzedFolders().set(root, show.getId());
			}

			show.setAnalyzingFiles(true);

			// Add show to view
			this.win?.webContents.send(
				"series-added",
				this.library.id,
				show.toJSON()
			);

			const filesInDir = await Utils.getFilesInFolder(root);
			const folders: string[] = [];
			const filesInRoot: string[] = [];

			for (const file of filesInDir) {
				const filePath = `${root}/${file.name}`;
				if (await Utils.isFolder(filePath)) {
					folders.push(filePath);
				} else {
					if (await Utils.isVideoFile(filePath))
						filesInRoot.push(filePath);
				}
			}

			if (folders.length > 0) {
				//#region FOLDERS CORRESPONDING DIFFERENT MOVIES FROM A COLLECTION
				show.isCollection = true;

				const fileFullName = await Utils.getFileName(root);

				show.setName(fileFullName);
				show.setFolder(root);
				this.library.getAnalyzedFolders().set(root, show.getId());

				const processPromises = folders.map(async (folder) => {
					const fileFullName = await Utils.getFileName(folder);
					const nameAndYear = this.extractNameAndYear(fileFullName);

					let name = nameAndYear[0];
					let year = nameAndYear[1];

					const movieMetadata = await this.searchMovie(name, year);

					let season = new Season();
					this.library.getAnalyzedFolders().set(folder, season.getId());
					season.setSeriesID(show.getId());
					season.setFolder(folder);
					show.addSeason(season);

					const files = await Utils.getValidVideoFiles(folder);

					if (movieMetadata) {
						await this.setSeasonMetadata(
							show,
							season,
							movieMetadata,
							name,
							year
						);
					} else {
						//Save videos without metadata
						season.setName(name);
						season.setYear(year !== "1" ? year : "");
						season.setSeasonNumber(show.getSeasons().length);

						// Add season to view
						this.win?.webContents.send(
							"season-added",
							this.library.id,
							season.toJSON()
						);

						const processPromises = files.map(async (file) => {
							await this.saveDiscWithoutMetadata(season, file);
						});

						await Promise.all(processPromises);
						this.library.getSeries().push(show);
						return;
					}

					// Add season to view
					this.win?.webContents.send(
						"season-added",
						this.library.id,
						season.toJSON()
					);

					const processPromises = files.map(async (file) => {
						await this.processMovie(season, file);
					});

					await Promise.all(processPromises);
				});

				await Promise.all(processPromises);
				this.library.series.push(show);
				//#endregion
			} else {
				//#region MOVIE FILE/CONCERT FILES INSIDE FOLDER
				const fileFullName = await Utils.getFileName(root);
				const nameAndYear = this.extractNameAndYear(fileFullName);

				let name = nameAndYear[0];
				let year = nameAndYear[1];

				const movieMetadata = await this.searchMovie(name, year);

				show.setName(name);
				show.setFolder(root);
				this.library.getAnalyzedFolders().set(root, show.getId());

				let season = new Season();
				this.library.getAnalyzedFolders().set(root, season.getId());
				season.setSeriesID(show.getId());
				season.setFolder(root);
				show.addSeason(season);

				if (movieMetadata) {
					await this.setSeasonMetadata(
						show,
						season,
						movieMetadata,
						name,
						year
					);
				} else {
					//Save videos without metadata
					season.setName(name);
					season.setYear(year !== "1" ? year : "");
					season.setSeasonNumber(show.getSeasons().length);

					// Add season to view
					this.win?.webContents.send(
						"season-added",
						this.library.id,
						season.toJSON()
					);

					const processPromises = filesInRoot.map(async (file) => {
						await this.saveDiscWithoutMetadata(season, file);
					});

					await Promise.all(processPromises);
					this.library.getSeries().push(show);

					// Update show in view
					this.win?.webContents.send(
						"series-updated",
						this.library.id,
						show.toJSON()
					);
					return;
				}

				// Add season to view
				this.win?.webContents.send(
					"season-added",
					this.library.id,
					season.toJSON()
				);

				const processPromises = filesInRoot.map(async (file) => {
					await this.processMovie(season, file);
				});

				await Promise.all(processPromises);
				this.library.series.push(show);
				//#endregion
			}

			show.setAnalyzingFiles(false);

			// Update show in view
			this.win?.webContents.send(
				"series-updated",
				this.library.id,
				show.toJSON()
			);
		}
	}

	private static async searchMovie(name: string, year: string) {
		if (!this.moviedb) return undefined;

		try {
			const res = await this.moviedb.searchMovie({
				query: `${name}`,
				year: Number.parseInt(year),
				page: 1,
			});
			if (res && res.results && res.results[0]) {
				let themdbID = res.results[0].id ?? -1;

				if (themdbID === -1) return undefined;

				return await this.moviedb.movieInfo({
					id: themdbID,
					language: this.library.language,
				});
			} else {
				console.log(
					"searchMovie: movie not found for '" + name + "; " + year + "'"
				);
				return undefined;
			}
		} catch (e) {
			console.log(
				"searchMovie: search for movie has failed with error " + e
			);
			return undefined;
		}
	}

	private static extractNameAndYear(source: string) {
		// Remove parentheses and extra spaces
		const cleanSource = source
			.replace(/[()]/g, "")
			.replace(/\s{2,}/g, " ")
			.trim();

		// Regex to get name and year
		const regex = /^(.*?)(?:[\s.-]*(\d{4}))?$/;
		const match = cleanSource.match(regex);

		let name = "";
		let year = "1";

		if (match) {
			name = match[1];
			year = match[2] || "1";
		} else {
			name = cleanSource;
		}

		// Clean and format the name
		name = name
			.replace(/[-_]/g, " ")
			.replace(/\s{2,}/g, " ")
			.trim();

		return [name, year];
	}

	private static async setSeasonMetadata(
		show: Series,
		season: Season,
		movieMetadata: MovieResponse,
		name: string,
		year: string
	) {
		season.setName(!season.nameLock ? movieMetadata.title ?? name : name);
		season.setYear(
			!season.yearLock ? movieMetadata.release_date ?? year : year
		);
		season.setOverview(
			!season.overviewLock ? movieMetadata.overview ?? "" : ""
		);
		season.tagline = !season.taglineLock ? movieMetadata.tagline ?? "" : "";
		season.setThemdbID(movieMetadata.id ?? -1);
		season.setImdbID(movieMetadata.imdb_id ?? "-1");
		season.setScore(
			movieMetadata.vote_average ? (movieMetadata.vote_average * 10) / 10 : 0
		);
		season.setGenres(
			season.genresLock
				? season.genres
				: movieMetadata.genres
				? movieMetadata.genres.map((genre) => genre.name ?? "")
				: []
		);
		season.productionStudios = season.studioLock
			? season.productionStudios
			: movieMetadata.production_companies
			? movieMetadata.production_companies.map(
					(company) => company.name ?? ""
			  )
			: [];

		/*if (season.getImdbID() !== "-1" && season.getImdbID() !== ""){
            await this.setIMDBScore(season.imdbID, season);
        }*/

		//#region GET TAGS
		const credits = await this.moviedb?.movieCredits({
			id: season.getThemdbID(),
			language: this.library.language,
		});

		if (credits) {
			if (credits.crew) {
				if (!season.directedLock) {
					season.directedBy.splice(0, season.directedBy.length);
					credits.crew.forEach((person) => {
						if (person.name && person.job === "Director")
							season?.directedBy.push(person.name);
					});
				}

				if (!season.writtenLock) {
					season.writtenBy.splice(0, season.writtenBy.length);
					credits.crew.forEach((person) => {
						if (person.name && person.job === "Writer")
							season?.writtenBy.push(person.name);
					});
				}

				if (!season.creatorLock && season.creator.length > 0)
					season.creator.splice(0, season.creator.length);

				if (!season.musicLock && season.musicComposer.length > 0)
					season.musicComposer.splice(0, season.musicComposer.length);

				credits.crew.forEach((person) => {
					if (
						!season.creatorLock &&
						person.job &&
						(person.job === "Author" ||
							person.job === "Novel" ||
							person.job === "Original Series Creator" ||
							person.job === "Comic Book" ||
							person.job === "Idea" ||
							person.job === "Original Story" ||
							person.job === "Story" ||
							person.job === "Story by" ||
							person.job === "Book" ||
							person.job === "Original Concept")
					)
						if (person.name && !season.creatorLock)
							season.creator.push(person.name);

					if (
						!season.musicLock &&
						person.job &&
						person.job === "Original Music Composer"
					)
						if (person.name && !season.musicLock)
							season.musicComposer.push(person.name);
				});
			}

			if (credits.cast) {
				if (season.cast && season.cast.length > 0)
					season.cast.splice(0, season.cast.length);

				credits.cast.forEach((person) => {
					season.cast?.push(new Cast(person.name, person.character));
				});
			}
		}
		//#endregion

		//#region IMAGES DOWNLOAD
		const images = await this.moviedb?.movieImages({
			id: season.getThemdbID(),
		});

		if (images) {
			let baseUrl = "https://image.tmdb.org/t/p/original";

			const logos = images.logos || [];
			const posters = images.posters || [];

			// Create folders if they do not exist
			const outputLogosDir = Utils.getExternalPath(
				"resources/img/logos/" + season.id
			);
			if (!fs.existsSync(outputLogosDir)) {
				fs.mkdirSync(outputLogosDir);
			}

			const outputPostersDir = Utils.getExternalPath(
				"resources/img/posters/" + season.id
			);
			if (!fs.existsSync(outputPostersDir)) {
				fs.mkdirSync(outputPostersDir);
			}

			const outputPostersCollectionDir = Utils.getExternalPath(
				"resources/img/posters/" + show.id
			);
			if (show.isCollection) {
				if (!fs.existsSync(outputPostersCollectionDir)) {
					fs.mkdirSync(outputPostersCollectionDir);
				}
			}

			const outputImageDir = Utils.getExternalPath(
				"resources/img/DownloadCache"
			);
			if (!fs.existsSync(outputImageDir)) {
				fs.mkdirSync(outputImageDir);
			}

			// Download season background
			if (
				images.backdrops &&
				images.backdrops.length > 1 &&
				images.backdrops[0].file_path
			) {
				const imageUrl = `${baseUrl}${images.backdrops[0].file_path}`;
				const imageFilePath = path.join(
					outputImageDir,
					season.themdbID + ".jpg"
				);
				await Utils.downloadImage(imageUrl, imageFilePath);
			}

			// Download logos
			for (const logo of logos) {
				if (
					logo.file_path &&
					(logo.iso_639_1 === null ||
						(logo.iso_639_1 && this.imageLangs.includes(logo.iso_639_1)))
				) {
					const logoUrl = `${baseUrl}${logo.file_path}`;
					const logoFilePath = path.join(
						outputLogosDir,
						logo.file_path.split("/").pop()!
					);

					if (season.logoSrc === "") {
						await Utils.downloadImage(logoUrl, logoFilePath);
						season.logoSrc = `resources/img/logos/${
							season.id
						}/${logo.file_path.split("/").pop()}`;
					} else {
						season.logosUrls = [...season.logosUrls, logoUrl];
						//Utils.downloadImage(logoUrl, logoFilePath);
					}
				}
			}

			// Download posters
			for (const poster of posters) {
				if (
					poster.file_path &&
					(poster.iso_639_1 === null ||
						(poster.iso_639_1 &&
							this.imageLangs.includes(poster.iso_639_1)))
				) {
					const posterUrl = `${baseUrl}${poster.file_path}`;
					const posterFilePath = path.join(
						outputPostersDir,
						poster.file_path.split("/").pop()!
					);
					const posterColFilePath = path.join(
						outputPostersCollectionDir,
						poster.file_path.split("/").pop()!
					);

					if (season.coverSrc === "") {
						await Utils.downloadImage(posterUrl, posterFilePath);
						season.coverSrc = `resources/img/posters/${
							season.id
						}/${poster.file_path.split("/").pop()}`;
					} else {
						season.coversUrls = [...season.coversUrls, posterUrl];
						//Utils.downloadImage(posterUrl, posterFilePath);
					}

					if (show.isCollection) {
						if (show.coverSrc === "") {
							await Utils.downloadImage(posterUrl, posterColFilePath);
							show.coverSrc = `resources/img/posters/${
								show.id
							}/${poster.file_path.split("/").pop()}`;
						} else {
							show.coversUrls = [...show.coversUrls, posterUrl];
							//Utils.downloadImage(posterUrl, posterColFilePath);
						}
					}
				}
			}
		}

		const filePath: string =
			"resources/img/DownloadCache/" + season.getThemdbID() + ".jpg";
		if (Utils.fileExists(filePath))
			await Utils.saveBackground(season, filePath);
		else
			await Utils.saveBackground(
				season,
				"resources/img/DefaultBackground.png"
			);
		//#endregion
	}

	private static async saveDiscWithoutMetadata(
		season: Season,
		filePath: string
	) {
		let episode: EpisodeLocal | undefined = new EpisodeLocal();

		if (
			this.library.getAnalyzedFiles().get(filePath) &&
			this.library.getAnalyzedFiles().get(filePath) !== null
		) {
			episode = season.getEpisodeById(
				this.library.getAnalyzedFiles().get(filePath) ?? ""
			);
		}

		if (!episode) {
			episode = new EpisodeLocal();
			season.addEpisode(episode);
			episode.setSeasonID(season.getId());
			this.library.getAnalyzedFiles().set(filePath, episode.getId());

			episode.setName(season.getName());
			episode.setVideoSrc(filePath);
			episode.setSeasonNumber(season.getSeasonNumber());
			episode.setImgSrc("resources/img/Default_video_thumbnail.jpg");

			// Get runtime with ffmpeg
			await Utils.getOnlyRuntime(episode, episode.getVideoSrc());
		}

		await this.processMediaInfo(episode);

		// Add episode to view
		this.win?.webContents.send(
			"episode-added",
			this.library.id,
			season.seriesID,
			episode.toJSON()
		);
	}

	private static async processMovie(season: Season, filePath: string) {
		let episode: EpisodeLocal | undefined = new EpisodeLocal();

		if (
			this.library.getAnalyzedFiles().get(filePath) &&
			this.library.getAnalyzedFiles().get(filePath) !== null
		) {
			episode = season.getEpisodeById(
				this.library.getAnalyzedFiles().get(filePath) ?? ""
			);
		} else {
			episode = new EpisodeLocal();
			season.addEpisode(episode);
			episode.setSeasonID(season.getId());
			this.library.getAnalyzedFiles().set(filePath, episode.getId());

			episode.setName(Utils.getFileName(filePath));
			episode.setYear(season.getYear());
			episode.setOverview(season.getOverview());
			episode.setVideoSrc(filePath);
			episode.setSeasonNumber(season.getSeasonNumber());

			// Get runtime with ffmpeg
			await Utils.getOnlyRuntime(episode, episode.getVideoSrc());
		}

		if (!episode) return;

		await this.processMediaInfo(episode);

		const images = await this.moviedb?.movieImages({ id: season.themdbID });

		let imageBaseURL = "https://image.tmdb.org/t/p/original";
		let thumbnails = images?.backdrops || [];

		const outputDir = Utils.getExternalPath(
			"resources/img/thumbnails/video/" + episode.id + "/"
		);
		if (!fs.existsSync(outputDir)) {
			fs.mkdirSync(outputDir);
		}

		// Download thumbnails
		let count = 5;
		for (const [index, thumbnail] of thumbnails.entries()) {
			if (thumbnail.file_path) {
				if (count === 0) break;

				const url = `${imageBaseURL}${thumbnail.file_path}`;
				const imageFilePath = path.join(outputDir, index + ".jpg");

				if (index === 0) {
					await Utils.downloadImage(url, imageFilePath);
					episode.imgSrc = `resources/img/thumbnails/video/${episode.id}/${index}.jpg`;
				} else {
					episode.imgUrls = [...episode.imgUrls, url];
					//Utils.downloadImage(url, imageFilePath);
				}

				count--;
			}
		}

		// Add episode to view
		this.win?.webContents.send(
			"episode-added",
			this.library.id,
			season.seriesID,
			episode.toJSON()
		);
	}

	private static async processMediaInfo(episode: EpisodeLocal) {
		let episodeData: EpisodeData | undefined = await Utils.getMediaInfo(
			episode
		);

		if (episodeData) {
			if (episodeData.mediaInfo) episode.mediaInfo = episodeData.mediaInfo;

			if (episodeData.videoTracks)
				episode.videoTracks = episodeData.videoTracks;

			if (episodeData.audioTracks)
				episode.audioTracks = episodeData.audioTracks;

			if (episodeData.subtitleTracks)
				episode.subtitleTracks = episodeData.subtitleTracks;

			if (episodeData.chapters) episode.chapters = episodeData.chapters;
		}
	}

	/*private static async setIMDBScore(imdbID: string, season: Season): Promise<void> {
        try {
            const url = `https://www.imdb.com/title/${imdbID}`;
            const { data } = await axios.get(url, { timeout: 6000 });
    
            const $ = cheerio.load(data);
            const body = $('div.sc-bde20123-2');
    
            body.find('span.sc-bde20123-1').each((_, element) => {
                const score = $(element).text();
                console.log("Imdb score: " + score);
                season.score = parseFloat(score);
                return false;
            });
    
        } catch (error) {
            console.error('setIMDBScore: IMDB connection lost');
        }
    };*/

	//#endregion

	//#region MUSIC METADATA EXTRACTION
	public static async scanMusic(folder: string) {
		if (!(await Utils.isFolder(folder))) return;

		let collection: Series | null;

		if (!this.library.getAnalyzedFolders().get(folder)) {
			collection = new Series();
			collection.setName(Utils.getFileName(folder));
			collection.setAnalyzingFiles(true);
			this.library.series.push(collection);
			this.library.analyzedFolders.set(folder, collection.id);

			// Add show to view
			this.win?.webContents.send(
				"series-added",
				this.library.id,
				collection.toJSON()
			);
		} else {
			collection = this.library.getSeriesById(
				this.library.getAnalyzedFolders().get(folder) || ""
			);
		}

		if (collection === null || !collection) return;

		collection.setAnalyzingFiles(true);

		// Get music files inside folder (4 folders of depth)
		const musicFiles = await Utils.getMusicFiles(folder);

		// Process each file
		for (const file of musicFiles) {
			if (!this.library.getAnalyzedFiles().get(file)) {
				await this.processMusicFile(file, collection);
			}
		}

		collection.isCollection = collection.seasons.length > 1;
		collection.setAnalyzingFiles(false);

		// Update show in view
		this.win?.webContents.send(
			"series-updated",
			this.library.id,
			collection.toJSON()
		);
	}

	private static async processMusicFile(
		musicFile: string,
		collection: Series
	) {
		try {
			const data = await new Promise<any>((resolve, reject) => {
				ffmetadata.read(musicFile, (err, data) => {
					if (err) {
						reject(err);
					} else {
						resolve(data);
					}
				});
			});

			const artistName = data["album_artist"] ? data["album_artist"] : "";
			const albumName = data.album ?? "Unknown";

			let album: Season | null = null;

			for (const season of collection.seasons) {
				if (season.name === albumName) {
					album = season;
					break;
				}
			}

			if (album === null) {
				album = new Season();
				album.setName(albumName ?? "Unknown");
				album.setSeriesID(collection.id);
				album.setYear(
					data.date
						? new Date(data.date).getFullYear().toString()
						: data["TYER"]
						? new Date(data["TYER"]).getFullYear().toString()
						: ""
				);
				album.setGenres(
					data.genre
						? data.genre.split(",").map((genre: string) => genre.trim())
						: []
				);
				collection.seasons.push(album);

				// Add season to view
				this.win?.webContents.send(
					"season-added",
					this.library.id,
					album.toJSON()
				);
			}

			let song = new EpisodeLocal();
			song.setName(data.title ?? Utils.getFileName(musicFile));
			song.setYear(
				data.date
					? new Date(data.date).getFullYear().toString()
					: data["TYER"]
					? new Date(data["TYER"]).getFullYear().toString()
					: ""
			);
			song.setSeasonNumber(data["disc"] ? Number.parseInt(data["disc"]) : 0);
			song.setEpisodeNumber(data.track ? Number.parseInt(data.track) : 0);
			song.album = albumName ?? "Unknown";
			song.albumArtist = artistName ?? "Unknown";
			song.setDirectedBy(
				data.artist
					? data.artist.split(",").map((artist: string) => artist.trim())
					: []
			);
			song.setWrittenBy(
				data.composer
					? data.composer
							.split(",")
							.map((composer: string) => composer.trim())
					: []
			);

			if (album.coverSrc === "") {
				// Search for image in the same folder
				let imageSrc = await Utils.findImageInFolder(path.dirname(musicFile));

				// If no image is found in the same folder, search in the parent folder
				if (!imageSrc) {
					const parentFolder = path.resolve(path.dirname(musicFile), "..");
					imageSrc = await Utils.findImageInFolder(parentFolder);
				}

				if (imageSrc) {
					await this.createFolder("resources/img/posters/" + album.id);
					let destPath = Utils.getExternalPath("resources/img/posters/" + album.id + "/" + imageSrc.split("\\").pop());
					fs.copyFile(imageSrc, destPath, (err) => {
						if (err) {
							console.error("Error copying image:", err);
							return;
						}
					});

					album.setCoverSrc("resources/img/posters/" + album.id + "/" + imageSrc.split("\\").pop());
	
					if (collection.coverSrc === "") {
						await this.createFolder("resources/img/posters/" + collection.id);
						let destPath = Utils.getExternalPath("resources/img/posters/" + collection.id + "/" + imageSrc.split("\\").pop());
						fs.copyFile(imageSrc, destPath, (err) => {
							if (err) {
								console.error("Error copying image:", err);
								return;
							}
						});

						collection.setCoverSrc("resources/img/posters/" + collection.id + "/" + imageSrc.split("\\").pop());
					} 
				}
			}

			// Get runtime
			await Utils.getOnlyRuntime(song, musicFile);

			song.setVideoSrc(musicFile);
			album.addEpisode(song);
			DataManager.library.analyzedFiles.set(musicFile, song.id);

			// Add episode to view
			/*this.win?.webContents.send(
				"episode-added",
				this.library.id,
				collection.id,
				song.toJSON()
			);*/
		} catch (error) {
			console.error("Error processing music file", error);
		}
	}
	//#endregion

	//#region UTILS
	public static createFolder = async (folderDir: string) => {
		Utils.getExternalPath(folderDir);
		if (!fs.existsSync(folderDir)) {
			fs.mkdirSync(folderDir);
		}
	};

	public static getImages = async (dirPath: string) => {
		try {
			const files = fs.readdirSync(dirPath);
			const images = files.filter((file) =>
				[".png", ".jpg", ".jpeg", ".gif"].includes(
					path.extname(file).toLowerCase()
				)
			);
			return images.map((image) => path.join(dirPath, image));
		} catch (error) {
			console.log(
				"DataManager.getImages: Error getting images for path " + dirPath
			);
			return [];
		}
	};

	
	//#endregion
}
