import { useEffect, useRef } from "react";
import { SeriesData } from "@interfaces/SeriesData";
import { RootState } from "@redux/store";
import { useSelector, useDispatch } from "react-redux";
import { updateLibrary } from "@redux/slices/dataSlice"; // Acción para actualizar la librería
import "./CollectionsList.scss";
import Card from "../Card";
import { ReactUtils } from "@data/utils/ReactUtils";

function CollectionsList() {
	const dispatch = useDispatch();
	const libraries = useSelector((state: RootState) => state.data.libraries);
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);

	const draggingIndexRef = useRef<number | null>(null);
	const updatedSeriesRef = useRef<SeriesData[]>([]); // Saves the updated list temporarily

	useEffect(() => {
		if (libraries) ReactUtils.saveLibraries(libraries);
	}, [libraries]);

	const handleDragStart = (index: number) => {
		draggingIndexRef.current = index; // Save the selected element index
		updatedSeriesRef.current = [...(selectedLibrary?.series || [])]; // Copy original list
		const dragItem = document.querySelectorAll(".card")[index];
		dragItem?.classList.add("dragging");
	};

	const handleDragEnd = () => {
		const dragItem = document.querySelector(".dragging");
		dragItem?.classList.remove("dragging");
		draggingIndexRef.current = null; // Reset reference
	};

	const handleDragOver = (index: number, e: React.DragEvent) => {
		e.preventDefault();
		const draggingIndex = draggingIndexRef.current;

		if (draggingIndex === null || draggingIndex === index) return;

		// Reorder the list temporarily
		const updatedSeries = updatedSeriesRef.current;
		const [removedItem] = updatedSeries.splice(draggingIndex, 1);
		updatedSeries.splice(index, 0, removedItem);

		// Update index reference to the new position
		draggingIndexRef.current = index;
	};

	const handleDrop = () => {
		if (!updatedSeriesRef.current.length || !selectedLibrary) return;

		// Update Redux with the updated list
		const updatedLibrary = {
			...selectedLibrary,
			series: updatedSeriesRef.current,
		};

		dispatch(updateLibrary(updatedLibrary));
	};

	return (
		<div className="collection-container scroll" id="scroll">
			{selectedLibrary?.series.map((show: SeriesData, index: number) => (
				<div
					className="card"
					key={show.id}
					draggable
					onDragStart={() => handleDragStart(index)}
					onDragEnd={handleDragEnd}
					onDragOver={(e) => handleDragOver(index, e)}
					onDrop={handleDrop}
				>
					<Card library={selectedLibrary} show={show} type="default" />
				</div>
			))}
		</div>
	);
}

export default CollectionsList;
