import { useDownloadContext } from "context/download.context";
import { ProgressBar } from "primereact/progressbar";
import { useTranslation } from "react-i18next";

function ProgressPopUp() {
	const { t } = useTranslation();
	const { downloadedPercentage } = useDownloadContext();

	return (
		<div className="progress-container">
			<div className="progress-window">
				<h3>{t("downloading")}...</h3>
				<ProgressBar
					value={downloadedPercentage}
					id="progress-bar"
				></ProgressBar>
			</div>
		</div>
	);
}

export default ProgressPopUp;
