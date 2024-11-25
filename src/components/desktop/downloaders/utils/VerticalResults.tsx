import React, { useEffect, useState } from "react";
import ResultCard from "./ResultCard";

function VerticalResults({ searchQuery }: { searchQuery: string }) {
	const [results, setResults] = useState([]);

	useEffect(() => {
		const search = async () => {
			setResults(await window.ipcRenderer.invoke("search-videos", searchQuery));
		};

		if (searchQuery) search();
	}, [searchQuery]);

	return <div className="results-container">
    {results.map((result: {
      id: string;
      title: string;
      url: string;
      duration: number;
      thumbnail: string;
    }) => (
      <ResultCard key={result.id} result={result} />
    ))}
  </div>;
}

export default React.memo(VerticalResults);
