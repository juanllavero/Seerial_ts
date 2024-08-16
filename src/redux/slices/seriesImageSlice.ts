import { createSlice } from '@reduxjs/toolkit';

interface ImageSizeState {
  width: number;
  height: number;
  aspectRatio: number
}

const initialState: ImageSizeState = {
  width: 250,
  height: 375,
  aspectRatio: 250 / 375
};

const seriesImageSlice = createSlice({
  name: 'seriesImageSize',
  initialState,
  reducers: {
    increaseSeriesImageSize: (state) => {
      if (state.width < 300) {
        state.width += 10;
        state.height = state.width / state.aspectRatio;
      }
    },
    reduceSeriesImageSize: (state) => {
      if (state.width > 130) {
        state.width -= 10;
        state.height = state.width / state.aspectRatio;
      }
    }
  },
});

export const { increaseSeriesImageSize, reduceSeriesImageSize } = seriesImageSlice.actions;
export default seriesImageSlice.reducer;