import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LibraryData } from '@interfaces/LibraryData';
import { SeriesData } from '@interfaces/SeriesData';
import { SeasonData } from '@interfaces/SeasonData';
import { EpisodeData } from '@interfaces/EpisodeData';

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
  name: 'data',
  initialState,
  reducers: {
    // LIBRARY REDUCERS
    setLibraries: (state, action: PayloadAction<LibraryData[]>) => {
      state.libraries = action.payload;
    },
    selectLibrary: (state, action: PayloadAction<LibraryData>) => {
      state.selectedLibrary = action.payload;
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

    // SERIES AND SEASONS REDUCERS
    showSeriesMenu: (state, action: PayloadAction<SeriesData>) => {
        state.seriesMenu = action.payload;
    },
    selectSeries: (state, action: PayloadAction<SeriesData>) => {
        state.selectedSeries = action.payload;
        state.selectedSeason = action.payload.seasons[0];
    },
    selectSeason: (state, action: PayloadAction<SeasonData>) => {
        state.selectedSeason = action.payload;
    },
    resetSelection: (state) => {
        state.selectedSeries = null;
        state.selectedSeason = null;
    },
    toggleSeriesWindow: (state) => {
        state.seriesWindowOpen = !state.seriesWindowOpen;
    },
    toggleSeasonWindow: (state) => {
        state.seasonWindowOpen = !state.seasonWindowOpen;
    },
    updateSeason: (state, action: PayloadAction<SeasonData>) => {
      if (state.selectedSeason) {
        state.selectedSeason = action.payload;
      }

      const seasons = state.selectedSeries?.seasons;

      if (seasons){
        // Update Season in list
        const seasonIndex = seasons.findIndex(
          (season) => season.id === action.payload.id
        );

        if (seasonIndex >= 0) {
          seasons[seasonIndex] = action.payload;
        }
      }
  },

    // EPISODES REDUCERS
    selectEpisode: (state, action) => {
        state.selectedEpisode = action.payload;
    },
    showMenu: (state, action) => {
        state.showEpisodeMenu = action.payload;
    },
    toggleEpisodeWindow: (state) => {
        state.episodeWindowOpen = !state.episodeWindowOpen;
    },
    updateEpisode: (state, action: PayloadAction<EpisodeData>) => {
        if (state.selectedEpisode) {
          state.selectedEpisode = action.payload;
        }

        const episodes = state.selectedSeason?.episodes;

        if (episodes){
          // Update Episode in list
          const episodeIndex = episodes.findIndex(
            (episode) => episode.id === action.payload.id
          );

          if (episodeIndex >= 0) {
            episodes[episodeIndex] = action.payload;
          }
        }
    },
  }
});

export const { setLibraries, selectLibrary, clearLibrarySelection, setShowPoster, setLibraryForMenu, toggleLibraryEditWindow
    , showSeriesMenu, selectSeries, selectSeason, resetSelection, updateSeason, selectEpisode, showMenu, 
    toggleEpisodeWindow, updateEpisode, toggleSeriesWindow, toggleSeasonWindow } = dataSlice.actions;
export default dataSlice.reducer;