import ResolvedImage from "@components/image/ExternalImage";
import Image from "@components/image/Image";
import { RightPanelSections } from "@data/enums/Sections";
import { EpisodeData } from "@interfaces/EpisodeData";
import { LibraryData } from "@interfaces/LibraryData";
import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";
import {
	closeContextMenu,
	toggleSeriesMenu,
} from "@redux/slices/contextMenuSlice";
import {
	selectSeason,
	selectSeries,
	showMenu,
	showSeriesMenu,
	toggleSeriesWindow,
} from "@redux/slices/dataSlice";
import { RootState } from "@redux/store";
import { SectionContext } from "context/section.context";
import { ContextMenu } from "primereact/contextmenu";
import { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import Card from "./Card";
import { LeftArrowIcon, RightArrowIcon } from "@components/utils/IconLibrary";

function HomeSection() {
	const dispatch = useDispatch();
	const { t } = useTranslation();

	const { setCurrentRightSection } = useContext(SectionContext);

	const libraries = useSelector((state: RootState) => state.data.libraries);
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);

	const seriesMenu = useSelector((state: RootState) => state.data.seriesMenu);
	const seriesMenuOpen = useSelector(
		(state: RootState) => state.contextMenu.seriesMenu
	);

	const cm = useRef<ContextMenu | null>(null);

	// Reducers for images size
	const seriesImageWidth = useSelector(
		(state: RootState) => state.seriesImage.width
	);
	const seriesImageHeight = useSelector(
		(state: RootState) => state.seriesImage.height
	);

	// Control horizontal scroll in home view
	const continueWatchingContainer = useRef<HTMLDivElement>(null);
	const myListContainer = useRef<HTMLDivElement>(null);
	const [canScrollCW, setCanScrollCW] = useState(false);
	const [canScrollML, setCanScrollML] = useState(false);

	const [currentlyWatchingShows, setCurrentlyWatchingShows] = useState<
		{
			library: LibraryData;
			show: SeriesData;
			season: SeasonData;
			episode: EpisodeData;
		}[]
	>([]);

	useEffect(() => {
		if (libraries.length === 0) {
			setCurrentRightSection(RightPanelSections.NoContent);
			return;
		}

		setCurrentlyWatchingShows([]);
		for (const library of libraries) {
			for (const show of library.series) {
				const season = show.seasons[0];

				if (season) {
					const episode = season.episodes[0];

					if (episode) {
						setCurrentlyWatchingShows((prevElements) => [
							...prevElements,
							{
								library,
								show,
								season,
								episode,
							},
						]);
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
	}, [libraries, selectedLibrary]);

	const handleSeriesSelection = (series: SeriesData) => {
		dispatch(selectSeries(series));

		if (series.seasons && series.seasons.length > 0)
			handleSeasonSelection(series.seasons[0]);
	};

	const handleSeasonSelection = (season: SeasonData) => {
		dispatch(selectSeason(season));
		dispatch(closeContextMenu());
	};

	// Function to check if horizontal containers need scroll
	const checkScroll = () => {
		let container = continueWatchingContainer.current;
		if (container) {
			setCanScrollCW(container.scrollWidth > container.clientWidth);
		}

		container = myListContainer.current;
		if (container) {
			setCanScrollML(container.scrollWidth > container.clientWidth);
		}
	};

	useEffect(() => {
		checkScroll();
		window.addEventListener("resize", checkScroll);
		return () => window.removeEventListener("resize", checkScroll);
	}, []);

	useEffect(() => {
		checkScroll();
	}, [currentlyWatchingShows, seriesImageWidth]);

	//#region HORIZONTAL SCROLL WITH BUTTONS
	const handleScroll = (
		direction: "left" | "right",
		continueWatching: boolean
	) => {
		const scrollContainer = continueWatching
			? document.getElementById("continueWatchingScroll")
			: document.getElementById("myListScroll");

		if (scrollContainer) {
			const scrollWidth =
				scrollContainer.firstElementChild?.clientWidth || 0;
			const containerWidth = scrollContainer.clientWidth;
			const chaptersVisible = Math.floor(containerWidth / scrollWidth);

			const scrollAmount = chaptersVisible * scrollWidth;

			if (direction === "left") {
				scrollContainer.scrollLeft -= scrollAmount;
			} else if (direction === "right") {
				scrollContainer.scrollLeft += scrollAmount;
			}
		}
	};
	//#endregion

	return (
		<div className="home-view-container scroll" id="scroll">
			<div>
				<div className="horizontal-scroll-title">
					<span id="section-title">{t("continueWatching")}</span>
					<div className={`scroll-btns ${canScrollCW ? "visible" : ""}`}>
						<button
							className="svg-button"
							onClick={() => {
								handleScroll("left", true);
							}}
						>
							<LeftArrowIcon />
						</button>
						<button
							className="svg-button"
							onClick={() => {
								handleScroll("right", true);
							}}
						>
							<RightArrowIcon />
						</button>
					</div>
				</div>
				<div
					className="container"
					id="continueWatchingScroll"
					ref={continueWatchingContainer}
				>
					{[...currentlyWatchingShows]
						.splice(0, 15)
						.map(
							(value: {
								library: LibraryData;
								show: SeriesData;
								season: SeasonData;
								episode: EpisodeData;
							}) => (
								<Card 
									key={value.show.id}
									show={value.show}
									season={value.season}
									type="default"
								/>
							)
						)}
				</div>
			</div>
			<div className="scroll-container">
				<div className="horizontal-scroll-title">
					<span id="section-title">Mi lista</span>
					<div className={`scroll-btns ${canScrollML ? "visible" : ""}`}>
						<button
							className="svg-button"
							onClick={() => {
								handleScroll("left", false);
							}}
						>
							<LeftArrowIcon />
						</button>
						<button
							className="svg-button"
							onClick={() => {
								handleScroll("right", false);
							}}
						>
							<RightArrowIcon />
						</button>
					</div>
				</div>
				<div className="container" id="myListScroll" ref={myListContainer}>
					{[...currentlyWatchingShows]
						.splice(0, 15)
						.map(
							(value: {
								library: LibraryData;
								show: SeriesData;
								season: SeasonData;
								episode: EpisodeData;
							}) => (
								<div
									className="episode-box"
									key={value.show.id + "myList"}
									style={{
										maxWidth: `${seriesImageWidth}px`,
									}}
								>
									<div
										style={{ cursor: "pointer" }}
										onMouseEnter={() => {
											dispatch(showMenu(true));

											if (!seriesMenuOpen)
												dispatch(showSeriesMenu(value.show));
										}}
										onMouseLeave={() => {
											dispatch(showMenu(false));
										}}
										onAuxClick={(e) => {
											if (seriesMenu && value.show === seriesMenu) {
												dispatch(toggleSeriesMenu());
												cm.current?.show(e);
											}
										}}
									>
										<div className="video-button-image-section">
											<div
												className={`loading-element-hover ${
													value.show.analyzingFiles
														? "loading-visible"
														: ""
												}`}
												style={{
													width: `${seriesImageWidth}px`,
													height: `${seriesImageHeight}px`,
												}}
											>
												<span className="spinner"></span>
											</div>
											<div
												className="video-button-hover"
												style={{
													width: `${seriesImageWidth}px`,
													height: `${seriesImageHeight}px`,
												}}
											>
												<div
													className="series-selection-div"
													onClick={() =>
														handleSeriesSelection(value.show)
													}
												></div>
												<div className="bottom-btns">
													<button
														className="svg-button-desktop-transparent"
														onClick={() =>
															dispatch(toggleSeriesWindow())
														}
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
														className="svg-button-desktop-transparent"
														onClick={(e) => {
															dispatch(toggleSeriesMenu());
															cm.current?.show(e);
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
											</div>
											<div
												className="video-button"
												style={{
													width: `${seriesImageWidth}px`,
													height: `${seriesImageHeight}px`,
												}}
											>
												{value.show.coverSrc !== "" ? (
													<ResolvedImage
														src={value.show.coverSrc}
														alt="Poster"
														style={{
															width: `${seriesImageWidth}px`,
															height: `${seriesImageHeight}px`,
														}}
														onError={(e: any) => {
															e.target.onerror = null; // To avoid infinite loop
															e.target.src =
																"./src/resources/img/fileNotFound.jpg";
														}}
													/>
												) : value.show.seasons &&
												  value.show.seasons.length > 0 &&
												  value.show.seasons[0].coverSrc !== "" ? (
													<ResolvedImage
														src={value.show.seasons[0].coverSrc}
														alt="Poster"
														style={{
															width: `${seriesImageWidth}px`,
															height: `${seriesImageHeight}px`,
														}}
														onError={(e: any) => {
															e.target.onerror = null; // To avoid infinite loop
															e.target.src =
																"./src/resources/img/fileNotFound.jpg";
														}}
													/>
												) : (
													<ResolvedImage
														src="resources/img/fileNotFound.jpg"
														alt="Poster"
														style={{
															width: `${seriesImageWidth}px`,
															height: `${seriesImageHeight}px`,
														}}
													/>
												)}
											</div>
										</div>
									</div>
									<a
										id="seriesName"
										title={value.show.name}
										onClick={() => handleSeriesSelection(value.show)}
									>
										{value.show.name}
									</a>
									{value.show.seasons &&
									value.show.seasons.length > 1 ? (
										<span id="episodeNumber">
											{(() => {
												const minYear = Math.min(
													...value.show.seasons.map(
														(season: SeasonData) =>
															Number.parseInt(season.year)
													)
												);
												const maxYear = Math.max(
													...value.show.seasons.map(
														(season: SeasonData) =>
															Number.parseInt(season.year)
													)
												);
												return minYear === maxYear
													? `${minYear}`
													: `${minYear} - ${maxYear}`;
											})()}
										</span>
									) : value.show.seasons &&
									  value.show.seasons.length > 0 ? (
										<span id="episodeNumber">
											{new Date(
												value.show.seasons[0].year
											).getFullYear()}
										</span>
									) : null}
									<ContextMenu
										model={[
											{
												label: t("editButton"),
												command: () => {
													dispatch(toggleSeriesMenu());
													dispatch(toggleSeriesWindow());
												},
											},
											{
												label: t("markWatched"),
												command: () => dispatch(toggleSeriesMenu()),
											},
											{
												label: t("markUnwatched"),
												command: () => dispatch(toggleSeriesMenu()),
											},
											...(value.library.type === "Shows" ||
											!value.show.isCollection
												? [
														{
															label: t("correctIdentification"),
															command: () =>
																dispatch(toggleSeriesMenu()),
														},
												  ]
												: []),
											...(value.library.type === "Shows"
												? [
														{
															label: t("changeEpisodesGroup"),
															command: () =>
																dispatch(toggleSeriesMenu()),
														},
												  ]
												: []),
											{
												label: t("removeButton"),
												command: () => dispatch(toggleSeriesMenu()),
											},
										]}
										ref={cm}
										className="dropdown-menu"
									/>
								</div>
							)
						)}
				</div>
			</div>
		</div>
	);
}

export default HomeSection;
