import { MediaSearchResult } from "@interfaces/SearchResults";
import { exec, spawn } from "child_process";
import path from "path";
import { promisify } from "util";
import { Utils } from "./Utils";

const execAsync = promisify(exec);

export class Downloader {
	public static async searchVideos(
		query: string,
		numberOfResults: number
	): Promise<MediaSearchResult[]> {
		// Get the absolute path of yt-dlp.exe based on the current directory
		const ytDlpPath = Utils.getInternalPath("lib/yt-dlp.exe");

		const searchQuery = `${ytDlpPath} "ytsearch${
			numberOfResults > 0 ? numberOfResults : 1
		}:${query}" --dump-json --default-search ytsearch --no-playlist --no-check-certificate --geo-bypass --flat-playlist --skip-download --quiet --ignore-errors`;

		try {
			const { stdout } = await execAsync(searchQuery);

			if (!stdout) return [];

			// JSON parse
			const entries = stdout
				.split("\n")
				.filter((line) => line.trim())
				.map((line) => JSON.parse(line));

			return entries.map((entry: any) => ({
				id: entry.id,
				title: entry.title,
				url: entry.url,
				duration: entry.duration,
				thumbnail:
					entry.thumbnails && entry.thumbnails.length > 0
						? entry.thumbnails[0].url
						: "",
			}));
		} catch (error) {
			console.error("Error executing yt-dlp:", error);
			return [];
		}
	}

	public static async downloadVideo(
		url: string,
		downloadFolder: string,
		fileName: string,
		win: Electron.BrowserWindow
	): Promise<void> {
		// Get the absolute path of yt-dlp.exe based on the current directory
		const ytDlpPath = Utils.getInternalPath("lib/yt-dlp.exe");

		const folder = Utils.getExternalPath(downloadFolder);

		// Make sure the download path has a trailing slash
		const outputPath = path.join(folder, `${fileName}.webm`);

		// Prepare yt-dlp command
		const command = `${ytDlpPath} -f "bestvideo[ext=webm]+bestaudio[ext=webm]" -o "${outputPath}" ${url} -q --progress --force-overwrite`;

		this.downloadContent(command, win, fileName);
	}

	public static async downloadAudio(
		url: string,
		downloadFolder: string,
		fileName: string,
		win: Electron.BrowserWindow
	): Promise<void> {
		// Get the absolute path of yt-dlp.exe based on the current directory
		const ytDlpPath = Utils.getInternalPath("lib/yt-dlp.exe");

		// Make sure the download path has a trailing slash
		const outputPath = path.join(downloadFolder, `${fileName}.opus`);

		// Prepare the yt-dlp command to download only the audio (the best audio available)
		const command = `${ytDlpPath} -f "bestaudio[ext=webm]" -o "${outputPath}" ${url} -q --progress --force-overwrite`;

		this.downloadContent(command, win, fileName);
	}

	private static async downloadContent(command: string, win: Electron.BrowserWindow, fileName: string) {
		try {
			const process = spawn(command, {
				shell: true,
			});

			process.stdout.on("data", (data: Buffer) => {
				const output = data.toString();

				// Parse progress percentage from yt-dlp output
				const match = output.match(/(\d+(\.\d+)?)%/);
				if (match) {
					const progress = parseFloat(match[1]);

					// Send progress to the renderer process
					win.webContents.send("download-progress", progress);
				}
			});

			process.stderr.on("data", (data: Buffer) => {
				console.error("Error:", data.toString());
			});

			process.on("close", (code: number) => {
				if (code === 0) {
					win.webContents.send("media-download-complete", fileName);
				} else {
					win.webContents.send("media-download-error", code);
				}
			});
		} catch (error) {
			console.error("Error executing yt-dlp:", error);
		}
	}
}
