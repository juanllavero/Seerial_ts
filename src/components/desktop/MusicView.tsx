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
import { selectEpisode, toggleEpisodeWindow } from 'redux/slices/dataSlice';
import { toggleEpisodeMenu } from 'redux/slices/contextMenuSlice';
import { useDispatch } from 'react-redux';
import { setCurrentSong, setSongs, toggleMusicPause } from 'redux/slices/musicPlayerSlice';

interface MusicViewProps {
    selectedLibrary: LibraryData;
}

const MusicView: React.FC<MusicViewProps> = ({ selectedLibrary }) => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const [selectionMode, setSelectionMode] = useState<boolean>(false);
    const [selectedElements, setSelectedElements] = useState<EpisodeData[]>([]); 
    const [selectedElement, setSelectedElement] = useState(undefined);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    const cmSong = useRef<ContextMenu | null>(null);

    const songList = useMemo(() => {
        let allSongs: EpisodeData[] = [];

        selectedLibrary.series.forEach(serie => {
            if (serie.seasons && serie.seasons.length > 0){
                serie.seasons.forEach(season =>
                    season.episodes.forEach(episode => {
                        allSongs.push(episode);
                    })
                )
            }
        });

        return allSongs;
    }, [selectedLibrary]);

    const [globalFilterValue, setGlobalFilterValue] = useState('');

    const onGlobalFilterChange = (e: any) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const songCoverTemplate = (rowData: EpisodeData) => {
        return (
            <div className="song-image-container">
                <img
                loading="lazy"
                src={rowData.imgSrc}
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
                            dispatch(setSongs(songList));
                            dispatch(setCurrentSong(songList.indexOf(rowData)));
                            dispatch(toggleMusicPause());
                        }
                    }>
                        <svg aria-hidden="true" height="22" viewBox="0 0 48 48" width="22" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#FFFFFF"></path></svg>
                    </button>
                </div>
            </div>
        );
    };

    const rowClass = (data: EpisodeData) => {
        const classes = ['song-row']; // Clase por defecto

        if (selectionMode) {
            if (selectedElements.includes(data)) {
                classes.push('row-selected');
            }
        } else {
            if (data === selectedElement) {
                classes.push('row-selected');
            }
        }

        return classes.join(' ');
    };

    useEffect(() => {
        if (selectedElements)
            setSelectionMode(selectedElements.length > 0);
    }, [selectedElements]);

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    return (
        <>
            {selectionMode && selectedElements && (
                <div className="floating-box">
                    {selectedElements.length} {selectedElements.length === 1 ? 'row' : 'rows'} selected
                </div>
            )}
            <section className="music-container">
                <ContextMenu model={[
                    {
                        label: t('editButton'),
                        command: () => {
                            dispatch(selectEpisode(selectedElement));
                            dispatch(toggleEpisodeMenu());
                            dispatch(toggleEpisodeWindow());
                        }
                    },
                    {
                        label: t('removeButton'),
                        command: () => {
                            dispatch(toggleEpisodeMenu());
                        }
                    },
                ]} ref={cmSong} onHide={() => setSelectedElement(undefined)} className="dropdown-menu"/>
                <div className="search-container">
                    <IconField  iconPosition="left">
                        <InputIcon className="pi pi-search search-icon" />
                        <InputText className="search-bar" value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                    </IconField>
                </div>
                <DataTable value={songList} filters={filters} removableSort
                onContextMenu={(e) => {
                    if (cmSong && cmSong.current){
                        dispatch(toggleEpisodeMenu());
                        cmSong.current.show(e.originalEvent);
                    }
                }}
                rowClassName={rowClass}
                contextMenuSelection={selectedElement} onContextMenuSelectionChange={(e: any) => setSelectedElement(e.value)}
                selectionMode={selectionMode ? null : 'checkbox'} selection={selectedElements} onSelectionChange={(e: any) => setSelectedElements(e.value)}
                tableStyle={{ minWidth: '50rem', width: '100%' }}
                scrollable scrollHeight="flex" virtualScrollerOptions={{ lazy: true, itemSize: 60 }}
                globalFilterFields={['name', 'albumArtist', 'album', 'year']}
                >   
                    <Column field="imgSrc" 
                        header="" body={songCoverTemplate} 
                        style={{ maxWidth: '65px' }}
                        ></Column>
                    <Column field="name" 
                        header={t('title')} 
                        sortable style={{ width: '30%' }}
                        ></Column>
                    <Column 
                        field="albumArtist" 
                        header={t('albumArtist')} 
                        sortable style={{ width: '20%' }}></Column>
                    <Column 
                        field="album" 
                        header={t('album')} 
                        sortable style={{ width: '30%' }}></Column>
                    <Column 
                        field="year" 
                        header={t('year')} 
                        sortable style={{ width: '10%' }}></Column>
                    <Column 
                        field="runtimeInSeconds" 
                        header={t('duration')}
                        body={(rowData) => formatTime(rowData.runtimeInSeconds)}
                        sortable style={{ width: '10%' }}></Column>
                    <Column 
                        selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                </DataTable>
            </section>
        </>
    );
};

export default MusicView;