import { EpisodeData } from '@interfaces/EpisodeData';
import { createSlice } from '@reduxjs/toolkit';

interface MusicPlayerState {
    songsList: EpisodeData[];
    currentSong: number;
    paused: boolean;
}

const initialState: MusicPlayerState = {
    songsList: [],
    currentSong: -1,
    paused: false,
};

const musicPlayerSlice = createSlice({
  name: 'musicPlayer',
  initialState,
  reducers: {
    setSongs: (state, action) => {
        state.songsList = action.payload;
    },
    setCurrentSong: (state, action) => {
        if (action.payload < state.songsList.length)
            state.currentSong = action.payload;
    },
    playLastSong: (state) => {
        if (state.currentSong > 0){
            state.currentSong--;
        }
    },
    playNextSong: (state) => {
        if (state.currentSong < state.songsList.length - 1){
            state.currentSong++;
        }
    },
    toggleMusicPause: (state) => {
        state.paused = !state.paused;
    }
  },
});

export const { setSongs, setCurrentSong, playLastSong, playNextSong, toggleMusicPause } = musicPlayerSlice.actions;
export default musicPlayerSlice.reducer;