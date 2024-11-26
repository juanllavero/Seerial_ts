import { useDownloadContext } from "context/download.context";
import { useEffect, useState } from "react";

function PopUpVideo() {
	const { selectedUrl } = useDownloadContext();
	const [embedUrl, setEmbedUrl] = useState("");

	useEffect(() => {
		setEmbedUrl(selectedUrl.replace("watch?v=", "embed/"));
	}, [selectedUrl]);

	return (
		<div className="pop-up-video">
			<iframe
				width="100%"
				height="100%"
				src={embedUrl}
				title="YouTube video player"
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			></iframe>
		</div>
	);
}

export default PopUpVideo;
