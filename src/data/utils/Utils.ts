import { AudioTrackData } from "@interfaces/AudioTrackData";
import { ChapterData } from "@interfaces/ChapterData";
import { EpisodeData } from "@interfaces/EpisodeData";
import { MediaInfoData } from "@interfaces/MediaInfoData";
import { SubtitleTrackData } from "@interfaces/SubtitleTrackData";
import { VideoTrackData } from "@interfaces/VideoTrackData";
import axios from "axios";
import { exec } from "child_process";
import { app } from "electron";
import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import * as fs from "fs";
import fsExtra from "fs-extra";
import { promisify } from "util";
import { Season } from "../objects/Season";
import { Episode } from "@objects/Episode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const execPromise = promisify(exec);

export class Utils {
	static videoExtensions = [
		".mp4",
		".mkv",
		".avi",
		".mov",
		".wmv",
		".flv",
		".mpeg",
		".m2ts",
	];
	static audioExtensions = [
		".mp3",
		".flac",
		".wav",
		".m4a",
		".ogg",
		".aac",
		".wma",
	];

	//#region MEDIA INFO
	public static async getOnlyRuntime(
		song: Episode,
		musicFile: string
	): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			ffmpeg.setFfprobePath(Utils.getInternalPath("lib/ffprobe.exe"));

