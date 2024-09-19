import { LazyLoadImage } from 'react-lazy-load-image-component';
import { useDispatch, useSelector } from 'react-redux';
import { selectEpisode, showMenu, toggleEpisodeWindow, 
  selectSeries, selectSeason, showSeriesMenu, setShowPoster,
  selectLibrary, 
  toggleSeasonWindow,
  toggleSeriesWindow} from '../../redux/slices/dataSlice';
import { RootState } from '../../redux/store';
import { SeriesData } from '@interfaces/SeriesData';
import { SeasonData } from '@interfaces/SeasonData';
import { EpisodeData } from '@interfaces/EpisodeData';
import { closeAllMenus, closeContextMenu, toggleContextMenu, toggleEpisodeMenu, toggleSeasonMenu, toggleSeriesMenu } from 'redux/slices/contextMenuSlice';
import { loadTransparentImage } from 'redux/slices/transparentImageLoadedSlice';
import { loadVideo } from 'redux/slices/videoSlice';
import { useTranslation } from 'react-i18next';
import '../../i18n';
import ResolvedImage from '@components/Image';
import { useEffect, useRef, useState } from 'react';
import { ContextMenu } from 'primereact/contextmenu';
import MusicView from './MusicView';
import MusicViewCards from './MusicViewCards';
import { MusicSection } from 'data/enums/MusicSection';
import { Dropdown } from 'primereact/dropdown';

