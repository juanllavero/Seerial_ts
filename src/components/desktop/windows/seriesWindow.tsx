import { WindowSections } from "@data/enums/Sections";
import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import { useTranslation } from "react-i18next";
import { toggleSeriesWindow, updateSeries } from "redux/slices/dataSlice";
import Loading from "@components/utils/Loading";
import DialogHeader from "./utils/DialogHeader";
import DialogSectionButton from "./utils/DialogSectionButton";
import DialogInput from "./utils/DialogInput";
import DialogTextArea from "./utils/DialogTextArea";
import DialogTags from "./utils/DialogTags";
import DialogFooter from "./utils/DialogFooter";
import { useDownloadContext } from "context/download.context";

function SeriesWindow() {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { downloadingContent } = useDownloadContext();

	const menuSection = useSelector(
		(state: RootState) => state.sectionState.menuSection
	);
	const seriesMenuOpen = useSelector(
		(state: RootState) => state.data.seriesWindowOpen
	);
	const library = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const series = useSelector((state: RootState) => state.data.seriesMenu);

	const [pasteUrl, setPasteUrl] = useState<boolean>(false);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [imageDownloaded, setImageDownloaded] = useState<boolean>(false);

	const [logos, setLogos] = useState<string[]>([]);
	const [posters, setPosters] = useState<string[]>([]);
	const [selectedLogo, selectLogo] = useState<string | undefined>(undefined);
	const [selectedPoster, selectPoster] = useState<string | undefined>(
		undefined
	);

	const [nameLock, setNameLock] = useState<boolean>(false);
	const [yearLock, setYearLock] = useState<boolean>(false);
	const [overviewLock, setOverviewLock] = useState<boolean>(false);
	const [taglineLock, setTaglineLock] = useState<boolean>(false);

	const [genresLock, setGenresLock] = useState<boolean>(false);
	const [studiosLock, setStudiosLock] = useState<boolean>(false);
	const [creatorLock, setCreatorLock] = useState<boolean>(false);
	const [musicLock, setMusicLock] = useState<boolean>(false);

	const [name, setName] = useState<string>("");
	const [year, setYear] = useState<string>("");
	const [overview, setOverview] = useState<string>("");
	const [tagline, setTagline] = useState<string>("");

	const [genres, setGenres] = useState<string[]>([]);
	const [studios, setStudios] = useState<string[]>([]);
	const [creator, setCreator] = useState<string[]>([]);
	const [music, setMusic] = useState<string[]>([]);

	useEffect(() => {
		const fetchLogos = async () => {
			setPasteUrl(false);

			const logoPath = await window.electronAPI.getExternalPath(
				"resources/img/logos/" + series?.id + "/"
			);
			if (logoPath) {
				const images = await window.electronAPI.getImages(logoPath);
				setLogos(images);
			}

			if (series?.logoSrc) selectLogo(series?.logoSrc.split("/").pop());
		};

		const fetchPosters = async () => {
			console.log(series);
			const posterPath = await window.electronAPI.getExternalPath(
				"resources/img/posters/" + series?.id + "/"
			);
			if (posterPath) {
				const images = await window.electronAPI.getImages(posterPath);
				setPosters(images);
			}

			if (series?.coverSrc) selectPoster(series?.coverSrc.split("/").pop());
		};

		if (menuSection === WindowSections.Logos && series) {
			fetchLogos().then(() => setImageDownloaded(false));
		} else if (menuSection === WindowSections.Posters && series) {
			fetchPosters().then(() => setImageDownloaded(false));
		}
	}, [menuSection, imageDownloaded]);

	useEffect(() => {
		if (seriesMenuOpen && series) {
			let noImages: string[] = [];
			setPosters(noImages);
			setLogos(noImages);
			dispatch(changeMenuSection(WindowSections.General));

			if (library?.type === "Shows") {
				setYear(series.year || "");
				setGenres(series.genres || []);
				setStudios(series.productionStudios || []);
				setCreator(series.creator || []);
				setMusic(series.musicComposer || []);
				setTagline(series.tagline || "");

				setYearLock(series.yearLock || false);
				setStudiosLock(series.taglineLock || false);
				setTaglineLock(series.studioLock || false);
				setCreatorLock(series.creatorLock || false);
				setMusicLock(series.musicLock || false);
				setGenresLock(series.genresLock || false);
			}

			setName(series.name || "");
			setOverview(series.overview || "");

			setNameLock(series.nameLock || false);
			setOverviewLock(series.overviewLock || false);
		}
	}, [seriesMenuOpen]);

	useEffect(() => {
		window.ipcRenderer.on("download-complete", (_event, _message) => {
			setImageDownloaded(true);
		});

		window.ipcRenderer.on("download-error", (_event, message) => {
			alert(`Error: ${message}`);
		});
	}, []);

	const handleSavingChanges = () => {
		if (library && series) {
			dispatch(
				updateSeries({
					libraryId: library.id,
					series: {
						id: series.id,
						name: nameLock ? name : series.name,
						year: yearLock ? year : series.year,
						overview: overviewLock ? overview : series.overview,
						tagline: taglineLock ? tagline : series.tagline,
						genres: genresLock ? genres : series.genres,
						productionStudios: studiosLock
							? studios
							: series.productionStudios,
						creator: creatorLock ? creator : series.creator,
						musicComposer: musicLock ? music : series.musicComposer,
						logoSrc: selectedLogo
							? "resources/img/logos/" + series.id + "/" + selectedLogo
							: series.logoSrc,
						coverSrc: selectedPoster
							? "resources/img/posters/" +
							  series.id +
							  "/" +
							  selectedPoster
							: series.coverSrc,

						nameLock: nameLock ?? series.nameLock,
						yearLock: yearLock ?? series.yearLock,
						overviewLock: overviewLock ?? series.overviewLock,
						taglineLock: taglineLock ?? series.taglineLock,
						genresLock: genresLock ?? series.genresLock,
						studioLock: studiosLock ?? series.studioLock,
						creatorLock: creatorLock ?? series.creatorLock,
						musicLock: musicLock ?? series.musicLock,

						score: series.score,
						themdbID: series.themdbID,
						isCollection: series.isCollection,
						order: series.order,
						numberOfSeasons: series.numberOfSeasons,
						numberOfEpisodes: series.numberOfEpisodes,
						folder: series.folder,
						videoZoom: series.videoZoom,
						episodeGroupID: series.episodeGroupID,
						seasons: series.seasons,
						playSameMusic: series.playSameMusic,
						analyzingFiles: series.analyzingFiles,
						currentlyWatchingSeason: series.currentlyWatchingSeason,
						cast: series.cast,
						logosUrls: series.logosUrls,
						coversUrls: series.coversUrls,
					},
				})
			);
		}

		dispatch(toggleSeriesWindow());
	};

	const handleDownload = () => {
		setPasteUrl(false);
		window.ipcRenderer.send(
			"download-image-url",
			imageUrl,
			"resources/img/posters/" + series?.id + "/"
		);
	};

	return (
		<Suspense fallback={<Loading />}>
			<section
				className={`dialog ${seriesMenuOpen ? " dialog-active" : ""}`}
			>
				<div
					className="dialog-background"
					onClick={() => dispatch(toggleSeriesWindow())}
				></div>
				<div className="dialog-box">
					<DialogHeader
						title={t("editButton") + ": " + series?.name}
						onClose={() => dispatch(toggleSeriesWindow())}
					/>
					<section className="dialog-center">
						<div className="dialog-center-left">
							<DialogSectionButton
								title={t("generalButton")}
								section={WindowSections.General}
							/>
							{library?.type === "Shows" ? (
								<>
									<DialogSectionButton
										title={t("tags")}
										section={WindowSections.Tags}
									/>
									<DialogSectionButton
										title={t("logosButton")}
										section={WindowSections.Logos}
									/>
									<DialogSectionButton
										title={t("postersButton")}
										section={WindowSections.Posters}
									/>
								</>
							) : series?.isCollection ? (
								<DialogSectionButton
									title={t("postersButton")}
									section={WindowSections.Posters}
								/>
							) : null}
						</div>
						<div className="dialog-center-right scroll">
							{menuSection === WindowSections.General ? (
								library?.type === "Shows" ? (
									<>
										<DialogInput
											type="text"
											title={t("name")}
											value={name}
											setValue={setName}
											lock={nameLock}
											setLock={setNameLock}
										/>
										<DialogInput
											type="text"
											title={t("year")}
											value={year}
											setValue={setYear}
											lock={yearLock}
											setLock={setYearLock}
										/>
										<DialogInput
											type="text"
											title={t("tagline")}
											value={tagline}
											setValue={setTagline}
											lock={taglineLock}
											setLock={setTaglineLock}
										/>
										<DialogTextArea
											title={t("overview")}
											value={overview}
											setValue={setOverview}
											lock={overviewLock}
											setLock={setOverviewLock}
										/>
									</>
								) : (
									<>
										<DialogInput
											type="text"
											title={t("name")}
											value={name}
											setValue={setName}
											lock={nameLock}
											setLock={setNameLock}
										/>
									</>
								)
							) : menuSection === WindowSections.Details ? (
								<>
									<DialogTags
										title={t("genres")}
										value={genres}
										setValue={setGenres}
										lock={genresLock}
										setLock={setGenresLock}
									/>
									<DialogTags
										title={t("studios")}
										value={studios}
										setValue={setStudios}
										lock={studiosLock}
										setLock={setStudiosLock}
									/>
									<DialogTags
										title={t("createdBy")}
										value={creator}
										setValue={setCreator}
										lock={creatorLock}
										setLock={setCreatorLock}
									/>
									<DialogTags
										title={t("musicBy")}
										value={music}
										setValue={setMusic}
										lock={musicLock}
										setLock={setMusicLock}
									/>
								</>
							) : menuSection === WindowSections.Logos ? (
								<>
									{pasteUrl ? (
										<div className="horizontal-center-align">
											<div className="dialog-input-box">
												<input
													type="text"
													placeholder={t("urlText")}
													onChange={(e) => {
														setImageUrl(e.target.value);
													}}
												/>
											</div>
											<button
												className="desktop-dialog-btn"
												onClick={() => setPasteUrl(false)}
											>
												{t("cancelButton")}
											</button>
											<button
												className="desktop-dialog-btn"
												onClick={handleDownload}
											>
												{t("loadButton")}
											</button>
										</div>
									) : (
										<div className="horizontal-center-align">
											<button
												className="desktop-dialog-btn"
												onClick={() => setPasteUrl(false)}
											>
												{t("selectImage")}
											</button>
											<button
												className="desktop-dialog-btn"
												onClick={() => setPasteUrl(true)}
											>
												{t("fromURLButton")}
											</button>
										</div>
									)}

									<div className="dialog-images-scroll">
										{logos.map((image, index) => (
											<div
												key={image}
												className={`dialog-image-btn ${
													image.split("\\").pop() === selectedLogo
														? " dialog-image-btn-active"
														: ""
												}`}
												onClick={() =>
													selectLogo(image.split("\\").pop())
												}
											>
												<img
													src={`file://${image}`}
													alt={`img-${index}`}
													style={{ width: 290 }}
												/>
												{image.split("\\").pop() ===
												selectedLogo ? (
													<>
														<div className="triangle-tick"></div>
														<svg
															aria-hidden="true"
															height="24"
															viewBox="0 0 48 48"
															width="24"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																clipRule="evenodd"
																d="M4 24.7518L18.6461 39.4008L44 14.0497L38.9502 9L18.6461 29.3069L9.04416 19.7076L4 24.7518Z"
																fill="#EEEEEE"
																fillRule="evenodd"
															></path>
														</svg>
													</>
												) : null}
											</div>
										))}
									</div>
								</>
							) : menuSection === WindowSections.Posters ? (
								<>
									{pasteUrl ? (
										<div className="horizontal-center-align">
											<div className="dialog-input-box">
												<input
													type="text"
													placeholder={t("urlText")}
													onChange={(e) => {
														setImageUrl(e.target.value);
													}}
												/>
											</div>
											<button
												className="desktop-dialog-btn"
												onClick={() => setPasteUrl(false)}
											>
												{t("cancelButton")}
											</button>
											<button
												className="desktop-dialog-btn"
												onClick={handleDownload}
											>
												{t("loadButton")}
											</button>
										</div>
									) : (
										<div className="horizontal-center-align">
											<button
												className="desktop-dialog-btn"
												onClick={() => setPasteUrl(false)}
											>
												{t("selectImage")}
											</button>
											<button
												className="desktop-dialog-btn"
												onClick={() => setPasteUrl(true)}
											>
												{t("fromURLButton")}
											</button>
										</div>
									)}

									<div className="dialog-images-scroll">
										{posters.map((image, index) => (
											<div
												key={image}
												className={`dialog-image-btn ${
													image.split("\\").pop() ===
													selectedPoster
														? " dialog-image-btn-active"
														: ""
												}`}
												onClick={() =>
													selectPoster(image.split("\\").pop())
												}
											>
												<img
													src={`file://${image}`}
													alt={`img-${index}`}
													style={{ width: 185 }}
												/>
												{image.split("\\").pop() ===
												selectedPoster ? (
													<>
														<div className="triangle-tick"></div>
														<svg
															aria-hidden="true"
															height="24"
															viewBox="0 0 48 48"
															width="24"
															xmlns="http://www.w3.org/2000/svg"
														>
															<path
																clipRule="evenodd"
																d="M4 24.7518L18.6461 39.4008L44 14.0497L38.9502 9L18.6461 29.3069L9.04416 19.7076L4 24.7518Z"
																fill="#EEEEEE"
																fillRule="evenodd"
															></path>
														</svg>
													</>
												) : null}
											</div>
										))}
									</div>
								</>
							) : null}
						</div>
					</section>
					<DialogFooter
						downloadingContent={downloadingContent}
						handleSavingChanges={handleSavingChanges}
						action={() => dispatch(toggleSeriesWindow())}
					/>
				</div>
			</section>
		</Suspense>
	);
}

export default SeriesWindow;
