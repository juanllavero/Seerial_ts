import { MediaSearchResult } from "@interfaces/SearchResults";
import { ipcRenderer } from "electron";
import React, { useContext, useEffect } from "react";

interface DownloadContextProps {
   showWindow: boolean;
   setShowWindow: (showWindow: boolean) => void;
	searchQuery: string;
   results: MediaSearchResult[];
   setResults: (results: MediaSearchResult[]) => void;
	videoContent: boolean;
	selectedUrl: string;
	playContent: boolean;
	downloadVideo: (elementId: string, url: string) => void;
	downloadAudio: (elementId: string, url: string) => void;
	setSearchQuery: (query: string) => void;
	setVideoContent: (downloadVideos: boolean) => void;
	setSelectedUrl: (url: string) => void;
	setPlayContent: (playContent: boolean) => void;
	downloadingContent: boolean;
	setDownloadingContent: (downloadingContent: boolean) => void;
	downloadedPercentage: number;
	setDownloadedPercentage: (downloadedPercentage: number) => void;
}

export const DownloadContext = React.createContext<
	DownloadContextProps | undefined
>(undefined);

export const DownloadProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
   const [showWindow, setShowWindow] = React.useState<boolean>(false);
	const [searchQuery, setSearchQuery] = React.useState<string>("");
   const [results, setResults] = React.useState<MediaSearchResult[]>([]);
	const [videoContent, setVideoContent] = React.useState<boolean>(false);
	const [selectedUrl, setSelectedUrl] = React.useState<string>("");
	const [playContent, setPlayContent] = React.useState<boolean>(false);
	const [downloadingContent, setDownloadingContent] =
		React.useState<boolean>(false);
	const [downloadedPercentage, setDownloadedPercentage] =
		React.useState<number>(0);

	const search = async () => {
		const searchResults = await window.electronAPI.searchVideos(
			searchQuery,
			20
		);
		setResults(searchResults);
	};

	useEffect(() => {
		window.ipcRenderer.on("download-progress", (_event, progress) => {
			setDownloadedPercentage(progress);
		});
		
		window.ipcRenderer.on("download-complete", (_event, _fileName) => {
			setDownloadingContent(false);
			setDownloadedPercentage(0);
			console.log(_fileName);
		});
		
		window.ipcRenderer.on("download-error", (_event, _error) => {
			setDownloadingContent(false);
			setDownloadedPercentage(0);
		});
	}, []);

	useEffect(() => {
      if (searchQuery) search();
   }, [searchQuery]);

	const downloadVideo = (elementId: string, url: string) => {
		window.electronAPI.downloadMedia({
			url: url,
			downloadFolder: "resources/video/",
			fileName: elementId,
			isVideo: true,
		})
	};

	const downloadAudio = (elementId: string, url: string) => {
		window.electronAPI.downloadMedia({
			url: url,
			downloadFolder: "resources/music/",
			fileName: elementId,
			isVideo: false,
		})
	};

	return (
		<DownloadContext.Provider
			value={{
            showWindow,
            setShowWindow,
            results,
            setResults,
				searchQuery,
				setSearchQuery,
				videoContent,
				setVideoContent,
				selectedUrl,
				setSelectedUrl,
				playContent,
				setPlayContent,
				downloadVideo,
				downloadAudio,
				downloadingContent,
				setDownloadingContent,
				downloadedPercentage,
				setDownloadedPercentage,
			}}
		>
			{children}
		</DownloadContext.Provider>
	);
};

// Custom hook to use the DownloadContext
export const useDownloadContext = (): DownloadContextProps => {
	const context = useContext(DownloadContext);
	if (!context) {
		throw new Error(
			"useDownloadContext must be used within a DownloadProvider"
		);
	}
	return context;
};
