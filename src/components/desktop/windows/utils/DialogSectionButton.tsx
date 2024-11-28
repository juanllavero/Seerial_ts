import { WindowSections } from "@data/enums/Sections";
import { changeMenuSection } from "@redux/slices/menuSectionsSlice";
import { RootState } from "@redux/store";
import { useDispatch, useSelector } from "react-redux";

function DialogSectionButton({
	title,
	section,
}: {
	title: string;
	section: WindowSections;
}) {
	const dispatch = useDispatch();
	const menuSection = useSelector(
		(state: RootState) => state.sectionState.menuSection
	);

	return (
		<button
			className={`desktop-dialog-side-btn ${
				menuSection === section ? " desktop-dialog-side-btn-active" : ""
			}`}
			onClick={() => dispatch(changeMenuSection(section))}
		>
			{title}
		</button>
	);
}

export default DialogSectionButton;
