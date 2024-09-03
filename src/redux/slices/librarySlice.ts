import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LibraryData } from '@interfaces/LibraryData';

interface LibraryState {
  libraries: LibraryData[];
  selectedLibrary: LibraryData | null;
  libraryForMenu: LibraryData | null;
  showCollectionPoster: boolean;
  libraryEditWindow: boolean;
}

const initialState: LibraryState = {
  libraries: [],
  selectedLibrary: null,
  libraryForMenu: null,
  showCollectionPoster: false,
  libraryEditWindow: false,
};

const librarySlice = createSlice({
  name: 'library',
  initialState,
  reducers: {
    setLibraries: (state, action: PayloadAction<LibraryData[]>) => {
      state.libraries = action.payload;
    },
    selectLibrary: (state, action: PayloadAction<LibraryData>) => {
      state.selectedLibrary = action.payload;
    },
    clearLibrarySelection: (state) => {
      state.selectedLibrary = null;
    },
    setShowPoster: (state, action: PayloadAction<boolean>) => {
      state.showCollectionPoster = action.payload;
    },
    setLibraryForMenu: (state, action) => {
      state.libraryForMenu = action.payload;
    },
    toggleLibraryEditWindow: (state) => {
      state.libraryEditWindow = !state.libraryEditWindow;
    }
  }
});

export const { setLibraries, selectLibrary, clearLibrarySelection, setShowPoster, setLibraryForMenu, toggleLibraryEditWindow } = librarySlice.actions;
export default librarySlice.reducer;