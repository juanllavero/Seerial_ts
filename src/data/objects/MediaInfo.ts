export class MediaInfo {
  file: string;
  location: string;
  bitrate: string;
  duration: string;
  size: string;
  container: string;

  constructor(file: string, location: string, bitrate: string, duration: string, size: string, container: string) {
    this.file = file;
    this.location = location;
    this.bitrate = bitrate;
    this.duration = duration;
    this.size = size;
    this.container = container;
  }

  // Convertir la instancia a JSON
  toJSON(): any {
    return {
      file: this.file,
      location: this.location,
      bitrate: this.bitrate,
      duration: this.duration,
      size: this.size,
      container: this.container
    };
  }
}