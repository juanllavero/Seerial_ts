import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {renderLibrariesList} from "@components/desktop/librariesList";
import {renderRightPanelContent} from "@components/desktop/rightPanel";
import {renderLibraryAndSlider} from "@components/desktop/libraryAndSlider";
import {renderMainBackgroundImage} from "@components/desktop/mainBackgroundImage";
import { selectLibrary, setLibraries, setLibraryForMenu, toggleLibraryEditWindow } from 'redux/slices/dataSlice';
import { useTranslation } from 'react-i18next';
import '../../App.scss';
import '../../i18n';
import { toggleMaximize } from 'redux/slices/windowStateSlice';
import { closeVideo } from 'redux/slices/videoSlice';
import ResolvedImage from '@components/Image';
import { closeAllMenus, toggleMainMenu } from 'redux/slices/contextMenuSlice';
import renderLibraryWindow from './libraryWindow';
import renderEpisodeWindow from './episodeWindow';
import renderSeasonWindow from './seasonWindow';
import { LibraryData } from '@interfaces/LibraryData';
import renderSeriesWindow from './seriesWindow';
import { renderMusicPlayer } from './MusicPlayer';
import { ReactUtils } from 'data/utils/ReactUtils';
import { setGradientLoaded } from 'redux/slices/imageLoadedSlice';

