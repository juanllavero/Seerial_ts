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
			const library = state.libraries.find(
				(library) => library.id === action.payload.libraryId
			);
			if (!library) return;

			const series = library.series && library.series.find(
				(series) => series.id === action.payload.seriesId
			);
			if (!series) return;

			const season = series.seasons && series.seasons.find(
				(season) => season.id === action.payload.seasonId
			);
			if (!season) return;

			const episode = season.episodes && season.episodes.find(
				(episode) => episode.id === action.payload.episodeId
			);
			if (!episode) return;

			let found = false;

			for (const library of state.libraries) {
				for (const series of library.series) {
					for (const season of series.seasons) {
						for (const episode of season.episodes) {
							if (episode.id === action.payload.episodeId) {
								episode.watched = action.payload.watched;
								found = true;

								if (
									state.selectedEpisode &&
									state.selectedEpisode.id === action.payload.episodeId
								) {
									state.selectedEpisode.watched = true;
								}
							}

							if (found) break;
						}

						if (found) {
							if (
								state.selectedSeason &&
								state.selectedSeason.id === season.id
							) {
								state.selectedSeason = season;
							}
							break;
						}
					}

					if (found) {
						if (
							state.selectedSeries &&
							state.selectedSeries.id === series.id
						) {
							state.selectedSeries = series;
						}
						break;
					}
				}

				if (found) {
					if (
						state.selectedLibrary &&
						state.selectedLibrary.id === library.id
					) {
						state.selectedLibrary = library;
					}
					break;
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
	toggleEpisodeWindow,
	updateEpisode,
	toggleSeriesWindow,
	toggleSeasonWindow,
	addLibrary,
	updateLibrary,
	markEpisodeWatched,
} = dataSlice.actions;
export default dataSlice.reducer;
