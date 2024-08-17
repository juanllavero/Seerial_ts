import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isContextShown: false,
};

const contextMenuSlice = createSlice({
name: 'seasonMenu',
initialState,
reducers: {
    toggleContextMenu: (state) => {
    state.isContextShown = !state.isContextShown;
    },
    closeContextMenu: (state) => {
    state.isContextShown = false;
    },
},
});

export const { toggleContextMenu, closeContextMenu } = contextMenuSlice.actions;
export default contextMenuSlice.reducer;