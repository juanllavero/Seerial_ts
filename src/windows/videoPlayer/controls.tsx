import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	togglePause,
	setCurrentTime,
	setDuration,
	toggleControls,
	toggleInSettings,
	toggleInChapters,
	changeVolume,
} from "redux/slices/videoSlice";
import { RootState } from "redux/store";
import "../../Controls.scss";
import { toggleMaximize } from "redux/slices/windowStateSlice";
import { LibraryData } from "@interfaces/LibraryData";
import { SeriesData } from "@interfaces/SeriesData";
import { SeasonData } from "@interfaces/SeasonData";
import { EpisodeData } from "@interfaces/EpisodeData";
import { AudioTrackData } from "@interfaces/AudioTrackData";
import {
	closeAllMenus,
	toggleAudioMenu,
	toggleSubsMenu,
	toggleSubsSizeMenu,
	toggleVideoMenu,
} from "redux/slices/contextMenuSlice";
import { SubtitleTrackData } from "@interfaces/SubtitleTrackData";
import { VideoTrackData } from "@interfaces/VideoTrackData";
import { ChapterData } from "@interfaces/ChapterData";
import { ChaptersIcon, LeftArrowIcon, NextTrackIcon, PauseIcon, PlayIcon, PrevTrackIcon, RightArrowIcon, SettingsIcon, VideoFullscreenInIcon, VideoFullscreenOutIcon, VolumeHighIcon, VolumeLowIcon, VolumeMuteIcon, VolumeNormalIcon, WindowCloseIcon } from "@components/utils/IconLibrary";

