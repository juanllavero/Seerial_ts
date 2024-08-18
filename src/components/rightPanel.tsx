import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useDispatch, useSelector } from 'react-redux';
import { selectSeries, selectSeason } from '../redux/slices/seriesSlice';
import { RootState } from '../redux/store';
import { SeriesData } from '@interfaces/SeriesData';
import { SeasonData } from '@interfaces/SeasonData';
import { closeContextMenu, toggleContextMenu } from 'redux/slices/contextMenuSlice';
import { loadTransparentImage } from 'redux/slices/transparentImageLoadedSlice';
import { useTranslation } from 'react-i18next';
import '../i18n';
import { selectLibrary } from 'redux/slices/librarySlice';

export const renderRightPanelContent = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const isContextMenuShown = useSelector((state: RootState) => state.contextMenu.isContextShown);

    const libraries = useSelector((state: RootState) => state.library.libraries);
    const selectedLibrary = useSelector((state: RootState) => state.library.selectedLibrary);
    const selectedSeries = useSelector((state: RootState) => state.series.selectedSeries);
    const selectedSeason = useSelector((state: RootState) => state.series.selectedSeason);

    //Reducers for images size
    const seriesImageWidth = useSelector((state: RootState) => state.seriesImage.width);
    const seriesImageHeight = useSelector((state: RootState) => state.seriesImage.height);
    const episodeImageWidth = useSelector((state: RootState) => state.episodeImage.width);
    const episodeImageHeight = useSelector((state: RootState) => state.episodeImage.height);

    const transparentImageLoaded = useSelector((state: RootState) => state.transparentImageLoaded.isTransparentImageLoaded);

    const handleTransparentImageLoad = () => {
        dispatch(loadTransparentImage());
    }

    const handleSeriesSelection = (series: SeriesData) => {
        dispatch(selectSeries(series));
    };

    const handleSeasonSelection = (season: SeasonData) => {
        dispatch(selectSeason(season));
        dispatch(closeContextMenu());
    };

    const toggleMenu = () => {
        dispatch(toggleContextMenu());
    };
    
    // Show no content view
    if (!selectedLibrary) {
      if (libraries.length == 0){
        return (
          <>
            <div className="no-libraries-container">
              <h2>{t("noLibraryFound")}</h2>
              <h4>{t("addLibraryMessage")}</h4>
            </div>
          </>
        );
      }else{
        dispatch(selectLibrary(libraries[0]));
      }
    }

    // Show series view
    if (selectedLibrary && !selectedSeries) {
      return (
        <>
          <div className="series-container scroll">
            {selectedLibrary.series.map((series: any, index: number) => (
              <div className="episode-box"
                key={index}
                style={{ maxWidth: `${seriesImageWidth}px`}}>
                  <div key={index} className="video-button" onClick={() => handleSeriesSelection(series)}
                  style={{ width: `${seriesImageWidth}px`, height: `${seriesImageHeight}px` }}>
                    {
                      series.coverSrc !== "" ? (
                        <LazyLoadImage className="poster-image" src={"./src/" + series.coverSrc} alt="Poster"
                        style={{ width: `${seriesImageWidth}px`, height: `${seriesImageHeight}px` }}/>
                      ) : (
                        <LazyLoadImage className="poster-image" src="./src/resources/img/fileNotFound.png" alt="Poster"
                        style={{ width: `${seriesImageWidth}px`, height: `${seriesImageHeight}px` }}/>
                      )
                    }
                  </div>
                <a id="seriesName" title={series.name} onClick={() => handleSeriesSelection(series)}>
                  {series.name}
                </a>
                <span id="episodeNumber">{series.seasons[0].year}</span>
              </div>
            ))}
          </div>
        </>
      );
    }

    // Show season view
    if (selectedLibrary && selectedSeries && selectedSeason) {
      return (
        <>
          <div className="season-episodes-container scroll">
            <div className="logo-container">
              {
                selectedLibrary && selectedLibrary.type === "Shows" ? (
                  selectedSeries.logoSrc != "" ? (
                    <LazyLoadImage src={"./src/" + selectedSeries.logoSrc}></LazyLoadImage>
                  ) : (
                    <span id="seriesTitle">{selectedSeries.name}</span>
                  )
                ) : (
                  selectedSeason.logoSrc != "" ? (
                    <LazyLoadImage src={"./src/" + selectedSeason.logoSrc}></LazyLoadImage>
                  ) : (
                    <span id="seriesTitle">{selectedSeries.name}</span>
                  )
                )
              }
            </div>
              {selectedSeason.backgroundSrc != "" ? (<div className="background-image">
                  <LazyLoadImage src={"./src/resources/img/backgrounds/" + selectedSeason.id + "/transparencyEffect.png"} alt="Season Background"
                  onLoad={handleTransparentImageLoad} className={transparentImageLoaded ? 'imageLoaded' : ''}></LazyLoadImage>
              </div>) : (<div></div>)}
            <div className="info-container">
              <div className="poster-image">
                {
                  selectedLibrary.type == "Shows" ? (
                    selectedSeries.coverSrc != "" ? (
                      <LazyLoadImage src={"./src/" + selectedSeries.coverSrc} alt="Poster"/>
                    ) : (
                      <LazyLoadImage src={"./src/resources/img/fileNotFound.png"} alt="Poster"/>
                    )
                    
                  ) : (
                    selectedSeason.coverSrc != "" ? (
                      <LazyLoadImage src={"./src/" + selectedSeason.coverSrc} alt="Poster"/>
                    ) : (
                      <LazyLoadImage src={"./src/resources/img/fileNotFound.png"} alt="Poster"/>
                    )
                  )
                }
              </div>
              <section className="season-info">
                <span id="seasonTitle">{selectedSeason.name}</span>
                <section className="season-info-text">
                  {
                    selectedSeason.directedBy != "" ? (
                      <span id="directedBy">{"Directed by " + selectedSeason.directedBy || ""}</span>
                    ) : (<span></span>)
                  }
                  <span id="date">{selectedSeason.year || ""}</span>
                  <span id="genres">{selectedSeries.genres || ""}</span>
                </section>
                <div className="rating-info">
                  <img src="./src/assets/svg/themoviedb.svg" alt="TheMovieDB logo"/>
                  <span id="rating">{selectedSeason.score || "N/A"}</span>
                </div>
                <section className="season-info-buttons-container">
                <button className="play-button-desktop">
                  <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#1C1C1C"></path></svg>
                  <span id="playText">Reproducir</span>
                </button>
                <button className="svg-button-desktop" title="Mark as watched">
                  <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M38 6V40.125L24.85 33.74L23.5 33.065L22.15 33.74L9 40.125V6H38ZM38 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V45L23.5 36.5L41 45V6C41 5.20435 40.6839 4.44129 40.1213 3.87868C39.5587 3.31607 38.7957 3 38 3Z" fill="#FFFFFF"></path></svg>                </button>
                <button className="svg-button-desktop">
                <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M8.76987 30.5984L4 43L16.4017 38.2302L8.76987 30.5984Z" fill="#FFFFFF"></path><path d="M19.4142 35.5858L41.8787 13.1214C43.0503 11.9498 43.0503 10.0503 41.8787 8.87872L38.1213 5.12135C36.9497 3.94978 35.0503 3.94978 33.8787 5.12136L11.4142 27.5858L19.4142 35.5858Z" fill="#FFFFFF"></path></svg>
                </button>
                <button className="svg-button-desktop">
                  <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M12 27C13.6569 27 15 25.6569 15 24C15 22.3431 13.6569 21 12 21C10.3431 21 9 22.3431 9 24C9 25.6569 10.3431 27 12 27Z" fill="#FFFFFF"></path><path d="M24 27C25.6569 27 27 25.6569 27 24C27 22.3431 25.6569 21 24 21C22.3431 21 21 22.3431 21 24C21 25.6569 22.3431 27 24 27Z" fill="#FFFFFF"></path><path d="M39 24C39 25.6569 37.6569 27 36 27C34.3431 27 33 25.6569 33 24C33 22.3431 34.3431 21 36 21C37.6569 21 39 22.3431 39 24Z" fill="#FFFFFF"></path></svg>
                </button>
              </section>
                <div className="overview-container">
                  <p>{selectedSeason.overview || selectedSeries.overview || t("defaultOverview")}</p>
                  <input type="checkbox" className="expand-btn"
                    style={{color: `white`}}></input>
                  <svg className="expand-svg" aria-hidden="true" height="15" viewBox="0 0 48 48" width="15" xmlns="http://www.w3.org/2000/svg"><path d="M24.1213 33.2213L7 16.1L9.1 14L24.1213 29.0213L39.1426 14L41.2426 16.1L24.1213 33.2213Z"></path></svg>
                </div>
              </section>
            </div>
            <section className="season-selector-container">
              <button className="season-selector" onClick={toggleMenu}>
                <span>{selectedSeason.name}</span>
                {
                  isContextMenuShown ? (
                    <span id="triangle">&#9650;</span>
                  ) : (
                    <span id="triangle">&#9660;</span>
                  )
                }
              </button>
              {isContextMenuShown && (
                <div className="dropdown-menu">
                  {selectedSeries.seasons.map((season: SeasonData, index: number) => (
                    <a
                      key={index}
                      className="dropdown-element"
                      onClick={() => handleSeasonSelection(season)}>{season.name}
                    </a>
                  ))}
                </div>
              )}
            </section>
            <div className="episodes-container">
              {selectedSeason.episodes.map((episode: any, index: number) => (
                <div className="episode-box" 
                style={{ maxWidth: `${episodeImageWidth}px`}}>
                  <div key={index} className="video-button"
                  style={{ width: `${episodeImageWidth}px`, height: `${episodeImageHeight}px` }}>
                    {
                      episode.imgSrc != "" ? (
                        <LazyLoadImage src={"./src/" + episode.imgSrc}
                          style={{ width: `${episodeImageWidth}px`, height: `${episodeImageHeight}px` }}
                          alt="Video Thumbnail"/>
                      ) : (
                        <LazyLoadImage src={"./src/resources/img/Default_video_thumbnail.jpg"}
                          style={{ width: `${episodeImageWidth}px`, height: `${episodeImageHeight}px` }}
                          alt="Video Thumbnail"/>
                      )
                    }
                  </div>
                  <span id="episodeName" title={episode.name}>{episode.name}</span>
                  <span id="episodeNumber">{t("episode") + " " + episode.episodeNumber}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }
  };