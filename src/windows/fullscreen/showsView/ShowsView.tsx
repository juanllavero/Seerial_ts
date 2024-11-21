import "../../../i18n";
import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import ShowsCard from "./ShowsCard";

function ShowsView() {
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);

	return (
		<div className="shows-container">
			{selectedLibrary &&
				selectedLibrary.series.map((element) => (
					<ShowsCard element={element} key={element.id}/>
				))}
		</div>
	);
}

export default ShowsView;
