import { exec } from "child_process";
import path from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

export class Downloader {
	public static async searchVideos(query: string): Promise<
		{
			id: string;
			title: string;
			url: string;
			duration: number;
			thumbnail: string;
		}[]
	> {
      // Obtener la ruta absoluta del archivo yt-dlp.exe en base al directorio actual
		const ytDlpPath = path.resolve(__dirname, "../../lib/yt-dlp.exe");

		const searchQuery = `${ytDlpPath} "ytsearch:${query}" --dump-json --default-search ytsearch --no-playlist --no-check-certificate --geo-bypass --flat-playlist --skip-download --quiet --ignore-errors`;

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
		fileName: string
	): Promise<void> {
		// Obtener la ruta absoluta del archivo yt-dlp.exe en base al directorio actual
		const ytDlpPath = path.resolve(__dirname, "../../lib/yt-dlp.exe");

		// Aseguramos que la ruta de descarga tenga una barra al final
		const outputPath = path.join(downloadFolder, `${fileName}.%(ext)s`);

		// Preparamos el comando yt-dlp
		const command = `${ytDlpPath} -f "bestvideo[ext=webm]+bestaudio[ext=webm]" -o "${outputPath}" ${url}`;

		try {
			// Ejecutamos el comando yt-dlp
			const { stdout, stderr } = await execAsync(command);

			if (stderr) {
				console.error("Error en la descarga:", stderr);
				return;
			}

			console.log("Descarga completada:", stdout);
		} catch (error) {
			console.error("Error al ejecutar yt-dlp:", error);
		}
	}

	public static async downloadAudio(
		url: string,
		downloadFolder: string,
		fileName: string
	): Promise<void> {
		// Obtener la ruta absoluta del archivo yt-dlp.exe en base al directorio actual
		const ytDlpPath = path.resolve(__dirname, "../../lib/yt-dlp.exe");

      // Aseguramos que la ruta de descarga tenga una barra al final
		const outputPath = path.join(downloadFolder, `${fileName}.%(ext)s`);

		// Preparamos el comando yt-dlp para descargar solo el audio (el mejor audio disponible)
		const command = `${ytDlpPath} -f "bestaudio[ext=webm]" -o "${outputPath}" ${url}`;

		try {
			// Ejecutamos el comando yt-dlp
			const { stdout, stderr } = await execAsync(command);

			if (stderr) {
				console.error("Error en la descarga del audio:", stderr);
				return;
			}

			console.log("Descarga de audio completada:", stdout);
		} catch (error) {
			console.error("Error al ejecutar yt-dlp para el audio:", error);
		}
	}
}
