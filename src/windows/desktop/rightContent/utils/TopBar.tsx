import {
	WindowCloseIcon,
	WindowMaxIcon,
	WindowMinIcon,
	WindowRestoreIcon,
} from "@components/utils/IconLibrary";
import { useSelector } from "react-redux";
import { RootState } from "redux/store";
import "./TopBar.scss";

/**
 * TopBar component renders the top bar of the application window.
 * It includes buttons to minimize, maximize/restore, and close the window.
 * The component uses Redux to determine if the window is currently maximized,
 * and displays the appropriate icon for the maximize/restore button.
 * @returns {JSX.Element} TopBar component
 */
function TopBar(): JSX.Element {
	const isMaximized = useSelector(
		(state: RootState) => state.windowState.isMaximized
	);

	return (
		<div className="top-bar">
			<div className="window-buttons-container">
				<button
					className="window-button minimize-button"
					onClick={() => window.electronAPI.minimizeWindow()}
				>
					<WindowMinIcon />
				</button>
				<button
					className="window-button maximize-button"
					onClick={() => window.electronAPI.maximizeWindow()}
				>
					{isMaximized ? <WindowRestoreIcon /> : <WindowMaxIcon />}
				</button>
				<button
					className="window-button close-button"
					onClick={() => window.electronAPI.closeWindow()}
				>
					<WindowCloseIcon />
				</button>
			</div>
		</div>
	);
}

export default TopBar;
