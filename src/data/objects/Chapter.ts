export class Chapter {
    title: string;
    time: number; // En segundos
    displayTime: string;
    thumbnailSrc: string;
  
    constructor(title: string, time: number) {
      this.title = title;
      this.time = time;
      this.displayTime = this.convertTime(time);
      this.thumbnailSrc = '';
    }
  
    // Método para convertir el tiempo de milisegundos a formato de tiempo
    private convertTime(milliseconds: number): string {
      const seconds = milliseconds / 1000;
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
  
      return `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}`;
    }
  
    // Método para añadir ceros a la izquierda
    private pad(num: number): string {
      return num.toString().padStart(2, '0');
    }
  
    // Convertir de JSON a instancia de Chapter
    static fromJSON(json: any): Chapter {
      const chapter = new Chapter(json.title, json.time);
      chapter.displayTime = json.displayTime;
      chapter.thumbnailSrc = json.thumbnailSrc;
      return chapter;
    }
  
    // Convertir la instancia a JSON
    toJSON(): any {
      return {
        title: this.title,
        time: this.time,
        displayTime: this.displayTime,
        thumbnailSrc: this.thumbnailSrc
      };
    }
  }