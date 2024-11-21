import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import RightPanel from "./rightContent/RightPanel";
import MainBackgroundImage from "@components/desktop/mainBackgroundImage";
import {
	addEpisode,
	addSeason,
	addSeries,
	selectLibrary,
	setLibraries,
	setLibraryForMenu,
	toggleLibraryEditWindow,
	updateSeries,
} from "redux/slices/dataSlice";
import { useTranslation } from "react-i18next";
import "./MainDesktop.scss";
import "../utils/utils.scss";
import "../../i18n";
import { toggleMaximize } from "redux/slices/windowStateSlice";
import { closeVideo } from "redux/slices/videoSlice";
import {
	closeAllMenus,
	toggleMainMenu,
	toggleSettingsMenu,
} from "redux/slices/contextMenuSlice";
import { LibraryData } from "@interfaces/LibraryData";
import { ReactUtils } from "data/utils/ReactUtils";
import { setGradientLoaded } from "redux/slices/imageLoadedSlice";
import { SeriesData } from "@interfaces/SeriesData";
import { SeasonData } from "@interfaces/SeasonData";
import { EpisodeData } from "@interfaces/EpisodeData";
import {
	AddIcon,
	MenuIcon,
	SettingsIcon,
	ShowsIcon,
} from "@components/utils/IconLibrary";
import TopBar from "./rightContent/utils/TopBar";
import LibrariesList from "./LibrariesList";
import Image from "@components/image/Image";
import DesktopSettings from "@components/desktop/windows/desktopSettings";
import EpisodeWindow from "@components/desktop/windows/episodeWindow";
import LibraryWindow from "@components/desktop/windows/libraryWindow";
import SeasonWindow from "@components/desktop/windows/seasonWindow";
import SeriesWindow from "@components/desktop/windows/seriesWindow";
import LibraryAndSlider from "./rightContent/utils/LibraryAndSlider";
import MusicPlayer from "windows/fullscreen/MusicPlayer";
import useLoadLibraries from "hooks/useLoadLibraries";

