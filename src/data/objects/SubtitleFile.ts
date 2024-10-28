type SubtitleEntry = {
    startTime: number; // Tiempo de inicio en milisegundos
    endTime: number; // Tiempo de finalización en milisegundos (para SRT)
    text: string; // Texto del subtítulo o línea de la canción
};

export class SubtitleFile {
    private entries: SubtitleEntry[] = [];
    private isLRC: boolean = false;
  
    constructor(content: string) {
        this.load(content);
    }
  
    // Método para cargar un archivo y determinar el tipo (SRT o LRC)
    private load(content: string) {
        if (content.includes(" --> ")) {
            // Detecta el formato SRT
            this.isLRC = false;
            this.entries = this.parseSRT(content);
        } else if (content.match(/\[\d{2}:\d{2}\.\d{2}\]/)) {
            // Detecta el formato LRC
            this.isLRC = true;
            this.entries = this.parseLRC(content);
        } else {
            throw new Error("Formato de archivo no reconocido");
        }
    }
  
    // Método para guardar el archivo en el formato correcto
    public save(): string {
        return this.isLRC ? this.generateLRC() : this.generateSRT();
    }
  
    // Analiza contenido en formato SRT
    private parseSRT(content: string): SubtitleEntry[] {
        const entries: SubtitleEntry[] = [];
        const regex = /(\d+)\s+(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})\s+([\s\S]*?)(?=\n\n|\n*$)/g;
        let match: RegExpExecArray | null;
    
        while ((match = regex.exec(content)) !== null) {
            const [, , start, end, text] = match;
            entries.push({
            startTime: this.timeToMs(start),
            endTime: this.timeToMs(end),
            text: text.trim().replace(/\n/g, " "),
            });
        }
    
        return entries;
    }
  
    // Genera el archivo en formato SRT
    private generateSRT(): string {
        return this.entries
            .map((entry, index) => {
                const start = this.msToTime(entry.startTime);
                const end = this.msToTime(entry.endTime || entry.startTime + 2000); // Suponiendo 2s si endTime no está
                return `${index + 1}\n${start} --> ${end}\n${entry.text}\n`;
            })
            .join("\n");
    }
  
    // Analiza contenido en formato LRC
    private parseLRC(content: string): SubtitleEntry[] {
        const entries: SubtitleEntry[] = [];
        const regex = /\[(\d{2}):(\d{2})\.(\d{2})\](.*)/g;
        let match: RegExpExecArray | null;
    
        while ((match = regex.exec(content)) !== null) {
            const [, min, sec, centisec, text] = match;
            const startTime = parseInt(min) * 60000 + parseInt(sec) * 1000 + parseInt(centisec) * 10;
            entries.push({ startTime, endTime: 0, text: text.trim() });
        }
    
        return entries;
    }
  
    // Genera el archivo en formato LRC
    private generateLRC(): string {
        return this.entries
            .map(entry => {
                const min = Math.floor(entry.startTime / 60000);
                const sec = Math.floor((entry.startTime % 60000) / 1000);
                const centisec = Math.floor((entry.startTime % 1000) / 10);
                return `[${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}.${centisec.toString().padStart(2, "0")}]${entry.text}`;
            })
            .join("\n");
    }
  
    // Convierte un timestamp en formato SRT a milisegundos
    private timeToMs(time: string): number {
        const [hours, minutes, seconds, milliseconds] = time.split(/[:,]/).map(Number);
        return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
    }
  
    // Convierte milisegundos a formato de tiempo SRT
    private msToTime(ms: number): string {
        const hours = Math.floor(ms / 3600000).toString().padStart(2, "0");
        const minutes = Math.floor((ms % 3600000) / 60000).toString().padStart(2, "0");
        const seconds = Math.floor((ms % 60000) / 1000).toString().padStart(2, "0");
        const milliseconds = (ms % 1000).toString().padStart(3, "0");
        return `${hours}:${minutes}:${seconds},${milliseconds}`;
    }

    // Agregar una entrada de subtítulo o línea de letra
    public addEntry(startTime: number, text: string, endTime?: number) {
        const entry: SubtitleEntry = {
            startTime,
            endTime: this.isLRC ? 0 : endTime || startTime + 2000, // Para LRC no se necesita endTime
            text,
        };
        this.entries.push(entry);
        this.entries.sort((a, b) => a.startTime - b.startTime); // Ordena por tiempo de inicio
    }

    // Eliminar una entrada dado el tiempo de inicio
    public removeEntry(time: number): boolean {
        const index = this.entries.findIndex(entry => entry.startTime === time);
        if (index !== -1) {
            this.entries.splice(index, 1);
            return true;
        }
        return false;
    }
  }