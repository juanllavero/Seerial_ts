import { useEffect, useState } from 'react';
import '../App.css'

function App() {
  const [library, setLibrary] = useState<any[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<any | null>(null); // Librería seleccionada
  const [selectedSeries, setSelectedSeries] = useState<any | null>(null);   // Serie seleccionada
  const [selectedSeason, setSelectedSeason] = useState<any | null>(null);   // Temporada seleccionada

  // Cargar los datos desde el proceso principal al montar el componente
  useEffect(() => {
    // @ts-ignore
    window.electronAPI.getLibraryData().then((data: any[]) => {
      setLibrary(data);
    });
  }, []);

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

  // Cuando se selecciona una serie, automáticamente selecciona la primera temporada
  const handleSeriesSelection = (series: any) => {
    setSelectedSeries(series);
    setSelectedSeason(series.seasons[0]); // Seleccionar la primera temporada de la serie
  };

  // Renderizado condicional del contenido de la sección derecha
  const renderRightPanelContent = () => {
    // Si no se ha seleccionado ninguna librería, mostrar el contenido inicial
    if (!selectedLibrary) {
      return (
        <>
          <div className="series-container"></div>
        </>
      );
    }

    // Si hay una librería seleccionada pero no una serie, mostrar la lista de series
    if (selectedLibrary && !selectedSeries) {
      return (
        <>
          <div className="series-container scroll">
            {selectedLibrary.series.map((series: any, index: number) => (
              <button
                key={index}
                className="series-button"
                onClick={() => handleSeriesSelection(series)
                } // Al hacer clic en la serie, pasamos a la vista de temporada
              >
                <div className="poster-image">
                  <img src={"./src/assets/poster.jpg" || selectedSeason.imgSrc} alt="Poster"/>
                </div>
                {series.name}
              </button>
            ))}
          </div>
        </>
      );
    }

    // Si hay una serie seleccionada, mostrar la temporada y episodios
    if (selectedSeries && selectedSeason) {
      return (
        <>
          <div className="background-image">
            <img src="./src/assets/transparencyEffect.png" alt="Background" />
          </div>
          <div className="season-episodes-container scroll">
            <div className="info-container">
              <div className="poster-image">
                <img src={"./src/assets/poster.jpg" || selectedSeason.imgSrc} alt="Poster"/>
              </div>
              <section className="season-info">
                <span id="seriesTitle">{selectedSeries.name}</span>
                <section className="season-info-text">
                  <span id="directedBy">{"Directed by " + selectedSeason.directedBy || ""}</span>
                  <span id="date">{selectedSeason.year || ""}</span>
                  <span id="genres">{selectedSeries.genres || ""}</span>
                </section>
                <div className="rating-info">
                  <img src="./src/assets/svg/themoviedb.svg" alt="TheMovieDB logo"/>
                  <span id="rating">{selectedSeason.score || "N/A"}</span>
                </div>
                <section className="season-info-buttons-container">
                <button className="play-button-desktop">
                  <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z" fill="#1C1C1C"></path></svg>
                  <span id="playText">Reproducir</span>
                </button>
                <button className="svg-button-desktop">
                  <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M38 6V40.125L24.85 33.74L23.5 33.065L22.15 33.74L9 40.125V6H38ZM38 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V45L23.5 36.5L41 45V6C41 5.20435 40.6839 4.44129 40.1213 3.87868C39.5587 3.31607 38.7957 3 38 3Z" fill="#FFFFFF"></path></svg>                </button>
                <button className="svg-button-desktop">
                <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M8.76987 30.5984L4 43L16.4017 38.2302L8.76987 30.5984Z" fill="#FFFFFF"></path><path d="M19.4142 35.5858L41.8787 13.1214C43.0503 11.9498 43.0503 10.0503 41.8787 8.87872L38.1213 5.12135C36.9497 3.94978 35.0503 3.94978 33.8787 5.12136L11.4142 27.5858L19.4142 35.5858Z" fill="#FFFFFF"></path></svg>
                </button>
                <button className="svg-button-desktop">
                  <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M12 27C13.6569 27 15 25.6569 15 24C15 22.3431 13.6569 21 12 21C10.3431 21 9 22.3431 9 24C9 25.6569 10.3431 27 12 27Z" fill="#FFFFFF"></path><path d="M24 27C25.6569 27 27 25.6569 27 24C27 22.3431 25.6569 21 24 21C22.3431 21 21 22.3431 21 24C21 25.6569 22.3431 27 24 27Z" fill="#FFFFFF"></path><path d="M39 24C39 25.6569 37.6569 27 36 27C34.3431 27 33 25.6569 33 24C33 22.3431 34.3431 21 36 21C37.6569 21 39 22.3431 39 24Z" fill="#FFFFFF"></path></svg>
                </button>
              </section>
                <div className="overview-container">
                  <p>{selectedSeason.overview || selectedSeries.overview || "Sin descripción disponible."}</p>
                  <input type="checkbox" className="expand-btn"></input>
                </div>
              </section>
            </div>
            <div className="episodes-container">
              {selectedSeason.episodes.map((episode: any, index: number) => (
                <button key={index} className="video-button">
                  <img src="./src/assets/fullBlur.jpg"/>
                  {episode.name}
                </button>
              ))}
            </div>
          </div>
        </>
      );
    }
  };

  // Cuando se selecciona una librería diferente desde el panel izquierdo, reinicia la vista a series
  const handleLibraryClick = (lib: any) => {
    setSelectedLibrary(lib);
    setSelectedSeries(null);
  };

  return (
    <section className="container blur-background-image">
      {/* Panel Izquierdo */}
      <section className="left-panel">
        <div className="top-controls">
          <button className="svg-button-desktop-controls">
            <svg aria-hidden="true" fill="currentColor" height="48" viewBox="0 0 48 48" width="48" xmlns="http://www.w3.org/2000/svg"><path d="M42 14H6V17H42V14Z" fill="#FFFFFF" fill-opacity="0.8"></path><path d="M42 32H6V35H42V32Z" fill="#FFFFFF"></path><path d="M6 23H42V26H6V23Z" fill="#FFFFFF"></path></svg>
          </button>
          <button className="svg-add-library-btn">
            <svg viewBox="0 0 560 560" xmlns="http://www.w3.org/2000/svg" stroke-miterlimit="1.414" stroke-linejoin="round" id="plex-icon-add-560" aria-hidden="true" width="48" height="48"><path d="m320 320l0 200-80 0 0-200-200 0 0-80 200 0 0-200 80 0 0 200 200 0 0 80-200 0" fill="#FFFFFF"></path></svg>
            <span>Añadir librería</span>
          </button>
        </div>
        <div className="series-list scroll">
          {library.map((lib, index) => (
            <button
              key={index}
              className="series-button"
              onClick={() => handleLibraryClick(lib)} // Al hacer clic, se selecciona la librería
            >
              {lib.name}
            </button>
          ))}
        </div>
      </section>

      {/* Panel Derecho */}
      <section className="right-panel">
        <div className="top-bar">
          <div className="window-buttons-container">
            <button className="window-button minimize-button" onClick={() => window.electronAPI.minimizeWindow()}>_</button>
            <button className="window-button maximize-button" onClick={() => window.electronAPI.maximizeWindow()}>[]</button>
            <button className="window-button close-button" onClick={() => window.electronAPI.closeWindow()}>X</button>
          </div>
        </div>
        {renderRightPanelContent()}
      </section>
    </section>
  );
}

export default App;