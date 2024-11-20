import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import {
	selectEpisode,
	selectLibrary,
	selectSeason,
	setLibraries,
} from "redux/slices/dataSlice";
import { useEffect, useRef, useState } from "react";
import "../../i18n";
import "../../Fullscreen.scss";
import ResolvedImage from "@components/image/Image";
import { SeriesData } from "@interfaces/SeriesData";
import { LibraryData } from "@interfaces/LibraryData";
import { SeasonData } from "@interfaces/SeasonData";
import { EpisodeData } from "@interfaces/EpisodeData";
import { ReactUtils } from "data/utils/ReactUtils";
import MainMenu from "./mainMenu";
import { toggleMainMenu } from "redux/slices/contextMenuSlice";
import { FullscreenSection } from "data/enums/FullscreenSections";
import {
	changeFullscreenSection,
	setCurrentlyWatchingShows,
	setDominantColor,
	setHomeImageLoaded,
	setHomeInfoElement,
} from "redux/slices/fullscreenSectionsSlice";
import HomeView from "./HomeView";
import SeasonsView from "./SeasonView";
import AlbumsView from "./AlbumsView";
import SongsView from "./SongsView";
import ShowsView from "./ShowsView";
import { HomeInfoElement } from "@interfaces/HomeInfoElement";
import Image from "@components/image/Image";
import {
	GoBackIcon,
	HomeFullDefaultIcon,
	HomeFullSelectedIcon,
	MenuIcon,
} from "@components/utils/IconLibrary";
import { useSectionContext } from "context/section.context";
import { FullscreenSections } from "@data/enums/Sections";
import NoContentFullscreen from "./NoContentFullscreen";

