import { Section } from "data/enums/Section";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeMenuSection } from "redux/slices/menuSectionsSlice";
import { RootState } from "redux/store";
import '../../App.scss';
import { useTranslation } from "react-i18next";
import { toggleSettingsMenu } from "redux/slices/contextMenuSlice";
import i18n from "i18n";
import { Checkbox } from "primereact/checkbox";
import { Slider } from "primereact/slider";
import ConfigManager from "data/utils/Configuration";

const renderDesktopSettings = () => {
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const menuSection = useSelector((state: RootState) => state.sectionState.menuSection);
    const settingsOpen = useSelector((state: RootState) => state.contextMenu.settingsMenu);

    const [playMusic, setPlayMusic] = useState<boolean>(false);
    const [autoScan, setAutoScan] = useState<boolean>(false);
    const [highQuality, setHighQuality] = useState<boolean>(false);
    const [interpolation, setInterpolation] = useState<boolean>(false);
    const [showClock, setShowClock] = useState<boolean>(false);
    const [language, setLanguage] = useState<string>(i18n.language);
    const [preferAudioLang, setPreferAudioLang] = useState<string>(i18n.language);
    const [subsMode, setSubsMode] = useState<string>(i18n.language);
    const [preferSubsLang, setPreferSubsLang] = useState<string>(i18n.language);

    const [volume, setVolume] = useState<number>(30);
    const [videoDelay, setVideoDelay] = useState<number>(2);

    const languages = [
        { code: 'en', name: 'Inglés' },
        { code: 'es', name: 'Español' },
        { code: 'de', name: 'Alemán' },
        { code: 'ar', name: 'Árabe' },
        { code: 'it', name: 'Italiano' },
        { code: 'fr', name: 'Francés' },
        { code: 'zh', name: 'Chino' },
        { code: 'ja', name: 'Japonés' },
        { code: 'ko', name: 'Coreano' },
        { code: 'hi', name: 'Hindi' },
    ];

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
        const loadSettings = async () => {
            const configManager = ConfigManager.getInstance();
            
            setPlayMusic(await configManager.get('playMusicDesktop', 'false') === 'true');
            setAutoScan(await configManager.get('autoScan', 'false') === 'true');
            setHighQuality(await configManager.get('highQuality', 'false') === 'true');
            setInterpolation(await configManager.get('interpolation', 'false') === 'true');
            setShowClock(await configManager.get('showClock', 'true') === 'true');
            
            setVolume(Number(await configManager.get('backgroundVolume', '30')));
            setVideoDelay(Number(await configManager.get('backgroundDelay', '2.0')));
    
            dispatch(changeMenuSection(Section.General));
        };
    
        if (settingsOpen) {
            loadSettings();
        }
    }, [settingsOpen]);

    const handleSavingChanges = () => {

        


        dispatch(toggleSettingsMenu());
    };

    const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        setLanguage(selectedLanguage);
        i18n.changeLanguage(selectedLanguage);
    };

    const handlePreferAudioChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        setPreferAudioLang(selectedLanguage);
    };

    const handleSubsModeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const subsModeVal = event.target.value;
        setSubsMode(subsModeVal);
    };

    const handlePreferSubsChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLanguage = event.target.value;
        setPreferSubsLang(selectedLanguage);
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
                                    <select className="select-input" value={language} onChange={handleLanguageChange}>
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
                                                setAutoScan(true)
                                            else
                                            setAutoScan(false)
                                        }} checked={autoScan}></Checkbox>
                                        <label className="check-text">{t('autoScan')}</label>
                                    </div>
                                </div>
                                <div className="dialog-input-box">
                                    <div className="flex align-items-center">
                                        <Checkbox onChange={e => {
                                            if (e.checked)
                                                setHighQuality(true)
                                            else
                                                setHighQuality(false)
                                        }} checked={highQuality}></Checkbox>
                                        <label className="check-text">{t('highSettingsPlayer')}</label>
                                    </div>
                                </div>
                                <div className="dialog-input-box">
                                    <div className="flex align-items-center">
                                        <Checkbox onChange={e => {
                                            if (e.checked)
                                                setInterpolation(true)
                                            else
                                                setInterpolation(false)
                                        }} checked={interpolation}></Checkbox>
                                        <label className="check-text">{t('interpolationCheck')}</label>
                                    </div>
                                    <span className="info-text">{t('interpolationMeaning')}</span>
                                </div>
                            </>
                        ) : menuSection === Section.Details ? (
                            <>
                                <span>{t('backgroundDelay')}</span>
                                <div className="dialog-horizontal-box align-center">
                                    <span>{videoDelay.toFixed(2)}</span>
                                    <Slider 
                                        className="slider" 
                                        value={videoDelay} 
                                        min={0}
                                        max={10}
                                        step={0.01}
                                        onChange={(e) => {
                                        if (typeof e.value === 'number') {
                                            setVideoDelay(parseFloat(e.value.toFixed(2)));
                                        }
                                    }} />
                                    <span>10</span>
                                </div>
                                <span>{t('backgroundVolume')}</span>
                                <div className="dialog-horizontal-box align-center">
                                    <span>{volume}</span>
                                    <Slider className="slider" value={volume} onChange={(e) => {
                                        if (typeof e.value === 'number') {
                                            setVolume(e.value);
                                        }
                                    }} />
                                    <span>100</span>
                                </div>
                                <div className="dialog-input-box">
                                    <div className="flex align-items-center">
                                        <Checkbox onChange={e => {
                                            if (e.checked)
                                                setShowClock(true)
                                            else
                                                setShowClock(false)
                                        }} checked={showClock}></Checkbox>
                                        <label className="check-text">{t('showClock')}</label>
                                    </div>
                                </div>
                            </>
                        ) : menuSection === Section.Advanced ? (
                            <>
                                <div className="dialog-input-box">
                                    <span>{t('preferAudio')}</span>
                                    <select className="select-input" value={preferAudioLang} onChange={handlePreferAudioChange}>
                                        {languages.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {getLanguageName(lang.code) || lang.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="dialog-input-box">
                                    <span>{t('subsMode')}</span>
                                    <select className="select-input" value={subsMode} onChange={handleSubsModeChange}>
                                        <option value={1}>{t('manualSubs')}</option>
                                        <option value={2}>{t('autoSubs')}</option>
                                        <option value={3}>{t('alwaysSubs')}</option>
                                    </select>
                                </div>
                                <div className="dialog-input-box">
                                    <span>{t('preferSubs')}</span>
                                    <select className="select-input" value={preferSubsLang} onChange={handlePreferSubsChange}>
                                        {languages.map((lang) => (
                                            <option key={lang.code} value={lang.code}>
                                                {getLanguageName(lang.code) || lang.name}
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
                    <button className="desktop-dialog-btn" onClick={() => dispatch(toggleSettingsMenu())}>{t('cancelButton')}</button>
                    <button className="btn-app-color" onClick={() => handleSavingChanges()}>{t('saveButton')}</button>
                </section>
                </div>
            </section>
        </>
    )
};

export default renderDesktopSettings;