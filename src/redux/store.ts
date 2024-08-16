import { configureStore } from "@reduxjs/toolkit";
import librarySlice from './slices/librarySlice';
import seriesSlice from './slices/seriesSlice';
import seasonSlice from './slices/seasonSlice';
import episodeSlice from './slices/episodeSlice';
import seriesImageSlice from "./slices/seriesImageSlice";
import episodeImageSlice from "./slices/episodeImageSlice";

export const store = configureStore({
  reducer: {
    library: librarySlice,
    series: seriesSlice,
    season: seasonSlice,
    episodes: episodeSlice,
    seriesImage: seriesImageSlice,
    episodeImage: episodeImageSlice
  }
})

// Tipos para el estado y el dispatch para su uso en componentes
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;