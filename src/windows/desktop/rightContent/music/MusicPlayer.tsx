import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import { Slider } from "primereact/slider";
import ReactHowler from "react-howler";
import { useEffect, useRef, useState } from "react";
import {
	setCurrentSong,
	setSongs,
	toggleMusicPause,
} from "redux/slices/musicPlayerSlice";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { WindowSections } from "@data/enums/Sections";
import { EpisodeData } from "@interfaces/EpisodeData";
import { ReactUtils } from "data/utils/ReactUtils";
import { setGradientLoaded } from "redux/slices/imageLoadedSlice";
import {
	MusicOptionsIcon,
	NextTrackIcon,
	PauseIcon,
	PlayIcon,
	PrevTrackIcon,
	StopIcon,
} from "@components/utils/IconLibrary";
import "./MusicPlayer.scss";

function MusicPlayer() {
	const dispatch = useDispatch();
	const songsList = useSelector(
		(state: RootState) => state.musicPlayer.songsList
	);
	const currentSong = useSelector(
		(state: RootState) => state.musicPlayer.currentSong
	);
	const paused = useSelector((state: RootState) => state.musicPlayer.paused);
	const [sliderValue, setSliderValue] = useState<number>(0);
	const [hidePlayer, setHidePlayer] = useState<boolean>(false);
	const [currentTime, setCurrentTime] = useState<number>(0); // Para controlar el tiempo actual
	const [duration, setDuration] = useState<number>(0); // Para almacenar la duración total
	const [volume, setVolume] = useState<number>(1); // Valor por defecto: 1 (100%)
	const howlerRef = useRef<ReactHowler>(null);
	const menuSection = useSelector(
		(state: RootState) => state.sectionState.menuSection
	);
	const [showMore, setShowMore] = useState<boolean>(false);

	const musicPaused = useSelector(
		(state: RootState) => state.musicPlayer.paused
	);

	const gradientLoaded = useSelector(
		(state: RootState) => state.imageLoaded.gradientLoaded
	);
	const [gradientBackground, setGradientBackground] = useState<string>("");

	// Función para actualizar el tiempo de reproducción
	const updateTime = () => {
		if (howlerRef.current) {
			const time = howlerRef.current.seek(); // Obtiene el tiempo actual de reproducción
			setCurrentTime(time);
			setSliderValue((time / duration) * 100); // Actualiza el slider proporcionalmente
		}
	};

	useEffect(() => {
		if (songsList && currentSong !== -1) {
			const imgSrc = songsList[currentSong].imgSrc;

			if (imgSrc !== "") {
				ReactUtils.getDominantColors(imgSrc);
			} else {
				ReactUtils.getDominantColors("./src/resources/img/songDefault.png");
			}

			setTimeout(() => {
				const newGradient = ReactUtils.getGradientBackground();

				if (gradientBackground !== newGradient) {
					dispatch(setGradientLoaded(false));
				}

				setTimeout(() => {
					setGradientBackground(newGradient);

					if (gradientBackground !== newGradient) {
						dispatch(setGradientLoaded(true));
					}
				}, 200);
			}, 300);
		}
	}, [currentSong, songsList]);

	// Capturar la tecla "Espacio" y despachar la acción de pausar o reanudar la música
	useEffect(() => {
		const handleKeyPress = (event: KeyboardEvent) => {
			if (event.code === "Space") {
				event.preventDefault(); // Prevenir el scroll por defecto al presionar espacio
				dispatch(toggleMusicPause());
			}
		};

		window.addEventListener("keydown", handleKeyPress);

		// Limpieza del evento al desmontar el componente
		return () => {
			window.removeEventListener("keydown", handleKeyPress);
		};
	}, [dispatch]);

	// Recuperar el volumen de localStorage cuando la app se carga
	useEffect(() => {
		const savedVolume = localStorage.getItem("volume");
		if (savedVolume) {
			setVolume(parseFloat(savedVolume));
		}
	}, []);

	// Hook para manejar actualizaciones periódicas del tiempo de reproducción
	useEffect(() => {
		if (!paused) {
			const interval = setInterval(() => {
				updateTime();
			}, 1000); // Actualiza cada segundo
			return () => clearInterval(interval);
		}
	}, [paused, duration]);

	useEffect(() => {
		// Comprobar si hay letas
		dispatch(changeMenuSection(WindowSections.Details));
	}, [hidePlayer]);

	// Manejar la carga del archivo y establecer la duración
	const handleLoad = () => {
		if (howlerRef.current) {
			setDuration(howlerRef.current.duration()); // Establece la duración de la canción
		}
	};

	// Manejar cambios en el slider
	const handleSliderChange = (value: number) => {
		setSliderValue(value);
		if (howlerRef.current) {
			const seekTime = (value / 100) * duration; // Calcula el nuevo tiempo de reproducción
			howlerRef.current.seek(seekTime); // Ajusta la reproducción
			setCurrentTime(seekTime); // Actualiza el estado del tiempo actual
		}
	};

	// Función para manejar el cambio de volumen
	const handleVolumeChange = (value: number) => {
		setVolume(value);
		localStorage.setItem("volume", value.toString()); // Guardar el volumen en localStorage
	};

	return (
		<>
			{songsList !== null && currentSong && currentSong !== -1 ? (
				<ReactHowler
					ref={howlerRef}
					src={songsList[currentSong].videoSrc}
					playing={!paused}
					onLoad={handleLoad}
					volume={volume}
				/>
			) : null}
			<section
				className={`music-player-container ${
					songsList && currentSong !== -1 ? "show-music-player" : ""
				}`}
			>
				<div
					className={`music-main ${hidePlayer ? "music-main-hidden" : ""}`}
				>
					<div
						className={`gradient-background ${
							gradientLoaded ? "fade-in" : ""
						}`}
						style={{
							background: `${gradientBackground}`,
						}}
					/>
					<div
						className={`left-panel ${
							showMore ? "" : "expand-left-panel"
						}`}
					>
						<img
							src={
								songsList && currentSong !== -1
									? songsList[currentSong].imgSrc
									: "./src/resources/img/songDefault.png"
							}
							alt="Song Cover"
							onError={(e: any) => {
								e.target.onerror = null;
								e.target.src = "./src/resources/img/songDefault.png";
							}}
						/>
						<div className="left-panel-info">
							{songsList && currentSong !== -1 ? (
								<>
									<span id="left-panel-info-title">
										{songsList[currentSong].name}
									</span>
									<span id="left-panel-info-subtitle">
										{songsList[currentSong].album &&
										songsList[currentSong].albumArtist
											? `${songsList[currentSong].album} — ${songsList[currentSong].albumArtist}`
											: songsList[currentSong].album
											? songsList[currentSong].album
											: songsList[currentSong].albumArtist}
									</span>
								</>
							) : null}
						</div>
					</div>
					<div
						className={`right-panel ${
							showMore ? "" : "hide-right-panel"
						}`}
					>
						<div className="music-player-upper-btns">
							<button
								className={
									menuSection === WindowSections.Advanced
										? "button-selected"
										: ""
								}
								onClick={() =>
									dispatch(changeMenuSection(WindowSections.Advanced))
								}
							>
								<span>SIGUIENTE</span>
							</button>
							<button
								className={
									menuSection === WindowSections.Details
										? "button-selected"
										: ""
								}
								onClick={() =>
									dispatch(changeMenuSection(WindowSections.Details))
								}
							>
								<span>LETRAS</span>
							</button>
						</div>
						{menuSection === WindowSections.Advanced ? (
							<div className="music-player-scroll scroll" id="scroll">
								{songsList
									.slice(0, 150)
									.map((song: EpisodeData, index: number) => (
										<div className="music-player-item">
											<div className="music-player-item-left song-row">
												<div className="song-image-container">
													<img
														loading="lazy"
														src={song.imgSrc}
														alt="Song Image"
														style={{
															width: `50px`,
															height: `50px`,
														}}
														onError={(e: any) => {
															e.target.onerror = null;
															e.target.src =
																"./src/resources/img/songDefault.png";
														}}
													/>
													<div className="song-btn-overlay">
														<button
															onClick={() => {
																dispatch(setSongs(songsList));
																dispatch(setCurrentSong(index));

																if (musicPaused)
																	dispatch(toggleMusicPause());
															}}
														>
															<PlayIcon />
														</button>
													</div>
												</div>
												<div className="music-player-item-text">
													<span id="music-player-item-title">
														{song.name}
													</span>
													<span>{song.album}</span>
												</div>
											</div>
											<div className="music-player-item-left">
												<span>
													{ReactUtils.formatTime(
														song.runtimeInSeconds
													)}
												</span>
											</div>
										</div>
									))}
							</div>
						) : (
							<>
								<div></div>
								<div
									className="music-player-scroll scroll"
									id="scroll"
								></div>
							</>
						)}
					</div>
				</div>
				<div
					className="music-bottom-bar"
					onClick={() => setHidePlayer(!hidePlayer)}
				>
					<Slider
						value={sliderValue}
						onChange={(e) => handleSliderChange(e.value as number)}
						onClick={(e) => e.stopPropagation()}
					/>
					<div className="music-controls">
						<div className="music-controls-left">
							<div className="music-controls-left-box">
								<img
									src={
										songsList && currentSong !== -1
											? songsList[currentSong].imgSrc
											: "./src/resources/img/songDefault.png"
									}
									alt="Song Cover"
									onError={(e: any) => {
										e.target.onerror = null;
										e.target.src =
											"./src/resources/img/songDefault.png";
									}}
								/>
								<div className="music-controls-text">
									<span id="music-title">
										{songsList && currentSong !== -1
											? songsList[currentSong].name
											: ""}
									</span>
									<span id="music-subtitle">
										{songsList && currentSong !== -1 ? (
											<>
												{songsList[currentSong].album} -{" "}
												{songsList[currentSong].year}
											</>
										) : (
											""
										)}
									</span>
									<span id="music-time">
										{songsList && currentSong !== -1
											? `${ReactUtils.formatTime(
													currentTime
											  )} / ${ReactUtils.formatTime(duration)}`
											: ""}
									</span>
								</div>
							</div>
							<div className="music-controls-btns">
								<button
									className="svg-button-desktop-transparent"
									onClick={(e) => {
										const currentTime = howlerRef.current?.seek();

										if (
											(currentTime && currentTime >= 3) ||
											currentSong === 0
										) {
											howlerRef.current?.seek(0);
										} else {
											dispatch(setCurrentSong(currentSong - 1));
										}

										e.stopPropagation();
									}}
								>
									<PrevTrackIcon />
								</button>
								<button
									onClick={(e) => {
										dispatch(toggleMusicPause());
										e.stopPropagation();
									}}
									className="svg-button-desktop-transparent"
								>
									{paused ? <PlayIcon /> : <PauseIcon />}
								</button>
								<button
									className="svg-button-desktop-transparent"
									onClick={(e) => {
										dispatch(setCurrentSong(currentSong + 1));
										e.stopPropagation();
									}}
								>
									<NextTrackIcon />
								</button>
								<button
									onClick={(e) => {
										if (!paused) dispatch(toggleMusicPause());

										dispatch(setCurrentSong(-1));
										e.stopPropagation();
									}}
									className="svg-button-desktop-transparent"
								>
									<StopIcon />
								</button>
							</div>
						</div>
						<div
							className="music-controls-right"
							onClick={(e) => e.stopPropagation()}
						>
							<button
								className="svg-button-desktop-transparent"
								onClick={(e) => {
									setShowMore(!showMore);
									e.stopPropagation();
								}}
							>
								<MusicOptionsIcon />
							</button>
							<Slider
								id="music-volume-slider"
								orientation="vertical"
								value={volume * 100}
								min={0}
								max={100}
								step={1}
								onChange={(e) => {
									handleVolumeChange((e.value as number) / 100);
								}}
								onClick={(e) => e.stopPropagation()}
							/>
						</div>
					</div>
				</div>
			</section>
		</>
	);
}

export default MusicPlayer;
