import {
	FullscreenSections,
	RightPanelSections,
	WindowSections,
} from "@data/enums/Sections";
import { createContext, useState, ReactNode } from "react";

interface SectionContextProps {
	currentRightSection: RightPanelSections;
	setCurrentRightSection: React.Dispatch<
		React.SetStateAction<RightPanelSections>
	>;
	currentWindowSection: WindowSections;
	setCurrentWindowSection: React.Dispatch<
		React.SetStateAction<WindowSections>
	>;
	currentFullscreenSection: FullscreenSections;
	setCurrentFullscreenSection: React.Dispatch<
		React.SetStateAction<FullscreenSections>
	>;
}

const SectionContext = createContext<SectionContextProps>({
	currentRightSection: RightPanelSections.Home,
	setCurrentRightSection: () => {},
	currentWindowSection: WindowSections.General,
	setCurrentWindowSection: () => {},
	currentFullscreenSection: FullscreenSections.Home,
	setCurrentFullscreenSection: () => {},
});

/**
 * SectionProvider is a context provider component that manages and provides
 * the current sections for the right panel, window, and fullscreen views.
 * It maintains the state for each section and provides functions to update them.
 * This component should wrap any part of the application that requires access
 * to the section-related states.
 *
 * @param {ReactNode} children - The child components that will have access to the section context.
 * @returns {JSX.Element} A provider component that supplies the section context to its descendants.
 */
const SectionProvider = ({ children }: { children: ReactNode }) => {
	const [currentRightSection, setCurrentRightSection] = useState(
		RightPanelSections.Home
	);
	const [currentWindowSection, setCurrentWindowSection] = useState(
		WindowSections.General
	);
	const [currentFullscreenSection, setCurrentFullscreenSection] = useState(
		FullscreenSections.Home
	);

	return (
		<SectionContext.Provider
			value={{
				currentRightSection,
				setCurrentRightSection,
				currentWindowSection,
				setCurrentWindowSection,
				currentFullscreenSection,
				setCurrentFullscreenSection,
			}}
		>
			{children}
		</SectionContext.Provider>
	);
};

export { SectionProvider, SectionContext };
