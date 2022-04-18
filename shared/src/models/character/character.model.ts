import {CharacterProfession} from "./character-profession.model";
import {CharacterStatistic} from "./character-statistic-category.model";
import {UserPets} from "./user-pets.model";
import {PetSlot} from "./collected-pet.model";
import {Reputation} from "./reputation.model";

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
  media: {
    avatar?: string;
    inset?: string;
    main?: string;
    'main-raw'?: string;
  };
  calcClass: string;
  faction: number; // 0 = ally, 1 = horde
  professions: {
    primaries: CharacterProfession[],
    secondaries: CharacterProfession[]
  };
  statistics?: CharacterStatistic[];
  mounts?: {
    numCollected: number;
    numNotCollected: number;
    mounts: Mount;
  };
  pets?: UserPets;
  petSlots?: PetSlot[];
  guild?: string;
  reputations: Reputation[];
  slug: string;

  constructor(realm?: string, name?: string) {
    if (realm) {
      this.realm = realm;
    }

    if (name) {
      this.name = name;
    }
  }
}

class Mount {
}