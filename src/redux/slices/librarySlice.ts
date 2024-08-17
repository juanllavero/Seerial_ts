import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LibraryData } from '@interfaces/LibraryData';

interface LibraryState {
  libraries: LibraryData[];
  selectedLibrary: LibraryData | null;
}

const initialState: LibraryState = {
  libraries: [],
  selectedLibrary: null,
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
    }
  }
});

export const { setLibraries, selectLibrary, clearLibrarySelection } = librarySlice.actions;
export default librarySlice.reducer;