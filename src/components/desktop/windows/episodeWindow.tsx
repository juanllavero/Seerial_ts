import { WindowSections } from "@data/enums/Sections";
import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import { useTranslation } from "react-i18next";
import { toggleEpisodeWindow, updateEpisode } from "redux/slices/dataSlice";
import { VideoTrackData } from "@interfaces/VideoTrackData";
import { AudioTrackData } from "@interfaces/AudioTrackData";
import { SubtitleTrackData } from "@interfaces/SubtitleTrackData";
import Loading from "@components/utils/Loading";
import { useDownloadContext } from "context/download.context";
import DialogHeader from "./utils/DialogHeader";
import DialogSectionButton from "./utils/DialogSectionButton";
import DialogInput from "./utils/DialogInput";
import DialogTextArea from "./utils/DialogTextArea";
import DialogTags from "./utils/DialogTags";
import DialogFooter from "./utils/DialogFooter";
import DialogDownloading from "./utils/DialogDownloading";
import ImagesList from "./utils/ImagesList";

function EpisodeWindow() {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { downloadingContent, setDownloadingContent } = useDownloadContext();

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

	const [imageDownloaded, setImageDownloaded] = useState<boolean>(false);

	const [images, setImages] = useState<string[]>([]);
	const [selectedImage, selectImage] = useState<string | undefined>(undefined);
	const [imagesUrls, setImagesUrls] = useState<string[]>([]);

	//#region ATTRIBUTES
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
	//#endregion

	useEffect(() => {
		const fetchImages = async () => {
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

		if (menuSection === WindowSections.Thumbnails && selectedEpisode) {
			fetchImages().then(() => setImageDownloaded(false));
		}
	}, [menuSection, imageDownloaded]);

	useEffect(() => {
		if (episodeMenuOpen && selectedEpisode) {
			let noImages: string[] = [];
			setImages(noImages);
			setImagesUrls(selectedEpisode.imgUrls);
			dispatch(changeMenuSection(WindowSections.General));

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
								imgUrls: selectedEpisode.imgUrls,
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

	const handleSavingChanges = async () => {
		setDownloadingContent(true);

		if (selectedEpisode && selectedSeries && selectedLibrary) {
			await handleDownloadUrls();

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
							? selectedImage.startsWith("http")
								? "resources/img/thumbnails/video/" +
								  selectedEpisode.id +
								  "/" +
								  selectedImage.split("/").pop()
								: "resources/img/thumbnails/video/" +
								  selectedEpisode.id +
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
						imgUrls: selectedEpisode.imgUrls,
					},
				})
			);
		}

		setDownloadingContent(false);
		dispatch(toggleEpisodeWindow());
	};

	const downloadUrlImage = async (url: string, downloadPath: string) => {
		return await window.ipcRenderer.invoke(
			"download-image-url",
			url,
			downloadPath
		);
	};

	const handleDownloadUrls = async (): Promise<boolean> => {
		if (!selectedEpisode) return false;

		if (selectedImage && imagesUrls.includes(selectedImage)) {
			await downloadUrlImage(
				selectedImage,
				"resources/img/thumbnails/video/" + selectedEpisode.id + "/"
			);
		}

		return true;
	};

	return (
		<Suspense fallback={<Loading />}>
			<section
				className={`dialog ${episodeMenuOpen ? " dialog-active" : ""}`}
			>
				<div
					className="dialog-background"
					onClick={() => dispatch(toggleEpisodeWindow())}
				></div>
				<div className="dialog-box">
					<DialogDownloading downloadingContent={downloadingContent} />
					<DialogHeader
						title={
							t("editButton") +
							": " +
							selectedSeries?.name +
							" - " +
							selectedEpisode?.name
						}
						onClose={() => dispatch(toggleEpisodeWindow())}
					/>
					<section className="dialog-center">
						<div className="dialog-center-left">
							<DialogSectionButton
								title={t("generalButton")}
								section={WindowSections.General}
							/>
							{selectedLibrary?.type !== "Music" && (
								<>
									<DialogSectionButton
										title={t("thumbnailsButton")}
										section={WindowSections.Thumbnails}
									/>
									<DialogSectionButton
										title={t("details")}
										section={WindowSections.Details}
									/>
								</>
							)}
						</div>
						<div className="dialog-center-right scroll">
							{menuSection == WindowSections.General ? (
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
									<DialogTextArea
										title={t("overview")}
										value={overview}
										setValue={setOverview}
										lock={overviewLock}
										setLock={setOverviewLock}
									/>
									{selectedLibrary?.type === "Shows" &&
										selectedEpisode && (
											<>
												<DialogTags
													title={t("directedBy")}
													value={directedBy}
													setValue={setDirectedBy}
													lock={directedLock}
													setLock={setDirectedLock}
												/>
												<DialogTags
													title={t("writtenBy")}
													value={writtenBy}
													setValue={setWrittenBy}
													lock={writtenLock}
													setLock={setWrittenLock}
												/>
											</>
										)}
								</>
							) : menuSection == WindowSections.Thumbnails ? (
								<ImagesList
									images={images}
									imageWidth={290}
									imagesUrls={imagesUrls}
									setImagesUrls={setImagesUrls}
									downloadPath={`resources/img/thumbnails/video/${selectedEpisode?.id}/`}
									selectedImage={selectedImage}
									selectImage={selectImage}
									setImageDownloaded={setImageDownloaded}
								/>
							) : menuSection == WindowSections.Details ? (
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
							) : null}
						</div>
					</section>
					<DialogFooter
						downloadingContent={downloadingContent}
						handleSavingChanges={handleSavingChanges}
						action={() => dispatch(toggleEpisodeWindow())}
					/>
				</div>
			</section>
		</Suspense>
	);
}

export default EpisodeWindow;
