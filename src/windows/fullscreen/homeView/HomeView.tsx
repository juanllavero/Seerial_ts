import "../../../i18n";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "redux/store";
import { useFullscreenContext } from "context/fullscreen.context";
import { useEffect, useRef, useState } from "react";
import { ReactUtils } from "data/utils/ReactUtils";
import Image from "@components/image/Image";
import HomeCardList from "./HomeCardList";
import HomeInfo from "./HomeInfo";
import { HomeInfoElement } from "@interfaces/HomeInfoElement";
import { setCurrentlyWatchingShows, setHomeInfoElement } from "@redux/slices/fullscreenSectionsSlice";

function HomeView() {
	const dispatch = useDispatch();
	const { homeBackgroundLoaded, setHomeBackgroundLoaded } =
		useFullscreenContext();

	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const currentEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);

	const librariesList = useSelector(
		(state: RootState) => state.data.libraries
	);
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const currentlyWatchingShows = useSelector(
		(state: RootState) => state.fullscreenSection.currentlyWatchingShows
	);

	const [dominantColor, setDominantColor] = useState<string>("000000");

	const homeInfoElement = useSelector(
		(state: RootState) => state.fullscreenSection.homeInfoElement
	);

	// Set Currently Watching
	useEffect(() => {
		if (!selectedLibrary) {
			dispatch(setCurrentlyWatchingShows([]));
			let elements: HomeInfoElement[] = [];
			for (const library of librariesList) {
				if (library.type !== "Music") {
					for (const show of library.series) {
						const season = show.seasons[0];

						if (season) {
							const episode = season.episodes[0];

							if (episode) {
								elements = [
									...elements,
									{ library, show, season, episode },
								];
							}
						}
						/*
                        if (show.currentlyWatchingSeason !== -1){
                        const season = show.seasons[show.currentlyWatchingSeason];
            
                        if (season) {
                            const episode = season.episodes[season.currentlyWatchingEpisode];
            
                            if (episode){
                            setCurrentlyWatchingShows([...currentlyWatchingShows, {
                                library, show, season, episode
                            }]);
                            }
                        }
                        }
                        */
					}
				}
			}

			dispatch(setCurrentlyWatchingShows(elements));

			if (currentlyWatchingShows.length > 0) {
				dispatch(setCurrentlyWatchingShows(currentlyWatchingShows));
				dispatch(setHomeInfoElement(currentlyWatchingShows[0]));
			}
		} else {
			if (selectedLibrary.series.length > 0) {
				//handleSelectShow(selectedLibrary.series[0], true);
			}
		}
	}, [librariesList, selectedLibrary]);

	// Generate Gradient Background
	const [gradient, setGradient] = useState<string>("none");
	const [gradientLeft, setGradientLeft] = useState<string>("none");

	useEffect(() => {
		const generateGradient = async (path: string) => {
			if (path !== "none") {
				const extPath = await window.electronAPI.getExternalPath(path);

				if (extPath !== "") {
					await ReactUtils.getDominantColors(extPath);

					setDominantColor(ReactUtils.colors[0]);

					if (dominantColor) {
						setGradient(
							`radial-gradient(135% 103% at 97% 39%, #073AFF00 41%, ${dominantColor} 68%)`
						);
						setGradientLeft(
							`linear-gradient(90deg, ${dominantColor} 0%, ${dominantColor} 100%)`
						);
					}
				}
			} else {
				setGradient(
					`radial-gradient(135% 103% at 97% 39%, #073AFF00 41%, #000000FF 68%)`
				);
				setGradientLeft(
					`linear-gradient(90deg, #000000FF 0%, #000000FF 100%)`
				);
			}
		};

		if (
			homeInfoElement &&
			homeInfoElement.season.backgroundSrc &&
			homeInfoElement.season.backgroundSrc !== ""
		) {
			setHomeBackgroundLoaded(false);
			setTimeout(() => {
				generateGradient(homeInfoElement.season.backgroundSrc);
				setHomeBackgroundLoaded(true);
			}, 600);
		} else if (homeInfoElement) {
			setTimeout(() => {
				generateGradient("none");
			}, 100);
		}
	}, [homeInfoElement]);

	return (
		<section className="home-container">
			{homeInfoElement !== undefined ? (
				<>
					<div
						className={`background-image ${
							homeBackgroundLoaded ? "loaded" : ""
						}`}
					>
						{homeInfoElement.season.backgroundSrc !== "" ? (
							<Image
								src={homeInfoElement.season.backgroundSrc}
								alt="Background"
								isRelative={true}
								errorSrc=""
							/>
						) : null}
					</div>
					<div
						className={`gradient-left ${
							homeBackgroundLoaded ? "loadedFull" : ""
						}`}
						style={{ background: `${gradientLeft}` }}
					></div>
					<div
						className={`gradient ${
							homeBackgroundLoaded ? "loadedFull" : ""
						}`}
						style={{ background: `${gradient}` }}
					></div>
				</>
			) : null}
			<HomeInfo />
			<HomeCardList/>
		</section>
	);
}

export default HomeView;
