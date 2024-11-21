import { useDispatch, useSelector } from "react-redux";
import {
	increaseEpisodeImageSize,
	reduceEpisodeImageSize,
} from "@redux/slices/episodeImageSlice";
import {
	increaseSeriesImageSize,
	reduceSeriesImageSize,
} from "@redux/slices/seriesImageSlice";
import { removeTransparentImage } from "@redux/slices/transparentImageLoadedSlice";
import {
	selectLibrary,
	setLibraryForMenu,
	toggleLibraryEditWindow,
	resetSelection,
} from "@redux/slices/dataSlice";
import { RootState } from "@redux/store";
import { ContextMenu } from "primereact/contextmenu";
import { useRef } from "react";
import {
	closeAllMenus,
	toggleLibraryMenuSecondary,
} from "redux/slices/contextMenuSlice";
import { useTranslation } from "react-i18next";
import { BoxMatrixIcon, VerticalDotsIcon } from "@components/utils/IconLibrary";
import "./LibraryAndSlider.scss";
import { useSectionContext } from "context/section.context";
import { RightPanelSections } from "@data/enums/Sections";

function LibraryAndSlider() {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const { setCurrentRightSection } = useSectionContext();
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const selectedSeries = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const librarySecondaryMenuOpen = useSelector(
		(state: RootState) => state.contextMenu.libraryMenuSecondary
	);

	//Reducers for images size
	const seriesImageWidth = useSelector(
		(state: RootState) => state.seriesImage.width
	);
	const episodeImageWidth = useSelector(
		(state: RootState) => state.episodeImage.width
	);

	const cmLibrary = useRef<ContextMenu | null>(null);

	const handleSeriesSliderChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const newSize = parseInt(event.target.value, 10);
		if (newSize > seriesImageWidth) {
			dispatch(increaseSeriesImageSize());
		} else {
			dispatch(reduceSeriesImageSize());
		}
	};

	const handleEpisodeSliderChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		const newSize = parseInt(event.target.value, 10);
		if (newSize > episodeImageWidth) {
			dispatch(increaseEpisodeImageSize());
		} else {
			dispatch(reduceEpisodeImageSize());
		}
	};

	const handleSelectLibrary = (library: any) => {
		dispatch(selectLibrary(library));
		dispatch(resetSelection());
		dispatch(removeTransparentImage());

		if (library) {
			if (library.type === "Music")
				setCurrentRightSection(RightPanelSections.MusicAlbums);
			else setCurrentRightSection(RightPanelSections.Collections);
		} else {
			setCurrentRightSection(RightPanelSections.Home);
		}
	};

	if (selectedSeries == null) {
		return (
			<div className="library-slicer-bar">
				<button
					className="library-button"
					onClick={() => handleSelectLibrary(selectedLibrary)}
				>
					<span>{selectedLibrary ? selectedLibrary.name : t("home")}</span>
				</button>
				{selectedLibrary ? (
					<button
						className="svg-button-desktop-transparent"
						onClick={(e) => {
							dispatch(closeAllMenus());

							if (!librarySecondaryMenuOpen) {
								dispatch(setLibraryForMenu(selectedLibrary));
								dispatch(toggleLibraryMenuSecondary());
								cmLibrary.current?.show(e);
							}
						}}
					>
						<VerticalDotsIcon />
					</button>
				) : null}
				<div>
					<input
						type="range"
						min="130"
						max="300"
						step="10"
						value={seriesImageWidth}
						onChange={handleSeriesSliderChange}
						className="desktopSlider"
						id="imageSizeSlider"
					/>
				</div>
				<BoxMatrixIcon />
				<ContextMenu
					model={[
						{
							label: t("editButton"),
							command: () => {
								dispatch(toggleLibraryMenuSecondary());
								dispatch(toggleLibraryEditWindow());
							},
						},
						{
							label: t("searchFiles"),
							command: () => {
								dispatch(toggleLibraryMenuSecondary());
							},
						},
						{
							label: t("updateMetadata"),
							command: () => {
								dispatch(toggleLibraryMenuSecondary());
							},
						},
						{
							label: t("removeButton"),
							command: () => {
								dispatch(toggleLibraryMenuSecondary());
							},
						},
					]}
					ref={cmLibrary}
					className="dropdown-menu"
				/>
			</div>
		);
	} else if (selectedLibrary != null && selectedSeries != null) {
		return (
			<div className="library-slicer-bar">
				<button
					className="library-button"
					onClick={() => handleSelectLibrary(selectedLibrary)}
				>
					{selectedLibrary.name}
				</button>
				<button
					className="svg-button-desktop-transparent"
					onClick={(e) => {
						dispatch(closeAllMenus());

						if (!librarySecondaryMenuOpen) {
							dispatch(setLibraryForMenu(selectedLibrary));
							dispatch(toggleLibraryMenuSecondary());
							cmLibrary.current?.show(e);
						}
					}}
				>
					<VerticalDotsIcon />
				</button>
				<div>
					<input
						type="range"
						min="290"
						max="460"
						step="10"
						value={episodeImageWidth}
						onChange={handleEpisodeSliderChange}
						className="desktopSlider"
						id="imageSizeSlider"
					/>
				</div>
				<BoxMatrixIcon />
				<ContextMenu
					model={[
						{
							label: "Editar",
							command: () => {
								dispatch(toggleLibraryMenuSecondary());
								dispatch(toggleLibraryEditWindow());
							},
						},
						{
							label: "Buscar archivos en la biblioteca",
							command: () => {
								dispatch(toggleLibraryMenuSecondary());
							},
						},
						{
							label: "Actualizar metadatos",
							command: () => {
								dispatch(toggleLibraryMenuSecondary());
							},
						},
						{
							label: "Eliminar",
							command: () => {
								dispatch(toggleLibraryMenuSecondary());
							},
						},
					]}
					ref={cmLibrary}
					className={`dropdown-menu ${
						librarySecondaryMenuOpen ? " dropdown-menu-open" : ""
					}`}
				/>
			</div>
		);
	}
}

export default LibraryAndSlider;
