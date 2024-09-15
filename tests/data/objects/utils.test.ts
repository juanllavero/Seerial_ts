import { Utils } from '../../../src/data/utils/Utils';
import { EpisodeData } from '../../../src/data/interfaces/EpisodeData';
import { describe, expect, it } from 'vitest';

// Establece el entorno de pruebas en 'node' para este archivo
// @vitest-environment node

const episode: EpisodeData = { 
    id: "",
    name: "",
    overview: "",
    year: "",
    nameLock: false,
    yearLock: false,
    overviewLock: false,
    score: 0,
    imdbScore: 0,
    directedBy: [],
    writtenBy: [],
    directedLock: false,
    writtenLock: false,
    album: "",
    albumArtist: "",
    order: 0,
    runtime: 0,
    runtimeInSeconds: 0,
    episodeNumber: 0,
    seasonNumber: 0,
    videoSrc: "",
    imgSrc: "",
    seasonID: "",
    watched: false,
    timeWatched: 0,
    chapters: [],
    mediaInfo: undefined,
    videoTracks: [],
    audioTracks: [],
    subtitleTracks: []
};

describe('Utils', () => {
  describe('convertTime', () => {
    it('should correctly convert milliseconds to time format', () => {
      expect(Utils.convertTime(3600000)).toBe('01:00:00'); // 1 hour
      expect(Utils.convertTime(5400000)).toBe('01:30:00'); // 1.5 hours
      expect(Utils.convertTime(3661000)).toBe('01:01:01'); // 1 hour, 1 minute, 1 second
    });
  });

  describe('formatTime', () => {
    it('should format seconds into a human-readable time string', () => {
      expect(Utils.formatTime(3661)).toBe('01:01:01');
      expect(Utils.formatTime(61)).toBe('01:01');
      expect(Utils.formatTime(59)).toBe('00:59');
    });
  });

  describe('processVideoData', () => {
    it('should correctly process video data', () => {
      const stream = {
        index: 0,
        codec_name: 'h264',
        codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
        avg_frame_rate: '25/1',
        width: '1920',
        height: '1080',
        chroma_location: 'left',
        color_space: 'bt2020nc',
        display_aspect_ratio: '16:9',
        profile: 'High',
        refs: '4',
        color_range: 'tv',
      };

      Utils['processVideoData'](stream, episode);

      const expectedVideoTrack = {
        id: 0,
        codec: 'H264',
        displayTitle: '1080p HDR10 (H264 High)',
        selected: false,
        codecExt: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
        bitrate: '',
        framerate: '25.000 fps',
        codedHeight: '1080',
        codedWidth: '1920',
        chromaLocation: 'left',
        colorSpace: 'bt2020nc',
        aspectRatio: '16:9',
        profile: 'High',
        refFrames: '4',
        colorRange: 'tv',
      };

      expect(episode.videoTracks).toEqual([expectedVideoTrack]);
    });
  });

  describe('processAudioData', () => {
    it('should correctly process audio data', () => {
      const stream = {
        index: 1,
        codec_name: 'aac',
        codec_long_name: 'AAC (Advanced Audio Codec)',
        channels: 6,
        tags: { language: 'en', BPS: '64000' },
        profile: 'LC',
        channel_layout: '5.1',
        sample_rate: '48000',
      };

      Utils['processAudioData'](stream, episode);

      const expectedAudioTrack = {
        id: 1,
        codec: 'AAC',
        displayTitle: 'English (AAC 5.1)',
        language: 'English',
        languageTag: 'en',
        selected: false,
        codecExt: 'AAC (Advanced Audio Codec)',
        channels: '5.1',
        channelLayout: '5.1',
        bitrate: '64',
        bitDepth: '',
        profile: 'lc',
        samplingRate: '48000 hz',
      };

      expect(episode.audioTracks).toEqual([expectedAudioTrack]);
    });
  });

  describe('processSubtitleData', () => {
    it('should correctly process subtitle data', () => {
      const stream = {
        index: 2,
        codec_name: 'hdmv_pgs_subtitle',
        codec_long_name: 'HDMV Presentation Graphic Stream subtitles',
        tags: { language: 'es', title: 'Spanish' },
      };

      Utils['processSubtitleData'](stream, episode);

      const expectedSubtitleTrack = {
        id: 2,
        codec: 'HDMV_PGS_SUBTITLE',
        displayTitle: 'Spanish (es PGS)',
        language: 'es',
        languageTag: 'es',
        selected: false,
        codecExt: 'HDMV Presentation Graphic Stream subtitles',
        title: 'Spanish',
      };

      expect(episode.subtitleTracks).toEqual([expectedSubtitleTrack]);
    });
  });
});
