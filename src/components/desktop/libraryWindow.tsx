import { Section } from "data/enums/Section";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import '../../App.scss';
import { toggleLibraryEditWindow } from "redux/slices/dataSlice";
import { useTranslation } from "react-i18next";
import { Library } from "@objects/Library";

const renderLibraryWindow = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const { i18n } = useTranslation();
    const [name, setName] = useState<string>("");
    const [type, setType] = useState<string>("Movies");
    const [folders, setFolders] = useState<string[]>([]);
    const [language, setLanguage] = useState<string>(i18n.language);
    const [addLibraryMode, setAddLibraryMode] = useState<boolean>(true);

    const menuSection = useSelector((state: RootState) => state.sectionState.menuSection);
    const libraryMenuOpen = useSelector((state: RootState) => state.data.libraryEditWindow);
    const selectedLibrary = useSelector((state: RootState) => state.data.libraryForMenu);

    const supportedLanguages = Array.isArray(i18n.options?.supportedLngs)
    ? i18n.options.supportedLngs.filter(lng => lng !== 'cimode')
    : [];

    const getLanguageName = (lang: string) => {
        try {
            let langCode = lang.split('-')[0];
            if (!langCode){
               langCode = lang; 
            }

            const languageNames = new Intl.DisplayNames([langCode], { type: 'language', languageDisplay: 'standard' });
            const languageName = languageNames.of(lang);

            if (languageName)
                return languageName.charAt(0).toUpperCase() + languageName.slice(1);
        } catch (error) {
            console.error('Error retrieving language and country name:', error);
            return lang;
        }
    };

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

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        setLanguage(selectedLanguage);
        //i18n.changeLanguage(selectedLanguage);  // Cambia el idioma en i18next
    };

    const handleSave = async () => {
        if (folders.length === 0){
            console.log("Error folder");
        }else{
            if (addLibraryMode){
                const newLibrary = new Library(name, language, type, 0, folders);
                window.electronAPI.scanFiles(newLibrary.toLibraryData());
            }else if (selectedLibrary){
                selectedLibrary.name = name;
                selectedLibrary.language = language;
                selectedLibrary.folders = folders;

                window.electronAPI.scanFiles(selectedLibrary);
            }
        }
        
        dispatch(toggleLibraryEditWindow());
    }

    useEffect(() => {
        dispatch(changeMenuSection(Section.General));
        if (selectedLibrary){
            setLanguage(selectedLibrary.language);
            setFolders(selectedLibrary.folders);
            setName(selectedLibrary.name);
            setType(selectedLibrary.type)
            setAddLibraryMode(false);
        }else{
            setLanguage(i18n.language);
            setType("Movies");
            setName(t('movies'));
            setFolders([]);
        }
            
    }, [libraryMenuOpen]);

    return (
        <>
            <section className={`dialog ${libraryMenuOpen ? ' dialog-active' : ''}`}>
                <div className="dialog-background" onClick={() => dispatch(toggleLibraryEditWindow())}></div>
                <div className="dialog-box">
                <section className="dialog-top">
                    {
                        selectedLibrary ? (
                            <span>{t('libraryWindowTitleEdit')}</span>
                        ) : (
                            <span>{t('libraryWindowTitle')}</span>
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
                    onClick={() => dispatch(changeMenuSection(Section.General))}>{t('generalButton')}</button>
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.Folders ? ' desktop-dialog-side-btn-active' : ''}`}
                    onClick={() => dispatch(changeMenuSection(Section.Folders))}>{t('folders')}</button>
                    </div>
                    <div className="dialog-center-right scroll">
                    {
                        menuSection == Section.General ? (
                        <>
                            <span>{t('type')}</span>
                            <div className="dialog-library-type-box">
                                <button className={`dialog-library-btn ${
                                    selectedLibrary ? (
                                        selectedLibrary.type === "Movies" ? ' dialog-library-btn-active' : 'dialog-library-btn-disabled'
                                    ) : type === "Movies" ? ' dialog-library-btn-active' : ''}`}
                                    onClick={() => {
                                        setType("Movies");
                                        setName(t('movies'));
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
                                    <span>{t('movies')}</span>
                                </button>
                                <button className={`dialog-library-btn ${
                                    selectedLibrary ? (
                                        selectedLibrary.type === "Shows" ? ' dialog-library-btn-active' : 'dialog-library-btn-disabled'
                                    ) : type === "Shows" ? ' dialog-library-btn-active' : ''}`}
                                    onClick={() => {
                                        setType("Shows");
                                        setName(t('shows'));
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
                                    <span>{t('shows')}</span>
                                </button>
                                <button className={`dialog-library-btn ${
                                selectedLibrary ? (
                                    selectedLibrary.type === "Music" ? ' dialog-library-btn-active' : 'dialog-library-btn-disabled'
                                ) : type === "Music" ? ' dialog-library-btn-active' : ''}`}
                                onClick={() => {
                                    setType("Music");
                                    setName(t('music'));
                                }}>
                                    <svg 
                                    id="libraries-button-svg" 
                                    aria-hidden="true"
                                    height="18" 
                                    viewBox="0 0 48 48" 
                                    width="18" 
                                    xmlns="http://www.w3.org/2000/svg">
                                        <path 
                                            d="M37.5 6H15C14.2046 6.00079 13.442 6.31712 12.8796 6.87956C12.3171 7.44199 12.0008 8.20459 12 9V30.8344C11.0921 30.2941 10.0565 30.0061 9 30C7.81331 30 6.65328 30.3519 5.66658 31.0112C4.67989 31.6705 3.91085 32.6075 3.45673 33.7039C3.0026 34.8003 2.88378 36.0067 3.11529 37.1705C3.3468 38.3344 3.91825 39.4035 4.75736 40.2426C5.59648 41.0818 6.66557 41.6532 7.82946 41.8847C8.99335 42.1162 10.1997 41.9974 11.2961 41.5433C12.3925 41.0892 13.3295 40.3201 13.9888 39.3334C14.6481 38.3467 15 37.1867 15 36V18H37.5V30.8343C36.5921 30.294 35.5565 30.006 34.5 30C33.3133 30 32.1533 30.3519 31.1666 31.0112C30.1799 31.6705 29.4109 32.6075 28.9567 33.7039C28.5026 34.8003 28.3838 36.0067 28.6153 37.1705C28.8468 38.3344 29.4182 39.4035 30.2574 40.2426C31.0965 41.0818 32.1656 41.6532 33.3295 41.8847C34.4933 42.1162 35.6997 41.9974 36.7961 41.5433C37.8925 41.0892 38.8295 40.3201 39.4888 39.3334C40.1481 38.3467 40.5 37.1867 40.5 36V9C40.4991 8.20463 40.1827 7.4421 39.6203 6.87969C39.0579 6.31728 38.2954 6.00091 37.5 6ZM15 9H37.5V15H15V9Z" 
                                            fill="#FFFFFF"></path>
                                    </svg>
                                    <span>{t('music')}</span>
                                </button>                            </div>
                            <section className="dialog-horizontal-box">
                            <div className="dialog-input-box">
                                <span>{t('name')}</span>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div className="dialog-input-box">
                                <span>{t('languageText')}</span>
                                <select value={language} onChange={handleLanguageChange}>
                                {supportedLanguages.map((lng: string) => (
                                    <option key={lng} value={lng}>
                                    {getLanguageName(lng) || lng}
                                    </option>
                                ))}
                                </select>
                            </div>
                            </section>
                        </>
                        ) : menuSection == Section.Folders ? (
                        <>
                            <span>{t('addFolderText')}</span>
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
                                {t('addFolder')}
                            </button>
                        </>
                        ) : (<></>)
                    }
                    </div>
                </section>
                <section className="dialog-bottom">
                    <button className="desktop-dialog-btn" onClick={() => dispatch(toggleLibraryEditWindow())}>{t('cancelButton')}</button>
                    <button className="btn-app-color" onClick={
                        menuSection === Section.General ? () => dispatch(changeMenuSection(Section.Folders)) : () => handleSave()
                    }>{
                        menuSection === Section.General ? `${t('next')}` : `${t('saveButton')}`
                    }</button>
                </section>
                </div>
            </section>
        </>
    )
};

export default renderLibraryWindow;