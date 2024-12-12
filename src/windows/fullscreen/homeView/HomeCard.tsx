import Image from "@components/image/Image";
import { ReactUtils } from "@data/utils/ReactUtils";
import { EpisodeData } from "@interfaces/EpisodeData";
import { LibraryData } from "@interfaces/LibraryData";
import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";
import { setHomeInfoElement } from "@redux/slices/fullscreenSectionsSlice";
import { RootState } from "@redux/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

function HomeCard({
	value,
	listRef,
	index,
}: {
	value: {
		library: LibraryData;
		show: SeriesData;
		season: SeasonData;
		episode: EpisodeData;
	},
	listRef: React.RefObject<HTMLDivElement>,
	index: number,
}) {
	const dispatch = useDispatch();
	const homeInfoElement = useSelector(
		(state: RootState) => state.fullscreenSection.homeInfoElement
	);
	return (
		<div
			className={`element ${
				value === homeInfoElement ? "element-selected" : null
			}`}
			onClick={() => {
				ReactUtils.handleScrollElementClick(index, listRef, false);
				dispatch(setHomeInfoElement(value));
			}}
		>
			{value.show.coverSrc !== "" ? (
				<Image
					src={value.show.coverSrc}
					alt="Poster"
					isRelative={true}
					errorSrc="./src/resources/img/fileNotFound.jpg"
				/>
			) : value.show.seasons &&
			  value.show.seasons.length > 0 &&
			  value.show.seasons[0].coverSrc !== "" ? (
				<Image
					src={value.show.seasons[0].coverSrc}
					alt="Poster"
					isRelative={true}
					errorSrc="./src/resources/img/fileNotFound.jpg"
				/>
			) : (
				<Image
					src="resources/img/fileNotFound.jpg"
					alt="Poster"
					isRelative={true}
					errorSrc=""
				/>
			)}
		</div>
	);
}

export default React.memo(HomeCard);
