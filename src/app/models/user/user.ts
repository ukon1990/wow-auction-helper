import { Notification } from './notification';
import { SharedService } from '../../services/shared.service';
import { Character } from '../character/character';
import { Watchlist } from '../watchlist/watchlist';
import { CustomPrice, CustomPrices } from '../crafting/custom-price';
import { CraftingService } from '../../services/crafting.service';
import { Recipe } from '../crafting/recipe';
import { customPricesDefault } from '../crafting/default-custom-prices';



export class User {
  region: string;
  realm: string;
  character = '';
  characters: Array<Character> = new Array<Character>();
  apiWoWu?: string;
  apiTsm?: string;
  customPrices: Array<CustomPrice> = customPricesDefault;
  apiToUse = 'none';
  // If buyout is 200% of MV, use MV instead. (asuming the item is overpriced)
  buyoutLimit = 200;
  useIntermediateCrafting = true;
  crafters: any[];
  notifications: Notification = {
    isUpdateAvailable: true,
    isBelowVendorSell: true,
    isUndercutted: true,
    isWatchlist: true
  };
  watchlist: Watchlist = new Watchlist();
  isDarkMode = true;

  /**
   *
   * @param object JSON string exported from the application
   */
  public static import(object: string) {
    this.save(JSON.parse(object) as User);
  }

  public static save(user?: User): void {
    if (!SharedService.user) {
      SharedService.user = new User();
    }

    if (!user) {
      user = SharedService.user;
    }

    Object.keys(user).forEach(key => {
      switch (key) {
        case 'region':
          localStorage['region'] = user[key];
          SharedService.user.region = user[key];
          break;
        case 'realm':
          localStorage['realm'] = user[key];
          SharedService.user.realm = user[key];
          break;
        case 'character':
          localStorage['character'] = user[key];
          SharedService.user.character = user[key];
          break;
        case 'apiTsm':
          localStorage['api_tsm'] = user[key];
          SharedService.user.apiTsm = user[key];
          break;
        case 'apiWoWu':
          localStorage['api_wowuction'] = user[key];
          SharedService.user.apiWoWu = user[key];
          break;
        case 'customPrices':
          localStorage['custom_prices'] = JSON.stringify(user[key]);
          SharedService.user.customPrices = user[key];
          break;
        case 'apiToUse':
          localStorage['api_to_use'] = user[key];
          SharedService.user.apiToUse = user[key];
          break;
        case 'buyoutLimit':
          localStorage['crafting_buyout_limit'] = user[key];
          SharedService.user.buyoutLimit = user[key];
          break;
        case 'characters':
          localStorage['characters'] = JSON.stringify(user[key]);
          SharedService.user.characters = user[key];
          break;
        case 'useIntermediateCrafting':
          localStorage['use_intermediate_crafting'] = JSON.stringify(user[key]);
          SharedService.user.useIntermediateCrafting = user[key];
          break;
        case 'notifications':
          localStorage['notifications'] = JSON.stringify(user[key]);
          SharedService.user.notifications = user[key];
          break;
        case 'isDarkMode':
          localStorage['isDarkMode'] = JSON.stringify(user[key]);
          SharedService.user.isDarkMode = user[key];
          break;
      }
    });

    if (user.realm && user.region) {
      this.updateRecipesForRealm();
    }
  }

  public static restore(): void {
    const user: User = new User();
    Object.keys(localStorage).forEach(key => {
      switch (key) {
        case 'region':
          user.region = localStorage[key];
          break;
        case 'realm':
          user.realm = localStorage[key];
          break;
        case 'character':
          user.character = localStorage[key];
          break;
        case 'api_tsm':
          user.apiTsm = localStorage[key];
          break;
        case 'api_wowuction':
          user.apiWoWu = localStorage[key];
          break;
        case 'custom_prices':
          const cp = JSON.parse(localStorage[key]);
          if (cp instanceof Array) {
            user.customPrices = cp;
          } else {
            user.customPrices = CustomPrices.convertFromOldVersion(cp);
          }

          CustomPrices.createMap(user.customPrices);
          break;
        case 'api_to_use':
          user.apiToUse = localStorage[key];
          break;
        case 'crafting_buyout_limit':
          user.buyoutLimit = parseFloat(localStorage[key]);
          break;
        case 'characters':
          user.characters = JSON.parse(localStorage[key]);
          break;
        case 'use_intermediate_crafting':
          user.useIntermediateCrafting = JSON.parse(localStorage[key]);
          break;
        case 'notifications':
          user.notifications = JSON.parse(localStorage[key]);
          break;
        case 'isDarkMode':
          user.isDarkMode = JSON.parse(localStorage[key]);
          break;
      }
    });

    SharedService.user = user;
    if (user.realm && user.region) {
      this.updateRecipesForRealm();
    }
  }

  public static delete(): void {
    delete localStorage['region'];
    delete localStorage['realm'];
    delete localStorage['character'];
    delete localStorage['api_tsm'];
    delete localStorage['api_wowuction'];
    delete localStorage['api_to_use'];
    delete localStorage['crafting_buyout_limit'];
    delete localStorage['crafters'];
    delete localStorage['crafters_recipes'];
    delete localStorage['watchlist'];
    delete localStorage['notifications'];
    // lists.myRecipes = [];
    SharedService.user = new User();
  }

  /**
   * Grouping the current recipes for a user
   */
  public static updateRecipesForRealm(): void {
    SharedService.recipesForUser = new Map<number, Array<string>>();
    SharedService.user.characters.forEach(character => {
      this.setRecipesForCharacter(character);
    });
  }

  public static setRecipesForCharacter(character): void {
    if (character && character.professions &&
      SharedService.user.realm.toLowerCase() === character.realm
        .replace(/[.*+?^${}()|[\]\\ ']/g, '-').toLowerCase()) {
      character.professions.primary.forEach(primary => {
        primary.recipes.forEach(recipe => {
          User.addRecipe(recipe, character.name);
        });
      });
      character.professions.secondary.forEach(secondary => {
        secondary.recipes.forEach(recipe => {
          User.addRecipe(recipe, character.name);
        });
      });
    }
  }

  private static addRecipe(spellId: number, characterName: string): void {
    if (!SharedService.recipesForUser[spellId]) {
      SharedService.recipesForUser[spellId] = new Array<string>();
    }
    SharedService.recipesForUser[spellId].push(characterName);
  }
}
