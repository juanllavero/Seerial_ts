import Image from "@components/image/Image";
import { EpisodeData } from "@interfaces/EpisodeData";
import { toggleEpisodeMenu } from "@redux/slices/contextMenuSlice";
import {
	selectEpisode,
	showMenu,
	toggleEpisodeWindow,
} from "@redux/slices/dataSlice";
import { loadVideo } from "@redux/slices/videoSlice";
import { RootState } from "@redux/store";
import { t } from "i18next";
import { ContextMenu } from "primereact/contextmenu";
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

interface EpisodeCardProps {
	episode: EpisodeData;
}

function EpisodeCard({ episode }: EpisodeCardProps) {
	const dispatch = useDispatch();

	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const selectedSeries = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const selectedSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const cm2 = useRef<ContextMenu | null>(null);
	const episodeImageWidth = useSelector(
		(state: RootState) => state.episodeImage.width
	);
	const episodeImageHeight = useSelector(
		(state: RootState) => state.episodeImage.height
	);

	const handleEpisodeSelection = (episode: EpisodeData) => {
		dispatch(selectEpisode(episode));
		dispatch(loadVideo());

		if (selectedLibrary && selectedSeries && selectedSeason && episode)
			window.electronAPI.startMPV(
				selectedLibrary,
				selectedSeries,
				selectedSeason,
				episode
			);
	};

	const handleEpisodeMenu = (episode: EpisodeData, show: boolean) => {
		dispatch(selectEpisode(episode));
		dispatch(showMenu(show));
	};

	return (
		<div
			key={episode.id}
			className="episode-box"
			style={{ maxWidth: `${episodeImageWidth}px` }}
		>
			<ContextMenu
				model={[
					{
						label: t("editButton"),
						command: () => {
							dispatch(toggleEpisodeMenu());
							dispatch(toggleEpisodeWindow());
						},
					},
					{
						label: t("markWatched"),
						command: () => dispatch(toggleEpisodeMenu()),
					},
					{
						label: t("markUnwatched"),
						command: () => dispatch(toggleEpisodeMenu()),
					},
					{
						label: t("removeButton"),
						command: () => dispatch(toggleEpisodeMenu()),
					},
				]}
				ref={cm2}
				className="dropdown-menu"
			/>
			<div
				onMouseEnter={() => {
					handleEpisodeMenu(episode, true);
				}}
				onMouseLeave={() => {
					handleEpisodeMenu(episode, false);
				}}
			>
				{false ? (
					<div className="episode-slider">
						<input
							type="range"
							min="0"
							max={episode.runtimeInSeconds}
							value={episode.timeWatched}
							step="1"
							style={{
								background: `linear-gradient(to right, #8EDCE6 ${
									episode.timeWatched +
									(1550 * 100) / episode.runtimeInSeconds
								}%, #646464 0px`,
							}}
							className="slider hide-slider-thumb"
						/>
					</div>
				) : null}
				<div className="video-button-image-section">
					<div
						className="video-button-hover"
						style={{
							width: `${episodeImageWidth}px`,
							height: `${episodeImageHeight}px`,
						}}
					>
						<button
							className="play-button-episode center-align"
							onClick={() => handleEpisodeSelection(episode)}
						>
							<svg
								aria-hidden="true"
								fill="currentColor"
								height="48"
								viewBox="0 0 48 48"
								width="48"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z"
									fill="#1C1C1C"
								></path>
							</svg>
						</button>
						<button
							className="svg-button-desktop-transparent left-corner-align"
							onClick={() => dispatch(toggleEpisodeWindow())}
						>
							<svg
								aria-hidden="true"
								fill="currentColor"
								height="18"
								viewBox="0 0 48 48"
								width="18"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M8.76987 30.5984L4 43L16.4017 38.2302L8.76987 30.5984Z"
									fill="#FFFFFF"
								></path>
								<path
									d="M19.4142 35.5858L41.8787 13.1214C43.0503 11.9498 43.0503 10.0503 41.8787 8.87872L38.1213 5.12135C36.9497 3.94978 35.0503 3.94978 33.8787 5.12136L11.4142 27.5858L19.4142 35.5858Z"
									fill="#FFFFFF"
								></path>
							</svg>
						</button>
						<button
							className="svg-button-desktop-transparent right-corner-align"
							onClick={(e) => {
								dispatch(toggleEpisodeMenu());
								cm2.current?.show(e);
							}}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 560 560"
								aria-hidden="true"
								width="16"
								height="16"
							>
								<path
									d="M350 280c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70m0-210c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70m0 420c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70"
									fill="#FFFFFF"
								></path>
							</svg>
						</button>
					</div>
					<div
						className="video-button"
						style={{
							width: `${episodeImageWidth}px`,
							height: `${episodeImageHeight}px`,
						}}
					>
						<Image
							src={episode.imgSrc}
							width={episodeImageWidth}
							height={episodeImageHeight}
							alt="Video Thumbnail"
							errorSrc="./src/resources/img/Default_video_thumbnail.jpg"
							isRelative={true}
						/>
					</div>
				</div>
			</div>
			<span id="episodeName" title={episode.name}>
				{episode.name}
			</span>
			{selectedLibrary?.type === "Shows" ? (
				<span id="episodeNumber">
					{t("episode") + " " + episode.episodeNumber}
				</span>
			) : null}
		</div>
	);
}

export default React.memo(EpisodeCard);
