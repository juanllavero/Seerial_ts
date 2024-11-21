import Image from "@components/image/Image";
import { FullscreenSections } from "@data/enums/Sections";
import { RootState } from "@redux/store";
import { useFullscreenContext } from "context/fullscreen.context";
import { useSectionContext } from "context/section.context";
import React from "react";
import { useSelector } from "react-redux";
import "./BackgroundImages.scss";

function BackgroundImages() {
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
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	return (
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
			{useImageAsBackground ? (
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
					currentShowForBackground.seasons.length > 0 ? (
						<Image
							src={`/resources/img/backgrounds/${currentShowForBackground.seasons[0].id}/fullBlur.jpg`}
							alt="Background"
							isRelative={true}
							errorSrc=""
						/>
					) : null}
				</div>
			) : null}
			{currentFullscreenSection === FullscreenSections.Home ||
			useImageAsBackground ? (
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
