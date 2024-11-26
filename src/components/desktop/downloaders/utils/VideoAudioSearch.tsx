import { useDownloadContext } from "context/download.context";
import { useEffect, useState } from "react";

function VideoAudioSearch() {
	const { searchQuery, setSearchQuery } = useDownloadContext();
	const [localQuery, setLocalQuery] = useState<string>(searchQuery);

	useEffect(() => {
		const search = setTimeout(() => {
			setSearchQuery(localQuery);
		}, 700);

		return () => clearTimeout(search);
	}, [localQuery]);

	return (
		<div className="search-container">
			<input
				type="text"
				placeholder=""
				value={localQuery}
				onChange={(e) => setLocalQuery(e.target.value)}
				onKeyDown={(e) => {
					e.code === "Space" ? e.stopPropagation() : null;
				}}
			/>
		</div>
	);
}

export default VideoAudioSearch;
