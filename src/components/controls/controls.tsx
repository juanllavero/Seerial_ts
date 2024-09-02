import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { togglePause, setCurrentTime, setDuration, toggleControls, toggleInSettings, toggleInChapters, changeVolume } from 'redux/slices/videoSlice';
import { RootState } from 'redux/store';
import '../../Controls.scss'
import { toggleMaximize } from 'redux/slices/windowStateSlice';
import { LibraryData } from '@interfaces/LibraryData';
import { SeriesData } from '@interfaces/SeriesData';
import { SeasonData } from '@interfaces/SeasonData';
import { EpisodeData } from '@interfaces/EpisodeData';
import { AudioTrackData } from '@interfaces/AudioTrackData';
import { closeAllMenus, toggleAudioMenu, toggleSubsMenu, toggleSubsSizeMenu, toggleVideoMenu } from 'redux/slices/contextMenuSlice';
import { SubtitleTrackData } from '@interfaces/SubtitleTrackData';
import { VideoTrackData } from '@interfaces/VideoTrackData';
import { ChapterData } from '@interfaces/ChapterData';

function Controls() {
    const dispatch = useDispatch();
    const paused = useSelector((state: RootState) => state.video.paused);
    const currentTime = useSelector((state: RootState) => state.video.currentTime);
    const [time, setTime] = useState(0);
    const duration = useSelector((state: RootState) => state.video.duration);
    const volume = useSelector((state: RootState) => state.video.volume);
    
    let prevVolume: number = 100;

    const [selectedLibrary, setSelectedLibrary] = React.useState<LibraryData | null>(null);
    const [selectedSeries, setSelectedSeries] = React.useState<SeriesData | null>(null);
    const [currentSeason, setCurrentSeason] = React.useState<SeasonData | null>(null);
    const [episode, setEpisode] = React.useState<EpisodeData | null>(null);

    const isFullscreen = useSelector((state: RootState) => state.windowState.isMaximized);

    const [seasonLetter, setSeasonLetter] = useState<String>('');
    const [episodeLetter, setEpisodeLetter] = useState<String>('');
    const [settingsText, setSettingsText] = useState<String>('');

    //#region TRACKS
    const [selectedVideoTrack, setSelectedVideoTrack] = useState<VideoTrackData | undefined>(undefined);
    const [selectedAudioTrack, setSelectedAudioTrack] = useState<AudioTrackData | undefined>(undefined);
    const [selectedSubtitleTrack, setSelectedSubtitleTrack] = useState<SubtitleTrackData | undefined>(undefined);
    const [selectedSubsSize, setSelectedSubsSize] = useState<string | undefined>(undefined);

    const videoMenuOpen = useSelector((state: RootState) => state.contextMenu.videoMenuOpen);
    const audioMenuOpen = useSelector((state: RootState) => state.contextMenu.audioMenuOpen);
    const subsMenuOpen = useSelector((state: RootState) => state.contextMenu.subtitleMenuOpen);
    const subsSizeMenuOpen = useSelector((state: RootState) => state.contextMenu.subtitleSizeMenu);
    //#endregion

    useEffect(() => {
        // Función para obtener las traducciones
        const fetchTranslations = async () => {
        try {
            const seasonLetter = await window.electronAPI.translate('seasonLetter');
            const episodeLetter = await window.electronAPI.translate('episodeLetter');
            setSeasonLetter(seasonLetter);
            setEpisodeLetter(episodeLetter);

            const settingsText = await window.electronAPI.translate('settings');
            setSettingsText(settingsText);
        } catch (error) {
            console.error('Error fetching translations:', error);
        }
    };

    fetchTranslations();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (!paused)
                setTime((prevValue) => prevValue + 1); // Actualiza el slider cada segundo
        }, 1000);
    
        // Cleanup del interval al desmontar el componente
        return () => clearInterval(interval);
    }, [paused]);

    //#region SHOW/HIDE CONTROLS
    const visible = useSelector((state: RootState) => state.video.controlsSown);
    const inSettings = useSelector((state: RootState) => state.video.inSettings);
    const inChapters = useSelector((state: RootState) => state.video.inChapters);
    const [mouseOnUI, setMouseOnUi] = useState(false);
    let timeout: NodeJS.Timeout;

    const hideControls = () => {
        console.log(inSettings);
        dispatch(toggleControls(!inSettings && !mouseOnUI && !paused));
    }

    const showControls = () => {
        if (!visible){
            dispatch(toggleControls(true));
        }

        if (timeout) {
            clearTimeout(timeout);
        }
        // Set a timeout to hide controls after a period of inactivity
        timeout = setTimeout(() => {
            

            hideControls();
        }, 3000); // 3 seconds of inactivity
    };
    //#endregion

    //#region CHAPTER SCROLL
    const handleScroll = (direction: 'left' | 'right') => {
        const scrollContainer = document.getElementById('chapterScroll');
        
        if (scrollContainer){
            const chapterWidth = scrollContainer.firstElementChild?.clientWidth || 0;
            const containerWidth = scrollContainer.clientWidth;
            const chaptersVisible = Math.floor(containerWidth / chapterWidth);

            const scrollAmount = chaptersVisible * chapterWidth;

            console.log(scrollContainer);

            if (direction === 'left') {
                scrollContainer.scrollLeft -= scrollAmount;
            } else if (direction === 'right') {
                scrollContainer.scrollLeft += scrollAmount;
            }
        }
    };
    //#endregion

    useEffect(() => {
        window.ipcRenderer.on('data-to-controls', (_event, library, series, season, e) => {          
          setSelectedLibrary(library);
          setSelectedSeries(series);
          setCurrentSeason(season);
          setEpisode(e);
      
          if (e.currentTime)
            dispatch(setCurrentTime(e.currentTime));
          else
            dispatch(setCurrentTime(0));

          dispatch(setDuration(e.runtimeInSeconds));

          if (e.videoTracks.length > 0)
            setSelectedVideoTrack(e.videoTracks[0]);

          loadTracks();
        });

        window.electronAPI.onWindowStateChange((state: string) => {
            dispatch(toggleMaximize(state === 'fullscreen'));
        });

        // Añadir el listener de eventos cuando el componente se monta
        window.addEventListener('keydown', handleKeyDown);

        // Limpiar el listener cuando el componente se desmonta
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    useEffect(() => {
        window.ipcRenderer.on('show-controls', (_event) => {
            showControls();
        });

        window.ipcRenderer.on('hide-controls', (_event) => {
            hideControls();
        });
    }, [paused, mouseOnUI]);

    const loadTracks = () => {
        //let audioTrackLanguage = currentSeason?.audioTrackLanguage || new Intl.Locale(await Configuration.loadConfig("preferAudioLan", "es-ES")).language;
        let selectedAudioTrack = currentSeason?.selectedAudioTrack;

        setSelectedAudioTrack(episode?.audioTracks[0]);
        setSelectedSubtitleTrack(episode?.subtitleTracks[0]);

        /*episode?.audioTracks.forEach(track => track.selected = false); // Desmarcar todas las pistas

        if (selectedAudioTrack >= 0 && selectedAudioTrack? < audioTracks.length) {
            // Seleccionar la pista de audio por índice si es válida
            audioTracks[selectedAudioTrack].setSelected(true);
        } else {
            // Intentar seleccionar por idioma o la primera pista si no hay coincidencia
            const trackByLanguage = audioTracks.find(track => track.getLanguageTag() === audioTrackLanguage);
            if (trackByLanguage) {
                trackByLanguage.setSelected(true);
                selectedAudioTrack = audioTracks.indexOf(trackByLanguage);
            } else if (audioTracks.length > 0) {
                audioTracks[0].setSelected(true);
                selectedAudioTrack = 0;
            }
        }

        // Actualizar la configuración del reproductor y la temporada
        videoPlayer.setAudioTrack(selectedAudioTrack + 1);
        currentSeason.setAudioTrackLanguage(audioTracks[selectedAudioTrack]?.getLanguageTag() || '');
        currentSeason.setSelectedAudioTrack(selectedAudioTrack);

        const defaultAudioTrackLanguage = new Intl.Locale(Configuration.loadConfig("preferAudioLan", "es-ES")).language;
        const currentAudioTrackLanguage = season.getAudioTrackLanguage() || defaultAudioTrackLanguage;
        let subtitleTrackLanguage = currentSeason.getSubtitleTrackLanguage() || new Intl.Locale(Configuration.loadConfig("preferSubsLan", "es-ES")).language;
        const subsMode = parseInt(Configuration.loadConfig("subsMode", "2"), 10);
        let selectedSubtitleTrack = -1;
        let foreignAudio = defaultAudioTrackLanguage !== currentAudioTrackLanguage;

        subtitleTracks.forEach(track => track.setSelected(false)); // Desmarcar todas las pistas

        if (currentSeason.getSelectedSubtitleTrack() >= 0 && currentSeason.getSelectedSubtitleTrack() < subtitleTracks.length) {
            // Seleccionar la pista de subtítulos por índice si es válida
            selectedSubtitleTrack = currentSeason.getSelectedSubtitleTrack();
            subtitleTracks[selectedSubtitleTrack].setSelected(true);
        } else if (((subsMode === 2 && foreignAudio) || subsMode === 3) && subtitleTracks.length > 0) {
            // Seleccionar subtítulos basados en idioma y modo
            const trackByLanguage = subtitleTracks.find(track => track.getLanguageTag() === subtitleTrackLanguage);
            if (trackByLanguage) {
                trackByLanguage.setSelected(true);
                selectedSubtitleTrack = subtitleTracks.indexOf(trackByLanguage);
            } else if (subtitleTracks.length > 0) {
                subtitleTracks[0].setSelected(true);
                selectedSubtitleTrack = 0;
            }
        } else {
            videoPlayer.disableSubtitles();
        }

        // Actualizar la configuración del reproductor y la temporada
        if (selectedSubtitleTrack >= 0) {
            setSubtitleTrack(selectedSubtitleTrack + 1);
            currentSeason.setSubtitleTrackLanguage(subtitleTracks[selectedSubtitleTrack].getLanguageTag() || '');
            currentSeason.setSelectedSubtitleTrack(selectedSubtitleTrack);
        }*/
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowLeft':
                seekToTime(currentTime);
                break;
            case 'ArrowRight':
                seekToTime(currentTime);
                break;
            case ' ':
                handlePlayPause();
                break;
        }
    };

    // Handle play/pause button click
    const handlePlayPause = () => {
        dispatch(togglePause());
        
        if (!paused){
            window.electronAPI.sendCommand(['set', 'pause', 'yes']);
        }else{
            window.electronAPI.sendCommand(['set', 'pause', 'no']);
        }
    };

    // Handle seek slider change
    const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(event.target.value);
        seekToTime(newTime);
    };

    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(event.target.value);
        setVolume(newVolume);
    }

    const handleClose = () => {
        window.electronAPI.stopMPV();
    };

    const seekToTime = (time: number) => {
        dispatch(setCurrentTime(time));
        window.electronAPI.sendCommand(['seek', time.toString(), 'absolute']);
    }

    const setVolume = (newVolume: number) => {
        prevVolume = newVolume;
        dispatch(changeVolume(newVolume));
        window.electronAPI.sendCommand(['set', 'volume', newVolume.toString()]);
    }

    const toggleMute = (mute: boolean) => {
        let newVolume = prevVolume;
        if (mute)
            newVolume = 0;

        dispatch(changeVolume(newVolume));
        window.electronAPI.sendCommand(['set', 'volume', newVolume.toString()]);
    }

    const setVideoTrack = (index: number, track: VideoTrackData) => {
        if (selectedVideoTrack)
            selectedVideoTrack.selected = false;

        track.selected = true;
        setSelectedVideoTrack(track);
        window.electronAPI.sendCommand(['set', 'vid', `${index}`]);
    }

    const setAudioTrack = (index: number, track: AudioTrackData) => {
        if (selectedAudioTrack)
            selectedAudioTrack.selected = false;

        track.selected = true;
        setSelectedAudioTrack(track);
        window.electronAPI.sendCommand(['set', 'aid', `${index}`]);
    }

    const setSubtitleTrack = (index: number, track: SubtitleTrackData | undefined) => {
        if (selectedSubtitleTrack)
            selectedSubtitleTrack.selected = false;

        if (track)
            track.selected = true;

        setSelectedSubtitleTrack(track);
        window.electronAPI.sendCommand(['set', 'sid', `${index}`]);
    }

    const setSubtitleSize = (size: string) => {
        window.electronAPI.sendCommand(['set', 'sub-scale', `${size}`]);
    }

    function formatTime(seconds: number): string {
        const totalSeconds = Math.floor(seconds);

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
      
        const formattedMinutes = minutes.toString().padStart(2, '0');
        const formattedSeconds = secs.toString().padStart(2, '0');
      
        if (hours > 0) {
          return `${hours}:${formattedMinutes}:${formattedSeconds}`;
        } else {
          return `${formattedMinutes}:${formattedSeconds}`;
        }
    }

    const isCurrentChapter = (chapter: ChapterData) => {
        if (!episode || !episode.chapters) return false;

        let isCurrent = false;
        episode.chapters.forEach((c, index) => {
            const currentChapterStartTime = c.time / 1000;
            const nextChapterStartTime = episode.chapters[index + 1]?.time / 1000;

            if (currentTime >= currentChapterStartTime && (nextChapterStartTime === undefined || currentTime < nextChapterStartTime)) {
                isCurrent = (c === chapter);
            }
        });

        return isCurrent;
    }

    return (
        <div className="controls-container" onMouseMove={showControls} onClick={
            (event) => {
                const target = event.target as Element;

                // Check if the click has been done in a "select" element
                if (!target.closest('.select')) {
                    dispatch(closeAllMenus());
                }
            }
        }>
            <section className={`controls-bar controls-top-bar ${visible ? 'visible' : 'hidden-top'}`}>
                <button className="controls-svg-button" onClick={handleClose}>
                    <img src="./src/assets/svg/windowClose.svg" 
                    style={{width: '22px', height: '24px', filter: 'drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))'}} />
                </button>
                <button className="controls-svg-button" onClick={() => window.electronAPI.setFullscreenControls()}>
                    {
                        isFullscreen ? (
                            <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M30 6V3H45V18H42V8.121L29.121 21L27 18.873L39.879 6H30Z" fill="#FFFFFF" transform="rotate(179.902 36 12)"/><path d="M18.888 27L21 29.124L8.121 42H18V45H3V30H6V39.879L18.888 27Z" fill="#FFFFFF" transform="rotate(180 12 36)"/></svg>
                        ) : (
                            <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M30 6V3H45V18H42V8.121L29.121 21L27 18.873L39.879 6H30Z" fill="#FFFFFF"></path><path d="M18.888 27L21 29.124L8.121 42H18V45H3V30H6V39.879L18.888 27Z" fill="#FFFFFF"></path></svg>
                        )
                    }
                </button>
            </section>
            <section className={`controls-bar controls-bottom-bar ${visible ? 'visible' : 'hidden-bottom'}`} 
            onMouseEnter={() => setMouseOnUi(true)}
            onMouseLeave={() => setMouseOnUi(false)}>
                {
                    inSettings ? (
                        <section className="settings-box">
                            <h1>{settingsText}</h1>
                            <section className="settings-columns">
                                <div className="settings-text-box">
                                    <span>Vídeo</span>
                                    <span>Audio</span>
                                    <span>Subtítulos</span>
                                    <span>Tamaño de los subtítulos</span>
                                </div>
                                <div className="settings-options-box">
                                    <div className="dropdown">
                                        <div className={episode?.videoTracks && episode?.videoTracks.length > 1 ? 'select' : 'select-plain'} onClick={() => {
                                            if (episode?.videoTracks && episode?.videoTracks.length > 1){
                                                if (!videoMenuOpen)
                                                    dispatch(closeAllMenus());
                                                dispatch(toggleVideoMenu());
                                            }
                                        }} onAuxClick={() => {dispatch(closeAllMenus())}}>
                                            <span className="selected">{selectedVideoTrack?.displayTitle}</span>
                                            {
                                                episode?.videoTracks && episode?.videoTracks.length > 1 ? (
                                                    <div className={`arrow ${videoMenuOpen ? (' arrow-rotate'): ('')}`}></div>
                                                ) : (<></>)
                                            }
                                        </div>
                                        <ul className={`menu ${videoMenuOpen ? (' menu-open'): ('')}`}>
                                            {episode?.videoTracks.map((track: any, index: number) => (
                                                <li key={track.title} className={track == selectedVideoTrack ? ('active') : ('')} onClick={() => {
                                                    setVideoTrack(index + 1, track);
                                                    dispatch(toggleVideoMenu());
                                                }}>
                                                    {track.displayTitle}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="dropdown">
                                        <div className="select" onClick={() => {
                                            if (!audioMenuOpen)
                                                dispatch(closeAllMenus());
                                            dispatch(toggleAudioMenu());
                                        }} onAuxClick={() => {dispatch(closeAllMenus())}}>
                                            <span className="selected">{selectedAudioTrack?.displayTitle}</span>
                                            <div className={`arrow ${audioMenuOpen ? (' arrow-rotate'): ('')}`}></div>
                                        </div>
                                        <ul className={`menu ${audioMenuOpen ? (' menu-open'): ('')}`}>
                                            {episode?.audioTracks.map((track: any, index: number) => (
                                                <li key={track.title} className={track == selectedAudioTrack ? ('active') : ('')} onClick={() => {
                                                    setAudioTrack(index + 1, track);
                                                    dispatch(toggleAudioMenu());
                                                }}>
                                                    {track.displayTitle}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="dropdown">
                                        <div className="select" onClick={() => {
                                            if (!subsMenuOpen)
                                                dispatch(closeAllMenus());
                                            dispatch(toggleSubsMenu());
                                        }} onAuxClick={() => {dispatch(closeAllMenus())}}>
                                            <span className="selected">{selectedSubtitleTrack ? selectedSubtitleTrack.displayTitle : 'Ninguno'}</span>
                                            <div className={`arrow ${subsMenuOpen ? (' arrow-rotate'): ('')}`}></div>
                                        </div>
                                        <ul className={`menu ${subsMenuOpen ? (' menu-open'): ('')}`}>
                                            <li key="0" className={!selectedSubtitleTrack ? ('active') : ('')} onClick={() => {
                                                    setSubtitleTrack(0, undefined);
                                                    dispatch(toggleSubsMenu());
                                            }}>Ninguno</li>
                                            {episode?.subtitleTracks.map((track: any, index: number) => (
                                                <li key={track.title} className={track == selectedSubtitleTrack ? ('active') : ('')} onClick={() => {
                                                    setSubtitleTrack(index + 1, track);
                                                    dispatch(toggleSubsMenu());
                                                }}>
                                                    {track.displayTitle}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="dropdown">
                                        <div className="select" onClick={() => {
                                            if (!subsSizeMenuOpen)
                                                dispatch(closeAllMenus());
                                            dispatch(toggleSubsSizeMenu());
                                        }} onAuxClick={() => {dispatch(closeAllMenus())}}>
                                            <span className="selected">{selectedSubsSize}</span>
                                            <div className={`arrow ${subsSizeMenuOpen ? (' arrow-rotate'): ('')}`}></div>
                                        </div>
                                        <ul className={`menu ${subsSizeMenuOpen ? (' menu-open'): ('')}`}>
                                            <li key="0.3" className={"Tiny" == selectedSubsSize ? ('active') : ('')} onClick={() => {
                                                setSelectedSubsSize("Tiny");
                                                setSubtitleSize("0.3");
                                                dispatch(toggleSubsSizeMenu());
                                            }}>Tiny</li>
                                            <li key="0.5" className={"Small" == selectedSubsSize ? ('active') : ('')} onClick={() => {
                                                setSelectedSubsSize("Small");
                                                setSubtitleSize("0.5");
                                                dispatch(toggleSubsSizeMenu());
                                            }}>Small</li>
                                            <li key="0.75" className={"Normal" == selectedSubsSize ? ('active') : ('')} onClick={() => {
                                                setSelectedSubsSize("Normal");
                                                setSubtitleSize("0.75");
                                                dispatch(toggleSubsSizeMenu());
                                            }}>Normal</li>
                                            <li key="1.0" className={"Large" == selectedSubsSize ? ('active') : ('')} onClick={() => {
                                                setSelectedSubsSize("Large");
                                                setSubtitleSize("1.0");
                                                dispatch(toggleSubsSizeMenu());
                                            }}>Large</li>
                                            <li key="1.3" className={"Huge" == selectedSubsSize ? ('active') : ('')} onClick={() => {
                                                setSelectedSubsSize("Huge");
                                                setSubtitleSize("1.3");
                                                dispatch(toggleSubsSizeMenu());
                                            }}>Huge</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        </section>
                    ) : (<></>)
                }
                {
                    inChapters ? (
                        <section className="chapters-container">
                            <section className="chapters-top">
                                <span>Selección de capítulos</span>
                                <div>
                                    <button className="controls-svg-button" onClick={() => {handleScroll('left')}}>
                                        <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M12.7869 24.3848L31.1716 42.7696L34.0001 39.9411L18.4437 24.3848L34.0001 8.82843L31.1716 6L12.7869 24.3848Z" fill="#FFFFFF"></path></svg>
                                    </button>
                                    <button className="controls-svg-button" onClick={() => {handleScroll('right')}}>
                                        <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M35.2132 24.3848L16.8284 42.7696L14 39.9411L29.5564 24.3848L14 8.82843L16.8284 6L35.2132 24.3848Z" fill="#FFFFFF"></path></svg>
                                    </button>
                                </div>
                            </section>
                            <section className="chapters-box" id="chapterScroll">
                                {episode?.chapters.map((chapter: ChapterData, index: number) => (
                                    <div key={chapter.title}>
                                        <img src="./src/resources/img/black.png" alt="Chapter thumbnail" 
                                            className={
                                                isCurrentChapter(chapter) ? "chapter-selected" : ""
                                            }
                                            onClick={
                                                () => {
                                                    seekToTime(chapter.time / 1000);
                                                }
                                            }/>
                                        <span>{index + 1}. {chapter.title}</span>
                                        <span>{chapter.displayTime}</span>
                                    </div>
                                ))}
                            </section>
                        </section>
                    ) : (<></>)
                }
                <div className="controls-slider-div">
                    <input
                    type="range"
                    min="0"
                    max={duration}
                    value={time}
                    step="1"
                    onChange={(e) => {
                        handleSeek(e);
                        setTime(Number(e.target.value));
                    }}
                    className="slider"/>
                </div>
                <section className="controls">
                    <section className="left-controls-section">
                        <div className="left-controls">
                            <span id="title">
                                {
                                    selectedLibrary?.type != "Shows" ? (
                                        episode?.name
                                    ) : (
                                        selectedSeries?.name
                                    )
                                }
                            </span>
                            <span id="subtitle">
                                {
                                    selectedLibrary?.type != "Shows" ? (
                                        episode?.year
                                    ) : (
                                        `${seasonLetter}${episode?.seasonNumber?.toString() ?? ''} · ${episodeLetter}${episode?.episodeNumber ?? ''} — ${episode?.name ?? ''}`
                                    )
                                }
                            </span>
                            <span id="time">{formatTime(time)} / {formatTime(duration - time)}</span>
                        </div>
                        <div className="center-controls">
                            <button className="controls-svg-button" 
                                onClick={handlePlayPause}
                                disabled={episode && currentSeason && (currentSeason.episodes.indexOf(episode) > 0) ? (
                                    false
                                ) : (
                                    true
                                )}>
                                <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H6V42H3V6Z" fill="#FFFFFF"></path><path d="M39.7485 41.7978C39.9768 41.9303 40.236 42.0001 40.5 42C40.8978 42 41.2794 41.842 41.5607 41.5607C41.842 41.2794 42 40.8978 42 40.5V7.50001C41.9998 7.23664 41.9303 6.97795 41.7985 6.74997C41.6666 6.52199 41.477 6.33274 41.2488 6.20126C41.0206 6.06978 40.7618 6.00071 40.4985 6.00098C40.2351 6.00125 39.9764 6.07086 39.7485 6.20281L11.2485 22.7028C11.0212 22.8347 10.8325 23.0239 10.7014 23.2516C10.5702 23.4793 10.5012 23.7375 10.5012 24.0003C10.5012 24.2631 10.5702 24.5213 10.7014 24.749C10.8325 24.9767 11.0212 25.1659 11.2485 25.2978L39.7485 41.7978Z" fill="#FFFFFF"></path></svg>
                            </button>
                            <button className="controls-svg-button" onClick={handlePlayPause}>
                                {paused ? (
                                    <svg aria-hidden="true" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#FFFFFF"></path></svg>
                                ) : (
                                    <svg aria-hidden="true" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M13 8C13 6.89543 13.8954 6 15 6H17C18.1046 6 19 6.89543 19 8V40C19 41.1046 18.1046 42 17 42H15C13.8954 42 13 41.1046 13 40V8Z" fill="#FFFFFF"></path><path d="M29 8C29 6.89543 29.8954 6 31 6H33C34.1046 6 35 6.89543 35 8V40C35 41.1046 34.1046 42 33 42H31C29.8954 42 29 41.1046 29 40V8Z" fill="#FFFFFF"></path></svg>
                                )}
                            </button>
                            <button className="controls-svg-button" 
                                onClick={handlePlayPause}
                                disabled={episode && currentSeason && (currentSeason.episodes.indexOf(episode) < currentSeason.episodes.length - 1) ? (
                                    false
                                ) : (
                                    true
                                )}>
                                <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M42 6H45V42H42V6Z" fill="#FFFFFF"></path><path d="M6.43934 41.5607C6.72064 41.842 7.10218 42 7.5 42C7.764 41.9999 8.02328 41.9299 8.2515 41.7972L36.7515 25.2972C36.9788 25.1653 37.1675 24.9761 37.2986 24.7484C37.4298 24.5207 37.4988 24.2625 37.4988 23.9997C37.4988 23.7369 37.4298 23.4787 37.2986 23.251C37.1675 23.0233 36.9788 22.8341 36.7515 22.7022L8.2515 6.2022C8.02352 6.07022 7.76481 6.00061 7.50139 6.00037C7.23797 6.00012 6.97913 6.06925 6.75091 6.2008C6.52269 6.33235 6.33314 6.52168 6.20132 6.74975C6.0695 6.97782 6.00007 7.23658 6 7.5V40.5C6 40.8978 6.15804 41.2793 6.43934 41.5607Z" fill="#FFFFFF"></path></svg>
                            </button>
                        </div>
                    </section>
                    <div className="right-controls">
                        <button className={`controls-svg-button ${inSettings ? ' button-active' : ''}`} 
                            onClick={() => {
                                dispatch(toggleInChapters(false));
                                dispatch(toggleInSettings(!inSettings));
                            }}>
                            <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M38.85 12H45V15H38.85C38.1 18.45 35.1 21 31.5 21C27.9 21 24.9 18.45 24.15 15H3V12H24.15C24.9 8.55 27.9 6 31.5 6C35.1 6 38.1 8.55 38.85 12ZM27 13.5C27 16.05 28.95 18 31.5 18C34.05 18 36 16.05 36 13.5C36 10.95 34.05 9 31.5 9C28.95 9 27 10.95 27 13.5Z" fill="#FFFFFF" fillRule="evenodd"></path><path clipRule="evenodd" d="M9.15 36H3V33H9.15C9.9 29.55 12.9 27 16.5 27C20.1 27 23.1 29.55 23.85 33H45V36H23.85C23.1 39.45 20.1 42 16.5 42C12.9 42 9.9 39.45 9.15 36ZM21 34.5C21 31.95 19.05 30 16.5 30C13.95 30 12 31.95 12 34.5C12 37.05 13.95 39 16.5 39C19.05 39 21 37.05 21 34.5Z" fill="#FFFFFF" fillRule="evenodd"></path></svg>
                        </button>
                        {
                            !episode?.chapters || episode?.chapters.length > 0 ? (
                                <button className={`controls-svg-button ${inChapters ? ' button-active' : ''}`} 
                                    onClick={() => {
                                        dispatch(toggleInSettings(false));
                                        dispatch(toggleInChapters(!inChapters));
                                    }}>
                                    <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M15 19V13C14.9991 12.2046 14.6827 11.4421 14.1203 10.8797C13.5579 10.3173 12.7954 10.0009 12 10H6C5.20463 10.0009 4.4421 10.3173 3.87969 10.8797C3.31728 11.4421 3.00091 12.2046 3 13V19C3.00091 19.7954 3.31728 20.5579 3.87969 21.1203C4.4421 21.6827 5.20463 21.9991 6 22H12C12.7954 21.9991 13.5579 21.6827 14.1203 21.1203C14.6827 20.5579 14.9991 19.7954 15 19Z" fill="#FFFFFF"></path><path d="M30 13V19C29.9989 19.7953 29.6825 20.5578 29.1201 21.1201C28.5578 21.6825 27.7953 21.9989 27 22H21C20.2046 21.9991 19.4421 21.6827 18.8797 21.1203C18.3173 20.5579 18.0009 19.7954 18 19V13C18.0009 12.2046 18.3173 11.4421 18.8797 10.8797C19.4421 10.3173 20.2046 10.0009 21 10H27C27.7953 10.0011 28.5578 10.3175 29.1201 10.8799C29.6825 11.4422 29.9989 12.2047 30 13Z" fill="#FFFFFF"></path><path d="M45 13V19C44.9989 19.7953 44.6825 20.5578 44.1201 21.1201C43.5578 21.6825 42.7953 21.9989 42 22H36C35.2047 21.9989 34.4422 21.6825 33.8799 21.1201C33.3175 20.5578 33.0011 19.7953 33 19V13C33.0011 12.2047 33.3175 11.4422 33.8799 10.8799C34.4422 10.3175 35.2047 10.0011 36 10H42C42.7953 10.0011 43.5578 10.3175 44.1201 10.8799C44.6825 11.4422 44.9989 12.2047 45 13Z" fill="#FFFFFF"></path><path d="M45 28V34C44.9989 34.7953 44.6825 35.5578 44.1201 36.1201C43.5578 36.6825 42.7953 36.9989 42 37H36C35.2047 36.9989 34.4422 36.6825 33.8799 36.1201C33.3175 35.5578 33.0011 34.7953 33 34V28C33.0011 27.2047 33.3175 26.4422 33.8799 25.8799C34.4422 25.3175 35.2047 25.0011 36 25H42C42.7953 25.0011 43.5578 25.3175 44.1201 25.8799C44.6825 26.4422 44.9989 27.2047 45 28Z" fill="#FFFFFF"></path><path d="M30 34V28C29.9989 27.2047 29.6825 26.4422 29.1201 25.8799C28.5578 25.3175 27.7953 25.0011 27 25H21C20.2046 25.0009 19.4421 25.3173 18.8797 25.8797C18.3173 26.4421 18.0009 27.2046 18 28V34C18.0009 34.7954 18.3173 35.5579 18.8797 36.1203C19.4421 36.6827 20.2046 36.9991 21 37H27C27.7953 36.9989 28.5578 36.6825 29.1201 36.1201C29.6825 35.5578 29.9989 34.7953 30 34Z" fill="#FFFFFF"></path><path d="M15 28V34C14.9991 34.7954 14.6827 35.5579 14.1203 36.1203C13.5579 36.6827 12.7954 36.9991 12 37H6C5.20463 36.9991 4.4421 36.6827 3.87969 36.1203C3.31728 35.5579 3.00091 34.7954 3 34V28C3.00091 27.2046 3.31728 26.4421 3.87969 25.8797C4.4421 25.3173 5.20463 25.0009 6 25H12C12.7954 25.0009 13.5579 25.3173 14.1203 25.8797C14.6827 26.4421 14.9991 27.2046 15 28Z" fill="#FFFFFF"></path></svg>
                                </button>
                            ) : (<></>)
                        }
                        <button className="controls-svg-button" onClick={() => {toggleMute(volume != 0)}}>
                            {
                                volume == 0 ? (
                                    <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M16.7779 36.9268C16.8854 36.9746 17.0009 36.9995 17.1176 37C17.3517 37 17.5761 36.9021 17.7416 36.7279C17.907 36.5537 18 36.3175 18 36.0711V11.9203C17.9967 11.6753 17.9015 11.4416 17.7353 11.2701C17.57 11.0971 17.3463 11 17.1132 11C16.8801 11 16.6565 11.0971 16.4912 11.2701L9.76765 18.4225H3.88235C3.64834 18.4225 3.42391 18.5203 3.25844 18.6945C3.09296 18.8687 3 19.105 3 19.3513V28.6401C3 28.8865 3.09296 29.1227 3.25844 29.2969C3.42391 29.4711 3.64834 29.569 3.88235 29.569H9.76765L16.4912 36.7213C16.5729 36.8091 16.6703 36.8789 16.7779 36.9268Z" fill="#FFFFFF"></path><path d="M38.385 16.5L40.5 18.615L35.115 24L40.5 29.385L38.385 31.5L33 26.115L27.615 31.5L25.5 29.385L30.885 24L25.5 18.615L27.615 16.5L33 21.885L38.385 16.5Z" fill="#FFFFFF"></path></svg>
                                ) : volume > 0 && volume < 40 ? (
                                    <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M16.7779 36.9268C16.8854 36.9746 17.0009 36.9995 17.1176 37C17.3517 37 17.5761 36.9021 17.7416 36.7279C17.907 36.5537 18 36.3175 18 36.0711V11.9203C17.9967 11.6753 17.9015 11.4416 17.7353 11.2701C17.57 11.0971 17.3463 11 17.1132 11C16.8801 11 16.6565 11.0971 16.4912 11.2701L9.76765 18.4225H3.88235C3.64834 18.4225 3.42391 18.5203 3.25844 18.6945C3.09296 18.8687 3 19.105 3 19.3513V28.6401C3 28.8865 3.09296 29.1227 3.25844 29.2969C3.42391 29.4711 3.64834 29.569 3.88235 29.569H9.76765L16.4912 36.7213C16.5729 36.8091 16.6703 36.8789 16.7779 36.9268Z" fill="#FFFFFF"></path><path clipRule="evenodd" d="M24.1195 15.7052L22 17.8255C23.583 19.4877 24.4671 21.6944 24.4697 23.9899C24.4723 26.2853 23.5932 28.494 22.0139 30.1598L24.1343 32.2801C26.277 30.0522 27.4725 27.0805 27.4697 23.9895C27.4669 20.8986 26.266 17.9292 24.1195 15.7052Z" fill="#FFFFFF" fillRule="evenodd"></path></svg>
                                ) : volume >= 40 && volume  < 80 ? (
                                    <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M28.3604 11.4639L30.4806 9.34351C34.3167 13.2534 36.4667 18.511 36.4695 23.9885C36.4723 29.466 34.3274 34.7262 30.4953 38.64L28.3754 36.5201C31.6443 33.1682 33.4727 28.6709 33.4698 23.9889C33.467 19.307 31.6333 14.8118 28.3604 11.4639Z" fill="#FFFFFF"></path><path d="M17.1176 37C17.0009 36.9995 16.8854 36.9746 16.7779 36.9268C16.6703 36.879 16.5729 36.8091 16.4912 36.7214L9.76765 29.569H3.88235C3.64834 29.569 3.42391 29.4712 3.25844 29.297C3.09296 29.1228 3 28.8865 3 28.6401V19.3514C3 19.105 3.09296 18.8688 3.25844 18.6946C3.42391 18.5204 3.64834 18.4225 3.88235 18.4225H9.76765L16.4912 11.2701C16.6565 11.0971 16.8801 11 17.1132 11C17.3463 11 17.57 11.0971 17.7353 11.2701C17.9015 11.4416 17.9967 11.6754 18 11.9204V36.0712C18 36.3175 17.907 36.5538 17.7416 36.728C17.5761 36.9022 17.3517 37 17.1176 37Z" fill="#FFFFFF"></path><path d="M24.1196 15.7051C26.2662 17.9291 27.4669 20.8987 27.4697 23.9896C27.4725 27.0806 26.277 30.0523 24.1343 32.2801L22.0139 30.1599C23.5932 28.4941 24.4723 26.2853 24.4697 23.9899C24.4671 21.6945 23.583 19.4877 22 17.8255L24.1196 15.7051Z" fill="#FFFFFF"></path></svg>
                                ) : (
                                    <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M45.4697 24C45.4697 31.8596 42.3761 39.4034 36.8578 45H36.8548L34.7326 42.8781C39.693 37.8428 42.4722 31.0574 42.4694 23.9892C42.4666 16.921 39.682 10.1379 34.7176 5.10645L36.8241 3H36.8578C42.3761 8.59661 45.4697 16.1404 45.4697 24Z" fill="#FFFFFF"></path><path d="M30.4806 9.34347L28.3604 11.4639C31.6333 14.8118 33.467 19.307 33.4698 23.9889C33.4727 28.6708 31.6443 33.1682 28.3754 36.52L30.4953 38.64C34.3274 34.7262 36.4723 29.4659 36.4695 23.9884C36.4667 18.5109 34.3167 13.2533 30.4806 9.34347Z" fill="#FFFFFF"></path><path d="M16.7779 36.9268C16.8854 36.9746 17.0009 36.9995 17.1176 37C17.3517 37 17.5761 36.9021 17.7416 36.7279C17.907 36.5537 18 36.3175 18 36.0711V11.9203C17.9967 11.6753 17.9015 11.4416 17.7353 11.2701C17.57 11.0971 17.3463 11 17.1132 11C16.8801 11 16.6565 11.0971 16.4912 11.2701L9.76765 18.4225H3.88235C3.64834 18.4225 3.42391 18.5203 3.25844 18.6945C3.09296 18.8687 3 19.105 3 19.3513V28.6401C3 28.8865 3.09296 29.1227 3.25844 29.2969C3.42391 29.4711 3.64834 29.569 3.88235 29.569H9.76765L16.4912 36.7213C16.5729 36.8091 16.6703 36.8789 16.7779 36.9268Z" fill="#FFFFFF"></path><path d="M24.1195 15.7052L22 17.8255C23.583 19.4877 24.4671 21.6944 24.4697 23.9899C24.4723 26.2853 23.5932 28.494 22.0139 30.1598L24.1343 32.2801C26.277 30.0522 27.4725 27.0805 27.4697 23.9895C27.4669 20.8986 26.266 17.9292 24.1195 15.7052Z" fill="#FFFFFF"></path></svg>
                                )
                            }
                        </button>
                        <input
                        type="range"
                        min="0"
                        max={100}
                        value={volume}
                        onChange={handleVolumeChange}
                        className="slider vertical-slider"/>
                    </div>
                </section>
            </section>
        </div>
    );
};

export default Controls;