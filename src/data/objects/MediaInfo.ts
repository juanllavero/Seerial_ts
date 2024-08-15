export class MediaInfo {
  file: string;
  location: string;
  bitrate: string;
  duration: string;
  size: string;
  container: string;

  constructor(file: string, location: string, bitrate: number, duration: number, size: number, container: string) {
    this.file = file;
    this.location = location;
    this.bitrate = `${bitrate} kbps`;
    this.duration = this.formatTime(duration);
    this.size = this.formatSize(size);
    this.container = container;
  }

  // Método para formatear la duración en formato HH:MM:SS
  private formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
  }

  // Método para añadir ceros a la izquierda
  private pad(num: number): string {
    return num.toString().padStart(2, '0');
  }

  // Método para formatear el tamaño del archivo
  private formatSize(size: number): string {
    const decimalFormat = (num: number) => num.toFixed(2);
    let fileSize = size;
    let sizeSufix = ' GB';

    fileSize = fileSize / Math.pow(1024, 3);

    if (fileSize < 1) {
      fileSize = fileSize * Math.pow(1024, 1);
      sizeSufix = ' MB';
    }

    return decimalFormat(fileSize) + sizeSufix;
  }

  // Convertir de JSON a instancia de MediaInfo
  static fromJSON(json: any): MediaInfo {
    return new MediaInfo(
      json.file,
      json.location,
      parseFloat(json.bitrate),
      parseFloat(json.duration),
      parseFloat(json.size),
      json.container
    );
  }

  // Convertir la instancia a JSON
  toJSON(): any {
    return {
      file: this.file,
      location: this.location,
      bitrate: parseFloat(this.bitrate),
      duration: parseFloat(this.duration),
      size: parseFloat(this.size),
      container: this.container
    };
  }
}