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
import DialogDownloading from "./utils/DialogDownloading";
import ImagesList from "./utils/ImagesList";

function SeriesWindow() {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { downloadingContent, setDownloadingContent } = useDownloadContext();

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

	const [imageDownloaded, setImageDownloaded] = useState<boolean>(false);

	const [logos, setLogos] = useState<string[]>([]);
	const [posters, setPosters] = useState<string[]>([]);
	const [selectedLogo, selectLogo] = useState<string | undefined>(undefined);
	const [selectedPoster, selectPoster] = useState<string | undefined>(
		undefined
	);

	const [logosUrls, setLogosUrls] = useState<string[]>([]);
	const [coversUrls, setCoversUrls] = useState<string[]>([]);

	//#region ATTRIBUTES
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
	//#endregion

	// Fetch images
	useEffect(() => {
		const fetchLogos = async () => {
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
	}, [menuSection, imageDownloaded, series]);

	// Initialize attributes
	useEffect(() => {
		if (seriesMenuOpen && series) {
			let noImages: string[] = [];
			setPosters(noImages);
			setLogos(noImages);
			setLogosUrls(series.logosUrls);
			setCoversUrls(series.coversUrls);
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

	const downloadUrlImage = async (url: string, downloadPath: string) => {
		return await window.ipcRenderer.invoke(
			"download-image-url",
			url,
			downloadPath
		);
	};

	const handleDownloadUrls = async (): Promise<boolean> => {
		if (!series) return false;

		if (selectedLogo && logosUrls && logosUrls.includes(selectedLogo)) {
			await downloadUrlImage(
				selectedLogo,
				"resources/img/logos/" + series.id + "/"
			);
		}

		if (selectedPoster && coversUrls && coversUrls.includes(selectedPoster)) {
			await downloadUrlImage(
				selectedPoster,
				"resources/img/posters/" + series.id + "/"
			);
		}

		return true;
	};

	const handleSavingChanges = async () => {
		setDownloadingContent(true);

		if (library && series) {
			await handleDownloadUrls();

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
							? selectedLogo.startsWith("http")
								? "resources/img/logos/" +
								  series.id +
								  "/" +
								  selectedLogo.split("/").pop()
								: "resources/img/logos/" +
								  series.id +
								  "/" +
								  selectedLogo
							: series.logoSrc,
						coverSrc: selectedPoster
							? selectedPoster.startsWith("http")
								? "resources/img/posters/" +
								  series.id +
								  "/" +
								  selectedPoster.split("/").pop()
								: "resources/img/posters/" +
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
						watched: series.watched,
					},
				})
			);
		}

		setDownloadingContent(false);
		dispatch(toggleSeriesWindow());
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
					<DialogDownloading downloadingContent={downloadingContent} />
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
								) : library?.type === "Movies" ? (
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
							) : menuSection === WindowSections.Tags ? (
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
								<ImagesList
									images={logos}
									imageWidth={290}
									imagesUrls={logosUrls}
									setImagesUrls={setLogosUrls}
									downloadPath={`resources/img/logos/${series?.id}/`}
									selectedImage={selectedLogo}
									selectImage={selectLogo}
									setImageDownloaded={setImageDownloaded}
								/>
							) : menuSection === WindowSections.Posters ? (
								<ImagesList
									images={posters}
									imageWidth={185}
									imagesUrls={coversUrls}
									setImagesUrls={setCoversUrls}
									downloadPath={`resources/img/posters/${series?.id}/`}
									selectedImage={selectedPoster}
									selectImage={selectPoster}
									setImageDownloaded={setImageDownloaded}
								/>
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
