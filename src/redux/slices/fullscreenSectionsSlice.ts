import { HomeInfoElement } from "@interfaces/HomeInfoElement";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FullscreenSection } from "data/enums/FullscreenSections";

interface SectionInterface {
	fullscreenSection: FullscreenSection;
	homeInfoElement: HomeInfoElement | undefined;
	currentlyWatchingShows: HomeInfoElement[];
	dominantColor: string;
	homeImageLoaded: boolean;
	showImageLoaded: boolean;
	seasonImageLoaded: boolean;
}
const initialState: SectionInterface = {
	fullscreenSection: FullscreenSection.Home,
	homeInfoElement: undefined,
	currentlyWatchingShows: [],
	dominantColor: "000000",
	homeImageLoaded: false,
	showImageLoaded: false,
	seasonImageLoaded: false,
};

const fullscreenSectionsSlice = createSlice({
	name: "fullscreenSections",
	initialState,
	reducers: {
		changeFullscreenSection: (
			state,
			action: PayloadAction<FullscreenSection>
		) => {
			state.fullscreenSection = action.payload;
		},
		setHomeInfoElement: (
			state,
			action: PayloadAction<HomeInfoElement | undefined>
		) => {
			state.homeInfoElement = action.payload;
		},
		setCurrentlyWatchingShows: (
			state,
			action: PayloadAction<HomeInfoElement[]>
		) => {
			state.currentlyWatchingShows = action.payload;
		},
		setDominantColor: (state, action: PayloadAction<string>) => {
			state.dominantColor = action.payload;
		},
		setHomeImageLoaded: (state, action: PayloadAction<boolean>) => {
			state.homeImageLoaded = action.payload;
		},
		setShowImageLoaded: (state, action: PayloadAction<boolean>) => {
			state.showImageLoaded = action.payload;
		},
		setSeasonImageLoaded: (state, action: PayloadAction<boolean>) => {
			state.seasonImageLoaded = action.payload;
		},
	},
});

export const {
	changeFullscreenSection,
	setHomeInfoElement,
	setCurrentlyWatchingShows,
	setDominantColor,
	setHomeImageLoaded,
	setShowImageLoaded,
	setSeasonImageLoaded,
} = fullscreenSectionsSlice.actions;
export default fullscreenSectionsSlice.reducer;