export const renderRightPanelContent = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const isContextMenuShown = useSelector((state: RootState) => state.contextMenu.isContextShown);
    const seasonMenuOpen = useSelector((state: RootState) => state.contextMenu.seasonMenu);

    const libraries = useSelector((state: RootState) => state.data.libraries);
    const selectedLibrary = useSelector((state: RootState) => state.data.selectedLibrary);
    const selectedSeries = useSelector((state: RootState) => state.data.selectedSeries);
    const selectedSeason = useSelector((state: RootState) => state.data.selectedSeason);
    const selectedEpisode = useSelector((state: RootState) => state.data.selectedEpisode);

    const seriesMenu = useSelector((state: RootState) => state.data.seriesMenu);
    const seriesMenuOpen = useSelector((state: RootState) => state.contextMenu.seriesMenu);
    const episodeMenuOpen = useSelector((state: RootState) => state.contextMenu.episodeMenu);

    //Reducers for images size
    const seriesImageWidth = useSelector((state: RootState) => state.seriesImage.width);
    const seriesImageHeight = useSelector((state: RootState) => state.seriesImage.height);
    const episodeImageWidth = useSelector((state: RootState) => state.episodeImage.width);
    const episodeImageHeight = useSelector((state: RootState) => state.episodeImage.height);

    const transparentImageLoaded = useSelector((state: RootState) => state.transparentImageLoaded.isTransparentImageLoaded);
    const showCollectionPoster = useSelector((state: RootState) => state.data.showCollectionPoster);
    const showButtonMenu = useSelector((state: RootState) => state.data.showEpisodeMenu);

    const [musicSection, setMusicSection] = useState<MusicSection>(MusicSection.Collections);

    const cm = useRef<ContextMenu | null>(null);
    const cm2 = useRef<ContextMenu | null>(null);

    //#region TEXT CLAMP
    const clampTextRef = useRef<HTMLDivElement[]>([]);
    const clampActionRef = useRef<HTMLButtonElement[]>([]);

    /* check if the item is clamped or not */
    const showReadMoreButton = (element: HTMLElement) => {
      if (
        element.offsetHeight < element.scrollHeight ||
        element.offsetWidth < element.scrollWidth
      ) {
        element.classList.add('clamped');
      }
    };

    useEffect(() => {
      // Query the elements and set references
      const clampTextElements = Array.from(document.querySelectorAll<HTMLDivElement>('.clamp-text'));
      clampTextRef.current = clampTextElements;
  
      clampTextRef.current.forEach((el) => showReadMoreButton(el));
  
      const clampActionElements = Array.from(document.querySelectorAll<HTMLButtonElement>('.clamp-text-action'));
      clampActionRef.current = clampActionElements;
  
      clampActionRef.current.forEach((el) => {
        let isOpen = false;
        el.addEventListener('click', () => {
          const clampedEl = el.previousElementSibling as HTMLElement;
  
          isOpen = !isOpen;
  
          if (isOpen) {
            clampedEl.classList.add('open');
            el.classList.add('open');
          } else {
            clampedEl.classList.remove('open');
            el.classList.remove('open');
          }
        });
      });
    }, [selectedSeason]);
    //#endregion

    const changePoster = () => {
      dispatch(setShowPoster(!showCollectionPoster));
    }

    const handleTransparentImageLoad = () => {
      dispatch(loadTransparentImage());
    }

    const handleSeriesSelection = (series: SeriesData) => {
      dispatch(selectSeries(series));
      handleSeasonSelection(series.seasons[0]);
    };

    const handleSeasonSelection = (season: SeasonData) => {
      dispatch(selectSeason(season));
      dispatch(closeContextMenu());
    };

    const handleEpisodeSelection = (episode: EpisodeData) => {
      dispatch(selectEpisode(episode));
      dispatch(loadVideo());

      if (selectedLibrary && selectedSeries && selectedSeason && episode)
        window.electronAPI.startMPV(selectedLibrary, selectedSeries, selectedSeason, episode);
    }

    const handleEpisodeMenu = (episode: EpisodeData, show: boolean) => {
      dispatch(selectEpisode(episode))
      dispatch(showMenu(show));
    }

    function toggleMenu() {
    dispatch(toggleContextMenu());
  }

    useEffect(() => {
      const scroll = document.getElementById('scroll');
      if (scroll) {
        scroll.scrollTop = 0;
      }
    }, [selectedSeries, selectedLibrary]);
    
    // Show no content view
    if (!selectedLibrary) {
      if (libraries.length > 0){
        dispatch(selectLibrary(libraries[0]));
      }else{
        return (
          <>
            <div className="no-libraries-container">
              <h2>{t("noLibraryFound")}</h2>
              <h4>{t("addLibraryMessage")}</h4>
            </div>
          </>
        );
      }
    }

    if (selectedLibrary && selectedLibrary.type === "Music"){
      return (
        <>
          <div className="music-section">
            {
              !selectedSeries ? (
                <Dropdown value={musicSection}
                  onChange={(e) => setMusicSection(e.value)} options={
                  [
                    { name: t('collections'), value: MusicSection.Collections },
                    { name: t('tracks'), value: MusicSection.Tracks }
                  ]
                } optionLabel="name" className="music-section-selector" checkmark={true}  highlightOnSelect={false} />
              ) : null
            }
            {
              musicSection === MusicSection.Tracks ? (
                <MusicView selectedLibrary={selectedLibrary} />
              ) : (
                <MusicViewCards selectedLibrary={selectedLibrary} />
              )
            }
          </div>
        </>
      )
    }

    // Show series view
    if (selectedLibrary && !selectedSeries) {
      return (
        <>
          <div className="series-container scroll" id="scroll">
            {selectedLibrary.series.map((series: SeriesData) => (
              <div className="episode-box" key={series.id}
                style={{ maxWidth: `${seriesImageWidth}px`}}>
                  <div style={{cursor: "pointer"}}
                    onMouseEnter={() => {
                      dispatch(showMenu(true));

                      if (!seriesMenuOpen)
                        dispatch(showSeriesMenu(series));
                    }}
                    onMouseLeave={() => {
                      dispatch(showMenu(false));
                    }}
                    onAuxClick={(e) => {
                      if (seriesMenu && series === seriesMenu){
                        dispatch(toggleSeriesMenu());
                        cm.current?.show(e);
                      }
                    }}>
                    <div className="video-button-image-section">
                      <div className="video-button-hover"
                        style={{ width: `${seriesImageWidth}px`, height: `${seriesImageHeight}px` }}
                        >
                        <div className="series-selection-div" onClick={() => handleSeriesSelection(series)}></div>
                        <div className="bottom-btns">
                          <button className="svg-button-desktop-transparent"
                          onClick={() => dispatch(toggleSeriesWindow())}>
                            <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M8.76987 30.5984L4 43L16.4017 38.2302L8.76987 30.5984Z" fill="#FFFFFF"></path><path d="M19.4142 35.5858L41.8787 13.1214C43.0503 11.9498 43.0503 10.0503 41.8787 8.87872L38.1213 5.12135C36.9497 3.94978 35.0503 3.94978 33.8787 5.12136L11.4142 27.5858L19.4142 35.5858Z" fill="#FFFFFF"></path></svg>
                          </button>
                          <button className="svg-button-desktop-transparent"
                          onClick={(e) => {
                            dispatch(toggleSeriesMenu());
                            cm.current?.show(e);
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560" aria-hidden="true" width="16" height="16"><path d="M350 280c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70m0-210c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70m0 420c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70" fill="#FFFFFF"></path></svg>
                          </button>
                        </div>
                      </div>
                      <div className="video-button"
                    style={{ width: `${seriesImageWidth}px`, height: `${seriesImageHeight}px` }}>
                      {
                        series.coverSrc !== "" ? (
                          <ResolvedImage src={series.coverSrc} alt="Poster"
                          style={{ width: `${seriesImageWidth}px`, height: `${seriesImageHeight}px` }}
                          onError={(e: any) => {
                            e.target.onerror = null; // To avoid infinite loop
                            e.target.src = "./src/resources/img/fileNotFound.jpg";
                          }}/>
                        ) : series.seasons[0].coverSrc !== "" ? (
                          <ResolvedImage src={series.seasons[0].coverSrc} alt="Poster"
                          style={{ width: `${seriesImageWidth}px`, height: `${seriesImageHeight}px` }}
                          onError={(e: any) => {
                            e.target.onerror = null; // To avoid infinite loop
                            e.target.src = "./src/resources/img/fileNotFound.jpg";
                          }}/>
                        ) : (
                          <ResolvedImage src="resources/img/fileNotFound.jpg" alt="Poster"
                          style={{ width: `${seriesImageWidth}px`, height: `${seriesImageHeight}px` }}/>
                        )
                      }
                      </div>
                    </div>
                  </div>
                <a id="seriesName" title={series.name} onClick={() => handleSeriesSelection(series)}>
                  {series.name}
                </a>
                {
                  series.seasons.length > 1 ? (
                    <span id="episodeNumber">
                      {(() => {
                        const minYear = Math.min(...series.seasons.map((season: SeasonData) => Number.parseInt(season.year)));
                        const maxYear = Math.max(...series.seasons.map((season: SeasonData) => Number.parseInt(season.year)));
                        return minYear === maxYear ? `${minYear}` : `${minYear} - ${maxYear}`;
                      })()}
                    </span>
                  ) : (
                    <span id="episodeNumber">{new Date(series.seasons[0].year).getFullYear()}</span>
                  )
                }
                <ContextMenu 
                  model={[
                    {
                      label: t('editButton'),
                      command: () => {
                        dispatch(toggleSeriesMenu());
                        dispatch(toggleSeriesWindow());
                      }
                    },
                    {
                      label: t('markWatched'),
                      command: () => dispatch(toggleSeriesMenu())
                    },
                    {
                      label: t('markUnwatched'),
                      command: () => dispatch(toggleSeriesMenu())
                    },
                    ...(selectedLibrary?.type === "Shows" || !series?.isCollection ? [{
                      label: t('correctIdentification'),
                      command: () => dispatch(toggleSeriesMenu())
                      }] : []),
                    ...(selectedLibrary?.type === "Shows" ? [{
                      label: t('changeEpisodesGroup'),
                      command: () => dispatch(toggleSeriesMenu())
                      }] : []),
                    {
                      label: t('removeButton'),
                      command: () => dispatch(toggleSeriesMenu())
                    }
                ]}
                ref={cm} className="dropdown-menu"/>
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
          <div className="season-episodes-container scroll" id="scroll">
            <div className="logo-container">
              {
                selectedLibrary && selectedLibrary.type === "Shows" ? (
                  selectedSeries.logoSrc != "" ? (
                    <ResolvedImage src={selectedSeries.logoSrc}
                    onError={(e: any) => {
                      e.target.onerror = null; // To avoid infinite loop
                      e.target.src = "";
                    }}/>
                  ) : (
                    <span id="seriesTitle">{selectedSeries.name}</span>
                  )
                ) : (
                  selectedSeason.logoSrc != "" ? (
                    <ResolvedImage src={selectedSeason.logoSrc}
                    onError={(e: any) => {
                      e.target.onerror = null; // To avoid infinite loop
                      e.target.src = "";
                    }}/>
                  ) : (
                    <span id="seriesTitle">{selectedSeries.name}</span>
                  )
                )
              }
            </div>
              {selectedSeason.backgroundSrc != "" ? (<div className="background-image">
                  <ResolvedImage src={selectedSeason.backgroundSrc} alt="Season Background"
                  onLoad={handleTransparentImageLoad} className={transparentImageLoaded ? 'imageLoaded' : ''}/>
              </div>) : (<div></div>)}
            <div className="info-container">
              <div className={`poster-image ${selectedLibrary.type !== "Shows" && selectedSeries.seasons.length === 1 ? 'round-image' : ''}`}>
                {
                  selectedLibrary.type == "Shows" || showCollectionPoster ? (
                    selectedSeries.coverSrc != "" ? (
                      <ResolvedImage src={selectedSeries.coverSrc} alt="Poster"
                      onError={(e: any) => {
                        e.target.onerror = null; // To avoid infinite loop
                        e.target.src = "./src/resources/img/fileNotFound.jpg";
                      }}/>
                    ) : (
                      <LazyLoadImage src={"./src/resources/img/fileNotFound.jpg"} alt="Poster"/>
                    )
                  ) : (
                    selectedSeason.coverSrc != "" ? (
                      <ResolvedImage src={selectedSeason.coverSrc} alt="Poster"
                      onError={(e: any) => {
                        e.target.onerror = null; // To avoid infinite loop
                        e.target.src = "./src/resources/img/fileNotFound.jpg";
                      }}/>
                    ) : (
                      <LazyLoadImage src={"./src/resources/img/fileNotFound.jgp"} alt="Poster"/>
                    )
                  )
                }
                {
                  selectedLibrary.type === "Shows" ? (
                    <div className="continue-watching-info">
                      <span>{t('inProgress')} — {t('seasonLetter')}1 · {t('episodeLetter')}3</span>
                    </div>
                  ) : selectedSeries.seasons.length > 1 ? (
                    <button className="show-poster-button"
                      onClick={changePoster}>
                      <span>{showCollectionPoster ? (t('seasonPoster')) : (t('collectionPoster'))}</span>
                    </button>
                  ) : null
                }
              </div>
              <section className="season-info">
                {
                  selectedLibrary.type == "Shows" && selectedSeries.seasons.length > 1 ? (
                    <span id="seasonTitle">{selectedSeason.name}</span>
                  ) : null
                }
                <section className="season-info-text">
                  {
                    selectedSeason.directedBy && selectedSeason.directedBy.length !== 0 ? (
                      <span id="directedBy">{t('directedBy') + " " + selectedSeason.directedBy || ""}</span>
                    ) : (<span></span>)
                  }
                  <span id="date">{new Date(selectedSeason.year).getFullYear() || new Date(selectedSeries.year).getFullYear() || null}</span>
                  <span id="genres">{selectedLibrary.type !== "Shows" ? (selectedSeason.genres && selectedSeason.genres.length > 0 ? selectedSeason.genres.join(', ') || "" : "") : selectedSeries.genres ? selectedSeries.genres.join(', ') || "" : ""}</span>
                </section>
                <div className="rating-info">
                  <img src="./src/assets/svg/themoviedb.svg" alt="TheMovieDB logo"/>
                  <span id="rating">{(selectedLibrary.type === "Shows" ? selectedSeries.score.toFixed(2) : selectedSeason.score.toFixed(2)) || "N/A"}</span>
                </div>
                <section className="season-info-buttons-container">
                <button className="play-button-desktop">
                  <svg aria-hidden="true" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#1C1C1C"></path></svg>
                  <span id="playText">{t('playButton')}</span>
                </button>
                <button className="svg-button-desktop" title="Mark as watched">
                  <svg aria-hidden="true" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M38 6V40.125L24.85 33.74L23.5 33.065L22.15 33.74L9 40.125V6H38ZM38 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V45L23.5 36.5L41 45V6C41 5.20435 40.6839 4.44129 40.1213 3.87868C39.5587 3.31607 38.7957 3 38 3Z" fill="#FFFFFF"></path></svg>                </button>
                <button className="svg-button-desktop" title={t('editButton')} onClick={() => dispatch(toggleSeasonWindow())}>
                <svg aria-hidden="true" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M8.76987 30.5984L4 43L16.4017 38.2302L8.76987 30.5984Z" fill="#FFFFFF"></path><path d="M19.4142 35.5858L41.8787 13.1214C43.0503 11.9498 43.0503 10.0503 41.8787 8.87872L38.1213 5.12135C36.9497 3.94978 35.0503 3.94978 33.8787 5.12136L11.4142 27.5858L19.4142 35.5858Z" fill="#FFFFFF"></path></svg>
                </button>
                <button className="svg-button-desktop"
                onClick={(e) => {
                  dispatch(toggleSeasonMenu());
                  if (!seasonMenuOpen)
                    cm.current?.show(e);
                }}>
                  <svg aria-hidden="true" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M12 27C13.6569 27 15 25.6569 15 24C15 22.3431 13.6569 21 12 21C10.3431 21 9 22.3431 9 24C9 25.6569 10.3431 27 12 27Z" fill="#FFFFFF"></path><path d="M24 27C25.6569 27 27 25.6569 27 24C27 22.3431 25.6569 21 24 21C22.3431 21 21 22.3431 21 24C21 25.6569 22.3431 27 24 27Z" fill="#FFFFFF"></path><path d="M39 24C39 25.6569 37.6569 27 36 27C34.3431 27 33 25.6569 33 24C33 22.3431 34.3431 21 36 21C37.6569 21 39 22.3431 39 24Z" fill="#FFFFFF"></path></svg>
                </button>
                <ContextMenu 
                  model={[
                    ...(selectedLibrary?.type !== "Shows" ? [{
                      label: t('correctIdentification'),
                      command: () => dispatch(toggleSeasonMenu())
                      }] : []),
                    {
                      label: t('updateMetadata'),
                      command: () => dispatch(toggleSeasonMenu())
                    },
                    {
                      label: t('removeButton'),
                      command: () => dispatch(toggleSeasonMenu())
                    }
                ]}
                ref={cm} className="dropdown-menu"/>
              </section>
                <div className="overview-container clamp-text">
                  <span>{selectedSeason.overview || selectedSeries.overview || t("defaultOverview")}</span>
                </div>
                <button className="clamp-text-action">
                  <div aria-hidden="true" className="clamp-text-more">
                    <span>
                      {t('moreButton')}
                      <svg aria-hidden="true" height="16" viewBox="0 0 48 48" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M24.1213 33.2213L7 16.1L9.1 14L24.1213 29.0213L39.1426 14L41.2426 16.1L24.1213 33.2213Z"></path></svg>
                    </span>
                  </div>
                  <div aria-hidden="true" className="clamp-text-less">
                    <span >
                    {t('lessButton')}
                      <svg aria-hidden="true" height="16" viewBox="0 0 48 48" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M24.1213 33.2213L7 16.1L9.1 14L24.1213 29.0213L39.1426 14L41.2426 16.1L24.1213 33.2213Z" transform="rotate(180, 24, 24)"></path></svg>
                    </span>
                  </div>
                </button>
              </section>
            </div>
            {
              selectedSeries.seasons.length > 1 ? (
                <section className="dropdown" style={{marginLeft: "30px"}}>
                  <div className="select season-selector" onClick={() => {
                      if (!isContextMenuShown)
                          dispatch(closeAllMenus());
                      toggleMenu();
                  }} onAuxClick={() => {dispatch(closeAllMenus())}}>
                      <span className="selected">{selectedSeason.name}</span>
                      <div className={`arrow ${isContextMenuShown ? (' arrow-rotate'): ('')}`}></div>
                  </div>
                  <ul id={selectedSeries.id + "dropdown"} className={`menu ${isContextMenuShown ? (' menu-open'): ('')}`}>
                    {[...selectedSeries.seasons].sort((a, b) => {
                      if (a.order !== 0 && b.order !== 0) {
                        return a.order - b.order;
                      }
                      
                      if (a.order === 0 && b.order === 0) {
                        // Order by date
                        return new Date(a.year).getTime() - new Date(b.year).getTime();
                      }
                      
                      // Order number gets preference
                      return a.order === 0 ? 1 : -1;
                    }).map((season: SeasonData) => (
                      <li key={season.id}
                        onClick={() => {
                          toggleMenu();
                          handleSeasonSelection(season);
                        }}>{season.name}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null
            }
            <div className="episodes-container">
              {[...selectedSeason.episodes].sort((a, b) => a.episodeNumber - b.episodeNumber).map((episode: EpisodeData) => (
                <div key={episode.id} className="episode-box" 
                style={{ maxWidth: `${episodeImageWidth}px`}}>
                  <ContextMenu 
                  model={[
                    {
                      label: t('editButton'),
                      command: () => {
                        dispatch(toggleEpisodeMenu());
                        dispatch(toggleEpisodeWindow());
                      }
                    },
                    {
                      label: t('markWatched'),
                      command: () => dispatch(toggleEpisodeMenu())
                    },
                    {
                      label: t('markUnwatched'),
                      command: () => dispatch(toggleEpisodeMenu())
                    },
                    {
                      label: t('removeButton'),
                      command: () => dispatch(toggleEpisodeMenu())
                    }
                  ]}
                  ref={cm2} className="dropdown-menu"/>
                  <div
                  onMouseEnter={() => {handleEpisodeMenu(episode, true)}}
                  onMouseLeave={() => {handleEpisodeMenu(episode, false)}}>
                    {
                      false ? (
                        <div className="episode-slider">
                          <input
                          type="range"
                          min="0"
                          max={episode.runtimeInSeconds}
                          value={episode.timeWatched}
                          step="1"
                          style={{'background': `linear-gradient(to right, #8EDCE6 ${episode.timeWatched + 1550 * 100 / (episode.runtimeInSeconds)}%, #646464 0px`}}
                          className="slider hide-slider-thumb"/>
                        </div>
                      ) : null
                    }
                    <div className="video-button-image-section">
                      <div className="video-button-hover"
                        style={{ width: `${episodeImageWidth}px`, height: `${episodeImageHeight}px` }}
                        >
                          <button className="play-button-episode center-align" onClick={() => handleEpisodeSelection(episode)}>
                            <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#1C1C1C"></path></svg>
                          </button>
                          <button className="svg-button-desktop-transparent left-corner-align" onClick={() => dispatch(toggleEpisodeWindow())}>
                            <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path d="M8.76987 30.5984L4 43L16.4017 38.2302L8.76987 30.5984Z" fill="#FFFFFF"></path><path d="M19.4142 35.5858L41.8787 13.1214C43.0503 11.9498 43.0503 10.0503 41.8787 8.87872L38.1213 5.12135C36.9497 3.94978 35.0503 3.94978 33.8787 5.12136L11.4142 27.5858L19.4142 35.5858Z" fill="#FFFFFF"></path></svg>
                          </button>
                          <button className="svg-button-desktop-transparent right-corner-align"
                          onClick={(e) => {
                            dispatch(toggleEpisodeMenu());
                            cm2.current?.show(e);
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560" aria-hidden="true" width="16" height="16"><path d="M350 280c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70m0-210c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70m0 420c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70" fill="#FFFFFF"></path></svg>
                          </button>
                      </div>
                      <div className="video-button"
                        style={{ width: `${episodeImageWidth}px`, height: `${episodeImageHeight}px` }}
                        >
                        {
                          episode.imgSrc != "" ? (
                            <ResolvedImage src={episode.imgSrc}
                              style={{ width: `${episodeImageWidth}px`, height: `${episodeImageHeight}px` }}
                              alt="Video Thumbnail"
                              onError={(e: any) => {
                                e.target.onerror = null; // To avoid infinite loop
                                e.target.src = "./src/resources/img/Default_video_thumbnail.jpg";
                              }}/>
                          ) : (
                            <LazyLoadImage src={"./src/resources/img/Default_video_thumbnail.jpg"}
                              style={{ width: `${episodeImageWidth}px`, height: `${episodeImageHeight}px` }}
                              alt="Video Thumbnail"/>
                          )
                        }
                      </div>
                    </div>
                  </div>
                  <span id="episodeName" title={episode.name}>{episode.name}</span>
                  {
                    selectedLibrary?.type === "Shows" ? (
                      <span id="episodeNumber">{t("episode") + " " + episode.episodeNumber}</span>
                    ) : null
                  }
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }

    return null;
  };