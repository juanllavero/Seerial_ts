import { ReactUtils } from "@data/utils/ReactUtils";
import { EpisodeData } from "@interfaces/EpisodeData";
import { selectEpisode } from "@redux/slices/dataSlice";
import { RootState } from "@redux/store";
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

function SongsList() {
	const dispatch = useDispatch();
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const currentEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);

	const listRef = useRef<HTMLDivElement>(null);

	const getDiscs = () => {
		let foundDiscs: number[] = [];

		if (currentSeason) {
			for (const song of currentSeason.episodes) {
				if (
					song.seasonNumber !== 0 &&
					!foundDiscs.includes(song.seasonNumber)
				) {
					foundDiscs.push(song.seasonNumber);
				}
			}
		}

		return foundDiscs;
	};

	if (
		currentSeason &&
		currentSeason.episodes &&
		currentSeason.episodes.length > 1
	) {
		const discs = getDiscs();

		if (!currentSeason) return;

		if (discs.length === 0) {
			return (
				<div className="music-list" ref={listRef}>
					{currentSeason.episodes.map(
						(song: EpisodeData, index: number) => (
							<div
								className={`element ${
									song === currentEpisode ? "element-selected" : null
								}`}
								key={song.id}
								onClick={() => {
									dispatch(selectEpisode(song));
									ReactUtils.handleScrollElementClick(
										index,
										listRef,
										true
									);
								}}
							>
								<span>{song.episodeNumber}</span>
								<span
									style={{
										width: "100%",
										marginLeft: "2em",
										marginRight: "2em",
									}}
								>
									{song.name}
								</span>
								<span>
									{ReactUtils.formatTime(song.runtimeInSeconds)}
								</span>
							</div>
						)
					)}
				</div>
			);
		} else {
			return (
				<div className="music-list" ref={listRef}>
					{discs.map((disc: number) => (
						<>
							<span className="disc-text-title">Disc {disc}</span>
							{currentSeason.episodes
								.filter((song) => song.seasonNumber === disc)
								.sort((a, b) => a.episodeNumber - b.episodeNumber)
								.map((song: EpisodeData, index: number) => (
									<div
										className={`element ${
											song === currentEpisode
												? "element-selected"
												: null
										}`}
										key={song.id}
										onClick={() => {
											dispatch(selectEpisode(song));
											ReactUtils.handleScrollElementClick(
												index,
												listRef,
												true
											);
										}}
									>
										<span>{song.episodeNumber}</span>
										<span
											style={{
												width: "100%",
												marginLeft: "2em",
												marginRight: "2em",
											}}
										>
											{song.name}
										</span>
										<span>
											{ReactUtils.formatTime(song.runtimeInSeconds)}
										</span>
									</div>
								))}
							<div className="separator"></div>
						</>
					))}
				</div>
			);
		}
	} else {
		return (
			<>
				<div>
					<span>NO DISC FOUND</span>
				</div>
			</>
		);
	}
}

export default React.memo(SongsList);
