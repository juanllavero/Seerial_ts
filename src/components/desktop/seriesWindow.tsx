import { Section } from "data/enums/Section";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import '../../App.scss';
import { useTranslation } from "react-i18next";
import { toggleSeasonWindow, toggleSeriesWindow, updateSeason } from "redux/slices/dataSlice";
import { TagsInput } from "react-tag-input-component";
import ResolvedImage from "@components/Image";

const renderSeriesWindow = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const menuSection = useSelector((state: RootState) => state.sectionState.menuSection);
    const seriesMenuOpen = useSelector((state: RootState) => state.data.seriesWindowOpen);
    const library = useSelector((state: RootState) => state.data.selectedLibrary);
    const series = useSelector((state: RootState) => state.data.seriesMenu);
    const season = useSelector((state: RootState) => state.data.selectedSeason);

    const [resolution, setResolution] = useState({ width: 0, height: 0 });

    const [pasteUrl, setPasteUrl] = useState<boolean>(false);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [imageDownloaded, setImageDownloaded] = useState<boolean>(false);

    const [logos, setLogos] = useState<string[]>([]);
    const [posters, setPosters] = useState<string[]>([]);
    const [selectedLogo, selectLogo] = useState<string | undefined>(undefined);
    const [selectedPoster, selectPoster] = useState<string | undefined>(undefined);

    const [nameLock, setNameLock] = useState<boolean>(false);
    const [yearLock, setYearLock] = useState<boolean>(false);
    const [overviewLock, setOverviewLock] = useState<boolean>(false);
    const [taglineLock, setTaglineLock] = useState<boolean>(false);

    const [genresLock, setGenresLock] = useState<boolean>(false);
    const [studiosLock, setStudiosLock] = useState<boolean>(false);
    const [creatorLock, setCreatorLock] = useState<boolean>(false);
    const [musicLock, setMusicLock] = useState<boolean>(false);

    const [name, setName] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [overview, setOverview] = useState<string>("");
    const [tagline, setTagline] = useState<string>("");

    const [genres, setGenres] = useState<string[]>([]);
    const [studios, setStudios] = useState<string[]>([]);
    const [creator, setCreator] = useState<string[]>([]);
    const [music, setMusic] = useState<string[]>([]);


    useEffect(() => {
        const fetchLogos = async () => {
            setPasteUrl(false);
            
            const logoPath = await window.electronAPI.getExternalPath("resources/img/logos/" + series?.id + "/");
            if (logoPath) {
                const images = await window.electronAPI.getImages(logoPath);
                setLogos(images);
            }

            if (series?.logoSrc)
                selectLogo(series?.logoSrc.split('/').pop());
        }

        const fetchPosters = async () => {
            const posterPath = await window.electronAPI.getExternalPath("resources/img/posters/" + series?.id + "/");
            if (posterPath) {
                const images = await window.electronAPI.getImages(posterPath);
                setPosters(images);
            }

            if (series?.coverSrc)
                selectPoster(series?.coverSrc.split('/').pop());
        }

        if (menuSection === Section.Logos){
            fetchLogos().then(() => setImageDownloaded(false));
        }else if (menuSection === Section.Posters){
            fetchPosters().then(() => setImageDownloaded(false));
        }
    }, [menuSection, imageDownloaded]);

    useEffect(() => {
        if (seriesMenuOpen && series) {
            let noImages: string[] = [];
            setPosters(noImages);
            setLogos(noImages);
            dispatch(changeMenuSection(Section.General));

            if (library?.type === "Shows") {
                setYear(series.year);
                setGenres(series.genres);
                setStudios(series.productionStudios);
                setCreator(series.creator);
                setMusic(series.musicComposer);
                setTagline(series.tagline);

                setYearLock(series.yearLock);
                setStudiosLock(series.taglineLock);
                setTaglineLock(series.studioLock);
                setCreatorLock(series.creatorLock);
                setMusicLock(series.musicLock);
                setGenresLock(series.genresLock);
            }

            setName(series.name);
            setOverview(series.overview);

            setNameLock(series.nameLock);
            setOverviewLock(series.overviewLock);
        }
    }, [seriesMenuOpen]);

    useEffect(() => {
        window.ipcRenderer.on('download-complete', (_event, _message) => {
            setImageDownloaded(true);
        });

        window.ipcRenderer.on('download-error', (_event, message) => {
            alert(`Error: ${message}`);
        });
    }, []);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setResolution({
        width: img.naturalWidth,
        height: img.naturalHeight,
        });
    };

    const handleSavingChanges = () => {
        if (season) {
            dispatch(updateSeason({
                name: name,
                overview: overview,
                year: year,
                order: season.order,
                id: season.id,
                tagline: tagline,
                score: season.score,
                seasonNumber: season.seasonNumber,
                logoSrc: season.logoSrc,
                coverSrc: season.coverSrc,
                backgroundSrc: season.backgroundSrc,
                videoSrc: season.videoSrc,
                musicSrc: season.musicSrc,
                seriesID: season.seriesID,
                themdbID: season.themdbID,
                imdbID: season.imdbID,
                lastDisc: season.lastDisc,
                folder: season.folder,
                showName: season.showName,
                audioTrackLanguage: season.audioTrackLanguage,
                selectedAudioTrack: season.selectedAudioTrack,
                subtitleTrackLanguage: season.subtitleTrackLanguage,
                selectedSubtitleTrack: season.selectedSubtitleTrack,
                episodes: season.episodes,
                genres: season.genres,
                currentlyWatchingEpisode: season.currentlyWatchingEpisode,
                cast: season.cast,
                creator: season.creator,
                musicComposer: season.musicComposer,
                directedBy: season.directedBy,
                writtenBy: season.writtenBy,
                productionStudios: season.productionStudios,
                nameLock: season.nameLock,
                overviewLock: season.overviewLock,
                yearLock: season.yearLock,
                studioLock: season.studioLock,
                taglineLock: season.taglineLock
            }));
        }

        dispatch(toggleSeasonWindow());
    };

    const handleDownload = () => {
        setPasteUrl(false);
        window.ipcRenderer.send('download-image-url', imageUrl, "resources/img/seriesCovers/" + series?.id + "/");
    };

    return (
        <>
            <section className={`dialog ${seriesMenuOpen ? ' dialog-active' : ''}`}>
                <div className="dialog-background" onClick={() => dispatch(toggleSeriesWindow())}></div>
                <div className="dialog-box">
                <section className="dialog-top">
                    <span>{t('editButton') + ": " + series?.name}</span>
                    <button className="close-window-btn" onClick={() => dispatch(toggleSeriesWindow())}>
                    <img src="./src/assets/svg/windowClose.svg" 
                    style={{width: '24px', height: '24px', filter: 'drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))'}} />
                    </button>
                </section>
                <section className="dialog-center">
                    <div className="dialog-center-left">
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.General ? ' desktop-dialog-side-btn-active' : ''}`}
                    onClick={() => dispatch(changeMenuSection(Section.General))}>{t('generalButton')}</button>
                    {
                        library?.type === "Shows" ? (
                            <>
                                <button className={`desktop-dialog-side-btn ${menuSection === Section.Details ? ' desktop-dialog-side-btn-active' : ''}`}
                                onClick={() => dispatch(changeMenuSection(Section.Details))}>{t('tags')}</button>
                                <button className={`desktop-dialog-side-btn ${menuSection === Section.Logos ? ' desktop-dialog-side-btn-active' : ''}`}
                                onClick={() => dispatch(changeMenuSection(Section.Logos))}>{t('logosButton')}</button>
                                <button className={`desktop-dialog-side-btn ${menuSection === Section.Posters ? ' desktop-dialog-side-btn-active' : ''}`}
                                onClick={() => dispatch(changeMenuSection(Section.Posters))}>{t('postersButton')}</button>
                            </>
                        ) : (
                            <button className={`desktop-dialog-side-btn ${menuSection === Section.Posters ? ' desktop-dialog-side-btn-active' : ''}`}
                            onClick={() => dispatch(changeMenuSection(Section.Posters))}>{t('postersButton')}</button>
                        )
                    }
                    </div>
                    <div className="dialog-center-right scroll">
                    {
                        menuSection === Section.General ? (
                            library?.type === "Shows" ? (
                                <>
                                    <div className="dialog-input-box">
                                        <span>{t('name')}</span>
                                        <div className={`dialog-input-lock ${nameLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setNameLock(!nameLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" value={name} onChange={(e) => {
                                                setNameLock(true);
                                                setName(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                    <div className="dialog-input-box">
                                        <span>{t('year')}</span>
                                        <div className={`dialog-input-lock ${yearLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setYearLock(!yearLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" value={year} onChange={(e) => {
                                                setYearLock(true);
                                                setYear(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                    <div className="dialog-input-box">
                                        <span>{t('tagline')}</span>
                                        <div className={`dialog-input-lock ${taglineLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setTaglineLock(!taglineLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" value={tagline} onChange={(e) => {
                                                setTaglineLock(true);
                                                setTagline(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                    <div className="dialog-input-box">
                                        <span>{t('overview')}</span>
                                        <div className={`dialog-input-lock ${overviewLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setOverviewLock(!overviewLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <textarea rows={5} value={overview} onChange={(e) => {
                                                setOverviewLock(true);
                                                setOverview(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="dialog-input-box">
                                        <span>{t('name')}</span>
                                        <div className={`dialog-input-lock ${nameLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setNameLock(!nameLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" value={name} onChange={(e) => {
                                                setNameLock(true);
                                                setName(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                    <div className="dialog-input-box">
                                        <span>{t('overview')}</span>
                                        <div className={`dialog-input-lock ${overviewLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setOverviewLock(!overviewLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <textarea rows={5} value={overview} onChange={(e) => {
                                                setOverviewLock(true);
                                                setOverview(e.target.value);
                                            }}/>
                                        </div>
                                    </div>
                                </>
                            )
                        ) : menuSection === Section.Details ? (
                            <>
                                <div className="dialog-input-box">
                                    <span>{t('genres')}</span>
                                    <div className={`dialog-input-lock ${genresLock ? ' locked' : ''}`}>
                                        <a href="#" onClick={() => setGenresLock(!genresLock)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                            </svg>
                                        </a>
                                        <TagsInput
                                            value={genres}
                                            onChange={setGenres}
                                            name="genresInput"
                                            placeHolder=""
                                        />
                                    </div>
                                </div>
                                <div className="dialog-input-box">
                                    <span>{t('studios')}</span>
                                    <div className={`dialog-input-lock ${studiosLock ? ' locked' : ''}`}>
                                        <a href="#" onClick={() => setStudiosLock(!studiosLock)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                            </svg>
                                        </a>
                                        <TagsInput
                                            value={studios}
                                            onChange={setStudios}
                                            name="studiosInput"
                                            placeHolder=""
                                        />
                                    </div>
                                </div>
                                <div className="dialog-input-box">
                                    <span>{t('createdBy')}</span>
                                    <div className={`dialog-input-lock ${creatorLock ? ' locked' : ''}`}>
                                        <a href="#" onClick={() => setCreatorLock(!creatorLock)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                            </svg>
                                        </a>
                                        <TagsInput
                                            value={creator}
                                            onChange={setCreator}
                                            name="creatorInput"
                                            placeHolder=""
                                        />
                                    </div>
                                </div>
                                <div className="dialog-input-box">
                                    <span>{t('musicBy')}</span>
                                    <div className={`dialog-input-lock ${musicLock ? ' locked' : ''}`}>
                                        <a href="#" onClick={() => setMusicLock(!musicLock)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                            </svg>
                                        </a>
                                        <TagsInput
                                            value={music}
                                            onChange={setMusic}
                                            name="musicInput"
                                            placeHolder=""
                                        />
                                    </div>
                                </div>
                            </>
                        ) : menuSection === Section.Logos ? (
                            <>
                                {
                                    pasteUrl ? (
                                        <div className="horizontal-center-align">
                                            <div className="dialog-input-box">
                                                <input type="text" placeholder={t('urlText')} onChange={(e) => {
                                                    setImageUrl(e.target.value)
                                                }}/>
                                            </div>
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(false)}>
                                                    {t('cancelButton')}
                                            </button>
                                            <button className="desktop-dialog-btn"
                                            onClick={handleDownload}>
                                                {t('loadButton')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="horizontal-center-align">
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(false)}>
                                                {t('selectImage')}
                                            </button>
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(true)}>
                                                {t('fromURLButton')}
                                            </button>
                                        </div>
                                    )
                                }
                                
                                <div className="dialog-images-scroll">
                                {logos.map((image, index) => (
                                    <div key={image} className={`dialog-image-btn ${image.split('\\').pop() === selectedLogo ? ' dialog-image-btn-active' : ''}`}
                                    onClick={() => selectLogo(image.split('\\').pop())}>
                                        <img src={`file://${image}`} alt={`img-${index}`} style={{ width: 290 }} />
                                        {
                                            image.split('\\').pop() === selectedLogo ? (
                                                <>
                                                    <div className="triangle-tick"></div>
                                                    <svg aria-hidden="true" height="24" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M4 24.7518L18.6461 39.4008L44 14.0497L38.9502 9L18.6461 29.3069L9.04416 19.7076L4 24.7518Z" fill="#EEEEEE" fillRule="evenodd"></path></svg>
                                                </>
                                            ) : (null)
                                        }
                                    </div>
                                ))}
                                </div>
                            </>
                        ) : menuSection === Section.Posters ? (
                            <>
                                {
                                    pasteUrl ? (
                                        <div className="horizontal-center-align">
                                            <div className="dialog-input-box">
                                                <input type="text" placeholder={t('urlText')} onChange={(e) => {
                                                    setImageUrl(e.target.value)
                                                }}/>
                                            </div>
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(false)}>
                                                    {t('cancelButton')}
                                            </button>
                                            <button className="desktop-dialog-btn"
                                            onClick={handleDownload}>
                                                {t('loadButton')}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="horizontal-center-align">
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(false)}>
                                                {t('selectImage')}
                                            </button>
                                            <button className="desktop-dialog-btn"
                                            onClick={() => setPasteUrl(true)}>
                                                {t('fromURLButton')}
                                            </button>
                                        </div>
                                    )
                                }
                                
                                <div className="dialog-images-scroll">
                                {posters.map((image, index) => (
                                    <div key={image} className={`dialog-image-btn ${image.split('\\').pop() === selectedPoster ? ' dialog-image-btn-active' : ''}`}
                                    onClick={() => selectPoster(image.split('\\').pop())}>
                                        <img src={`file://${image}`} alt={`img-${index}`} style={{ width: 185 }} />
                                        {
                                            image.split('\\').pop() === selectedPoster ? (
                                                <>
                                                    <div className="triangle-tick"></div>
                                                    <svg aria-hidden="true" height="24" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M4 24.7518L18.6461 39.4008L44 14.0497L38.9502 9L18.6461 29.3069L9.04416 19.7076L4 24.7518Z" fill="#EEEEEE" fillRule="evenodd"></path></svg>
                                                </>
                                            ) : (null)
                                        }
                                    </div>
                                ))}
                                </div>
                            </>
                        ) : null
                    }
                    </div>
                </section>
                <section className="dialog-bottom">
                    <button className="desktop-dialog-btn" onClick={() => dispatch(toggleSeriesWindow())}>{t('cancelButton')}</button>
                    <button className="btn-app-color" onClick={() => handleSavingChanges()}>{t('saveButton')}</button>
                </section>
                </div>
            </section>
        </>
    )
};

export default renderSeriesWindow;