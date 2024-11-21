import { useFullscreenContext } from "context/fullscreen.context";
import SeasonsView from "./SeasonView";
import SongsView from "./SongsView";
import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import AlbumsView from "./AlbumsView";

function DetailsView() {
	const { inSongsView } = useFullscreenContext();

	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const currentShow = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const currentEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);

	return selectedLibrary && currentShow && currentSeason && currentEpisode ? (
		<>
			{selectedLibrary.type === "Music" ? (
				inSongsView ? (
					<SongsView />
				) : (
					<AlbumsView />
				)
			) : (
				<SeasonsView />
			)}
		</>
	) : null;
}

export default DetailsView;
