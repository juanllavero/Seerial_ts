import { Section } from "data/enums/Section";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import '../../App.scss';
import { useTranslation } from "react-i18next";
import { toggleSeasonWindow, toggleSeriesWindow } from "redux/slices/dataSlice";
import { toggleSettingsMenu } from "redux/slices/contextMenuSlice";
import i18n from "i18n";
import { Checkbox } from "primereact/checkbox";
import { Slider } from "primereact/slider";

const renderDesktopSettings = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const menuSection = useSelector((state: RootState) => state.sectionState.menuSection);
    const settingsOpen = useSelector((state: RootState) => state.contextMenu.settingsMenu);

    const [playMusic, setPlayMusic] = useState<boolean>(false);
    const [language, setLanguage] = useState<string>(i18n.language);

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

    useEffect(() => {
        if (settingsOpen)
            dispatch(changeMenuSection(Section.General));
    }, [settingsOpen]);

    const handleSavingChanges = () => {
        dispatch(toggleSeasonWindow());
    };

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        setLanguage(selectedLanguage);
        //i18n.changeLanguage(selectedLanguage);  // Cambia el idioma en i18next
    };

    return (
        <>
            <section className={`dialog ${settingsOpen ? ' dialog-active' : ''}`}>
                <div className="dialog-background" onClick={() => dispatch(toggleSettingsMenu())}></div>
                <div className="dialog-box">
                <section className="dialog-top">
                    <span>{t('settings')}</span>
                    <button className="close-window-btn" onClick={() => dispatch(toggleSettingsMenu())}>
                    <img src="./src/assets/svg/windowClose.svg" 
                    style={{width: '24px', height: '24px', filter: 'drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))'}} />
                    </button>
                </section>
                <section className="dialog-center">
                    <div className="dialog-center-left">
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.General ? ' desktop-dialog-side-btn-active' : ''}`}
                        onClick={() => dispatch(changeMenuSection(Section.General))}>{t('generalButton')}</button>
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.Details ? ' desktop-dialog-side-btn-active' : ''}`}
                        onClick={() => dispatch(changeMenuSection(Section.Details))}>{t('fullscreenButton')}</button>
                    <button className={`desktop-dialog-side-btn ${menuSection === Section.Advanced ? ' desktop-dialog-side-btn-active' : ''}`}
                        onClick={() => dispatch(changeMenuSection(Section.Advanced))}>{t('languagesButton')}</button>
                    </div>
                    <div className="dialog-center-right scroll">
                    {
                        menuSection === Section.General ? (
                            <>
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
                                <div className="dialog-input-box">
                                    <div className="flex align-items-center">
                                        <Checkbox onChange={e => {
                                            if (e.checked)
                                                setPlayMusic(true)
                                            else
                                                setPlayMusic(false)
                                        }} checked={playMusic}></Checkbox>
                                        <label className="check-text">{t('playMusicDesktop')}</label>
                                    </div>
                                </div>
                                <div className="dialog-input-box">
                                    <div className="flex align-items-center">
                                        <Checkbox onChange={e => {
                                            if (e.checked)
                                                setPlayMusic(true)
                                            else
                                                setPlayMusic(false)
                                        }} checked={playMusic}></Checkbox>
                                        <label className="check-text">{t('autoScan')}</label>
                                    </div>
                                </div>
                                <div className="dialog-input-box">
                                    <div className="flex align-items-center">
                                        <Checkbox onChange={e => {
                                            if (e.checked)
                                                setPlayMusic(true)
                                            else
                                                setPlayMusic(false)
                                        }} checked={playMusic}></Checkbox>
                                        <label className="check-text">{t('highSettingsPlayer')}</label>
                                    </div>
                                </div>
                                <div className="dialog-input-box">
                                    <div className="flex align-items-center">
                                        <Checkbox onChange={e => {
                                            if (e.checked)
                                                setPlayMusic(true)
                                            else
                                                setPlayMusic(false)
                                        }} checked={playMusic}></Checkbox>
                                        <label className="check-text">{t('interpolationCheck')}</label>
                                    </div>
                                    <span className="info-text">{t('interpolationMeaning')}</span>
                                </div>
                            </>
                        ) : menuSection === Section.Details ? (
                            <>
                                <span>{t('backgroundDelay')}</span>
                                {/*<Slider value={videoDelay} onChange={(e) => setVideoDelay(e.value)} />
                                <span>{t('backgroundVolume')}</span>
                                <Slider value={volume} onChange={(e) => setVolume(e.value)} />*/}
                                <div className="dialog-input-box">
                                    <div className="flex align-items-center">
                                        <Checkbox onChange={e => {
                                            if (e.checked)
                                                setPlayMusic(true)
                                            else
                                                setPlayMusic(false)
                                        }} checked={playMusic}></Checkbox>
                                        <label className="check-text">{t('showClock')}</label>
                                    </div>
                                </div>
                            </>
                        ) : menuSection === Section.Advanced ? (
                            <>
                                <div className="dialog-input-box">
                                    <span>{t('preferAudio')}</span>
                                    <select value={language} onChange={handleLanguageChange}>
                                    {supportedLanguages.map((lng: string) => (
                                        <option key={lng} value={lng}>
                                        {getLanguageName(lng) || lng}
                                        </option>
                                    ))}
                                    </select>
                                </div>
                                <div className="dialog-input-box">
                                    <span>{t('subsMode')}</span>
                                    <select value={language} onChange={handleLanguageChange}>
                                    {supportedLanguages.map((lng: string) => (
                                        <option key={lng} value={lng}>
                                        {getLanguageName(lng) || lng}
                                        </option>
                                    ))}
                                    </select>
                                </div>
                                <div className="dialog-input-box">
                                    <span>{t('preferSubs')}</span>
                                    <select value={language} onChange={handleLanguageChange}>
                                    {supportedLanguages.map((lng: string) => (
                                        <option key={lng} value={lng}>
                                        {getLanguageName(lng) || lng}
                                        </option>
                                    ))}
                                    </select>
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

export default renderDesktopSettings;