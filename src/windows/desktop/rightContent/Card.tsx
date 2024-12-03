import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";
import { RootState } from "@redux/store";
import { useDispatch, useSelector } from "react-redux";
import "./Card.scss";
import Image from "@components/image/Image";
import {
	closeContextMenu,
	toggleSeriesMenu,
} from "@redux/slices/contextMenuSlice";
import {
	selectSeries,
	selectSeason,
	toggleSeriesWindow,
	showSeriesMenu,
} from "@redux/slices/dataSlice";
import { t } from "i18next";
import { ContextMenu } from "primereact/contextmenu";
import React, { useRef } from "react";
import { EditIcon, VerticalDotsIcon } from "@components/utils/IconLibrary";
import { LibraryData } from "@interfaces/LibraryData";
import { ReactUtils } from "@data/utils/ReactUtils";
import { useSectionContext } from "context/section.context";
import { RightPanelSections } from "@data/enums/Sections";

interface CardProps {
	library?: LibraryData;
	show: SeriesData;
	season?: SeasonData;
	type: "default" | "music";
}

/**
 * @function Card
 * @description A single card on the right content panel representing a series or a season.
 * @param {CardProps} props The props for the Card component.
 * @param {LibraryData} [props.library] The library that the card belongs to.
 * @param {SeriesData} props.show The series the card represents.
 * @param {SeasonData} [props.season] The season the card represents if type is "default".
 * @param {"default" | "music"} props.type The type of the card.
 * @returns {JSX.Element} The JSX element for the Card component.
 */
function Card(props: CardProps): JSX.Element {
	const dispatch = useDispatch();
	const { setCurrentRightSection } = useSectionContext();
	const { library, show, season, type } = props;
	const seriesImageWidth = useSelector(
		(state: RootState) => state.seriesImage.width
	);
	const seriesImageHeight = useSelector(
		(state: RootState) => state.seriesImage.height
	);

	const cm = useRef<ContextMenu | null>(null);

	const handleSeriesSelection = (series: SeriesData) => {
		if (type === "music") {
			ReactUtils.generateGradient(series, null);
			setCurrentRightSection(RightPanelSections.MusicDetails);
		} else {
			setCurrentRightSection(RightPanelSections.Details);
		}

		dispatch(selectSeries(series));

		if (series.seasons && series.seasons.length > 0)
			handleSeasonSelection(series, series.seasons[0]);
	};

	const handleSeasonSelection = (series: SeriesData, season: SeasonData) => {
		if (type === "music" && season)
			ReactUtils.generateGradient(series, season);

		dispatch(selectSeason(season));
		dispatch(closeContextMenu());
	};

	return (
		<div className="card" style={{ maxWidth: `${seriesImageWidth}px` }}>
			<div className="top-section">
				<div
					className={`on-loading ${
						show && show.analyzingFiles ? "visible" : ""
					}`}
				>
					<span className="spinner"></span>
				</div>
				<div
					className="on-hover"
					onClick={() => handleSeriesSelection(show)}
				>
					<button
						className="svg-button-desktop-transparent"
						onClick={(e) => {
							e.stopPropagation();
							dispatch(showSeriesMenu(show));
							dispatch(toggleSeriesWindow());
						}}
					>
						<EditIcon />
					</button>
					<button
						className="svg-button-desktop-transparent"
						onClick={(e) => {
							e.stopPropagation();
							dispatch(showSeriesMenu(show));
							dispatch(toggleSeriesMenu());
							cm.current?.show(e);
						}}
					>
						<VerticalDotsIcon />
					</button>
				</div>
				<div className="image-section">
					{type === "default" ? (
						<Image
							src={
								show && show.coverSrc !== ""
									? show.coverSrc
									: show &&
									  show.seasons &&
									  show.seasons.length > 0 &&
									  show.seasons[0].coverSrc !== ""
									? show.seasons[0].coverSrc
									: "resources/img/fileNotFound.jpg"
							}
							alt="Poster"
							width={seriesImageWidth}
							height={seriesImageHeight}
							errorSrc="./src/resources/img/fileNotFound.jpg"
							isRelative={true}
						/>
					) : (
						<Image
							src={
								show
									? show.coverSrc
									: season
									? season.coverSrc
									: "./src/resources/img/songDefault.png"
							}
							alt="Poster"
							width={seriesImageWidth}
							height={seriesImageWidth}
							errorSrc="./src/resources/img/songDefault.png"
							isRelative={true}
						/>
					)}
				</div>
			</div>
			<div className="info-section">
				<a
					className="a_text"
					id="title"
					title={show.name}
					onClick={() => handleSeriesSelection(show)}
				>
					{show.name}
				</a>
				{show.seasons && show.seasons.length > 1 ? (
					<span id="subtitle">
						{(() => {
							const minYear = Math.min(
								...show.seasons.map((season: SeasonData) =>
									Number.parseInt(season.year)
								)
							);
							const maxYear = Math.max(
								...show.seasons.map((season: SeasonData) =>
									Number.parseInt(season.year)
								)
							);
							return minYear === maxYear
								? `${minYear}`
								: `${minYear} - ${maxYear}`;
						})()}
					</span>
				) : show.seasons && show.seasons.length > 0 ? (
					<span id="subtitle">
						{new Date(show.seasons[0].year).getFullYear()}
					</span>
				) : null}
			</div>
			<ContextMenu
				model={[
					{
						label: t("editButton"),
						command: () => {
							dispatch(toggleSeriesMenu());
							dispatch(toggleSeriesWindow());
						},
					},
					{
						label: t("markWatched"),
						command: () => dispatch(toggleSeriesMenu()),
					},
					{
						label: t("markUnwatched"),
						command: () => dispatch(toggleSeriesMenu()),
					},
					...((library && library.type === "Shows") || !show.isCollection
						? [
								{
									label: t("correctIdentification"),
									command: () => dispatch(toggleSeriesMenu()),
								},
						  ]
						: []),
					...(library && library.type === "Shows"
						? [
								{
									label: t("changeEpisodesGroup"),
									command: () => dispatch(toggleSeriesMenu()),
								},
						  ]
						: []),
					{
						label: t("removeButton"),
						command: () => dispatch(toggleSeriesMenu()),
					},
				]}
				ref={cm}
				className="dropdown-menu"
			/>
		</div>
	);
}

export default React.memo(Card);
