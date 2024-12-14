import { GoBackIcon, PrevTrackIcon, PlayIcon, NextTrackIcon, SettingsIcon } from "@components/utils/IconLibrary";

function VideoPlayerControls() {
	return (
		<>
			<div className="top-bar">
				<button className="btn-transparent">
					<GoBackIcon />
				</button>
				<span id="time">16:00</span>
			</div>
			<div className="bottom-bar">
				<div className="video-info">
					<span id="title">Video title</span>
					<span id="subtitle">Video subtitle</span>
					<span id="info">Video info</span>
				</div>
				<div className="slider-container">
					<input
						type="range"
						min="0"
						max={26778}
						value={1278}
						step="1"
						style={{
							background: `linear-gradient(to right, #8EDCE6 ${
								(156 * 100) / 26778
							}%, #646464 0px`,
						}}
						onChange={(e) => {
							/*handleSeek(e);
									setTime(Number(e.target.value));*/
						}}
						className="slider"
					/>
				</div>
				<div className="controls">
					<div className="left">
						<button className="btn-transparent"></button>
						<button className="btn-transparent"></button>
					</div>
					<div className="center">
						<button className="btn-transparent">
							<PrevTrackIcon />
						</button>
						<button className="btn-transparent">
							<PlayIcon />
						</button>
						<button className="btn-transparent">
							<NextTrackIcon />
						</button>
					</div>
					<div className="right">
						<button className="btn-transparent">
							<SettingsIcon />
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

export default VideoPlayerControls;
