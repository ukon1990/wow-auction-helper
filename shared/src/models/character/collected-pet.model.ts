export interface CollectedPet {
  id: number;
  speciesId: number;
  creatureId: number;
  name: string;
  speciesName: string;
  creatureDisplay: {
    key: {
      href: string;
    };
    id: number;
  };
  level: number;
  quality: string;
  stats: PetStats;

  // Optionals for the client
  count?: number;
}

interface PetStats {
  breedId: number;
  health: number;
  power: number;
  speed: number;
}

export class PetSlot {
}