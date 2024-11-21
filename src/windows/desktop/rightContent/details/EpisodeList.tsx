import { EpisodeData } from "@interfaces/EpisodeData";
import { RootState } from "@redux/store";
import React from "react";
import { useSelector } from "react-redux";
import EpisodeCard from "./EpisodeCard";
import "./EpisodeList.scss";

function EpisodeList() {
	const selectedSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	return (
		<div className="episodes-container">
			{selectedSeason &&
				selectedSeason.episodes &&
				[...selectedSeason.episodes]
					.sort((a, b) => a.episodeNumber - b.episodeNumber)
					.map((episode: EpisodeData) => (
						<EpisodeCard episode={episode} key={episode.id} />
					))}
		</div>
	);
}

export default React.memo(EpisodeList);
