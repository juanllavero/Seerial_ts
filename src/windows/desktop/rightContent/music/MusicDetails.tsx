import { EpisodeData } from "@interfaces/EpisodeData";
import {
	closeAllMenus,
	closeContextMenu,
	toggleContextMenu,
	toggleSeasonMenu,
} from "@redux/slices/contextMenuSlice";
import { selectSeason, toggleSeasonWindow } from "@redux/slices/dataSlice";
import { ContextMenu } from "primereact/contextmenu";
import { useRef } from "react";
import {
	EditIcon,
	HorizontalDotsIcon,
	MarkWatchedIcon,
	PlayIcon,
} from "@components/utils/IconLibrary";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@redux/store";
import "./MusicDetails.scss";
import Image from "@components/image/Image";
import { SeasonData } from "@interfaces/SeasonData";
import SongItem from "./SongItem";

function MusicDetails() {
	const dispatch = useDispatch();
	const { t } = useTranslation();

	//const [selectionMode, setSelectionMode] = useState<boolean>(false);
	//const [selectedElements, setSelectedElements] = useState<EpisodeData[]>([]);

	const seriesMenuOpen = useSelector(
		(state: RootState) => state.contextMenu.seriesMenu
	);

	const selectedCollection = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const selectedAlbum = useSelector(
		(state: RootState) => state.data.selectedSeason
	);

	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const isContextMenuShown = useSelector(
		(state: RootState) => state.contextMenu.isContextShown
	);

	const cm = useRef<ContextMenu | null>(null);
	const cm3 = useRef<ContextMenu | null>(null);

	const handleSeasonSelection = (season: SeasonData) => {
		dispatch(selectSeason(season));
		dispatch(closeContextMenu());
	};

	function toggleMenu() {
		dispatch(toggleContextMenu());
	}

	const getDiscs = () => {
		let foundDiscs: number[] = [];

		if (selectedAlbum && selectedAlbum.episodes) {
			for (const song of selectedAlbum.episodes) {
				if (
					song.seasonNumber !== 0 &&
					!foundDiscs.includes(song.seasonNumber)
				) {
					foundDiscs.push(song.seasonNumber);
				}
			}
		}

		return foundDiscs;
	};
	
	const handleRenderSongs = () => {
		const discs = getDiscs();

		if (!selectedAlbum) return;

		if (discs.length === 0) {
			return (
				<>
					<span className="disc-text-title">
						{selectedAlbum.episodes && selectedAlbum.episodes.length} {t("tracks").toLowerCase()}
					</span>
					{selectedAlbum.episodes && selectedAlbum.episodes
						.slice()
						.sort((a, b) => {
							const episodeNumberA = a.episodeNumber ?? 0; // Si es undefined o null, usa 0 como valor por defecto
							const episodeNumberB = b.episodeNumber ?? 0;

							return episodeNumberA - episodeNumberB;
						})
						.map((song: EpisodeData, index: number) => (
							<SongItem key={song.id} song={song} index={index} />
						))}
				</>
			);
		} else {
			return (
				<>
					{discs.map((disc: number) => (
						<>
							<span className="disc-text-title">Disc {disc}</span>
							{selectedAlbum.episodes
								.filter((song) => song.seasonNumber === disc)
								.sort((a, b) => a.episodeNumber - b.episodeNumber)
								.map((song: EpisodeData, index: number) => (
									<SongItem key={song.id} song={song} index={index} />
								))}
						</>
					))}
				</>
			);
		}
	};

	if (!selectedLibrary || !selectedCollection || !selectedAlbum) return null;

	return (
		<>
			{/*selectionMode && selectedElements && (
				<div className="floating-box">
					{selectedElements.length}{" "}
					{selectedElements.length === 1 ? "row" : "rows"} selected
				</div>
			)*/}
			<div className="album-content scroll" id="scroll">
				<section className="album-info-container">
					<div className="info-container">
						<div className="poster-image round-image">
							<Image
								src={selectedAlbum.coverSrc}
								alt="Poster"
								isRelative={true}
								errorSrc="./src/resources/img/songDefault.png"
							/>
						</div>
						<section className="season-info">
							<a id="seriesTitle">{selectedCollection.name}</a>
							<span id="seasonTitle">{selectedAlbum.name}</span>
							<span id="date">
								{new Date(selectedAlbum.year).getFullYear() || null}
							</span>
							<span id="genres">
								{selectedLibrary.type !== "Shows"
									? selectedAlbum.genres &&
									  selectedAlbum.genres.length > 0
										? selectedAlbum.genres.join(", ") || ""
										: ""
									: ""}
							</span>
							<section className="btns-container">
								<button className="play-button-desktop">
									<PlayIcon />
									<span id="playText">{t("playButton")}</span>
								</button>
								<button
									className="svg-button-desktop"
									title="Mark as watched"
								>
									<MarkWatchedIcon />
								</button>
								<button
									className="svg-button-desktop"
									title={t("editButton")}
									onClick={() => dispatch(toggleSeasonWindow())}
								>
									<EditIcon />
								</button>
								<button
									className="svg-button-desktop"
									onClick={(e) => {
										dispatch(toggleSeasonMenu());
										if (!seriesMenuOpen) cm.current?.show(e);
									}}
								>
									<HorizontalDotsIcon />
								</button>
								<ContextMenu
									model={[
										...(selectedLibrary?.type !== "Shows"
											? [
													{
														label: t("correctIdentification"),
														command: () =>
															dispatch(toggleSeasonMenu()),
													},
											  ]
											: []),
										{
											label: t("updateMetadata"),
											command: () => dispatch(toggleSeasonMenu()),
										},
										{
											label: t("removeButton"),
											command: () => dispatch(toggleSeasonMenu()),
										},
									]}
									ref={cm}
									className="dropdown-menu"
								/>
							</section>
						</section>
					</div>
				</section>
				{selectedCollection.seasons &&
				selectedCollection.seasons.length > 1 ? (
					<section className="dropdown" style={{ marginTop: "1em" }}>
						<div
							className="select season-selector"
							onClick={(e) => {
								if (!isContextMenuShown) dispatch(closeAllMenus());

								toggleMenu();
								if (!isContextMenuShown) cm3.current?.show(e);
							}}
							onAuxClick={() => {
								dispatch(closeAllMenus());
							}}
						>
							<span className="selected">{selectedAlbum.name}</span>
							<div
								className={`arrow ${
									isContextMenuShown ? " arrow-rotate" : ""
								}`}
							></div>
						</div>
						<ContextMenu
							model={[
								...[...selectedCollection.seasons]
									.sort((a, b) => {
										if (a.order !== 0 && b.order !== 0) {
											return a.order - b.order;
										}
										if (a.order === 0 && b.order === 0) {
											return (
												new Date(a.year).getTime() -
												new Date(b.year).getTime()
											);
										}
										return a.order === 0 ? 1 : -1;
									})
									.map((season: SeasonData) => ({
										label: season.name,
										command: () => {
											toggleMenu();
											handleSeasonSelection(season);
										},
									})),
							]}
							ref={cm3}
							className="dropdown-menu"
						/>
					</section>
				) : null}
				<div className="song-list">{handleRenderSongs()}</div>
			</div>
		</>
	);
}

export default MusicDetails;
