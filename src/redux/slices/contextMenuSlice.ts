import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isContextShown: false,
    videoMenuOpen: false,
    audioMenuOpen: false,
    subtitleMenuOpen: false,
    subtitleSizeMenu: false,
    libraryMenu: false,
    seriesMenu: false,
    seasonMenu: false,
    episodeMenu: false,
    mainMenu: false,
};

const contextMenuSlice = createSlice({
name: 'seasonMenu',
initialState,
reducers: {
    closeAllMenus: (state) => {
        state.isContextShown = false;
        state.videoMenuOpen = false;
        state.audioMenuOpen = false;
        state.subtitleMenuOpen = false;
        state.subtitleSizeMenu = false;
        state.libraryMenu = false;
        state.seriesMenu = false;
        state.seasonMenu = false;
        state.episodeMenu = false;
        state.mainMenu = false;
    },
    toggleContextMenu: (state) => {
        state.isContextShown = !state.isContextShown;
    },
    closeContextMenu: (state) => {
        state.isContextShown = false;
    },
    toggleVideoMenu: (state) => {
        state.videoMenuOpen = !state.videoMenuOpen;
    },
    toggleAudioMenu: (state) => {
        state.audioMenuOpen = !state.audioMenuOpen;
    },
    toggleSubsMenu: (state) => {
        state.subtitleMenuOpen = !state.subtitleMenuOpen;
    },
    toggleSubsSizeMenu: (state) => {
        state.subtitleSizeMenu = !state.subtitleSizeMenu;
    },
    toggleLibraryMenu: (state) => {
        state.libraryMenu = !state.libraryMenu;
    },
    toggleSeriesMenu: (state) => {
        state.seriesMenu = !state.seriesMenu;
    },
    toggleSeasonMenu: (state) => {
        state.seasonMenu = !state.seasonMenu;
    },
    toggleEpisodeMenu: (state) => {
        state.episodeMenu = !state.episodeMenu;
    },
    toggleMainMenu: (state) => {
        state.mainMenu = !state.mainMenu;
    },
},
});

export const { closeAllMenus, closeContextMenu, toggleContextMenu, toggleVideoMenu, toggleAudioMenu, toggleSubsMenu, toggleSubsSizeMenu, toggleLibraryMenu, 
    toggleSeriesMenu, toggleSeasonMenu, toggleEpisodeMenu, toggleMainMenu } = contextMenuSlice.actions;
export default contextMenuSlice.reducer;
