import { Section } from "data/enums/Section";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import '../../App.scss';
import { toggleLibraryEditWindow } from "redux/slices/librarySlice";
import { useTranslation } from "react-i18next";
import { toggleEpisodeWindow } from "redux/slices/episodeSlice";

const renderEpisodeWindow = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const menuSection = useSelector((state: RootState) => state.sectionState.menuSection);
    const episodeMenuOpen = useSelector((state: RootState) => state.episodes.episodeWindowOpen);
    const selectedLibrary = useSelector((state: RootState) => state.library.libraryForMenu);
    const selectedSeries = useSelector((state: RootState) => state.series.selectedSeries);
    const selectedEpisode = useSelector((state: RootState) => state.episodes.selectedEpisode);

    const [images, setImages] = useState<string[]>([]);

    useEffect(() => {
        const getImages = async () => {
            const path = await window.electronAPI.getExternalPath("resources/img/discCovers/" + selectedEpisode?.id + "/");
            if (path) {
                const images = await window.electronAPI.getImages(path);
                setImages(images);
            }
        }

        if (menuSection === Section.Thumbnails)
            getImages();

    }, [menuSection]);

    return (
        <>
            <section className={`dialog ${episodeMenuOpen ? ' dialog-active' : ''}`}>
                <div className="dialog-background" onClick={() => dispatch(toggleEpisodeWindow())}></div>
                <div className="dialog-box">
                <section className="dialog-top">
                    <span>{t('editButton') + ": " + selectedSeries?.name + " - " + selectedEpisode?.name}</span>
                    <button className="close-window-btn" onClick={() => dispatch(toggleEpisodeWindow())}>
                    <img src="./src/assets/svg/windowClose.svg" 
                    style={{width: '24px', height: '24px', filter: 'drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))'}} />
                    </button>
                </section>
                <section className="dialog-center">
                    <div className="dialog-center-left">
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.General ? ' desktop-dialog-side-btn-active' : ''}`}
                    onClick={() => dispatch(changeMenuSection(Section.General))}>{t('generalButton')}</button>
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.Thumbnails ? ' desktop-dialog-side-btn-active' : ''}`}
                    onClick={() => dispatch(changeMenuSection(Section.Thumbnails))}>{t('thumbnailsButton')}</button>
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.Details ? ' desktop-dialog-side-btn-active' : ''}`}
                    onClick={() => dispatch(changeMenuSection(Section.Details))}>{t('details')}</button>
                    </div>
                    <div className="dialog-center-right scroll">
                    {
                        menuSection == Section.General ? (
                        <>
                            <div className="dialog-input-box">
                                <span>{t('name')}</span>
                                <div className="dialog-input-lock locked">
                                    <a href="#">
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                            <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                        </svg>
                                    </a>
                                    <input type="text" value={selectedEpisode?.name}/>
                                </div>
                            </div>
                            <section className="dialog-horizontal-box">
                                <div className="dialog-input-box">
                                    <span>{t('year')}</span>
                                    <div className="dialog-input-lock">
                                        <a href="#">
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                            </svg>
                                        </a>
                                        <input type="text" value={selectedEpisode?.year}/>
                                    </div>
                                </div>
                                <div className="dialog-input-box">
                                    <span>{t('order')}</span>
                                    <div className="dialog-input-lock">
                                        <a href="#">
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                            </svg>
                                        </a>
                                        <input type="text" value={selectedEpisode?.order}/>
                                    </div>
                                </div>
                            </section>
                            <div className="dialog-input-box">
                                <span>{t('overview')}</span>
                                <div className="dialog-input-lock">
                                    <a href="#">
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                            <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                        </svg>
                                    </a>
                                    <textarea rows={5} value={selectedEpisode?.overview}/>
                                </div>
                            </div>
                            {
                                selectedEpisode && selectedEpisode.directedBy !== "" ? (
                                    <div className="dialog-input-box">
                                        <span>{t('directedBy')}</span>
                                        <div className="dialog-input-lock">
                                            <a href="#">
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" value={selectedEpisode?.directedBy}/>
                                        </div>
                                    </div>
                                ) : (<></>)
                            }
                            {
                                selectedEpisode && selectedEpisode.writtenBy !== "" ? (
                                    <div className="dialog-input-box">
                                        <span>{t('writtenBy')}</span>
                                        <div className="dialog-input-lock">
                                            <a href="#">
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" value={selectedEpisode?.writtenBy}/>
                                        </div>
                                    </div>
                                ) : (<></>)
                            }
                        </>
                        ) : menuSection == Section.Thumbnails ? (
                        <>
                            <div className="dialog-horizontal-box">
                                <button className="desktop-dialog-btn">Subir imagen</button>
                                <button className="desktop-dialog-btn">Pegar enlace</button>
                            </div>
                            <div className="dialog-images-scroll">
                            {images.map((image, index) => (
                                <div key={image + index} style={{ margin: 10 }}>
                                    <img src={`file://${image}`} alt={`img-${index}`} style={{ width: 290 }} />
                                </div>
                            ))}
                            </div>
                        </>
                        ) : menuSection == Section.Details ? (
                            <>
                                <div className="dialog-horizontal-box">
                                    <section className="left-media-info">
                                        <span id="media-info-title">Media info</span>
                                        <div>
                                            <span id="media-info-key">
                                                Duration
                                            </span>
                                            <span id="media-info-value">
                                                {selectedEpisode?.mediaInfo?.duration}
                                            </span>
                                        </div>
                                        <div>
                                            <span id="media-info-key">
                                                File
                                            </span>
                                            <span id="media-info-value">
                                                {selectedEpisode?.mediaInfo?.file}
                                            </span>
                                        </div>
                                        <div>
                                            <span id="media-info-key">
                                                Location
                                            </span>
                                            <span id="media-info-value">
                                                {selectedEpisode?.mediaInfo?.location}
                                            </span>
                                        </div>
                                        <div>
                                            <span id="media-info-key">
                                                Bitrate
                                            </span>
                                            <span id="media-info-value">
                                                {selectedEpisode?.mediaInfo?.bitrate}
                                            </span>
                                        </div>
                                        <div>
                                            <span id="media-info-key">
                                                Size
                                            </span>
                                            <span id="media-info-value">
                                                {selectedEpisode?.mediaInfo?.size}
                                            </span>
                                        </div>
                                        <div>
                                            <span id="media-info-key">
                                                Container
                                            </span>
                                            <span id="media-info-value">
                                                {selectedEpisode?.mediaInfo?.container}
                                            </span>
                                        </div>
                                    </section>
                                    <section className="right-media-info">
                                        {selectedEpisode?.videoTracks.map((track, index) => (
                                            <>
                                                <span id="media-info-title">Video</span>
                                                <div>
                                                    <span id="media-info-key">
                                                        Codec
                                                    </span>
                                                    <span id="media-info-value">
                                                        {track.codec}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span id="media-info-key">
                                                        Codec Extended
                                                    </span>
                                                    <span id="media-info-value">
                                                        {track.codecExt}
                                                    </span>
                                                </div>
                                            </>
                                        ))}
                                        {selectedEpisode?.audioTracks.map((track, index) => (
                                            <span id="media-info-title">Audio</span>
                                        ))}
                                        {selectedEpisode?.subtitleTracks.map((track, index) => (
                                            <span id="media-info-title">Subtitle</span>
                                        ))}
                                    </section>
                                </div>
                            </>
                        ) : (<></>)
                    }
                    </div>
                </section>
                <section className="dialog-bottom">
                    <button className="desktop-dialog-btn" onClick={() => dispatch(toggleEpisodeWindow())}>{t('cancelButton')}</button>
                    <button className="btn-app-color">{t('saveButton')}</button>
                </section>
                </div>
            </section>
        </>
    )
};

export default renderEpisodeWindow;