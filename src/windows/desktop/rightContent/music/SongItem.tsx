import { ReactUtils } from "@data/utils/ReactUtils";
import { EpisodeData } from "@interfaces/EpisodeData";
import {
	setSongs,
	setCurrentSong,
	toggleMusicPause,
} from "@redux/slices/musicPlayerSlice";
import { RootState } from "@redux/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

function SongItem({ song, index }: { song: EpisodeData; index: number }) {
	const dispatch = useDispatch();

	const selectedAlbum = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const musicPaused = useSelector(
		(state: RootState) => state.musicPlayer.paused
	);

	if (!selectedAlbum) return null;

	return (
		<div className="music-player-item">
			<div className="music-player-item-left song-row">
				<div className="song-image-container">
					<span>{song.episodeNumber}</span>
					<div className="song-btn-overlay">
						<button
							onClick={() => {
								dispatch(setSongs(selectedAlbum.episodes));
								dispatch(setCurrentSong(index));

								if (musicPaused) dispatch(toggleMusicPause());
							}}
						>
							<svg
								aria-hidden="true"
								height="22"
								viewBox="0 0 48 48"
								width="22"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z"
									fill="#FFFFFF"
								></path>
							</svg>
						</button>
					</div>
				</div>
				<div className="music-player-item-text">
					<span id="music-player-item-title">{song.name}</span>
					<span>{ReactUtils.formatTime(song.runtimeInSeconds)}</span>
				</div>
			</div>
		</div>
	);
}

export default React.memo(SongItem);
