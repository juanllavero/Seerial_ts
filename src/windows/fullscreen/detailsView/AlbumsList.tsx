import { RootState } from "@redux/store";
import { t } from "i18next";
import React, { useRef } from "react";
import { useSelector } from "react-redux";
import "./AlbumsList.scss";
import AlbumCard from "./AlbumCard";

function AlbumsList() {
	const currentShow = useSelector(
		(state: RootState) => state.data.selectedSeries
	);

	const listRef = useRef<HTMLDivElement>(null);
	return (
		<>
			<span id="albums-title">{t("albums")}</span>
			<div className="music-list" ref={listRef}>
				{currentShow &&
					currentShow.seasons.map((element, index) => (
						<AlbumCard
							key={element.id}
							element={element}
							listRef={listRef}
							index={index}
						/>
					))}
			</div>
		</>
	);
}

export default React.memo(AlbumsList);
