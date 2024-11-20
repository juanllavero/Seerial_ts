import { useTranslation } from "react-i18next";
import "./NoContent.scss";
import { Suspense } from "react";
import Loading from "@components/utils/Loading";

/**
 * Component shown when there are no libraries.
 * Shows a message to indicate the user to add libraries.
 */
function NoContent() {
	const { t } = useTranslation();

	return (
		<Suspense fallback={<Loading />}>
			<div className="no-libraries-container">
				<h2>{t("noLibraryFound")}</h2>
				<h4>{t("addLibraryMessage")}</h4>
			</div>
		</Suspense>
	);
}

export default NoContent;
