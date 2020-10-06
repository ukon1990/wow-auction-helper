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
import {AuctionsService} from '../../../services/auctions.service';
import {AuctionUtil} from '../../auction/utils/auction.util';
import {CraftingUtil} from '../../crafting/utils/crafting.util';

@Injectable()
export class CharacterService {
  static characterRecipeMapForRealm: BehaviorSubject<Map<number, string>> =
    new BehaviorSubject<Map<number, string>>(new Map<number, string>());

  private sm = new SubscriptionManager();
  events: EventEmitter<any> = new EventEmitter();
  charactersForRealm: BehaviorSubject<Character[]> = new BehaviorSubject<Character[]>([]);
  charactersForRealmWithRecipes: BehaviorSubject<Character[]> = new BehaviorSubject<Character[]>([]);

  constructor(private _http: HttpClient,
              private realmService: RealmService,
              private craftingService: CraftingService) {
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
            this.emitChanges(char);
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
        this.emitChanges(c);
        return c;
      }).catch(error => {
        SharedService.downloading.characterData = false;
        console.error('Failed at downloading character', error);
        ErrorReport.sendHttpError(error);
        return {error: error};
      });
  }

  private emitChanges(c: Object) {
    setTimeout(() =>
      this.events.emit(c));
  }

  updateCharactersForRealmAndRecipes(status: AuctionHouseStatus = this.realmService.events.realmStatus.value) {

    const withRecipes: Character[] = [];
    const currentCharacters: Character[] = [];
    if (SharedService.user && SharedService.user.characters && status) {
      const map = new Map<number, string[]>();
      CraftingService.recipesForUser.value.clear();
      SharedService.user.characters.filter(character => {
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
      SharedService.user.characters.splice(index, 1);
      localStorage['characters'] = JSON.stringify(SharedService.user.characters);
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

  update(character: Character): Promise<Character> {
    const professions = character.professions;

    return new Promise<Character>((resolve, reject) => {
      if (!SharedService.user || !SharedService.user.region) {
        resolve(character);
        return;
      }
      const region = SharedService.user.region;
      this.getCharacter(
        character.name,
        UserUtil.slugifyString(character.realm),
        region
      ).then(async c => {
        if (c && !c.error && SharedService.user && SharedService.user.characters) {
          if (!c.professions) {
            c.professions = professions;
          }
          const index = this.getCharacterIndex(character);
          if (index !== undefined) {
            SharedService.user.characters[index] = c;
          } else {
            SharedService.user.characters.push(c);
          }

          localStorage['characters'] = JSON.stringify(SharedService.user.characters);
          this.updateCharactersForRealmAndRecipes();

          Report.send('Updated', 'Characters');
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

  private getCharacterIndex(character: Character) {
    let index: number;
    SharedService.user.characters
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
}
