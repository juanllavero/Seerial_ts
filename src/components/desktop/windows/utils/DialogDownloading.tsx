function DialogDownloading({
	downloadingContent,
}: {
	downloadingContent: boolean;
}) {
	return (
		<div className={`${downloadingContent ? " dialog-downloading" : ""}`}>
			<div className="loading-circle"></div>
		</div>
	);
}

export default DialogDownloading;
