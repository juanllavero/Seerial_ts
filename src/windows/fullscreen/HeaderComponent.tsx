import {
	HomeFullSelectedIcon,
	HomeFullDefaultIcon,
	GoBackIcon,
	MenuIcon,
} from "@components/utils/IconLibrary";
import { FullscreenSections } from "@data/enums/Sections";
import { LibraryData } from "@interfaces/LibraryData";
import { toggleMainMenu } from "@redux/slices/contextMenuSlice";
import {
	selectSeason,
	selectEpisode,
	selectLibrary,
} from "@redux/slices/dataSlice";
import {
	setHomeInfoElement,
	setHomeImageLoaded,
	setDominantColor,
} from "@redux/slices/fullscreenSectionsSlice";
import { RootState } from "@redux/store";
import { useSectionContext } from "context/section.context";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./HeaderComponent.scss";
import { useFullscreenContext } from "context/fullscreen.context";

function HeaderComponent() {
	const dispatch = useDispatch();
	const { inSongsView, setInSongsView } = useFullscreenContext();
	const { currentFullscreenSection, setCurrentFullscreenSection } =
		useSectionContext();

	const librariesList = useSelector(
		(state: RootState) => state.data.libraries
	);
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const selectedSeries = useSelector(
		(state: RootState) => state.data.selectedSeries
	);

	const [time, setTime] = useState(new Date());

	useEffect(() => {
		// Update time every second
		const timer = setInterval(() => {
			setTime(new Date());
		}, 1000);

		return () => clearInterval(timer);
	}, []);

	const handleSelectLibrary = (library: LibraryData | null) => {
		if (library) {
			dispatch(setHomeInfoElement(undefined));
			dispatch(setHomeImageLoaded(false));
			dispatch(setDominantColor("000000"));

			setCurrentFullscreenSection(FullscreenSections.Collections);
		} else {
			setCurrentFullscreenSection(FullscreenSections.Home);
		}

		dispatch(selectLibrary(library));
		dispatch(selectSeason(null));
		dispatch(selectEpisode(undefined));
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<section className="header-container">
			{currentFullscreenSection !== FullscreenSections.Details ? (
				<>
					<button id="home" onClick={() => handleSelectLibrary(null)}>
						{selectedLibrary ? (
							<HomeFullSelectedIcon />
						) : (
							<HomeFullDefaultIcon />
						)}
					</button>
					<div className="libraries-list">
						{librariesList.map((library: LibraryData) => (
							<button
								key={library.id}
								className={`libraries-button ${
									library === selectedLibrary ? "active" : ""
								}`}
								title={library.name}
								onClick={() => handleSelectLibrary(library)}
							>
								<span className="library-name">{library.name}</span>
							</button>
						))}
					</div>
				</>
			) : (
				<button
					className="go-back-btn"
					onClick={() => {
						if (
							(!inSongsView ||
								selectedSeries &&
								selectedSeries.seasons &&
								selectedSeries.seasons.length <= 1) ||
							selectedLibrary?.type !== "Music"
						) {
							handleSelectLibrary(selectedLibrary);
						}

						setInSongsView(false);
					}}
				>
					<GoBackIcon />
				</button>
			)}
			<div className="right-options">
				<span id="time">{formatTime(time)}</span>
				{currentFullscreenSection !== FullscreenSections.Details && (
					<button
						id="options-btn"
						onClick={() => {
							dispatch(toggleMainMenu());
						}}
					>
						<MenuIcon />
					</button>
				)}
			</div>
		</section>
	);
}

export default React.memo(HeaderComponent);
