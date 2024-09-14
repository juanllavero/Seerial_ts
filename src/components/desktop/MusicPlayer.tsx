import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Slider } from 'primereact/slider';
import ReactHowler from 'react-howler';
import { useState } from 'react';
import { setCurrentSong, toggleMusicPause } from 'redux/slices/musicPlayerSlice';

export const renderMusicPlayer = () => {
    const dispatch = useDispatch();
    const songsList = useSelector((state: RootState) => state.musicPlayer.songsList);
    const currentSong = useSelector((state: RootState) => state.musicPlayer.currentSong);
    const paused = useSelector((state: RootState) => state.musicPlayer.paused);
    const [sliderValue, setSliderValue] = useState<number>(0);
    const [hidePlayer, setHidePlayer] = useState<boolean>(false);

    return (
        <>
            {
                songsList && currentSong && currentSong !== -1 ? (
                    <ReactHowler
                    src={songsList[currentSong].videoSrc}
                    playing={!paused}
                />
                ) : null
            }
            <section className="music-player-container">
                <div className={`music-main ${hidePlayer ? 'music-main-hidden' : ''}`}>
                    <div className="left-panel">
                        <img
                        src={
                            songsList && currentSong !== -1 ? (
                                songsList[currentSong].imgSrc
                            ) : "./src/resources/img/songDefault.png"
                        } alt="Song Cover"
                        onError={(e: any) => {
                            e.target.onerror = null;
                            e.target.src = "./src/resources/img/songDefault.png";
                        }}
                        />
                    </div>
                    <div className="right-panel">

                    </div>
                </div>
                <div className="music-bottom-bar" onClick={() => setHidePlayer(!hidePlayer)}>
                    {/*<Slider value={sliderValue} onChange={(e) => setSliderValue(e.value)} />*/}
                    <div className="music-controls">
                        <div className="music-controls-left">
                            <button onClick={() => dispatch(toggleMusicPause())}>
                                {
                                    paused ? (
                                        <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#FFFFFF"></path></svg>
                                    ) : (
                                        <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M13 8C13 6.89543 13.8954 6 15 6H17C18.1046 6 19 6.89543 19 8V40C19 41.1046 18.1046 42 17 42H15C13.8954 42 13 41.1046 13 40V8Z" fill="#FFFFFF"></path><path d="M29 8C29 6.89543 29.8954 6 31 6H33C34.1046 6 35 6.89543 35 8V40C35 41.1046 34.1046 42 33 42H31C29.8954 42 29 41.1046 29 40V8Z" fill="#FFFFFF"></path></svg>
                                    )
                                }
                            </button>
                        </div>
                        <div className="music-controls-right">
                            <button onClick={() => {
                                if (!paused)
                                    dispatch(toggleMusicPause());
                                
                                dispatch(setCurrentSong(-1));
                            }}>
                                <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M36 9H12C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12V36C9 36.7956 9.31607 37.5587 9.87868 38.1213C10.4413 38.6839 11.2044 39 12 39H36C36.7956 39 37.5587 38.6839 38.1213 38.1213C38.6839 37.5587 39 36.7956 39 36V12C39 11.2044 38.6839 10.4413 38.1213 9.87868C37.5587 9.31607 36.7956 9 36 9Z" fill="#FFFFFF"></path></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}