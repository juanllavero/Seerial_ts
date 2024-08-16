import { createSlice } from '@reduxjs/toolkit';
import { SeasonData } from '@interfaces/SeasonData';

interface SeasonState {
  selectedSeason: SeasonData | null;
}

const initialState: SeasonState = {
  selectedSeason: null,
};

export const seasonSlice = createSlice({
  name: 'season',
  initialState,
  reducers: {
    selectSeason: (state, action) => {
      state.selectedSeason = action.payload;
    },
    clearSeasonSelection: (state) => {
      state.selectedSeason = null;
    }
  }
});

export const { selectSeason, clearSeasonSelection } = seasonSlice.actions;
export default seasonSlice.reducer;