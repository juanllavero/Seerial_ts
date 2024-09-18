import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState = {
    isImageLoaded: false,
    gradientLoaded: false,
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
    setGradientLoaded: (state, action: PayloadAction<boolean>) => {
        state.gradientLoaded = action.payload;
    }
},
});

export const { loadImage, removeImage, setGradientLoaded } = imageLoadedSlice.actions;
export default imageLoadedSlice.reducer;