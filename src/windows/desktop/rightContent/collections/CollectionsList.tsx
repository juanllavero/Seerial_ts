import { SeriesData } from "@interfaces/SeriesData";
import { RootState } from "@redux/store";
import { useSelector } from "react-redux";
import Card from "../Card";
import "./CollectionsList.scss";
import { Suspense } from "react";
import Loading from "@components/utils/Loading";

/**
 * A component that displays a list of series.
 *
 * Utilizes Redux to access the selected library and series from the global state.
 * It renders a series container with a list of series
 * from the selected library, each represented by a Card component.
 *
 * @returns A JSX element representing a series list.
 */
function CollectionsList() {
	const selectedLibrary = useSelector(
		(state: RootState) => state.data.selectedLibrary
	);

	return (
		<Suspense fallback={<Loading />}>
			<div className="collection-container scroll" id="scroll">
				{selectedLibrary &&
					selectedLibrary.series.map((show: SeriesData) => (
						<Card key={show.id} show={show} type="default" />
					))}
			</div>
		</Suspense>
	);
}

export default CollectionsList;
