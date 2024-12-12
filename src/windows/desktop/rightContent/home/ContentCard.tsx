import Image from "@components/image/Image";
import { EpisodeData } from "@interfaces/EpisodeData";
import { toggleEpisodeMenu } from "@redux/slices/contextMenuSlice";
import {
	markEpisodeWatched,
	selectEpisode,
	toggleEpisodeWindow,
} from "@redux/slices/dataSlice";
import { loadVideo } from "@redux/slices/videoSlice";
import { RootState } from "@redux/store";
import { t } from "i18next";
import { ContextMenu } from "primereact/contextmenu";
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "../Card.scss";
import {
	EditIcon,
	PlayIcon,
	TickIcon,
	VerticalDotsIcon,
} from "@components/utils/IconLibrary";
import { LibraryData } from "@interfaces/LibraryData";
import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";

interface ContentCardProps {
	library: LibraryData;
	show: SeriesData;
	season: SeasonData;
	episode: EpisodeData;
}

function ContentCard({ library, show, season, episode }: ContentCardProps) {
	const dispatch = useDispatch();

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

		if (library && show && season && episode)
			window.electronAPI.startMPV(library, show, season, episode);
	};

	return (
		<div className="card" style={{ maxWidth: `${episodeImageWidth}px` }}>
			<div className="top-section">
				{episode.watched && (
					<div className="watched">
						<TickIcon />
					</div>
				)}
				<div className="on-hover">
					<div className="play-btn-container">
						<button
							className="play-btn-episode"
							onClick={() => handleEpisodeSelection(episode)}
						>
							<PlayIcon />
						</button>
					</div>
					<button
						className="svg-button-desktop-transparent"
						onClick={() => {
							dispatch(selectEpisode(episode));
							dispatch(toggleEpisodeWindow());
						}}
					>
						<EditIcon />
					</button>
					<button
						className="svg-button-desktop-transparent"
						onClick={(e) => {
							dispatch(selectEpisode(episode));
							dispatch(toggleEpisodeMenu());
							cm2.current?.show(e);
						}}
					>
						<VerticalDotsIcon />
					</button>
				</div>
				{false ? (
					<div className="card-slider">
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
				<div className="image-section">
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

			<div className="info-section">
				<span className="a_text" id="title" title={episode.name}>
					{episode.name}
				</span>
				{library.type === "Shows" ? (
					<span id="subtitle">
						{t("episode") + " " + episode.episodeNumber}
					</span>
				) : null}
			</div>
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
						command: () => {
							if (!library || !show || !season)
								return;

							dispatch(
								markEpisodeWatched({
									libraryId: library.id,
									seriesId: show.id,
									seasonId: season.id,
									episodeId: episode.id,
									watched: true,
								})
							);
							dispatch(toggleEpisodeMenu());
						},
					},
					{
						label: t("markUnwatched"),
						command: () => {
							if (!library || !show || !season)
								return;

							dispatch(
								markEpisodeWatched({
									libraryId: library.id,
									seriesId: show.id,
									seasonId: season.id,
									episodeId: episode.id,
									watched: false,
								})
							);
							dispatch(toggleEpisodeMenu());
						},
					},
					{
						label: t("removeButton"),
						command: () => {
							// Do something
							dispatch(toggleEpisodeMenu());
						},
					},
				]}
				ref={cm2}
				className="dropdown-menu"
			/>
		</div>
	);
}

export default React.memo(ContentCard);
