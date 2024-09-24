import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url'
import * as path from 'path';
import * as net from 'net';
import * as fs from 'fs';

export class MPVController {
  private mpvProcess: ChildProcessWithoutNullStreams | null = null;
  //private videoLoaded: boolean = false;
  private paused: boolean = false;
  private static ipcSocketPath: string = '//./pipe/mpv-pipe';
  private clientSocket: net.Socket | null = null;
  //private connectionEstablished: boolean = false;

  constructor(private window: BrowserWindow) {}

  // Método para iniciar MPV en la ventana de Electron
  public startMPV(videoPath: string): void {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const mpvPath = path.join(__dirname, '../src/mpv/mpv.exe');

    // Identificamos el HWND de la ventana de Electron para asignarlo al proceso MPV
    const hwnd = this.window.getNativeWindowHandle().readInt32LE(0).toString();

    // Comandos iniciales de MPV con las configuraciones deseadas
    const args = [
      '--wid=' + hwnd,          // Asigna la ventana de Electron al reproductor
      '--no-border',            // Sin bordes
      '--autofit=100%',         // Ajusta el video al tamaño de la ventana
      '--input-ipc-server=\\\\.\\pipe\\mpv-pipe',  // IPC Socket para comunicación
      '--log-file=mpv.log',     // Opcional: para depuración
      videoPath                 // Ruta del archivo de video a reproducir
    ];

    // Spawn del proceso MPV
    this.mpvProcess = spawn(mpvPath, args);

    /*this.mpvProcess.stdout.on('data', (data) => {
      console.log(`MPV STDOUT: ${data}`);
    });*/

    /*this.mpvProcess.stderr.on('data', (data) => {
      console.error(`MPV STDERR: ${data}`);
    });*/

    this.mpvProcess.on('close', (code) => {
      console.log(`MPV process exited with code ${code}`);
      //this.videoLoaded = true;
    });

    //this.videoLoaded = true;

    // Esperar hasta que el socket esté disponible antes de conectar
    this.waitForSocketAndConnect();
  }

  private waitForSocketAndConnect(): void {
    const checkSocketExists = () => {
      fs.access(MPVController.ipcSocketPath, fs.constants.F_OK, (err) => {
        if (err) {
          console.log('Socket not available, retrying in 100ms...');
          setTimeout(checkSocketExists, 100); // Reintentar después de 500ms
        } else {
          console.log('Socket is available, connecting...');
          this.connectToMPVSocket();
        }
      });
    };

    checkSocketExists();
  }

  private connectToMPVSocket(): void {
    this.clientSocket = net.createConnection(MPVController.ipcSocketPath, () => {
      console.log('Connected to MPV pipe');
    });

    this.clientSocket.on('data', (data) => {
      console.log('Response from MPV:', data.toString());
    });

    this.clientSocket.on('error', (err) => {
      console.error('Client socket error:', err);
      this.mpvProcess?.kill();
    });

    this.clientSocket.on('end', () => {
      console.log('Disconnected from MPV pipe');
      this.clientSocket = null;
      this.mpvProcess?.kill();
    });
  }

  // Método para enviar comandos al reproductor MPV usando named pipes
  public sendCommand(args: string[] = []): void {
    if (this.mpvProcess) {
      try {
        // Abrimos el pipe en modo escritura
        const fd = fs.openSync('\\\\.\\pipe\\mpv-pipe', 'w');

        // Escribimos el comando en el pipe seguido de un salto de línea
        fs.writeSync(fd, `${args.join(' ')}\n`);

        // Cerramos el descriptor de archivo
        fs.closeSync(fd);

        console.log(`Comando enviado: ${args.join(' ')}`);
      } catch (error) {
          console.error('Error al enviar el comando al pipe:', error);
      }
    }
  }

  // Pausar o reanudar el video
  public togglePause(): void {
    this.paused = !this.paused;

    if (this.paused){
      this.sendCommand(['set', 'pause', 'yes']);
    }else{
      this.sendCommand(['set', 'pause', 'no']);
    }

    //this.sendCommand(['cycle', 'pause']);
  }

  // Detener el video
  public stop(): void {
    //this.videoLoaded = false;
    this.sendCommand(['stop']);
  }

  // Ajustar el volumen
  public adjustVolume(volume: number): void {
    this.sendCommand(['set', 'volume', volume.toString()]);
  }

  // Buscar hacia adelante
  public seekForward(seconds: number = 10): void {
    this.sendCommand(['seek', seconds.toString()]);
  }

  // Buscar hacia atrás
  public seekBackward(seconds: number = -5): void {
    this.sendCommand(['seek', seconds.toString()]);
  }

  // Selección de pistas de video, audio y subtítulos
  public setVideoTrack(videoId: number): void {
    this.sendCommand(['set', 'vid', videoId.toString()]);
  }

  public setAudioTrack(audioId: number): void {
    this.sendCommand(['set', 'aid', audioId.toString()]);
  }

  public setSubtitleTrack(subtitleId: number): void {
    this.sendCommand(['set', 'sid', subtitleId.toString()]);
  }

