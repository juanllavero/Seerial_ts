import { EpisodeData } from "@interfaces/EpisodeData";
import { RootState } from "@redux/store";
import React, { useRef } from "react";
import { useSelector } from "react-redux";
import EpisodeCard from "./EpisodeCard";

function EpisodeList() {
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);

	const listRef = useRef<HTMLDivElement>(null);

	return (
		<div className="episodes-list" ref={listRef}>
			{currentSeason &&
				currentSeason.episodes.map(
					(episode: EpisodeData, index: number) => (
						<EpisodeCard
							episode={episode}
							index={index}
							listRef={listRef}
							key={episode.id}
						/>
					)
				)}
		</div>
	);
}

export default React.memo(EpisodeList);
