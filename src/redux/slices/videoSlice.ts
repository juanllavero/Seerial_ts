import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VideoState {
  isLoaded: boolean;
  paused: boolean;
  currentTime: number;
  duration: number;
  controlsSown: boolean;
  inSettings: boolean;
  inChapters: boolean;
  volume: number;
}

const initialState: VideoState = {
  isLoaded: false,
  paused: false,
  currentTime: 0,
  duration: 0,
  controlsSown: false,
  inSettings: false,
  inChapters: false,
  volume: 100,
};

const videoSlice = createSlice({
  name: 'video',
  initialState,
  reducers: {
    loadVideo(state) {
      state.isLoaded = true;
    },
    closeVideo(state) {
      state.isLoaded = false;
    },
    togglePause(state) {
      state.paused = !state.paused;
    },
    setCurrentTime(state, action) {
      state.currentTime = action.payload;
    },
    setDuration(state, action) {
      state.duration = action.payload;
    },
    toggleControls(state, action) {
      state.controlsSown = action.payload;
    },
    toggleInSettings(state, action) {
      state.inSettings = action.payload;
    },
    toggleInChapters(state, action) {
      state.inChapters = action.payload;
    },
    changeVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
    }
  },
});

export const { loadVideo, closeVideo, togglePause, setCurrentTime, setDuration, 
  toggleControls, toggleInSettings, toggleInChapters, changeVolume } = videoSlice.actions;
export default videoSlice.reducer;