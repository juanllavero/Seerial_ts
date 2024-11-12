import { useDispatch, useSelector } from "react-redux";
import {
	selectLibrary,
	setLibraryForMenu,
	toggleLibraryEditWindow,
	resetSelection,
} from "../../redux/slices/dataSlice";
import { removeTransparentImage } from "../../redux/slices/transparentImageLoadedSlice";
import { RootState } from "../../redux/store";
import {
	closeAllMenus,
	toggleLibraryMenu,
} from "redux/slices/contextMenuSlice";
import { useCallback, useRef } from "react";
import { ContextMenu } from "primereact/contextmenu";
import { useTranslation } from "react-i18next";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import {
	HomeIcon,
	MoviesIcon,
	MusicIcon,
	ShowsIcon,
	VerticalDotsIcon,
} from "@components/utils/IconLibrary";

function LibrariesList() {
	const { t } = useTranslation();
	const dispatch = useDispatch();
	const libraries = useSelector((state: RootState) => state.data.libraries);
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);

	const libraryMenuOpen = useSelector(
		(state: RootState) => state.contextMenu.libraryMenu
	);
	const libraryForMenu = useSelector(
		(state: RootState) => state.data.libraryForMenu
	);

	const cm = useRef<ContextMenu | null>(null);

	//#region CONTEXT MENU ITEMS
	const menuItems = [
		{
			label: t("editButton"),
			command: () => {
				dispatch(toggleLibraryEditWindow());
			},
		},
		{
			label: t("searchFiles"),
			command: () => {
				dispatch(toggleLibraryMenu());
			},
		},
		{
			label: t("updateMetadata"),
			command: () => {
				dispatch(toggleLibraryMenu());
			},
		},
		{
			label: t("removeButton"),
			command: () => {
				showDeleteDialog();
				dispatch(toggleLibraryMenu());
			},
		},
	];
	//#endregion

	const showDeleteDialog = () => {
		confirmDialog({
			message: t("removeLibraryMessage"),
			header: `${t("removeLibrary")}: ${libraryForMenu?.name}`,
			icon: "pi pi-info-circle",
			defaultFocus: "reject",
			acceptClassName: "p-button-danger",
			accept,
		});
	};

	const accept = () => {
		if (libraryForMenu) {
			window.electronAPI.deleteLibrary(libraryForMenu);
		}
	};

	const handleSelectLibrary = useCallback(
		(library: any) => {
			dispatch(selectLibrary(library));
			dispatch(resetSelection());
			dispatch(removeTransparentImage());
		},
		[dispatch]
	);

	return (
		<>
			<ConfirmDialog />
			<div className="libraries-list scroll">
				<button
					className={`libraries-button ${
						selectedLibrary === null ? "selected" : ""
					}`}
					title={t("home")}
				>
					<HomeIcon onClick={() => handleSelectLibrary(null)} />
					<span
						className="library-name"
						onClick={() => handleSelectLibrary(null)}
					>
						{t("home")}
					</span>
				</button>
				{libraries.map((library) => (
					<button
						key={library.id}
						className={`libraries-button ${
							library === selectedLibrary ? "selected" : ""
						}`}
						title={library.name}
					>
						{library.type === "Shows" ? (
							<ShowsIcon onClick={() => handleSelectLibrary(library)} />
						) : library.type === "Movies" ? (
							<MoviesIcon onClick={() => handleSelectLibrary(library)} />
						) : (
							<MusicIcon onClick={() => handleSelectLibrary(library)} />
						)}
						<span
							className="library-name"
							onClick={() => handleSelectLibrary(library)}
						>
							{library.name}
						</span>

						<div>
							<a
								id={library.id + "btn"}
								className={`svg-button-desktop-transparent select ${
									libraryMenuOpen && library == libraryForMenu
										? " active-btn"
										: " inactive-btn"
								}`}
								onClick={(e) => {
									dispatch(closeAllMenus());

									if (!libraryMenuOpen || library != libraryForMenu) {
										dispatch(toggleLibraryMenu());
										dispatch(setLibraryForMenu(library));
										cm.current?.show(e);
									}
								}}
							>
								<VerticalDotsIcon />
							</a>
						</div>
					</button>
				))}
				<ContextMenu
					model={menuItems}
					ref={cm}
					className={`dropdown-menu ${
						libraryMenuOpen ? " dropdown-menu-open" : ""
					}`}
				/>
			</div>
		</>
	);
}

export default LibrariesList;
