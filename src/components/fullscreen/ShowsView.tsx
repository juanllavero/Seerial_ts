import '../../i18n';
import '../../Fullscreen.scss';
import { SeriesData } from '@interfaces/SeriesData';

function ShowsView() {

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

                setSection(FullscreenSection.Seasons);
                setSeasonImageLoaded(true);
            }
        }
    };

    return (
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
    )
}

export default ShowsView;