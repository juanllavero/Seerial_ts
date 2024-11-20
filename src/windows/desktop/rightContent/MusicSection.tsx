import { ContextMenu } from "primereact/contextmenu";
import { useTranslation } from "react-i18next";
import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import { Suspense, useRef, useState } from "react";
import { useSectionContext } from "context/section.context";
import { RightPanelSections } from "@data/enums/Sections";
import MusicTable from "./MusicTable";
import MusicCards from "./MusicCards";
import "./MusicSection.scss";
import Loading from "@components/utils/Loading";

function MusicSection() {
	const { t } = useTranslation();
	const { currentRightSection, setCurrentRightSection } = useSectionContext();
	const selectedSeries = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const [musicSelect, setMusicSelect] = useState(false);

	const cm4 = useRef<ContextMenu | null>(null);
	return (
		<Suspense fallback={<Loading />}>
			<div className="music-section">
				{!selectedSeries ? (
					<>
						<ContextMenu
							model={[
								{
									label: `${t("collections")} ${
										currentRightSection ===
										RightPanelSections.MusicAlbums
											? " ✓"
											: ""
									}`,
									command: () => {
										setCurrentRightSection(
											RightPanelSections.MusicAlbums
										);
										setMusicSelect(false);
									},
								},
								{
									label: `${t("tracks")} ${
										currentRightSection ===
										RightPanelSections.MusicTable
											? " ✓"
											: ""
									}`,
									command: () => {
										setCurrentRightSection(
											RightPanelSections.MusicTable
										);
										setMusicSelect(false);
									},
								},
							]}
							ref={cm4}
							className="dropdown-menu"
						/>
						<div className="dropdown">
							<div
								className="select"
								onClick={(e) => {
									cm4.current?.show(e);
									setMusicSelect(true);
								}}
								onAuxClick={() => setMusicSelect(false)}
							>
								<span
									className="selected"
									style={{ fontSize: "medium" }}
								>
									{currentRightSection ===
									RightPanelSections.MusicAlbums
										? t("collections")
										: t("tracks")}
								</span>
								<div
									className={`arrow ${
										musicSelect ? " arrow-rotate" : ""
									}`}
								></div>
							</div>
						</div>
					</>
				) : null}
				{selectedLibrary &&
				currentRightSection === RightPanelSections.MusicTable ? (
					<MusicTable selectedLibrary={selectedLibrary} />
				) : selectedLibrary ? (
					<MusicCards selectedLibrary={selectedLibrary} />
				) : null}
			</div>
		</Suspense>
	);
}

export default MusicSection;
