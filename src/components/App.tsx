import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {renderLibrariesList} from "@components/librariesList";
import {renderRightPanelContent} from "@components/rightPanel";
import {renderLibraryAndSlider} from "@components/libraryAndSlider"
import {renderMainBackgroundImage} from "@components/mainBackgroundImage"
import { setLibraries } from 'redux/slices/librarySlice';
import { useTranslation } from 'react-i18next';
import '../App.css';
import '../i18n';

function App() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

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
  }, [dispatch]);

  // Save data function
  const saveLibrary = (newData: any[]) => {
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
    <section className="container blur-background-image">
      {renderMainBackgroundImage()}

      {/* Left Panel */}
      <section className="left-panel">
        <div className="top-controls">
          <button className="svg-button-desktop-controls">
            <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M42 14H6V17H42V14Z" fill="#FFFFFF" fill-opacity="0.8"></path><path d="M42 32H6V35H42V32Z" fill="#FFFFFF"></path><path d="M6 23H42V26H6V23Z" fill="#FFFFFF"></path></svg>
          </button>
          <button className="svg-add-library-btn">
            <svg viewBox="0 0 560 560" xmlns="http://www.w3.org/2000/svg" stroke-miterlimit="1.414" stroke-linejoin="round" id="plex-icon-add-560" aria-hidden="true" width="48" height="48"><path d="m320 320l0 200-80 0 0-200-200 0 0-80 200 0 0-200 80 0 0 200 200 0 0 80-200 0" fill="#FFFFFF"></path></svg>
            <span>{t('libraryWindowTitle')}</span>
          </button>
        </div>
        {renderLibrariesList()}
      </section>

      {/* Right Panel */}
      <section className="right-panel">
        <div className="top-bar">
          <div className="window-buttons-container">
            <button className="window-button minimize-button" onClick={() => window.electronAPI.minimizeWindow()}>_</button>
            <button className="window-button maximize-button" onClick={() => window.electronAPI.maximizeWindow()}>[]</button>
            <button className="window-button close-button" onClick={() => window.electronAPI.closeWindow()}>X</button>
          </div>
        </div>
        {renderLibraryAndSlider()}
        {renderRightPanelContent()}
      </section>
    </section>
  );
}

export default App;