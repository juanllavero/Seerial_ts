import Image from "@components/image/Image";
import { SeasonData } from "@interfaces/SeasonData";
import {
	toggleSeasonMenu,
	closeAllMenus,
	toggleContextMenu,
	closeContextMenu,
} from "@redux/slices/contextMenuSlice";
import {
	toggleSeasonWindow,
	setShowPoster,
	selectSeason,
	setSeasonWatched,
} from "@redux/slices/dataSlice";
import { loadTransparentImage } from "@redux/slices/transparentImageLoadedSlice";
import { RootState } from "@redux/store";
import { t } from "i18next";
import { ContextMenu } from "primereact/contextmenu";
import { Suspense, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import EpisodeList from "./EpisodeList";
import {
	AddToListIcon,
	DownArrowIcon,
	EditIcon,
	HorizontalDotsIcon,
	MarkWatchedIcon,
	PlayIcon,
	RemoveFromListIcon,
	UnmarkWatchedIcon,
	UpArrowIcon,
} from "@components/utils/IconLibrary";
import "./DetailsSection.scss";
import Loading from "@components/utils/Loading";

function DetailsSection() {
	const dispatch = useDispatch();

	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const selectedSeries = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const selectedSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const seriesImageWidth = useSelector(
		(state: RootState) => state.seriesImage.width
	);
	const seriesImageHeight = useSelector(
		(state: RootState) => state.seriesImage.height
	);
	const transparentImageLoaded = useSelector(
		(state: RootState) =>
			state.transparentImageLoaded.isTransparentImageLoaded
	);
	const showCollectionPoster = useSelector(
		(state: RootState) => state.data.showCollectionPoster
	);
	const isContextMenuShown = useSelector(
		(state: RootState) => state.contextMenu.isContextShown
	);
	const seasonMenuOpen = useSelector(
		(state: RootState) => state.contextMenu.seasonMenu
	);

	const cm = useRef<ContextMenu | null>(null);
	const cm3 = useRef<ContextMenu | null>(null);

	const handleSeasonSelection = (season: SeasonData) => {
		dispatch(selectSeason(season));
		dispatch(closeContextMenu());
	};

	function toggleMenu() {
		dispatch(toggleContextMenu());
	}

	const changePoster = () => {
		dispatch(setShowPoster(!showCollectionPoster));
	};

	const handleTransparentImageLoad = () => {
		setTimeout(() => {
			dispatch(loadTransparentImage());
		}, 300);
	};

	const continueWatchingInfo = () => {
		if (!selectedSeries || selectedSeries.currentlyWatchingSeason === -1)
			return null;

		const seasons = [...selectedSeries.seasons].sort((a, b) => {
			if (a.order !== 0 && b.order !== 0) {
				return a.order - b.order;
			}
			if (a.order === 0 && b.order === 0) {
				return new Date(a.year).getTime() - new Date(b.year).getTime();
			}
			return a.order === 0 ? 1 : -1;
		});

		const season = seasons[selectedSeries.currentlyWatchingSeason];
		if (!season || !season.episodes) return null;

		const episodes = [...season.episodes].sort(
			(a, b) => a.episodeNumber - b.episodeNumber
		);
		const episode = episodes[season.currentlyWatchingEpisode];

		if (!episode) return null;

		return (
			<span>
				{t("inProgress")} — {t("seasonLetter")}
				{season.seasonNumber} · {t("episodeLetter")}
				{episode.episodeNumber}
			</span>
		);
	};

	//#region TEXT CLAMP
	const clampTextRef = useRef<HTMLDivElement[]>([]);
	const clampActionRef = useRef<HTMLButtonElement[]>([]);

	/* check if the item is clamped or not */
	const showReadMoreButton = (element: HTMLElement) => {
		if (
			element.offsetHeight < element.scrollHeight ||
			element.offsetWidth < element.scrollWidth
		) {
			element.classList.add("clamped");
		}
	};

	useEffect(() => {
		// Query the elements and set references
		const clampTextElements = Array.from(
			document.querySelectorAll<HTMLDivElement>(".clamp-text")
		);
		clampTextRef.current = clampTextElements;

		clampTextRef.current.forEach((el) => showReadMoreButton(el));

		const clampActionElements = Array.from(
			document.querySelectorAll<HTMLButtonElement>(".clamp-text-action")
		);
		clampActionRef.current = clampActionElements;

		clampActionRef.current.forEach((el) => {
			let isOpen = false;
			el.addEventListener("click", () => {
				const clampedEl = el.previousElementSibling as HTMLElement;

				isOpen = !isOpen;

				if (isOpen) {
					clampedEl.classList.add("open");
					el.classList.add("open");
				} else {
					clampedEl.classList.remove("open");
					el.classList.remove("open");
				}
			});
		});
	}, [selectedSeason]);
	//#endregion

	return (
		<Suspense fallback={<Loading />}>
			{selectedLibrary && selectedSeries && selectedSeason && (
				<div className="details-container scroll" id="scroll">
					<div className="logo-container">
						{selectedLibrary.type === "Shows" ? (
							selectedSeries && selectedSeries.logoSrc != "" ? (
								<Image
									src={selectedSeries.logoSrc}
									alt="Logo"
									isRelative={true}
									errorSrc=""
								/>
							) : (
								<span id="seriesTitle">{selectedSeries.name}</span>
							)
						) : selectedSeason.logoSrc != "" ? (
							<Image
								src={selectedSeason.logoSrc}
								alt="Logo"
								isRelative={true}
								errorSrc=""
							/>
						) : (
							<span id="seriesTitle">{selectedSeries.name}</span>
						)}
					</div>
					{selectedSeason.backgroundSrc != "" ? (
						<div className="background-image">
							<Image
								src={selectedSeason.backgroundSrc}
								alt="Season Background"
								isRelative={true}
								errorSrc=""
								onLoad={handleTransparentImageLoad}
								className={transparentImageLoaded ? "imageLoaded" : ""}
							/>
						</div>
					) : null}
					<div className="info-container">
						<div
							className={`poster-image ${
								selectedLibrary.type !== "Shows" &&
								selectedSeries.seasons &&
								selectedSeries.seasons.length === 1
									? "round-image"
									: ""
							}`}
						>
							<div
								className={`on-loading ${
									selectedSeries.analyzingFiles ? "visible" : ""
								}`}
								style={{
									width: `${seriesImageWidth}px`,
									height: `${seriesImageHeight}px`,
								}}
							>
								<span className="spinner"></span>
							</div>
							{selectedLibrary.type == "Shows" ||
							showCollectionPoster ? (
								<Image
									src={
										selectedSeries.coverSrc || selectedSeason.coverSrc
									}
									alt="Poster"
									isRelative={true}
									errorSrc="./src/resources/img/fileNotFound.jpg"
								/>
							) : (
								<Image
									src={
										selectedSeason.coverSrc || selectedSeries.coverSrc
									}
									alt="Poster"
									isRelative={true}
									errorSrc="./src/resources/img/fileNotFound.jpg"
								/>
							)}
							{selectedLibrary.type === "Shows" &&
							continueWatchingInfo ? (
								<div className="continue-watching-info">
									{continueWatchingInfo()}
								</div>
							) : selectedSeries.seasons &&
							  selectedSeries.seasons.length > 1 ? (
								<button
									className="show-poster-button"
									onClick={changePoster}
								>
									<span>
										{showCollectionPoster
											? t("seasonPoster")
											: t("collectionPoster")}
									</span>
								</button>
							) : null}
						</div>
						<section className="season-info">
							{selectedLibrary.type == "Shows" &&
							selectedSeries.seasons &&
							selectedSeries.seasons.length > 1 ? (
								<span id="seasonTitle">{selectedSeason.name}</span>
							) : null}
							<section className="season-info-text">
								{selectedSeason.directedBy &&
								selectedSeason.directedBy.length !== 0 ? (
									<span id="directedBy">
										{t("directedBy") +
											" " +
											selectedSeason.directedBy || ""}
									</span>
								) : (
									<span></span>
								)}
								<span id="date">
									{new Date(selectedSeason.year).getFullYear() ||
										new Date(selectedSeries.year).getFullYear() ||
										null}
								</span>
								<span id="genres">
									{selectedLibrary.type !== "Shows"
										? selectedSeason.genres &&
										  selectedSeason.genres.length > 0
											? selectedSeason.genres.join(", ") || ""
											: ""
										: selectedSeries.genres
										? selectedSeries.genres.join(", ") || ""
										: ""}
								</span>
							</section>
							<div className="rating-info">
								<img
									src="./src/assets/svg/themoviedb.svg"
									alt="TheMovieDB logo"
								/>
								<span id="rating">
									{(selectedLibrary.type === "Shows"
										? selectedSeries.score.toFixed(2)
										: selectedSeason.score.toFixed(2)) || "N/A"}
								</span>
							</div>
							<section className="season-info-buttons-container">
								<button className="play-button-desktop">
									<PlayIcon />
									<span id="playText">{t("playButton")}</span>
								</button>
								<button
									className="svg-button-desktop"
									title={selectedSeason.watched ? t("markUnwatched") : t("markWatched")}
									onClick={() => dispatch(setSeasonWatched({
										libraryId: selectedLibrary.id,
										seriesId: selectedSeries.id,
										seasonId: selectedSeason.id,
										watched: !selectedSeason.watched
									}))}
								>
									{selectedSeason.watched ? (
										<UnmarkWatchedIcon />
									) : (
										<MarkWatchedIcon />
									)}
								</button>
								<button
									className="svg-button-desktop"
									title={t("editButton")}
									onClick={() => dispatch(toggleSeasonWindow())}
								>
									<EditIcon />
								</button>
								<button
									className="svg-button-desktop"
									onClick={(e) => {
										dispatch(toggleSeasonMenu());
										if (!seasonMenuOpen) cm.current?.show(e);
									}}
								>
									<HorizontalDotsIcon />
								</button>
								<ContextMenu
									model={[
										...(selectedLibrary?.type !== "Shows"
											? [
													{
														label: t("correctIdentification"),
														command: () =>
															dispatch(toggleSeasonMenu()),
													},
											  ]
											: []),
										{
											label: t("updateMetadata"),
											command: () => dispatch(toggleSeasonMenu()),
										},
										{
											label: t("removeButton"),
											command: () => dispatch(toggleSeasonMenu()),
										},
									]}
									ref={cm}
									className="dropdown-menu"
								/>
							</section>
							<div className="overview-container clamp-text">
								<span>
									{selectedSeason.overview ||
										selectedSeries.overview ||
										t("defaultOverview")}
								</span>
							</div>
							<button className="clamp-text-action">
								<div aria-hidden="true" className="clamp-text-more">
									<span>
										{t("moreButton")}
										<DownArrowIcon />
									</span>
								</div>
								<div aria-hidden="true" className="clamp-text-less">
									<span>
										{t("lessButton")}
										<UpArrowIcon />
									</span>
								</div>
							</button>
						</section>
					</div>
					{selectedSeries.seasons && selectedSeries.seasons.length > 1 ? (
						<section className="dropdown" style={{ marginLeft: "30px" }}>
							<div
								className="select season-selector"
								onClick={(e) => {
									if (!isContextMenuShown) dispatch(closeAllMenus());

									toggleMenu();
									if (!isContextMenuShown) cm3.current?.show(e);
								}}
								onAuxClick={() => {
									dispatch(closeAllMenus());
								}}
							>
								<span className="selected">{selectedSeason.name}</span>
								<div
									className={`arrow ${
										isContextMenuShown ? " arrow-rotate" : ""
									}`}
								></div>
							</div>
							<ContextMenu
								model={[
									...[...selectedSeries.seasons]
										.sort((a, b) => {
											if (a.order !== 0 && b.order !== 0) {
												return a.order - b.order;
											}
											if (a.order === 0 && b.order === 0) {
												return (
													new Date(a.year).getTime() -
													new Date(b.year).getTime()
												);
											}
											return a.order === 0 ? 1 : -1;
										})
										.map((season: SeasonData) => ({
											label: season.name,
											command: () => {
												toggleMenu();
												handleSeasonSelection(season);
											},
										})),
								]}
								ref={cm3}
								className="dropdown-menu"
							/>
						</section>
					) : null}
					<EpisodeList />
				</div>
			)}
		</Suspense>
	);
}

export default DetailsSection;
