import VideoPlayerOption from "./utils/VideoPlayerOption"

function VideoPlayerOptions() {
  return (
    <>
      <div className="options-shadow"></div>
      <div className="options-container">
         <VideoPlayerOption text="Audio Delay" value={0} onChange={() => console.log("A")} isSlider={true}/>
         <VideoPlayerOption text="Subs Delay" value={0} onChange={() => console.log("A")} isSlider={true}/>
         <VideoPlayerOption text="Audio Delay" value={0} onChange={() => console.log("A")} isSlider={false}/>
         <VideoPlayerOption text="Audio Delay" value={0} onChange={() => console.log("A")} isSlider={false}/>
         <VideoPlayerOption text="Audio Delay" value={0} onChange={() => console.log("A")} isSlider={false}/>
         <VideoPlayerOption text="Audio Delay" value={0} onChange={() => console.log("A")} isSlider={false}/>
      </div>
    </>
  )
}

export default VideoPlayerOptions