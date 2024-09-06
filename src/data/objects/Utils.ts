import { AudioTrackData } from '@interfaces/AudioTrackData';
import { ChapterData } from '@interfaces/ChapterData';
import { EpisodeData } from '@interfaces/EpisodeData';
import { MediaInfoData } from '@interfaces/MediaInfoData';
import { SubtitleTrackData } from '@interfaces/SubtitleTrackData';
import { VideoTrackData } from '@interfaces/VideoTrackData';
import { exec } from 'child_process';
import { app } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import { promisify } from 'util';

const execPromise = promisify(exec);

export class Utils {
    
    public static getMediaInfo(episode: EpisodeData | undefined): Promise<EpisodeData> | undefined {
        if (!episode)
            return undefined;
        
        const videoPath = episode.videoSrc;
    
        // Verifica si el archivo existe
        if (!videoPath) {
            console.error('Video file does not exist.');
            return undefined;
        }
    
        // Usa ffprobe para obtener la información del video
        return new Promise(async (resolve, reject) => {
            ffmpeg.setFfmpegPath(Utils.getExternalPath("resources/lib/ffmpeg.exe"));
            ffmpeg.setFfprobePath(Utils.getExternalPath("resources/lib/ffprobe.exe"));
            ffmpeg.ffprobe(videoPath, async (err, data) => {
                if (err) {
                    console.error('Error obtaining video metadata:', err);
                    return reject(err);
                }
    
                const format = data.format;
                const streams = data.streams;
    
                // Configura la información general del medio
                let fileSize = format.size ? format.size : 0;

                let sizeSufix = " GB";
                fileSize = fileSize / Math.pow(1024, 3);

                if (fileSize < 1) {
                    fileSize = fileSize * Math.pow(1024, 1);
                    sizeSufix = " MB";
                }

                const mediaInfo: MediaInfoData = {
                    file: path.basename(videoPath),
                    location: videoPath,
                    bitrate: format.bit_rate ? ((format.bit_rate / Math.pow(10, 3)).toFixed(2) + " kbps") : '0',
                    duration: format.duration ? Utils.formatTime(format.duration) : '0',
                    size: fileSize.toFixed(2) + sizeSufix,
                    container: path.extname(videoPath).replace('.', '').toUpperCase(),
                };
                episode.mediaInfo = mediaInfo;
    
                // Establece la duración real del video
                if (format.duration) {
                    episode.runtimeInSeconds = format.duration;
                }
    
                // Limpia las listas anteriores de pistas
                episode.videoTracks = [];
                episode.audioTracks = [];
                episode.subtitleTracks = [];
    
                // Bandera para detectar cuando empiezan los subtítulos
                let subtitleSectionStarted = false;
    
                streams.forEach((stream) => {
                    const codecType = stream.codec_type;
    
                    if (codecType === 'subtitle') {
                        subtitleSectionStarted = true;
                    } else if (subtitleSectionStarted) {
                        return; // Detiene el procesamiento cuando no hay más subtítulos
                    }
    
                    if (codecType === 'video') {
                        Utils.processVideoData(stream, episode);
                    } else if (codecType === 'audio') {
                        Utils.processAudioData(stream, episode);
                    } else if (codecType === 'subtitle') {
                        Utils.processSubtitleData(stream, episode);
                    }
                });

                episode.chapters = await this.getChapters(episode);

                // Resuelve la Promesa devolviendo el episodio procesado
                resolve(episode);
            });
        });
    }
    
    // Procesa datos de video
    private static processVideoData(stream: any, episode: EpisodeData) {
        const videoTrack: VideoTrackData = {
            id: stream.index,
            codec: stream.codec_name?.toUpperCase() || '',
            displayTitle: '',
            selected: false,
            codecExt: '',
            bitrate: '',
            framerate: '',
            codedHeight: '',
            codedWidth: '',
            chromaLocation: '',
            colorSpace: '',
            aspectRatio: '',
            profile: '',
            refFrames: '',
            colorRange: ''
        };

        let resolution: string = ""; 
        let hdr: string = "";
    
        if (stream.codec_long_name)
            videoTrack.codecExt = stream.codec_long_name;
    
        if (stream.tags["BPS"])
            videoTrack.bitrate = Math.round(parseFloat(stream.tags["BPS"]) / Math.pow(10, 3)).toString();
    
        if (stream.avg_frame_rate)
            videoTrack.framerate = eval(stream.avg_frame_rate).toFixed(3) + " fps";
    
        videoTrack.codedWidth = stream.width ? stream.width : stream.codedWidth;
        videoTrack.codedHeight = stream.height ? stream.height : stream.codedHeight;
            
        resolution = Utils.formatResolution(videoTrack.codedWidth, videoTrack.codedHeight);

        if (stream["chroma_location"])
            videoTrack.chromaLocation = stream["chroma_location"];

        if (stream["color_space"]) {
            if (stream["color_space"] == "bt2020nc")
                hdr = "HDR10";
            videoTrack.colorSpace = stream["color_space"];
        }

        if (stream["display_aspect_ratio"])
            videoTrack.aspectRatio = stream["display_aspect_ratio"];

        if (stream["profile"])
            videoTrack.profile = stream["profile"];

        if (stream["refs"])
            videoTrack.refFrames = stream["refs"];

        if (stream["color_range"])
            videoTrack.colorRange = stream["color_range"];

    
        // Rellenar otros datos
        videoTrack.displayTitle = `${resolution} ${hdr} (${videoTrack.codec} ${videoTrack.profile})`;
        episode.videoTracks.push(videoTrack);
    }
    
