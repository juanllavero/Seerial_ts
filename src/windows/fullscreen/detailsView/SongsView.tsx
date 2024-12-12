import Image from "@components/image/Image";
import { PlayIcon } from "@components/utils/IconLibrary";
import { ReactUtils } from "@data/utils/ReactUtils";
import { RootState } from "@redux/store";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import "../../../i18n";
import SongsList from "./SongsList";

function SongsView() {
	const { t } = useTranslation();
	const currentShow = useSelector(
		(state: RootState) => state.data.selectedSeries
	);
	const currentSeason = useSelector(
		(state: RootState) => state.data.selectedSeason
	);
	const currentEpisode = useSelector(
		(state: RootState) => state.data.selectedEpisode
	);
	
	const handleTotalRuntime = () => {
		let totalRuntime: number = 0;
		if (currentSeason) {
			for (const song of currentSeason?.episodes) {
				totalRuntime += song.runtime;
			}
		}

		return totalRuntime;
	};

	if (!currentShow || !currentSeason || !currentEpisode) {
		return null;
	}

	return (
		<section className="music-container">
			<div className="music-info-container">
				<div className="album-image">
					<Image
						src={currentSeason.coverSrc}
						alt="Poster"
						isRelative={false}
						errorSrc="./src/resources/img/fileNotFound.jpg"
					/>
				</div>
				<span id="music-title">{currentShow.name}</span>
				<span id="music-subtitle">{currentSeason.name}</span>
				<div className="music-info-horizontal">
					<span>{new Date(currentSeason.year).getFullYear()}</span>
					<span>{ReactUtils.formatTimeForView(handleTotalRuntime())}</span>
				</div>
				{currentEpisode.overview ||
				currentSeason.overview ||
				currentShow.overview ? (
					<div className="music-overview-container">
						<span id="music-overview">
							{currentEpisode.overview ||
								currentSeason.overview ||
								currentShow.overview ||
								t("defaultOverview")}
						</span>
					</div>
				) : null}
				<div className="music-btns">
					{currentSeason.episodes ? (
						<div className="btns-container">
							<button className="season-btn" id="playButton">
								<PlayIcon />
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
									</>
								)}
							</button>
						</div>
					) : null}
				</div>
			</div>
			<SongsList />
		</section>
	);
}

export default SongsView;
