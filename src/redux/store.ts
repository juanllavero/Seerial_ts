import { configureStore } from "@reduxjs/toolkit";
import seriesImageSlice from "./slices/seriesImageSlice";
import episodeImageSlice from "./slices/episodeImageSlice";
import contextMenuSlice from "./slices/contextMenuSlice";
import imageLoadedSlice from "./slices/imageLoadedSlice";
import transparentImageLoadedSlice from "./slices/transparentImageLoadedSlice"
import videoSlice from "./slices/videoSlice"
import windowStateSlice from "./slices/windowStateSlice";
import menuSectionsSlice from "./slices/menuSectionsSlice";
import dataSlice from "./slices/dataSlice";
import musicPlayerSlice from "./slices/musicPlayerSlice";

export const store = configureStore({
  reducer: {
    data: dataSlice,
    seriesImage: seriesImageSlice,
    episodeImage: episodeImageSlice,
    contextMenu: contextMenuSlice,
    imageLoaded: imageLoadedSlice,
    transparentImageLoaded: transparentImageLoadedSlice,
    video: videoSlice,
    windowState: windowStateSlice,
    sectionState: menuSectionsSlice,
    musicPlayer: musicPlayerSlice,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
  }),
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;