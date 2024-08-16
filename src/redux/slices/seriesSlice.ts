import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SeriesData } from '@interfaces/SeriesData';
import { SeasonData } from '@interfaces/SeasonData';

interface SeriesState {
  selectedSeries: SeriesData | null;
  selectedSeason: SeasonData | null;
}

const initialState: SeriesState = {
  selectedSeries: null,
  selectedSeason: null,
};

export const seriesSlice = createSlice({
  name: 'series',
  initialState,
  reducers: {
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
  }
});

export const { selectSeries, selectSeason, resetSelection } = seriesSlice.actions;
export default seriesSlice.reducer;