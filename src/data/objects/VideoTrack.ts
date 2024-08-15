export class VideoTrack {
    displayTitle: string;
    id: number;
    selected: boolean;
    codec: string;
    codecExt: string;
    bitrate: string;
    framerate: string;
    codedHeight: string;
    codedWidth: string;
    chromaLocation: string;
    colorSpace: string;
    aspectRatio: string;
    profile: string;
    refFrames: string;
    colorRange: string;
  
    constructor(id: number,
                displayTitle: string = "",
                selected: boolean = false,
                codec: string = "",
                codecExt: string = "",
                bitrate: number = 0,
                framerate: number = 0,
                codedHeight: number = 0,
                codedWidth: number = 0,
                chromaLocation: string = "",
                colorSpace: string = "",
                aspectRatio: number = 0,
                profile: string = "",
                refFrames: number = 0,
                colorRange: string = "") {
      this.id = id;
      this.displayTitle = displayTitle;
      this.selected = selected;
      this.codec = codec;
      this.codecExt = codecExt;
      this.bitrate = `${bitrate} kbps`;
      this.framerate = `${this.formatDecimal(framerate)} fps`;
      this.codedHeight = codedHeight.toString();
      this.codedWidth = codedWidth.toString();
      this.chromaLocation = chromaLocation;
      this.colorSpace = colorSpace;
      this.aspectRatio = this.formatDecimal(aspectRatio);
      this.profile = profile;
      this.refFrames = refFrames.toString();
      this.colorRange = colorRange;
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
  
    getBitrate(): string {
      return this.bitrate;
    }
  
    setBitrate(bitrate: number): void {
      this.bitrate = `${bitrate} kbps`;
    }
  
    getFramerate(): string {
      return this.framerate;
    }
  
    setFramerate(framerate: number): void {
      this.framerate = `${this.formatDecimal(framerate)} fps`;
    }
  
    getCodedHeight(): string {
      return this.codedHeight;
    }
  
    setCodedHeight(codedHeight: number): void {
      this.codedHeight = codedHeight.toString();
    }
  
    getCodedWidth(): string {
      return this.codedWidth;
    }
  
    setCodedWidth(codedWidth: number): void {
      this.codedWidth = codedWidth.toString();
    }
  
    getChromaLocation(): string {
      return this.chromaLocation;
    }
  
    setChromaLocation(chromaLocation: string): void {
      this.chromaLocation = chromaLocation;
    }
  
    getColorSpace(): string {
      return this.colorSpace;
    }
  
    setColorSpace(colorSpace: string): void {
      this.colorSpace = colorSpace;
    }
  
    getAspectRatio(): string {
      return this.aspectRatio;
    }
  
    setAspectRatio(aspectRatio: number): void {
      this.aspectRatio = this.formatDecimal(aspectRatio);
    }
  
    getProfile(): string {
      return this.profile;
    }
  
    setProfile(profile: string): void {
      this.profile = profile;
    }
  
    getRefFrames(): string {
      return this.refFrames;
    }
  
    setRefFrames(refFrames: number): void {
      this.refFrames = refFrames.toString();
    }
  
    getColorRange(): string {
      return this.colorRange;
    }
  
    setColorRange(colorRange: string): void {
      this.colorRange = colorRange;
    }
  
    private formatDecimal(value: number): string {
      return value.toFixed(2);
    }
  
    // Convert from JSON to VideoTrack instance
    static fromJSON(json: any): VideoTrack {
      return new VideoTrack(
        json.id,
        json.displayTitle || "",
        json.selected || false,
        json.codec || "",
        json.codecExt || "",
        json.bitrate || 0,
        json.framerate || 0,
        json.codedHeight || 0,
        json.codedWidth || 0,
        json.chromaLocation || "",
        json.colorSpace || "",
        json.aspectRatio || 0,
        json.profile || "",
        json.refFrames || 0,
        json.colorRange || ""
      );
    }
  
    // Convert VideoTrack instance to JSON
    toJSON(): any {
      return {
        displayTitle: this.displayTitle,
        id: this.id,
        selected: this.selected,
        codec: this.codec,
        codecExt: this.codecExt,
        bitrate: this.bitrate,
        framerate: this.framerate,
        codedHeight: this.codedHeight,
        codedWidth: this.codedWidth,
        chromaLocation: this.chromaLocation,
        colorSpace: this.colorSpace,
        aspectRatio: this.aspectRatio,
        profile: this.profile,
        refFrames: this.refFrames,
        colorRange: this.colorRange
      };
    }
  }