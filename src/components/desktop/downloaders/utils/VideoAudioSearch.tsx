
function VideoAudioSearch({ searchQuery, setSearchQuery }: any) {
	const handleQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setSearchQuery(event.target.value);

      setTimeout(() => {
         // Search
      }, 500);
	};

	return (
		<div className="search-container">
			<input
				type="text"
				placeholder="Search"
				value={searchQuery}
				onChange={handleQueryChange}
			/>
		</div>
	);
}

export default VideoAudioSearch;
