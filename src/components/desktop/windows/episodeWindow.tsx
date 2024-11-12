import { Section } from "data/enums/Section";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import { useTranslation } from "react-i18next";
import { toggleEpisodeWindow, updateEpisode } from "redux/slices/dataSlice";
import { VideoTrackData } from "@interfaces/VideoTrackData";
import { AudioTrackData } from "@interfaces/AudioTrackData";
import { SubtitleTrackData } from "@interfaces/SubtitleTrackData";
import { TagsInput } from "react-tag-input-component";
import { LockIcon } from "@components/utils/IconLibrary";

function EpisodeWindow() {
	const dispatch = useDispatch();
	const { t } = useTranslation();

	const menuSection = useSelector(
		(state: RootState) => state.sectionState.menuSection
	);
	const episodeMenuOpen = useSelector(
		(state: RootState) => state.data.episodeWindowOpen
	);
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const selectedSeries = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const selectedEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);

	const [pasteUrl, setPasteUrl] = useState<boolean>(false);
	const [imageUrl, setImageUrl] = useState<string>("");
	const [imageDownloaded, setImageDownloaded] = useState<boolean>(false);

	const [images, setImages] = useState<string[]>([]);
	const [selectedImage, selectImage] = useState<string | undefined>(undefined);

	const [nameLock, setNameLock] = useState<boolean>(false);
	const [yearLock, setYearLock] = useState<boolean>(false);
	const [overviewLock, setOverviewLock] = useState<boolean>(false);
	const [directedLock, setDirectedLock] = useState<boolean>(false);
	const [writtenLock, setWrittenLock] = useState<boolean>(false);

	const [name, setName] = useState<string>("");
	const [year, setYear] = useState<string>("");
	const [overview, setOverview] = useState<string>("");
	const [directedBy, setDirectedBy] = useState<string[]>([]);
	const [writtenBy, setWrittenBy] = useState<string[]>([]);

	useEffect(() => {
		const fetchImages = async () => {
			setPasteUrl(false);

			const path = await window.electronAPI.getExternalPath(
				"resources/img/thumbnails/video/" + selectedEpisode?.id + "/"
			);
			if (path) {
				const images = await window.electronAPI.getImages(path);
				setImages(images);
			}

			if (selectedEpisode?.imgSrc)
				selectImage(selectedEpisode?.imgSrc.split("/").pop());
		};

		if (menuSection === Section.Thumbnails && selectedEpisode) {
			fetchImages().then(() => setImageDownloaded(false));
		}
	}, [menuSection, imageDownloaded]);

	useEffect(() => {
		if (episodeMenuOpen && selectedEpisode) {
			let noImages: string[] = [];
			setImages(noImages);
			dispatch(changeMenuSection(Section.General));

			// @ts-ignore
			window.electronAPI.getMediaInfo(selectedEpisode).then((data) => {
				if (data && selectedLibrary && selectedSeries) {
					dispatch(
						updateEpisode({
							libraryId: selectedLibrary.id,
							showId: selectedSeries.id,
							episode: {
								mediaInfo: data.mediaInfo,
								videoTracks: data.videoTracks,
								audioTracks: data.audioTracks,
								subtitleTracks: data.subtitleTracks,
								chapters: data.chapters,
								id: selectedEpisode.id,
								name: selectedEpisode.name,
								overview: selectedEpisode.overview,
								year: selectedEpisode.year,
								order: selectedEpisode.order,
								score: selectedEpisode.score,
								imdbScore: selectedEpisode.imdbScore,
								runtime: selectedEpisode.runtime,
								runtimeInSeconds: selectedEpisode.runtimeInSeconds,
								episodeNumber: selectedEpisode.episodeNumber,
								seasonNumber: selectedEpisode.seasonNumber,
								videoSrc: selectedEpisode.videoSrc,
								imgSrc: selectedEpisode.imgSrc,
								seasonID: selectedEpisode.seasonID,
								watched: selectedEpisode.watched,
								timeWatched: selectedEpisode.timeWatched,
								directedBy: selectedEpisode.directedBy,
								writtenBy: selectedEpisode.writtenBy,
								nameLock: selectedEpisode.nameLock,
								yearLock: selectedEpisode.yearLock,
								overviewLock: selectedEpisode.overviewLock,
								directedLock: selectedEpisode.directedLock,
								writtenLock: selectedEpisode.writtenLock,
								album: "",
								albumArtist: "",
							},
						})
					);
				}
			});

			setName(selectedEpisode.name || "");
			setYear(selectedEpisode.year || "");
			setOverview(selectedEpisode.overview || "");
			setDirectedBy(selectedEpisode.directedBy || "");
			setWrittenBy(selectedEpisode.writtenBy || "");

			setNameLock(selectedEpisode.nameLock || false);
			setYearLock(selectedEpisode.yearLock || false);
			setOverviewLock(selectedEpisode.overviewLock || false);
			setDirectedLock(selectedEpisode.directedLock || false);
			setWrittenLock(selectedEpisode.writtenLock || false);

			selectImage(undefined);
		}
	}, [episodeMenuOpen]);

	useEffect(() => {
		window.ipcRenderer.on("download-complete", (_event, _message) => {
			setImageDownloaded(true);
		});

		window.ipcRenderer.on("download-error", (_event, message) => {
			alert(`Error: ${message}`);
		});
	}, []);

	const getVideoInfo = (track: VideoTrackData) => {
		const mediaInfoFieldsVideo = [
			{ key: "Codec", value: track.codec },
			{ key: "Codec Extended", value: track.codecExt },
			{ key: "Bitrate", value: track.bitrate },
			{ key: "Frame Rate", value: track.framerate },
			{ key: "Coded Height", value: track.codedHeight },
			{ key: "Coded Width", value: track.codedWidth },
			{ key: "Chroma Location", value: track.chromaLocation },
			{ key: "Color Space", value: track.colorSpace },
			{ key: "Aspect Ratio", value: track.aspectRatio },
			{ key: "Profile", value: track.profile },
			{ key: "Ref Frames", value: track.refFrames },
			{ key: "Color Range", value: track.colorRange },
			{ key: "Display Title", value: track.displayTitle },
		];

		return (
			<>
				{mediaInfoFieldsVideo.map(
					(field, index) =>
						field.value && (
							<div key={index + "video-media"}>
								<span id="media-info-key">{field.key}</span>
								<span id="media-info-value">{field.value}</span>
							</div>
						)
				)}
			</>
		);
	};

	const getAudioInfo = (track: AudioTrackData) => {
		const mediaInfoFieldsAudio = [
			{ key: "Codec", value: track.codec },
			{ key: "Codec Extended", value: track.codecExt },
			{ key: "Channels", value: track.channels },
			{ key: "Channel Layout", value: track.channelLayout },
			{ key: "Bitrate", value: track.bitrate },
			{ key: "Language", value: track.language },
			{ key: "Language tag", value: track.languageTag },
			{ key: "Bit Depth", value: track.bitDepth },
			{ key: "Profile", value: track.profile },
			{ key: "Sampling Rate", value: track.samplingRate },
			{ key: "Display Title", value: track.displayTitle },
		];

		return (
			<>
				{mediaInfoFieldsAudio.map(
					(field, index) =>
						field.value && (
							<div key={index + "audio-media"}>
								<span id="media-info-key">{field.key}</span>
								<span id="media-info-value">{field.value}</span>
							</div>
						)
				)}
			</>
		);
	};

	const getSubtitleInfo = (track: SubtitleTrackData) => {
		const mediaInfoFieldsSubs = [
			{ key: "Codec", value: track.codec },
			{ key: "Codec Extended", value: track.codecExt },
			{ key: "Language", value: track.language },
			{ key: "Language tag", value: track.languageTag },
			{ key: "Title", value: track.title },
			{ key: "Display Title", value: track.displayTitle },
		];

		return (
			<>
				{mediaInfoFieldsSubs.map(
					(field, index) =>
						field.value && (
							<div key={index + "subs-media"}>
								<span id="media-info-key">{field.key}</span>
								<span id="media-info-value">{field.value}</span>
							</div>
						)
				)}
			</>
		);
	};

	const handleSavingChanges = () => {
		if (selectedEpisode && selectedSeries && selectedLibrary) {
			dispatch(
				updateEpisode({
					libraryId: selectedLibrary.id,
					showId: selectedSeries.id,
					episode: {
						name: name,
						overview: overview,
						year: year,
						order: selectedEpisode.order,
						imgSrc: selectedImage
							? "resources/img/thumbnails/video/" +
							  selectedEpisode?.id +
							  "/" +
							  selectedImage
							: selectedEpisode.imgSrc,
						directedBy: directedBy,
						writtenBy: writtenBy,
						nameLock: nameLock,
						yearLock: yearLock,
						overviewLock: overviewLock,
						directedLock: directedLock,
						writtenLock: writtenLock,
						id: selectedEpisode.id,
						score: selectedEpisode.score,
						imdbScore: selectedEpisode.imdbScore,
						runtime: selectedEpisode.runtime,
						runtimeInSeconds: selectedEpisode.runtimeInSeconds,
						episodeNumber: selectedEpisode.episodeNumber,
						seasonNumber: selectedEpisode.seasonNumber,
						videoSrc: selectedEpisode.videoSrc,
						seasonID: selectedEpisode.seasonID,
						watched: selectedEpisode.watched,
						timeWatched: selectedEpisode.timeWatched,
						chapters: selectedEpisode.chapters,
						videoTracks: selectedEpisode.videoTracks,
						audioTracks: selectedEpisode.audioTracks,
						subtitleTracks: selectedEpisode.subtitleTracks,
						album: "",
						albumArtist: "",
					},
				})
			);
		}

		dispatch(toggleEpisodeWindow());
	};

	const handleDownload = () => {
		setPasteUrl(false);
		window.ipcRenderer.send(
			"download-image-url",
			imageUrl,
			"resources/img/thumbnails/video/" + selectedEpisode?.id + "/"
		);
	};

	return (
		<>
			<section
				className={`dialog ${episodeMenuOpen ? " dialog-active" : ""}`}
			>
				<div
					className="dialog-background"
					onClick={() => dispatch(toggleEpisodeWindow())}
				></div>
				<div className="dialog-box">
					<section className="dialog-top">
						<span>
							{t("editButton") +
								": " +
								selectedSeries?.name +
								" - " +
								selectedEpisode?.name}
						</span>
						<button
							className="close-window-btn"
							onClick={() => dispatch(toggleEpisodeWindow())}
						>
							<img
								src="./src/assets/svg/windowClose.svg"
								style={{
									width: "24px",
									height: "24px",
									filter: "drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))",
								}}
							/>
						</button>
					</section>
					<section className="dialog-center">
						<div className="dialog-center-left">
							<button
								className={`desktop-dialog-side-btn ${
									menuSection === Section.General
										? " desktop-dialog-side-btn-active"
										: ""
								}`}
								onClick={() =>
									dispatch(changeMenuSection(Section.General))
								}
							>
								{t("generalButton")}
							</button>
							{selectedLibrary?.type !== "Music" ? (
								<>
									<button
										className={`desktop-dialog-side-btn ${
											menuSection === Section.Thumbnails
												? " desktop-dialog-side-btn-active"
												: ""
										}`}
										onClick={() =>
											dispatch(changeMenuSection(Section.Thumbnails))
										}
									>
										{t("thumbnailsButton")}
									</button>
									<button
										className={`desktop-dialog-side-btn ${
											menuSection === Section.Details
												? " desktop-dialog-side-btn-active"
												: ""
										}`}
										onClick={() =>
											dispatch(changeMenuSection(Section.Details))
										}
									>
										{t("details")}
									</button>
								</>
							) : null}
						</div>
						<div className="dialog-center-right scroll">
							{menuSection == Section.General ? (
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
									{selectedLibrary?.type === "Shows" &&
									selectedEpisode ? (
										<div className="dialog-input-box">
											<span>{t("directedBy")}</span>
											<div
												className={`dialog-input-lock ${
													directedLock ? " locked" : ""
												}`}
											>
												<a
													href="#"
													onClick={() =>
														setDirectedLock(!directedLock)
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
									) : (
										<></>
									)}
									{selectedLibrary?.type === "Shows" &&
									selectedEpisode ? (
										<div className="dialog-input-box">
											<span>{t("writtenBy")}</span>
											<div
												className={`dialog-input-lock ${
													writtenLock ? " locked" : ""
												}`}
											>
												<a
													href="#"
													onClick={() =>
														setWrittenLock(!writtenLock)
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
									) : (
										<></>
									)}
								</>
							) : menuSection == Section.Thumbnails ? (
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
										{images.map((image, index) => (
											<div
												key={image}
												className={`dialog-image-btn ${
													image.split("\\").pop() === selectedImage
														? " dialog-image-btn-active"
														: ""
												}`}
												onClick={() =>
													selectImage(image.split("\\").pop())
												}
											>
												<img
													src={`file://${image}`}
													alt={`img-${index}`}
													style={{ width: 290 }}
												/>
												{image.split("\\").pop() ===
												selectedImage ? (
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
							) : menuSection == Section.Details ? (
								<>
									<div className="dialog-horizontal-box">
										<section className="left-media-info">
											<span id="media-info-title">Media info</span>
											<div>
												<span id="media-info-key">Duration</span>
												<span id="media-info-value">
													{selectedEpisode?.mediaInfo?.duration}
												</span>
											</div>
											<div>
												<span id="media-info-key">File</span>
												<span id="media-info-value">
													{selectedEpisode?.mediaInfo?.file}
												</span>
											</div>
											<div>
												<span id="media-info-key">Location</span>
												<span id="media-info-value">
													{selectedEpisode?.mediaInfo?.location}
												</span>
											</div>
											<div>
												<span id="media-info-key">Bitrate</span>
												<span id="media-info-value">
													{selectedEpisode?.mediaInfo?.bitrate}
												</span>
											</div>
											<div>
												<span id="media-info-key">Size</span>
												<span id="media-info-value">
													{selectedEpisode?.mediaInfo?.size}
												</span>
											</div>
											<div>
												<span id="media-info-key">Container</span>
												<span id="media-info-value">
													{selectedEpisode?.mediaInfo?.container}
												</span>
											</div>
										</section>
										<section className="right-media-info">
											{selectedEpisode?.videoTracks.map(
												(track: VideoTrackData) => (
													<div key={track.id + "-video"}>
														<span id="media-info-title">
															Video
														</span>
														{getVideoInfo(track)}
														<div className="separator"></div>
													</div>
												)
											)}
											{selectedEpisode?.audioTracks.map(
												(
													audioTrack: AudioTrackData,
													index: number
												) => (
													<div key={index + "-audio"}>
														<span id="media-info-title">
															Audio
														</span>
														{getAudioInfo(audioTrack)}
														<div className="separator"></div>
													</div>
												)
											)}
											{selectedEpisode?.subtitleTracks.map(
												(
													track: SubtitleTrackData,
													index: number
												) => (
													<div key={index + "-subs"}>
														<span id="media-info-title">
															Subtitle
														</span>
														{getSubtitleInfo(track)}
														<div className="separator"></div>
													</div>
												)
											)}
										</section>
									</div>
								</>
							) : (
								<></>
							)}
						</div>
					</section>
					<section className="dialog-bottom">
						<button
							className="desktop-dialog-btn"
							onClick={() => dispatch(toggleEpisodeWindow())}
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
		</>
	);
};

export default EpisodeWindow;
