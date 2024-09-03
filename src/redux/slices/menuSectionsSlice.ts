import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Section } from 'data/enums/Section';

interface SectionInterface {
    menuSection: Section;
}
const initialState: SectionInterface = {
    menuSection: Section.General,
};

const menuSectionsSlice = createSlice({
name: 'menuSections',
initialState,
reducers: {
    changeMenuSection: (state, action: PayloadAction<Section>) => {
        state.menuSection = action.payload;
    },
},
});

export const { changeMenuSection } = menuSectionsSlice.actions;
export default menuSectionsSlice.reducer;
