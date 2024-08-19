import { execFile, spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { BrowserWindow } from 'electron';
import { fileURLToPath } from 'node:url'
import * as path from 'path';

export class MPVController {
  private mpvProcess: ChildProcessWithoutNullStreams | null = null;
  private videoLoaded: boolean = false;
  private paused: boolean = false;

  constructor(private window: BrowserWindow) {}

  // Método para iniciar MPV en la ventana de Electron
  public startMPV(videoPath: string): void {
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const mpvPath = path.join(__dirname, '../src/mpv/win/test/mpv.exe');

    // Identificamos el HWND de la ventana de Electron para asignarlo al proceso MPV
    const hwnd = this.window.getNativeWindowHandle().readInt32LE(0).toString();

    // Comandos iniciales de MPV con las configuraciones deseadas
    const args = [
      '--wid=' + hwnd,          // Asigna la ventana de Electron al reproductor
      '--no-border',            // Sin bordes
      '--autofit=100%',         // Ajusta el video al tamaño de la ventana
      '--input-ipc-server=/tmp/mpvsocket',  // IPC Socket para comunicación
      '--log-file=mpv.log',     // Opcional: para depuración
      videoPath                 // Ruta del archivo de video a reproducir
    ];

    // Spawn del proceso MPV
    this.mpvProcess = spawn(mpvPath, args);

    this.mpvProcess.stdout.on('data', (data) => {
      console.log(`MPV STDOUT: ${data}`);
    });

    this.mpvProcess.stderr.on('data', (data) => {
      console.error(`MPV STDERR: ${data}`);
    });

    this.mpvProcess.on('close', (code) => {
      console.log(`MPV process exited with code ${code}`);
    });

    this.videoLoaded = true;
  }

  // Método para enviar comandos al reproductor MPV usando IPC
  public sendCommand(command: string, args: string[] = []): void {
    if (this.mpvProcess) {
      const cmd = JSON.stringify({ command: [command, ...args] }) + '\n';
      execFile('echo', [cmd, '>', '/tmp/mpvsocket'], (error, stdout, stderr) => {
        if (error) {
          console.error(`Error ejecutando el comando: ${error}`);
        } else {
          console.log(`Comando enviado: ${command}`);
        }
      });
    }
  }

  // Pausar o reanudar el video
  public togglePause(): void {
    this.paused = !this.paused;
    this.sendCommand('cycle', ['pause']);
  }

  // Detener el video
  public stop(): void {
    this.videoLoaded = false;
    this.sendCommand('stop');
  }

  // Ajustar el volumen
  public adjustVolume(volume: number): void {
    this.sendCommand('set', ['volume', volume.toString()]);
  }

  // Buscar hacia adelante
  public seekForward(seconds: number = 10): void {
    this.sendCommand('seek', [seconds.toString()]);
  }

  // Buscar hacia atrás
  public seekBackward(seconds: number = -5): void {
    this.sendCommand('seek', [seconds.toString()]);
  }

  // Configurar la interpolación
  public configureInterpolation(enable: boolean): void {
    if (enable) {
      this.sendCommand('set', ['interpolation', 'yes']);
      this.sendCommand('set', ['video-sync', 'display-resample']);
    } else {
      this.sendCommand('set', ['interpolation', 'no']);
    }
  }
}