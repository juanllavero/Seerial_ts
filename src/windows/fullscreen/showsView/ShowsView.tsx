import "../../../i18n";
import { RootState } from "@redux/store";
import { useDispatch, useSelector } from "react-redux";
import ShowsCard from "./ShowsCard";
import { useEffect } from "react";
import { selectSeries } from "@redux/slices/dataSlice";

function ShowsView() {
	const dispatch = useDispatch();
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);

	useEffect(() => {
		if (
			selectedLibrary &&
			selectedLibrary.series &&
			selectedLibrary.series.length > 0
		)
			dispatch(selectSeries(selectedLibrary.series[0]));
	}, [selectedLibrary]);

	return (
		<div className="shows-container">
			{selectedLibrary &&
				selectedLibrary.series.map((element) => (
					<ShowsCard element={element} key={element.id} />
				))}
		</div>
	);
}

export default ShowsView;
