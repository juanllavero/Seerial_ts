import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Slider } from 'primereact/slider';
import ReactHowler from 'react-howler';
import { useEffect, useRef, useState } from 'react';
import { setCurrentSong, setSongs, toggleMusicPause } from 'redux/slices/musicPlayerSlice';
import { changeMenuSection } from 'redux/slices/menuSectionsSlice';
import { Section } from 'data/enums/Section';
import { EpisodeData } from '@interfaces/EpisodeData';
import { ReactUtils } from 'data/utils/ReactUtils';
import { setGradientLoaded } from 'redux/slices/imageLoadedSlice';

export const renderMusicPlayer = () => {
    const dispatch = useDispatch();
    const songsList = useSelector((state: RootState) => state.musicPlayer.songsList);
    const currentSong = useSelector((state: RootState) => state.musicPlayer.currentSong);
    const paused = useSelector((state: RootState) => state.musicPlayer.paused);
    const [sliderValue, setSliderValue] = useState<number>(0);
    const [hidePlayer, setHidePlayer] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState<number>(0);  // Para controlar el tiempo actual
    const [duration, setDuration] = useState<number>(0);        // Para almacenar la duración total
    const [volume, setVolume] = useState<number>(1); // Valor por defecto: 1 (100%)
    const howlerRef = useRef<ReactHowler>(null);
    const menuSection = useSelector((state: RootState) => state.sectionState.menuSection);
    const [showMore, setShowMore] = useState<boolean>(false);

    const gradientLoaded = useSelector((state: RootState) => state.imageLoaded.gradientLoaded);

    // Función para actualizar el tiempo de reproducción
    const updateTime = () => {
        if (howlerRef.current) {
            const time = howlerRef.current.seek();  // Obtiene el tiempo actual de reproducción
            setCurrentTime(time);
            setSliderValue((time / duration) * 100);  // Actualiza el slider proporcionalmente
        }
    };

    useEffect(() => {
        

        
        setTimeout(() => {
            dispatch(setGradientLoaded(false));
            setTimeout(() => {
                if (songsList && currentSong !== -1) {
                    const imgSrc = songsList[currentSong].imgSrc;
        
                    if (imgSrc !== ""){
                        ReactUtils.getDominantColors(imgSrc);
                    } else {
                        ReactUtils.getDominantColors("./src/resources/img/songDefault.png");
                    }
                }
            }, 50);
        }, 300);
    }, [currentSong, songsList]);

    // Capturar la tecla "Espacio" y despachar la acción de pausar o reanudar la música
    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (event.code === 'Space') {
                event.preventDefault(); // Prevenir el scroll por defecto al presionar espacio
                dispatch(toggleMusicPause());
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        // Limpieza del evento al desmontar el componente
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [dispatch]);

    // Recuperar el volumen de localStorage cuando la app se carga
    useEffect(() => {
        const savedVolume = localStorage.getItem('volume');
        if (savedVolume) {
            setVolume(parseFloat(savedVolume));
        }
    }, []);

    // Hook para manejar actualizaciones periódicas del tiempo de reproducción
    useEffect(() => {
        if (!paused) {
            const interval = setInterval(() => {
                updateTime();
            }, 1000);  // Actualiza cada segundo
            return () => clearInterval(interval);
        }
    }, [paused, duration]);

    useEffect(() => {
        // Comprobar si hay letas
        dispatch(changeMenuSection(Section.Details));
    }, [hidePlayer]);

    // Manejar la carga del archivo y establecer la duración
    const handleLoad = () => {
        if (howlerRef.current) {
            setDuration(howlerRef.current.duration());  // Establece la duración de la canción
        }
    };

    // Manejar cambios en el slider
    const handleSliderChange = (value: number) => {
        setSliderValue(value);
        if (howlerRef.current) {
            const seekTime = (value / 100) * duration;  // Calcula el nuevo tiempo de reproducción
            howlerRef.current.seek(seekTime);  // Ajusta la reproducción
            setCurrentTime(seekTime);  // Actualiza el estado del tiempo actual
        }
    };

    // Función para manejar el cambio de volumen
    const handleVolumeChange = (value: number) => {
        setVolume(value);
        localStorage.setItem('volume', value.toString()); // Guardar el volumen en localStorage
    };

    return (
        <>
            {
                songsList !== null && currentSong && currentSong !== -1 ? (
                    <ReactHowler
                        ref={howlerRef}
                        src={songsList[currentSong].videoSrc}
                        playing={!paused}
                        onLoad={handleLoad}
                        volume={volume}
                    />
                ) : null
            }
            <section className={`music-player-container ${songsList && currentSong !== -1 ? 'show-music-player' : ''}`}>
                <div className={`music-main ${hidePlayer ? 'music-main-hidden' : ''}`}>
                    <div className={`gradient-background ${gradientLoaded ? 'fade-in' : ''}`}
                        style={{
                            background: `${ReactUtils.getGradientBackground()}`,
                        }}/>
                    <div className={`left-panel ${showMore ? '' : 'expand-left-panel'}`}>
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
                        <div className="left-panel-info">
                            {songsList && currentSong !== -1 ? (
                                    <>
                                        <span id="left-panel-info-title">{songsList[currentSong].name}</span>
                                        <span id="left-panel-info-subtitle">{
                                            songsList[currentSong].album && songsList[currentSong].albumArtist ? (
                                                `${songsList[currentSong].album} — ${songsList[currentSong].albumArtist}`
                                            ) : songsList[currentSong].album ? (
                                                songsList[currentSong].album
                                            ) : (
                                                songsList[currentSong].albumArtist
                                            )
                                        }</span>
                                    </>
                                ) : null
                            }
                        </div>
                    </div>
                    <div className={`right-panel ${showMore ? '' : 'hide-right-panel'}`}>
                            <div className="music-player-upper-btns">
                                <button className={menuSection === Section.Advanced ? 'button-selected' : ''} onClick={() => dispatch(changeMenuSection(Section.Advanced))}>
                                    <span>SIGUIENTE</span>
                                </button>
                                <button className={menuSection === Section.Details ? 'button-selected' : ''} onClick={() => dispatch(changeMenuSection(Section.Details))}>
                                    <span>LETRAS</span>
                                </button>
                            </div>
                            {
                                menuSection === Section.Advanced ? (
                                    <div className="music-player-scroll scroll" id="scroll">
                                        {songsList.slice(0, 150).map((song: EpisodeData, index: number) => (
                                            <div className="music-player-item">
                                                <div className="music-player-item-left song-row">
                                                    <div className="song-image-container">
                                                        <img
                                                        loading="lazy"
                                                        src={song.imgSrc}
                                                        alt="Song Image"
                                                        style={{ width: `50px`, height: `50px` }}
                                                        onError={(e: any) => {
                                                            e.target.onerror = null;
                                                            e.target.src = "./src/resources/img/songDefault.png";
                                                        }}
                                                        />
                                                        <div className="song-btn-overlay">
                                                            <button onClick={
                                                                () => {
                                                                    dispatch(setSongs(songsList));
                                                                    dispatch(setCurrentSong(index));
                                                                    dispatch(toggleMusicPause());
                                                                }
                                                            }>
                                                                <svg aria-hidden="true" height="22" viewBox="0 0 48 48" width="22" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#FFFFFF"></path></svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="music-player-item-text">
                                                        <span id="music-player-item-title">{song.name}</span>
                                                        <span>{song.album}</span>
                                                    </div>
                                                </div>
                                                <div className="music-player-item-left">
                                                    <span>{ReactUtils.formatTime(song.runtimeInSeconds)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div>

                                        </div>
                                        <div className="music-player-scroll scroll" id="scroll">
                                            
                                        </div>
                                    </>
                                )
                            }
                    </div>
                </div>
                <div className="music-bottom-bar" onClick={() => setHidePlayer(!hidePlayer)}>
                    <Slider
                        value={sliderValue}
                        onChange={(e) => handleSliderChange(e.value as number)}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <div className="music-controls">
                        <div className="music-controls-left">
                            <div className="music-controls-left-box">
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
                                <div className="music-controls-text">
                                    <span id="music-title">
                                        {
                                            songsList && currentSong !== -1 ? (
                                                songsList[currentSong].name
                                            ) : ""
                                        }
                                    </span>
                                    <span id="music-subtitle">
                                        {
                                            songsList && currentSong !== -1 ? (
                                                <>
                                                    {songsList[currentSong].album} - {songsList[currentSong].year}
                                                </>
                                            ) : ""
                                        }
                                    </span>
                                    <span id="music-time">
                                        {
                                            songsList && currentSong !== -1 ? (
                                                `${ReactUtils.formatTime(currentTime)} / ${ReactUtils.formatTime(duration)}`
                                            ) : ""
                                        }
                                    </span>
                                </div>
                            </div>
                            <div className="music-controls-btns">
                                <button className="svg-button-desktop-transparent" onClick={(e) => {
                                    const currentTime = howlerRef.current?.seek();
                                
                                    if ((currentTime && currentTime >= 3) || currentSong === 0) {
                                      howlerRef.current?.seek(0);
                                    } else {
                                      dispatch(setCurrentSong(currentSong - 1));
                                    }

                                    e.stopPropagation();
                                }}>
                                    <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H6V42H3V6Z" fill="#FFFFFF"></path><path d="M39.7485 41.7978C39.9768 41.9303 40.236 42.0001 40.5 42C40.8978 42 41.2794 41.842 41.5607 41.5607C41.842 41.2794 42 40.8978 42 40.5V7.50001C41.9998 7.23664 41.9303 6.97795 41.7985 6.74997C41.6666 6.52199 41.477 6.33274 41.2488 6.20126C41.0206 6.06978 40.7618 6.00071 40.4985 6.00098C40.2351 6.00125 39.9764 6.07086 39.7485 6.20281L11.2485 22.7028C11.0212 22.8347 10.8325 23.0239 10.7014 23.2516C10.5702 23.4793 10.5012 23.7375 10.5012 24.0003C10.5012 24.2631 10.5702 24.5213 10.7014 24.749C10.8325 24.9767 11.0212 25.1659 11.2485 25.2978L39.7485 41.7978Z" fill="#FFFFFF"></path></svg>
                                </button>
                                <button onClick={(e) => {
                                    dispatch(toggleMusicPause());
                                    e.stopPropagation();
                                }} className="svg-button-desktop-transparent">
                                    {
                                        paused ? (
                                            <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#FFFFFF"></path></svg>
                                        ) : (
                                            <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M13 8C13 6.89543 13.8954 6 15 6H17C18.1046 6 19 6.89543 19 8V40C19 41.1046 18.1046 42 17 42H15C13.8954 42 13 41.1046 13 40V8Z" fill="#FFFFFF"></path><path d="M29 8C29 6.89543 29.8954 6 31 6H33C34.1046 6 35 6.89543 35 8V40C35 41.1046 34.1046 42 33 42H31C29.8954 42 29 41.1046 29 40V8Z" fill="#FFFFFF"></path></svg>
                                        )
                                    }
                                </button>
                                <button className="svg-button-desktop-transparent" onClick={(e) => {
                                    dispatch(setCurrentSong(currentSong + 1));
                                    e.stopPropagation();
                                }}>
                                    <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M42 6H45V42H42V6Z" fill="#FFFFFF"></path><path d="M6.43934 41.5607C6.72064 41.842 7.10218 42 7.5 42C7.764 41.9999 8.02328 41.9299 8.2515 41.7972L36.7515 25.2972C36.9788 25.1653 37.1675 24.9761 37.2986 24.7484C37.4298 24.5207 37.4988 24.2625 37.4988 23.9997C37.4988 23.7369 37.4298 23.4787 37.2986 23.251C37.1675 23.0233 36.9788 22.8341 36.7515 22.7022L8.2515 6.2022C8.02352 6.07022 7.76481 6.00061 7.50139 6.00037C7.23797 6.00012 6.97913 6.06925 6.75091 6.2008C6.52269 6.33235 6.33314 6.52168 6.20132 6.74975C6.0695 6.97782 6.00007 7.23658 6 7.5V40.5C6 40.8978 6.15804 41.2793 6.43934 41.5607Z" fill="#FFFFFF"></path></svg>
                                </button>
                                <button onClick={(e) => {
                                    if (!paused)
                                        dispatch(toggleMusicPause());
                                    
                                    dispatch(setCurrentSong(-1));
                                    e.stopPropagation();
                                }} className="svg-button-desktop-transparent">
                                    <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M36 9H12C11.2044 9 10.4413 9.31607 9.87868 9.87868C9.31607 10.4413 9 11.2044 9 12V36C9 36.7956 9.31607 37.5587 9.87868 38.1213C10.4413 38.6839 11.2044 39 12 39H36C36.7956 39 37.5587 38.6839 38.1213 38.1213C38.6839 37.5587 39 36.7956 39 36V12C39 11.2044 38.6839 10.4413 38.1213 9.87868C37.5587 9.31607 36.7956 9 36 9Z" fill="#FFFFFF"></path></svg>
                                </button>
                            </div>
                        </div>
                        <div className="music-controls-right" onClick={(e) => e.stopPropagation()}>
                            <button onClick={(e) => {
                                setShowMore(!showMore);
                                e.stopPropagation();
                            }}>
                                <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M42 9H11V12H42V9Z" fill="#FFFFFF"></path><path d="M42 18H19V21H42V18Z" fill="#FFFFFF"></path><path d="M10.5 27H42V30H10.5V27Z" fill="#FFFFFF"></path><path d="M42 36H10.5V39H42V36Z" fill="#FFFFFF"></path><path d="M2.17307 25.8291C2.28389 25.9385 2.43419 26 2.59091 26C2.69047 26 2.78842 25.9751 2.87567 25.9278L14.6938 19.5111C14.7865 19.4608 14.8639 19.3868 14.9177 19.2969C14.9716 19.207 15 19.1044 15 19C15 18.8955 14.9716 18.793 14.9177 18.7031C14.8639 18.6132 14.7865 18.5392 14.6938 18.4888L2.87567 12.0722C2.78569 12.0234 2.68437 11.9985 2.58169 12.0001C2.47901 12.0017 2.37853 12.0296 2.29014 12.0812C2.20174 12.1328 2.1285 12.2063 2.07762 12.2943C2.02675 12.3824 1.99999 12.482 2 12.5834V25.4167C2 25.5714 2.06226 25.7198 2.17307 25.8291Z" fill="#FFFFFF"></path></svg>
                            </button>
                            <Slider
                                id="music-volume-slider"
                                orientation="vertical"
                                value={volume * 100}
                                min={0}
                                max={100}
                                step={1} // Incrementos pequeños para el control de volumen preciso
                                onChange={(e) => {
                                    handleVolumeChange((e.value as number) / 100);
                                }}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}