export class SubtitleTrack {
    displayTitle: string;
    id: number;
    language: string;
    languageTag: string;
    selected: boolean;
    codec: string;
    codecExt: string;
    title: string;
  
    constructor(id: number,
                displayTitle: string = "",
                language: string = "",
                languageTag: string = "",
                selected: boolean = false,
                codec: string = "",
                codecExt: string = "",
                title: string = "") {
      this.id = id;
      this.displayTitle = displayTitle;
      this.language = language;
      this.languageTag = languageTag;
      this.selected = selected;
      this.codec = codec;
      this.codecExt = codecExt;
      this.title = title;
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
  
    getTitle(): string {
      return this.title;
    }
  
    setTitle(title: string): void {
      this.title = title;
    }
  
    // Convert from JSON to SubtitleTrack instance
    static fromJSON(json: any): SubtitleTrack {
      return new SubtitleTrack(
        json.id,
        json.displayTitle || "",
        json.language || "",
        json.languageTag || "",
        json.selected || false,
        json.codec || "",
        json.codecExt || "",
        json.title || ""
      );
    }
  
    // Convert SubtitleTrack instance to JSON
    toJSON(): any {
      return {
        displayTitle: this.displayTitle,
        id: this.id,
        language: this.language,
        languageTag: this.languageTag,
        selected: this.selected,
        codec: this.codec,
        codecExt: this.codecExt,
        title: this.title
      };
    }
  }