import { MusicSection } from "@data/enums/MusicSection";
import { ContextMenu } from "primereact/contextmenu";
import { useTranslation } from "react-i18next";
import MusicView from "../MusicView";
import MusicViewCards from "../MusicViewCards";
import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import { useRef, useState } from "react";

function MusicAlbums() {
   const { t } = useTranslation();
   const selectedSeries = useSelector((state: RootState) => state.data.selectedSeries);
   const selectedLibrary = useSelector((state: RootState) => state.data.selectedLibrary);
   const [musicSelect, setMusicSelect] = useState(false);
   const [musicSection, setMusicSection] = useState<MusicSection>(
		MusicSection.Collections
	);

   const cm4 = useRef<ContextMenu | null>(null);
	return (
		<div className="music-section">
			{!selectedSeries ? (
				<>
					<ContextMenu
						model={[
							{
								label: `${t("collections")} ${
									musicSection === MusicSection.Collections ? " ✓" : ""
								}`,
								command: () => {
									setMusicSection(MusicSection.Collections);
									setMusicSelect(false);
								},
							},
							{
								label: `${t("tracks")} ${
									musicSection === MusicSection.Tracks ? " ✓" : ""
								}`,
								command: () => {
									setMusicSection(MusicSection.Tracks);
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
							<span className="selected" style={{ fontSize: "medium" }}>
								{musicSection === MusicSection.Collections
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
			{selectedLibrary && musicSection === MusicSection.Tracks ? (
				<MusicView selectedLibrary={selectedLibrary} />
			) : selectedLibrary ? (
				<MusicViewCards selectedLibrary={selectedLibrary} />
			) : null}
		</div>
	);
}

export default MusicAlbums;
