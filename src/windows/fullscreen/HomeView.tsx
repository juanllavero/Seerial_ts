import "../../i18n";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { useEffect, useRef, useState } from "react";
import { SeriesData } from "@interfaces/SeriesData";
import { SeasonData } from "@interfaces/SeasonData";
import { LibraryData } from "@interfaces/LibraryData";
import { EpisodeData } from "@interfaces/EpisodeData";
import { ReactUtils } from "data/utils/ReactUtils";
import { useTranslation } from "react-i18next";
import {
	setHomeImageLoaded,
	setHomeInfoElement,
} from "@redux/slices/fullscreenSectionsSlice";
import Image from "@components/image/Image";

function HomeView() {
	const dispatch = useDispatch();
	const { t } = useTranslation();

	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const currentEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);

	const [dominantColor, setDominantColor] = useState<string>("000000");

	const homeImageLoaded = useSelector(
		(state: RootState) => state.fullscreenSection.homeImageLoaded
	);

	const homeInfoElement = useSelector(
		(state: RootState) => state.fullscreenSection.homeInfoElement
	);
	const currentlyWatchingShows = useSelector(
		(state: RootState) => state.fullscreenSection.currentlyWatchingShows
	);

	const listRef = useRef<HTMLDivElement>(null);

	//#region KEYBOARD DETECTION
	const handleKeyDown = (event: KeyboardEvent) => {
		if (!currentSeason) {
			return;
		}

		const currentIndex = currentSeason.episodes.findIndex(
			(episode) => episode === currentEpisode
		);

		if (event.key === "ArrowRight") {
			// Mover al siguiente episodio si existe
			const nextIndex = currentIndex + 1;
			if (nextIndex < currentSeason.episodes.length) {
				ReactUtils.handleScrollElementClick(
					nextIndex,
					listRef,
					false
				);
			}
		}

		if (event.key === "ArrowLeft") {
			// Mover al episodio anterior si existe
			const prevIndex = currentIndex - 1;
			if (prevIndex >= 0) {
				ReactUtils.handleScrollElementClick(
					prevIndex,
					listRef,
					false
				);
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

	// Generate Gradient Background
	const [gradient, setGradient] = useState<string>("none");
	const [gradientLeft, setGradientLeft] = useState<string>("none");

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

	return (
		<section className="home-container">
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
			<div className="home-info-container">
				{homeInfoElement ? (
					<>
						{homeInfoElement.library.type === "Shows" ? (
							<>
								{homeInfoElement.show.logoSrc &&
								homeInfoElement.show.logoSrc !== "" ? (
									<Image
										src={homeInfoElement.show.logoSrc}
										alt="Logo"
										isRelative={true}
										errorSrc=""
									/>
								) : (
									<span id="home-title">
										{homeInfoElement.show.name}
									</span>
								)}
							</>
						) : (
							<>
								{homeInfoElement.season.logoSrc &&
								homeInfoElement.season.logoSrc !== "" ? (
									<Image
										src={homeInfoElement.season.logoSrc}
										alt="Logo"
										isRelative={true}
										errorSrc=""
									/>
								) : (
									<span id="home-title">
										{homeInfoElement.season.name}
									</span>
								)}
							</>
						)}

						<span id="home-subtitle">
							{homeInfoElement.library.type === "Shows"
								? homeInfoElement.episode.name
								: null}
						</span>
						<div className="home-info-horizontal">
							{homeInfoElement.library.type === "Shows" ? (
								<span>
									{t("seasonLetter")}
									{homeInfoElement.episode.seasonNumber} ·{" "}
									{t("episodeLetter")}
									{homeInfoElement.episode.episodeNumber}
								</span>
							) : null}
							<span>
								{new Date(homeInfoElement.episode.year).getFullYear()}
							</span>
							<span>
								{ReactUtils.formatTimeForView(
									homeInfoElement.episode.runtime
								)}
							</span>
							{homeInfoElement.library.type !== "Shows" &&
							homeInfoElement.season.score &&
							homeInfoElement.season.score !== 0 ? (
								<span>{homeInfoElement.season.score.toFixed(2)}</span>
							) : null}
						</div>
						<span id="home-overview">
							{homeInfoElement.library.type === "Shows"
								? homeInfoElement.episode.overview ||
								  homeInfoElement.season.overview ||
								  homeInfoElement.show.overview ||
								  t("defaultOverview")
								: homeInfoElement.season.overview ||
								  homeInfoElement.show.overview ||
								  t("defaultOverview")}
						</span>
					</>
				) : null}
			</div>
			<div className="continue-watching-title">
				<span>{t("continueWatching")}</span>
			</div>
			<div className="continue-watching-list">
				{[...currentlyWatchingShows]
					.splice(0, 75)
					.map(
						(value: {
							library: LibraryData;
							show: SeriesData;
							season: SeasonData;
							episode: EpisodeData;
						}) => (
							<div
								className={`element ${
									value === homeInfoElement ? "element-selected" : null
								}`}
								key={value.show.id + "continueWatching"}
								onClick={() => {
									dispatch(setHomeInfoElement(value));
								}}
							>
								{value.show.coverSrc !== "" ? (
									<Image
										src={value.show.coverSrc}
										alt="Poster"
										isRelative={true}
										errorSrc="./src/resources/img/fileNotFound.jpg"
									/>
								) : value.show.seasons &&
								  value.show.seasons.length > 0 &&
								  value.show.seasons[0].coverSrc !== "" ? (
									<Image
										src={value.show.seasons[0].coverSrc}
										alt="Poster"
										isRelative={true}
										errorSrc="./src/resources/img/fileNotFound.jpg"
									/>
								) : (
									<Image
										src="resources/img/fileNotFound.jpg"
										alt="Poster"
										isRelative={true}
										errorSrc=""
									/>
								)}
							</div>
						)
					)}
			</div>
		</section>
	);
}

export default HomeView;
