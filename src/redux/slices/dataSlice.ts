import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LibraryData } from "@interfaces/LibraryData";
import { SeriesData } from "@interfaces/SeriesData";
import { SeasonData } from "@interfaces/SeasonData";
import { EpisodeData } from "@interfaces/EpisodeData";

interface LibraryState {
	libraries: LibraryData[];
	selectedLibrary: LibraryData | null;
	libraryForMenu: LibraryData | null;
	showCollectionPoster: boolean;
	libraryEditWindow: boolean;

	seriesMenu: SeriesData | null;
	selectedSeries: SeriesData | null;
	selectedSeason: SeasonData | null;
	seriesWindowOpen: boolean;
	seasonWindowOpen: boolean;

	selectedEpisode: EpisodeData | null;
	showEpisodeMenu: boolean;
	episodeWindowOpen: boolean;
}

const markEpisodesAsWatched = (episodes: EpisodeData[], endIndex: number) => {
	for (let i = 0; i <= endIndex; i++) {
		episodes[i].watched = true;
	}
};

const markEpisodesAsUnwatched = (
	episodes: EpisodeData[],
	startIndex: number
) => {
	for (let i = startIndex; i < episodes.length; i++) {
		episodes[i].watched = false;
		episodes[i].timeWatched = 0;
	}
};

const initialState: LibraryState = {
	libraries: [],
	selectedLibrary: null,
	libraryForMenu: null,
	showCollectionPoster: false,
	libraryEditWindow: false,

	seriesMenu: null,
	selectedSeries: null,
	selectedSeason: null,
	seriesWindowOpen: false,
	seasonWindowOpen: false,

	selectedEpisode: null,
	showEpisodeMenu: false,
	episodeWindowOpen: false,
};

