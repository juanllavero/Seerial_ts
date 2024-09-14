declare module 'ffmetadata' {
    interface Metadata {
      title?: string;
      artist?: string;
      album?: string;
      genre?: string;
      track?: string;
      date?: string;
      comment?: string;
      composer?: string;
      [key: string]: any;  // Permitir otros campos de metadatos
    }
  
    interface ReadOptions {
      coverPath?: string;
    }
  
    interface WriteOptions {
      attachments?: string[];
    }
  
    /**
     * Lee los metadatos de un archivo de audio.
     * @param filePath La ruta al archivo de audio.
     * @param options Opcional. Opciones adicionales para leer los metadatos.
     * @param callback Función de callback con el error o los metadatos leídos.
     */
    function read(
      filePath: string,
      options: ReadOptions,
      callback: (err: Error | null, data: Metadata) => void
    ): void;
  
    /**
     * Lee los metadatos de un archivo de audio.
     * @param filePath La ruta al archivo de audio.
     * @param callback Función de callback con el error o los metadatos leídos.
     */
    function read(
      filePath: string,
      callback: (err: Error | null, data: Metadata) => void
    ): void;
  
    /**
     * Escribe metadatos en un archivo de audio.
     * @param filePath La ruta al archivo de audio.
     * @param data Los metadatos que se desean escribir.
     * @param options Opcional. Opciones adicionales para escribir los metadatos.
     * @param callback Función de callback que maneja el error o la confirmación.
     */
    function write(
      filePath: string,
      data: Metadata,
      options: WriteOptions,
      callback: (err: Error | null) => void
    ): void;
  
    /**
     * Escribe metadatos en un archivo de audio.
     * @param filePath La ruta al archivo de audio.
     * @param data Los metadatos que se desean escribir.
     * @param callback Función de callback que maneja el error o la confirmación.
     */
    function write(
      filePath: string,
      data: Metadata,
      callback: (err: Error | null) => void
    ): void;
  
    /**
     * Establece la ruta personalizada de ffmpeg.
     * @param path La ruta al binario de ffmpeg.
     */
    function setFfmpegPath(path: string): void;
}