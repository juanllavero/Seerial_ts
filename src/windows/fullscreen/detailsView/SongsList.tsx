import { ReactUtils } from "@data/utils/ReactUtils";
import { EpisodeData } from "@interfaces/EpisodeData";
import { selectEpisode } from "@redux/slices/dataSlice";
import { RootState } from "@redux/store";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

function SongsList() {
	const dispatch = useDispatch();
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const currentEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);

	const [ sortedSongs, setSortedSongs ] = React.useState<EpisodeData[]>([]);

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

	//#region KEYBOARD DETECTION
	const handleKeyDown = (event: KeyboardEvent) => {
		if (!currentSeason || !currentSeason.episodes || currentSeason.episodes.length === 0) return;

		// If no episode is selected, select the first one
		if (!currentEpisode) {
			dispatch(selectEpisode(currentSeason.episodes[0]));
		}

		if (sortedSongs.length === 0) setSortedSongs(currentSeason.episodes);



		// Encontrar el índice global del episodio actual
		const currentIndex = sortedSongs.findIndex(
			(elem) => elem === currentEpisode
		);

		if (currentIndex === -1) return;

		// Mover al siguiente elemento
		if (event.key === "ArrowDown") {
			const nextIndex = currentIndex + 1;
			if (nextIndex < sortedSongs.length) {
				ReactUtils.handleScrollElementClick(
					nextIndex,
					listRef,
					true
				);
				dispatch(selectEpisode(sortedSongs[nextIndex]));
			}
		}

		// Mover al elemento anterior
		if (event.key === "ArrowUp") {
			const prevIndex = currentIndex - 1;
			if (prevIndex >= 0) {
				ReactUtils.handleScrollElementClick(
					prevIndex,
					listRef,
					true
				);
				dispatch(selectEpisode(sortedSongs[prevIndex]));
			}
		}
	};

	// Add and Clean Keyboard Events
	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);
	//#endregion

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
					{(() => {
						let globalIndex = 0; // Global counter
						return discs.map((disc: number) => {
							if (globalIndex > 0) {
								globalIndex += 2;
							}

							return (
								<React.Fragment key={disc}>
									<span className="disc-text-title">Disc {disc}</span>
									{currentSeason.episodes
										.filter((song) => song.seasonNumber === disc)
										.sort((a, b) => a.episodeNumber - b.episodeNumber)
										.map((song: EpisodeData) => {
											const currentIndex = globalIndex++; // Assign another one and increment
											return (
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
															currentIndex,
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
														{ReactUtils.formatTime(
															song.runtimeInSeconds
														)}
													</span>
												</div>
											);
										})}
									<div className="separator"></div>
								</React.Fragment>
							);
						});
					})()}
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
