import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isTransparentImageLoaded: false,
};

const transparentImageLoadedSlice = createSlice({
name: 'transparentImage',
initialState,
reducers: {
    loadTransparentImage: (state) => {
        state.isTransparentImageLoaded = true;
    },
    removeTransparentImage: (state) => {
        state.isTransparentImageLoaded = false;
    },
},
});

export const { loadTransparentImage, removeTransparentImage } = transparentImageLoadedSlice.actions;
export default transparentImageLoadedSlice.reducer;