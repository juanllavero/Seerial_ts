import "../../i18n";
import "../../Fullscreen.scss";
import { SeriesData } from "@interfaces/SeriesData";
import ResolvedImage from "@components/image/ExternalImage";
import {
	setShowImageLoaded,
	setSeasonImageLoaded,
} from "@redux/slices/fullscreenSectionsSlice";
import { RootState } from "@redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
	selectEpisode,
	selectSeason,
	selectSeries,
} from "@redux/slices/dataSlice";
import { useState } from "react";
import { useSectionContext } from "context/section.context";
import { FullscreenSections } from "@data/enums/Sections";

function ShowsView() {
	const dispatch = useDispatch();
	const { setCurrentFullscreenSection } =
		useSectionContext();

	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const currentShow = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const currentEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);

	const seriesImageWidth = useSelector(
		(state: RootState) => state.seriesImage.width
	);
	const seriesImageHeight = useSelector(
		(state: RootState) => state.seriesImage.height
	);

	const [currentShowForBackground, setCurrentShowForBackground] =
		useState<SeriesData | null>(null);
	const handleSelectShow = (
		show: SeriesData | null,
		automaticSelection: boolean
	) => {
		if (show && currentShow !== show) {
			dispatch(selectSeries(show));
			setTimeout(() => {
				if (currentShow !== show) {
					setShowImageLoaded(false);
					setTimeout(() => {
						setCurrentShowForBackground(show);
						setShowImageLoaded(true);
					}, 200);
				}
			}, 400);
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
				setSeasonImageLoaded(true);
			}
		}
	};

	return (
		<div className="shows-container">
			{selectedLibrary && selectedLibrary.series.map((element) => (
				<button
					key={element.id}
					className={`shows-button ${
						currentShow === element ? "selected" : ""
					}`}
					title={element.name}
					onClick={() => handleSelectShow(element, false)}
				>
					{selectedLibrary.type === "Music" ? (
						<img
							loading="lazy"
							src={element.coverSrc}
							alt="Poster"
							style={{
								width: `${seriesImageWidth}px`,
								height: `${seriesImageWidth}px`,
							}}
							onError={(e: any) => {
								e.target.onerror = null; // To avoid infinite loop
								e.target.src = "./src/resources/img/songDefault.png";
							}}
						/>
					) : (
						<ResolvedImage
							src={
								selectedLibrary.type === "Movies" &&
								!element.isCollection
									? element.seasons[0].coverSrc
									: element.coverSrc
							}
							alt="Poster"
							style={{
								width: `${seriesImageWidth}px`,
								height: `${seriesImageHeight}px`,
							}}
							onError={(e: any) => {
								e.target.onerror = null; // To avoid infinite loop
								e.target.src = "./src/resources/img/fileNotFound.jpg";
							}}
						/>
					)}
				</button>
			))}
		</div>
	);
}

export default ShowsView;