function App() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const isVideoLoaded = useSelector((state: RootState) => state.video.isLoaded);
  const isMaximized = useSelector((state: RootState) => state.windowState.isMaximized);
  const mainMenuOpen = useSelector((state: RootState) => state.contextMenu.mainMenu);

  const gradientLoaded = useSelector((state: RootState) => state.imageLoaded.gradientLoaded);

  const selectedSeries = useSelector((state: RootState) => state.data.selectedSeries);
  const selectedSeason = useSelector((state: RootState) => state.data.selectedSeason);
  const [gradientBackground, setGradientBackground] = useState<string>("");

  useEffect(() => {
    if (selectedSeries){
      setTimeout(() => {
        const newGradient = ReactUtils.getGradientBackground();

        if (gradientBackground !== newGradient){
          dispatch(setGradientLoaded(false));
        }

        setTimeout(() => {
          setGradientBackground(newGradient);

        if (gradientBackground !== newGradient){
          dispatch(setGradientLoaded(true));
        }
        }, 200);
      }, 300);
    } else {
      setGradientBackground("none");
    }
  }, [selectedSeries, selectedSeason]);

  useEffect(() => {
    // @ts-ignore
    window.electronAPI.getLibraryData()
    .then((data: any[]) => {
      dispatch(setLibraries(data));
    })
    .catch((error: unknown) => {
      if (error instanceof Error) {
        console.error('Error loading library data:', error.message);
      } else {
        console.error('Unexpected error:', error);
      }
    });

    window.ipcRenderer.on('update-libraries', (_event, newLibraries: LibraryData[]) => {
      dispatch(setLibraries(newLibraries));
      saveLibraries(newLibraries);
    });
  
    window.ipcRenderer.on('add-library', (_event, newLibrary: LibraryData, newLibraries: LibraryData[]) => {
      dispatch(setLibraries(newLibraries));
      dispatch(selectLibrary(newLibrary));
      saveLibraries(newLibraries);
    })
  
    window.electronAPI.onWindowStateChange((state: string) => {
      dispatch(toggleMaximize(state === 'maximized'));
    });
  
    window.ipcRenderer.on('video-stopped', (_event) => {
      dispatch(closeVideo());
    });
  }, []);

  const showControls = () => {
    window.electronAPI.showControls();
  }

  const hideControls = () => {
    window.electronAPI.hideControls();
  }

  // Save data function
  const saveLibraries = (newData: LibraryData[]) => {
    // @ts-ignore
    window.electronAPI.saveLibraryData(newData).then((success: boolean) => {
      if (success) {
        console.log("Datos guardados correctamente");
      } else {
        console.error("Error al guardar los datos");
      }
    });
  };

  return (
    <>
      {
        isVideoLoaded ? (
          <div className={`overlay ${isVideoLoaded ? 'visible' : ''}`}
          onMouseMove={showControls}
          onClick={hideControls}
          onKeyDown={showControls}
          onDoubleClick={() => {window.electronAPI.setFullscreenControls()}}/>
        ) : (
          <></>
        )
      }
      {
        <>
          {renderLibraryWindow()}
          {renderSeriesWindow()}
          {renderSeasonWindow()}
          {renderEpisodeWindow()}
        </>
      }
      <div className={`gradient-background ${gradientLoaded ? 'fade-in' : ''}`}
        style={{
            background: `${gradientBackground}`,
        }}/>
      <section 
        className="container blur-background-image"
        
        onClick={
          (event) => {
              const target = event.target as Element;

              // Check if the click has been done in a "select" element
              if (!target.closest('.select')) {
                  dispatch(closeAllMenus());
              }
          }
      }>
        {renderMainBackgroundImage()}
        <div className="noise-background">
          <ResolvedImage
            src="resources/img/noise.png"
            alt="Background noise"
          />
        </div>

        {renderMusicPlayer()}

        {/* Left Panel */}
        <section className="left-panel">
          <div className="top-controls">
            <div className="dropdown" style={{marginBottom: "0.9em"}}>
              <button className="svg-button-desktop-controls select"
              onClick={() => {
                    if (!mainMenuOpen)
                      dispatch(closeAllMenus());
                    dispatch(toggleMainMenu());
                }}>
                <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M42 14H6V17H42V14Z" fill="#FFFFFF" fillOpacity="0.8"></path><path d="M42 32H6V35H42V32Z" fill="#FFFFFF"></path><path d="M6 23H42V26H6V23Z" fill="#FFFFFF"></path></svg>
              </button>
              <ul className={`menu ${mainMenuOpen ? (' menu-open'): ('')}`}>
                    <li key="settings"
                      onClick={() => {
                      dispatch(toggleMainMenu());
                      }}>
                        <svg aria-hidden="true" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M38.85 12H45V15H38.85C38.1 18.45 35.1 21 31.5 21C27.9 21 24.9 18.45 24.15 15H3V12H24.15C24.9 8.55 27.9 6 31.5 6C35.1 6 38.1 8.55 38.85 12ZM27 13.5C27 16.05 28.95 18 31.5 18C34.05 18 36 16.05 36 13.5C36 10.95 34.05 9 31.5 9C28.95 9 27 10.95 27 13.5Z" fill="#FFFFFF" fillRule="evenodd"></path><path clipRule="evenodd" d="M9.15 36H3V33H9.15C9.9 29.55 12.9 27 16.5 27C20.1 27 23.1 29.55 23.85 33H45V36H23.85C23.1 39.45 20.1 42 16.5 42C12.9 42 9.9 39.45 9.15 36ZM21 34.5C21 31.95 19.05 30 16.5 30C13.95 30 12 31.95 12 34.5C12 37.05 13.95 39 16.5 39C19.05 39 21 37.05 21 34.5Z" fill="#FFFFFF" fillRule="evenodd"></path></svg>
                        <span>{t('settings')}</span>
                    </li>
                    <li key="changeFullscreen"
                      onClick={() => {
                      dispatch(toggleMainMenu());
                      }}>
                        <svg aria-hidden="true" fill="currentColor" height="18" viewBox="0 0 48 48" width="18" xmlns="http://www.w3.org/2000/svg"><path clipRule="evenodd" d="M6 5H42C42.7957 5 43.5587 5.31607 44.1213 5.87868C44.6839 6.44129 45 7.20435 45 8V34C45 34.7957 44.6839 35.5587 44.1213 36.1213C43.5587 36.6839 42.7957 37 42 37H6C5.20435 37 4.44129 36.6839 3.87868 36.1213C3.31607 35.5587 3 34.7957 3 34V8C3 7.20435 3.31607 6.44129 3.87868 5.87868C4.44129 5.31607 5.20435 5 6 5ZM6 34H42V8H6V34Z" fill="#FFFFFF"></path><path d="M36 43V40H12V43H36Z" fill="#FFFFFF"></path></svg>
                        <span>{t('switchToFullscreen')}</span>
                        <a>F11</a>
                    </li>
                    <li key="ExitApp"
                      onClick={() => {
                      dispatch(toggleMainMenu());
                      }}>
                        <img src="./src/assets/svg/exitApp.svg" 
                          style={{width: '18px', height: '18px'}} />
                        <span>{t('exitFullscreen')}</span>
                    </li>
              </ul>
            </div>
            <button className="svg-add-library-btn select" onClick={() => {
              dispatch(setLibraryForMenu(undefined));
              dispatch(toggleLibraryEditWindow())
            }}>
              <svg viewBox="0 0 560 560" xmlns="http://www.w3.org/2000/svg" strokeMiterlimit="1.414" strokeLinejoin="round" id="plex-icon-add-560" aria-hidden="true" width="48" height="48"><path d="m320 320l0 200-80 0 0-200-200 0 0-80 200 0 0-200 80 0 0 200 200 0 0 80-200 0" fill="#FFFFFF"></path></svg>
              <span>{t('libraryWindowTitle')}</span>
            </button>
          </div>
          {renderLibrariesList()}
        </section>

        {/* Right Panel */}
        <section className="right-panel">
          <div className="top-bar">
            <div className="window-buttons-container">
              <button className="window-button minimize-button" onClick={() => window.electronAPI.minimizeWindow()}>
              <img src="./src/assets/svg/windowMin.svg" 
                style={{width: '16px', height: '16px', filter: 'drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))'}} />
              </button>
              <button className="window-button maximize-button" onClick={() => window.electronAPI.maximizeWindow()}>
                {
                  isMaximized ? (
                    <img src="./src/assets/svg/windowRestore.svg" 
                    style={{width: '16px', height: '16px', filter: 'drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))'}} />
                  ) : (
                    <img src="./src/assets/svg/windowMax.svg" 
                    style={{width: '16px', height: '16px', filter: 'drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))'}} />
                  )
                }
              </button>
              <button className="window-button close-button" onClick={() => window.electronAPI.closeWindow()}>
                <img src="./src/assets/svg/windowClose.svg" 
                style={{width: '18px', height: '18px', filter: 'drop-shadow(2px 1px 2px rgb(0 0 0 / 0.5))'}} />
              </button>
            </div>
          </div>
          {renderLibraryAndSlider()}
          {renderRightPanelContent()}
        </section>
      </section>
    </>
  );
}

export default App;