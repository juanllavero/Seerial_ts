import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { togglePause, setCurrentTime, setDuration } from 'redux/slices/videoSlice';
import { closeVideo } from 'redux/slices/videoSlice';
import { RootState } from 'redux/store';
import '../../Controls.scss'
import { toggleMaximize } from 'redux/slices/windowStateSlice';

function Controls() {
    const dispatch = useDispatch();
    const paused = useSelector((state: RootState) => state.video.paused);
    const currentTime = useSelector((state: RootState) => state.video.currentTime);
    const duration = useSelector((state: RootState) => state.video.duration);

    const currentSeason = useSelector((state: RootState) => state.series.selectedSeason);
    const episode = useSelector((state: RootState) => state.episodes.selectedEpisode);

    const isFullscreen = useSelector((state: RootState) => state.windowState.isMaximized);

    window.electronAPI.onWindowStateChange((state: string) => {
        dispatch(toggleMaximize(state === 'fullscreen'));
    });

    // Handle play/pause button click
    const handlePlayPause = () => {
        dispatch(togglePause());
        window.electronAPI.sendCommand('toggle-pause', []);
    };

    // Handle seek slider change
    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(event.target.value);
        dispatch(setCurrentTime(newTime));
        window.electronAPI.sendCommand('seek', [newTime.toString()]);
    };

    // Handle receiving updates from the main process
    useEffect(() => {
        const updateCurrentTime = (_event: Event, time: number) => {
        dispatch(setCurrentTime(time));
        };

        const updateDuration = (_event: Event, duration: number) => {
        dispatch(setDuration(duration));
        };
    }, [dispatch]);

    const handleClose = () => {
        window.electronAPI.stopMPV();
        dispatch(closeVideo());
    };

    return (
        <div className="controls-container">
            <section className="controls-top-bar">
                <button className="controls-svg-button" onClick={handleClose}>Close</button>
                <button className="controls-svg-button" onClick={() => window.electronAPI.setFullscreenControls()}>
                    {
                        isFullscreen ? (
                            <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M30 6V3H45V18H42V8.121L29.121 21L27 18.873L39.879 6H30Z" fill="#FFFFFF"></path><path d="M18.888 27L21 29.124L8.121 42H18V45H3V30H6V39.879L18.888 27Z" fill="#FFFFFF"></path></svg>
                        ) : (
                            <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M30 6V3H45V18H42V8.121L29.121 21L27 18.873L39.879 6H30Z" fill="#FFFFFF"></path><path d="M18.888 27L21 29.124L8.121 42H18V45H3V30H6V39.879L18.888 27Z" fill="#FFFFFF"></path></svg>
                        )
                    }
                </button>
            </section>
            <section className="controls-bottom-bar">
                <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={handleSeek}
                    className="slider"
                />
                <section className="controls">
                    <div className="left-controls">
                        <button className="controls-svg-button" onClick={handlePlayPause}>
                            {paused ? 'Play' : 'Pause'}
                        </button>
                    </div>
                    <div className="center-controls">
                        <button className="controls-svg-button" 
                            onClick={handlePlayPause}
                            disabled={episode && currentSeason && (currentSeason?.episodes.indexOf(episode) > 0) ? (
                                false
                            ) : (
                                true
                            )}>
                            <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H6V42H3V6Z" fill="#FFFFFF"></path><path d="M39.7485 41.7978C39.9768 41.9303 40.236 42.0001 40.5 42C40.8978 42 41.2794 41.842 41.5607 41.5607C41.842 41.2794 42 40.8978 42 40.5V7.50001C41.9998 7.23664 41.9303 6.97795 41.7985 6.74997C41.6666 6.52199 41.477 6.33274 41.2488 6.20126C41.0206 6.06978 40.7618 6.00071 40.4985 6.00098C40.2351 6.00125 39.9764 6.07086 39.7485 6.20281L11.2485 22.7028C11.0212 22.8347 10.8325 23.0239 10.7014 23.2516C10.5702 23.4793 10.5012 23.7375 10.5012 24.0003C10.5012 24.2631 10.5702 24.5213 10.7014 24.749C10.8325 24.9767 11.0212 25.1659 11.2485 25.2978L39.7485 41.7978Z" fill="#FFFFFF"></path></svg>
                        </button>
                        <button className="controls-svg-button" onClick={handlePlayPause}>
                            {paused ? (
                                <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#FFFFFF"></path></svg>
                            ) : (
                                <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M13 8C13 6.89543 13.8954 6 15 6H17C18.1046 6 19 6.89543 19 8V40C19 41.1046 18.1046 42 17 42H15C13.8954 42 13 41.1046 13 40V8Z" fill="#FFFFFF"></path><path d="M29 8C29 6.89543 29.8954 6 31 6H33C34.1046 6 35 6.89543 35 8V40C35 41.1046 34.1046 42 33 42H31C29.8954 42 29 41.1046 29 40V8Z" fill="#FFFFFF"></path></svg>
                            )}
                        </button>
                        <button className="controls-svg-button" 
                            onClick={handlePlayPause}
                            disabled={episode && currentSeason && (currentSeason?.episodes.indexOf(episode) < currentSeason?.episodes.length - 1) ? (
                                false
                            ) : (
                                true
                            )}>
                            <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M42 6H45V42H42V6Z" fill="#FFFFFF"></path><path d="M6.43934 41.5607C6.72064 41.842 7.10218 42 7.5 42C7.764 41.9999 8.02328 41.9299 8.2515 41.7972L36.7515 25.2972C36.9788 25.1653 37.1675 24.9761 37.2986 24.7484C37.4298 24.5207 37.4988 24.2625 37.4988 23.9997C37.4988 23.7369 37.4298 23.4787 37.2986 23.251C37.1675 23.0233 36.9788 22.8341 36.7515 22.7022L8.2515 6.2022C8.02352 6.07022 7.76481 6.00061 7.50139 6.00037C7.23797 6.00012 6.97913 6.06925 6.75091 6.2008C6.52269 6.33235 6.33314 6.52168 6.20132 6.74975C6.0695 6.97782 6.00007 7.23658 6 7.5V40.5C6 40.8978 6.15804 41.2793 6.43934 41.5607Z" fill="#FFFFFF"></path></svg>
                        </button>
                    </div>
                    <div className="right-controls">
                        <button className="controls-svg-button" onClick={handlePlayPause}>
                            {paused ? 'Play' : 'Pause'}
                        </button>
                        <button className="controls-svg-button" onClick={handlePlayPause}>
                            {paused ? 'Play' : 'Pause'}
                        </button>
                        <button className="controls-svg-button" onClick={handlePlayPause}>
                            {paused ? 'Play' : 'Pause'}
                        </button>
                    </div>
                </section>
            </section>
        </div>
    );
};

export default Controls;