import { EpisodeData } from "@interfaces/EpisodeData";
import { LibraryData } from "@interfaces/LibraryData";
import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";
import { ipcRenderer, contextBridge } from "electron";

// Exponer la API de Electron a través del contexto seguro
contextBridge.exposeInMainWorld("electronAPI", {
	translate: (key: String) => ipcRenderer.invoke("translate", key),
	setFullscreenControls: () => ipcRenderer.send("fullscreen-controls"),
	minimizeWindow: () => ipcRenderer.send("minimize-window"),
	maximizeWindow: () => ipcRenderer.send("maximize-window"),
	closeWindow: () => ipcRenderer.send("close-window"),
	scanFiles: (library: LibraryData) =>
		ipcRenderer.invoke("scan-files", library),
	updateLibrary: (library: LibraryData) =>
		ipcRenderer.send("update-library", library),
	getLibraryData: () => ipcRenderer.invoke("get-library-data"),
	saveLibraryData: (newData: any) =>
		ipcRenderer.invoke("save-library-data", newData),
	startMPV: (
		library: LibraryData,
		series: SeriesData,
		season: SeasonData,
		episode: EpisodeData
	) => ipcRenderer.send("play-video", library, series, season, episode),
	stopMPV: () => ipcRenderer.send("stop-video"),
	sendCommand: (args: string[] = []) => ipcRenderer.send("mpv-command", args),
	togglePause: () => ipcRenderer.send("toggle-pause"),
	onWindowStateChange: (callback: (state: string) => void) => {
		ipcRenderer.on("window-state-change", (_, state) => callback(state));
	},
	showControls: () => ipcRenderer.send("show-controls"),
	hideControls: () => ipcRenderer.send("hide-controls"),
	searchVideos: (query: string, numberOfResults: number) =>
		ipcRenderer.invoke("search-yt", query, numberOfResults),
	downloadMedia: ({
		url,
		downloadFolder,
		fileName,
		isVideo,
	}: {
		url: string;
		downloadFolder: string;
		fileName: string;
		isVideo: boolean;
	}) =>
		ipcRenderer.invoke("start-download", {
			url,
			downloadFolder,
			fileName,
			isVideo,
		}),
	getFiles: (dirPath: string) => ipcRenderer.invoke("get-files", dirPath),
	getExternalPath: (relativePath: string) =>
		ipcRenderer.invoke("get-external-path", relativePath),
	openFolderDialog: () => ipcRenderer.invoke("dialog:openFolder"),
	getImages: (dirPath: string) => ipcRenderer.invoke("get-images", dirPath),
	getMediaInfo: (episode: EpisodeData) =>
		ipcRenderer.invoke("get-video-data", episode),
	deleteLibrary: (library: LibraryData) =>
		ipcRenderer.send("delete-library", library),
	onUpdateLibraries: (
		callback: (event: any, libraries: LibraryData[]) => void
	) => {
		ipcRenderer.on("update-libraries", callback);
	},
});

// Mantén las otras exposiciones si es necesario
contextBridge.exposeInMainWorld("ipcRenderer", {
	on(...args: Parameters<typeof ipcRenderer.on>) {
		const [channel, listener] = args;
		return ipcRenderer.on(channel, (event, ...args) =>
			listener(event, ...args)
		);
	},
	off(...args: Parameters<typeof ipcRenderer.off>) {
		const [channel, ...omit] = args;
		return ipcRenderer.off(channel, ...omit);
	},
	send(...args: Parameters<typeof ipcRenderer.send>) {
		const [channel, ...omit] = args;
		return ipcRenderer.send(channel, ...omit);
	},
	invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
		const [channel, ...omit] = args;
		return ipcRenderer.invoke(channel, ...omit);
	},
});
