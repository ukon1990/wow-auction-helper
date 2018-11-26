export class Character {
  lastModified: number;
  name: string;
  realm: string;
  battlegroup: string;
  class: number;
  race: number;
  gender: number;
  level: number;
  achievementPoints: number;
  totalHonorableKills: number;
  thumbnail: string; // draenor/217/111484633-avatar.jpg
  calcClass: string;
  faction: string; // 0 = ally, 1 = horde
  professions: {
    primary: Array<Profession>,
    secondary: Array<Profession>
  };
  statistics?: CharacterStatistic[];
  mounts?: {
    numCollected: number;
    numNotCollected: number;
    mounts: Mount;
  };
  pets?: UserPets;
  petSlots?: PetSlot[];
  downloading?: boolean;

  constructor(realm?: string, name?: string) {
    if (realm) {
      this.realm = realm;
    }

    if (name) {
      this.name = name;
    }
  }
}

class Profession {
  name: string;
  icon: string;
  rank: number;
  max: number;
  recipes: Array<Number>;
}

class CharacterStatisticCategory {
  id: number;
  name: string;
  statistics?: Array<CharacterStatistic>;
  subCategories?: Array<CharacterStatisticCategory>;
}

class CharacterStatistic {
  id: number;
  name: string;
  quantity: number;
  lastUpdated: number;
  money: false;
}

class Mount {
}

class UserPets {
  numCollected = 0;
  numNotCollected = 0;
  collected: Array<CollectedPet>;
}

export class CollectedPet {
  name: string;
  spellId: number;
  creatureId: number;
  itemId: number;
  qualityId: number;
  icon: string;
  stats: PetStats;
  battlePetGuid: string;
  count?: number;
  isFavorite: boolean;
  isFirstAbilitySlotSelected: boolean;
  isSecondAbilitySlotSelected: boolean;
  isThirdAbilitySlotSelected: boolean;
  creatureName: string;
  canBattle: boolean;
}

class PetStats {
  speciesId: number;
  breedId: number;
  petQualityId: number;
  level: number;
  health: number;
  power: number;
  speed: number;
}

class PetSlot {
}
