import Image from "@components/image/Image";
import { FullscreenSections } from "@data/enums/Sections";
import { RootState } from "@redux/store";
import { useFullscreenContext } from "context/fullscreen.context";
import { useSectionContext } from "context/section.context";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./BackgroundImages.scss";
import "../utils/utils.scss";
import { ReactUtils } from "@data/utils/ReactUtils";
import { setGradientLoaded } from "@redux/slices/imageLoadedSlice";

function BackgroundImages() {
	const dispatch = useDispatch();
	const { currentFullscreenSection } = useSectionContext();
	const {
		homeBackgroundLoaded,
		collectionsBackgroundLoaded,
		useImageAsBackground,
		currentShowForBackground,
	} = useFullscreenContext();

	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const selectedShow = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);

	const gradientLoaded = useSelector(
		(state: RootState) => state.imageLoaded.gradientLoaded
	);
	const [gradientBackground, setGradientBackground] = useState<string>("");

	useEffect(() => {
		if (selectedShow && selectedLibrary?.type === "Music") {
			if (selectedShow.coverSrc !== "") {
				ReactUtils.getDominantColors(selectedShow.coverSrc);
			} else if (currentSeason && currentSeason.coverSrc !== "") {
				ReactUtils.getDominantColors(currentSeason.coverSrc);
			} else {
				ReactUtils.getDominantColors("./src/resources/img/songDefault.png");
			}

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
				}, 500);
			}, 500);
		} else {
			setGradientBackground("none");
		}
	}, [selectedShow, currentSeason]);

	return (
		<>
			{currentFullscreenSection !== FullscreenSections.Collections ? (
				<>
					<div
						className={`season-image ${
							homeBackgroundLoaded ? "loaded-blur-in" : "loaded-blur-out"
						}`}
					>
						{selectedLibrary &&
						currentSeason &&
						currentSeason.backgroundSrc !== "" ? (
							<Image
								src={currentSeason.backgroundSrc}
								alt="Background"
								isRelative={true}
								errorSrc=""
							/>
						) : null}
					</div>
					<div
						className={`season-gradient ${
							homeBackgroundLoaded ? "loaded-blur-in" : "loaded-blur-out"
						}`}
					></div>

					{selectedLibrary?.type === "Music" && (
						<div
							className={`gradient-background ${
								gradientLoaded ? "fade-in" : "fade-out"
							}`}
							style={{
								background: `${gradientBackground}`,
							}}
						/>
					)}
				</>
			) : !useImageAsBackground && selectedLibrary?.type !== "Music" ? (
				<div
					className={`background-image-blur ${
						collectionsBackgroundLoaded
							? "loaded-blur-in"
							: "loaded-blur-out"
					}`}
				>
					{selectedLibrary &&
					currentShowForBackground &&
					currentShowForBackground.seasons &&
					currentShowForBackground.seasons.length > 0 &&
					currentShowForBackground.seasons[0].backgroundSrc !== "" ? (
						<Image
							src={`/resources/img/backgrounds/${currentShowForBackground.seasons[0].id}/fullBlur.jpg`}
							alt="Background"
							isRelative={true}
							errorSrc=""
						/>
					) : null}
				</div>
			) : (
				<div
					className={`gradient-background ${
						gradientLoaded ? "fade-in" : "fade-out"
					}`}
					style={{
						background: `${gradientBackground}`,
					}}
				/>
			)}

			{currentFullscreenSection === FullscreenSections.Home ||
			!useImageAsBackground ? (
				<div className="noise-background">
					<Image
						src="resources/img/noise.png"
						alt="Noise image"
						isRelative={true}
						errorSrc=""
					/>
				</div>
			) : null}
		</>
	);
}

export default React.memo(BackgroundImages);