function MainFullscreen() {
	const dispatch = useDispatch();
	const { currentFullscreenSection } = useSectionContext();

	const [time, setTime] = useState(new Date());

	const [useImageAsBackground, setUseImageAsBackground] =
		useState<boolean>(true);

	// Main objects
	const librariesList = useSelector(
		(state: RootState) => state.data.libraries
	);
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

	// Temp objects for item selection
	const [currentShowForBackground, setCurrentShowForBackground] = useState<
		SeriesData | undefined
	>();
	const [currentSeasonSelected, setCurrentSeasonSelected] = useState<
		SeasonData | undefined
	>();

	const homeImageLoaded = useSelector(
		(state: RootState) => state.fullscreenSection.homeImageLoaded
	);
	const showImageLoaded = useSelector(
		(state: RootState) => state.fullscreenSection.showImageLoaded
	);
	const seasonImageLoaded = useSelector(
		(state: RootState) => state.fullscreenSection.seasonImageLoaded
	);
	const dominantColor = useSelector(
		(state: RootState) => state.fullscreenSection.dominantColor
	);

	const listRef = useRef<HTMLDivElement>(null);

	const section = useSelector(
		(state: RootState) => state.fullscreenSection.fullscreenSection
	);
	const [songsView, setSongsView] = useState<boolean>(false);

	const homeInfoElement = useSelector(
		(state: RootState) => state.fullscreenSection.homeInfoElement
	);
	const currentlyWatchingShows = useSelector(
		(state: RootState) => state.fullscreenSection.currentlyWatchingShows
	);

	const [gradient, setGradient] = useState<string>("none");
	const [gradientLeft, setGradientLeft] = useState<string>("none");

	// Set Currently Watching
	useEffect(() => {
		if (!selectedLibrary) {
			dispatch(setCurrentlyWatchingShows([]));
			let elements: HomeInfoElement[] = [];
			for (const library of librariesList) {
				if (library.type !== "Music") {
					for (const show of library.series) {
						const season = show.seasons[0];

						if (season) {
							const episode = season.episodes[0];

							if (episode) {
								elements = [
									...elements,
									{ library, show, season, episode },
								];
							}
						}
						/*
                        if (show.currentlyWatchingSeason !== -1){
                        const season = show.seasons[show.currentlyWatchingSeason];
            
                        if (season) {
                            const episode = season.episodes[season.currentlyWatchingEpisode];
            
                            if (episode){
                            setCurrentlyWatchingShows([...currentlyWatchingShows, {
                                library, show, season, episode
                            }]);
                            }
                        }
                        }
                        */
					}
				}
			}

			dispatch(setCurrentlyWatchingShows(elements));

			if (currentlyWatchingShows.length > 0) {
				setCurrentlyWatchingShows(currentlyWatchingShows);

				if (!selectedLibrary) {
					setHomeInfoElement(currentlyWatchingShows[0]);
				}
			}
		} else {
			if (selectedLibrary.series.length > 0) {
				//handleSelectShow(selectedLibrary.series[0], true);
			}
		}
	}, [librariesList, selectedLibrary]);

	// Initialize Library Data
	useEffect(() => {
		// @ts-ignore
		window.electronAPI.getLibraryData()
			.then((data: any[]) => {
				dispatch(setLibraries(data));
			})
			.catch((error: unknown) => {
				if (error instanceof Error) {
					console.error("Error loading library data:", error.message);
				} else {
					console.error("Unexpected error:", error);
				}
			});

		// Update time every second
		const timer = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	//#region TOP BAR FUNCTIONS
	const handleGoToMainView = () => {
		setSongsView(false);
		dispatch(selectSeason(null));
		dispatch(selectEpisode(undefined));
		dispatch(changeFullscreenSection(FullscreenSection.Home));
	};

	const handleSelectLibrary = (library: LibraryData | null) => {
		setSongsView(false);
		if (library) {
			dispatch(setHomeInfoElement(undefined));
			dispatch(setHomeImageLoaded(false));
			dispatch(changeFullscreenSection(FullscreenSection.Shows));
			dispatch(setDominantColor("000000"));
		} else {
			dispatch(changeFullscreenSection(FullscreenSection.Home));
		}

		dispatch(selectLibrary(library));
		dispatch(selectSeason(null));
		dispatch(selectEpisode(undefined));
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};
	//#endregion

	//#region SCROLL
	const scrollToCenter = (
		scrollElement: HTMLElement,
		scrollOffset: number,
		duration: number,
		isVertical: boolean
	) => {
		const start = isVertical
			? scrollElement.scrollTop
			: scrollElement.scrollLeft;
		const startTime = performance.now();

		const animateScroll = (currentTime: number) => {
			const timeElapsed = currentTime - startTime;
			const progress = Math.min(timeElapsed / duration, 1);

			if (isVertical) {
				scrollElement.scrollTop = start + scrollOffset * progress; // Scroll vertical
			} else {
				scrollElement.scrollLeft = start + scrollOffset * progress; // Scroll horizontal
			}

			if (timeElapsed < duration) {
				requestAnimationFrame(animateScroll);
			}
		};

		requestAnimationFrame(animateScroll);
	};

	const handleScrollElementClick = <T extends { id: string }>(
		index: number,
		listRef: React.RefObject<HTMLDivElement>,
		isVertical: boolean
	) => {
		const elementButton = listRef.current?.children[index] as HTMLElement;
		if (elementButton && listRef.current) {
			const listRect = listRef.current.getBoundingClientRect();
			const buttonRect = elementButton.getBoundingClientRect();

			const buttonCenter = isVertical
				? buttonRect.top + buttonRect.height / 2
				: buttonRect.left + buttonRect.width / 2;

			const listCenter = isVertical
				? listRect.top + listRect.height / 2
				: listRect.left + listRect.width / 2;

			if (buttonCenter !== listCenter) {
				const scrollOffset = buttonCenter - listCenter;
				scrollToCenter(listRef.current, scrollOffset, 300, isVertical); // Ajusta la duración a 300ms
			}
		}
	};
	//#endregion

	// Generate Gradient Background
	useEffect(() => {
		const generateGradient = async (path: string) => {
			if (path !== "none") {
				const extPath = await window.electronAPI.getExternalPath(path);

				if (extPath !== "") {
					await ReactUtils.getDominantColors(extPath);

					setDominantColor(ReactUtils.colors[0]);

					if (dominantColor) {
						setGradient(
							`radial-gradient(135% 103% at 97% 39%, #073AFF00 41%, ${dominantColor} 68%)`
						);
						setGradientLeft(
							`linear-gradient(90deg, ${dominantColor} 0%, ${dominantColor} 100%)`
						);
					}
				}
			} else {
				setGradient(
					`radial-gradient(135% 103% at 97% 39%, #073AFF00 41%, #000000FF 68%)`
				);
				setGradientLeft(
					`linear-gradient(90deg, #000000FF 0%, #000000FF 100%)`
				);
			}
		};

		if (
			homeInfoElement &&
			homeInfoElement.season.backgroundSrc &&
			homeInfoElement.season.backgroundSrc !== ""
		) {
			setHomeImageLoaded(false);
			setTimeout(() => {
				generateGradient(homeInfoElement.season.backgroundSrc);
				setHomeImageLoaded(true);
			}, 600);
		} else if (homeInfoElement) {
			setTimeout(() => {
				generateGradient("none");
			}, 100);
		}
	}, [homeInfoElement]);

	//#region KEYBOARD DETECTION
	const handleKeyDown = (event: KeyboardEvent) => {
		if (!currentSeason) {
			return;
		}

		const currentIndex = currentSeason.episodes.findIndex(
			(episode) => episode === currentEpisode
		);

		if (songsView) {
			if (event.key === "ArrowDown") {
				// Mover al siguiente episodio si existe
				const nextIndex = currentIndex + 1;
				if (nextIndex < currentSeason.episodes.length) {
					handleScrollElementClick<EpisodeData>(nextIndex, listRef, true);
					dispatch(selectEpisode(currentSeason.episodes[nextIndex]));
				}
			}

			if (event.key === "ArrowUp") {
				// Mover al episodio anterior si existe
				const prevIndex = currentIndex - 1;
				if (prevIndex >= 0) {
					handleScrollElementClick<EpisodeData>(prevIndex, listRef, true);
					dispatch(selectEpisode(currentSeason.episodes[prevIndex]));
				}
			}
		} else {
			if (event.key === "ArrowRight") {
				// Mover al siguiente episodio si existe
				const nextIndex = currentIndex + 1;
				if (nextIndex < currentSeason.episodes.length) {
					handleScrollElementClick<EpisodeData>(nextIndex, listRef, false);
					dispatch(selectEpisode(currentSeason.episodes[nextIndex]));
				}
			}

			if (event.key === "ArrowLeft") {
				// Mover al episodio anterior si existe
				const prevIndex = currentIndex - 1;
				if (prevIndex >= 0) {
					handleScrollElementClick<EpisodeData>(prevIndex, listRef, false);
					dispatch(selectEpisode(currentSeason.episodes[prevIndex]));
				}
			}
		}
	};

	// Add and Clean Keyboard Events
	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [currentEpisode, currentSeason?.episodes]);
	//#endregion

	return (
		<>
			<MainMenu />
			<div
				className={`season-image ${
					seasonImageLoaded ? "loaded-blur-in" : "loaded-blur-out"
				}`}
			>
				{selectedLibrary &&
				currentSeason &&
				currentSeason.backgroundSrc !== "" ? (
					<Image
						src={currentSeason.backgroundSrc}
						alt="Background"
						isRelative={true}
						errorSrc=""
					/>
				) : null}
			</div>
			<div
				className={`season-gradient ${
					seasonImageLoaded ? "loaded-blur-in" : "loaded-blur-out"
				}`}
			></div>
			{useImageAsBackground ? (
				<div
					className={`background-image-blur ${
						showImageLoaded ? "loaded-blur-in" : "loaded-blur-out"
					}`}
				>
					{selectedLibrary &&
					currentShowForBackground &&
					currentShowForBackground.seasons &&
					currentShowForBackground.seasons.length > 0 ? (
						<Image
							src={`/resources/img/backgrounds/${currentShowForBackground.seasons[0].id}/fullBlur.jpg`}
							alt="Background"
							isRelative={true}
							errorSrc=""
						/>
					) : null}
				</div>
			) : null}
			{section === FullscreenSection.Home || useImageAsBackground ? (
				<div className="noise-background">
					<Image
						src="resources/img/noise.png"
						alt="Noise image"
						isRelative={true}
						errorSrc=""
					/>
				</div>
			) : null}
			{homeInfoElement !== undefined ? (
				<>
					<div
						className={`background-image ${
							homeImageLoaded ? "loaded" : ""
						}`}
					>
						{homeInfoElement.season.backgroundSrc !== "" ? (
							<Image
								src={homeInfoElement.season.backgroundSrc}
								alt="Background"
								isRelative={true}
								errorSrc=""
							/>
						) : null}
					</div>
					<div
						className={`gradient-left ${
							homeImageLoaded ? "loadedFull" : ""
						}`}
						style={{ background: `${gradientLeft}` }}
					></div>
					<div
						className={`gradient ${homeImageLoaded ? "loadedFull" : ""}`}
						style={{ background: `${gradient}` }}
					></div>
				</>
			) : null}
			<section className="top">
				{section !== FullscreenSection.Seasons && (
					<button id="home" onClick={() => handleSelectLibrary(null)}>
						{selectedLibrary ? (
							<HomeFullSelectedIcon />
						) : (
							<HomeFullDefaultIcon />
						)}
					</button>
				)}
				{section !== FullscreenSection.Seasons && (
					<div className="libraries-list">
						{librariesList.map((library) => (
							<button
								key={library.id}
								className={`libraries-button ${
									library === selectedLibrary ? "active" : ""
								}`}
								title={library.name}
								onClick={() => handleSelectLibrary(library)}
							>
								<span className="library-name">{library.name}</span>
							</button>
						))}
					</div>
				)}
				{section === FullscreenSection.Seasons && (
					<>
						<button
							className="go-back-btn"
							onClick={() => handleGoToMainView()}
						>
							<GoBackIcon />
						</button>
					</>
				)}
				<div className="right-options">
					<span id="time">{formatTime(time)}</span>
					{section !== FullscreenSection.Seasons && (
						<button
							id="options-btn"
							onClick={() => {
								dispatch(toggleMainMenu());
							}}
						>
							<MenuIcon />
						</button>
					)}
				</div>
			</section>
			<section className="content">
				{currentFullscreenSection === FullscreenSections.Home ? (
					<HomeView />
				) : currentFullscreenSection === FullscreenSections.Collections ? (
					<ShowsView />
				) : currentFullscreenSection === FullscreenSections.Details ? (
					selectedLibrary &&
					currentShow &&
					currentSeason &&
					currentEpisode ? (
						<>
							{selectedLibrary.type === "Music" ? (
								<>
									{currentShow.seasons.length > 1 ? (
										<AlbumsView />
									) : (
										<SongsView />
									)}
								</>
							) : (
								<SeasonsView />
							)}
						</>
					) : null
				) : (
					<NoContentFullscreen />
				)}
			</section>
		</>
	);
}

export default MainFullscreen;