			ffmpeg.ffprobe(musicFile, (err, data) => {
				if (err) {
					console.error("Error obtaining video metadata for music:", err);
					reject(err);
					return;
				}

				const format = data?.format;

				if (format && format.duration) {
					song.runtimeInSeconds = format.duration;
					song.runtime = song.runtimeInSeconds / 60;
					resolve(); // Indicar que se ha completado correctamente
				} else {
					console.warn(`Duration not found for file: ${musicFile}`);
					resolve(); // Resolver aunque no haya duración para continuar el flujo
				}
			});
		});
	}

	public static getMediaInfo(
		episode: EpisodeData | undefined
	): Promise<EpisodeData> | undefined {
		if (!episode) return undefined;

		const videoPath = episode.videoSrc;

		// Verifica si el archivo existe
		if (!videoPath) {
			console.error("Video file does not exist.");
			return undefined;
		}

		// Usa ffprobe para obtener la información del video
		return new Promise(async (resolve, reject) => {
			ffmpeg.setFfmpegPath(Utils.getInternalPath("lib/ffmpeg.exe"));
			ffmpeg.setFfprobePath(Utils.getInternalPath("lib/ffprobe.exe"));
			ffmpeg.ffprobe(videoPath, async (err, data) => {
				if (err) {
					console.error("Error obtaining video metadata:", err);
					return reject(err);
				}

				const format = data.format;
				const streams = data.streams;

				// Configura la información general del medio
				let fileSize = format.size ? format.size : 0;

				let sizeSufix = " GB";
				fileSize = fileSize / Math.pow(1024, 3);

				if (fileSize < 1) {
					fileSize = fileSize * Math.pow(1024, 1);
					sizeSufix = " MB";
				}

				const mediaInfo: MediaInfoData = {
					file: path.basename(videoPath),
					location: videoPath,
					bitrate: format.bit_rate
						? (format.bit_rate / Math.pow(10, 3)).toFixed(2) + " kbps"
						: "0",
					duration: format.duration
						? Utils.formatTime(format.duration)
						: "0",
					size: fileSize.toFixed(2) + sizeSufix,
					container: path
						.extname(videoPath)
						.replace(".", "")
						.toUpperCase(),
				};
				episode.mediaInfo = mediaInfo;

				// Establece la duración real del video
				if (format.duration) {
					episode.runtimeInSeconds = format.duration;
				}

				// Limpia las listas anteriores de pistas
				episode.videoTracks = [];
				episode.audioTracks = [];
				episode.subtitleTracks = [];

				// Bandera para detectar cuando empiezan los subtítulos
				let subtitleSectionStarted = false;

				streams.forEach((stream) => {
					const codecType = stream.codec_type;

					if (codecType === "subtitle") {
						subtitleSectionStarted = true;
					} else if (subtitleSectionStarted) {
						return; // Detiene el procesamiento cuando no hay más subtítulos
					}

					if (codecType === "video") {
						Utils.processVideoData(stream, episode);
					} else if (codecType === "audio") {
						Utils.processAudioData(stream, episode);
					} else if (codecType === "subtitle") {
						Utils.processSubtitleData(stream, episode);
					}
				});

				episode.chapters = await this.getChapters(episode);

				// Resuelve la Promesa devolviendo el episodio procesado
				resolve(episode);
			});
		});
	}

	// Procesa datos de video
	private static processVideoData(stream: any, episode: EpisodeData) {
		const videoTrack: VideoTrackData = {
			id: stream.index,
			codec: stream.codec_name?.toUpperCase() || "",
			displayTitle: "",
			selected: false,
			codecExt: "",
			bitrate: "",
			framerate: "",
			codedHeight: "",
			codedWidth: "",
			chromaLocation: "",
			colorSpace: "",
			aspectRatio: "",
			profile: "",
			refFrames: "",
			colorRange: "",
		};

		let resolution: string = "";
		let hdr: string = "";

		if (stream.codec_long_name) videoTrack.codecExt = stream.codec_long_name;

		if (stream.tags["BPS"])
			videoTrack.bitrate = Math.round(
				parseFloat(stream.tags["BPS"]) / Math.pow(10, 3)
			).toString();

		if (stream.avg_frame_rate) {
			const [numerator, denominator] = stream.avg_frame_rate
				.split("/")
				.map(Number);
			if (denominator && denominator !== 0) {
				videoTrack.framerate =
					(numerator / denominator).toFixed(3) + " fps";
			} else {
				videoTrack.framerate = numerator.toFixed(3) + " fps";
			}
		}

		videoTrack.codedWidth = stream.width ? stream.width : stream.codedWidth;
		videoTrack.codedHeight = stream.height
			? stream.height
			: stream.codedHeight;

		resolution = Utils.formatResolution(
			videoTrack.codedWidth,
			videoTrack.codedHeight
		);

		if (stream["chroma_location"])
			videoTrack.chromaLocation = stream["chroma_location"];

		if (stream["color_space"]) {
			if (stream["color_space"] == "bt2020nc") hdr = "HDR10";
			videoTrack.colorSpace = stream["color_space"];
		}

		if (stream["display_aspect_ratio"])
			videoTrack.aspectRatio = stream["display_aspect_ratio"];

		if (stream["profile"]) videoTrack.profile = stream["profile"];

		if (stream["refs"]) videoTrack.refFrames = stream["refs"];

		if (stream["color_range"]) videoTrack.colorRange = stream["color_range"];

		// Rellenar otros datos
		videoTrack.displayTitle = `${resolution} ${hdr} (${videoTrack.codec} ${videoTrack.profile})`;
		episode.videoTracks.push(videoTrack);
	}

	// Procesa datos de audio
	private static processAudioData(stream: any, episode: EpisodeData) {
		const audioTrack: AudioTrackData = {
			id: stream.index,
			codec: stream.codec_name?.toUpperCase() || "",
			displayTitle: "",
			language: "",
			languageTag: "",
			selected: false,
			codecExt: "",
			channels: "",
			channelLayout: "",
			bitrate: "",
			bitDepth: "",
			profile: "",
			samplingRate: "",
		};

		if (stream.codec_long_name) audioTrack.codecExt = stream.codec_long_name;

		if (stream.channels)
			audioTrack.channels = Utils.formatAudioChannels(stream.channels);

		if (stream["channel_layout"])
			audioTrack.channelLayout = stream["channel_layout"];

		if (stream.tags["BPS"])
			audioTrack.bitrate = Math.round(
				parseFloat(stream.tags["BPS"]) / Math.pow(10, 3)
			).toString();

		if (stream.tags["language"]) {
			audioTrack.languageTag = stream.tags["language"];

			const languageNames = new Intl.DisplayNames(["en"], {
				type: "language",
				languageDisplay: "standard",
			});
			const languageName = languageNames.of(audioTrack.languageTag);

			if (languageName) audioTrack.language = languageName;
		}

		if (stream["bits_per_raw_sample"] != "N/A")
			audioTrack.bitDepth = stream["bits_per_raw_sample"];

		if (stream["profile"]) {
			if (stream["profile"] == "DTS-HD MA") audioTrack.profile = "ma";
			else if (stream.profile == "LC") audioTrack.profile = "lc";
		}

		if (stream["sample_rate"])
			audioTrack.samplingRate = stream["sample_rate"] + " hz";

		let codecDisplayName: string = "";
		if (stream.profile && stream.profile == "DTS-HD MA")
			codecDisplayName = stream.profile;
		else codecDisplayName = stream.codec_name.toUpperCase();

		audioTrack.displayTitle = `${audioTrack.language} (${codecDisplayName} ${audioTrack.channels})`;
		episode.audioTracks.push(audioTrack);
	}

	// Procesa datos de subtítulos
	private static processSubtitleData(stream: any, episode: EpisodeData) {
		const subtitleTrack: SubtitleTrackData = {
			id: stream.index,
			codec: stream.codec_name?.toUpperCase() || "",
			displayTitle: "",
			language: "",
			languageTag: "",
			selected: false,
			codecExt: "",
			title: "",
		};

		let codecDisplayName: string = "";
		codecDisplayName = stream.codec_name.toUpperCase();

		if (codecDisplayName == "HDMV_PGS_SUBTITLE") codecDisplayName = "PGS";

		if (stream.codec_long_name) {
			subtitleTrack.codecExt = stream.codec_long_name;
		}

		if (stream.tags["language"]) {
			subtitleTrack.languageTag = stream.tags["language"];
			subtitleTrack.language = stream.language;
		}

		if (stream.tags["title"]) {
			subtitleTrack.title = stream.tags["title"];
		}

		subtitleTrack.displayTitle = `${subtitleTrack.title} (${subtitleTrack.language} ${codecDisplayName})`;
		episode.subtitleTracks.push(subtitleTrack);
	}

	// Formato de la resolución del video
	private static formatResolution(width: string, height: string): string {
		const widthNum = parseInt(width, 10); // Convertir a número
		switch (widthNum) {
			case 7680:
				return "8K";
			case 3840:
				return "4K";
			case 2560:
				return "QHD";
			case 1920:
				return "1080p";
			case 1280:
				return "720p";
			case 854:
				return "480p";
			case 640:
				return "360p";
			default:
				return `${height}p`;
		}
	}

	// Formato de los canales de audio
	private static formatAudioChannels(channels: number): string {
		switch (channels) {
			case 1:
				return "MONO";
			case 2:
				return "STEREO";
			case 6:
				return "5.1";
			case 8:
				return "7.1";
			default:
				return `${channels} channels`;
		}
	}

	public static convertTime(milliseconds: number): string {
		const seconds = milliseconds / 1000;
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = Math.floor(seconds % 60);

		return `${h.toString().padStart(2, "0")}:${m
			.toString()
			.padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
	}

	public static formatTime(time: number): string {
		const h = Math.floor(time / 3600);
		const m = Math.floor((time % 3600) / 60);
		const s = Math.floor(time % 60);

		if (h > 0) {
			return `${h.toString().padStart(2, "0")}:${m
				.toString()
				.padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
		}

		return `${m.toString().padStart(2, "0")}:${s
			.toString()
			.padStart(2, "0")}`;
	}

	public static async getChapters(
		episode: EpisodeData
	): Promise<ChapterData[]> {
		const chaptersArray: ChapterData[] = [];

		try {
			const { stdout } = await execPromise(
				`ffprobe -v error -show_entries chapter -of json -i "${episode.videoSrc}"`
			);
			const metadata = JSON.parse(stdout);

			if (metadata.chapters && metadata.chapters.length > 0) {
				metadata.chapters.forEach((chapter: any) => {
					const chapterData: ChapterData = {
						title: chapter.title || "Sin título",
						time: chapter.start_time || 0,
						displayTime: Utils.formatTime(chapter.start_time || 0),
						thumbnailSrc: "",
					};

					chaptersArray.push(chapterData);
				});
			} else {
				return chaptersArray;
			}
		} catch (error) {
			console.error("Error al obtener los capítulos:", error);
		}

		return chaptersArray;
	}
	//#endregion

	public static getExternalPath(relativePath: string): string {
		const basePath = app.isPackaged
			? path.dirname(app.getPath("exe"))
			: app.getAppPath();
		return path.join(basePath, relativePath);
	}

	public static getInternalPath(relativePath: string): string {
		const filePath = app.isPackaged
			? path.join(process.resourcesPath, relativePath) // Build app
			: path.join(__dirname, "../src/", relativePath); // In development
		return filePath;
	}

	public static downloadImage = async (url: string, filePath: string) => {
		try {
			const response = await axios({
				url,
				method: "GET",
				responseType: "stream",
			});

			return new Promise<void>((resolve, reject) => {
				const writer = fs.createWriteStream(filePath);
				response.data.pipe(writer);
				writer.on("finish", resolve);
				writer.on("error", reject);
			});
		} catch (error: any) {
			console.error(`Error downloading image: ${error.message}`);
		}
	};

	public static getFileName(filePath: string) {
		const fileNameWithExtension = filePath.split(/[/\\]/).pop() || "";
		const fileName =
			fileNameWithExtension.split(".").slice(0, -1).join(".") ||
			fileNameWithExtension;
		return fileName;
	}

	public static isFolder = async (folderPath: string): Promise<boolean> => {
		try {
			const stats = await fs.promises.stat(folderPath);
			return stats.isDirectory();
		} catch (error) {
			console.error(
				`isFolder: Error al acceder a la ruta ${folderPath}:`,
				error
			);
			return false;
		}
	};

	public static getFilesInFolder = async (folderPath: string) => {
		try {
			const stats = await fs.promises.stat(folderPath);

			if (!stats.isDirectory()) {
				return [];
			}

			return await fs.promises.readdir(folderPath, { withFileTypes: true });
		} catch (error) {
			console.error(
				`getFilesInFolder: Error al acceder a la ruta ${folderPath}:`,
				error
			);
			return [];
		}
	};

	public static getValidVideoFiles = async (folderPath: string) => {
		const videoFiles: string[] = [];
		const filesAndFolders = await this.getFilesInFolder(folderPath);

		// Get video files in folder dir and subfolders (only 1 step of depth)
		for (const fileOrFolder of filesAndFolders) {
			const fullPath = path.join(folderPath, fileOrFolder.name);

			if (fileOrFolder.isFile() && this.isVideoFile(fullPath)) {
				videoFiles.push(fullPath);
			} else if (fileOrFolder.isDirectory()) {
				const subFiles = await fs.promises.readdir(fullPath);
				for (const subFile of subFiles) {
					const subFilePath = path.join(fullPath, subFile);
					if (
						fs.lstatSync(subFilePath).isFile() &&
						this.isVideoFile(subFilePath)
					) {
						videoFiles.push(subFilePath);
					}
				}
			}
		}

		return videoFiles;
	};

	public static isVideoFile(filePath: string): boolean {
		const ext = path.extname(filePath).toLowerCase();
		return this.videoExtensions.includes(ext);
	}

	public static isAudioFile(filePath: string): boolean {
		const ext = path.extname(filePath).toLowerCase();
		return this.audioExtensions.includes(ext);
	}

	public static fileExists(filePath: string): boolean {
		return fs.existsSync(filePath);
	}

	public static getMusicFiles = async (
		folderPath: string
	): Promise<string[]> => {
		const musicFiles: string[] = [];
		const searchDepth: number = 4;

		// Recursive function to explore subfolders
		const exploreDirectory = async (
			currentPath: string,
			currentDepth: number
		): Promise<void> => {
			const entries = await this.getFilesInFolder(currentPath);

			for (const entry of entries) {
				const entryPath = path.join(currentPath, entry.name);

				if (entry.isFile() && this.isAudioFile(entryPath)) {
					musicFiles.push(entryPath);
				} else if (entry.isDirectory() && currentDepth < searchDepth) {
					await exploreDirectory(entryPath, currentDepth + 1);
				}
			}
		};

		await exploreDirectory(folderPath, 0);

		return musicFiles;
	};

	/**
	 * Function to search for an image in a folder
	 * @param folderPath string that represents the folder path
	 * @returns string representing the image path if found or null if not
	 */
	public static findImageInFolder = async (
		folderPath: string
	): Promise<string | null> => {
		const files = await fs.promises.readdir(folderPath);
		const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];

		for (const file of files) {
			const fileExt = path.extname(file).toLowerCase();
			if (
				imageExtensions.includes(fileExt) &&
				file.toLowerCase().includes("cover")
			) {
				return path.join(folderPath, file);
			}
		}

		return null;
	};

	//#region BACKGROUND PROCESSING
	public static async saveBackground(season: Season, imageToCopy: string) {
		const baseDir = `resources/img/backgrounds/${season.getId()}/`;
		await fsExtra.ensureDir(baseDir);

		try {
			// Copy the original image
			await fsExtra.copy(imageToCopy, path.join(baseDir, "background.jpg"));
			season.setBackgroundSrc(path.join(baseDir, "background.jpg"));

			// Process blur and save
			this.processBlurAndSave(
				this.getExternalPath(season.getBackgroundSrc()),
				path.join(baseDir, "fullBlur.jpg")
			);
		} catch (e) {
			console.error("saveBackground: error processing image with blur");
		}
	}

	public static async saveBackgroundNoSeason(
		seasonId: string,
		imageToCopy: string
	) {
		const baseDir = `resources/img/backgrounds/${seasonId}/`;
		await fsExtra.ensureDir(baseDir);

		try {
			// Copy the original image
			await fsExtra.copy(imageToCopy, path.join(baseDir, "background.jpg"));

			// Process blur and save
			await this.processBlurAndSave(
				this.getExternalPath(baseDir + "background.jpg"),
				path.join(baseDir, "fullBlur.jpg")
			);
		} catch (e) {
			console.error("saveBackground: error processing image with blur");
		}
	}

	public static processBlurAndSave = async (
		imagePath: string,
		outputPath: string
	) => {
		return new Promise<void>(async (resolve, reject) => {
			let imageMagickPath = await this.getInternalPath("lib/magick.exe");
			// Comando de ImageMagick usando la versión portable, añadiendo compresión
			const command = `"${imageMagickPath}" "${imagePath}" -blur 0x${25} -quality ${75} "${outputPath}"`;

			exec(command, (error, _stdout, stderr) => {
				if (error) {
					console.error(
						`Error al aplicar blur a la imagen: ${error.message}`
					);
					reject(error);
				} else if (stderr) {
					console.error(`stderr: ${stderr}`);
					reject();
				} else {
					resolve();
				}
			});
		});
	};
	//#endregion
}
