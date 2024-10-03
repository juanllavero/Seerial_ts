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
import { Utils } from 'data/utils/Utils';

function FullScreenMain() {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [time, setTime] = useState(new Date());

    const librariesList = useSelector((state: RootState) => state.data.libraries);
    const selectedLibrary = useSelector((state: RootState) => state.data.selectedLibrary);
    const selectedSeries = useSelector((state: RootState) => state.data.selectedSeries);
    const selectedSeason = useSelector((state: RootState) => state.data.selectedSeason);

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

    const seriesImageWidth = useSelector((state: RootState) => state.seriesImage.width);
    const seriesImageHeight = useSelector((state: RootState) => state.seriesImage.height);

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
            setHomeInfoElement(currentlyWatchingShows[0]);
            setCurrentlyWatchingShows(currentlyWatchingShows);
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

    return (
        <>
            <div className={`background-image ${homeImageLoaded ? 'loaded' : ''}`}>
                {
                    homeInfoElement && homeInfoElement.season.backgroundSrc !== "" ? (
                        <ResolvedImage
                            src={homeInfoElement.season.backgroundSrc}
                            //className={imageLoaded ? 'loaded' : ''}
                            alt="Background"
                        />
                    ) : null
                }
            </div>
            <div className={`gradient-left ${homeImageLoaded ? 'loadedFull' : ''}`} style={{background: `${gradientLeft}`}}></div>
            <div className={`gradient ${homeImageLoaded ? 'loadedFull' : ''}`} style={{background: `${gradient}`}}></div>
            <section className="top">
                <button id="home" onClick={() => dispatch(selectLibrary(null))}>
                    <svg
                        id="libraries-button-svg" 
                        aria-hidden="true" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M23.9864 4.00009C24.3242 4.00009 24.6522 4.11294 24.9185 4.32071L45 20V39.636C44.9985 40.4312 44.5623 41.4377 44 42C43.4377 42.5623 42.4311 42.9985 41.6359 43H27V28H21V43H6.5C5.70485 42.9984 4.56226 42.682 4 42.1197C3.43774 41.5575 3.00163 40.7952 3 40V21L23.0544 4.32071C23.3207 4.11294 23.6487 4.00009 23.9864 4.00009ZM30 28V40H42V21.4314L24 7.40726L6 22V40L18 40V28C18.0008 27.2046 18.3171 26.442 18.8796 25.8796C19.442 25.3171 20.2046 25.0008 21 25H27C27.7954 25.0009 28.5579 25.3173 29.1203 25.8797C29.6827 26.4421 29.9991 27.2046 30 28Z" fill="#FFFFFF" fillRule="evenodd"></path></svg>
                </button>
                <div className="libraries-list">
                    
                    {librariesList.map((library) => (
                        <button 
                            key={library.id} 
                            className={`libraries-button ${library === selectedLibrary ? 'selected' : ''}`} 
                            title={library.name}
                            onClick={() => dispatch(selectLibrary(library))}
                        >
                            <span className="library-name">
                                {library.name}
                            </span>
                        </button>
                    ))}
                </div>
                <div className="right-options">
                    <span id="time">{formatTime(time)}</span>
                    <button id="options-btn">
                        <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M42 14H6V17H42V14Z" fill="#FFFFFF" fillOpacity="0.8"></path><path d="M42 32H6V35H42V32Z" fill="#FFFFFF"></path><path d="M6 23H42V26H6V23Z" fill="#FFFFFF"></path></svg>
                    </button>
                </div>
            </section>
            <section className="content">
                {
                    selectedLibrary !== null ? (
                        <div className="shows-container">
                            {selectedLibrary.series.map((element) => (
                                <button
                                    key={element.id} 
                                    className={`libraries-button`} 
                                    title={element.name}>
                                    {
                                        selectedLibrary.type === "Music" ? (
                                            <img loading='lazy' src={element.coverSrc} alt="Poster"
                                            style={{ width: `${seriesImageWidth}px`, height: `${seriesImageWidth}px` }}
                                            onError={(e: any) => {
                                            e.target.onerror = null; // To avoid infinite loop
                                            e.target.src = "./src/resources/img/songDefault.png";
                                    }}/>
                                        ) : (
                                            <ResolvedImage src={element.coverSrc} alt="Poster"
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
                    ) : (
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
                    )
                }
            </section>
        </>
    )
}

export default FullScreenMain;