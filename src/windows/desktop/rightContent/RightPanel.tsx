import { useContext, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { SectionContext } from "context/section.context";
import { RightPanelSections } from "@data/enums/Sections";
import HomeSection from "./HomeSection";
import MusicTable from "./MusicTable";
import CollectionsList from "./CollectionsList";
import DetailsSection from "./DetailsSection";
import NoContent from "./NoContent";
import MusicAlbums from "./MusicAlbums";

function RightPanel() {
	const { currentRightSection, setCurrentRightSection } =
		useContext(SectionContext);

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
			) : currentRightSection === RightPanelSections.MusicTable ? (
				<MusicTable />
			) : currentRightSection === RightPanelSections.MusicAlbums ? (
				<MusicAlbums />
			) : currentRightSection === RightPanelSections.Details ? (
				<DetailsSection />
			) : (
				<NoContent />
			)}
		</>
	);
}

export default RightPanel;
