import { useTranslation } from "react-i18next";

function DialogFooter({
	downloadingContent,
	handleSavingChanges,
	action,
}: {
	downloadingContent: boolean;
	handleSavingChanges: () => void;
	action: () => void;
}) {
	const { t } = useTranslation();

	return (
		<section className="dialog-bottom">
			<button
				className={`desktop-dialog-btn ${
					downloadingContent ? "disabled" : ""
				}`}
				onClick={() => {
					if (!downloadingContent) {
						action();
					}
				}}
			>
				{t("cancelButton")}
			</button>
			<button
				className={`btn-app-color ${downloadingContent ? "disabled" : ""}`}
				onClick={() => {
					if (!downloadingContent) {
						handleSavingChanges();
					}
				}}
			>
				{t("saveButton")}
			</button>
		</section>
	);
}

export default DialogFooter;
