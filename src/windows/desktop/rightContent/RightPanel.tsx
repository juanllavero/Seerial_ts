import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@redux/store";
import { RightPanelSections } from "@data/enums/Sections";
import { useSectionContext } from "context/section.context";
import "./RightPanel.scss";

const HomeSection = React.lazy(() => import("./HomeSection"));
const CollectionsList = React.lazy(() => import("./CollectionsList"));
const DetailsSection = React.lazy(() => import("./DetailsSection"));
const NoContent = React.lazy(() => import("./NoContent"));
const MusicSection = React.lazy(() => import("./MusicSection"));

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
	useEffect(() => {
		const scroll = document.getElementById("scroll");
		if (scroll) {
			scroll.scrollTop = 0;
		}
	}, [selectedSeries, selectedLibrary]);

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
			) : (
				<NoContent />
			)}
		</>
	);
}

export default RightPanel;
