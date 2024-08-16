import { createSlice } from '@reduxjs/toolkit';

interface ImageSizeState {
  width: number;
  height: number;
  aspectRatio: number;
}

const initialState: ImageSizeState = {
  width: 430,
  height: 241,
  aspectRatio: 430 / 241
};

const episodeImageSlice = createSlice({
  name: 'episodeImageSize',
  initialState,
  reducers: {
    increaseEpisodeImageSize: (state) => {
      if (state.width < 460) {
        state.width += 10;
        state.height = state.width / state.aspectRatio;
      }
    },
    reduceEpisodeImageSize: (state) => {
      if (state.width > 290) {
        state.width -= 10;
        state.height = state.width / state.aspectRatio;
      }
    }
  },
});

export const { increaseEpisodeImageSize, reduceEpisodeImageSize } = episodeImageSlice.actions;
export default episodeImageSlice.reducer;