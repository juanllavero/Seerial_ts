import ResolvedImage from "@components/image/Image";
import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";
import { closeContextMenu, toggleSeriesMenu } from "@redux/slices/contextMenuSlice";
import { selectSeason, selectSeries, showMenu, showSeriesMenu, toggleSeriesWindow } from "@redux/slices/dataSlice";
import { RootState } from "@redux/store";
import { ContextMenu } from "primereact/contextmenu";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";

function CollectionsList() {
  const { t } = useTranslation();

  const dispatch = useDispatch();

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

  const handleSeriesSelection = (series: SeriesData) => {
		dispatch(selectSeries(series));

		if (series.seasons && series.seasons.length > 0)
			handleSeasonSelection(series.seasons[0]);
	};

  const handleSeasonSelection = (season: SeasonData) => {
		dispatch(selectSeason(season));
		dispatch(closeContextMenu());
	};
  
	return (
		<div className="series-container scroll" id="scroll">
			{selectedLibrary && selectedLibrary.series.map((series: SeriesData) => (
				<div
					className="episode-box"
					key={series.id}
					style={{ maxWidth: `${seriesImageWidth}px` }}
				>
					<div
						style={{ cursor: "pointer" }}
						onMouseEnter={() => {
							dispatch(showMenu(true));

							if (!seriesMenuOpen) dispatch(showSeriesMenu(series));
						}}
						onMouseLeave={() => {
							dispatch(showMenu(false));
						}}
						onAuxClick={(e) => {
							if (seriesMenu && series === seriesMenu) {
								dispatch(toggleSeriesMenu());
								cm.current?.show(e);
							}
						}}
					>
						<div className="video-button-image-section">
							<div
								className={`loading-element-hover ${
									series.analyzingFiles ? "loading-visible" : ""
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
									onClick={() => handleSeriesSelection(series)}
								></div>
								<div className="bottom-btns">
									<button
										className="svg-button-desktop-transparent"
										onClick={() => dispatch(toggleSeriesWindow())}
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
								{series.coverSrc !== "" ? (
									<ResolvedImage
										src={series.coverSrc}
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
								) : series.seasons &&
								  series.seasons.length > 0 &&
								  series.seasons[0].coverSrc !== "" ? (
									<ResolvedImage
										src={series.seasons[0].coverSrc}
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
						title={series.name}
						onClick={() => handleSeriesSelection(series)}
					>
						{series.name}
					</a>
					{series.seasons && series.seasons.length > 1 ? (
						<span id="episodeNumber">
							{(() => {
								const minYear = Math.min(
									...series.seasons.map((season: SeasonData) =>
										Number.parseInt(season.year)
									)
								);
								const maxYear = Math.max(
									...series.seasons.map((season: SeasonData) =>
										Number.parseInt(season.year)
									)
								);
								return minYear === maxYear
									? `${minYear}`
									: `${minYear} - ${maxYear}`;
							})()}
						</span>
					) : series.seasons && series.seasons.length > 0 ? (
						<span id="episodeNumber">
							{new Date(series.seasons[0].year).getFullYear()}
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
							...(selectedLibrary?.type === "Shows" ||
							!series?.isCollection
								? [
										{
											label: t("correctIdentification"),
											command: () => dispatch(toggleSeriesMenu()),
										},
								  ]
								: []),
							...(selectedLibrary?.type === "Shows"
								? [
										{
											label: t("changeEpisodesGroup"),
											command: () => dispatch(toggleSeriesMenu()),
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
			))}
		</div>
	);
}

export default CollectionsList;
