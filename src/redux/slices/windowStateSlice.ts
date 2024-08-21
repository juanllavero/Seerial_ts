import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WindowState {
    isMaximized: boolean
}

const initialState: WindowState = {
    isMaximized: false
};

const windowStateSlice = createSlice({
  name: 'windowState',
  initialState,
  reducers: {
    toggleMaximize(state, action: PayloadAction<boolean>) {
      state.isMaximized = action.payload;
    }
  },
});

export const { toggleMaximize } = windowStateSlice.actions;
export default windowStateSlice.reducer;