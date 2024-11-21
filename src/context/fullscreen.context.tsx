import { SeriesData } from "@interfaces/SeriesData";
import { createContext, useState, ReactNode, useContext } from "react";

export interface FullscreenContextProps {
	useImageAsBackground: boolean;
	homeBackgroundLoaded: boolean;
	collectionsBackgroundLoaded: boolean;
	detailsImageLoaded: boolean;
	setUseImageAsBackground: (value: boolean) => void;
	setHomeBackgroundLoaded: (value: boolean) => void;
	setCollectionsBackgroundLoaded: (value: boolean) => void;
	setDetailsImageLoaded: (value: boolean) => void;
	currentShowForBackground: SeriesData | undefined;
	setCurrentShowForBackground: (value: SeriesData | undefined) => void;
	inSongsView: boolean;
	setInSongsView: (value: boolean) => void;
}

export const FullscreenContext = createContext<
	FullscreenContextProps | undefined
>(undefined);

/**
 * A provider component for the FullscreenContext that supplies loading states
 * for background images and the details image.
 *
 * @param {ReactNode} children - The child components that will have access to
 * the context.
 * @returns {JSX.Element} A provider component that supplies the context to
 * its descendants.
 */
export const FullscreenProvider = ({
	children,
}: {
	children: ReactNode;
}): JSX.Element => {
	const [useImageAsBackground, setUseImageAsBackground] = useState(true);
	const [homeBackgroundLoaded, setHomeBackgroundLoaded] = useState(false);
	const [collectionsBackgroundLoaded, setCollectionsBackgroundLoaded] =
		useState(false);
	const [detailsImageLoaded, setDetailsImageLoaded] = useState(false);

	const [currentShowForBackground, setCurrentShowForBackground] = useState<
		SeriesData | undefined
	>();

	const [inSongsView, setInSongsView] = useState<boolean>(false);

	return (
		<FullscreenContext.Provider
			value={{
				useImageAsBackground,
				setUseImageAsBackground,
				homeBackgroundLoaded,
				setHomeBackgroundLoaded,
				collectionsBackgroundLoaded,
				setCollectionsBackgroundLoaded,
				detailsImageLoaded,
				setDetailsImageLoaded,
				currentShowForBackground,
				setCurrentShowForBackground,
				inSongsView,
				setInSongsView,
			}}
		>
			{children}
		</FullscreenContext.Provider>
	);
};

// Custom hook to use the FullscreenContext
export const useFullscreenContext = (): FullscreenContextProps => {
	const context = useContext(FullscreenContext);
	if (!context) {
		throw new Error(
			"useFullscreenContext must be used within a FullscreenProvider"
		);
	}
	return context;
};
