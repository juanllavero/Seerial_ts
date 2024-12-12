import Image from "@components/image/Image";
import { FullscreenSections } from "@data/enums/Sections";
import { SeriesData } from "@interfaces/SeriesData";
import {
	selectSeries,
	selectSeason,
	selectEpisode,
} from "@redux/slices/dataSlice";
import { RootState } from "@redux/store";
import { useFullscreenContext } from "context/fullscreen.context";
import { useSectionContext } from "context/section.context";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

function ShowsCard({ element }: { element: SeriesData }) {
	const dispatch = useDispatch();
	const { setCurrentFullscreenSection } = useSectionContext();

	const {
		setHomeBackgroundLoaded,
		setCollectionsBackgroundLoaded,
		setCurrentShowForBackground,
	} = useFullscreenContext();

	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const currentShow = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);

	const seriesImageWidth = useSelector(
		(state: RootState) => state.seriesImage.width
	);
	const seriesImageHeight = useSelector(
		(state: RootState) => state.seriesImage.height
	);

	useEffect(() => {
		if (currentShow && currentShow.id === element.id) {
			setTimeout(() => {
				setCollectionsBackgroundLoaded(false);
				setTimeout(() => {
					setCurrentShowForBackground(element);
					setCollectionsBackgroundLoaded(true);
				}, 200);
			}, 400);
		}
	}, [currentShow]);

	const handleSelectShow = (
		show: SeriesData | null,
		automaticSelection: boolean
	) => {
		if (show && currentShow !== show) {
			dispatch(selectSeries(show));
		} else if (show && !automaticSelection) {
			if (show.seasons && show.seasons.length > 0) {
				if (
					show.currentlyWatchingSeason &&
					show.currentlyWatchingSeason !== -1
				) {
					dispatch(
						selectSeason(show.seasons[show.currentlyWatchingSeason])
					);

					if (
						currentSeason &&
						currentSeason.currentlyWatchingEpisode &&
						currentSeason.currentlyWatchingEpisode !== -1
					) {
						dispatch(
							selectEpisode(
								currentSeason.episodes[
									currentSeason.currentlyWatchingEpisode
								]
							)
						);
					} else if (
						currentSeason &&
						currentSeason.episodes &&
						currentSeason.episodes.length > 0
					) {
						dispatch(selectEpisode(currentSeason.episodes[0]));
					}
				} else {
					dispatch(selectSeason(show.seasons[0]));

					if (
						show.seasons[0] &&
						show.seasons[0].episodes &&
						show.seasons[0].episodes.length > 0
					) {
						dispatch(selectEpisode(show.seasons[0].episodes[0]));
					}
				}

				setCurrentFullscreenSection(FullscreenSections.Details);
				setHomeBackgroundLoaded(true);
			}
		}
	};

	return (
		<button
			key={element.id}
			className={`shows-button ${currentShow === element ? "selected" : ""}`}
			title={element.name}
			onClick={() => handleSelectShow(element, false)}
		>
			{selectedLibrary && selectedLibrary.type === "Music" ? (
				<Image
					src={element.coverSrc}
					alt="Poster"
					width={seriesImageWidth}
					height={seriesImageWidth}
					errorSrc="./src/resources/img/songDefault.png"
					isRelative={false}
				/>
			) : (
				<Image
					src={
						selectedLibrary &&
						selectedLibrary.type === "Movies" &&
						!element.isCollection
							? element.seasons[0].coverSrc
							: element.coverSrc
					}
					alt="Poster"
					width={seriesImageWidth}
					height={seriesImageHeight}
					errorSrc="./src/resources/img/fileNotFound.jpg"
					isRelative={true}
				/>
			)}
		</button>
	);
}

export default React.memo(ShowsCard);
