import ResolvedImage from "@components/image/ExternalImage";
import { ReactUtils } from "@data/utils/ReactUtils";
import { EpisodeData } from "@interfaces/EpisodeData";
import { selectEpisode } from "@redux/slices/dataSlice";
import { RootState } from "@redux/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

function EpisodeCard({ episode, index, listRef }: { episode: EpisodeData, index: number, listRef: React.RefObject<HTMLDivElement> }) {
	const dispatch = useDispatch();
  const currentEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);

	return (
		<div
			className={`element ${
				episode === currentEpisode ? "element-selected" : null
			}`}
			key={episode.id}
			onClick={() => {
        dispatch(selectEpisode(episode));
				ReactUtils.handleScrollElementClick(index, listRef, false);
			}}
		>
			{episode.imgSrc !== "" ? (
				<ResolvedImage
					src={episode.imgSrc}
					alt="Poster"
					onError={(e: any) => {
						e.target.onerror = null; // To avoid infinite loop
						e.target.src = "./src/resources/img/defaultThumbnail.jpg";
					}}
				/>
			) : (
				<ResolvedImage
					src="resources/img/defaultThumbnail.jpg"
					alt="Poster"
				/>
			)}
		</div>
	);
}

export default React.memo(EpisodeCard);
