import "../../../i18n";
import { SeasonData } from "@interfaces/SeasonData";
import { RootState } from "@redux/store";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { useFullscreenContext } from "context/fullscreen.context";
import { PlayIcon } from "@components/utils/IconLibrary";
import Image from "@components/image/Image";
import AlbumsList from "./AlbumsList";

function AlbumsView() {
	const { t } = useTranslation();
	const { setInSongsView } = useFullscreenContext();

	const currentShow = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);

	// Check if there are multiple albums and show the corresponding view
	useEffect(() => {
		if (currentShow) {
			setInSongsView(currentShow.seasons.length <= 1);
		}
	}, [currentShow]);

	if (!currentShow || !currentSeason) return null;

	return (
		<section className="albums-container">
			<div className="music-info-container">
				<div className="album-image">
					<Image
						src={currentShow.coverSrc}
						alt="Poster"
						isRelative={false}
						errorSrc="./src/resources/img/songDefault.png"
					/>
				</div>
				<div className="collection-info">
					<span id="music-title">{currentShow.name}</span>
					<div className="music-info-horizontal">
						<span>
							{(() => {
								const years = currentShow.seasons
									.map((season: SeasonData) =>
										Number.parseInt(season.year)
									)
									.filter((year) => !isNaN(year));

								if (years.length === 0) {
									return "N/A";
								}

								const minYear = Math.min(...years);
								const maxYear = Math.max(...years);

								return minYear === maxYear
									? `${minYear}`
									: `${minYear} - ${maxYear}`;
							})()}
						</span>
					</div>
					<div className="music-overview-container">
						<span id="music-overview">
							{currentSeason.overview ||
								currentShow.overview ||
								t("defaultOverview")}
						</span>
					</div>
					<div className="music-btns">
						{currentSeason.episodes ? (
							<div className="btns-container">
								<button className="season-btn" id="playButton">
									<PlayIcon />
									<span>{t("playButton")}</span>
								</button>
							</div>
						) : null}
					</div>
				</div>
			</div>
			<AlbumsList />
		</section>
	);
}

export default AlbumsView;
