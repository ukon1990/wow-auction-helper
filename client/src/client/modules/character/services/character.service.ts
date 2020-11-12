import {EventEmitter, Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {SharedService} from '../../../services/shared.service';
import {Endpoints} from '../../../services/endpoints';
import {ErrorOptions, ErrorReport} from '../../../utils/error-report.util';
import {UserUtil} from '../../../utils/user/user.util';
import {Character} from '../models/character.model';
import {BehaviorSubject} from 'rxjs';
import {SubscriptionManager} from '@ukon1990/subscription-manager';
import {RealmService} from '../../../services/realm.service';
import {TextUtil} from '@ukon1990/js-utilities';
import {AuctionHouseStatus} from '../../auction/models/auction-house-status.model';
import {CraftingService} from '../../../services/crafting.service';
import {CharacterProfession} from '../../../../../../api/src/character/model';
import {Report} from '../../../utils/report.util';
import {SettingsService} from '../../user/services/settings/settings.service';
import {UserSettings} from '../../user/models/settings.model';

@Injectable()
export class CharacterService {
  static characterRecipeMapForRealm: BehaviorSubject<Map<number, string>> =
    new BehaviorSubject<Map<number, string>>(new Map<number, string>());

  private sm = new SubscriptionManager();
  private readonly GQL_FIELDS = `
    characters {
      lastModified
      name
      slug
    }
  `;
  events: EventEmitter<any> = new EventEmitter();
  characters = new BehaviorSubject<Character[]>([]);
  charactersForRealm: BehaviorSubject<Character[]> = new BehaviorSubject<Character[]>([]);
  charactersForRealmWithRecipes: BehaviorSubject<Character[]> = new BehaviorSubject<Character[]>([]);
  realmStatusIsReady: boolean;
  appSyncIsReady: boolean;

  constructor(private _http: HttpClient,
              private realmService: RealmService,
              private settingsSync: SettingsService,
              private craftingService: CraftingService) {
    const localStorageChars = localStorage.getItem('characters');
    if (localStorageChars) {
      try {
        this.characters.next(JSON.parse(localStorageChars));
      } catch (error) {
        console.error(error);
      }
    }
    this.sm.add(settingsSync.settings, settings => {
      this.appSyncIsReady = !!settings;
      this.handleSettingsUpdate(settings)
        .catch(console.error);
    });
    this.sm.add(realmService.events.list, (list) => {
      this.realmStatusIsReady = !!list.length;
      this.handleSettingsUpdate()
        .catch(console.error);
    });
    this.sm.add(this.realmService.events.realmStatus,
      status => this.updateCharactersForRealmAndRecipes(status));
  }

  getCharacter(name: string, realm: string, region?: string): Promise<Character> {
    SharedService.downloading.characterData = true;
    return new Promise<Character>((resolve, reject) => {
      this._http
        .post(Endpoints.getLambdaUrl(`character`),
          {
            region: region ? region : SharedService.user.region,
            realm,
            name,
            locale: Endpoints.getRealm(UserUtil.slugifyString(realm)).locale,
            withFields: true
          })
        .toPromise()
        .then((char: Character) => {
          SharedService.downloading.characterData = false;
          if (char['error']) {
            reject(char);
          } else {
            resolve(char);
          }
        }).catch(error => {
        SharedService.downloading.characterData = false;
        ErrorReport.sendHttpError(
          error,
          new ErrorOptions(
            true,
            `${
              name
            } could not be found on the realm ${
              realm
            }.`));
        reject(error);
      });
    });
  }

  getCharacterMinimal(character: string, realm: string): Promise<any> {
    SharedService.downloading.characterData = true;
    return this._http
      .post(Endpoints.getLambdaUrl(`character`),
        {
          region: SharedService.user.region,
          realm: realm,
          name: character.toLowerCase(),
          locale: Endpoints.getRealm(UserUtil.slugifyString(realm)).locale,
          withFields: false
        })
      .toPromise()
      .then(c => {
        SharedService.downloading.characterData = false;
        return c;
      }).catch(error => {
        SharedService.downloading.characterData = false;
        console.error('Failed at downloading character', error);
        ErrorReport.sendHttpError(error);
        return {error: error};
      });
  }

  updateCharactersForRealmAndRecipes(status: AuctionHouseStatus = this.realmService.events.realmStatus.value) {

    const withRecipes: Character[] = [];
    const currentCharacters: Character[] = [];
    if (this.characters.value && status) {
      const map = new Map<number, string[]>();
      CraftingService.recipesForUser.value.clear();
      this.characters.value.filter(character => {
        if (TextUtil.contains(status.connectedTo.join(','), character.slug)) {
          currentCharacters.push(character);

          if (this.characterHaveRecipes(character)) {
            withRecipes.push(character);
            this.setRecipesForCharacter(character, map);
          }
        }
      });
      CraftingService.recipesForUser.next(map);
      this.craftingService.setItemRecipeMapPerKnown();
    }
    this.charactersForRealm.next(currentCharacters);
    this.charactersForRealmWithRecipes.next(withRecipes);
  }


  /**
   * Grouping the current recipes for a user
   */

  /*
  public updateRecipesForRealm(): void {
    // TODO: fix
    CraftingService.recipesForUser.value.clear();
    SharedService.user.characters.forEach(character => {
      this.setRecipesForCharacter(character);
    });
  }*/

  public setRecipesForCharacter(character: Character, userRecipeMap: Map<number, string[]>): void {
    if (character && character.professions) {
      if (character.professions.primaries) {
        character.professions.primaries.forEach(primary => {
          this.addKnownRecipes(primary, character, userRecipeMap);
        });
      }
      if (character.professions.secondaries) {
        character.professions.secondaries.forEach(secondary =>
          this.addKnownRecipes(secondary, character, userRecipeMap));
      }
    }
  }

  private addKnownRecipes(category: CharacterProfession, character: Character, userRecipeMap: Map<number, string[]>) {
    category.skillTiers.forEach(tier =>
      tier.recipes.forEach(recipe =>
        this.addRecipe(recipe, character.name, character.faction, userRecipeMap)));
  }

  private addRecipe(id: number, characterName: string, faction: number, userRecipeMap: Map<number, string[]>): void {
    if (!userRecipeMap.has(id)) {
      userRecipeMap.set(id, []);
    }
    userRecipeMap.get(id).push(
      `${characterName} (${faction ? 'H' : 'A'})`);
  }

  private characterHaveRecipes(character: Character): boolean {
    if (!character.professions) {
      return false;
    }
    return !!(character.professions.primaries && character.professions.primaries.length) ||
      !!(character.professions.secondaries && character.professions.secondaries.length);
  }

  remove(character: Character) {
    return new Promise<void>(async (resolve) => {
      const index = this.getCharacterIndex(character);
      this.characters.value.splice(index, 1);
      localStorage['characters'] = JSON.stringify(this.characters.value);
      this.updateAppSync();
      try {
        RealmService.gatherRealms();
        this.updateCharactersForRealmAndRecipes();
      } catch (e) {
        ErrorReport.sendError('removeCharacter', e);
      }

      Report.send('Removed character', 'Characters');
      resolve();
    });
  }

  update(character: Character, updateAppSync = true): Promise<Character> {
    if (!character) {
      return;
    }
    const professions = character.professions;

    return new Promise<Character>((resolve, reject) => {
      if (!SharedService.user || !SharedService.user.region) {
        resolve(character);
        return;
      }
      const region = SharedService.user.region;
      this.getCharacter(
        character.name,
        character.slug,
        region
      ).then(async c => {
        if (c && !c.error && this.characters.value) {
          if (!c.professions) {
            c.professions = professions;
          }
          const index = this.getCharacterIndex(character);
          if (index !== undefined) {
            this.characters.value[index] = c;
          } else {
            this.characters.next([...this.characters.value, c]);
          }

          localStorage['characters'] = JSON.stringify(this.characters.value);
          if (updateAppSync) {
            this.updateAppSync();
          }
          this.updateCharactersForRealmAndRecipes();

          Report.send('Updated', 'Characters');
          this.events.emit(c);
          resolve(c);
        } else {
          ErrorReport.sendHttpError(
            c.error,
            new ErrorOptions(true, 'Could not update the character'));
          reject(c.error);
        }
      }).catch(error => {
        this.handleCharacterError(error, name, character.realm);
        reject(error);
      });
    });
  }

  updateAppSync() {
    this.settingsSync.updateSettings(
      this.settingsSync.reduceCharacters(
        this.characters.value));
  }

  private getCharacterIndex(character: Character) {
    let index: number;
    this.characters.value
      .forEach((char: Character, i: number) => {
        if (char.name === character.name && char.realm === character.realm) {
          index = i;
        }
      });
    return index;
  }

  handleCharacterError(error: HttpErrorResponse, name: string, realm: string) {
    ErrorReport.sendHttpError(
      error,
      new ErrorOptions(
        true,
        `${name} could not be found on ${realm}. If you are sure that the name matches, try loggin in and out of the character.`));
  }

  private async handleSettingsUpdate(settings: UserSettings = this.settingsSync.settings.value) {
    if (!this.realmStatusIsReady || !this.appSyncIsReady) {
      return;
    }
    if (settings && settings.characters) {
      console.log('Checking for character updates on other devices');
      const characters: Character[] = [];
      const charMap = new Map<string, Character>();
      const updatePromises: Promise<void>[] = [];
      const getId = (character: Character) => `${character.slug}-${character.name}`;

      (this.characters.value || []).forEach(character => {
        charMap.set(getId(character), character);
      });
      settings.characters.forEach(character => {
        const alreadyStored: Character = charMap.get(getId(character));
        if (alreadyStored &&
          alreadyStored.lastModified >= character.lastModified) {
          characters.push(alreadyStored);
        } else {
          updatePromises.push(
            new Promise<void>(async resolve => {
              await this.update(character, false)
                .then(char => characters.push(char))
                .catch(console.error);
              resolve();
            })
          );
        }
      });
      console.log(`Updating ${updatePromises.length} characters`);

      await Promise.all(updatePromises)
        .catch(console.error);
      this.characters.next(characters);
    }
  }
}
