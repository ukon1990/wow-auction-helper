export interface CharacterProfession {
  id: number;
  skillTiers: {
    id: number;
    points: number;
    recipes: number[];
  }[];
}