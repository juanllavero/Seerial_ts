import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LibraryData } from '@interfaces/LibraryData';

interface LibraryState {
  libraries: LibraryData[];
  selectedLibrary: LibraryData | null;
  showCollectionPoster: boolean;
}

const initialState: LibraryState = {
  libraries: [],
  selectedLibrary: null,
  showCollectionPoster: false
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setLibraries: (state, action: PayloadAction<any[]>) => {
      state.libraries = action.payload;
    },
    selectLibrary: (state, action: PayloadAction<any>) => {
      state.selectedLibrary = action.payload;
    },
    clearLibrarySelection: (state) => {
      state.selectedLibrary = null;
    },
    setShowPoster: (state, action: PayloadAction<boolean>) => {
      state.showCollectionPoster = action.payload;
    }
  }
});

export const { setLibraries, selectLibrary, clearLibrarySelection, setShowPoster } = librarySlice.actions;
export default librarySlice.reducer;