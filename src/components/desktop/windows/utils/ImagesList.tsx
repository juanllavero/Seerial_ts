import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ImageCard from "./ImageCard";
import { useDownloadContext } from "context/download.context";

function ImagesList({
	images,
	imageWidth,
	imagesUrls,
	setImagesUrls,
	downloadPath,
	selectedImage,
	selectImage,
	setImageDownloaded,
}: {
	images: string[];
	imageWidth: number;
	imagesUrls: string[];
	setImagesUrls: (imagesUrls: string[]) => void;
	downloadPath: string;
	selectedImage: string | undefined;
	selectImage: (image: string | undefined) => void;
	setImageDownloaded: (imageDownloaded: boolean) => void;
}) {
	const { t } = useTranslation();
	const { setDownloadingContent } = useDownloadContext();

	const [pasteUrl, setPasteUrl] = useState<boolean>(false);
	const [imageUrl, setImageUrl] = useState<string>("");

	const handleDownload = () => {
		setPasteUrl(false);
		setDownloadingContent(true);
		window.ipcRenderer
			.invoke("download-image-url", imageUrl, downloadPath)
			.then(() => {
				setImageDownloaded(true);
				setDownloadingContent(false);
			})
			.catch((_e) => {
				setDownloadingContent(false);
			});
	};

	// Preprocess the names of the images in `images` and store them in a Set
	const imageNamesSet = new Set(
		images.map((image) => image.split("\\").pop()?.toLowerCase())
	);

	// Filter the URLs whose name is not in the Set
	const filteredImagesUrls = imagesUrls && imagesUrls.filter((imageUrl) => {
		const imageNameFromUrl = imageUrl.split("/").pop()?.toLowerCase();
		return imageNameFromUrl && !imageNamesSet.has(imageNameFromUrl);
	});

	const handleImageLoad = () => {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*";
		input.onchange = () => {
			const file = input.files?.[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = async () => {
					const originalPath = file.path;
					const destPath = downloadPath + file.name;

					setDownloadingContent(true);
					window.ipcRenderer
						.invoke("copy-image-file", originalPath, destPath)
						.then(() => {
							setImageDownloaded(true);
							setDownloadingContent(false);
						})
						.catch((_e) => {
							setDownloadingContent(false);
						});
				};
				reader.readAsDataURL(file);
			}
		};
		input.click();
	};

	return (
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
						onClick={() => handleDownload()}
					>
						{t("loadButton")}
					</button>
				</div>
			) : (
				<div className="horizontal-center-align">
					<button
						className="desktop-dialog-btn"
						onClick={() => handleImageLoad()}
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
				{images &&
					images.map((image: string, index: number) => (
						<ImageCard
							key={image}
							image={image}
							imageWidth={imageWidth}
							index={index}
							selectImage={selectImage}
							selectedImage={selectedImage}
							imagePath={`file://${image}`}
							isUrl={false}
						/>
					))}
				{filteredImagesUrls &&
					filteredImagesUrls.map((image: string, index: number) => (
						<ImageCard
							key={image}
							image={image}
							imageWidth={imageWidth}
							index={index}
							selectImage={selectImage}
							selectedImage={selectedImage}
							imagePath={image}
							isUrl={true}
						/>
					))}
			</div>
		</>
	);
}

export default React.memo(ImagesList);
