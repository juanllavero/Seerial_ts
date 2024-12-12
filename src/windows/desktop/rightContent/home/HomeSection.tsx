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
import ContentCard from "./ContentCard";

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
				if (
					!show.seasons ||
					show.seasons.length <= 0 ||
					show.currentlyWatchingSeason === -1
				)
					continue;

				// Get sorted seasons
				const seasons = [...show.seasons].sort((a, b) => {
					if (a.order !== 0 && b.order !== 0) {
						return a.order - b.order;
					}
					if (a.order === 0 && b.order === 0) {
						return (
							new Date(a.year).getTime() - new Date(b.year).getTime()
						);
					}
					return a.order === 0 ? 1 : -1;
				});

				// Get currently watching season
				const season = seasons[show.currentlyWatchingSeason];

				if (season) {
					if (
						!season.episodes ||
						season.episodes.length <= 0 ||
						season.currentlyWatchingEpisode === -1
					)
						continue;

					// Get sorted episodes
					const episodes = [...season.episodes].sort(
						(a, b) => a.episodeNumber - b.episodeNumber
					);

					const episode = episodes[season.currentlyWatchingEpisode];

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
			{currentlyWatchingShows.length > 0 ? (
				<div className="home-view-container">
					<span id="section-title">{t("continueWatching")}</span>
					<div className="container scroll" id="scroll">
						{[...currentlyWatchingShows].map(
							(value: {
								library: LibraryData;
								show: SeriesData;
								season: SeasonData;
								episode: EpisodeData;
							}) => (
								<ContentCard
									key={value.show.id}
									library={value.library}
									show={value.show}
									season={value.season}
									episode={value.episode}
								/>
							)
						)}
					</div>
				</div>
			) : (
				<h2>You are not watching any series</h2>
			)}
		</Suspense>
	);
}

export default HomeSection;
