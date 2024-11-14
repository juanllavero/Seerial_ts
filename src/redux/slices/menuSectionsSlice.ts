import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WindowSections } from '@data/enums/Sections';

interface SectionInterface {
    menuSection: WindowSections;
}
const initialState: SectionInterface = {
    menuSection: WindowSections.General,
};

const menuSectionsSlice = createSlice({
name: 'menuSections',
initialState,
reducers: {
    changeMenuSection: (state, action: PayloadAction<WindowSections>) => {
        state.menuSection = action.payload;
    },
},
});

export const { changeMenuSection } = menuSectionsSlice.actions;
export default menuSectionsSlice.reducer;
