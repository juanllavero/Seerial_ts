import "../../../i18n";
import { SeasonData } from "@interfaces/SeasonData";
import { ReactUtils } from "@data/utils/ReactUtils";
import { RootState } from "@redux/store";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { selectSeason } from "@redux/slices/dataSlice";
import { useSectionContext } from "context/section.context";
import { FullscreenSections } from "@data/enums/Sections";
import Image from "@components/image/Image";
import EpisodeList from "./EpisodeList";

function SeasonsView() {
	const dispatch = useDispatch();
	const { t } = useTranslation();
	const { setCurrentFullscreenSection } = useSectionContext();

	// Main objects
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);
	const currentShow = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const currentEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);

	const handleSelectSeason = (season: SeasonData | undefined) => {
		if (season) {
			dispatch(selectSeason(season));
			setCurrentFullscreenSection(FullscreenSections.Details);
		}
	};

	return (
		<section className="season-container">
			{selectedLibrary && currentShow && currentSeason && currentEpisode ? (
				<>
					<div className="season-info-container">
						{selectedLibrary.type === "Shows" ? (
							<>
								{currentShow.logoSrc && currentShow.logoSrc !== "" ? (
									<Image
										src={currentShow.logoSrc}
										alt="Logo"
										isRelative={true}
										errorSrc=""
									/>
								) : (
									<span id="season-title">{currentShow.name}</span>
								)}
							</>
						) : (
							<>
								{currentSeason.logoSrc &&
								currentSeason.logoSrc !== "" ? (
									<Image
										src={currentSeason.logoSrc}
										alt="Logo"
										isRelative={true}
										errorSrc=""
									/>
								) : (
									<span id="season-title">{currentShow.name}</span>
								)}
							</>
						)}

						<span id="season-subtitle">
							{selectedLibrary.type === "Shows" && currentSeason
								? currentSeason.name
								: null}
						</span>
						<div className="season-info-horizontal">
							{selectedLibrary.type === "Shows" ? (
								<span>
									{t("seasonLetter")}
									{currentEpisode.seasonNumber} · {t("episodeLetter")}
									{currentEpisode.episodeNumber}
								</span>
							) : null}
							<span>
								{selectedLibrary.type === "Shows"
									? currentEpisode.year
									: new Date(currentEpisode.year).getFullYear()}
							</span>
							<span>
								{ReactUtils.formatTimeForView(currentEpisode.runtime)}
							</span>
						</div>
						<div className="season-overview-container">
							<span id="season-overview">
								{currentEpisode.overview ||
									currentSeason.overview ||
									currentShow.overview ||
									t("defaultOverview")}
							</span>
						</div>
					</div>
					{currentSeason.episodes && currentSeason.episodes.length > 1 ? (
						<EpisodeList />
					) : (
						<div style={{ marginTop: "2.5em" }}></div>
					)}
					<div className="season-btns">
						{currentSeason.episodes &&
						currentSeason.episodes.length == 1 ? (
							<div className="btns-container">
								<button className="season-btn" id="playButton">
									<svg
										aria-hidden="true"
										fill="currentColor"
										height="18"
										viewBox="0 0 48 48"
										width="18"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M13.5 42C13.1022 42 12.7206 41.842 12.4393 41.5607C12.158 41.2794 12 40.8978 12 40.5V7.49999C12 7.23932 12.0679 6.98314 12.197 6.75671C12.3262 6.53028 12.5121 6.34141 12.7365 6.20873C12.9609 6.07605 13.216 6.00413 13.4766 6.00006C13.7372 5.99599 13.9944 6.05992 14.2229 6.18554L44.2228 22.6855C44.4582 22.815 44.6545 23.0052 44.7912 23.2364C44.9279 23.4676 45.0001 23.7313 45.0001 23.9999C45.0001 24.2685 44.9279 24.5322 44.7912 24.7634C44.6545 24.9946 44.4582 25.1849 44.2228 25.3143L14.2229 41.8143C14.0014 41.9361 13.7527 41.9999 13.5 42Z"
											fill="#FFFFFF"
										></path>
									</svg>
									<span>{t("playButton")}</span>
								</button>
								<button className="season-btn">
									{true ? (
										<>
											<svg
												aria-hidden="true"
												fill="currentColor"
												height="18"
												viewBox="0 0 48 48"
												width="18"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M13.5 24.6195L21 32.121L34.5 18.6225L32.3775 16.5L21 27.879L15.6195 22.5L13.5 24.6195Z"
													fill="#FFFFFF"
												></path>
												<path
													clipRule="evenodd"
													d="M12.333 6.53914C15.7865 4.23163 19.8466 3 24 3C29.5696 3 34.911 5.21249 38.8493 9.15076C42.7875 13.089 45 18.4305 45 24C45 28.1534 43.7684 32.2135 41.4609 35.667C39.1534 39.1204 35.8736 41.812 32.0364 43.4015C28.1991 44.9909 23.9767 45.4068 19.9031 44.5965C15.8295 43.7862 12.0877 41.7861 9.15077 38.8492C6.21386 35.9123 4.21381 32.1705 3.40352 28.0969C2.59323 24.0233 3.0091 19.8009 4.59854 15.9636C6.18798 12.1264 8.8796 8.84665 12.333 6.53914ZM13.9997 38.9665C16.9598 40.9443 20.4399 42 24 42C28.7739 42 33.3523 40.1036 36.7279 36.7279C40.1036 33.3523 42 28.7739 42 24C42 20.4399 40.9443 16.9598 38.9665 13.9997C36.9886 11.0397 34.1774 8.73255 30.8883 7.37017C27.5992 6.00779 23.98 5.65133 20.4884 6.34586C16.9967 7.0404 13.7894 8.75473 11.2721 11.2721C8.75474 13.7894 7.04041 16.9967 6.34587 20.4884C5.65134 23.98 6.0078 27.5992 7.37018 30.8883C8.73256 34.1774 11.0397 36.9886 13.9997 38.9665Z"
													fill="#FFFFFF"
													fillRule="evenodd"
												></path>
											</svg>
											<span>{t("markWatched")}</span>
										</>
									) : (
										<>
											<svg
												aria-hidden="true"
												fill="currentColor"
												height="18"
												viewBox="0 0 48 48"
												width="18"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													clipRule="evenodd"
													d="M12.333 6.53914C15.7865 4.23163 19.8466 3 24 3C29.5696 3 34.911 5.21249 38.8493 9.15076C42.7875 13.089 45 18.4305 45 24C45 28.1534 43.7684 32.2135 41.4609 35.667C39.1534 39.1204 35.8736 41.812 32.0364 43.4015C28.1991 44.9909 23.9767 45.4068 19.9031 44.5965C15.8295 43.7862 12.0877 41.7861 9.15077 38.8492C6.21386 35.9123 4.21381 32.1705 3.40352 28.0969C2.59323 24.0233 3.0091 19.8009 4.59854 15.9636C6.18798 12.1264 8.8796 8.84665 12.333 6.53914ZM12.793 24.6194L21 32.8281L35.2072 18.6225L32.3775 15.7928L21 27.1719L15.6195 21.7929L12.793 24.6194Z"
													fill="#FFFFFF"
													fillRule="evenodd"
												></path>
											</svg>
											<span>{t("markUnwatched")}</span>
										</>
									)}
								</button>
								<button className="season-btn">
									{true ? (
										<>
											<svg
												aria-hidden="true"
												fill="currentColor"
												height="18"
												viewBox="0 0 48 48"
												width="18"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M38 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V45L23.5 36.5L41 45V6C41 5.20435 40.6839 4.44129 40.1213 3.87868C39.5587 3.31607 38.7957 3 38 3Z"
													fill="#FFFFFF"
												></path>
											</svg>
											<span>Marcar como visto</span>
										</>
									) : (
										<>
											<svg
												aria-hidden="true"
												fill="currentColor"
												height="18"
												viewBox="0 0 48 48"
												width="18"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													d="M38 3H9C8.20435 3 7.44129 3.31607 6.87868 3.87868C6.31607 4.44129 6 5.20435 6 6V45L23.5 36.5L41 45V6C41 5.20435 40.6839 4.44129 40.1213 3.87868C39.5587 3.31607 38.7957 3 38 3Z"
													fill="#FFFFFF"
												></path>
											</svg>
											<span>Marcar como no visto</span>
										</>
									)}
								</button>
							</div>
						) : null}
						<div className="tracks-info">
							<div className="track-info">
								<span>1080p (HEVC Main 10)</span>
							</div>
							<div className="track-info">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="1em"
									height="1em"
									viewBox="0 0 24 24"
								>
									<path
										fill="currentColor"
										d="M4 20q-.825 0-1.412-.587T2 18V6q0-.825.588-1.412T4 4h16q.825 0 1.413.588T22 6v12q0 .825-.587 1.413T20 20zm2-4h8v-2H6zm10 0h2v-2h-2zM6 12h2v-2H6zm4 0h8v-2h-8z"
									></path>
								</svg>
								<span>Español (AC3 5.1)</span>
							</div>
							<div className="track-info">
								<svg
									aria-hidden="true"
									height="18"
									viewBox="0 0 48 48"
									width="18"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M28.3604 11.4639L30.4806 9.34351C34.3167 13.2534 36.4667 18.511 36.4695 23.9885C36.4723 29.466 34.3274 34.7262 30.4953 38.64L28.3754 36.5201C31.6443 33.1682 33.4727 28.6709 33.4698 23.9889C33.467 19.307 31.6333 14.8118 28.3604 11.4639Z"
										fill="#FFFFFF"
									></path>
									<path
										d="M17.1176 37C17.0009 36.9995 16.8854 36.9746 16.7779 36.9268C16.6703 36.879 16.5729 36.8091 16.4912 36.7214L9.76765 29.569H3.88235C3.64834 29.569 3.42391 29.4712 3.25844 29.297C3.09296 29.1228 3 28.8865 3 28.6401V19.3514C3 19.105 3.09296 18.8688 3.25844 18.6946C3.42391 18.5204 3.64834 18.4225 3.88235 18.4225H9.76765L16.4912 11.2701C16.6565 11.0971 16.8801 11 17.1132 11C17.3463 11 17.57 11.0971 17.7353 11.2701C17.9015 11.4416 17.9967 11.6754 18 11.9204V36.0712C18 36.3175 17.907 36.5538 17.7416 36.728C17.5761 36.9022 17.3517 37 17.1176 37Z"
										fill="#FFFFFF"
									></path>
									<path
										d="M24.1196 15.7051C26.2662 17.9291 27.4669 20.8987 27.4697 23.9896C27.4725 27.0806 26.277 30.0523 24.1343 32.2801L22.0139 30.1599C23.5932 28.4941 24.4723 26.2853 24.4697 23.9899C24.4671 21.6945 23.583 19.4877 22 17.8255L24.1196 15.7051Z"
										fill="#FFFFFF"
									></path>
								</svg>
								<span>Forzados (Español Subrip)</span>
							</div>
						</div>
					</div>
					<div className="next-season-btn-container">
						{currentShow.seasons.length > 1 ? (
							<>
								{currentShow.seasons.map((season, index) => (
									<button
										key={season.id}
										className={`${
											season === currentSeason
												? "selected-season-btn"
												: ""
										}`}
										id={season.id + season.seasonNumber}
										onClick={() => handleSelectSeason(season)}
									>
										{selectedLibrary.type === "Shows"
											? season.seasonNumber
											: index + 1}
									</button>
								))}
							</>
						) : null}
					</div>
				</>
			) : null}
		</section>
	);
}

export default SeasonsView;
