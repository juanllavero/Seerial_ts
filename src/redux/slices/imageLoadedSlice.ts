import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isImageLoaded: false,
};

const imageLoadedSlice = createSlice({
name: 'imageLoaded',
initialState,
reducers: {
    loadImage: (state) => {
    state.isImageLoaded = true;
    },
    removeImage: (state) => {
    state.isImageLoaded = false;
    },
},
});

export const { loadImage, removeImage } = imageLoadedSlice.actions;
export default imageLoadedSlice.reducer;