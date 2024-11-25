import { WindowCloseIcon } from "@components/utils/IconLibrary"
import "./Downloaders.scss"
import VerticalResults from "./utils/VerticalResults"
import VideoAudioSearch from "./utils/VideoAudioSearch"
import { useState } from "react";

function VideoDownloader() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="downloader-container">
      <div className="downloader-window">
        <header>
          <span>Video Downloader</span>
          <button>
            <WindowCloseIcon />
          </button>
        </header>
        <VideoAudioSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery}/>
        <VerticalResults searchQuery={searchQuery}/>
      </div>
    </div>
  )
}

export default VideoDownloader