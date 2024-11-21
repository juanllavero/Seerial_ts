import { SeriesData } from "@interfaces/SeriesData";
import { RootState } from "@redux/store";
import { useSelector, useDispatch } from "react-redux";
import { updateLibrary } from "@redux/slices/dataSlice"; // Acción para actualizar la librería
import "./CollectionsList.scss";
import Card from "../Card";

function CollectionsList() {
  const dispatch = useDispatch();
  const selectedLibrary = useSelector(
    (state: RootState) => state.data.selectedLibrary
  );

  const handleDragStart = (index: number) => {
    const dragItem = document.querySelectorAll(".card")[index];
    dragItem?.classList.add("dragging");
  };

  const handleDragEnd = (index: number) => {
    const dragItem = document.querySelectorAll(".card")[index];
    dragItem?.classList.remove("dragging");
  };

  const handleDragOver = (index: number, e: React.DragEvent) => {
    e.preventDefault();
    const draggingElement = document.querySelector(".dragging");

    if (!draggingElement) return;

    const overElement = document.querySelectorAll(".card")[index];
    if (overElement && overElement !== draggingElement) {
      // Obtener el índice de los elementos arrastrados
      const updatedSeries = [...(selectedLibrary?.series || [])];
      const draggingIndex = Array.from(draggingElement.parentNode?.children || []).indexOf(draggingElement);
      const [removedItem] = updatedSeries.splice(draggingIndex, 1);
      updatedSeries.splice(index, 0, removedItem);

      // Crear la librería actualizada
      const updatedLibrary = {
        ...selectedLibrary,
        series: updatedSeries,
      };

      // Actualizar en Redux
      dispatch(updateLibrary(updatedLibrary));
    }
  };

  return (
    <div className="collection-container scroll" id="scroll">
      {selectedLibrary?.series.map((show: SeriesData, index: number) => (
        <div
          className="card"
          key={show.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragEnd={() => handleDragEnd(index)}
          onDragOver={(e) => handleDragOver(index, e)}
        >
          <Card show={show} type="default" />
        </div>
      ))}
    </div>
  );
}

export default CollectionsList;
