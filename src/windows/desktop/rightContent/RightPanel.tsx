import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { RightPanelSections } from "@data/enums/Sections";
import HomeSection from "./HomeSection";
import CollectionsList from "./CollectionsList";
import DetailsSection from "./DetailsSection";
import NoContent from "./NoContent";
import MusicSection from "./MusicSection";
import { useSectionContext } from "context/section.context";

/**
 * The RightPanel component is responsible for rendering the correct content
 * based on the selected library and series. It will reset the scroll position
 * to the top when the library or series changes. It uses the SectionContext to
 * switch between the different sections of the right panel.
 * @returns The correct content based on the selected library and series.
 */
function RightPanel() {
	const { currentRightSection, setCurrentRightSection } = useSectionContext();

	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const selectedSeries = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	useEffect(() => {
		const scroll = document.getElementById("scroll");
		if (scroll) {
			scroll.scrollTop = 0;
		}

		setCurrentRightSection(
			selectedLibrary
				? RightPanelSections.Collections
				: RightPanelSections.Home
		);
	}, [selectedSeries, selectedLibrary]);

	return (
		<>
			{currentRightSection === RightPanelSections.Home ? (
				<HomeSection />
			) : currentRightSection === RightPanelSections.Collections ? (
				<CollectionsList />
			) : currentRightSection === RightPanelSections.MusicAlbums || currentRightSection === RightPanelSections.MusicTable ? (
				<MusicSection />
			) : currentRightSection === RightPanelSections.Details ? (
				<DetailsSection />
			) : (
				<NoContent />
			)}
		</>
	);
}

export default RightPanel;
