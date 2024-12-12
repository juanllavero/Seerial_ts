import { WindowSections } from "@data/enums/Sections";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import { useTranslation } from "react-i18next";
import { toggleSeasonWindow, updateSeason } from "redux/slices/dataSlice";
import ReactPlayer from "react-player";
import Image from "@components/image/Image";
import VideoAudioDownloader from "../downloaders/VideoAudioDownloader";
import { useDownloadContext } from "context/download.context";
import DialogHeader from "./utils/DialogHeader";
import {
	DownloadIcon,
	LinkIcon,
	RemoveIcon,
	UploadIcon,
} from "@components/utils/IconLibrary";
import ImagesList from "./utils/ImagesList";
import DialogInput from "./utils/DialogInput";
import DialogTags from "./utils/DialogTags";
import DialogTextArea from "./utils/DialogTextArea";
import DialogSectionButton from "./utils/DialogSectionButton";
import DialogFooter from "./utils/DialogFooter";
import DialogDownloading from "./utils/DialogDownloading";

function SeasonWindow() {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const {
		videoContent,
		setVideoContent,
		showWindow,
		setShowWindow,
		downloadingContent,
		setDownloadingContent,
	} = useDownloadContext();

	const menuSection = useSelector(
		(state: RootState) => state.sectionState.menuSection
	);
	const seasonMenuOpen = useSelector(
		(state: RootState) => state.data.seasonWindowOpen
	);
	const library = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const series = useSelector((state: RootState) => state.data.selectedSeries);
	const season = useSelector((state: RootState) => state.data.selectedSeason);

	const [resolution, setResolution] = useState({ width: 0, height: 0 });

	const [pasteUrl, setPasteUrl] = useState<boolean>(false);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [selectedBackground, setSelectedBackground] = useState<string>("");
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
	const [orderLock, setOrderLock] = useState<boolean>(false);
	const [yearLock, setYearLock] = useState<boolean>(false);
	const [overviewLock, setOverviewLock] = useState<boolean>(false);
	const [taglineLock, setTaglineLock] = useState<boolean>(false);
	const [studiosLock, setStudiosLock] = useState<boolean>(false);
	const [genresLock, setGenresLock] = useState<boolean>(false);
	const [creatorLock, setCreatorLock] = useState<boolean>(false);
	const [musicLock, setMusicLock] = useState<boolean>(false);
	const [directedByLock, setDirectedByLock] = useState<boolean>(false);
	const [writtenByLock, setWrittenByLock] = useState<boolean>(false);

	const [name, setName] = useState<string>("");
	const [order, setOrder] = useState<number>(0);
	const [year, setYear] = useState<string>("");
	const [overview, setOverview] = useState<string>("");
	const [tagline, setTagline] = useState<string>("");
	const [studios, setStudios] = useState<string[]>([""]);
	const [genres, setGenres] = useState<string[]>([""]);
	const [creator, setCreator] = useState<string[]>([""]);
	const [music, setMusic] = useState<string[]>([""]);
	const [directedBy, setDirectedBy] = useState<string[]>([""]);
	const [writtenBy, setWrittenBy] = useState<string[]>([""]);
	const [videoSrc, setVideoSrc] = useState<string>("");
	const [musicSrc, setMusicSrc] = useState<string>("");
	const [extVideoSrc, setExtVideoSrc] = useState<string>("");
	const [extMusicSrc, setExtMusicSrc] = useState<string>("");
	//#endregion

	// Fetch images
	useEffect(() => {
		const fetchLogos = async () => {
			setPasteUrl(false);

			if (!season) return;

			const logoPath = await window.electronAPI.getExternalPath(
				"resources/img/logos/" + season.id + "/"
			);
			if (logoPath) {
				const images = await window.electronAPI.getImages(logoPath);
				setLogos(images);
			}

			if (season.logoSrc) selectLogo(season.logoSrc.split("/").pop());
		};

		const fetchPosters = async () => {
			if (!season) return;

			const posterPath = await window.electronAPI.getExternalPath(
				"resources/img/posters/" + season?.id + "/"
			);
			if (posterPath) {
				const images = await window.electronAPI.getImages(posterPath);
				setPosters(images);
			}

			if (season.coverSrc) selectPoster(season.coverSrc.split("/").pop());
		};

		if (menuSection === WindowSections.Logos && season) {
			fetchLogos().then(() => setImageDownloaded(false));
		} else if (menuSection === WindowSections.Posters && season) {
			fetchPosters().then(() => setImageDownloaded(false));
		}
	}, [menuSection, imageDownloaded, season]);

	// Initialize attributes
	useEffect(() => {
		if (seasonMenuOpen && season) {
			let noImages: string[] = [];
			setSelectedBackground("");
			setPosters(noImages);
			setLogos(noImages);
			setLogosUrls(season.logosUrls);
			setCoversUrls(season.coversUrls);
			dispatch(changeMenuSection(WindowSections.General));

			setName(season.name || "");
			setOrder(season.order || 0);
			setYear(season.year || "");
			setOverview(season.overview || "");
			setNameLock(season.nameLock || false);
			setOrderLock(season.orderLock || false);
			setYearLock(season.yearLock || false);
			setOverviewLock(season.overviewLock || false);
			setVideoSrc(season.videoSrc || "");
			setMusicSrc(season.musicSrc || "");

			setTagline(season.tagline || "");
			setTaglineLock(season.taglineLock || false);
			setStudiosLock(season.studioLock || false);
			setGenresLock(season.genresLock || false);
			setCreatorLock(season.creatorLock || false);
			setMusicLock(season.musicLock || false);
			setDirectedByLock(season.directedLock || false);
			setWrittenByLock(season.writtenLock || false);
			setStudios(season.productionStudios || []);
			setGenres(season.genres || []);
			setMusic(season.musicComposer || []);
			setCreator(season.creator || []);
			setDirectedBy(season.directedBy || []);
			setWrittenBy(season.writtenBy || []);
		}
	}, [seasonMenuOpen]);

	//#region MUSIC AND VIDEO DOWNLOAD
	const fetchResolvedPath = async (src: string, isVideo: boolean) => {
		let absolutePath = await window.electronAPI.getExternalPath(src);

		if (isVideo) setExtVideoSrc(absolutePath);
		else setExtMusicSrc(absolutePath);
	};

	useEffect(() => {
		if (seasonMenuOpen && season && !showWindow) {
			if (videoContent) {
				setVideoSrc("resources/video/" + season.id + ".webm");
				fetchResolvedPath("resources/video/" + season.id + ".webm", true);
			} else {
				setMusicSrc("resources/music/" + season.id + ".opus");
				fetchResolvedPath("resources/music/" + season.id + ".opus", false);
			}
		}
	}, [seasonMenuOpen, showWindow, season]);
	//#endregion

	useEffect(() => {
		window.ipcRenderer.on("download-complete", (_event, _message) => {
			setImageDownloaded(true);
		});

		window.ipcRenderer.on("download-error", (_event, message) => {
			console.error(`Error: ${message}`);
		});
	}, []);

	const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const img = e.currentTarget;
		setResolution({
			width: img.naturalWidth,
			height: img.naturalHeight,
		});
	};

	const downloadUrlImage = async (url: string, downloadPath: string) => {
		setPasteUrl(false);
		return await window.ipcRenderer.invoke(
			"download-image-url",
			url,
			downloadPath
		);
	};

	const handleBackgroundImageDownload = async () => {
		if (!season || !imageUrl) return;

		// Download image in cache folder
		await downloadUrlImage(imageUrl, "resources/img/DownloadCache/");

		// Check if the downloaded image exists
		if (
			await window.ipcRenderer.invoke(
				"file-exists",
				await window.ipcRenderer.invoke(
					"get-external-path",
					"resources/img/DownloadCache/" + imageUrl.split("/").pop()
				)
			)
		) {
			setSelectedBackground(
				"resources/img/DownloadCache/" + imageUrl.split("/").pop()
			);
		}
	};

	const handleDownloadUrls = async (): Promise<boolean> => {
		if (!season) return false;

		if (selectedLogo && logosUrls && logosUrls.includes(selectedLogo)) {
			await downloadUrlImage(
				selectedLogo,
				"resources/img/logos/" + season.id + "/"
			);
		}

		if (selectedPoster && logosUrls && coversUrls.includes(selectedPoster)) {
			await downloadUrlImage(
				selectedPoster,
				"resources/img/posters/" + season.id + "/"
			);
		}

		return true;
	};

	const handleBackgroundSave = async (src: string) => {
		if (!season) return;

		await window.ipcRenderer.invoke("save-background", season.id, src);
	};

	const handleUploadBackground = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = () => {
			const file = input.files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = async () => {
					const originalPath = file.path;
					const destPath = "resources/img/DownloadCache/" + file.name;

					setDownloadingContent(true);
					window.ipcRenderer
						.invoke("copy-image-file", originalPath, destPath)
						.then(() => {
							setImageDownloaded(true);
							setDownloadingContent(false);
							setSelectedBackground(destPath);
						})
						.catch((_e) => {
							setDownloadingContent(false);
						});
				};
				reader.readAsDataURL(file);
			}
		};
		input.click();
	};

	const handleSavingChanges = async () => {
		setDownloadingContent(true);

		if (season) {
			if (library?.type !== "Music") {
				await handleDownloadUrls();
			}

			if (selectedBackground !== "") {
				await handleBackgroundSave(selectedBackground);
			}

			dispatch(
				updateSeason({
					name: name,
					overview: overview,
					year: year,
					order: order,
					id: season.id,
					tagline: library?.type === "Movies" ? tagline : season.tagline,
					score: season.score,
					seasonNumber: season.seasonNumber,
					logoSrc: selectedLogo
						? selectedLogo.startsWith("http")
							? "resources/img/logos/" +
							  season.id +
							  "/" +
							  selectedLogo.split("/").pop()
							: "resources/img/logos/" + season.id + "/" + selectedLogo
						: season.logoSrc,
					coverSrc: selectedPoster
						? selectedPoster.startsWith("http")
							? "resources/img/posters/" +
							  season.id +
							  "/" +
							  selectedPoster.split("/").pop()
							: "resources/img/posters/" +
							  season.id +
							  "/" +
							  selectedPoster
						: season.coverSrc,
					backgroundSrc:
						selectedBackground !== ""
							? `resources/img/backgrounds/${
									season.id
							  }/background.jpg?t=${Date.now()}`
							: season.backgroundSrc,
					videoSrc: videoSrc ? videoSrc : season.videoSrc,
					musicSrc: musicSrc ? musicSrc : season.musicSrc,
					seriesID: season.seriesID,
					themdbID: season.themdbID,
					imdbID: season.imdbID,
					lastDisc: season.lastDisc,
					folder: season.folder,
					showName: season.showName,
					audioTrackLanguage: season.audioTrackLanguage,
					selectedAudioTrack: season.selectedAudioTrack,
					subtitleTrackLanguage: season.subtitleTrackLanguage,
					selectedSubtitleTrack: season.selectedSubtitleTrack,
					episodes: season.episodes,
					genres: season.genres,
					currentlyWatchingEpisode: season.currentlyWatchingEpisode,
					cast: season.cast,
					creator: season.creator,
					musicComposer: season.musicComposer,
					directedBy: season.directedBy,
					writtenBy: season.writtenBy,
					productionStudios:
						library?.type === "Movies"
							? studios
							: season.productionStudios,
					nameLock: season.nameLock,
					orderLock: orderLock,
					overviewLock: season.overviewLock,
					yearLock: season.yearLock,
					studioLock: season.studioLock,
					taglineLock: season.taglineLock,
					creatorLock: false,
					musicLock: false,
					directedLock: false,
					writtenLock: false,
					genresLock: false,
					logosUrls: season.logosUrls,
					coversUrls: season.coversUrls,
					watched: season.watched,
				})
			);
		}

		setDownloadingContent(false);
		dispatch(toggleSeasonWindow());
	};

	return (
		<>
			{showWindow && <VideoAudioDownloader />}
			<section
				className={`dialog ${seasonMenuOpen ? " dialog-active" : ""}`}
			>
				<div
					className="dialog-background"
					onClick={() => {
						if (!downloadingContent) {
							dispatch(toggleSeasonWindow());
						}
					}}
				></div>
				<div className="dialog-box">
					<DialogDownloading downloadingContent={downloadingContent} />
					<DialogHeader
						title={
							t("editButton") +
							": " +
							(library?.type === "Shows"
								? series?.name + " - " + season?.name
								: season?.name)
						}
						onClose={() => dispatch(toggleSeasonWindow())}
					/>
					<section className="dialog-center">
						<div className="dialog-center-left">
							<DialogSectionButton
								title={t("generalButton")}
								section={WindowSections.General}
							/>
							{library?.type === "Movies" ? (
								<DialogSectionButton
									title={t("tags")}
									section={WindowSections.Tags}
								/>
							) : null}
							{library?.type !== "Music" && (
								<DialogSectionButton
									title={t("media")}
									section={WindowSections.Details}
								/>
							)}
							{library?.type === "Movies" && (
								<>
									<DialogSectionButton
										title={t("logosButton")}
										section={WindowSections.Logos}
									/>
								</>
							)}
							{library?.type !== "Shows" && (
								<DialogSectionButton
									title={t("postersButton")}
									section={WindowSections.Posters}
								/>
							)}
						</div>
						<div className="dialog-center-right scroll">
							{menuSection === WindowSections.General ? (
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
										type="number"
										title={t("sortingOrder")}
										value={order}
										setValue={setOrder}
										lock={orderLock}
										setLock={setOrderLock}
									/>
									<DialogInput
										type="text"
										title={t("year")}
										value={year}
										setValue={setYear}
										lock={yearLock}
										setLock={setYearLock}
									/>

									{library?.type === "Movies" && (
										<>
											<DialogTags
												title={t("studios")}
												value={studios}
												setValue={setStudios}
												lock={studiosLock}
												setLock={setStudiosLock}
											/>
											<DialogInput
												type="text"
												title={t("tagline")}
												value={tagline}
												setValue={setTagline}
												lock={taglineLock}
												setLock={setTaglineLock}
											/>
										</>
									)}

									{library?.type === "Music" && (
										<DialogTags
											title={t("genres")}
											value={genres}
											setValue={setGenres}
											lock={genresLock}
											setLock={setGenresLock}
										/>
									)}

									{library?.type !== "Music" && (
										<DialogTextArea
											title={t("overview")}
											value={overview}
											setValue={setOverview}
											lock={overviewLock}
											setLock={setOverviewLock}
										/>
									)}
								</>
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
										title={t("createdBy")}
										value={creator}
										setValue={setCreator}
										lock={creatorLock}
										setLock={setCreatorLock}
									/>
									<DialogTags
										title={t("directedBy")}
										value={directedBy}
										setValue={setDirectedBy}
										lock={directedByLock}
										setLock={setDirectedByLock}
									/>
									<DialogTags
										title={t("writtenBy")}
										value={writtenBy}
										setValue={setWrittenBy}
										lock={writtenByLock}
										setLock={setWrittenByLock}
									/>
									<DialogTags
										title={t("musicBy")}
										value={music}
										setValue={setMusic}
										lock={musicLock}
										setLock={setMusicLock}
									/>
								</>
							) : menuSection === WindowSections.Details ? (
								<>
									<div className="dialog-horizontal-box">
										<div className="dialog-background-buttons">
											<span>{t("backgroundImage")}</span>
											<div>
												<button
													className="desktop-dialog-btn"
													title={t("loadButton")}
													onClick={handleUploadBackground}
												>
													<UploadIcon />
												</button>
												<button
													className="desktop-dialog-btn"
													title={t("fromURLButton")}
													onClick={() => setPasteUrl(true)}
												>
													<LinkIcon />
												</button>
											</div>
											<span>
												{resolution.width}x{resolution.height}
											</span>
										</div>
										<Image
											src={
												selectedBackground != ""
													? selectedBackground
													: season?.backgroundSrc
													? season.backgroundSrc
													: ""
											}
											id="seasonBackgroundImage"
											alt="Video Thumbnail"
											errorSrc="./src/resources/img/Default_video_thumbnail.jpg"
											isRelative={true}
											onLoad={handleImageLoad}
										/>
									</div>
									{pasteUrl ? (
										<div className="dialog-horizontal-box horizontal-center-align">
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
												onClick={() => {
													handleBackgroundImageDownload();
												}}
											>
												{t("loadButton")}
											</button>
										</div>
									) : null}
									<div
										className="dialog-horizontal-box"
										style={{ justifyContent: "start" }}
									>
										<div
											className="dialog-background-buttons"
											style={{ width: "40%" }}
										>
											<span>{t("backgroundMusic")}</span>
											<div className="media-input">
												<button
													className="desktop-dialog-btn"
													onClick={() =>
														dispatch(toggleSeasonWindow())
													}
												>
													<UploadIcon />
												</button>
												<button
													className="desktop-dialog-btn"
													onClick={() => {
														setVideoContent(false);
														setShowWindow(true);
													}}
												>
													<DownloadIcon />
												</button>
												<button
													className="desktop-dialog-btn"
													onClick={() => {
														setExtMusicSrc("");
														setMusicSrc("");
													}}
												>
													<RemoveIcon />
												</button>
											</div>
										</div>
										<div
											style={{
												width: "60%",
												height: "100%",
												display: "flex",
												justifyContent: "end",
												alignItems: "center",
											}}
										>
											{extMusicSrc && extMusicSrc !== "" ? (
												<ReactPlayer
													url={extMusicSrc}
													controls
													height="50px"
													width="100%"
												/>
											) : (
												<span>{t("noMusicFound")}</span>
											)}
										</div>
									</div>
									<div className="dialog-horizontal-box">
										<div className="dialog-background-buttons">
											<span>{t("backgroundVideo")}</span>
											<div>
												<button
													className="desktop-dialog-btn"
													onClick={() =>
														dispatch(toggleSeasonWindow())
													}
												>
													<UploadIcon />
												</button>
												<button
													className="desktop-dialog-btn"
													onClick={() => {
														setVideoContent(true);
														setShowWindow(true);
													}}
												>
													<DownloadIcon />
												</button>
												<button
													className="desktop-dialog-btn"
													onClick={() => {
														setExtVideoSrc("");
														setVideoSrc("");
													}}
												>
													<RemoveIcon />
												</button>
											</div>
										</div>
										{extVideoSrc && extVideoSrc !== "" ? (
											<ReactPlayer
												url={extVideoSrc}
												controls
												width="60%"
												height="auto"
											/>
										) : (
											<span>{t("noVideoFound")}</span>
										)}
									</div>
								</>
							) : menuSection === WindowSections.Logos ? (
								<ImagesList
									images={logos}
									imageWidth={290}
									imagesUrls={logosUrls}
									setImagesUrls={setLogosUrls}
									downloadPath={`resources/img/logos/${season?.id}/`}
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
									downloadPath={`resources/img/posters/${season?.id}/`}
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
						action={() => dispatch(toggleSeasonWindow())}
					/>
				</div>
			</section>
		</>
	);
}

export default SeasonWindow;
