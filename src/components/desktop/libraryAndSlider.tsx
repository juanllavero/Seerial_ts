import { useDispatch, useSelector } from 'react-redux';
import { resetSelection } from '../../redux/slices/seriesSlice';
import { increaseEpisodeImageSize, reduceEpisodeImageSize } from '../../redux/slices/episodeImageSlice';
import { increaseSeriesImageSize, reduceSeriesImageSize } from '../../redux/slices/seriesImageSlice';
import { removeTransparentImage } from '../../redux/slices/transparentImageLoadedSlice';
import { selectLibrary, setLibraryForMenu, toggleLibraryEditWindow } from '../../redux/slices/librarySlice';
import { RootState } from '../../redux/store';
import { ContextMenu } from 'primereact/contextmenu';
import { useRef } from 'react';
import { closeAllMenus, toggleLibraryMenuSecondary } from 'redux/slices/contextMenuSlice';
import { useTranslation } from 'react-i18next';

export const renderLibraryAndSlider = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const selectedLibrary = useSelector((state: RootState) => state.library.selectedLibrary);
    const selectedSeries = useSelector((state: RootState) => state.series.selectedSeries);
    const librarySecondaryMenuOpen = useSelector((state: RootState) => state.contextMenu.libraryMenuSecondary);

    //Reducers for images size
    const seriesImageWidth = useSelector((state: RootState) => state.seriesImage.width);
    const episodeImageWidth = useSelector((state: RootState) => state.episodeImage.width);

    const cmLibrary = useRef<ContextMenu | null>(null);

    const handleSeriesSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(event.target.value, 10);
        if (newSize > seriesImageWidth) {
            dispatch(increaseSeriesImageSize());
        } else {
            dispatch(reduceSeriesImageSize());
        }
    };

    const handleEpisodeSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(event.target.value, 10);
        if (newSize > episodeImageWidth) {
            dispatch(increaseEpisodeImageSize());
        } else {
            dispatch(reduceEpisodeImageSize());
        }
    };

    const handleSelectLibrary = (library: any) => {
        dispatch(selectLibrary(library));
        dispatch(resetSelection());
        dispatch(removeTransparentImage());
    };

    if (selectedLibrary != null && selectedSeries == null){
        return (
            <div className="library-slicer-bar">
                <button className="library-button" onClick={() => handleSelectLibrary(selectedLibrary)}>
                    <span>{selectedLibrary.name}</span>
                </button>
                <button className="svg-button-desktop-transparent"
                onClick={(e) => {
                    dispatch(closeAllMenus());

                    if (!librarySecondaryMenuOpen){
                        dispatch(setLibraryForMenu(selectedLibrary));
                        dispatch(toggleLibraryMenuSecondary());
                        cmLibrary.current?.show(e);
                    }
                }}>
                    <svg aria-hidden="true" fill="currentColor" height="24" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M24 15C25.6569 15 27 13.6569 27 12C27 10.3431 25.6569 9 24 9C22.3431 9 21 10.3431 21 12C21 13.6569 22.3431 15 24 15Z" fill="#FFFFFF"></path><path d="M24 27C25.6569 27 27 25.6569 27 24C27 22.3431 25.6569 21 24 21C22.3431 21 21 22.3431 21 24C21 25.6569 22.3431 27 24 27Z" fill="#FFFFFF"></path><path d="M27 36C27 37.6569 25.6569 39 24 39C22.3431 39 21 37.6569 21 36C21 34.3431 22.3431 33 24 33C25.6569 33 27 34.3431 27 36Z" fill="#FFFFFF"></path></svg>
                </button>
                <div>
                    <input
                    type="range"
                    min="130"
                    max="300"
                    step="10"
                    value={seriesImageWidth}
                    onChange={handleSeriesSliderChange}
                    className="desktopSlider"
                    id="imageSizeSlider"
                    />
                </div>
                <svg aria-hidden="true" fill="currentColor" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M15 12C15 13.6569 13.6569 15 12 15H6C4.34315 15 3 13.6569 3 12V6C3 4.34315 4.34315 3 6 3H12C13.6569 3 15 4.34315 15 6V12Z" fill="#FFFFFF" opacity="0.8"></path><path d="M21 15H27C28.6569 15 30 13.6569 30 12V6C30 4.34315 28.6569 3 27 3H21C19.3431 3 18 4.34315 18 6V12C18 13.6569 19.3431 15 21 15Z" fill="#FFFFFF" opacity="0.8"></path><path d="M42 15H36C34.3431 15 33 13.6569 33 12V6C33 4.34315 34.3431 3 36 3H42C43.6569 3 45 4.34315 45 6V12C45 13.6569 43.6569 15 42 15Z" fill="#FFFFFF" opacity="0.8"></path><path d="M15 27C15 28.6569 13.6569 30 12 30H6C4.34315 30 3 28.6569 3 27V21C3 19.3431 4.34315 18 6 18H12C13.6569 18 15 19.3431 15 21V27Z" fill="#FFFFFF" opacity="0.8"></path><path d="M27 30C28.6569 30 30 28.6569 30 27V21C30 19.3431 28.6569 18 27 18H21C19.3431 18 18 19.3431 18 21V27C18 28.6569 19.3431 30 21 30H27Z" fill="#FFFFFF" opacity="0.8"></path><path d="M45 27C45 28.6569 43.6569 30 42 30H36C34.3431 30 33 28.6569 33 27V21C33 19.3431 34.3431 18 36 18H42C43.6569 18 45 19.3431 45 21V27Z" fill="#FFFFFF" opacity="0.8"></path><path d="M12 45C13.6569 45 15 43.6569 15 42V36C15 34.3431 13.6569 33 12 33H6C4.34315 33 3 34.3431 3 36V42C3 43.6569 4.34315 45 6 45H12Z" fill="#FFFFFF" opacity="0.8"></path><path d="M30 42C30 43.6569 28.6569 45 27 45H21C19.3431 45 18 43.6569 18 42V36C18 34.3431 19.3431 33 21 33H27C28.6569 33 30 34.3431 30 36V42Z" fill="#FFFFFF" opacity="0.8"></path><path d="M42 45C43.6569 45 45 43.6569 45 42V36C45 34.3431 43.6569 33 42 33H36C34.3431 33 33 34.3431 33 36V42C33 43.6569 34.3431 45 36 45H42Z" fill="#FFFFFF" opacity="0.8"></path></svg>
                <ContextMenu model={
                    [
                        {
                            label: t('editButton'),
                            command: () => {
                                dispatch(toggleLibraryMenuSecondary());
                                dispatch(toggleLibraryEditWindow());
                            }
                        },
                        {
                            label: t('searchFiles'),
                            command: () => {
                                dispatch(toggleLibraryMenuSecondary());
                            }
                        },
                        {
                            label: t('updateMetadata'),
                            command: () => {
                                dispatch(toggleLibraryMenuSecondary());
                            }
                        },
                        {
                            label: t('removeButton'),
                            command: () => {
                                dispatch(toggleLibraryMenuSecondary());
                            }
                        }
                    ]
                } ref={cmLibrary} className="dropdown-menu"/>
            </div>
        )
    }else if (selectedLibrary != null && selectedSeries != null){
        return (
            <div className="library-slicer-bar">
                <button className="library-button" onClick={() => handleSelectLibrary(selectedLibrary)}>
                    {selectedLibrary.name}
                </button>
                <button className="svg-button-desktop-transparent"
                onClick={(e) => {
                    dispatch(closeAllMenus());

                    if (!librarySecondaryMenuOpen){
                        dispatch(setLibraryForMenu(selectedLibrary));
                        dispatch(toggleLibraryMenuSecondary());
                        cmLibrary.current?.show(e);
                    }
                }}>
                  <svg aria-hidden="true" fill="currentColor" height="24" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M24 15C25.6569 15 27 13.6569 27 12C27 10.3431 25.6569 9 24 9C22.3431 9 21 10.3431 21 12C21 13.6569 22.3431 15 24 15Z" fill="#FFFFFF"></path><path d="M24 27C25.6569 27 27 25.6569 27 24C27 22.3431 25.6569 21 24 21C22.3431 21 21 22.3431 21 24C21 25.6569 22.3431 27 24 27Z" fill="#FFFFFF"></path><path d="M27 36C27 37.6569 25.6569 39 24 39C22.3431 39 21 37.6569 21 36C21 34.3431 22.3431 33 24 33C25.6569 33 27 34.3431 27 36Z" fill="#FFFFFF"></path></svg>
                </button>
                <div>
                  <input
                  type="range"
                  min="290"
                  max="460"
                  step="10"
                  value={episodeImageWidth}
                  onChange={handleEpisodeSliderChange}
                  className="desktopSlider"
                  id="imageSizeSlider"
                  />
                </div>
                <svg aria-hidden="true" fill="currentColor" height="32" viewBox="0 0 48 48" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M15 12C15 13.6569 13.6569 15 12 15H6C4.34315 15 3 13.6569 3 12V6C3 4.34315 4.34315 3 6 3H12C13.6569 3 15 4.34315 15 6V12Z" fill="#FFFFFF" opacity="0.8"></path><path d="M21 15H27C28.6569 15 30 13.6569 30 12V6C30 4.34315 28.6569 3 27 3H21C19.3431 3 18 4.34315 18 6V12C18 13.6569 19.3431 15 21 15Z" fill="#FFFFFF" opacity="0.8"></path><path d="M42 15H36C34.3431 15 33 13.6569 33 12V6C33 4.34315 34.3431 3 36 3H42C43.6569 3 45 4.34315 45 6V12C45 13.6569 43.6569 15 42 15Z" fill="#FFFFFF" opacity="0.8"></path><path d="M15 27C15 28.6569 13.6569 30 12 30H6C4.34315 30 3 28.6569 3 27V21C3 19.3431 4.34315 18 6 18H12C13.6569 18 15 19.3431 15 21V27Z" fill="#FFFFFF" opacity="0.8"></path><path d="M27 30C28.6569 30 30 28.6569 30 27V21C30 19.3431 28.6569 18 27 18H21C19.3431 18 18 19.3431 18 21V27C18 28.6569 19.3431 30 21 30H27Z" fill="#FFFFFF" opacity="0.8"></path><path d="M45 27C45 28.6569 43.6569 30 42 30H36C34.3431 30 33 28.6569 33 27V21C33 19.3431 34.3431 18 36 18H42C43.6569 18 45 19.3431 45 21V27Z" fill="#FFFFFF" opacity="0.8"></path><path d="M12 45C13.6569 45 15 43.6569 15 42V36C15 34.3431 13.6569 33 12 33H6C4.34315 33 3 34.3431 3 36V42C3 43.6569 4.34315 45 6 45H12Z" fill="#FFFFFF" opacity="0.8"></path><path d="M30 42C30 43.6569 28.6569 45 27 45H21C19.3431 45 18 43.6569 18 42V36C18 34.3431 19.3431 33 21 33H27C28.6569 33 30 34.3431 30 36V42Z" fill="#FFFFFF" opacity="0.8"></path><path d="M42 45C43.6569 45 45 43.6569 45 42V36C45 34.3431 43.6569 33 42 33H36C34.3431 33 33 34.3431 33 36V42C33 43.6569 34.3431 45 36 45H42Z" fill="#FFFFFF" opacity="0.8"></path></svg>
                <ContextMenu model={
                    [
                        {
                            label: 'Editar',
                            command: () => {
                                dispatch(toggleLibraryMenuSecondary());
                                dispatch(toggleLibraryEditWindow());
                            }
                        },
                        {
                            label: 'Buscar archivos en la biblioteca',
                            command: () => {
                                dispatch(toggleLibraryMenuSecondary());
                            }
                        },
                        {
                            label: 'Actualizar metadatos',
                            command: () => {
                                dispatch(toggleLibraryMenuSecondary());
                            }
                        },
                        {
                            label: 'Eliminar',
                            command: () => {
                                dispatch(toggleLibraryMenuSecondary());
                            }
                        }
                    ]
                } ref={cmLibrary} className={`dropdown-menu ${librarySecondaryMenuOpen ? ' dropdown-menu-open' : ''}`}/>
            </div>
        )
    }
};