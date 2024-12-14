import VideoPlayerControls from "./VideoPlayerControls";
import VideoPlayerOptions from "./VideoPlayerOptions";
import "./VideoControls.scss";

function VideoControls() {
	return (
		<div className="container">
			{!true ? (
				<VideoPlayerControls />
			) : (
				<VideoPlayerOptions />
			)}
		</div>
	);
}

export default VideoControls;
