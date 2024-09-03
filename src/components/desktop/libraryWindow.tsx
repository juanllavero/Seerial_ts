import { Section } from "data/enums/Section";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import '../../App.scss';
import { toggleLibraryEditWindow } from "redux/slices/librarySlice";

const renderLibraryWindow = () => {
    const dispatch = useDispatch();
    const [folders, setFolders] = useState<string[]>([]);

    const [selectedLibraryType, setSelectedLibraryType] = useState<string>("Movies");

    const menuSection = useSelector((state: RootState) => state.sectionState.menuSection);
    const libraryMenuOpen = useSelector((state: RootState) => state.library.libraryEditWindow);
    const selectedLibrary = useSelector((state: RootState) => state.library.libraryForMenu);

    const handleSelectFolder = async () => {
        const result = await window.electronAPI.openFolderDialog();
        if (result.length > 0) {
            const newFolders = result.filter((folder) => !folders.includes(folder));
            if (newFolders.length > 0) {
              setFolders((prevFolders) => [...prevFolders, ...newFolders]);
            }
        }
    };
    
    const handleRemoveFolder = (folderToRemove: string) => {
        setFolders((prevFolders) => prevFolders.filter((folder) => folder !== folderToRemove));
    };

    return (
        <>
            <section className={`dialog ${libraryMenuOpen ? ' dialog-active' : ''}`}>
                <div className="dialog-background" onClick={() => dispatch(toggleLibraryEditWindow())}></div>
                <div className="dialog-box">
                <section className="dialog-top">
                    {
                        selectedLibrary ? (
                            <span>Editar biblioteca</span>
                        ) : (
                            <span>Añadir biblioteca</span>
                        )
                    }
                    <button className="close-window-btn" onClick={() => dispatch(toggleLibraryEditWindow())}>
                    <img src="./src/assets/svg/windowClose.svg" 
                    style={{width: '24px', height: '24px', filter: 'drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))'}} />
                    </button>
                </section>
                <section className="dialog-center">
                    <div className="dialog-center-left">
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.General ? ' desktop-dialog-side-btn-active' : ''}`}
                    onClick={() => dispatch(changeMenuSection(Section.General))}>General</button>
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.Folders ? ' desktop-dialog-side-btn-active' : ''}`}
                    onClick={() => dispatch(changeMenuSection(Section.Folders))}>Folders</button>
                    </div>
                    <div className="dialog-center-right scroll">
                    {
                        menuSection == Section.General ? (
                        <>
                            <span>Tipo de biblioteca</span>
                            <div className="dialog-library-type-box">
                            <button className={`dialog-library-btn ${
                                selectedLibrary ? (
                                    selectedLibrary.type !== "Shows" ? ' dialog-library-btn-active' : 'dialog-library-btn-disabled'
                                ) : selectedLibraryType !== "Shows" ? ' dialog-library-btn-active' : ''}`}
                                onClick={() => {
                                    setSelectedLibraryType("Movies");
                                }}>
                                <svg
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
                                <span>Películas</span>
                            </button>
                            <button className={`dialog-library-btn ${
                                selectedLibrary ? (
                                    selectedLibrary.type === "Shows" ? ' dialog-library-btn-active' : 'dialog-library-btn-disabled'
                                ) : selectedLibraryType === "Shows" ? ' dialog-library-btn-active' : ''}`}
                                onClick={() => {
                                    setSelectedLibraryType("Shows");
                                }}>
                                <svg
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
                                <span>Series</span>
                            </button>
                            </div>
                            <section className="dialog-horizontal-box">
                            <div className="dialog-input-box">
                                <span>Nombre</span>
                                <input type="text" value=
                                    {
                                        selectedLibrary ? selectedLibrary.name 
                                        : selectedLibraryType === "Shows" ? "Shows" : "Movies" 
                                    }
                                />
                            </div>
                            <div className="dialog-input-box">
                                <span>Idioma</span>
                                <select name="" id="">
                                    <option value="0">Español (España)</option>
                                    <option value="1">Inglés (Estados Unidos)</option>
                                </select>
                            </div>
                            </section>
                        </>
                        ) : menuSection == Section.Folders ? (
                        <>
                            <span>Añade carpetas a tu biblioteca</span>
                            <ul className="folder-list">
                                {folders.map((folder, index) => (
                                <li key={index}>
                                    {folder}
                                    <button className="svg-button-desktop-transparent" onClick={() => handleRemoveFolder(folder)}>
                                        <img src="./src/assets/svg/windowClose.svg" 
                                            style={{width: '20px', height: '20px', filter: 'drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))'}} />
                                    </button>
                                </li>
                                ))}
                            </ul>
                            <button className="desktop-dialog-btn add-folder-btn" onClick={handleSelectFolder}>
                                Añadir Carpeta
                            </button>
                            
                        </>
                        ) : (<></>)
                    }
                    </div>
                </section>
                <section className="dialog-bottom">
                    <button className="desktop-dialog-btn" onClick={() => dispatch(toggleLibraryEditWindow())}>Cancelar</button>
                    <button className="btn-app-color">Guardar</button>
                </section>
                </div>
            </section>
        </>
    )
};

export default renderLibraryWindow;