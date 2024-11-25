import { RightPanelSections } from "@data/enums/Sections";
import { EpisodeData } from "@interfaces/EpisodeData";
import { LibraryData } from "@interfaces/LibraryData";
import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";
import { RootState } from "@redux/store";
import { useSectionContext } from "context/section.context";
import { Suspense, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import Card from "../Card";
import { LeftArrowIcon, RightArrowIcon } from "@components/utils/IconLibrary";
import "./HomeSection.scss";
import Loading from "@components/utils/Loading";

function HomeSection() {
	const { t } = useTranslation();

	const { setCurrentRightSection } = useSectionContext();

	const libraries = useSelector((state: RootState) => state.data.libraries);
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);

	// Reducers for images size
	const seriesImageWidth = useSelector(
		(state: RootState) => state.seriesImage.width
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
				if (show.seasons && show.seasons.length <= 0) continue;

				const season = show.seasons[0];

				if (season) {
					if (season.episodes && season.episodes.length <= 0) continue;

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
		<Suspense fallback={<Loading />}>
			<div className="home-view-container scroll" id="scroll">
				<div>
					<div className="horizontal-scroll-title">
						<span id="section-title">{t("continueWatching")}</span>
						<div
							className={`scroll-btns ${canScrollCW ? "visible" : ""}`}
						>
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
						<div
							className={`scroll-btns ${canScrollML ? "visible" : ""}`}
						>
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
					<div
						className="container"
						id="myListScroll"
						ref={myListContainer}
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
			</div>
		</Suspense>
	);
}

export default HomeSection;
