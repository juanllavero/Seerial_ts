import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { useEffect } from "react";
import "../../i18n";
import "../../Fullscreen.scss";
import {
	setCurrentlyWatchingShows,
	setHomeInfoElement,
} from "redux/slices/fullscreenSectionsSlice";
import HomeView from "./homeView/HomeView";
import ShowsView from "./showsView/ShowsView";
import { HomeInfoElement } from "@interfaces/HomeInfoElement";
import { useSectionContext } from "context/section.context";
import { FullscreenSections } from "@data/enums/Sections";
import NoContentFullscreen from "./NoContentFullscreen";
import HeaderComponent from "./HeaderComponent";
import BackgroundImages from "./BackgroundImages";
import DetailsView from "./detailsView/DetailsView";
import MainMenu from "./MainMenu";
import useLoadLibraries from "hooks/useLoadLibraries";

function MainFullscreen() {
	const dispatch = useDispatch();
	const { loading, error } = useLoadLibraries();
	const { currentFullscreenSection } = useSectionContext();

	// Main objects
	const librariesList = useSelector(
		(state: RootState) => state.data.libraries
	);
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const currentlyWatchingShows = useSelector(
		(state: RootState) => state.fullscreenSection.currentlyWatchingShows
	);

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
				dispatch(setCurrentlyWatchingShows(currentlyWatchingShows));

				if (!selectedLibrary) {
					dispatch(setHomeInfoElement(currentlyWatchingShows[0]));
				}
			}
		} else {
			if (selectedLibrary.series.length > 0) {
				//handleSelectShow(selectedLibrary.series[0], true);
			}
		}
	}, [librariesList, selectedLibrary]);

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
				scrollToCenter(listRef.current, scrollOffset, 300, isVertical); // 300ms
			}
		}
	};
	//#endregion

	//#region KEYBOARD DETECTION
	/*const handleKeyDown = (event: KeyboardEvent) => {
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
	}, [currentEpisode, currentSeason?.episodes]);*/
	//#endregion

	return (
		<>
			{/* MAIN MENU */}
			<MainMenu />

			{/* BACKGROUND IMAGES */}
			<BackgroundImages />

			{/* HEADER SECTION */}
			<HeaderComponent />

			{/* CONTENT SECTION */}
			<section className="content">
				{loading ? (
					<div></div>
				) : error ? (
					<NoContentFullscreen />
				) : currentFullscreenSection === FullscreenSections.Home ? (
					<HomeView />
				) : currentFullscreenSection === FullscreenSections.Collections ? (
					<ShowsView />
				) : currentFullscreenSection === FullscreenSections.Details ? (
					<DetailsView />
				) : (
					<NoContentFullscreen />
				)}
			</section>
		</>
	);
}

export default MainFullscreen;
