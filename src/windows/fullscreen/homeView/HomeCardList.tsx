import { EpisodeData } from "@interfaces/EpisodeData";
import { LibraryData } from "@interfaces/LibraryData";
import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";
import { RootState } from "@redux/store";
import React from "react";
import { useSelector } from "react-redux";
import HomeCard from "./HomeCard";
import "./HomeCardList.scss";
import { useTranslation } from "react-i18next";

function HomeCardList() {
   const { t } = useTranslation();
	const currentlyWatchingShows = useSelector(
		(state: RootState) => state.fullscreenSection.currentlyWatchingShows
	);

	return (
      <>
         <div className="continue-watching-title">
				<span>{t("continueWatching")}</span>
			</div>
         <div className="continue-watching-list">
            {[...currentlyWatchingShows]
               .splice(0, 75)
               .map(
                  (value: {
                     library: LibraryData;
                     show: SeriesData;
                     season: SeasonData;
                     episode: EpisodeData;
                  }) => (
                     <HomeCard value={value} key={value.show.id} />
                  )
               )}
         </div>
      </>
	);
}

export default React.memo(HomeCardList);
