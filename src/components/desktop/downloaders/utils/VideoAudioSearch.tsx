import { RootState } from "@redux/store";
import { useDownloadContext } from "context/download.context";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

function VideoAudioSearch() {
	const { videoContent, searchQuery, setSearchQuery } = useDownloadContext();
	const [localQuery, setLocalQuery] = useState<string>(searchQuery);

	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const selectedSeries = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const selectedSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);

	useEffect(() => {
		if (selectedLibrary && selectedSeries && selectedSeason) {
			if (selectedLibrary.type === "Shows") {
				setLocalQuery(
					videoContent
						? selectedSeries.name + " trailer"
						: selectedSeries.name + " ost"
				);
			} else {
				setLocalQuery(
					videoContent
						? selectedSeason.name + " trailer"
						: selectedSeason.name + " ost"
				);
			}
		}
	}, [selectedSeason]);

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
