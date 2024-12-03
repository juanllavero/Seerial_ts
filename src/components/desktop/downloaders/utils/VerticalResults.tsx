import React from "react";
import ResultCard from "./ResultCard";
import { MediaSearchResult } from "@interfaces/SearchResults";
import PopUpVideo from "./PopUpVideo";
import { useDownloadContext } from "context/download.context";

function VerticalResults() {
	const { results, playContent, selectedUrl, loaded } = useDownloadContext();

	return (
		<>
			{playContent && selectedUrl !== "" && <PopUpVideo />}
			<div className="results-container">
				{
					loaded ? (
						results && results.length > 0 ? (
							results.map((result: MediaSearchResult) => (
								<ResultCard key={result.id} result={result} />
							))
						) : (
							<div>No results found</div>
						)
					) : (
						<div className="downloading-content">
							<div className="loading-circle"></div>
						</div>
					)
				}
			</div>
		</>
	);
}

export default React.memo(VerticalResults);
