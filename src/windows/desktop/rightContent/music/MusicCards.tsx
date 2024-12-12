import React, { useState, useEffect } from "react";
import { EpisodeData } from "@interfaces/EpisodeData";
import { LibraryData } from "@interfaces/LibraryData";
import { SeriesData } from "@interfaces/SeriesData";
import Card from "../Card";
import "./MusicCards.scss";

interface MusicViewProps {
	selectedLibrary: LibraryData;
}

const MusicCards: React.FC<MusicViewProps> = ({ selectedLibrary }) => {
	const [selectionMode, setSelectionMode] = useState<boolean>(false);
	const [selectedElements, setSelectedElements] = useState<EpisodeData[]>([]);

	useEffect(() => {
		setSelectedElements(selectedElements); //Only for compiler to work, remove later
		if (selectedElements) setSelectionMode(selectedElements.length > 0);
	}, [selectedElements]);

	return (
		<>
			{selectionMode && selectedElements && (
				<div className="floating-box">
					{selectedElements.length}{" "}
					{selectedElements.length === 1 ? "row" : "rows"} selected
				</div>
			)}
			<div className="music-cards scroll" id="scroll">
				{selectedLibrary.series.map((collection: SeriesData) => (
					<Card key={collection.id} library={selectedLibrary} show={collection} type="music" />
				))}
			</div>
		</>
	);
};

export default MusicCards;
