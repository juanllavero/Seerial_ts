import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface VideoState {
  isLoaded: boolean;
  paused: boolean;
  currentTime: number;
  duration: number;
}

const initialState: VideoState = {
  isLoaded: false,
  paused: false,
  currentTime: 0,
  duration: 0,
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
    setCurrentTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },
    setDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
    },
  },
});

export const { loadVideo, closeVideo, togglePause, setCurrentTime, setDuration } = videoSlice.actions;
export default videoSlice.reducer;