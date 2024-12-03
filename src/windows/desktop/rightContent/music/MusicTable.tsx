import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { EpisodeData } from "@interfaces/EpisodeData";
import { LibraryData } from "@interfaces/LibraryData";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { FilterMatchMode } from "primereact/api";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { ContextMenu } from "primereact/contextmenu";
import { selectEpisode, toggleEpisodeWindow } from "redux/slices/dataSlice";
import { toggleEpisodeMenu } from "redux/slices/contextMenuSlice";
import { useDispatch } from "react-redux";
import {
	setCurrentSong,
	setSongs,
	toggleMusicPause,
} from "redux/slices/musicPlayerSlice";
import { PlayIcon } from "@components/utils/IconLibrary";
import "./MusicTable.scss";

interface MusicViewProps {
	selectedLibrary: LibraryData;
}

const MusicTable: React.FC<MusicViewProps> = ({ selectedLibrary }) => {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const [selectionMode, setSelectionMode] = useState<boolean>(false);
	const [selectedElements, setSelectedElements] = useState<EpisodeData[]>([]);
	const [selectedElement, setSelectedElement] = useState(undefined);
	const [filters, setFilters] = useState({
		global: { value: null, matchMode: FilterMatchMode.CONTAINS },
	});

	const cmSong = useRef<ContextMenu | null>(null);

	const songList = useMemo(() => {
		let allSongs: EpisodeData[] = [];

		selectedLibrary.series.forEach((serie) => {
			if (serie.seasons && serie.seasons.length > 0) {
				serie.seasons.forEach((season) =>
					season.episodes && season.episodes.forEach((episode) => {
						allSongs.push(episode);
					})
				);
			}
		});

		return allSongs;
	}, [selectedLibrary]);

	const [globalFilterValue, setGlobalFilterValue] = useState("");

	const onGlobalFilterChange = (e: any) => {
		const value = e.target.value;
		let _filters = { ...filters };

		_filters["global"].value = value;

		setFilters(_filters);
		setGlobalFilterValue(value);
	};

	const songCoverTemplate = (rowData: EpisodeData) => {
		return (
			<div className="song-image-container">
				<img
					loading="lazy"
					src={rowData.imgSrc}
					alt="Song Image"
					style={{ width: `50px`, height: `50px` }}
					onError={(e: any) => {
						e.target.onerror = null;
						e.target.src = "./src/resources/img/songDefault.png";
					}}
				/>
				<div className="song-btn-overlay">
					<button
						onClick={() => {
							dispatch(setSongs(songList));
							dispatch(setCurrentSong(songList.indexOf(rowData)));
							dispatch(toggleMusicPause());
						}}
					>
						<PlayIcon />
					</button>
				</div>
			</div>
		);
	};

	const rowClass = (data: EpisodeData) => {
		const classes = ["song-row"];

		if (selectionMode) {
			if (selectedElements.includes(data)) {
				classes.push("row-selected");
			}
		} else {
			if (data === selectedElement) {
				classes.push("row-selected");
			}
		}

		return classes.join(" ");
	};

	useEffect(() => {
		if (selectedElements) setSelectionMode(selectedElements.length > 0);
	}, [selectedElements]);

	const formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	};

	return (
		<>
			{selectionMode && selectedElements && (
				<div className="floating-box">
					{selectedElements.length}{" "}
					{selectedElements.length === 1 ? "row" : "rows"} selected
				</div>
			)}
			<section className="music-container">
				<ContextMenu
					model={[
						{
							label: t("editButton"),
							command: () => {
								dispatch(selectEpisode(selectedElement));
								dispatch(toggleEpisodeMenu());
								dispatch(toggleEpisodeWindow());
							},
						},
						{
							label: t("removeButton"),
							command: () => {
								dispatch(toggleEpisodeMenu());
							},
						},
					]}
					ref={cmSong}
					onHide={() => setSelectedElement(undefined)}
					className="dropdown-menu"
				/>
				<div className="search-container">
					<IconField iconPosition="left">
						<InputIcon className="pi pi-search search-icon" />
						<InputText
							className="search-bar"
							value={globalFilterValue}
							onChange={onGlobalFilterChange}
							placeholder="Keyword Search"
						/>
					</IconField>
				</div>
				<DataTable
					value={songList}
					filters={filters}
					removableSort
					onContextMenu={(e) => {
						if (cmSong && cmSong.current) {
							dispatch(toggleEpisodeMenu());
							cmSong.current.show(e.originalEvent);
						}
					}}
					rowClassName={rowClass}
					contextMenuSelection={selectedElement}
					onContextMenuSelectionChange={(e: any) =>
						setSelectedElement(e.value)
					}
					selectionMode={selectionMode ? null : "checkbox"}
					selection={selectedElements}
					onSelectionChange={(e: any) => setSelectedElements(e.value)}
					tableStyle={{ minWidth: "50rem", width: "100%" }}
					scrollable
					scrollHeight="flex"
					virtualScrollerOptions={{ lazy: true, itemSize: 60 }}
					globalFilterFields={["name", "albumArtist", "album", "year"]}
				>
					<Column
						field="imgSrc"
						header=""
						body={songCoverTemplate}
						style={{ maxWidth: "65px" }}
					></Column>
					<Column
						field="name"
						header={t("title")}
						sortable
						style={{ width: "30%" }}
					></Column>
					<Column
						field="albumArtist"
						header={t("albumArtist")}
						sortable
						style={{ width: "20%" }}
					></Column>
					<Column
						field="album"
						header={t("album")}
						sortable
						style={{ width: "30%" }}
					></Column>
					<Column
						field="year"
						header={t("year")}
						sortable
						style={{ width: "10%" }}
					></Column>
					<Column
						field="runtimeInSeconds"
						header={t("duration")}
						body={(rowData) => formatTime(rowData.runtimeInSeconds)}
						sortable
						style={{ width: "10%" }}
					></Column>
					<Column
						selectionMode="multiple"
						headerStyle={{ width: "3rem" }}
					></Column>
				</DataTable>
			</section>
		</>
	);
};

export default MusicTable;
