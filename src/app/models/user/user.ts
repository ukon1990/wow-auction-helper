import { Notification } from './notification';
import { Watchlist } from './watchlist';
import { SharedService } from '../../services/shared.service';



export class User {
  region: string;
  realm: string;
  character = '';
  characters: any[] = [];
  apiWoWu?: string;
  apiTsm?: string;
  customPrices?: any;
  apiToUse = 'none';
  // If buyout is 200% of MV, use MV instead. (asuming the item is overpriced)
  buyoutLimit = 200;
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

  public static save(user: User): void {
    if (!SharedService.user) {
      SharedService.user = new User();
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
        case 'notifications':
          localStorage['notifications'] = JSON.stringify(user[key]);
          SharedService.user.notifications = user[key];
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
          user.customPrices = JSON.parse(localStorage[key]);
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
        case 'notifications':
          user.notifications = JSON.parse(localStorage[key]);
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
    // lists.myRecipes.length = 0;
    SharedService.user.characters.forEach(character => {
      this.setRecipesForCharacter(character);
      // lists.myRecipes = Array.from(new Set(lists.myRecipes));
    });
  }

  public static setRecipesForCharacter(character): void {
    if (character && character.professions &&
      SharedService.user.realm.toLowerCase() === character.realm
        .replace(/[.*+?^${}()|[\]\\ ']/g, '-').toLowerCase()) {
      character.professions.primary.forEach(primary => {
        primary.recipes.forEach(recipe => {
          // lists.myRecipes.push(recipe);
        });
      });
      character.professions.secondary.forEach(secondary => {
        secondary.recipes.forEach(recipe => {
          // lists.myRecipes.push(recipe);
        });
      });
    }
  }
}
