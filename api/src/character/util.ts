import {Character, CharacterProfession, CollectedPet, UserPets} from './model';
import {HttpClientUtil} from '../utils/http-client.util';
import {Endpoints} from '../utils/endpoints.util';
import {CharacterGameData, Faction} from '../models/character/character-game-data.model';
import {CharacterReputationsGameData} from '../models/character/character-reputations-game-data.model';


export class CharacterUtil {

  static getCreatureDisplay(creatureDisplay:  {id: number}): Promise<string> {
    return new Promise((resolve) => {
      if (!creatureDisplay || !creatureDisplay.id) {
        resolve('');
        return;
      }
      const url = new Endpoints().getPath('media/creature-display/' + creatureDisplay.id);
      new HttpClientUtil().get(url)
        .then(resolve)
        .catch(() => resolve(''));
    });
  }

  static reducePets(pets: any[], unlockedSlots: number): Promise<UserPets> {
    return new Promise<UserPets>(async (resolve, reject) => {
      const list: CollectedPet[] = [];
      for (const pet of pets) {
        try {
          list.push({
            id: pet.id,
            speciesId: pet.species.id,
            creatureId: pet.creature_display ? pet.creature_display.id : undefined,
            name: pet.name || pet.species.name,
            speciesName: pet.species.name,
            creatureDisplay: pet.creature_display,
            level: pet.level,
            quality: pet.quality.type,
            stats: {
              breedId: pet.stats.breed_id,
              health: pet.stats.health,
              power: pet.stats.power,
              speed: pet.stats.speed
            },
          });
        } catch (e) {
        }
      }

      resolve({
        unlockedBattlePetSlots: unlockedSlots,
        list
      });
    });
  }

  private static professionFromAPI(primary: any): CharacterProfession {
    let skillTiers = [];
    if (primary.tiers) {
      skillTiers = primary.tiers.map((tier: any) => ({
        id: tier.tier.id,
        points: tier.skill_points,
        recipes: tier.known_recipes ? tier.known_recipes.map(r => r.id) : []
      }));
    }

    return {
      id: primary.profession.id,
      skillTiers
    };
  }

  static reduceProfessions(body, character: Character) {
    const primaries: CharacterProfession[] = [],
      secondaries: CharacterProfession[] = [];

    if (body.primaries) {
      body.primaries.forEach(profession =>
        primaries.push(this.professionFromAPI(profession)));
    }
    if (body.secondaries) {
      body.secondaries.forEach(profession =>
        secondaries.push(this.professionFromAPI(profession)));
    }
    character.professions = {
      primaries,
      secondaries
    };
  }


  static setProfileBaseData(gameData: CharacterGameData, character: Character): void {
    character.name = gameData.name;
    character.faction = this.getFaction(gameData.faction);
    character.slug = gameData.realm.slug;
    character.realm = gameData.realm.name;
    character.guild = gameData.guild ? gameData.guild.name : undefined;
    character.level = gameData.level;
    character.lastModified = gameData.last_login_timestamp;
  }

  private static getFaction(faction: Faction): number {
    return faction.type === 'HORDE' ? 1 : 0;
  }

  static setReputationsBaseData(body: CharacterReputationsGameData, character: Character) {
    if (character.reputations) {
      body.reputations.forEach(reputation => {
        delete reputation.faction.key;
      });
      character.reputations = body.reputations;
    } else {
      character.reputations = [];
    }
  }
}
