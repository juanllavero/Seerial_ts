import { extractColors } from 'extract-colors';

export class ReactUtils {
    static colors: string[] = [];

    public static extractColorsFromImage = async (imgSrc: string) => {
        try {
            const options = {
                pixels: 50000, // Reducimos el número de píxeles a analizar para centrarnos más en colores prominentes
                distance: 0.15, // Reducimos la distancia entre colores para obtener menos variedad
                saturationDistance: 0.5, // Reducimos la distancia de saturación para colores menos vibrantes
                lightnessDistance: 0.12, // Reducimos la distancia de brillo para obtener colores más oscuros
                hueDistance: 0.05, // Reducimos la distancia del matiz para que los colores estén más cercanos entre sí
            };
    
            const extractedColors = await extractColors(imgSrc, options);
            
            const dominantColors = extractedColors.slice(0, 5).map(color => color.hex);
            return dominantColors;
        } catch (error) {
            console.error("Error al extraer colores:", error);
            return undefined;
        }
    };

    public static getDominantColors = async (imgSrc: string) => {
        const dominantColors = await this.extractColorsFromImage(imgSrc);
            
        if (dominantColors)
            this.colors = dominantColors;
    }

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

    public static formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    public static formatTimeForView = (time: number) => {
        const hours = Math.floor(time / 60);
        const minutes = Math.floor(time % 60);

        if (hours > 0){
            if (minutes > 0) {
                return `${hours}h ${minutes}m`
            } else {
                return `${hours}h`
            }
        } else {
            return `${minutes}m`
        }
    }
}