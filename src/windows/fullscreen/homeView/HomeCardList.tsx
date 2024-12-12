import { EpisodeData } from "@interfaces/EpisodeData";
import { LibraryData } from "@interfaces/LibraryData";
import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";
import { RootState } from "@redux/store";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import HomeCard from "./HomeCard";
import "./HomeCardList.scss";
import { useTranslation } from "react-i18next";
import { ReactUtils } from "@data/utils/ReactUtils";
import { setHomeInfoElement } from "@redux/slices/fullscreenSectionsSlice";

function HomeCardList() {
   const dispatch = useDispatch();
	const { t } = useTranslation();
	const currentlyWatchingShows = useSelector(
		(state: RootState) => state.fullscreenSection.currentlyWatchingShows
	);

	const homeInfoElement = useSelector(
		(state: RootState) => state.fullscreenSection.homeInfoElement
	);

	const listRef = useRef<HTMLDivElement>(null);

	//#region KEYBOARD DETECTION
	const handleKeyDown = (event: KeyboardEvent) => {
		if (!currentlyWatchingShows) {
			return;
		}

		const currentIndex = currentlyWatchingShows.findIndex(
			(elem) => elem === homeInfoElement
		);

      // Move to next element
		if (event.key === "ArrowRight") {
			const nextIndex = currentIndex + 1;
			if (nextIndex < currentlyWatchingShows.length) {
				ReactUtils.handleScrollElementClick(nextIndex, listRef, false);
            dispatch(setHomeInfoElement(currentlyWatchingShows[nextIndex]));
			}
		}

      // Move to prev element
		if (event.key === "ArrowLeft") {
			const prevIndex = currentIndex - 1;
			if (prevIndex >= 0) {
				ReactUtils.handleScrollElementClick(prevIndex, listRef, false);
            dispatch(setHomeInfoElement(currentlyWatchingShows[prevIndex]));
			}
		}
	};

	// Add and Clean Keyboard Events
	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [currentlyWatchingShows, homeInfoElement]);
	//#endregion

	return (
		<>
			<div className="continue-watching-title">
				<span>{t("continueWatching")}</span>
			</div>
			<div className="continue-watching-list" ref={listRef}>
				{[...currentlyWatchingShows].map(
					(
						value: {
							library: LibraryData;
							show: SeriesData;
							season: SeasonData;
							episode: EpisodeData;
						},
						index
					) => (
						<HomeCard
							value={value}
							key={value.show.id}
							listRef={listRef}
							index={index}
						/>
					)
				)}
			</div>
		</>
	);
}

export default React.memo(HomeCardList);
