import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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
    },
    updateMediaInfo: (state, action: PayloadAction<EpisodeData>) => {
      if (state.selectedEpisode) {
        state.selectedEpisode.mediaInfo = action.payload.mediaInfo;
        state.selectedEpisode.videoTracks = action.payload.videoTracks;
        state.selectedEpisode.audioTracks = action.payload.audioTracks;
        state.selectedEpisode.subtitleTracks = action.payload.subtitleTracks;
        state.selectedEpisode.chapters = action.payload.chapters;
        state.selectedEpisode.runtimeInSeconds = action.payload.runtimeInSeconds;
      }
    },
    updateEpisode: (state, action: PayloadAction<EpisodeData>) => {
      if (state.selectedEpisode) {
        state.selectedEpisode.name = action.payload.name;
        state.selectedEpisode.year = action.payload.year;
        state.selectedEpisode.order = action.payload.order;
        state.selectedEpisode.overview = action.payload.overview;
        state.selectedEpisode.directedBy = action.payload.directedBy;
        state.selectedEpisode.writtenBy = action.payload.writtenBy;

        state.selectedEpisode.nameLock = action.payload.nameLock;
        state.selectedEpisode.yearLock = action.payload.yearLock;
        state.selectedEpisode.orderLock = action.payload.orderLock;
        state.selectedEpisode.overviewLock = action.payload.overviewLock;
        state.selectedEpisode.directedLock = action.payload.directedLock;
        state.selectedEpisode.writtenLock = action.payload.writtenLock;

        console.log(state.selectedEpisode.imgSrc);
        console.log(action.payload.imgSrc);

        if (action.payload.imgSrc !== ""){
          console.log("YEP")
          state.selectedEpisode.imgSrc = action.payload.imgSrc;
        }


      }
    },
  }
});

export const { setEpisodes, clearEpisodes, selectEpisode, showMenu, toggleEpisodeWindow,
  updateMediaInfo, updateEpisode } = episodeSlice.actions;
export default episodeSlice.reducer;