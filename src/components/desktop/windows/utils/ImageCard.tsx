import { TickIcon } from "@components/utils/IconLibrary";
import React from "react";

function ImageCard({
	image,
	imageWidth,
	index,
	selectImage,
	selectedImage,
	imagePath,
	isUrl,
}: {
	image: string;
	imageWidth: number;
	index: number;
	selectImage: (image: string | undefined) => void;
	selectedImage: string | undefined;
	imagePath: string;
	isUrl: boolean;
}) {
	return (
		<div
			className={`dialog-image-btn ${
				(isUrl && image === selectedImage) ||
				image.split("\\").pop() === selectedImage
					? " dialog-image-btn-active"
					: ""
			}`}
			onClick={() => selectImage(isUrl ? image : image.split("\\").pop())}
			tabIndex={1}
		>
			<img
				src={imagePath}
				alt={`img-${index}`}
				style={{ width: imageWidth }}
			/>
			{(isUrl && image === selectedImage) ||
			image.split("\\").pop() === selectedImage ? (
				<>
					<div className="triangle-tick"></div>
					<TickIcon />
				</>
			) : null}
		</div>
	);
}

export default React.memo(ImageCard);
