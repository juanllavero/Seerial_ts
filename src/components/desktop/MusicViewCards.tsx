import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { EpisodeData } from '@interfaces/EpisodeData';
import { LibraryData } from '@interfaces/LibraryData';
import { ContextMenu } from 'primereact/contextmenu';
import { selectSeason, selectSeries, showMenu, showSeriesMenu, toggleSeriesWindow } from 'redux/slices/dataSlice';
import { closeContextMenu, toggleSeasonMenu, toggleSeriesMenu } from 'redux/slices/contextMenuSlice';
import { useDispatch, useSelector } from 'react-redux';
import { SeriesData } from '@interfaces/SeriesData';
import { RootState } from 'redux/store';
import { SeasonData } from '@interfaces/SeasonData';
import { ReactUtils } from 'data/utils/ReactUtils';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { setCurrentSong, setSongs, toggleMusicPause } from 'redux/slices/musicPlayerSlice';

interface MusicViewProps {
    selectedLibrary: LibraryData;
}

const MusicViewCards: React.FC<MusicViewProps> = ({ selectedLibrary }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [selectedElements, setSelectedElements] = useState<EpisodeData[]>([]); 
    //const [selectedElement, setSelectedElement] = useState(undefined);
    //const [playErrorDialog, setPlayErrorDialog] = useState<boolean>(false);

    //Reducers for images size
    const seriesImageWidth = useSelector((state: RootState) => state.seriesImage.width);
    //const seriesImageHeight = useSelector((state: RootState) => state.seriesImage.height);

    const seriesMenu = useSelector((state: RootState) => state.data.seriesMenu);
    const seriesMenuOpen = useSelector((state: RootState) => state.contextMenu.seriesMenu);
    //const showButtonMenu = useSelector((state: RootState) => state.data.showEpisodeMenu);
    //const seasonMenuOpen = useSelector((state: RootState) => state.contextMenu.seasonMenu);

    const musicPaused = useSelector((state: RootState) => state.musicPlayer.paused);

    const selectedCollection = useSelector((state: RootState) => state.data.selectedSeries);
    const selectedAlbum = useSelector((state: RootState) => state.data.selectedSeason);

    const cm = useRef<ContextMenu | null>(null);
    
    useEffect(() => {
        setSelectedElements(selectedElements);  //Only for compiler to work, remove later
        if (selectedElements)
            setSelectionMode(selectedElements.length > 0);
    }, [selectedElements]);

    const generateGradient = (collection: SeriesData | null, album: SeasonData | null) => {
        if (collection && !album) {
            if (collection.coverSrc !== ""){
                ReactUtils.getDominantColors(collection.coverSrc);
            } else {
                ReactUtils.getDominantColors("./src/resources/img/songDefault.png");
            }
        } else if (collection && album) {
            if (album.coverSrc !== ""){
                ReactUtils.getDominantColors(album.coverSrc);
            } else if (collection.coverSrc !== "") {
                ReactUtils.getDominantColors(collection.coverSrc);
            } else {
                ReactUtils.getDominantColors("./src/resources/img/songDefault.png");
            }
        }
    }

    const handleSeriesSelection = (series: SeriesData) => {
        generateGradient(series, null);

        dispatch(selectSeries(series));
        
        if (series.seasons.length === 1){
            handleSeasonSelection(series.seasons[0]);
        } else {
            handleSeasonSelection(null);
        }
    };

    const handleSeasonSelection = (season: SeasonData | null) => {
        if (season)
            generateGradient(selectedCollection, season);
        
        dispatch(selectSeason(season));
        dispatch(closeContextMenu());
    };

    const getDiscs = () => {
        let foundDiscs: number[] = [];

        if (selectedAlbum){
            for (const song of selectedAlbum?.episodes) {
                if (song.seasonNumber !== 0 && !foundDiscs.includes(song.seasonNumber)){
                    foundDiscs.push(song.seasonNumber);
                }
            }
        }

        return foundDiscs;
    }

    const handleRenderSongs = () => {
        const discs = getDiscs();

        if (!selectedAlbum)
            return;

        if (discs.length === 0) {
            return (
                <>
                    <span className="disc-text-title">{selectedAlbum.episodes.length} {t('tracks').toLowerCase()}</span>
                    {selectedAlbum.episodes.slice().sort((a, b) => {
                        const episodeNumberA = a.episodeNumber ?? 0; // Si es undefined o null, usa 0 como valor por defecto
                        const episodeNumberB = b.episodeNumber ?? 0;

                        return episodeNumberA - episodeNumberB;
                    }).map((song: EpisodeData, index: number) => (
                        <div className="music-player-item">
                            <div className="music-player-item-left song-row">
                                <div className="song-image-container">
                                    <span>{song.episodeNumber}</span>
                                    <div className="song-btn-overlay">
                                        <button onClick={
                                            () => {
                                                dispatch(setSongs(selectedAlbum.episodes));
                                                dispatch(setCurrentSong(index));
                                                
                                                if (musicPaused)
                                                    dispatch(toggleMusicPause());
                                            }
                                        }>
                                            <svg aria-hidden="true" height="22" viewBox="0 0 48 48" width="22" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#FFFFFF"></path></svg>
                                        </button>
                                    </div>
                                </div>
                                <div className="music-player-item-text">
                                    <span id="music-player-item-title">{song.name}</span>
                                    <span>{ReactUtils.formatTime(song.runtimeInSeconds)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </>
            );
        } else {
            return (
                <>
                    {discs.map((disc: number) => (
                        <>
                            <span className="disc-text-title">Disc {disc}</span>
                            {selectedAlbum.episodes.filter(song => song.seasonNumber === disc).sort((a, b) => a.episodeNumber - b.episodeNumber).map((song: EpisodeData, index: number) => (
                                <div className="music-player-item">
                                    <div className="music-player-item-left song-row">
                                        <div className="song-image-container">
                                            <span>{song.episodeNumber}</span>
                                            <div className="song-btn-overlay">
                                                <button onClick={
                                                    () => {
                                                        dispatch(setSongs(selectedAlbum.episodes));
                                                        dispatch(setCurrentSong(index));
                                                        
                                                        if (musicPaused)
                                                            dispatch(toggleMusicPause());
                                                    }
                                                }>
                                                    <svg aria-hidden="true" height="22" viewBox="0 0 48 48" width="22" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#FFFFFF"></path></svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="music-player-item-text">
                                            <span id="music-player-item-title">{song.name}</span>
                                            <span>{ReactUtils.formatTime(song.runtimeInSeconds)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ))}
                </>
            );
        }
    }

    if (!selectedCollection){
        return (
            <>
                {selectionMode && selectedElements && (
                    <div className="floating-box">
                        {selectedElements.length} {selectedElements.length === 1 ? 'row' : 'rows'} selected
                    </div>
                )}
                <div className="music-cards scroll" id="scroll">
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
                                    <div className={`loading-element-hover ${series.analyzingFiles ? 'loading-visible' : ''}`}style={{ width: `${seriesImageWidth}px`, height: `${seriesImageWidth}px` }}>
                                        <span className="spinner"></span>
                                    </div>
                                    <div className="video-button-hover"
                                        style={{ width: `${seriesImageWidth}px`, height: `${seriesImageWidth}px` }}
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
                                        style={{ width: `${seriesImageWidth}px`, height: `${seriesImageWidth}px` }}>
                                        <img loading='lazy' src={series.coverSrc} alt="Poster"
                                            style={{ width: `${seriesImageWidth}px`, height: `${seriesImageWidth}px` }}
                                            onError={(e: any) => {
                                                e.target.onerror = null; // To avoid infinite loop
                                                e.target.src = "./src/resources/img/songDefault.png";
                                        }}/>
                                    </div>
                                </div>
                            </div>
                            <a id="seriesName" title={series.name} onClick={() => handleSeriesSelection(series)}>
                            {series.name}
                            </a>
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
    } else if (selectedCollection && !selectedAlbum){
        return (
            <>
                {selectionMode && selectedElements && (
                    <div className="floating-box">
                        {selectedElements.length} {selectedElements.length === 1 ? 'row' : 'rows'} selected
                    </div>
                )}
                <section className="music-view-info-container">
                    <div className="info-container">
                        <div className={`loading-element-hover ${selectedCollection.analyzingFiles ? 'loading-visible' : ''}`}style={{ width: `${seriesImageWidth}px`, height: `${seriesImageWidth}px` }}>
                            <span className="spinner"></span>
                        </div>
                        <div className="poster-image round-image">
                            <LazyLoadImage src={selectedCollection.coverSrc} alt="Poster"
                                onError={(e: any) => {
                                    e.target.onerror = null; // To avoid infinite loop
                                    e.target.src = "./src/resources/img/songDefault.png";
                            }}/>
                        </div>
                        <section className="season-info">
                            <span id="seasonTitle">{selectedCollection.name}</span>
                            {/*
                            <section className="season-info-text">
                            {
                                selectedCollection.genres && selectedCollection.directedBy.length !== 0 ? (
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
                            */}
                            <section className="season-info-buttons-container">
                                <button className="play-button-desktop">
                                    <svg aria-hidden="true" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#1C1C1C"></path></svg>
                                    <span id="playText">{t('playButton')}</span>
                                </button>
                                <button className="svg-button-desktop" title="Mark as watched">
                                    <svg aria-hidden="true" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M38 6V40.125L24.85 33.74L23.5 33.065L22.15 33.74L9 40.125V6H38ZM38 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V45L23.5 36.5L41 45V6C41 5.20435 40.6839 4.44129 40.1213 3.87868C39.5587 3.31607 38.7957 3 38 3Z" fill="#FFFFFF"></path></svg>                </button>
                                <button className="svg-button-desktop" title={t('editButton')} onClick={() => dispatch(toggleSeriesWindow())}>
                                    <svg aria-hidden="true" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M8.76987 30.5984L4 43L16.4017 38.2302L8.76987 30.5984Z" fill="#FFFFFF"></path><path d="M19.4142 35.5858L41.8787 13.1214C43.0503 11.9498 43.0503 10.0503 41.8787 8.87872L38.1213 5.12135C36.9497 3.94978 35.0503 3.94978 33.8787 5.12136L11.4142 27.5858L19.4142 35.5858Z" fill="#FFFFFF"></path></svg>
                                </button>
                                <button className="svg-button-desktop"
                                    onClick={(e) => {
                                    dispatch(toggleSeriesMenu());
                                        if (!seriesMenuOpen)
                                            cm.current?.show(e);
                                    }}
                                >
                                    <svg aria-hidden="true" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M12 27C13.6569 27 15 25.6569 15 24C15 22.3431 13.6569 21 12 21C10.3431 21 9 22.3431 9 24C9 25.6569 10.3431 27 12 27Z" fill="#FFFFFF"></path><path d="M24 27C25.6569 27 27 25.6569 27 24C27 22.3431 25.6569 21 24 21C22.3431 21 21 22.3431 21 24C21 25.6569 22.3431 27 24 27Z" fill="#FFFFFF"></path><path d="M39 24C39 25.6569 37.6569 27 36 27C34.3431 27 33 25.6569 33 24C33 22.3431 34.3431 21 36 21C37.6569 21 39 22.3431 39 24Z" fill="#FFFFFF"></path></svg>
                                </button>
                                <ContextMenu 
                                model={[
                                    ...(selectedLibrary?.type !== "Shows" ? [{
                                    label: t('correctIdentification'),
                                    command: () => dispatch(toggleSeriesMenu())
                                    }] : []),
                                    {
                                    label: t('updateMetadata'),
                                    command: () => dispatch(toggleSeriesMenu())
                                    },
                                    {
                                    label: t('removeButton'),
                                    command: () => dispatch(toggleSeriesMenu())
                                    }
                                ]}
                                ref={cm} className="dropdown-menu"/>
                            </section>
                            {
                                selectedCollection.overview ? (
                                    <>
                                        <div className="overview-container clamp-text">
                                            <span>{selectedCollection.overview}</span>
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
                                    </>
                                ) : null
                            }
                        </section>
                    </div>
                </section>
                <span className="album-section-text">{t('albums')}</span>
                <div className="music-cards scroll" id="scroll">
                    {selectedCollection.seasons.map((album: SeasonData) => (
                        <div className="episode-box" key={album.id}
                            style={{ maxWidth: `${seriesImageWidth}px`}}>
                            <div style={{cursor: "pointer"}}
                            onMouseEnter={() => {
                                dispatch(showMenu(true));
    
                                if (!seriesMenuOpen)
                                dispatch(toggleSeasonMenu());
                            }}
                            onMouseLeave={() => {
                                dispatch(showMenu(false));
                            }}
                            onAuxClick={(e) => {
                                if (selectedAlbum && album === selectedAlbum){
                                    dispatch(toggleSeasonMenu());
                                    cm.current?.show(e);
                                }
                            }}>
                                <div className="video-button-image-section">
                                    <div className="video-button-hover"
                                        style={{ width: `${seriesImageWidth}px`, height: `${seriesImageWidth}px` }}
                                        >
                                        <div className="series-selection-div" onClick={() => handleSeasonSelection(album)}></div>
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
                                        style={{ width: `${seriesImageWidth}px`, height: `${seriesImageWidth}px` }}>
                                        <img loading='lazy' src={album.coverSrc} alt="Poster"
                                            style={{ width: `${seriesImageWidth}px`, height: `${seriesImageWidth}px` }}
                                            onError={(e: any) => {
                                                e.target.onerror = null; // To avoid infinite loop
                                                e.target.src = "./src/resources/img/songDefault.png";
                                        }}/>
                                    </div>
                                </div>
                            </div>
                            <a id="seriesName" title={album.name} onClick={() => handleSeasonSelection(album)}>
                            {album.name}
                            </a>
                            {
                                album.year !== "" ? (
                                    <span id="episodeNumber">{new Date(album.year).getFullYear()}</span>
                                ) : null
                            }
                            <ContextMenu 
                            model={[
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
                        </div>
                    ))}
                </div>
                
            </>
        );
    } else if (selectedCollection && selectedAlbum) {
        return (
            <>
                {selectionMode && selectedElements && (
                    <div className="floating-box">
                        {selectedElements.length} {selectedElements.length === 1 ? 'row' : 'rows'} selected
                    </div>
                )}
                <div className="album-content scroll" id="scroll">
                    <section className="album-info-container">
                        <div className="info-container">
                            <div className="poster-image round-image">
                                <LazyLoadImage src={selectedAlbum.coverSrc} alt="Poster"
                                    onError={(e: any) => {
                                        e.target.onerror = null; // To avoid infinite loop
                                        e.target.src = "./src/resources/img/songDefault.png";
                            }}/>
                            </div>
                            <section className="season-info">
                                <a id="seriesTitle" onClick={() => dispatch(selectSeason(null))}>{selectedCollection.name}</a>
                                <span id="seasonTitle">{selectedAlbum.name}</span>
                                <span id="date">{new Date(selectedAlbum.year).getFullYear() || null}</span>
                                {/*
                                <section className="season-info-text">
                                {
                                    selectedCollection.genres && selectedCollection.directedBy.length !== 0 ? (
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
                                */}
                                <section className="season-info-buttons-container">
                                    <button className="play-button-desktop">
                                        <svg aria-hidden="true" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#1C1C1C"></path></svg>
                                        <span id="playText">{t('playButton')}</span>
                                    </button>
                                    <button className="svg-button-desktop" title="Mark as watched">
                                        <svg aria-hidden="true" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M38 6V40.125L24.85 33.74L23.5 33.065L22.15 33.74L9 40.125V6H38ZM38 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V45L23.5 36.5L41 45V6C41 5.20435 40.6839 4.44129 40.1213 3.87868C39.5587 3.31607 38.7957 3 38 3Z" fill="#FFFFFF"></path></svg>                </button>
                                    <button className="svg-button-desktop" title={t('editButton')} onClick={() => dispatch(toggleSeriesWindow())}>
                                        <svg aria-hidden="true" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M8.76987 30.5984L4 43L16.4017 38.2302L8.76987 30.5984Z" fill="#FFFFFF"></path><path d="M19.4142 35.5858L41.8787 13.1214C43.0503 11.9498 43.0503 10.0503 41.8787 8.87872L38.1213 5.12135C36.9497 3.94978 35.0503 3.94978 33.8787 5.12136L11.4142 27.5858L19.4142 35.5858Z" fill="#FFFFFF"></path></svg>
                                    </button>
                                    <button className="svg-button-desktop"
                                        onClick={(e) => {
                                        dispatch(toggleSeasonMenu());
                                            if (!seriesMenuOpen)
                                                cm.current?.show(e);
                                        }}
                                    >
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
                            </section>
                        </div>
                    </section>
                    <div className="song-list">
                        {handleRenderSongs()}
                    </div>
                </div>
            </>
        );
    }
};

export default MusicViewCards;