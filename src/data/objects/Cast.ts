export class Cast {
    adult: boolean;
    gender: number;
    id: number;
    knownForDepartment: string;
    name: string;
    originalName: string;
    popularity: number;
    profilePath: string;
    castId: number;
    character: string;
    creditId: string;
    order: number;
  
    constructor(adult: boolean = false,
                gender: number = 0,
                id: number = 0,
                knownForDepartment: string = "",
                name: string = "",
                originalName: string = "",
                popularity: number = 0,
                profilePath: string = "",
                castId: number = 0,
                character: string = "",
                creditId: string = "",
                order: number = 0) {
      this.adult = adult;
      this.gender = gender;
      this.id = id;
      this.knownForDepartment = knownForDepartment;
      this.name = name;
      this.originalName = originalName;
      this.popularity = popularity;
      this.profilePath = profilePath;
      this.castId = castId;
      this.character = character;
      this.creditId = creditId;
      this.order = order;
    }
  
    // Métodos Getter y Setter
  
    getAdult(): boolean {
      return this.adult;
    }
  
    setAdult(adult: boolean): void {
      this.adult = adult;
    }
  
    getGender(): number {
      return this.gender;
    }
  
    setGender(gender: number): void {
      this.gender = gender;
    }
  
    getId(): number {
      return this.id;
    }
  
    setId(id: number): void {
      this.id = id;
    }
  
    getKnownForDepartment(): string {
      return this.knownForDepartment;
    }
  
    setKnownForDepartment(knownForDepartment: string): void {
      this.knownForDepartment = knownForDepartment;
    }
  
    getName(): string {
      return this.name;
    }
  
    setName(name: string): void {
      this.name = name;
    }
  
    getOriginalName(): string {
      return this.originalName;
    }
  
    setOriginalName(originalName: string): void {
      this.originalName = originalName;
    }
  
    getPopularity(): number {
      return this.popularity;
    }
  
    setPopularity(popularity: number): void {
      this.popularity = popularity;
    }
  
    getProfilePath(): string {
      return this.profilePath;
    }
  
    setProfilePath(profilePath: string): void {
      this.profilePath = profilePath;
    }
  
    getCastId(): number {
      return this.castId;
    }
  
    setCastId(castId: number): void {
      this.castId = castId;
    }
  
    getCharacter(): string {
      return this.character;
    }
  
    setCharacter(character: string): void {
      this.character = character;
    }
  
    getCreditId(): string {
      return this.creditId;
    }
  
    setCreditId(creditId: string): void {
      this.creditId = creditId;
    }
  
    getOrder(): number {
      return this.order;
    }
  
    setOrder(order: number): void {
      this.order = order;
    }
  
    // Convert from JSON to Cast instance
    static fromJSON(json: any): Cast {
      return new Cast(
        json.adult || false,
        json.gender || 0,
        json.id || 0,
        json.known_for_department || "",
        json.name || "",
        json.original_name || "",
        json.popularity || 0,
        json.profile_path || "",
        json.cast_id || 0,
        json.character || "",
        json.credit_id || "",
        json.order || 0
      );
    }
  
    // Convert Cast instance to JSON
    toJSON(): any {
      return {
        adult: this.adult,
        gender: this.gender,
        id: this.id,
        known_for_department: this.knownForDepartment,
        name: this.name,
        original_name: this.originalName,
        popularity: this.popularity,
        profile_path: this.profilePath,
        cast_id: this.castId,
        character: this.character,
        credit_id: this.creditId,
        order: this.order
      };
    }
  }