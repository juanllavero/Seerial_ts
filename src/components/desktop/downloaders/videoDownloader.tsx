import { WindowCloseIcon } from "@components/utils/IconLibrary"
import "./Downloaders.scss"
import VerticalResults from "./utils/VerticalResults"
import VideoAudioSearch from "./utils/VideoAudioSearch"

function VideoDownloader() {
  return (
    <div className="downloader-container">
      <div className="downloader-window">
        <header>
          <span>Video Downloader</span>
          <button>
            <WindowCloseIcon />
          </button>
        </header>
        <VideoAudioSearch />
        <VerticalResults />
      </div>
    </div>
  )
}

export default VideoDownloader