function Controls() {
	const dispatch = useDispatch();
	const paused = useSelector((state: RootState) => state.video.paused);
	const currentTime = useSelector(
		(state: RootState) => state.video.currentTime
	);
	const [time, setTime] = useState(0);
	const duration = useSelector((state: RootState) => state.video.duration);
	const volume = useSelector((state: RootState) => state.video.volume);

	let prevVolume: number = 100;

	const [selectedLibrary, setSelectedLibrary] =
		React.useState<LibraryData | null>(null);
	const [selectedSeries, setSelectedSeries] =
		React.useState<SeriesData | null>(null);
	const [currentSeason, setCurrentSeason] = React.useState<SeasonData | null>(
		null
	);
	const [episode, setEpisode] = React.useState<EpisodeData | null>(null);

	const isFullscreen = useSelector(
		(state: RootState) => state.windowState.isMaximized
	);

	const [seasonLetter, setSeasonLetter] = useState<String>("");
	const [episodeLetter, setEpisodeLetter] = useState<String>("");
	const [settingsText, setSettingsText] = useState<String>("");

	//#region TRACKS
	const [selectedVideoTrack, setSelectedVideoTrack] = useState<
		VideoTrackData | undefined
	>(undefined);
	const [selectedAudioTrack, setSelectedAudioTrack] = useState<
		AudioTrackData | undefined
	>(undefined);
	const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState<
		SubtitleTrackData | undefined
	>(undefined);
	const [selectedSubsSize, setSelectedSubsSize] = useState<string | undefined>(
		undefined
	);

	const videoMenuOpen = useSelector(
		(state: RootState) => state.contextMenu.videoMenuOpen
	);
	const audioMenuOpen = useSelector(
		(state: RootState) => state.contextMenu.audioMenuOpen
	);
	const subsMenuOpen = useSelector(
		(state: RootState) => state.contextMenu.subtitleMenuOpen
	);
	const subsSizeMenuOpen = useSelector(
		(state: RootState) => state.contextMenu.subtitleSizeMenu
	);
	//#endregion

	useEffect(() => {
		const fetchTranslations = async () => {
			try {
				const seasonLetter = await window.electronAPI.translate(
					"seasonLetter"
				);
				const episodeLetter = await window.electronAPI.translate(
					"episodeLetter"
				);
				setSeasonLetter(seasonLetter);
				setEpisodeLetter(episodeLetter);

				const settingsText = await window.electronAPI.translate("settings");
				setSettingsText(settingsText);
			} catch (error) {
				console.error("Error fetching translations:", error);
			}
		};

		fetchTranslations();
	}, []);

	useEffect(() => {
		const interval = setInterval(() => {
			if (!paused) setTime((prevValue) => prevValue + 1); // Update slider every second
		}, 1000);

		// Clean interval on unmount
		return () => clearInterval(interval);
	}, [paused]);

	//#region SHOW/HIDE CONTROLS
	const visible = useSelector((state: RootState) => state.video.controlsSown);
	const inSettings = useSelector((state: RootState) => state.video.inSettings);
	const inChapters = useSelector((state: RootState) => state.video.inChapters);
	const [mouseOnUI, setMouseOnUI] = useState(false);
	const hideControlsRef = useRef<() => void>(() => {});
	let timeout: NodeJS.Timeout;

	useEffect(() => {
		hideControlsRef.current = () => {
			if (!inSettings && !mouseOnUI && !paused) {
				dispatch(toggleControls(false));
			}
		};
	}, [inSettings, mouseOnUI, paused]);

	const showControls = () => {
		if (!visible) {
			dispatch(toggleControls(true));
		}

		if (timeout) {
			clearTimeout(timeout);
		}
		// Set a timeout to hide controls after a period of inactivity
		timeout = setTimeout(() => {
			hideControlsRef.current();
		}, 3000); // 3 seconds of inactivity
	};
	//#endregion

	//#region CHAPTER SCROLL
	const handleScroll = (direction: "left" | "right") => {
		const scrollContainer = document.getElementById("chapterScroll");

		if (scrollContainer) {
			const chapterWidth =
				scrollContainer.firstElementChild?.clientWidth || 0;
			const containerWidth = scrollContainer.clientWidth;
			const chaptersVisible = Math.floor(containerWidth / chapterWidth);

			const scrollAmount = chaptersVisible * chapterWidth;

			console.log(scrollContainer);

			if (direction === "left") {
				scrollContainer.scrollLeft -= scrollAmount;
			} else if (direction === "right") {
				scrollContainer.scrollLeft += scrollAmount;
			}
		}
	};
	//#endregion

	useEffect(() => {
		window.ipcRenderer.on(
			"data-to-controls",
			(_event, library, series, season, e) => {
				setSelectedLibrary(library);
				setSelectedSeries(series);
				setCurrentSeason(season);
				setEpisode(e);

				if (e.currentTime) dispatch(setCurrentTime(e.currentTime));
				else dispatch(setCurrentTime(0));

				dispatch(setDuration(e.runtimeInSeconds));

				if (e.videoTracks.length > 0)
					setSelectedVideoTrack(e.videoTracks[0]);

				loadTracks();
			}
		);

		window.electronAPI.onWindowStateChange((state: string) => {
			dispatch(toggleMaximize(state === "fullscreen"));
		});

		// Añadir el listener de eventos cuando el componente se monta
		window.addEventListener("keydown", handleKeyDown);

		// Limpiar el listener cuando el componente se desmonta
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	useEffect(() => {
		window.ipcRenderer.on("show-controls", (_event) => {
			showControls();
		});

		window.ipcRenderer.on("hide-controls", (_event) => {
			hideControlsRef.current();
		});
	}, [paused, mouseOnUI, inSettings]);

	const loadTracks = () => {
		//let audioTrackLanguage = currentSeason?.audioTrackLanguage || new Intl.Locale(await Configuration.loadConfig("preferAudioLan", "es-ES")).language;
		//let selectedAudioTrack = currentSeason?.selectedAudioTrack;

		setSelectedAudioTrack(episode?.audioTracks[0]);
		setSelectedSubtitleTrack(episode?.subtitleTracks[0]);

		/*episode?.audioTracks.forEach(track => track.selected = false); // Desmarcar todas las pistas

        if (selectedAudioTrack >= 0 && selectedAudioTrack? < audioTracks.length) {
            // Seleccionar la pista de audio por índice si es válida
            audioTracks[selectedAudioTrack].setSelected(true);
        } else {
            // Intentar seleccionar por idioma o la primera pista si no hay coincidencia
            const trackByLanguage = audioTracks.find(track => track.getLanguageTag() === audioTrackLanguage);
            if (trackByLanguage) {
                trackByLanguage.setSelected(true);
                selectedAudioTrack = audioTracks.indexOf(trackByLanguage);
            } else if (audioTracks.length > 0) {
                audioTracks[0].setSelected(true);
                selectedAudioTrack = 0;
            }
        }

        // Actualizar la configuración del reproductor y la temporada
        videoPlayer.setAudioTrack(selectedAudioTrack + 1);
        currentSeason.setAudioTrackLanguage(audioTracks[selectedAudioTrack]?.getLanguageTag() || '');
        currentSeason.setSelectedAudioTrack(selectedAudioTrack);

        const defaultAudioTrackLanguage = new Intl.Locale(Configuration.loadConfig("preferAudioLan", "es-ES")).language;
        const currentAudioTrackLanguage = season.getAudioTrackLanguage() || defaultAudioTrackLanguage;
        let subtitleTrackLanguage = currentSeason.getSubtitleTrackLanguage() || new Intl.Locale(Configuration.loadConfig("preferSubsLan", "es-ES")).language;
        const subsMode = parseInt(Configuration.loadConfig("subsMode", "2"), 10);
        let selectedSubtitleTrack = -1;
        let foreignAudio = defaultAudioTrackLanguage !== currentAudioTrackLanguage;

        subtitleTracks.forEach(track => track.setSelected(false)); // Desmarcar todas las pistas

        if (currentSeason.getSelectedSubtitleTrack() >= 0 && currentSeason.getSelectedSubtitleTrack() < subtitleTracks.length) {
            // Seleccionar la pista de subtítulos por índice si es válida
            selectedSubtitleTrack = currentSeason.getSelectedSubtitleTrack();
            subtitleTracks[selectedSubtitleTrack].setSelected(true);
        } else if (((subsMode === 2 && foreignAudio) || subsMode === 3) && subtitleTracks.length > 0) {
            // Seleccionar subtítulos basados en idioma y modo
            const trackByLanguage = subtitleTracks.find(track => track.getLanguageTag() === subtitleTrackLanguage);
            if (trackByLanguage) {
                trackByLanguage.setSelected(true);
                selectedSubtitleTrack = subtitleTracks.indexOf(trackByLanguage);
            } else if (subtitleTracks.length > 0) {
                subtitleTracks[0].setSelected(true);
                selectedSubtitleTrack = 0;
            }
        } else {
            videoPlayer.disableSubtitles();
        }

        // Actualizar la configuración del reproductor y la temporada
        if (selectedSubtitleTrack >= 0) {
            setSubtitleTrack(selectedSubtitleTrack + 1);
            currentSeason.setSubtitleTrackLanguage(subtitleTracks[selectedSubtitleTrack].getLanguageTag() || '');
            currentSeason.setSelectedSubtitleTrack(selectedSubtitleTrack);
        }*/
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		switch (event.key) {
			case "ArrowLeft":
				seekToTime(currentTime);
				break;
			case "ArrowRight":
				seekToTime(currentTime);
				break;
			case " ":
				handlePlayPause();
				break;
		}
	};

	// Handle play/pause button click
	const handlePlayPause = () => {
		dispatch(togglePause());

		if (!paused) {
			window.electronAPI.sendCommand(["set", "pause", "yes"]);
		} else {
			window.electronAPI.sendCommand(["set", "pause", "no"]);
		}
	};

	// Handle seek slider change
	const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newTime = parseFloat(event.target.value);
		seekToTime(newTime);
	};

	const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newVolume = parseFloat(event.target.value);
		setVolume(newVolume);
	};

	const handleClose = () => {
		window.electronAPI.stopMPV();
	};

	const seekToTime = (time: number) => {
		dispatch(setCurrentTime(time));
		window.electronAPI.sendCommand(["seek", time.toString(), "absolute"]);
	};

	const setVolume = (newVolume: number) => {
		prevVolume = newVolume;
		dispatch(changeVolume(newVolume));
		window.electronAPI.sendCommand(["set", "volume", newVolume.toString()]);
	};

	const toggleMute = (mute: boolean) => {
		let newVolume = prevVolume;
		if (mute) newVolume = 0;

		dispatch(changeVolume(newVolume));
		window.electronAPI.sendCommand(["set", "volume", newVolume.toString()]);
	};

	const setVideoTrack = (index: number, track: VideoTrackData) => {
		if (selectedVideoTrack) selectedVideoTrack.selected = false;

		track.selected = true;
		setSelectedVideoTrack(track);
		window.electronAPI.sendCommand(["set", "vid", `${index}`]);
	};

	const setAudioTrack = (index: number, track: AudioTrackData) => {
		if (selectedAudioTrack) selectedAudioTrack.selected = false;

		track.selected = true;
		setSelectedAudioTrack(track);
		window.electronAPI.sendCommand(["set", "aid", `${index}`]);
	};

	const setSubtitleTrack = (
		index: number,
		track: SubtitleTrackData | undefined
	) => {
		if (selectedSubtitleTrack) selectedSubtitleTrack.selected = false;

		if (track) track.selected = true;

		setSelectedSubtitleTrack(track);
		window.electronAPI.sendCommand(["set", "sid", `${index}`]);
	};

	const setSubtitleSize = (size: string) => {
		window.electronAPI.sendCommand(["set", "sub-scale", `${size}`]);
	};

	function formatTime(seconds: number): string {
		const totalSeconds = Math.floor(seconds);

		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const secs = totalSeconds % 60;

		const formattedMinutes = minutes.toString().padStart(2, "0");
		const formattedSeconds = secs.toString().padStart(2, "0");

		if (hours > 0) {
			return `${hours}:${formattedMinutes}:${formattedSeconds}`;
		} else {
			return `${formattedMinutes}:${formattedSeconds}`;
		}
	}

	const isCurrentChapter = (chapter: ChapterData) => {
		if (!episode || !episode.chapters) return false;

		let isCurrent = false;
		episode.chapters.forEach((c, index) => {
			const currentChapterStartTime = c.time / 1000;
			const nextChapterStartTime = episode.chapters[index + 1]?.time / 1000;

			if (
				currentTime >= currentChapterStartTime &&
				(nextChapterStartTime === undefined ||
					currentTime < nextChapterStartTime)
			) {
				isCurrent = c === chapter;
			}
		});

		return isCurrent;
	};

	return (
		<div
			className="controls-container"
			onMouseMove={showControls}
			onClick={(event) => {
				const target = event.target as Element;

				// Check if the click has been done in a "select" element
				if (!target.closest(".select")) {
					dispatch(closeAllMenus());
				}
			}}
		>
			<section
				className={`controls-bar controls-top-bar ${
					visible ? "visible" : "hidden-top"
				}`}
			>
				<button className="controls-svg-button" onClick={handleClose}>
					<WindowCloseIcon />
				</button>
				<button
					className="controls-svg-button"
					onClick={() => window.electronAPI.setFullscreenControls()}
				>
					{isFullscreen ? (
						<VideoFullscreenOutIcon />
					) : (
						<VideoFullscreenInIcon />
					)}
				</button>
			</section>
			<section
				className={`controls-bar controls-bottom-bar ${
					visible ? "visible" : "hidden-bottom"
				}`}
				onMouseEnter={() => setMouseOnUI(true)}
				onMouseLeave={() => setMouseOnUI(false)}
			>
				{inSettings ? (
					<section className="settings-box">
						<h1>{settingsText}</h1>
						<section className="settings-columns">
							<div className="settings-text-box">
								<span>Vídeo</span>
								<span>Audio</span>
								<span>Subtítulos</span>
								<span>Tamaño de los subtítulos</span>
							</div>
							<div className="settings-options-box">
								<div className="dropdown">
									<div
										className={
											episode?.videoTracks &&
											episode?.videoTracks.length > 1
												? "select"
												: "select-plain"
										}
										onClick={() => {
											if (
												episode?.videoTracks &&
												episode?.videoTracks.length > 1
											) {
												if (!videoMenuOpen)
													dispatch(closeAllMenus());
												dispatch(toggleVideoMenu());
											}
										}}
										onAuxClick={() => {
											dispatch(closeAllMenus());
										}}
									>
										<span className="selected">
											{selectedVideoTrack?.displayTitle}
										</span>
										{episode?.videoTracks &&
										episode?.videoTracks.length > 1 ? (
											<div
												className={`arrow ${
													videoMenuOpen ? " arrow-rotate" : ""
												}`}
											></div>
										) : (
											<></>
										)}
									</div>
									<ul
										className={`menu ${
											videoMenuOpen ? " menu-open" : ""
										}`}
									>
										{episode?.videoTracks.map(
											(track: any, index: number) => (
												<li
													key={track.title}
													className={
														track == selectedVideoTrack
															? "active"
															: ""
													}
													onClick={() => {
														setVideoTrack(index + 1, track);
														dispatch(toggleVideoMenu());
													}}
												>
													{track.displayTitle}
												</li>
											)
										)}
									</ul>
								</div>

								<div className="dropdown">
									<div
										className="select"
										onClick={() => {
											if (!audioMenuOpen) dispatch(closeAllMenus());
											dispatch(toggleAudioMenu());
										}}
										onAuxClick={() => {
											dispatch(closeAllMenus());
										}}
									>
										<span className="selected">
											{selectedAudioTrack?.displayTitle}
										</span>
										<div
											className={`arrow ${
												audioMenuOpen ? " arrow-rotate" : ""
											}`}
										></div>
									</div>
									<ul
										className={`menu ${
											audioMenuOpen ? " menu-open" : ""
										}`}
									>
										{episode?.audioTracks.map(
											(track: any, index: number) => (
												<li
													key={track.title}
													className={
														track == selectedAudioTrack
															? "active"
															: ""
													}
													onClick={() => {
														setAudioTrack(index + 1, track);
														dispatch(toggleAudioMenu());
													}}
												>
													{track.displayTitle}
												</li>
											)
										)}
									</ul>
								</div>

								<div className="dropdown">
									<div
										className="select"
										onClick={() => {
											if (!subsMenuOpen) dispatch(closeAllMenus());
											dispatch(toggleSubsMenu());
										}}
										onAuxClick={() => {
											dispatch(closeAllMenus());
										}}
									>
										<span className="selected">
											{selectedSubtitleTrack
												? selectedSubtitleTrack.displayTitle
												: "Ninguno"}
										</span>
										<div
											className={`arrow ${
												subsMenuOpen ? " arrow-rotate" : ""
											}`}
										></div>
									</div>
									<ul
										className={`menu ${
											subsMenuOpen ? " menu-open" : ""
										}`}
									>
										<li
											key="0"
											className={
												!selectedSubtitleTrack ? "active" : ""
											}
											onClick={() => {
												setSubtitleTrack(0, undefined);
												dispatch(toggleSubsMenu());
											}}
										>
											Ninguno
										</li>
										{episode?.subtitleTracks.map(
											(track: any, index: number) => (
												<li
													key={track.title}
													className={
														track == selectedSubtitleTrack
															? "active"
															: ""
													}
													onClick={() => {
														setSubtitleTrack(index + 1, track);
														dispatch(toggleSubsMenu());
													}}
												>
													{track.displayTitle}
												</li>
											)
										)}
									</ul>
								</div>

								<div className="dropdown">
									<div
										className="select"
										onClick={() => {
											if (!subsSizeMenuOpen)
												dispatch(closeAllMenus());
											dispatch(toggleSubsSizeMenu());
										}}
										onAuxClick={() => {
											dispatch(closeAllMenus());
										}}
									>
										<span className="selected">
											{selectedSubsSize}
										</span>
										<div
											className={`arrow ${
												subsSizeMenuOpen ? " arrow-rotate" : ""
											}`}
										></div>
									</div>
									<ul
										className={`menu ${
											subsSizeMenuOpen ? " menu-open" : ""
										}`}
									>
										<li
											key="0.3"
											className={
												"Tiny" == selectedSubsSize ? "active" : ""
											}
											onClick={() => {
												setSelectedSubsSize("Tiny");
												setSubtitleSize("0.3");
												dispatch(toggleSubsSizeMenu());
											}}
										>
											Tiny
										</li>
										<li
											key="0.5"
											className={
												"Small" == selectedSubsSize ? "active" : ""
											}
											onClick={() => {
												setSelectedSubsSize("Small");
												setSubtitleSize("0.5");
												dispatch(toggleSubsSizeMenu());
											}}
										>
											Small
										</li>
										<li
											key="0.75"
											className={
												"Normal" == selectedSubsSize ? "active" : ""
											}
											onClick={() => {
												setSelectedSubsSize("Normal");
												setSubtitleSize("0.75");
												dispatch(toggleSubsSizeMenu());
											}}
										>
											Normal
										</li>
										<li
											key="1.0"
											className={
												"Large" == selectedSubsSize ? "active" : ""
											}
											onClick={() => {
												setSelectedSubsSize("Large");
												setSubtitleSize("1.0");
												dispatch(toggleSubsSizeMenu());
											}}
										>
											Large
										</li>
										<li
											key="1.3"
											className={
												"Huge" == selectedSubsSize ? "active" : ""
											}
											onClick={() => {
												setSelectedSubsSize("Huge");
												setSubtitleSize("1.3");
												dispatch(toggleSubsSizeMenu());
											}}
										>
											Huge
										</li>
									</ul>
								</div>
							</div>
						</section>
					</section>
				) : (
					<></>
				)}
				{inChapters ? (
					<section className="chapters-container">
						<section className="chapters-top">
							<span>Selección de capítulos</span>
							<div>
								<button
									className="controls-svg-button"
									onClick={() => {
										handleScroll("left");
									}}
								>
									<LeftArrowIcon />
								</button>
								<button
									className="controls-svg-button"
									onClick={() => {
										handleScroll("right");
									}}
								>
									<RightArrowIcon />
								</button>
							</div>
						</section>
						<section className="chapters-box" id="chapterScroll">
							{episode?.chapters.map(
								(chapter: ChapterData, index: number) => (
									<div key={chapter.title}>
										<img
											src="./src/resources/img/black.png"
											alt="Chapter thumbnail"
											className={
												isCurrentChapter(chapter)
													? "chapter-selected"
													: ""
											}
											onClick={() => {
												seekToTime(chapter.time / 1000);
											}}
										/>
										<span>
											{index + 1}. {chapter.title}
										</span>
										<span>{chapter.displayTime}</span>
									</div>
								)
							)}
						</section>
					</section>
				) : (
					<></>
				)}
				<div className="controls-slider-div">
					<input
						type="range"
						min="0"
						max={duration}
						value={time}
						step="1"
						style={{
							background: `linear-gradient(to right, #8EDCE6 ${
								(time * 100) / duration
							}%, #646464 0px`,
						}}
						onChange={(e) => {
							handleSeek(e);
							setTime(Number(e.target.value));
						}}
						className="slider"
					/>
				</div>
				<section className="controls">
					<section className="left-controls-section">
						<div className="left-controls">
							<span id="title">
								{selectedLibrary?.type != "Shows"
									? episode?.name
									: selectedSeries?.name}
							</span>
							<span id="subtitle">
								{selectedLibrary?.type != "Shows"
									? episode?.year
									: `${seasonLetter}${
											episode?.seasonNumber?.toString() ?? ""
									  } · ${episodeLetter}${
											episode?.episodeNumber ?? ""
									  } — ${episode?.name ?? ""}`}
							</span>
							<span id="time">
								{formatTime(time)} / {formatTime(duration - time)}
							</span>
						</div>
						<div className="center-controls">
							<button
								className="controls-svg-button"
								onClick={handlePlayPause}
								disabled={
									episode &&
									currentSeason &&
									currentSeason.episodes.indexOf(episode) > 0
										? false
										: true
								}
							>
								<PrevTrackIcon />
							</button>
							<button
								className="controls-svg-button"
								onClick={handlePlayPause}
							>
								{paused ? (
									<PlayIcon />
								) : (
									<PauseIcon />
								)}
							</button>
							<button
								className="controls-svg-button"
								onClick={handlePlayPause}
								disabled={
									episode &&
									currentSeason &&
									currentSeason.episodes.indexOf(episode) <
										currentSeason.episodes.length - 1
										? false
										: true
								}
							>
								<NextTrackIcon />
							</button>
						</div>
					</section>
					<div className="right-controls">
						<button
							className={`controls-svg-button ${
								inSettings ? " button-active" : ""
							}`}
							onClick={() => {
								dispatch(toggleInChapters(false));
								dispatch(toggleInSettings(!inSettings));
							}}
						>
							<SettingsIcon />
						</button>
						{!episode?.chapters || episode?.chapters.length > 0 ? (
							<button
								className={`controls-svg-button ${
									inChapters ? " button-active" : ""
								}`}
								onClick={() => {
									dispatch(toggleInSettings(false));
									dispatch(toggleInChapters(!inChapters));
								}}
							>
								<ChaptersIcon />
							</button>
						) : (
							<></>
						)}
						<button
							className="controls-svg-button"
							onClick={() => {
								toggleMute(volume != 0);
							}}
						>
							{volume == 0 ? (
								<VolumeMuteIcon />
							) : volume > 0 && volume < 40 ? (
								<VolumeLowIcon />
							) : volume >= 40 && volume < 80 ? (
								<VolumeNormalIcon />
							) : (
								<VolumeHighIcon />
							)}
						</button>
						<input
							type="range"
							min="0"
							max={100}
							value={volume}
							onChange={handleVolumeChange}
							style={{
								background: `linear-gradient(to top, #8EDCE6 ${volume}%, #646464 0px`,
							}}
							className="slider vertical-slider"
						/>
					</div>
				</section>
			</section>
		</div>
	);
}

export default Controls;