function MainDesktop() {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { loading, error } = useLoadLibraries();

	const isVideoLoaded = useSelector(
		(state: RootState) => state.video.isLoaded
	);

	const mainMenuOpen = useSelector(
		(state: RootState) => state.contextMenu.mainMenu
	);

	const gradientLoaded = useSelector(
		(state: RootState) => state.imageLoaded.gradientLoaded
	);

	const selectedSeries = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const selectedSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const [gradientBackground, setGradientBackground] = useState<string>("");

	useEffect(() => {
		if (selectedSeries) {
			setTimeout(() => {
				const newGradient = ReactUtils.getGradientBackground();

				if (gradientBackground !== newGradient) {
					dispatch(setGradientLoaded(false));
				}

				setTimeout(() => {
					setGradientBackground(newGradient);

					if (gradientBackground !== newGradient) {
						dispatch(setGradientLoaded(true));
					}
				}, 200);
			}, 300);
		} else {
			setGradientBackground("none");
		}
	}, [selectedSeries, selectedSeason]);

	useEffect(() => {
		window.ipcRenderer.on(
			"update-libraries",
			(_event, newLibraries: LibraryData[]) => {
				dispatch(setLibraries(newLibraries));
				saveLibraries(newLibraries);
			}
		);

		window.ipcRenderer.on(
			"series-updated",
			(_event, libraryID: string, show: SeriesData) => {
				dispatch(updateSeries({ libraryId: libraryID, series: show }));
			}
		);

		window.ipcRenderer.on(
			"add-library",
			(_event, newLibrary: LibraryData, newLibraries: LibraryData[]) => {
				dispatch(setLibraries(newLibraries));
				dispatch(selectLibrary(newLibrary));
				saveLibraries(newLibraries);
			}
		);

		window.ipcRenderer.on(
			"series-added",
			(_event, libraryID: string, show: SeriesData) => {
				dispatch(addSeries({ libraryId: libraryID, series: show }));
			}
		);

		window.ipcRenderer.on(
			"season-added",
			(_event, libraryID: string, season: SeasonData) => {
				dispatch(addSeason({ libraryId: libraryID, season: season }));
			}
		);

		window.ipcRenderer.on(
			"episode-added",
			(_event, libraryID: string, showID: string, episode: EpisodeData) => {
				dispatch(
					addEpisode({
						libraryId: libraryID,
						showId: showID,
						episode: episode,
					})
				);
			}
		);

		window.electronAPI.onWindowStateChange((state: string) => {
			dispatch(toggleMaximize(state === "maximized"));
		});

		window.ipcRenderer.on("video-stopped", (_event) => {
			dispatch(closeVideo());
		});
	}, []);

	const showControls = () => {
		window.electronAPI.showControls();
	};

	const hideControls = () => {
		window.electronAPI.hideControls();
	};

	// Save data function
	const saveLibraries = (newData: LibraryData[]) => {
		/*************  ✨ Codeium Command ⭐  *************/
		/**
		 * Send a message to the main process to show the video controls.
		 */
		/******  c8fb40b2-fbf5-4157-9d85-a5c3a02f2a26  *******/ // @ts-ignore
		window.electronAPI.saveLibraryData(newData).then((success: boolean) => {
			if (success) {
				console.log("Datos guardados correctamente");
			} else {
				console.error("Error al guardar los datos");
			}
		});
	};

	return (
		<>
			{isVideoLoaded ? (
				<div
					className={`overlay ${isVideoLoaded ? "visible" : ""}`}
					onMouseMove={showControls}
					onClick={hideControls}
					onKeyDown={showControls}
					onDoubleClick={() => {
						window.electronAPI.setFullscreenControls();
					}}
				/>
			) : null}

			{/* PopUp Windows */}
			<DesktopSettings />
			<LibraryWindow />
			<SeriesWindow />
			<SeasonWindow />
			<EpisodeWindow />

			<div
				className={`gradient-background ${gradientLoaded ? "fade-in" : ""}`}
				style={{
					background: `${gradientBackground}`,
				}}
			/>
			<section
				className="container blur-background-image"
				onClick={(event) => {
					const target = event.target as Element;

					// Check if the click has been done in a "select" element
					if (!target.closest(".select")) {
						dispatch(closeAllMenus());
					}
				}}
			>
				<MainBackgroundImage />
				<div className="noise-background">
					<Image
						src="resources/img/noise.png"
						alt="Background noise"
						width={1920}
						height={1080}
						isRelative={true}
						errorSrc="resources/img/noise.png"
					/>
				</div>

				<MusicPlayer />

				{/* Left Panel */}
				<section className="left-panel">
					<div className="top-controls">
						<div className="dropdown" style={{ marginBottom: "0.9em" }}>
							<button
								className="svg-button-desktop-controls select"
								onClick={() => {
									if (!mainMenuOpen) dispatch(closeAllMenus());
									dispatch(toggleMainMenu());
								}}
							>
								<MenuIcon />
							</button>
							<ul className={`menu ${mainMenuOpen ? " menu-open" : ""}`}>
								<li
									key="settings"
									onClick={() => {
										dispatch(toggleSettingsMenu());
									}}
								>
									<SettingsIcon />
									<span>{t("settings")}</span>
								</li>
								<li
									key="changeFullscreen"
									onClick={() => {
										dispatch(toggleMainMenu());
									}}
								>
									<ShowsIcon width={18} height={18} />
									<span>{t("switchToFullscreen")}</span>
									<a>F11</a>
								</li>
								<li
									key="ExitApp"
									onClick={() => {
										dispatch(toggleMainMenu());
									}}
								>
									<img
										src="./src/assets/svg/exitApp.svg"
										style={{ width: "18px", height: "18px" }}
									/>
									<span>{t("exitFullscreen")}</span>
								</li>
							</ul>
						</div>
						<button
							className="svg-add-library-btn select"
							onClick={() => {
								dispatch(setLibraryForMenu(undefined));
								dispatch(toggleLibraryEditWindow());
							}}
						>
							<AddIcon />
							<span>{t("libraryWindowTitle")}</span>
						</button>
					</div>
					<LibrariesList />
				</section>

				{/* Right Panel */}
				<section className="right-panel">
					<TopBar />
					{loading ? (
						<div>Loading...</div>
					) : error ? (
						<div>Error loading libraries</div>
					) : (
						<>
							<LibraryAndSlider />
							<RightPanel />
						</>
					)}
				</section>
			</section>
		</>
	);
}

export default MainDesktop;
