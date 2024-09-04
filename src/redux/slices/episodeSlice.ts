import { createSlice } from '@reduxjs/toolkit';
import { EpisodeData } from '@interfaces/EpisodeData';

interface EpisodeState {
  episodes: EpisodeData[];
  selectedEpisode: EpisodeData | null;
  showEpisodeMenu: boolean;
  episodeWindowOpen: boolean;
}

const initialState: EpisodeState = {
  episodes: [],
  selectedEpisode: null,
  showEpisodeMenu: false,
  episodeWindowOpen: false,
};

const episodeSlice = createSlice({
  name: 'episodes',
  initialState,
  reducers: {
    setEpisodes: (state, action) => {
      state.episodes = action.payload;
    },
    clearEpisodes: (state) => {
      state.episodes = [];
    },
    selectEpisode: (state, action) => {
      state.selectedEpisode = action.payload;
    },
    showMenu: (state, action) => {
      state.showEpisodeMenu = action.payload;
    },
    toggleEpisodeWindow: (state) => {
      state.episodeWindowOpen = !state.episodeWindowOpen;
    }
  }
});

export const { setEpisodes, clearEpisodes, selectEpisode, showMenu, toggleEpisodeWindow } = episodeSlice.actions;
export default episodeSlice.reducer;