    // Procesa datos de audio
    private static processAudioData(stream: any, episode: EpisodeData) {
        const audioTrack: AudioTrackData = {
            id: stream.index,
            codec: stream.codec_name?.toUpperCase() || '',
            displayTitle: '',
            language: '',
            languageTag: '',
            selected: false,
            codecExt: '',
            channels: '',
            channelLayout: '',
            bitrate: '',
            bitDepth: '',
            profile: '',
            samplingRate: ''
        };
    
        if (stream.codec_long_name)
            audioTrack.codecExt = stream.codec_long_name;
    
        if (stream.channels)
            audioTrack.channels = Utils.formatAudioChannels(stream.channels);

        if (stream["channel_layout"])
            audioTrack.channelLayout = stream["channel_layout"];
    
        if (stream.tags["BPS"])
            audioTrack.bitrate = Math.round(parseFloat(stream.tags["BPS"]) / Math.pow(10, 3)).toString();

        if (stream.tags["language"]) {
            audioTrack.languageTag = stream.tags["language"];

            const languageNames = new Intl.DisplayNames(['en'], { type: 'language', languageDisplay: 'standard' });
            const languageName = languageNames.of(audioTrack.languageTag);

            if (languageName)
                audioTrack.language = languageName;
        }

        if (stream["bits_per_raw_sample"] != "N/A")
            audioTrack.bitDepth = stream["bits_per_raw_sample"];

        if (stream["profile"]) {
            if (stream["profile"] == "DTS-HD MA")
                audioTrack.profile = "ma";
            else if (stream.profile == "LC")
                audioTrack.profile = "lc";
        }

        if (stream["sample_rate"])
            audioTrack.samplingRate = stream["sample_rate"] + " hz";

        let codecDisplayName: string = "";
        if (stream.profile && stream.profile == "DTS-HD MA")
            codecDisplayName = stream.profile;
        else
            codecDisplayName = stream.codec_name.toUpperCase();
    
        audioTrack.displayTitle = `${audioTrack.language} (${codecDisplayName} ${audioTrack.channels})`;
        episode.audioTracks.push(audioTrack);
    }
    
    // Procesa datos de subtítulos
    private static processSubtitleData(stream: any, episode: EpisodeData) {
        const subtitleTrack: SubtitleTrackData = {
            id: stream.index,
            codec: stream.codec_name?.toUpperCase() || '',
            displayTitle: '',
            language: '',
            languageTag: '',
            selected: false,
            codecExt: '',
            title: ''
        };
    
        let codecDisplayName: string = "";
        codecDisplayName = stream.codec_name.toUpperCase();

        if (codecDisplayName == "HDMV_PGS_SUBTITLE")
            codecDisplayName = "PGS";

        if (stream.codec_long_name) {
            subtitleTrack.codecExt = stream.codec_long_name;
        }

        if (stream.tags["language"]) {
            subtitleTrack.languageTag = stream.tags["language"];
            subtitleTrack.language = stream.language;
        }

        if (stream.tags["title"]) {
            subtitleTrack.title = stream.tags["title"];
        }
    
        subtitleTrack.displayTitle = `${subtitleTrack.title} (${subtitleTrack.language} ${codecDisplayName})`;
        episode.subtitleTracks.push(subtitleTrack);
    }

    // Formato de la resolución del video
    private static formatResolution(width: string, height: string): string {
        const widthNum = parseInt(width, 10); // Convertir a número
        switch (widthNum) {
            case 7680: return '8K';
            case 3840: return '4K';
            case 2560: return 'QHD';
            case 1920: return '1080p';
            case 1280: return '720p';
            case 854: return '480p';
            case 640: return '360p';
            default: return `${height}p`;
        }
    }
    
    // Formato de los canales de audio
    private static formatAudioChannels(channels: number): string {
        switch (channels) {
            case 1: return 'MONO';
            case 2: return 'STEREO';
            case 6: return '5.1';
            case 8: return '7.1';
            default: return `${channels} channels`;
        }
    }

    public static convertTime(milliseconds: number): string {
        const seconds = milliseconds / 1000;
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
    
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    public static formatTime(time: number): string {
        const h = Math.floor(time / 3600);
        const m = Math.floor((time % 3600) / 60);
        const s = Math.floor(time % 60);

        if (h > 0) {
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    public static getExternalPath(relativePath: string): string {
        const basePath = app.isPackaged ? path.dirname(app.getPath('exe')) : app.getAppPath();
        return path.join(basePath, relativePath);
    };

    public static async getChapters(episode: EpisodeData): Promise<ChapterData[]> {
        const chaptersArray: ChapterData[] = [];
        
        try {
          const { stdout } = await execPromise(`ffprobe -v error -show_entries chapter -of json -i "${episode.videoSrc}"`);
          const metadata = JSON.parse(stdout);

          
      
          if (metadata.chapters && metadata.chapters.length > 0) {
            metadata.chapters.forEach((chapter: any) => {
                const chapterData: ChapterData = {
                    title: chapter.title || 'Sin título',
                    time: chapter.start_time || 0,
                    displayTime: Utils.formatTime(chapter.start_time),
                    thumbnailSrc: ''
                };

                chaptersArray.push(chapterData);

                return chaptersArray;
            });
          } else {
            return chaptersArray;
          }
        } catch (error) {
          console.error('Error al obtener los capítulos:', error);
        }

        return chaptersArray;
      }
}