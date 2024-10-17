import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from 'redux/store';
import { selectLibrary, setLibraries } from 'redux/slices/dataSlice';
import { useEffect, useRef, useState } from 'react';
import '../../i18n';
import '../../Fullscreen.scss';
import ResolvedImage from '@components/Image';
import { SeriesData } from '@interfaces/SeriesData';
import { LibraryData } from '@interfaces/LibraryData';
import { SeasonData } from '@interfaces/SeasonData';
import { EpisodeData } from '@interfaces/EpisodeData';
import { ReactUtils } from 'data/utils/ReactUtils';
import MainMenu from './mainMenu';
import { toggleMainMenu } from 'redux/slices/contextMenuSlice';
import { LazyLoadImage } from 'react-lazy-load-image-component';

function FullScreenMain() {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [time, setTime] = useState(new Date());

    const [useImageAsBackground, setUseImageAsBackground] = useState<boolean>(true);

    const librariesList = useSelector((state: RootState) => state.data.libraries);
    const selectedLibrary = useSelector((state: RootState) => state.data.selectedLibrary);
    const selectedSeries = useSelector((state: RootState) => state.data.selectedSeries);
    const selectedSeason = useSelector((state: RootState) => state.data.selectedSeason);

    const [currentShow, setCurrentShow] = useState<SeriesData | undefined>();
    const [currentShowForBackground, setCurrentShowForBackground] = useState<SeriesData | undefined>();
    const [currentSeason, setCurrentSeason] = useState<SeasonData | undefined>();
    const [currentEpisode, setCurrentEpisode] = useState<EpisodeData | undefined>();

    const [homeInfoElement, setHomeInfoElement] = useState<
    { 
        library: LibraryData, 
        show: SeriesData, 
        season: SeasonData,
        episode: EpisodeData 
    } | undefined>(undefined);

    const [currentlyWatchingShows, setCurrentlyWatchingShows] = useState<
    { library: LibraryData, 
      show: SeriesData, 
      season: SeasonData,
      episode: EpisodeData }[]>([]);

    const [backgroundPath, setBackgroundPath] = useState<string>('');
    const [gradient, setGradient] = useState<string>('none');
    const [gradientLeft, setGradientLeft] = useState<string>('none');
    const [homeImageLoaded, setHomeImageLoaded] = useState(false);
    const [showImageLoaded, setShowImageLoaded] = useState(false);
    const [seasonImageLoaded,setSeasonImageLoaded] = useState(false);
    
    const seriesImageWidth = useSelector((state: RootState) => state.seriesImage.width);
    const seriesImageHeight = useSelector((state: RootState) => state.seriesImage.height);

    const [homeView, setHomeView] = useState(false);
    const [seasonView, setSeasonView] = useState(false);

    const [dominantColor, setDominantColor] = useState<string>('000000');

    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!selectedLibrary) {
            setCurrentlyWatchingShows([]);
            for (const library of librariesList) {
                if (library.type !== "Music"){
                    for (const show of library.series) {
                        const season = show.seasons[0];
            
                        if (season) {
                            const episode = season.episodes[0];
            
                            if (episode){
                            setCurrentlyWatchingShows(prevElements => [...prevElements, {
                                library, show, season, episode
                            }]);
                            }
                        }
                        /*
                        if (show.currentlyWatchingSeason !== -1){
                        const season = show.seasons[show.currentlyWatchingSeason];
            
                        if (season) {
                            const episode = season.episodes[season.currentlyWatchingEpisode];
            
                            if (episode){
                            setCurrentlyWatchingShows([...currentlyWatchingShows, {
                                library, show, season, episode
                            }]);
                            }
                        }
                        }
                        */
                    }
                }
            }

            if (currentlyWatchingShows.length > 0) {
                
                setCurrentlyWatchingShows(currentlyWatchingShows);

                if (!selectedLibrary) {
                    setHomeInfoElement(currentlyWatchingShows[0]);
                }
            }
        } else {
            if (selectedLibrary.series.length > 0) {
                handleSelectShow(selectedLibrary.series[0], true);
            }
        }
      }, [librariesList, selectedLibrary]);

    useEffect(() => {
        // @ts-ignore
        window.electronAPI.getLibraryData()
        .then((data: any[]) => {
          dispatch(setLibraries(data));
        })
        .catch((error: unknown) => {
            if (error instanceof Error) {
                console.error('Error loading library data:', error.message);
            } else {
                console.error('Unexpected error:', error);
            }
        });

        const timer = setInterval(() => {
            setTime(new Date()); // Actualiza la hora cada segundo
        }, 1000);
      
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const generateGradient = async (path: string) => {
            if (path !== 'none'){
                const extPath = await window.electronAPI.getExternalPath(path);
                
                if (extPath !== '') {
                    await ReactUtils.getDominantColors(extPath);
    
                    setDominantColor(ReactUtils.colors[0]);
        
                    if (dominantColor){
                        setGradient(`radial-gradient(135% 103% at 97% 39%, #073AFF00 41%, ${dominantColor} 68%)`);
                        setGradientLeft(`linear-gradient(90deg, ${dominantColor} 0%, ${dominantColor} 100%)`);
                    }
                }
            } else {
                setGradient(`radial-gradient(135% 103% at 97% 39%, #073AFF00 41%, #000000FF 68%)`);
                setGradientLeft(`linear-gradient(90deg, #000000FF 0%, #000000FF 100%)`);
            }
        }

        if (homeInfoElement && homeInfoElement.season.backgroundSrc && homeInfoElement.season.backgroundSrc !== "") {
            setHomeImageLoaded(false);
            setTimeout(() => {
                generateGradient(homeInfoElement.season.backgroundSrc);
                setHomeImageLoaded(true);
            }, 600);
        } else if (homeInfoElement) {
            setTimeout(() => {
                generateGradient('none');
            }, 100);
        }
    }, [homeInfoElement]);

    const handleGoToMainView = () => {
        setSeasonView(false);
        setCurrentSeason(undefined);
        setCurrentEpisode(undefined);
    }

    const handleSelectLibrary = (library: LibraryData | null) => {
        if (library) {
            setHomeInfoElement(undefined);
            setHomeImageLoaded(false);
            setHomeView(false);
            setDominantColor('000000');
        }else {
            setHomeView(true);
        }

        dispatch(selectLibrary(library));
        setCurrentSeason(undefined);
        setCurrentEpisode(undefined);
        setSeasonView(false);
    };

    const handleSelectShow = (show: SeriesData | null, automaticSelection: boolean) => {
        if (show && currentShow !== show) {
            setCurrentShow(show);
            setTimeout(() => {
                if (currentShow !== show) {
                    setShowImageLoaded(false);
                    setTimeout(() => {
                        setCurrentShowForBackground(show);
                        setShowImageLoaded(true);
                    }, 200);
                }
            }, 400);
        }else if (show && !automaticSelection) {
            if (show.seasons && show.seasons.length > 0) {
                if (show.currentlyWatchingSeason && show.currentlyWatchingSeason !== -1) {
                    setCurrentSeason(show.seasons[show.currentlyWatchingSeason]);
                    
                    if (currentSeason && currentSeason.currentlyWatchingEpisode && currentSeason.currentlyWatchingEpisode !== -1) {
                        setCurrentEpisode(currentSeason.episodes[currentSeason.currentlyWatchingEpisode]);
                    } else if (currentSeason && currentSeason.episodes && currentSeason.episodes.length > 0) {
                        setCurrentEpisode(currentSeason.episodes[0]);
                    }
                } else {
                    setCurrentSeason(show.seasons[0]);
                    
                    if (show.seasons[0] && show.seasons[0].episodes && show.seasons[0].episodes.length > 0) {
                        setCurrentEpisode(show.seasons[0].episodes[0]);
                    }
                }

                setSeasonView(true);
                setSeasonImageLoaded(true);
            }
        }
    };

    const handleEpisodeClick = (episode: EpisodeData, index: number) => {
        setCurrentEpisode(episode);
    
        const episodeButton = listRef.current?.children[index] as HTMLElement;
        if (episodeButton && listRef.current) {
            const listRect = listRef.current.getBoundingClientRect();
            const buttonRect = episodeButton.getBoundingClientRect();
    
            const buttonCenter = buttonRect.left + buttonRect.width / 2;
            const listCenter = listRect.left + listRect.width / 2;
    
            if (buttonCenter !== listCenter) {
                const scrollOffset = buttonCenter - listCenter;
                scrollToCenter(listRef.current, scrollOffset, 300); // Ajusta la duración a 300ms
            }
        }
    };

    const scrollToCenter = (scrollElement: HTMLElement, scrollOffset: number, duration: number) => {
        const start = scrollElement.scrollLeft;
        const startTime = performance.now();
    
        const animateScroll = (currentTime: number) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1); // Limitar al 100%
    
            scrollElement.scrollLeft = start + scrollOffset * progress;
    
            if (timeElapsed < duration) {
                requestAnimationFrame(animateScroll); // Continuar la animación
            }
        };
    
        requestAnimationFrame(animateScroll);
    };

    // Manejador de eventos de teclado
    const handleKeyDown = (event: KeyboardEvent) => {
        if (!currentSeason){
            return;
        }

        const currentIndex = currentSeason.episodes.findIndex((episode) => episode === currentEpisode);

        if (event.key === 'ArrowRight') {
            // Mover al siguiente episodio si existe
            const nextIndex = currentIndex + 1;
            if (nextIndex < currentSeason.episodes.length) {
                handleEpisodeClick(currentSeason.episodes[nextIndex], nextIndex);
            }
        }

        if (event.key === 'ArrowLeft') {
            // Mover al episodio anterior si existe
            const prevIndex = currentIndex - 1;
            if (prevIndex >= 0) {
                handleEpisodeClick(currentSeason.episodes[prevIndex], prevIndex);
            }
        }
    };

    // Usar useEffect para añadir y limpiar el evento de teclado
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentEpisode, currentSeason?.episodes]);

    //#region SONGS
    const getDiscs = () => {
        let foundDiscs: number[] = [];

        if (currentSeason){
            for (const song of currentSeason.episodes) {
                if (song.seasonNumber !== 0 && !foundDiscs.includes(song.seasonNumber)){
                    foundDiscs.push(song.seasonNumber);
                }
            }
        }

        return foundDiscs;
    }

    const handleRenderSongs = () => {
        
        if (currentSeason && currentSeason.episodes && currentSeason.episodes.length > 1) {
            const discs = getDiscs();

            if (!currentSeason)
                return;
    
            if (discs.length === 0) {
                return (
                    <div className="music-list" ref={listRef}>
                        {currentSeason.episodes.map((episode: EpisodeData, index: number) => (
                            <div className={`element ${episode === currentEpisode ? 'element-selected' : null}`} key={episode.id}
                                onClick={() => {
                                    handleEpisodeClick(episode, index);
                                }}
                                >
                                <span>{episode.episodeNumber}</span>
                                <span style={{width: '100%', marginLeft: '2em', marginRight: '2em'}}>{episode.name}</span>
                                <span>{ReactUtils.formatTime(episode.runtimeInSeconds)}</span>
                            </div>
                        ))}
                    </div>
                );
            } else {
                return (
                    <div className="music-list" ref={listRef}>
                        {discs.map((disc: number) => (
                            <>
                                <span className="disc-text-title">Disc {disc}</span>
                                {currentSeason.episodes.filter(song => song.seasonNumber === disc).sort((a, b) => a.episodeNumber - b.episodeNumber).map((song: EpisodeData, index: number) => (
                                    <div className={`element ${song === currentEpisode ? 'element-selected' : null}`} key={song.id}
                                        onClick={() => {
                                            handleEpisodeClick(song, index);
                                        }}
                                        >
                                        <span>{song.episodeNumber}</span>
                                        <span style={{width: '100%', marginLeft: '2em', marginRight: '2em'}}>{song.name}</span>
                                        <span>{ReactUtils.formatTime(song.runtimeInSeconds)}</span>
                                    </div>
                                ))}
                                <div className="separator"></div>
                            </>
                        ))}
                    </div>
                );
            }


            
        }else {
            return (
                <>
                    <div>
                        <span>NO DISC FOUND</span>
                    </div>
                </>
            );
        }
    }

    const handleTotalRuntime = () => {
        let totalRuntime: number = 0;
        if (currentSeason){
            for (const song of currentSeason?.episodes) {
                totalRuntime += song.runtime;
            }
        }

        return totalRuntime;
    }
    //#endregion

    return (
        <>
            {MainMenu()}
            <div className={`season-image ${seasonImageLoaded ? 'loaded-blur-in' : 'loaded-blur-out'}`}>
                {
                    selectedLibrary && currentSeason && currentSeason.backgroundSrc !== "" ? (
                        <ResolvedImage
                            src={currentSeason.backgroundSrc}
                            alt="Background"
                        />
                    ) : null
                }
            </div>
            <div className={`season-gradient ${seasonImageLoaded ? 'loaded-blur-in' : 'loaded-blur-out'}`}></div>
            {
                useImageAsBackground ? (
                    <div className={`background-image-blur ${showImageLoaded ? 'loaded-blur-in' : 'loaded-blur-out'}`}>
                        {
                            selectedLibrary && currentShowForBackground && currentShowForBackground.seasons && currentShowForBackground.seasons.length > 0 ? (
                                <ResolvedImage
                                    src={`/resources/img/backgrounds/${currentShowForBackground.seasons[0].id}/fullBlur.jpg`}
                                    alt="Background"
                                />
                            ) : null
                        }
                    </div>
                ) : null
            }
            {
                homeView || useImageAsBackground ? (
                    <div className="noise-background">
                        <ResolvedImage
                            src="resources/img/noise.png"
                            alt="Background noise"
                        />
                    </div>
                ) : null
            }
            {
                homeInfoElement !== undefined ? (
                    <>
                        <div className={`background-image ${homeImageLoaded ? 'loaded' : ''}`}>
                            {
                                homeInfoElement.season.backgroundSrc !== "" ? (
                                    <ResolvedImage
                                        src={homeInfoElement.season.backgroundSrc}
                                        alt="Background"
                                    />
                                ) : null
                            }
                        </div>
                        <div className={`gradient-left ${homeImageLoaded ? 'loadedFull' : ''}`} style={{background: `${gradientLeft}`}}></div>
                        <div className={`gradient ${homeImageLoaded ? 'loadedFull' : ''}`} style={{background: `${gradient}`}}></div>
                    </>
                ) : null
            }
            <section className="top">
                {
                    !seasonView && (
                        <button id="home" onClick={() => handleSelectLibrary(null)}>
                            {selectedLibrary ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15"><path fill="currentColor" d="m7.5.5l.325-.38a.5.5 0 0 0-.65 0zm-7 6l-.325-.38L0 6.27v.23zm5 8v.5a.5.5 0 0 0 .5-.5zm4 0H9a.5.5 0 0 0 .5.5zm5-8h.5v-.23l-.175-.15zM1.5 15h4v-1h-4zm13.325-8.88l-7-6l-.65.76l7 6zm-7.65-6l-7 6l.65.76l7-6zM6 14.5v-3H5v3zm3-3v3h1v-3zm.5 3.5h4v-1h-4zm5.5-1.5v-7h-1v7zm-15-7v7h1v-7zM7.5 10A1.5 1.5 0 0 1 9 11.5h1A2.5 2.5 0 0 0 7.5 9zm0-1A2.5 2.5 0 0 0 5 11.5h1A1.5 1.5 0 0 1 7.5 10zm6 6a1.5 1.5 0 0 0 1.5-1.5h-1a.5.5 0 0 1-.5.5zm-12-1a.5.5 0 0 1-.5-.5H0A1.5 1.5 0 0 0 1.5 15z"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15"><path fill="currentColor" d="M7.825.12a.5.5 0 0 0-.65 0L0 6.27v7.23A1.5 1.5 0 0 0 1.5 15h4a.5.5 0 0 0 .5-.5v-3a1.5 1.5 0 0 1 3 0v3a.5.5 0 0 0 .5.5h4a1.5 1.5 0 0 0 1.5-1.5V6.27z"></path></svg>
                            )}
                        </button>
                    )
                }
                {
                    !seasonView && (
                        <div className="libraries-list">
                            {librariesList.map((library) => (
                                <button 
                                    key={library.id} 
                                    className={`libraries-button ${library === selectedLibrary ? 'active' : ''}`} 
                                    title={library.name}
                                    onClick={() => handleSelectLibrary(library)}
                                >
                                    <span className="library-name">
                                        {library.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )
                }
                {
                    seasonView && (
                        <button className="go-back-btn" onClick={() => handleGoToMainView()}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="m7.825 13l5.6 5.6L12 20l-8-8l8-8l1.425 1.4l-5.6 5.6H20v2z"></path></svg>
                        </button>
                    )
                }
                <div className="right-options">
                    <span id="time">{formatTime(time)}</span>
                    {
                        !seasonView && (
                            <button id="options-btn" onClick={() => {
                                dispatch(toggleMainMenu())
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1m0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1M3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1"></path></svg>
                            </button>
                        )
                    }
                </div>
            </section>
            <section className="content">
                {
                    selectedLibrary !== null && !seasonView ? (
                        <div className="shows-container">
                            {selectedLibrary.series.map((element) => (
                                <button
                                    key={element.id} 
                                    className={`shows-button ${currentShow === element ? 'selected' : ''}`} 
                                    title={element.name}
                                    onClick={() => handleSelectShow(element, false)}
                                    >
                                    {
                                        selectedLibrary.type === "Music" ? (
                                            <img loading='lazy' src={element.coverSrc} alt="Poster"
                                            style={{ width: `${seriesImageWidth}px`, height: `${seriesImageWidth}px` }}
                                            onError={(e: any) => {
                                            e.target.onerror = null; // To avoid infinite loop
                                            e.target.src = "./src/resources/img/songDefault.png";
                                    }}/>
                                        ) : (
                                            <ResolvedImage src={selectedLibrary.type === "Movies" && !element.isCollection ? element.seasons[0].coverSrc : element.coverSrc} alt="Poster"
                                                style={{ width: `${seriesImageWidth}px`, height: `${seriesImageHeight}px` }}
                                                onError={(e: any) => {
                                                e.target.onerror = null; // To avoid infinite loop
                                                e.target.src = "./src/resources/img/fileNotFound.jpg";
                                            }}/>
                                        )
                                    }
                                </button>
                            ))}
                        </div>
                    ) : !seasonView ? (
                        <section className="home-container">
                            <div className="home-info-container">
                                {
                                    homeInfoElement ? (
                                        <>
                                            {
                                                homeInfoElement.library.type === "Shows" ? (
                                                    <>
                                                        {
                                                            homeInfoElement.show.logoSrc && homeInfoElement.show.logoSrc !== "" ? (
                                                                <ResolvedImage src={homeInfoElement.show.logoSrc}
                                                                onError={(e: any) => {
                                                                e.target.onerror = null; // To avoid infinite loop
                                                                e.target.src = "";
                                                                }}/>
                                                            ) : (
                                                                <span id="home-title">
                                                                    {homeInfoElement.show.name}
                                                                </span>
                                                            )
                                                        }
                                                    </>
                                                ) : (
                                                    <>
                                                        {
                                                            homeInfoElement.season.logoSrc && homeInfoElement.season.logoSrc !== "" ? (
                                                                <ResolvedImage src={homeInfoElement.season.logoSrc}
                                                                onError={(e: any) => {
                                                                e.target.onerror = null; // To avoid infinite loop
                                                                e.target.src = "";
                                                                }}/>
                                                            ) : (
                                                                <span id="home-title">
                                                                    {homeInfoElement.season.name}
                                                                </span>
                                                            )
                                                        }
                                                    </>
                                                )
                                            }
                                            
                                            <span id="home-subtitle">
                                                {
                                                    homeInfoElement.library.type === "Shows" ? (
                                                        homeInfoElement.episode.name
                                                    ) : null
                                                }
                                            </span>
                                            <div className="home-info-horizontal">
                                                {
                                                    homeInfoElement.library.type === "Shows" ? (
                                                        <span>
                                                            {t('seasonLetter')}{homeInfoElement.episode.seasonNumber} · {t('episodeLetter')}{homeInfoElement.episode.episodeNumber}
                                                        </span>
                                                    ) : null
                                                }
                                                <span>{new Date(homeInfoElement.episode.year).getFullYear()}</span>
                                                <span>{ReactUtils.formatTimeForView(homeInfoElement.episode.runtime)}</span>
                                                {
                                                    homeInfoElement.library.type !== "Shows" && homeInfoElement.season.score && homeInfoElement.season.score !== 0 ? (
                                                        <span>
                                                            {homeInfoElement.season.score.toFixed(2)}
                                                        </span>
                                                    ) : null
                                                }
                                            </div>
                                            <span id="home-overview">
                                                {
                                                    homeInfoElement.library.type === "Shows" ? (
                                                        homeInfoElement.episode.overview || homeInfoElement.season.overview || homeInfoElement.show.overview || t('defaultOverview')
                                                    ) : (
                                                        homeInfoElement.season.overview || homeInfoElement.show.overview ||  t('defaultOverview')
                                                    )
                                                }</span>
                                        </>
                                    ) : null
                                }
                            </div>
                            <div className="continue-watching-title">
                                <span>{t('continueWatching')}</span>
                            </div>
                            <div className="continue-watching-list">
                                {[...currentlyWatchingShows].splice(0, 75).map((value: {
                                    library: LibraryData, 
                                    show: SeriesData, 
                                    season: SeasonData,
                                    episode: EpisodeData
                                }) => (
                                    <div className={`element ${value === homeInfoElement ? 'element-selected' : null}`} key={value.show.id + "continueWatching"}
                                        onClick={() => {
                                            setHomeInfoElement(value);
                                        }}
                                        >
                                        {
                                            value.show.coverSrc !== "" ? (
                                                <ResolvedImage src={value.show.coverSrc} alt="Poster"
                                                onError={(e: any) => {
                                                e.target.onerror = null; // To avoid infinite loop
                                                e.target.src = "./src/resources/img/fileNotFound.jpg";
                                                }}/>
                                            ) : value.show.seasons && value.show.seasons.length > 0 && value.show.seasons[0].coverSrc !== "" ? (
                                                <ResolvedImage src={value.show.seasons[0].coverSrc} alt="Poster"
                                                onError={(e: any) => {
                                                e.target.onerror = null; // To avoid infinite loop
                                                e.target.src = "./src/resources/img/fileNotFound.jpg";
                                                }}/>
                                            ) : (
                                                <ResolvedImage src="resources/img/fileNotFound.jpg" alt="Poster"
                                                />
                                            )
                                        }
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : seasonView && selectedLibrary && currentShow && currentSeason && currentEpisode ? (
                        <>
                            {
                                selectedLibrary.type === "Music" ? (
                                    <section className="music-container">
                                        <div className="music-info-container">
                                            <div className="album-image">
                                                <LazyLoadImage src={currentSeason.coverSrc} alt="Poster"
                                                    onError={(e: any) => {
                                                        e.target.onerror = null; // To avoid infinite loop
                                                        e.target.src = "./src/resources/img/songDefault.png";
                                                }}/>
                                            </div>
                                            <span id="music-title">
                                                {currentShow.name}
                                            </span>
                                            <span id="music-subtitle">
                                                {currentSeason.name}
                                            </span>
                                            <div className="music-info-horizontal">
                                                <span>{new Date(currentSeason.year).getFullYear()}</span>
                                                <span>{ReactUtils.formatTimeForView(handleTotalRuntime())}</span>
                                            </div>
                                            {
                                                currentEpisode.overview || currentSeason.overview || currentShow.overview ? (
                                                    <div className="music-overview-container">
                                                        <span id="music-overview">
                                                            {currentEpisode.overview || currentSeason.overview || currentShow.overview || t('defaultOverview')}
                                                        </span>
                                                    </div>
                                                ) : null
                                            }
                                            <div className="music-btns">
                                                {
                                                    currentSeason.episodes ? (
                                                        <div className="btns-container">
                                                            <button className="season-btn" id="playButton">
                                                                <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#FFFFFF"></path></svg>
                                                                <span>{t('playButton')}</span>
                                                            </button>
                                                            <button className="season-btn">
                                                                {
                                                                    true ? (
                                                                        <>
                                                                            <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 24.6195L21 32.121L34.5 18.6225L32.3775 16.5L21 27.879L15.6195 22.5L13.5 24.6195Z" fill="#FFFFFF"></path><path clipRule="evenodd" d="M12.333 6.53914C15.7865 4.23163 19.8466 3 24 3C29.5696 3 34.911 5.21249 38.8493 9.15076C42.7875 13.089 45 18.4305 45 24C45 28.1534 43.7684 32.2135 41.4609 35.667C39.1534 39.1204 35.8736 41.812 32.0364 43.4015C28.1991 44.9909 23.9767 45.4068 19.9031 44.5965C15.8295 43.7862 12.0877 41.7861 9.15077 38.8492C6.21386 35.9123 4.21381 32.1705 3.40352 28.0969C2.59323 24.0233 3.0091 19.8009 4.59854 15.9636C6.18798 12.1264 8.8796 8.84665 12.333 6.53914ZM13.9997 38.9665C16.9598 40.9443 20.4399 42 24 42C28.7739 42 33.3523 40.1036 36.7279 36.7279C40.1036 33.3523 42 28.7739 42 24C42 20.4399 40.9443 16.9598 38.9665 13.9997C36.9886 11.0397 34.1774 8.73255 30.8883 7.37017C27.5992 6.00779 23.98 5.65133 20.4884 6.34586C16.9967 7.0404 13.7894 8.75473 11.2721 11.2721C8.75474 13.7894 7.04041 16.9967 6.34587 20.4884C5.65134 23.98 6.0078 27.5992 7.37018 30.8883C8.73256 34.1774 11.0397 36.9886 13.9997 38.9665Z" fill="#FFFFFF" fillRule="evenodd"></path></svg>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M12.333 6.53914C15.7865 4.23163 19.8466 3 24 3C29.5696 3 34.911 5.21249 38.8493 9.15076C42.7875 13.089 45 18.4305 45 24C45 28.1534 43.7684 32.2135 41.4609 35.667C39.1534 39.1204 35.8736 41.812 32.0364 43.4015C28.1991 44.9909 23.9767 45.4068 19.9031 44.5965C15.8295 43.7862 12.0877 41.7861 9.15077 38.8492C6.21386 35.9123 4.21381 32.1705 3.40352 28.0969C2.59323 24.0233 3.0091 19.8009 4.59854 15.9636C6.18798 12.1264 8.8796 8.84665 12.333 6.53914ZM12.793 24.6194L21 32.8281L35.2072 18.6225L32.3775 15.7928L21 27.1719L15.6195 21.7929L12.793 24.6194Z" fill="#FFFFFF" fillRule="evenodd"></path></svg>
                                                                        </>
                                                                    )
                                                                }
                                                            </button>
                                                            <button className="season-btn">
                                                                {
                                                                    true ? (
                                                                        <>
                                                                            <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M38 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V45L23.5 36.5L41 45V6C41 5.20435 40.6839 4.44129 40.1213 3.87868C39.5587 3.31607 38.7957 3 38 3Z" fill="#FFFFFF"></path></svg>
                                                                            
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M38 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V45L23.5 36.5L41 45V6C41 5.20435 40.6839 4.44129 40.1213 3.87868C39.5587 3.31607 38.7957 3 38 3Z" fill="#FFFFFF"></path></svg>
                                                                            
                                                                        </>
                                                                    )
                                                                }
                                                            </button>
                                                        </div>
                                                    ) : null
                                                }
                                            </div>
                                        </div>
                                        {handleRenderSongs()}
                                    </section>
                                ) : (
                                    <section className="season-container">
                                        <div className="season-info-container">
                                            {
                                                selectedLibrary.type === "Shows" ? (
                                                    <>
                                                        {
                                                            currentShow.logoSrc && currentShow.logoSrc !== "" ? (
                                                                <ResolvedImage src={currentShow.logoSrc}
                                                                onError={(e: any) => {
                                                                e.target.onerror = null; // To avoid infinite loop
                                                                e.target.src = "";
                                                                }}/>
                                                            ) : (
                                                                <span id="season-title">
                                                                    {currentShow.name}
                                                                </span>
                                                            )
                                                        }
                                                    </>
                                                ) : (
                                                    <>
                                                        {
                                                            currentSeason.logoSrc && currentSeason.logoSrc !== "" ? (
                                                                <ResolvedImage src={currentSeason.logoSrc}
                                                                onError={(e: any) => {
                                                                e.target.onerror = null; // To avoid infinite loop
                                                                e.target.src = "";
                                                                }}/>
                                                            ) : (
                                                                <span id="season-title">
                                                                    {currentShow.name}
                                                                </span>
                                                            )
                                                        }
                                                    </>
                                                )
                                            }
                                            
                                            <span id="season-subtitle">
                                                {
                                                    selectedLibrary.type === "Shows" ? (
                                                        currentSeason.name
                                                    ) : null
                                                }
                                            </span>
                                            <div className="season-info-horizontal">
                                                {
                                                    selectedLibrary.type === "Shows" ? (
                                                        <span>
                                                            {t('seasonLetter')}{currentEpisode.seasonNumber} · {t('episodeLetter')}{currentEpisode.episodeNumber}
                                                        </span>
                                                    ) : null
                                                }
                                                <span>{
                                                    selectedLibrary.type === "Shows" ? (
                                                        currentEpisode.year
                                                    ) : (
                                                        new Date(currentEpisode.year).getFullYear()
                                                    )   
                                                }</span>
                                                <span>{ReactUtils.formatTimeForView(currentEpisode.runtime)}</span>
                                            </div>
                                            <div className="season-overview-container">
                                                <span id="season-overview">
                                                    {currentEpisode.overview || currentSeason.overview || currentShow.overview || t('defaultOverview')}
                                                </span>
                                            </div>
                                        </div>
                                        {
                                            currentSeason.episodes && currentSeason.episodes.length > 1 ? (
                                                <div className="episodes-list" ref={listRef}>
                                                    {currentSeason.episodes.map((episode: EpisodeData, index: number) => (
                                                        <div className={`element ${episode === currentEpisode ? 'element-selected' : null}`} key={episode.id}
                                                            onClick={() => {
                                                                handleEpisodeClick(episode, index);
                                                            }}
                                                            >
                                                            {
                                                                episode.imgSrc !== "" ? (
                                                                    <ResolvedImage src={episode.imgSrc} alt="Poster"
                                                                    onError={(e: any) => {
                                                                    e.target.onerror = null; // To avoid infinite loop
                                                                    e.target.src = "./src/resources/img/defaultThumbnail.jpg";
                                                                    }}/>
                                                                ) : (
                                                                    <ResolvedImage src="resources/img/defaultThumbnail.jpg" alt="Poster"
                                                                    />
                                                                )
                                                            }
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div style={{marginTop: '2.5em'}}></div>
                                            )
                                        }
                                        <div className="season-btns">
                                            {
                                                currentSeason.episodes && currentSeason.episodes.length == 1 ? (
                                                    <div className="btns-container">
                                                        <button className="season-btn" id="playButton">
                                                            <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#FFFFFF"></path></svg>
                                                            <span>{t('playButton')}</span>
                                                        </button>
                                                        <button className="season-btn">
                                                            {
                                                                true ? (
                                                                    <>
                                                                        <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 24.6195L21 32.121L34.5 18.6225L32.3775 16.5L21 27.879L15.6195 22.5L13.5 24.6195Z" fill="#FFFFFF"></path><path clipRule="evenodd" d="M12.333 6.53914C15.7865 4.23163 19.8466 3 24 3C29.5696 3 34.911 5.21249 38.8493 9.15076C42.7875 13.089 45 18.4305 45 24C45 28.1534 43.7684 32.2135 41.4609 35.667C39.1534 39.1204 35.8736 41.812 32.0364 43.4015C28.1991 44.9909 23.9767 45.4068 19.9031 44.5965C15.8295 43.7862 12.0877 41.7861 9.15077 38.8492C6.21386 35.9123 4.21381 32.1705 3.40352 28.0969C2.59323 24.0233 3.0091 19.8009 4.59854 15.9636C6.18798 12.1264 8.8796 8.84665 12.333 6.53914ZM13.9997 38.9665C16.9598 40.9443 20.4399 42 24 42C28.7739 42 33.3523 40.1036 36.7279 36.7279C40.1036 33.3523 42 28.7739 42 24C42 20.4399 40.9443 16.9598 38.9665 13.9997C36.9886 11.0397 34.1774 8.73255 30.8883 7.37017C27.5992 6.00779 23.98 5.65133 20.4884 6.34586C16.9967 7.0404 13.7894 8.75473 11.2721 11.2721C8.75474 13.7894 7.04041 16.9967 6.34587 20.4884C5.65134 23.98 6.0078 27.5992 7.37018 30.8883C8.73256 34.1774 11.0397 36.9886 13.9997 38.9665Z" fill="#FFFFFF" fillRule="evenodd"></path></svg>
                                                                        <span>{t('markWatched')}</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M12.333 6.53914C15.7865 4.23163 19.8466 3 24 3C29.5696 3 34.911 5.21249 38.8493 9.15076C42.7875 13.089 45 18.4305 45 24C45 28.1534 43.7684 32.2135 41.4609 35.667C39.1534 39.1204 35.8736 41.812 32.0364 43.4015C28.1991 44.9909 23.9767 45.4068 19.9031 44.5965C15.8295 43.7862 12.0877 41.7861 9.15077 38.8492C6.21386 35.9123 4.21381 32.1705 3.40352 28.0969C2.59323 24.0233 3.0091 19.8009 4.59854 15.9636C6.18798 12.1264 8.8796 8.84665 12.333 6.53914ZM12.793 24.6194L21 32.8281L35.2072 18.6225L32.3775 15.7928L21 27.1719L15.6195 21.7929L12.793 24.6194Z" fill="#FFFFFF" fillRule="evenodd"></path></svg>
                                                                        <span>{t('markUnwatched')}</span>
                                                                    </>
                                                                )
                                                            }
                                                        </button>
                                                        <button className="season-btn">
                                                            {
                                                                true ? (
                                                                    <>
                                                                        <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M38 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V45L23.5 36.5L41 45V6C41 5.20435 40.6839 4.44129 40.1213 3.87868C39.5587 3.31607 38.7957 3 38 3Z" fill="#FFFFFF"></path></svg>
                                                                        <span>Marcar como visto</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M38 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V45L23.5 36.5L41 45V6C41 5.20435 40.6839 4.44129 40.1213 3.87868C39.5587 3.31607 38.7957 3 38 3Z" fill="#FFFFFF"></path></svg>
                                                                        <span>Marcar como no visto</span>
                                                                    </>
                                                                )
                                                            }
                                                        </button>
                                                    </div>
                                                ) : null
                                            }
                                            <div className="tracks-info">
                                                <div className="track-info">
                                                    <span>1080p (HEVC Main 10)</span>
                                                </div>
                                                <div className="track-info">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm2-4h8v-2H6zm10 0h2v-2h-2zM6 12h2v-2H6zm4 0h8v-2h-8z"></path></svg>
                                                    <span>Español (AC3 5.1)</span>
                                                </div>
                                                <div className="track-info">
                                                    <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M28.3604 11.4639L30.4806 9.34351C34.3167 13.2534 36.4667 18.511 36.4695 23.9885C36.4723 29.466 34.3274 34.7262 30.4953 38.64L28.3754 36.5201C31.6443 33.1682 33.4727 28.6709 33.4698 23.9889C33.467 19.307 31.6333 14.8118 28.3604 11.4639Z" fill="#FFFFFF"></path><path d="M17.1176 37C17.0009 36.9995 16.8854 36.9746 16.7779 36.9268C16.6703 36.879 16.5729 36.8091 16.4912 36.7214L9.76765 29.569H3.88235C3.64834 29.569 3.42391 29.4712 3.25844 29.297C3.09296 29.1228 3 28.8865 3 28.6401V19.3514C3 19.105 3.09296 18.8688 3.25844 18.6946C3.42391 18.5204 3.64834 18.4225 3.88235 18.4225H9.76765L16.4912 11.2701C16.6565 11.0971 16.8801 11 17.1132 11C17.3463 11 17.57 11.0971 17.7353 11.2701C17.9015 11.4416 17.9967 11.6754 18 11.9204V36.0712C18 36.3175 17.907 36.5538 17.7416 36.728C17.5761 36.9022 17.3517 37 17.1176 37Z" fill="#FFFFFF"></path><path d="M24.1196 15.7051C26.2662 17.9291 27.4669 20.8987 27.4697 23.9896C27.4725 27.0806 26.277 30.0523 24.1343 32.2801L22.0139 30.1599C23.5932 28.4941 24.4723 26.2853 24.4697 23.9899C24.4671 21.6945 23.583 19.4877 22 17.8255L24.1196 15.7051Z" fill="#FFFFFF"></path></svg>
                                                    <span>Forzados (Español Subrip)</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                )
                            }
                        </>
                    ) : null
                }
            </section>
        </>
    )
}

export default FullScreenMain;