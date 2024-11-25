import Image from "@components/image/Image";
import React from "react";

function ResultCard({
	result,
}: {
	result: {
		id: string;
		title: string;
		url: string;
		duration: number;
		thumbnail: string;
	};
}) {
	return (
		<div className="result-card">
			<Image
				src={result.thumbnail}
				alt="Thumbnail"
				isRelative={false}
				errorSrc="./src/resources/img/fileNotFound.jpg"
			/>

			<div className="result-info">
				<h3>{result.title}</h3>
				<p>{result.duration} seconds</p>
			</div>

			<div className="btns-container">
				<button>Download</button>
				<button>Play</button>
			</div>
		</div>
	);
}

export default React.memo(ResultCard);
