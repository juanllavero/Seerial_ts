import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { RightPanelSections } from "@data/enums/Sections";
import { useSectionContext } from "context/section.context";
import "./RightPanel.scss";
import NoContent from "./noContent/NoContent";
import CollectionsList from "./collections/CollectionsList";
import DetailsSection from "./details/DetailsSection";
import HomeSection from "./home/HomeSection";
import MusicSection from "./music/MusicSection";
import MusicDetails from "./music/MusicDetails";

/**
 * The RightPanel component is responsible for rendering the correct content
 * based on the selected library and series. It will reset the scroll position
 * to the top when the library or series changes. It uses the SectionContext to
 * switch between the different sections of the right panel.
 * @returns The correct content based on the selected library and series.
 */
function RightPanel() {
	const { currentRightSection } = useSectionContext();

	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const selectedSeries = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const previousLibraryId = useRef<string | null>(null);
	const previousSeriesId = useRef<string | null>(null);

	// useEffect to reset scroll position when library or series changes
	useEffect(() => {
		const scroll = document.getElementById("scroll");
		const libraryIdChanged =
			selectedLibrary && selectedLibrary.id !== previousLibraryId.current;
		const seriesIdChanged =
			selectedSeries && selectedSeries.id !== previousSeriesId.current;

		if ((libraryIdChanged || seriesIdChanged) && scroll) {
			scroll.scrollTop = 0;
		}

		if (libraryIdChanged) {
			previousLibraryId.current = selectedLibrary?.id || null;
		}
		if (seriesIdChanged) {
			previousSeriesId.current = selectedSeries?.id || null;
		}
	}, [selectedLibrary, selectedSeries]);

	return (
		<>
			{currentRightSection === RightPanelSections.Home ? (
				<HomeSection />
			) : currentRightSection === RightPanelSections.Collections ? (
				<CollectionsList />
			) : currentRightSection === RightPanelSections.MusicAlbums ||
			  currentRightSection === RightPanelSections.MusicTable ? (
				<MusicSection />
			) : currentRightSection === RightPanelSections.Details ? (
				<DetailsSection />
			) : currentRightSection === RightPanelSections.MusicDetails ? (
				<MusicDetails />
			) : (
				<NoContent />
			)}
		</>
	);
}

export default RightPanel;
