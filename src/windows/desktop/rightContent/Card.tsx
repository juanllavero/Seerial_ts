import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";
import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import "./Card.scss";
import ResolvedImage from "@components/image/ExternalImage";
import Image from "@components/image/Image";

interface CardProps {
	show: SeriesData;
	season: SeasonData;
	type: "default" | "music";
}

function Card(props: CardProps) {
	const { show, season, type } = props;
	const seriesImageWidth = useSelector(
		(state: RootState) => state.seriesImage.width
	);
	const seriesImageHeight = useSelector(
		(state: RootState) => state.seriesImage.height
	);

	return (
		<div className="card" style={{ maxWidth: `${seriesImageWidth}px` }}>
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
						src={show ? show.coverSrc : season.coverSrc}
						alt="Poster"
            width={seriesImageWidth}
            height={seriesImageWidth}
						errorSrc="./src/resources/img/songDefault.png"
            isRelative={false}
					/>
				)}
			</div>
			<div className="info-section">
        <span className="first-row">

        </span>
        <span className="second-row">
          
        </span>
      </div>
		</div>
	);
}

export default Card;
