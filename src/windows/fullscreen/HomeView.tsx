import '../../i18n';
import '../../Fullscreen.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'redux/store';
import { useEffect, useRef, useState } from 'react';
import { SeriesData } from '@interfaces/SeriesData';
import { SeasonData } from '@interfaces/SeasonData';
import { LibraryData } from '@interfaces/LibraryData';
import { EpisodeData } from '@interfaces/EpisodeData';
import { ReactUtils } from 'data/utils/ReactUtils';
import { useTranslation } from 'react-i18next';
import ResolvedImage from '@components/image/Image';
import { HomeInfoElement } from '@interfaces/HomeInfoElement';

function HomeView() {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    // Main objects
    const librariesList = useSelector((state: RootState) => state.data.libraries);
    const selectedLibrary = useSelector((state: RootState) => state.data.selectedLibrary);
    const currentShow = useSelector((state: RootState) => state.data.selectedSeries);
    const currentSeason = useSelector((state: RootState) => state.data.selectedSeason);
    const currentEpisode = useSelector((state: RootState) => state.data.selectedEpisode);
    
    // Temp objects for item selection
    const [currentShowForBackground, setCurrentShowForBackground] = useState<SeriesData | undefined>();
    const [currentSeasonSelected, setCurrentSeasonSelected] = useState<SeasonData | undefined>();

    const [dominantColor, setDominantColor] = useState<string>('000000');

    
    const homeImageLoaded = useSelector((state: RootState) => state.fullscreenSection.homeImageLoaded);
    const [showImageLoaded, setShowImageLoaded] = useState(false);
    const [seasonImageLoaded, setSeasonImageLoaded] = useState(false);
    
    const seriesImageWidth = useSelector((state: RootState) => state.seriesImage.width);
    const seriesImageHeight = useSelector((state: RootState) => state.seriesImage.height);

    const listRef = useRef<HTMLDivElement>(null);
    const section = useSelector((state: RootState) => state.fullscreenSection.fullscreenSection);

    const homeInfoElement = useSelector((state: RootState) => state.fullscreenSection.homeInfoElement);
    const currentlyWatchingShows = useSelector((state: RootState) => state.fullscreenSection.currentlyWatchingShows);

    

    //#region KEYBOARD DETECTION
    const handleKeyDown = (event: KeyboardEvent) => {
        if (!currentSeason){
            return;
        }

        const currentIndex = currentSeason.episodes.findIndex((episode) => episode === currentEpisode);

        if (songsView) {
            if (event.key === 'ArrowDown') {
                // Mover al siguiente episodio si existe
                const nextIndex = currentIndex + 1;
                if (nextIndex < currentSeason.episodes.length) {
                    handleScrollElementClick<EpisodeData>(
                        currentSeason.episodes[nextIndex], 
                        nextIndex, 
                        listRef, 
                        setCurrentEpisode, 
                        true
                    );
                }
            }
    
            if (event.key === 'ArrowUp') {
                // Mover al episodio anterior si existe
                const prevIndex = currentIndex - 1;
                if (prevIndex >= 0) {
                    handleScrollElementClick<EpisodeData>(
                        currentSeason.episodes[prevIndex], 
                        prevIndex, 
                        listRef, 
                        setCurrentEpisode, 
                        true
                    );
                }
            }
        } else {
            if (event.key === 'ArrowRight') {
                // Mover al siguiente episodio si existe
                const nextIndex = currentIndex + 1;
                if (nextIndex < currentSeason.episodes.length) {
                    handleScrollElementClick<EpisodeData>(
                        currentSeason.episodes[nextIndex], 
                        nextIndex, 
                        listRef, 
                        setCurrentEpisode, 
                        false
                    );
                }
            }
    
            if (event.key === 'ArrowLeft') {
                // Mover al episodio anterior si existe
                const prevIndex = currentIndex - 1;
                if (prevIndex >= 0) {
                    handleScrollElementClick<EpisodeData>(
                        currentSeason.episodes[prevIndex], 
                        prevIndex, 
                        listRef, 
                        setCurrentEpisode, 
                        false
                    );
                }
            }
        }
    };

    // Add and Clean Keyboard Events
    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [currentEpisode, currentSeason?.episodes]);
    //#endregion

    return (
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

export default HomeView;