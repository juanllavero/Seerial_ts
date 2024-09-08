export class Cast {
  character?: string;
  name?: string;
  
  constructor(name: string = "",
              character: string = "") {
    this.name = name;
    this.character = character;
  }

  // Convert from JSON to Cast instance
  static fromJSON(json: any): Cast {
    return new Cast(
      json.name || "",
      json.character || ""
    );
  }

  // Convert Cast instance to JSON
  toJSON(): any {
    return {
      name: this.name ?? "",
      character: this.character ?? ""
    };
  }
}