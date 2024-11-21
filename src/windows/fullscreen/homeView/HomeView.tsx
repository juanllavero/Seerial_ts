import "../../../i18n";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import { useFullscreenContext } from "context/fullscreen.context";
import { useEffect, useRef, useState } from "react";
import { ReactUtils } from "data/utils/ReactUtils";
import Image from "@components/image/Image";
import HomeCardList from "./HomeCardList";
import HomeInfo from "./HomeInfo";

function HomeView() {
	const { homeBackgroundLoaded, setHomeBackgroundLoaded } =
		useFullscreenContext();

	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const currentEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);

	const [dominantColor, setDominantColor] = useState<string>("000000");

	const homeInfoElement = useSelector(
		(state: RootState) => state.fullscreenSection.homeInfoElement
	);

	const listRef = useRef<HTMLDivElement>(null);

	//#region KEYBOARD DETECTION
	const handleKeyDown = (event: KeyboardEvent) => {
		if (!currentSeason) {
			return;
		}

		const currentIndex = currentSeason.episodes.findIndex(
			(episode) => episode === currentEpisode
		);

		if (event.key === "ArrowRight") {
			// Mover al siguiente episodio si existe
			const nextIndex = currentIndex + 1;
			if (nextIndex < currentSeason.episodes.length) {
				ReactUtils.handleScrollElementClick(nextIndex, listRef, false);
			}
		}

		if (event.key === "ArrowLeft") {
			// Mover al episodio anterior si existe
			const prevIndex = currentIndex - 1;
			if (prevIndex >= 0) {
				ReactUtils.handleScrollElementClick(prevIndex, listRef, false);
			}
		}
	};

	// Add and Clean Keyboard Events
	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [currentEpisode, currentSeason?.episodes]);
	//#endregion

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
			<HomeCardList />
		</section>
	);
}

export default HomeView;
