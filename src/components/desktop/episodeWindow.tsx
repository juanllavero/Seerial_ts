import { Section } from "data/enums/Section";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import '../../App.scss';
import { useTranslation } from "react-i18next";
import { toggleEpisodeWindow, updateEpisode, updateMediaInfo } from "redux/slices/episodeSlice";
import { VideoTrackData } from "@interfaces/VideoTrackData";
import { AudioTrackData } from "@interfaces/AudioTrackData";
import { SubtitleTrackData } from "@interfaces/SubtitleTrackData";
import { EpisodeData } from "@interfaces/EpisodeData";

const renderEpisodeWindow = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const menuSection = useSelector((state: RootState) => state.sectionState.menuSection);
    const episodeMenuOpen = useSelector((state: RootState) => state.episodes.episodeWindowOpen);
    const selectedSeries = useSelector((state: RootState) => state.series.selectedSeries);
    const selectedEpisode = useSelector((state: RootState) => state.episodes.selectedEpisode);

    const [images, setImages] = useState<string[]>([]);
    const [selectedImage, selectImage] = useState<string | undefined>(undefined);

    const [nameLock, setNameLock] = useState<boolean>(false);
    const [yearLock, setYearLock] = useState<boolean>(false);
    const [orderLock, setOrderLock] = useState<boolean>(false);
    const [overviewLock, setOverviewLock] = useState<boolean>(false);
    const [directedLock, setDirectedLock] = useState<boolean>(false);
    const [writtenLock, setWrittenLock] = useState<boolean>(false);

    const [name, setName] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [order, setOrder] = useState<number>(0);
    const [overview, setOverview] = useState<string>("");
    const [directedBy, setDirectedBy] = useState<string>("");
    const [writtenBy, setWrittenBy] = useState<string>("");

    useEffect(() => {
        const getImages = async () => {
            const path = await window.electronAPI.getExternalPath("resources/img/discCovers/" + selectedEpisode?.id + "/");
            if (path) {
                const images = await window.electronAPI.getImages(path);
                setImages(images);
            }
        }

        if (menuSection === Section.Thumbnails){
            getImages();

            if (selectedEpisode?.imgSrc)
                selectImage(selectedEpisode?.imgSrc.split('/').pop())
        }
    }, [menuSection]);

    useEffect(() => {
        if (episodeMenuOpen && selectedEpisode) {
            dispatch(changeMenuSection(Section.General));

            // @ts-ignore
            window.electronAPI.getMediaInfo(selectedEpisode).then((data) => {
                if (data){
                    dispatch(updateMediaInfo(data));
                }
            });

            setName(selectedEpisode.name);
            setYear(selectedEpisode.year);
            setOrder(selectedEpisode.order);
            setOverview(selectedEpisode.overview);
            setDirectedBy(selectedEpisode.directedBy);
            setWrittenBy(selectedEpisode.writtenBy);

            setNameLock(selectedEpisode.nameLock);
            setYearLock(selectedEpisode.yearLock);
            setOrderLock(selectedEpisode.orderLock);
            setOverviewLock(selectedEpisode.overviewLock);
            setDirectedLock(selectedEpisode.directedLock);
            setWrittenLock(selectedEpisode.writtenLock);
        }
    }, [episodeMenuOpen]);

    const getVideoInfo = (track: VideoTrackData) => {
        const mediaInfoFieldsVideo = [
            { key: 'Codec', value: track.codec },
            { key: 'Codec Extended', value: track.codecExt },
            { key: 'Bitrate', value: track.bitrate },
            { key: 'Frame Rate', value: track.framerate },
            { key: 'Coded Height', value: track.codedHeight },
            { key: 'Coded Width', value: track.codedWidth },
            { key: 'Chroma Location', value: track.chromaLocation },
            { key: 'Color Space', value: track.colorSpace },
            { key: 'Aspect Ratio', value: track.aspectRatio },
            { key: 'Profile', value: track.profile },
            { key: 'Ref Frames', value: track.refFrames },
            { key: 'Color Range', value: track.colorRange },
            { key: 'Display Title', value: track.displayTitle }
        ];

        return (
            <>
                {mediaInfoFieldsVideo.map(
                    (field, index) =>
                        field.value && (
                            <div key={index}>
                                <span id="media-info-key">{field.key}</span>
                                <span id="media-info-value">{field.value}</span>
                            </div>
                        )
                )}
            </>
        );
    };

    const getAudioInfo = (track: AudioTrackData) => {
        const mediaInfoFieldsAudio = [
            { key: "Codec", value: track.codec },
            { key: "Codec Extended", value: track.codecExt },
            { key: "Channels", value: track.channels },
            { key: "Channel Layout", value: track.channelLayout },
            { key: "Bitrate", value: track.bitrate },
            { key: "Language", value: track.language },
            { key: "Language tag", value: track.languageTag },
            { key: "Bit Depth", value: track.bitDepth },
            { key: "Profile", value: track.profile },
            { key: "Sampling Rate", value: track.samplingRate },
            { key: "Display Title", value: track.displayTitle }
        ];

        return (
            <>
                {mediaInfoFieldsAudio.map(
                    (field, index) =>
                        field.value && (
                            <div key={index}>
                                <span id="media-info-key">{field.key}</span>
                                <span id="media-info-value">{field.value}</span>
                            </div>
                        )
                )}
            </>
        );
    };

    const getSubtitleInfo = (track: SubtitleTrackData) => {
        const mediaInfoFieldsSubs = [
            { key: "Codec", value: track.codec },
            { key: "Codec Extended", value: track.codecExt },
            { key: "Language", value: track.language },
            { key: "Language tag", value: track.languageTag },
            { key: "Title", value: track.title },
            { key: "Display Title", value: track.displayTitle }
        ];

        return (
            <>
                {mediaInfoFieldsSubs.map(
                    (field, index) =>
                        field.value && (
                            <div key={index}>
                                <span id="media-info-key">{field.key}</span>
                                <span id="media-info-value">{field.value}</span>
                            </div>
                        )
                )}
            </>
        );
    };

    const handleSavingChanges = () => {
        if (selectedEpisode) {
            let newData: EpisodeData = {
                id: "",
                name: name,
                overview: overview,
                year: year,
                order: order,
                score: 0,
                imdbScore: 0,
                runtime: 0,
                runtimeInSeconds: 0,
                episodeNumber: 0,
                seasonNumber: 0,
                videoSrc: "",
                imgSrc: selectedImage ? ("resources/img/discCovers/" + selectedEpisode?.id + "/" + selectedImage) : "",
                seasonID: "",
                watched: false,
                timeWatched: 0,
                chapters: [],
                videoTracks: [],
                audioTracks: [],
                subtitleTracks: [],
                directedBy: directedBy,
                writtenBy: writtenBy,
                nameLock: nameLock,
                yearLock: yearLock,
                orderLock: orderLock,
                overviewLock: overviewLock,
                directedLock: directedLock,
                writtenLock: writtenLock
            };

            dispatch(updateEpisode(newData));
        }

        dispatch(toggleEpisodeWindow());
    };

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
                                <div className={`dialog-input-lock ${nameLock ? ' locked' : ''}`}>
                                    <a href="#" onClick={() => setNameLock(!nameLock)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                            <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                        </svg>
                                    </a>
                                    <input type="text" defaultValue={name} onChange={() => {
                                        setNameLock(true);
                                        setName(name);
                                    }}/>
                                </div>
                            </div>
                            <section className="dialog-horizontal-box">
                                <div className="dialog-input-box">
                                    <span>{t('year')}</span>
                                    <div className={`dialog-input-lock ${yearLock ? ' locked' : ''}`}>
                                        <a href="#" onClick={() => setYearLock(!yearLock)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                            </svg>
                                        </a>
                                        <input type="text" defaultValue={year} onChange={() => {
                                            setYearLock(true);
                                            setYear(year);
                                        }}/>
                                    </div>
                                </div>
                                <div className="dialog-input-box">
                                    <span>{t('order')}</span>
                                    <div className={`dialog-input-lock ${orderLock ? ' locked' : ''}`}>
                                        <a href="#" onClick={() => setOrderLock(!orderLock)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                            </svg>
                                        </a>
                                        <input type="number" defaultValue={order} onChange={() => {
                                            setOrderLock(true);
                                            setOrder(order);
                                        }}/>
                                    </div>
                                </div>
                            </section>
                            <div className="dialog-input-box">
                                <span>{t('overview')}</span>
                                <div className={`dialog-input-lock ${overviewLock ? ' locked' : ''}`}>
                                    <a href="#" onClick={() => setOverviewLock(!overviewLock)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                            <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                        </svg>
                                    </a>
                                    <textarea rows={5} defaultValue={overview} onChange={() => {
                                        setOverviewLock(true);
                                        setOverview(overview);
                                    }}/>
                                </div>
                            </div>
                            {
                                selectedEpisode && selectedEpisode.directedBy !== "" ? (
                                    <div className="dialog-input-box">
                                        <span>{t('directedBy')}</span>
                                        <div className={`dialog-input-lock ${directedLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setDirectedLock(!directedLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" defaultValue={directedBy} onChange={() => {
                                                setDirectedLock(true);
                                                setDirectedBy(directedBy);
                                            }}/>
                                        </div>
                                    </div>
                                ) : (<></>)
                            }
                            {
                                selectedEpisode && selectedEpisode.writtenBy !== "" ? (
                                    <div className="dialog-input-box">
                                        <span>{t('writtenBy')}</span>
                                        <div className={`dialog-input-lock ${writtenLock ? ' locked' : ''}`}>
                                            <a href="#" onClick={() => setWrittenLock(!writtenLock)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="22" height="22" viewBox="0 0 24 24">
                                                    <path d="M 12 1 C 8.6761905 1 6 3.6761905 6 7 L 6 8 C 4.9 8 4 8.9 4 10 L 4 20 C 4 21.1 4.9 22 6 22 L 18 22 C 19.1 22 20 21.1 20 20 L 20 10 C 20 8.9 19.1 8 18 8 L 18 7 C 18 3.6761905 15.32381 1 12 1 z M 12 3 C 14.27619 3 16 4.7238095 16 7 L 16 8 L 8 8 L 8 7 C 8 4.7238095 9.7238095 3 12 3 z M 12 13 C 13.1 13 14 13.9 14 15 C 14 16.1 13.1 17 12 17 C 10.9 17 10 16.1 10 15 C 10 13.9 10.9 13 12 13 z"></path>
                                                </svg>
                                            </a>
                                            <input type="text" defaultValue={writtenBy} onChange={() => {
                                                setWrittenLock(true);
                                                setWrittenBy(writtenBy);
                                            }}/>
                                        </div>
                                    </div>
                                ) : (<></>)
                            }
                        </>
                        ) : menuSection == Section.Thumbnails ? (
                        <>
                            <div className="dialog-horizontal-box horizontal-center-align">
                                <button className="desktop-dialog-btn">Subir imagen</button>
                                <button className="desktop-dialog-btn">Pegar enlace</button>
                            </div>
                            <div className="dialog-images-scroll">
                            {images.map((image, index) => (
                                <div key={image + index} className={`dialog-image-btn ${image.split('\\').pop() === selectedImage ? ' dialog-image-btn-active' : ''}`}
                                onClick={() => selectImage(image.split('\\').pop())}>
                                    <img src={`file://${image}`} alt={`img-${index}`} style={{ width: 290 }} />
                                    {
                                        image.split('\\').pop() === selectedImage ? (
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
                                        {selectedEpisode?.videoTracks.map((track: VideoTrackData, index: number) => (
                                            <>
                                                <span id="media-info-title">Video</span>
                                                {getVideoInfo(track)}
                                                <div className="separator"></div>
                                            </>
                                        ))}
                                        {selectedEpisode?.audioTracks.map((audioTrack: AudioTrackData, index: number) => (
                                            <>
                                                <span id="media-info-title">Audio</span>
                                                {getAudioInfo(audioTrack)}
                                                <div className="separator"></div>
                                            </>
                                        ))}
                                        {selectedEpisode?.subtitleTracks.map((track: SubtitleTrackData, index:number) => (
                                            <>
                                                <span id="media-info-title">Subtitle</span>
                                                {getSubtitleInfo(track)}
                                                <div className="separator"></div>
                                            </>
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
                    <button className="btn-app-color" onClick={() => handleSavingChanges()}>{t('saveButton')}</button>
                </section>
                </div>
            </section>
        </>
    )
};

export default renderEpisodeWindow;