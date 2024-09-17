import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { EpisodeData } from '@interfaces/EpisodeData';
import { LibraryData } from '@interfaces/LibraryData';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { InputText } from 'primereact/inputtext';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { ContextMenu } from 'primereact/contextmenu';
import { selectEpisode, selectSeason, selectSeries, showMenu, showSeriesMenu, toggleEpisodeWindow, toggleSeriesWindow } from 'redux/slices/dataSlice';
import { closeContextMenu, toggleEpisodeMenu, toggleSeriesMenu } from 'redux/slices/contextMenuSlice';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentSong, setSongs, toggleMusicPause } from 'redux/slices/musicPlayerSlice';
import { SeriesData } from '@interfaces/SeriesData';
import { RootState } from 'redux/store';
import ResolvedImage from '@components/Image';
import { SeasonData } from '@interfaces/SeasonData';

interface MusicViewProps {
    selectedLibrary: LibraryData;
}

const MusicViewCards: React.FC<MusicViewProps> = ({ selectedLibrary }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [selectedElements, setSelectedElements] = useState<EpisodeData[]>([]); 
    const [selectedElement, setSelectedElement] = useState(undefined);

    //Reducers for images size
    const seriesImageWidth = useSelector((state: RootState) => state.seriesImage.width);
    const seriesImageHeight = useSelector((state: RootState) => state.seriesImage.height);

    const seriesMenu = useSelector((state: RootState) => state.data.seriesMenu);
    const seriesMenuOpen = useSelector((state: RootState) => state.contextMenu.seriesMenu);
    const showButtonMenu = useSelector((state: RootState) => state.data.showEpisodeMenu);

    const cm = useRef<ContextMenu | null>(null);
    
    useEffect(() => {
        if (selectedElements)
            setSelectionMode(selectedElements.length > 0);
    }, [selectedElements]);

    const handleSeriesSelection = (series: SeriesData) => {
        dispatch(selectSeries(series));
        handleSeasonSelection(series.seasons[0]);
    };

    const handleSeasonSelection = (season: SeasonData) => {
        dispatch(selectSeason(season));
        dispatch(closeContextMenu());
    };

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
                        {
                        series === seriesMenu && (showButtonMenu || seriesMenuOpen) ? (
                            <>
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
                        </>
                        ) : null
                        }
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
};

export default MusicViewCards;