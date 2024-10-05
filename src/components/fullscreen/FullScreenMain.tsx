import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState } from 'redux/store';
import { selectLibrary, setLibraries } from 'redux/slices/dataSlice';
import { useEffect, useState } from 'react';
import '../../i18n';
import '../../Fullscreen.scss';
import ResolvedImage from '@components/Image';
import { SeriesData } from '@interfaces/SeriesData';
import { LibraryData } from '@interfaces/LibraryData';
import { SeasonData } from '@interfaces/SeasonData';
import { EpisodeData } from '@interfaces/EpisodeData';
import { ReactUtils } from 'data/utils/ReactUtils';

function FullScreenMain() {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [time, setTime] = useState(new Date());

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

    const [seasonView, setSeasonView] = useState(false);

    useEffect(() => {
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
    
                    const dominantColor = ReactUtils.colors[0];
        
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
        }

        dispatch(selectLibrary(library));
        setCurrentSeason(undefined);
        setCurrentEpisode(undefined);
        setSeasonView(false);
    };

    const handleSelectShow = (show: SeriesData | null) => {
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
        }else if (show) {
            if (show.seasons && show.seasons.length > 0) {
                if (show.currentlyWatchingSeason && show.currentlyWatchingSeason !== -1) {
                    setCurrentSeason(show.seasons[show.currentlyWatchingSeason]);
                    
                    console.log(show.currentlyWatchingSeason);
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
    }

    return (
        <>
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
            <div className="noise-background">
                <ResolvedImage
                    src="resources/img/noise.png"
                    alt="Background noise"
                />
            </div>
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
                            <button id="options-btn">
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
                                    onClick={() => handleSelectShow(element)}
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
                            <span id="season-overview">
                                {currentEpisode.overview || currentSeason.overview || currentShow.overview || t('defaultOverview')}
                            </span>
                            </div>
                            <div className="episodes-list">
                                {currentSeason.episodes.map((episode: EpisodeData) => (
                                    <div className={`element ${episode === currentEpisode ? 'element-selected' : null}`} key={episode.id}
                                        onClick={() => {
                                            setCurrentEpisode(episode);
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
                        </section>
                    ) : null
                }
            </section>
        </>
    )
}

export default FullScreenMain;