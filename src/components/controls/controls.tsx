import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { togglePause, setCurrentTime, setDuration } from 'redux/slices/videoSlice';
import { closeVideo } from 'redux/slices/videoSlice';
import { RootState } from 'redux/store';
import '../../controls.css'

function Controls() {
    const dispatch = useDispatch();
    const paused = useSelector((state: RootState) => state.video.paused);
    const currentTime = useSelector((state: RootState) => state.video.currentTime);
    const duration = useSelector((state: RootState) => state.video.duration);

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
                <button className="controls-svg-button" onClick={handleClose}>Maximize</button>
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