  public disableSubtitles(): void {
    this.sendCommand(['set', 'sid', 'no']);
  }

  // Ajuste del gamma
  public setGamma(gammaValue: number): void {
    gammaValue = Math.max(-100, Math.min(100, gammaValue)); // Limitar el valor de gamma
    this.sendCommand(['set', 'gamma', gammaValue.toString()]);
  }

  // Ajuste del retraso de audio
  public setAudioDelay(delayMS: number): void {
    this.sendCommand(['set', 'audio-delay', (delayMS / 1000).toString()]);
  }

  // Ajuste del retraso de subtítulos
  public setSubtitleDelay(delayMS: number): void {
    this.sendCommand(['set', 'sub-delay', (delayMS / 1000).toString()]);
  }

  // Ajuste del zoom del video
  public fixZoom(zoomValue: number): void {
    this.sendCommand(['set', 'video-zoom', zoomValue.toString()]);
  }

  // Ajuste de la posición vertical de los subtítulos
  public setSubtitleVerticalPosition(position: number): void {
    this.sendCommand(['set', 'sub-pos', position.toString()]);
  }

  // Ajuste del tamaño de los subtítulos
  public setSubtitleSize(size: number): void {
    this.sendCommand(['set', 'sub-scale', size.toString()]);
  }

  // Configurar la interpolación
  public configureInterpolation(enable: boolean): void {
    if (enable) {
      this.sendCommand(['set', 'video-sync', 'display-resample']);
      this.sendCommand(['set', 'interpolation', 'yes']);
      this.sendCommand(['set', 'tscale', 'sphinx']);
      this.sendCommand(['set', 'tscale-blur', '0.6991556596428412']);
      this.sendCommand(['set', 'tscale-radius', '1.05']);
      this.sendCommand(['set', 'tscale-clamp', '0.0']);
    } else {
      this.sendCommand(['set', 'interpolation', 'no']);
    }
  }

  /**
   * Configure video quality settings
   */
  public configureQualitySettings(highQuality: boolean): void {
    if (highQuality){
      this.sendCommand(['set', 'gpu-api', 'vulkan']);
      this.sendCommand(['set', 'gpu-context', 'auto']);
      this.sendCommand(['set', 'profile', 'high-quality']);
      this.sendCommand(['set', 'vo', 'gpu-next']);
      this.sendCommand(['set', 'hwdec', 'auto-safe']);
    }else{
      this.sendCommand(['set', 'gpu-api', 'd3d11']);
      this.sendCommand(['set', 'gpu-context', 'd3d11']);
      this.sendCommand(['set', 'profile', 'fast']);
      this.sendCommand(['set', 'vo', 'gpu-next']);
      this.sendCommand(['set', 'hwdec', 'd3d11va']);
    }
  }

  /**
   * Configure video player settings
   */
  public configureSettings(): void {
    //HDR Settings
    this.sendCommand(['set', 'tone-mapping', 'bt.2446a']);
    this.sendCommand(['set', 'hdr-peak-percentile', '99.995']);
    this.sendCommand(['set', 'hdr-contrast-recovery', '0.30']);
    this.sendCommand(['set', 'target-colorspace-hint', 'yes']);
    this.sendCommand(['set', 'target-contrast', 'auto']);

    //Audio Settings
    this.sendCommand(['set', 'audio-stream', 'silence']);
    this.sendCommand(['set', 'audio-pitch-correction', 'yes']);

    //Subtitle Settings
    this.sendCommand(['set', 'blend-subtitles', 'no']);
    this.sendCommand(['set', 'demuxer-mkv-subtitle-preroll', 'yes']);
    this.sendCommand(['set', 'embeddedfonts', 'yes']);
    this.sendCommand(['set', 'sub-fix-timing', 'no']);
    this.sendCommand(['set', 'sub-font', 'Open Sans SemiBold']);
    this.sendCommand(['set', 'sub-font-size', '46']);
    this.sendCommand(['set', 'sub-blur', '0.3']);
    this.sendCommand(['set', 'sub-border-color', '0.0/0.0/0.0/0.8']);
    this.sendCommand(['set', 'sub-border-size', '3.2']);
    this.sendCommand(['set', 'sub-color', '0.9/0.9/0.9/1.0']);
    this.sendCommand(['set', 'sub-margin-x', '100']);
    this.sendCommand(['set', 'sub-margin-y', '50']);
    this.sendCommand(['set', 'sub-shadow-color', '0.0/0.0/0.0/0.25']);
    this.sendCommand(['set', 'sub-shadow-offset', '0']);

    //Other Settings
    this.sendCommand(['set', 'deinterlace', 'no']);
    this.sendCommand(['set', 'dither-depth', 'auto']);
    this.sendCommand(['set', 'deband', 'yes']);
    this.sendCommand(['set', 'deband-iterations', '4']);
    this.sendCommand(['set', 'deband-threshold', '35']);
    this.sendCommand(['set', 'deband-range', '16']);
    this.sendCommand(['set', 'deband-grain', '4']);
  }
}