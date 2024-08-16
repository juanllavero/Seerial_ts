import { createSlice } from '@reduxjs/toolkit';
import { EpisodeData } from '@interfaces/EpisodeData';

interface EpisodeState {
  episodes: EpisodeData[];
}

const initialState: EpisodeState = {
  episodes: [],
};

export const episodeSlice = createSlice({
  name: 'episodes',
  initialState,
  reducers: {
    setEpisodes: (state, action) => {
      state.episodes = action.payload;
    },
    clearEpisodes: (state) => {
      state.episodes = [];
    }
  }
});

export const { setEpisodes, clearEpisodes } = episodeSlice.actions;
export default episodeSlice.reducer;