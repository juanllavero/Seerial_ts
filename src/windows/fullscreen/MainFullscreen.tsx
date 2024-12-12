import { useDispatch } from "react-redux";
import { useEffect } from "react";
import "../../i18n";
import "../../Fullscreen.scss";
import HomeView from "./homeView/HomeView";
import ShowsView from "./showsView/ShowsView";
import { useSectionContext } from "context/section.context";
import { FullscreenSections } from "@data/enums/Sections";
import NoContentFullscreen from "./NoContentFullscreen";
import HeaderComponent from "./HeaderComponent";
import BackgroundImages from "./BackgroundImages";
import DetailsView from "./detailsView/DetailsView";
import MainMenu from "./MainMenu";
import useLoadLibraries from "hooks/useLoadLibraries";
import { selectLibrary } from "@redux/slices/dataSlice";
import Loading from "@components/utils/Loading";

function MainFullscreen() {
	const dispatch = useDispatch();
	const { loading, error } = useLoadLibraries();
	const { currentFullscreenSection } = useSectionContext();

	useEffect(() => {
		dispatch(selectLibrary(null));
	}, []);

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
			{loading ? (
				<>
					<Loading />
				</>
			) : (
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
						) : currentFullscreenSection ===
						  FullscreenSections.Collections ? (
							<ShowsView />
						) : currentFullscreenSection ===
						  FullscreenSections.Details ? (
							<DetailsView />
						) : (
							<NoContentFullscreen />
						)}
					</section>
				</>
			)}
		</>
	);
}

export default MainFullscreen;
