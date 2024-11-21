import Image from "@components/image/Image";
import { ReactUtils } from "@data/utils/ReactUtils";
import { RootState } from "@redux/store";
import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

function HomeInfo() {
  const { t } = useTranslation();
	const homeInfoElement = useSelector(
		(state: RootState) => state.fullscreenSection.homeInfoElement
	);
	return (
		<div className="home-info-container">
			{homeInfoElement ? (
				<>
					{homeInfoElement.library.type === "Shows" ? (
						<>
							{homeInfoElement.show.logoSrc &&
							homeInfoElement.show.logoSrc !== "" ? (
								<Image
									src={homeInfoElement.show.logoSrc}
									alt="Logo"
									isRelative={true}
									errorSrc=""
								/>
							) : (
								<span id="home-title">{homeInfoElement.show.name}</span>
							)}
						</>
					) : (
						<>
							{homeInfoElement.season.logoSrc &&
							homeInfoElement.season.logoSrc !== "" ? (
								<Image
									src={homeInfoElement.season.logoSrc}
									alt="Logo"
									isRelative={true}
									errorSrc=""
								/>
							) : (
								<span id="home-title">
									{homeInfoElement.season.name}
								</span>
							)}
						</>
					)}

					<span id="home-subtitle">
						{homeInfoElement.library.type === "Shows"
							? homeInfoElement.episode.name
							: null}
					</span>
					<div className="home-info-horizontal">
						{homeInfoElement.library.type === "Shows" ? (
							<span>
								{t("seasonLetter")}
								{homeInfoElement.episode.seasonNumber} ·{" "}
								{t("episodeLetter")}
								{homeInfoElement.episode.episodeNumber}
							</span>
						) : null}
						<span>
							{new Date(homeInfoElement.episode.year).getFullYear()}
						</span>
						<span>
							{ReactUtils.formatTimeForView(
								homeInfoElement.episode.runtime
							)}
						</span>
						{homeInfoElement.library.type !== "Shows" &&
						homeInfoElement.season.score &&
						homeInfoElement.season.score !== 0 ? (
							<span>{homeInfoElement.season.score.toFixed(2)}</span>
						) : null}
					</div>
					<span id="home-overview">
						{homeInfoElement.library.type === "Shows"
							? homeInfoElement.episode.overview ||
							  homeInfoElement.season.overview ||
							  homeInfoElement.show.overview ||
							  t("defaultOverview")
							: homeInfoElement.season.overview ||
							  homeInfoElement.show.overview ||
							  t("defaultOverview")}
					</span>
				</>
			) : null}
		</div>
	);
}

export default React.memo(HomeInfo);