const dataSlice = createSlice({
	name: "data",
	initialState,
	reducers: {
		//#region LIBRARY REDUCERS
		setLibraries: (state, action: PayloadAction<LibraryData[]>) => {
			state.libraries = action.payload;

			if (state.selectedLibrary !== null) {
				let index = state.libraries.findIndex(
					(library) => library.id === state.selectedLibrary?.id
				);

				if (index < 0) {
					index = 0;
				}

				state.selectedLibrary = state.libraries[index];
			} else if (state.libraries.length > 0) {
				state.selectedLibrary = null;
			}
		},
		selectLibrary: (state, action: PayloadAction<LibraryData | null>) => {
			state.selectedLibrary = action.payload;

			if (state.selectedLibrary === null) {
				state.selectedSeries = null;
				state.selectedSeason = null;
				state.selectedEpisode = null;
			}
		},
		clearLibrarySelection: (state) => {
			state.selectedLibrary = null;
		},
		setShowPoster: (state, action: PayloadAction<boolean>) => {
			state.showCollectionPoster = action.payload;
		},
		setLibraryForMenu: (state, action) => {
			state.libraryForMenu = action.payload;
		},
		toggleLibraryEditWindow: (state) => {
			state.libraryEditWindow = !state.libraryEditWindow;
		},
		addLibrary: (state, action) => {
			state.libraries = [...state.libraries, action.payload];
			state.selectedLibrary = action.payload;
		},
		updateLibrary: (state, action) => {
			state.selectedLibrary = action.payload;

			if (state.libraries.includes(action.payload)) {
				const libraries = state.libraries;

				if (libraries) {
					// Update Library in list
					const libraryIndex = libraries.findIndex(
						(library) => library.id === action.payload.id
					);

					if (libraryIndex >= 0) {
						libraries[libraryIndex] = action.payload;
					}
				} else {
					state.libraries = [...state.libraries, action.payload];
				}
			}

			// Check if series, season, episode have been removed
		},
		//#endregion

		//#region SERIES AND SEASONS REDUCERS
		showSeriesMenu: (state, action: PayloadAction<SeriesData | null>) => {
			state.seriesMenu = action.payload;
		},
		selectSeries: (state, action: PayloadAction<SeriesData>) => {
			state.selectedSeries = action.payload;

			if (
				state.selectedSeries.seasons &&
				state.selectedSeries.seasons.length > 0
			) {
				state.selectedSeason = action.payload.seasons[0];
			}
		},
		selectSeason: (state, action: PayloadAction<SeasonData | null>) => {
			state.selectedSeason = action.payload;
		},
		resetSelection: (state) => {
			state.selectedSeries = null;
			state.selectedSeason = null;
			state.selectedEpisode = null;
		},
		toggleSeriesWindow: (state) => {
			state.seriesWindowOpen = !state.seriesWindowOpen;
		},
		toggleSeasonWindow: (state) => {
			state.seasonWindowOpen = !state.seasonWindowOpen;
		},
		addSeries: (
			state,
			action: PayloadAction<{ libraryId: string; series: SeriesData }>
		) => {
			const library = state.libraries.find(
				(library) => library.id === action.payload.libraryId
			);
			if (
				library &&
				!library.series.find(
					(series) => series.id === action.payload.series.id
				)
			) {
				library.series = [...library.series, action.payload.series];

				// Update if selected
				if (
					state.selectedLibrary &&
					library.id === state.selectedLibrary.id
				) {
					state.selectedLibrary = library;
				}
			}
		},
		updateSeries: (
			state,
			action: PayloadAction<{
				libraryId: string;
				series: SeriesData;
			}>
		) => {
			const library = state.libraries.find(
				(library) => library.id === action.payload.libraryId
			);

			if (library) {
				// Find the corresponding series
				const series = library.series.find(
					(series) => series.id === action.payload.series.id
				);

				if (series) {
					// Directly update the series object
					Object.assign(series, action.payload.series);

					// Sync the selected state
					if (state.selectedSeries?.id === series.id) {
						Object.assign(state.selectedSeries, action.payload.series);

						// If there is a selected season, make sure it is consistent
						if (state.selectedSeason) {
							const updatedSeason = state.selectedSeries.seasons.find(
								(season) => {
									if (state.selectedSeason)
										season.id === state.selectedSeason.id;
								}
							);
							if (updatedSeason) {
								state.selectedSeason = updatedSeason;
							}
						}
					}

					// Sync the selected library if it matches
					if (state.selectedLibrary?.id === library.id) {
						state.selectedLibrary = library;
					}
				}
			}
		},
		setSeriesWatched: (
			state,
			action: PayloadAction<{
				libraryId: string;
				seriesId: string;
				watched: boolean;
			}>
		) => {
			const { libraryId, seriesId, watched } = action.payload;
			const library = state.libraries.find(
				(library) => library.id === libraryId
			);
			if (library) {
				const series = library.series.find(
					(series) => series.id === seriesId
				);
				if (series) {
					for (const season of series.seasons) {
						for (const episode of season.episodes) {
							episode.watched = watched;
						}

						season.currentlyWatchingEpisode = -1;
						season.watched = watched;

						if (state.selectedSeason?.id === season.id) {
							state.selectedSeason = season;
						}
					}

					series.currentlyWatchingSeason = -1;
					series.watched = watched;

					if (state.selectedSeries?.id === series.id) {
						state.selectedSeries = series;
					}
				}

				if (state.selectedLibrary?.id === library.id) {
					state.selectedLibrary = library;
				}
			}
		},

		addSeason: (
			state,
			action: PayloadAction<{ libraryId: string; season: SeasonData }>
		) => {
			const library = state.libraries.find(
				(library) => library.id === action.payload.libraryId
			);
			if (library && library.series) {
				const series = library.series.find(
					(series) => series.id === action.payload.season.seriesID
				);

				if (series) {
					if (!series.seasons) {
						series.seasons = [];
					}

					if (
						!series.seasons.find(
							(season) => season.id === action.payload.season.id
						)
					) {
						series.seasons = [...series.seasons, action.payload.season];

						// Update if selected
						if (
							state.selectedSeries &&
							state.selectedSeries.id === action.payload.season.seriesID
						) {
							state.selectedSeries = series;

							if (!state.selectedSeason) {
								state.selectedSeason = state.selectedSeries.seasons[0];
							}
						}
					}
				}

				if (
					state.selectedLibrary &&
					state.selectedLibrary.id === library.id
				) {
					state.selectedLibrary = library;
				}
			}
		},
		updateSeason: (state, action: PayloadAction<SeasonData>) => {
			const library = state.selectedLibrary;

			if (library) {
				// Find the series corresponding to the season
				const series = library.series.find(
					(series) => series.id === action.payload.seriesID
				);

				if (series) {
					// Find the index of the season within the series
					const seasonIndex = series.seasons.findIndex(
						(season) => season.id === action.payload.id
					);

					if (seasonIndex >= 0) {
						// Update the season in the series' seasons list
						series.seasons[seasonIndex] = action.payload;

						// Update the series in the library
						const seriesIndex = library.series.findIndex(
							(s) => s.id === series.id
						);
						library.series[seriesIndex] = series;

						// Update the library in the global state
						const libraryIndex = state.libraries.findIndex(
							(lib) => lib.id === library.id
						);
						state.libraries[libraryIndex] = library;

						// Sync the selected state
						if (state.selectedSeries?.id === series.id) {
							state.selectedSeries = series;

							if (state.selectedSeason?.id === action.payload.id) {
								state.selectedSeason = action.payload;
							}
						}

						if (state.selectedLibrary?.id === library.id) {
							state.selectedLibrary = library;
						}
					}
				}
			}
		},
		setSeasonWatched: (
			state,
			action: PayloadAction<{
				libraryId: string;
				seriesId: string;
				seasonId: string;
				watched: boolean;
			}>
		) => {
			const { libraryId, seriesId, seasonId, watched } = action.payload;

			// Find the library
			const library = state.libraries.find(
				(library) => library.id === libraryId
			);
			if (library) {
				// Find the series
				const series = library.series.find(
					(series) => series.id === seriesId
				);
				if (series) {
					// Sort the seasons
					const seasons = series.seasons.sort((a, b) => {
						if (a.order !== 0 && b.order !== 0) {
							return a.order - b.order;
						}
						if (a.order === 0 && b.order === 0) {
							return (
								new Date(a.year).getTime() - new Date(b.year).getTime()
							);
						}
						return a.order === 0 ? 1 : -1;
					});

					let isWatched = true;
					let found = false;

					if (library.type === "Movies") {
						// Find season by id
						const season = series.seasons.find(
							(season) => season.id === seasonId
						);

						// If season exists, mark all episodes as watched/unwatched
						if (season) {
							for (const episode of season.episodes) {
								episode.watched = watched;
							}

							season.currentlyWatchingEpisode = -1;

							season.watched = watched;

							// Update selected season if needed
							if (state.selectedSeason?.id === season.id) {
								state.selectedSeason = season;
							}
						}

						for (const season of seasons) {
							if (!season.watched) {
								isWatched = false;
							}
						}
					} else {
						for (const season of seasons) {
							if (season.id === seasonId) {
								season.currentlyWatchingEpisode = -1;
								season.watched = watched;
								found = true;

								for (const episode of season.episodes) {
									episode.watched = !episode.watched;
								}
							} else {
								if (!found) {
									season.currentlyWatchingEpisode = -1;
								}

								for (const episode of season.episodes) {
									episode.watched = !found ? true : false;
								}
							}

							if (season.currentlyWatchingEpisode !== -1) {
								series.currentlyWatchingSeason =
									seasons.indexOf(season);
							}

							if (state.selectedSeason?.id === season.id) {
								state.selectedSeason = season;
							}

							if (!season.watched)
								isWatched = false;
						}
					}

					series.watched = isWatched;

					// Update selected series if needed
					if (state.selectedSeries?.id === series.id) {
						state.selectedSeries = series;
					}
				}

				// Update selected library if needed
				if (state.selectedLibrary?.id === library.id) {
					state.selectedLibrary = library;
				}
			}
		},
		//#endregion

		//#region EPISODES REDUCERS
		selectEpisode: (state, action) => {
			state.selectedEpisode = action.payload;
		},
		showMenu: (state, action) => {
			state.showEpisodeMenu = action.payload;
		},
		toggleEpisodeWindow: (state) => {
			state.episodeWindowOpen = !state.episodeWindowOpen;
		},
		addEpisode: (
			state,
			action: PayloadAction<{
				libraryId: string;
				showId: string;
				episode: EpisodeData;
			}>
		) => {
			const library = state.libraries.find(
				(library) => library.id === action.payload.libraryId
			);
			if (library) {
				const series = library.series.find(
					(series) => series.id === action.payload.showId
				);
				if (series) {
					const season = series.seasons.find(
						(season) => season.id === action.payload.episode.seasonID
					);
					if (season) {
						if (!season.episodes) {
							season.episodes = [];
						}

						if (
							!season.episodes.find(
								(episode) => episode.id === action.payload.episode.id
							)
						) {
							season.episodes = [
								...season.episodes,
								action.payload.episode,
							];

							// Update if selected
							if (
								state.selectedSeason &&
								state.selectedSeason.id ===
									action.payload.episode.seasonID
							) {
								state.selectedSeason = season;
							}

							if (
								state.selectedSeries &&
								series.id === state.selectedSeries.id
							) {
								state.selectedSeries = series;
							}
						}
					}
				}

				if (
					state.selectedLibrary &&
					state.selectedLibrary.id === library.id
				) {
					state.selectedLibrary = library;
				}
			}
		},
		updateEpisode: (
			state,
			action: PayloadAction<{
				libraryId: string;
				showId: string;
				episode: EpisodeData;
			}>
		) => {
			const library = state.libraries.find(
				(library) => library.id === action.payload.libraryId
			);
			if (library) {
				const series = library.series.find(
					(series) => series.id === action.payload.showId
				);
				if (series) {
					const season = series.seasons.find(
						(season) => season.id === action.payload.episode.seasonID
					);
					if (season) {
						const episodeIndex = season.episodes.findIndex(
							(episode) => episode.id === action.payload.episode.id
						);
						if (episodeIndex >= 0) {
							season.episodes[episodeIndex] = action.payload.episode;

							// Update if selected
							if (
								state.selectedEpisode &&
								state.selectedEpisode.id === action.payload.episode.id
							) {
								state.selectedEpisode = action.payload.episode;
							}

							if (
								state.selectedSeason &&
								state.selectedSeason.id ===
									action.payload.episode.seasonID
							) {
								state.selectedSeason = season;
							}

							if (
								state.selectedSeries &&
								series.id === state.selectedSeries.id
							) {
								state.selectedSeries = series;
							}
						}
					}
				}

				if (
					state.selectedLibrary &&
					state.selectedLibrary.id === library.id
				) {
					state.selectedLibrary = library;
				}
			}
		},
		markEpisodeWatched: (
			state,
			action: PayloadAction<{
				libraryId: string;
				seriesId: string;
				seasonId: string;
				episodeId: string;
				watched: boolean;
			}>
		) => {
			const { libraryId, seriesId, seasonId, episodeId, watched } =
				action.payload;

			// Find library
			const library = state.libraries.find(
				(library) => library.id === libraryId
			);
			if (!library) return;

			// Find series
			const series =
				library.series &&
				library.series.find((series) => series.id === seriesId);
			if (!series) return;

			// Get sorted seasons
			const seasons = series.seasons.sort((a, b) => {
				if (a.order !== 0 && b.order !== 0) {
					return a.order - b.order;
				}
				if (a.order === 0 && b.order === 0) {
					return new Date(a.year).getTime() - new Date(b.year).getTime();
				}
				return a.order === 0 ? 1 : -1;
			});

			let found = false;
			if (library.type === "Movies") {
				const season = series.seasons.find(
					(season) => season.id === seasonId
				);

				if (season) {
					season.currentlyWatchingEpisode = -1;

					// Get sorted episodes
					const episodes = season.episodes.sort(
						(a, b) => a.episodeNumber - b.episodeNumber
					);

					for (const episode of episodes) {
						if (episode.id === episodeId) {
							episode.watched = watched;
							found = true;

							if (watched) {
								episode.timeWatched = 0;
							}
						} else if (found) {
							season.currentlyWatchingEpisode =
								episodes.indexOf(episode);
							break;
						}
					}

					// Update selected season if needed
					if (
						state.selectedSeason &&
						state.selectedSeason.id === season.id
					) {
						state.selectedSeason = season;
					}
				}
			} else {
				for (const season of seasons) {
					// Get sorted episodes
					const episodes = season.episodes.sort(
						(a, b) => a.episodeNumber - b.episodeNumber
					);

					for (const episode of episodes) {
						// If episode is found, update watched state
						if (episode.id === episodeId) {
							found = true;
							episode.watched = watched;

							// If episode is unwatched, set timeWatched to 0 and update this as currently watching episode and season
							if (!episode.watched) {
								episode.timeWatched = 0;
								season.currentlyWatchingEpisode =
									episodes.indexOf(episode);
								series.currentlyWatchingSeason =
									seasons.indexOf(season);
							}

							// Update selected episode if needed
							if (state.selectedEpisode?.id === episode.id) {
								state.selectedEpisode = episode;
							}

							// Update currently watching episode if this is the last one
							if (
								episodes.indexOf(episode) < episodes.length - 1 &&
								episode.watched
							) {
								season.currentlyWatchingEpisode =
									episodes.indexOf(episode) + 1;
								series.currentlyWatchingSeason =
									seasons.indexOf(season);
							} else if (
								episodes.indexOf(episode) <
								episodes.length - 1
							) {
								season.currentlyWatchingEpisode =
									episodes.indexOf(episode);
								series.currentlyWatchingSeason =
									seasons.indexOf(season);
							} else if (!episode.watched) {
								season.currentlyWatchingEpisode = -1;
							}
						} else {
							// If this is not yet the currently watching episode, set as unwatched. Else, set as watched
							if (found) {
								episode.watched = false;
								episode.timeWatched = 0;
							} else if (watched) {
								episode.watched = true;
							}
						}

						// If the last episode is marked as watched, set the season as watched
						if (
							episodes.indexOf(episode) === episodes.length - 1 &&
							episode.watched
						) {
							season.currentlyWatchingEpisode = -1;

							if (seasons.indexOf(season) < seasons.length - 1) {
								series.currentlyWatchingSeason =
									seasons.indexOf(season) + 1;

								const nextSeason = seasons[seasons.indexOf(season) + 1];
								nextSeason.currentlyWatchingEpisode = 0;
							} else {
								series.currentlyWatchingSeason = -1;
							}
						}
					}

					// Update selected season if needed
					if (found) {
						if (
							state.selectedSeason &&
							state.selectedSeason.id === season.id
						) {
							state.selectedSeason = season;
						}
					}
				}
			}

			// If there is a season currently watching, set it on series
			series.currentlyWatchingSeason = -1;
			for (const season of seasons) {
				if (season.currentlyWatchingEpisode !== -1) {
					series.currentlyWatchingSeason = seasons.indexOf(season);
					break;
				}
			}

			// If there is no season currently watching, set series as watched
			if (series.currentlyWatchingSeason === -1) {
				series.watched = true;
			}

			// Update selected series and library if needed
			if (found) {
				if (state.selectedSeries && state.selectedSeries.id === series.id) {
					state.selectedSeries = series;
				}

				if (
					state.selectedLibrary &&
					state.selectedLibrary.id === library.id
				) {
					state.selectedLibrary = library;
				}
			}
		},
		//#endregion
	},
});

export const {
	setLibraries,
	selectLibrary,
	clearLibrarySelection,
	setShowPoster,
	setLibraryForMenu,
	toggleLibraryEditWindow,
	showSeriesMenu,
	selectSeries,
	selectSeason,
	resetSelection,
	updateSeason,
	selectEpisode,
	showMenu,
	addEpisode,
	addSeason,
	updateSeries,
	addSeries,
	setSeriesWatched,
	setSeasonWatched,
	toggleEpisodeWindow,
	updateEpisode,
	toggleSeriesWindow,
	toggleSeasonWindow,
	addLibrary,
	updateLibrary,
	markEpisodeWatched,
} = dataSlice.actions;
export default dataSlice.reducer;
