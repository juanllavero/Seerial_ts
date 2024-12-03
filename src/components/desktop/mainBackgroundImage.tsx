import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { loadImage, removeImage } from "../../redux/slices/imageLoadedSlice";
import Image from "@components/image/Image";
import { useEffect, useState } from "react";

export function MainBackgroundImage() {
	const dispatch = useDispatch();
	const selectedSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const imageLoaded = useSelector(
		(state: RootState) => state.imageLoaded.isImageLoaded
	);
	const seasonWindowOpen = useSelector(
		(state: RootState) => state.data.seasonWindowOpen
	)
	const [cacheBuster, setCacheBuster] = useState(Date.now());

	useEffect(() => {
		if (!seasonWindowOpen) {
			setCacheBuster(Date.now());
		}
	}, [seasonWindowOpen]);

	const handleImageLoad = () => {
		setTimeout(() => {
			dispatch(loadImage());
		}, 500);
	};

	if (selectedSeason && selectedSeason.backgroundSrc !== "") {
		return (
			<div className="main-background">
				<Image
					src={`/resources/img/backgrounds/${selectedSeason.id}/fullBlur.jpg?t=${cacheBuster}`}
					onLoad={handleImageLoad}
					className={imageLoaded ? "loaded" : ""}
					alt="Background"
					isRelative={true}
					errorSrc=""
				/>
			</div>
		);
	} else {
		dispatch(removeImage());
		return null;
	}
}

export default MainBackgroundImage;
