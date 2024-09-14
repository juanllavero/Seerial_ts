import { useDispatch, useSelector } from 'react-redux';
import { selectLibrary, setLibraryForMenu, toggleLibraryEditWindow, resetSelection } from '../../redux/slices/dataSlice';
import { removeTransparentImage } from '../../redux/slices/transparentImageLoadedSlice';
import { RootState } from '../../redux/store';
import { closeAllMenus, toggleLibraryMenu } from 'redux/slices/contextMenuSlice';
import { useCallback, useEffect, useRef } from 'react';
import { ContextMenu } from 'primereact/contextmenu';
import { useTranslation } from 'react-i18next';

export const renderLibrariesList = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const libraries = useSelector((state: RootState) => state.data.libraries);
    const selectedLibrary = useSelector((state: RootState) => state.data.selectedLibrary);

    const libraryMenuOpen = useSelector((state: RootState) => state.contextMenu.libraryMenu);
    const libraryForMenu = useSelector((state: RootState) => state.data.libraryForMenu);

    const cm = useRef<ContextMenu | null>(null);

    useEffect(() => {
        if (libraries !== null && libraries.length > 0 && !selectedLibrary) {
            handleSelectLibrary(libraries[0]);
        }
    }, [libraries, selectedLibrary]);

    //#region CONTEXT MENU ITEMS
    const menuItems = [
        {
            label: t('editButton'),
            command: () => {
                dispatch(toggleLibraryEditWindow());
            }
        },
        {
            label: t('searchFiles'),
            command: () => {
                dispatch(toggleLibraryMenu());
            }
        },
        {
            label: t('updateMetadata'),
            command: () => {
                dispatch(toggleLibraryMenu());
            }
        },
        {
            label: t('removeButton'),
            command: () => {
                dispatch(toggleLibraryMenu());
            }
        }
    ];
    //#endregion

    const handleSelectLibrary = useCallback((library: any) => {
        dispatch(selectLibrary(library));
        dispatch(resetSelection());
        dispatch(removeTransparentImage());
    }, [dispatch]);

    return (
        <div className="libraries-list scroll">
            {libraries.map((library) => (
                <button 
                    key={library.id} 
                    className={`libraries-button ${library === selectedLibrary ? 'selected' : ''}`} 
                    title={library.name}
                >
                    {library.type === "Shows" ? (
                        <svg onClick={() => handleSelectLibrary(library)}
                            id="libraries-button-svg" 
                            aria-hidden="true" 
                            height="28" 
                            viewBox="0 0 48 48" 
                            width="28" 
                            xmlns="http://www.w3.org/2000/svg">
                            <path 
                                clipRule="evenodd" 
                                d="M6 5H42C42.7957 5 43.5587 5.31607 44.1213 5.87868C44.6839 6.44129 45 7.20435 45 8V34C45 34.7957 44.6839 35.5587 44.1213 36.1213C43.5587 36.6839 42.7957 37 42 37H6C5.20435 37 4.44129 36.6839 3.87868 36.1213C3.31607 35.5587 3 34.7957 3 34V8C3 7.20435 3.31607 6.44129 3.87868 5.87868C4.44129 5.31607 5.20435 5 6 5ZM6 34H42V8H6V34Z" 
                                fill="#FFFFFF"
                                fillRule="evenodd">
                            </path>
                            <path d="M36 43V40H12V43H36Z" fill="#FFFFFF"></path>
                        </svg>
                    ) : (
                        <svg onClick={() => handleSelectLibrary(library)}
                            id="libraries-button-svg" 
                            aria-hidden="true" 
                            fill="currentColor" 
                            height="28" 
                            viewBox="0 0 48 48" 
                            width="28" 
                            xmlns="http://www.w3.org/2000/svg">
                            <path 
                                clipRule="evenodd" 
                                d="M6 3H42C42.7957 3 43.5587 3.31607 44.1213 3.87868C44.6839 4.44129 45 5.20435 45 6V42C45 42.7957 44.6839 43.5587 44.1213 44.1213C43.5587 44.6839 42.7957 45 42 45H6C5.20435 45 4.44129 44.6839 3.87868 44.1213C3.31607 43.5587 3 42.7957 3 42V6C3 5.20435 3.31607 4.44129 3.87868 3.87868C4.44129 3.31607 5.20435 3 6 3ZM6 42H9L9 38H6V42ZM36 42H12V25H36V42ZM39 42H42V38H39V42ZM39 35H42V30H39V35ZM39 27H42V22H39V27ZM39 19H42V14H39V19ZM39 11H42V6H39V11ZM36 6L12 6L12 22H36V6ZM6 6L9 6V11H6L6 6ZM6 14H9V19H6L6 14ZM6 22H9V27H6L6 22ZM6 30H9V35H6L6 30Z" 
                                fill="#FFFFFF"
                                fillRule="evenodd">
                            </path>
                        </svg>
                    )}
                    <span className="library-name" onClick={() => handleSelectLibrary(library)}>
                        {library.name}
                    </span>
                    
                    <div>
                        <a id={library.id + "btn"} className={`svg-button-desktop-transparent select ${libraryMenuOpen && library == libraryForMenu ? ' active-btn' : ' inactive-btn'}`}  onClick={(e) => {
                            dispatch(closeAllMenus());

                            if (!libraryMenuOpen || library != libraryForMenu){
                                dispatch(toggleLibraryMenu());
                                dispatch(setLibraryForMenu(library));
                                cm.current?.show(e);
                            }
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 560" aria-hidden="true" width="16" height="16"><path d="M350 280c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70m0-210c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70m0 420c0 38.634-31.366 70-70 70s-70-31.366-70-70 31.366-70 70-70 70 31.366 70 70" fill="#FFFFFF"></path></svg>
                        </a>
                    </div>
                </button>
            ))}
            <ContextMenu model={menuItems} ref={cm} className={`dropdown-menu ${libraryMenuOpen ? ' dropdown-menu-open' : ''}`}/>
        </div>
    )
};