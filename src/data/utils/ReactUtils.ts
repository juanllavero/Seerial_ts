import { LibraryData } from "@interfaces/LibraryData";
import { SeasonData } from "@interfaces/SeasonData";
import { SeriesData } from "@interfaces/SeriesData";
import { extractColors } from "extract-colors";

export class ReactUtils {
	static colors: string[] = [];

	public static extractColorsFromImage = async (imgSrc: string) => {
		try {
			const options = {
				pixels: 50000, // Reduce the number of pixels to analyze to focus on prominent colors
				distance: 0.15, // Reduce color distance to get less variety
				saturationDistance: 0.5, // Reduce saturation distance to get less vibrant colors
				lightnessDistance: 0.12, // Reduce lightness distance to get darker colors
				hueDistance: 0.05, // Reduce hue distance to get colors closer to each other
			};

			const extractedColors = await extractColors(imgSrc, options);

			const dominantColors = extractedColors
				.slice(0, 5)
				.map((color) => color.hex);
			return dominantColors;
		} catch (error) {
			console.error("Error al extraer colores:", error);
			return undefined;
		}
	};

	public static getDominantColors = async (imgSrc: string) => {
		const dominantColors = await this.extractColorsFromImage(imgSrc);

		if (dominantColors) this.colors = dominantColors;
	};

	public static getGradientBackground = () => {
		if (this.colors.length >= 4) {
			//return `linear-gradient(to top right, ${this.colors.join(", ")})`;
			//return `linear-gradient(to bottom, ${this.colors[0]} 0%, ${this.colors[1]} 100%)`;
			return `radial-gradient(circle farthest-side at 0% 100%, ${this.colors[1]} 0%, rgba(48, 66, 66, 0) 100%),
                radial-gradient(circle farthest-side at 100% 100%, ${this.colors[0]} 0%, rgba(63, 77, 69, 0) 100%),
                radial-gradient(circle farthest-side at 100% 0%, ${this.colors[2]} 0%, rgba(33, 36, 33, 0) 100%),
                radial-gradient(circle farthest-side at 0% 0%, ${this.colors[3]} 0%, rgba(65, 77, 66, 0) 100%),
                black
                `;
		}
		return "none";
	};

	public static generateGradient = (
		collection: SeriesData | null,
		album: SeasonData | null
	) => {
		if (collection && !album) {
			if (collection.coverSrc !== "") {
				ReactUtils.getDominantColors(collection.coverSrc);
			} else {
				ReactUtils.getDominantColors("./src/resources/img/songDefault.png");
			}
		} else if (collection && album) {
			if (album.coverSrc !== "") {
				ReactUtils.getDominantColors(album.coverSrc);
			} else if (collection.coverSrc !== "") {
				ReactUtils.getDominantColors(collection.coverSrc);
			} else {
				ReactUtils.getDominantColors("./src/resources/img/songDefault.png");
			}
		}
	};

	public static formatTime = (time: number) => {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	};

	public static formatTimeForView = (time: number) => {
		const hours = Math.floor(time / 60);
		const minutes = Math.floor(time % 60);

		if (hours > 0) {
			if (minutes > 0) {
				return `${hours}h ${minutes}m`;
			} else {
				return `${hours}h`;
			}
		} else {
			return `${minutes}m`;
		}
	};

	//#region SCROLL
	static scrollToCenter = (
		scrollElement: HTMLElement,
		scrollOffset: number,
		duration: number,
		isVertical: boolean
	) => {
		const start = isVertical
			? scrollElement.scrollTop
			: scrollElement.scrollLeft;
		const startTime = performance.now();

		const animateScroll = (currentTime: number) => {
			const timeElapsed = currentTime - startTime;
			const progress = Math.min(timeElapsed / duration, 1);

			if (isVertical) {
				scrollElement.scrollTop = start + scrollOffset * progress; // Scroll vertical
			} else {
				scrollElement.scrollLeft = start + scrollOffset * progress; // Scroll horizontal
			}

			if (timeElapsed < duration) {
				requestAnimationFrame(animateScroll);
			}
		};

		requestAnimationFrame(animateScroll);
	};

	public static handleScrollElementClick = (
		index: number,
		listRef: React.RefObject<HTMLDivElement>,
		isVertical: boolean
	) => {
		const elementButton = listRef.current?.children[index] as HTMLElement;
		if (elementButton && listRef.current) {
			const listRect = listRef.current.getBoundingClientRect();
			const buttonRect = elementButton.getBoundingClientRect();

			const buttonCenter = isVertical
				? buttonRect.top + buttonRect.height / 2
				: buttonRect.left + buttonRect.width / 2;

			const listCenter = isVertical
				? listRect.top + listRect.height / 2
				: listRect.left + listRect.width / 2;

			if (buttonCenter !== listCenter) {
				const scrollOffset = buttonCenter - listCenter;
				ReactUtils.scrollToCenter(
					listRef.current,
					scrollOffset,
					300,
					isVertical
				); // 300ms
			}
		}
	};
	//#endregion

	/**
	 * This method saves the provided libraries data in a JSON file.
	 * @param newData - Array of LibraryData to be saved.
	 */
	public static saveLibraries = (newData: LibraryData[]) => {
		if (newData.length === 0) return;

		//@ts-ignore
		window.electronAPI.saveLibraryData(newData).then((success: boolean) => {
			if (!success) {
				console.error("Error saving data");
			}
		});
	};

	/**
	 * This method is used to delay the execution of a function by a certain amount of milliseconds.
	 * @param ms - Number of milliseconds to delay
	 * @returns
	 */
	public static delay = (ms: number) =>
		new Promise((resolve) => setTimeout(resolve, ms));
}
