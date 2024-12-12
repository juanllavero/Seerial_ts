import Image from "@components/image/Image";
import { ReactUtils } from "@data/utils/ReactUtils";
import { SeasonData } from "@interfaces/SeasonData";
import { selectSeason } from "@redux/slices/dataSlice";
import { RootState } from "@redux/store";
import { useFullscreenContext } from "context/fullscreen.context";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

function AlbumCard({
	element,
	index,
	listRef,
}: {
	element: SeasonData;
	index: number;
	listRef: React.RefObject<HTMLDivElement>;
}) {
	const dispatch = useDispatch();
	const { setInSongsView } = useFullscreenContext();
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);

	return (
		<button
			key={element.id}
			className={`album-button ${
				currentSeason === element ? "selected" : ""
			}`}
			title={element.name}
			onClick={() => {
				if (currentSeason && currentSeason.id === element.id) {
					setInSongsView(true);
				}

				dispatch(selectSeason(element));
				ReactUtils.handleScrollElementClick(index, listRef, false);
			}}
		>
			<Image
				src={element.coverSrc}
				alt="Poster"
				isRelative={false}
				errorSrc="./src/resources/img/songDefault.png"
			/>
			<span>{element.name}</span>
			<span>{element.year}</span>
		</button>
	);
}

export default React.memo(AlbumCard);
