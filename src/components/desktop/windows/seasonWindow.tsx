import { WindowSections } from "@data/enums/Sections";
import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import { useTranslation } from "react-i18next";
import { toggleSeasonWindow, updateSeason } from "redux/slices/dataSlice";
import { TagsInput } from "react-tag-input-component";
import ReactPlayer from "react-player";
import Loading from "@components/utils/Loading";
import Image from "@components/image/Image";
import VideoAudioDownloader from "../downloaders/VideoAudioDownloader";
import { useDownloadContext } from "context/download.context";
import DialogHeader from "./utils/DialogHeader";
import { DownloadIcon, LinkIcon, LockIcon, RemoveIcon, TickIcon, UploadIcon } from "@components/utils/IconLibrary";

function SeasonWindow() {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const {
		videoContent,
		setVideoContent,
		showWindow,
		setShowWindow,
		downloadingContent,
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
	const [imageDownloaded, setImageDownloaded] = useState<boolean>(false);

	const [logos, setLogos] = useState<string[]>([]);
	const [posters, setPosters] = useState<string[]>([]);
	const [selectedLogo, selectLogo] = useState<string | undefined>(undefined);
	const [selectedPoster, selectPoster] = useState<string | undefined>(
		undefined
	);

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

	useEffect(() => {
		const fetchLogos = async () => {
			setPasteUrl(false);

			const logoPath = await window.electronAPI.getExternalPath(
				"resources/img/logos/" + season?.id + "/"
			);
			if (logoPath) {
				const images = await window.electronAPI.getImages(logoPath);
				setLogos(images);
			}

			if (season?.logoSrc) selectLogo(season?.logoSrc.split("/").pop());
		};

		const fetchPosters = async () => {
			const posterPath = await window.electronAPI.getExternalPath(
				"resources/img/posters/" + season?.id + "/"
			);
			if (posterPath) {
				const images = await window.electronAPI.getImages(posterPath);
				setPosters(images);
			}

			if (season?.coverSrc) selectPoster(season?.coverSrc.split("/").pop());
		};

		if (menuSection === WindowSections.Logos && season) {
			fetchLogos().then(() => setImageDownloaded(false));
		} else if (menuSection === WindowSections.Posters && season) {
			fetchPosters().then(() => setImageDownloaded(false));
		}
	}, [menuSection, imageDownloaded, season]);

	useEffect(() => {
		if (seasonMenuOpen && season) {
			let noImages: string[] = [];
			setPosters(noImages);
			setLogos(noImages);
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

			if (library?.type === "Movies") {
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
		}
	}, [seasonMenuOpen]);

	const fetchResolvedPath = async (src: string, isVideo: boolean) => {
		let absolutePath = await window.electronAPI.getExternalPath(src);

		if (isVideo) setExtVideoSrc(absolutePath);
		else setExtMusicSrc(absolutePath);
	};

	useEffect(() => {
		if (!downloadingContent) {
			if (videoContent) {
				setVideoSrc("resources/video/" + season?.id + ".webm");
			} else {
				setMusicSrc("resources/music/" + season?.id + ".opus");
			}

			if (videoContent) {
				fetchResolvedPath("resources/video/" + season?.id + ".webm", true);
			} else {
				fetchResolvedPath("resources/music/" + season?.id + ".opus", false);
			}
		}
	}, [downloadingContent, videoSrc, musicSrc]);

	useEffect(() => {
		window.ipcRenderer.on("download-complete", (_event, _message) => {
			setImageDownloaded(true);
		});

		window.ipcRenderer.on("download-error", (_event, message) => {
			alert(`Error: ${message}`);
		});
	}, []);

	const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
		const img = e.currentTarget;
		setResolution({
			width: img.naturalWidth,
			height: img.naturalHeight,
		});
	};

	const handleSavingChanges = () => {
		if (season) {
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
						? "resources/img/logos/" + season.id + "/" + selectedLogo
						: season.logoSrc,
					coverSrc: selectedPoster
						? "resources/img/posters/" + season.id + "/" + selectedPoster
						: season.coverSrc,
					backgroundSrc: season.backgroundSrc,
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
				})
			);
		}

		dispatch(toggleSeasonWindow());
	};

	const handleDownload = () => {
		setPasteUrl(false);
		window.ipcRenderer.send(
			"download-image-url",
			imageUrl,
			"resources/img/discCovers/" + season?.id + "/"
		);
	};

	return (
		<Suspense fallback={<Loading />}>
			{showWindow && <VideoAudioDownloader />}
			<section
				className={`dialog ${seasonMenuOpen ? " dialog-active" : ""}`}
			>
				<div
					className="dialog-background"
					onClick={() => dispatch(toggleSeasonWindow())}
				></div>
				<div className="dialog-box">
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
							<button
								className={`desktop-dialog-side-btn ${
									menuSection === WindowSections.General
										? " desktop-dialog-side-btn-active"
										: ""
								}`}
								onClick={() =>
									dispatch(changeMenuSection(WindowSections.General))
								}
							>
								{t("generalButton")}
							</button>
							{library?.type !== "Shows" ? (
								<button
									className={`desktop-dialog-side-btn ${
										menuSection === WindowSections.Tags
											? " desktop-dialog-side-btn-active"
											: ""
									}`}
									onClick={() =>
										dispatch(changeMenuSection(WindowSections.Tags))
									}
								>
									{t("tags")}
								</button>
							) : null}
							<button
								className={`desktop-dialog-side-btn ${
									menuSection === WindowSections.Details
										? " desktop-dialog-side-btn-active"
										: ""
								}`}
								onClick={() =>
									dispatch(changeMenuSection(WindowSections.Details))
								}
							>
								{t("media")}
							</button>
							{library?.type !== "Shows" ? (
								<>
									<button
										className={`desktop-dialog-side-btn ${
											menuSection === WindowSections.Logos
												? " desktop-dialog-side-btn-active"
												: ""
										}`}
										onClick={() =>
											dispatch(
												changeMenuSection(WindowSections.Logos)
											)
										}
									>
										{t("logosButton")}
									</button>
									<button
										className={`desktop-dialog-side-btn ${
											menuSection === WindowSections.Posters
												? " desktop-dialog-side-btn-active"
												: ""
										}`}
										onClick={() =>
											dispatch(
												changeMenuSection(WindowSections.Posters)
											)
										}
									>
										{t("postersButton")}
									</button>
								</>
							) : series?.isCollection ? (
								<button
									className={`desktop-dialog-side-btn ${
										menuSection === WindowSections.Logos
											? " desktop-dialog-side-btn-active"
											: ""
									}`}
									onClick={() =>
										dispatch(changeMenuSection(WindowSections.Logos))
									}
								>
									EtiquetasTEST
								</button>
							) : null}
						</div>
						<div className="dialog-center-right scroll">
							{menuSection === WindowSections.General ? (
								<>
									<div className="dialog-input-box">
										<span>{t("name")}</span>
										<div
											className={`dialog-input-lock ${
												nameLock ? " locked" : ""
											}`}
										>
											<a
												href="#"
												onClick={() => setNameLock(!nameLock)}
											>
												<LockIcon />
											</a>
											<input
												type="text"
												value={name}
												onChange={(e) => {
													setNameLock(true);
													setName(e.target.value);
												}}
											/>
										</div>
									</div>
									<div className="dialog-input-box">
										<span>{t("sortingOrder")}</span>
										<div
											className={`dialog-input-lock ${
												orderLock ? " locked" : ""
											}`}
										>
											<a
												href="#"
												onClick={() => setOrderLock(!orderLock)}
											>
												<LockIcon />
											</a>
											<input
												type="number"
												value={order}
												onChange={(e) => {
													setOrderLock(true);
													setOrder(
														Number.parseInt(e.target.value) || 0
													);
												}}
											/>
										</div>
									</div>
									<div className="dialog-input-box">
										<span>{t("year")}</span>
										<div
											className={`dialog-input-lock ${
												yearLock ? " locked" : ""
											}`}
										>
											<a
												href="#"
												onClick={() => setYearLock(!yearLock)}
											>
												<LockIcon />
											</a>
											<input
												type="text"
												value={year}
												onChange={(e) => {
													setYearLock(true);
													setYear(e.target.value);
												}}
											/>
										</div>
									</div>

									{library?.type !== "Shows" ? (
										<>
											<div className="dialog-input-box">
												<span>{t("studios")}</span>
												<div
													className={`dialog-input-lock ${
														studiosLock ? " locked" : ""
													}`}
												>
													<a
														href="#"
														onClick={() =>
															setStudiosLock(!studiosLock)
														}
													>
														<LockIcon />
													</a>
													<TagsInput
														value={studios}
														onChange={setStudios}
														name="studiosInput"
														placeHolder=""
													/>
												</div>
											</div>
											<div className="dialog-input-box">
												<span>{t("tagline")}</span>
												<div
													className={`dialog-input-lock ${
														taglineLock ? " locked" : ""
													}`}
												>
													<a
														href="#"
														onClick={() =>
															setTaglineLock(!taglineLock)
														}
													>
														<LockIcon />
													</a>
													<input
														type="text"
														value={tagline}
														onChange={(e) => {
															setTaglineLock(true);
															setTagline(e.target.value);
														}}
													/>
												</div>
											</div>
										</>
									) : null}
									<div className="dialog-input-box">
										<span>{t("overview")}</span>
										<div
											className={`dialog-input-lock ${
												overviewLock ? " locked" : ""
											}`}
										>
											<a
												href="#"
												onClick={() =>
													setOverviewLock(!overviewLock)
												}
											>
												<LockIcon />
											</a>
											<textarea
												rows={5}
												value={overview}
												onChange={(e) => {
													setOverviewLock(true);
													setOverview(e.target.value);
												}}
											/>
										</div>
									</div>
								</>
							) : menuSection === WindowSections.Tags ? (
								<>
									<div className="dialog-input-box">
										<span>{t("genres")}</span>
										<div
											className={`dialog-input-lock ${
												genresLock ? " locked" : ""
											}`}
										>
											<a
												href="#"
												onClick={() => setGenresLock(!genresLock)}
											>
												<LockIcon />
											</a>
											<TagsInput
												value={genres}
												onChange={setGenres}
												name="genresInput"
												placeHolder=""
											/>
										</div>
									</div>
									<div className="dialog-input-box">
										<span>{t("createdBy")}</span>
										<div
											className={`dialog-input-lock ${
												creatorLock ? " locked" : ""
											}`}
										>
											<a
												href="#"
												onClick={() => setCreatorLock(!creatorLock)}
											>
												<LockIcon />
											</a>
											<TagsInput
												value={creator}
												onChange={setCreator}
												name="creatorInput"
												placeHolder=""
											/>
										</div>
									</div>
									<div className="dialog-input-box">
										<span>{t("directedBy")}</span>
										<div
											className={`dialog-input-lock ${
												directedByLock ? " locked" : ""
											}`}
										>
											<a
												href="#"
												onClick={() =>
													setDirectedByLock(!directedByLock)
												}
											>
												<LockIcon />
											</a>
											<TagsInput
												value={directedBy}
												onChange={setDirectedBy}
												name="directedByInput"
												placeHolder=""
											/>
										</div>
									</div>
									<div className="dialog-input-box">
										<span>{t("writtenBy")}</span>
										<div
											className={`dialog-input-lock ${
												writtenByLock ? " locked" : ""
											}`}
										>
											<a
												href="#"
												onClick={() =>
													setWrittenByLock(!writtenByLock)
												}
											>
												<LockIcon />
											</a>
											<TagsInput
												value={writtenBy}
												onChange={setWrittenBy}
												name="writtenByInput"
												placeHolder=""
											/>
										</div>
									</div>
									<div className="dialog-input-box">
										<span>{t("musicBy")}</span>
										<div
											className={`dialog-input-lock ${
												musicLock ? " locked" : ""
											}`}
										>
											<a
												href="#"
												onClick={() => setMusicLock(!musicLock)}
											>
												<LockIcon />
											</a>
											<TagsInput
												value={music}
												onChange={setMusic}
												name="musicInput"
												placeHolder=""
											/>
										</div>
									</div>
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
													onClick={() =>
														dispatch(toggleSeasonWindow())
													}
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
												<button
													className="desktop-dialog-btn"
													title={t("downloadButton")}
													onClick={() =>
														dispatch(toggleSeasonWindow())
													}
												>
													<RemoveIcon />
												</button>
											</div>
											<span>
												{resolution.width}x{resolution.height}
											</span>
										</div>
										<Image
											src={
												season?.backgroundSrc
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
												onClick={handleDownload}
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
													onClick={() =>
														dispatch(toggleSeasonWindow())
													}
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
											{season?.videoSrc !== "" ? (
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
													onClick={() =>
														dispatch(toggleSeasonWindow())
													}
												>
													<RemoveIcon />
												</button>
											</div>
										</div>
										{season?.videoSrc !== "" ? (
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
														<TickIcon />
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
														<TickIcon />
													</>
												) : null}
											</div>
										))}
									</div>
								</>
							) : null}
						</div>
					</section>
					<section className="dialog-bottom">
						<button
							className="desktop-dialog-btn"
							onClick={() => dispatch(toggleSeasonWindow())}
						>
							{t("cancelButton")}
						</button>
						<button
							className="btn-app-color"
							onClick={() => handleSavingChanges()}
						>
							{t("saveButton")}
						</button>
					</section>
				</div>
			</section>
		</Suspense>
	);
}

export default SeasonWindow;
