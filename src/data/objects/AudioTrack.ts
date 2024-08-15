export class AudioTrack {
    displayTitle: string;
    id: number;
    language: string;
    languageTag: string;
    selected: boolean;
    codec: string;
    codecExt: string;
    channels: string;
    channelLayout: string;
    bitrate: string;
    bitDepth: string;
    profile: string;
    samplingRate: string;
  
    constructor(id: number,
                displayTitle: string = "",
                language: string = "",
                languageTag: string = "",
                selected: boolean = false,
                codec: string = "",
                codecExt: string = "",
                channels: string = "",
                channelLayout: string = "",
                bitrate: number = 0,
                bitDepth: string = "",
                profile: string = "",
                samplingRate: number = 0) {
      this.id = id;
      this.displayTitle = displayTitle;
      this.language = language;
      this.languageTag = languageTag;
      this.selected = selected;
      this.codec = codec;
      this.codecExt = codecExt;
      this.channels = channels;
      this.channelLayout = channelLayout;
      this.bitrate = `${bitrate} kbps`;
      this.bitDepth = bitDepth;
      this.profile = profile;
      this.samplingRate = `${samplingRate} Hz`;
    }
  
    getDisplayTitle(): string {
      return this.displayTitle;
    }
  
    setDisplayTitle(displayTitle: string): void {
      this.displayTitle = displayTitle;
    }
  
    getId(): number {
      return this.id;
    }
  
    setId(id: number): void {
      this.id = id;
    }
  
    getLanguage(): string {
      return this.language;
    }
  
    setLanguage(language: string): void {
      this.language = language;
    }
  
    getLanguageTag(): string {
      return this.languageTag;
    }
  
    setLanguageTag(languageTag: string): void {
      this.languageTag = languageTag;
    }
  
    isSelected(): boolean {
      return this.selected;
    }
  
    setSelected(selected: boolean): void {
      this.selected = selected;
    }
  
    getCodec(): string {
      return this.codec;
    }
  
    setCodec(codec: string): void {
      this.codec = codec;
    }
  
    getCodecExt(): string {
      return this.codecExt;
    }
  
    setCodecExt(codecExt: string): void {
      this.codecExt = codecExt;
    }
  
    getChannels(): string {
      return this.channels;
    }
  
    setChannels(channels: string): void {
      this.channels = channels;
    }
  
    getChannelLayout(): string {
      return this.channelLayout;
    }
  
    setChannelLayout(channelLayout: string): void {
      this.channelLayout = channelLayout;
    }
  
    getBitrate(): string {
      return this.bitrate;
    }
  
    setBitrate(bitrate: number): void {
      this.bitrate = `${bitrate} kbps`;
    }
  
    getBitDepth(): string {
      return this.bitDepth;
    }
  
    setBitDepth(bitDepth: string): void {
      this.bitDepth = bitDepth;
    }
  
    getProfile(): string {
      return this.profile;
    }
  
    setProfile(profile: string): void {
      this.profile = profile;
    }
  
    getSamplingRate(): string {
      return this.samplingRate;
    }
  
    setSamplingRate(samplingRate: number): void {
      this.samplingRate = `${samplingRate} Hz`;
    }
  
    // Convert from JSON to AudioTrack instance
    static fromJSON(json: any): AudioTrack {
      return new AudioTrack(
        json.id,
        json.displayTitle || "",
        json.language || "",
        json.languageTag || "",
        json.selected || false,
        json.codec || "",
        json.codecExt || "",
        json.channels || "",
        json.channelLayout || "",
        json.bitrate || 0,
        json.bitDepth || "",
        json.profile || "",
        json.samplingRate || 0
      );
    }
  
    // Convert AudioTrack instance to JSON
    toJSON(): any {
      return {
        displayTitle: this.displayTitle,
        id: this.id,
        language: this.language,
        languageTag: this.languageTag,
        selected: this.selected,
        codec: this.codec,
        codecExt: this.codecExt,
        channels: this.channels,
        channelLayout: this.channelLayout,
        bitrate: this.bitrate,
        bitDepth: this.bitDepth,
        profile: this.profile,
        samplingRate: this.samplingRate
      };
    }
  }