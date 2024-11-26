import Image from "@components/image/Image";
import { ReactUtils } from "@data/utils/ReactUtils";
import { MediaSearchResult } from "@interfaces/SearchResults";
import { RootState } from "@redux/store";
import { useDownloadContext } from "context/download.context";
import React from "react";
import { useSelector } from "react-redux";

function ResultCard({ result }: { result: MediaSearchResult }) {
	const {
		setSelectedUrl,
		setPlayContent,
		downloadVideo,
		downloadAudio,
		videoContent,
		setDownloadingContent,
	} = useDownloadContext();
	const selectedSeason = useSelector((state: RootState) => state.data.selectedSeason);

	const handlePlayVideo = () => {
		setSelectedUrl(result.url);
		setPlayContent(true);
	};

	const handleDownloadContent = () => {
		setSelectedUrl(result.url);

		if (!selectedSeason) return;

		if (videoContent) downloadVideo(selectedSeason.id, result.url);
		else downloadAudio(selectedSeason.id, result.url);

		setDownloadingContent(true);
	};

	return (
		<div className="result-card">
			<Image
				src={result.thumbnail}
				alt="Thumbnail"
				isRelative={false}
				errorSrc="./src/resources/img/fileNotFound.jpg"
			/>

			<div className="result-info">
				<span id="result-title">{result.title}</span>
				<span id="result-duration">
					{ReactUtils.formatTime(result.duration)}
				</span>
			</div>

			<div className="btns-container">
				<button className="btn" onClick={handleDownloadContent}>
					Download
				</button>
				<button className="btn" onClick={handlePlayVideo}>
					Play
				</button>
			</div>
		</div>
	);
}

export default React.memo(ResultCard);
