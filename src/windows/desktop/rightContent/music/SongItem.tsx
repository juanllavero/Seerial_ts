import { PlayIcon } from "@components/utils/IconLibrary";
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
					<span className="number">{song.episodeNumber}</span>
					<div className="song-btn-overlay">
						<button
							onClick={() => {
								dispatch(setSongs(selectedAlbum.episodes));
								dispatch(setCurrentSong(index));

								if (musicPaused) dispatch(toggleMusicPause());
							}}
						>
							<PlayIcon />
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
