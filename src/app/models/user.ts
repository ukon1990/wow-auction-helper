import { Notification } from "app/models/notification";
import { CharacterService } from "app/services/character.service";
import { lists } from "app/utils/globals";
import { Watchlist } from "app/models/watchlist";
import { watchlist } from "app/utils/objects";

export class User {
  region: string;
	realm: string;
	character: string = '';
	characters: any[] = [];
	apiWoWu?: string;
	apiTsm?: string;
	customPrices?: any;
	apiToUse: string = 'none';
	buyoutLimit: number = 200;
	crafters: any[];
	notifications: Notification = {
		isUpdateAvailable: true,
		isBelowVendorSell: true,
		isUndercutted: true,
		isWatchlist: true
  };
	watchlist: Watchlist = watchlist;
	isDarkMode?: boolean;

  /**
   * 
   * @param object JSON string exported from the application
   */
  public static import(object: string) {
    CharacterService.user = JSON.parse(object) as User;
    this.save(CharacterService.user);
  }

  public static save(user: User): void {
    Object.keys(user).forEach(key => {
      switch(key) {
        case 'region':
          localStorage['region'] = user[key];
          break;
        case 'realm':
          localStorage['realm'] = user[key];
          break;
        case 'character':
          localStorage['character'] = user[key];
          break;
        case 'apiTsm':
          localStorage['api_tsm'] = user[key];
          break;
        case 'apiWoWu':
          localStorage['api_wowuction'] = user[key];
          break;
        case 'customPrices':
          localStorage['custom_prices'] = JSON.stringify(user[key]);
          break;
        case 'apiToUse':
          localStorage['api_to_use'] = user[key];
          break;
        case 'buyoutLimit':
          localStorage['crafting_buyout_limit'] = user[key];
          break;
        case 'characters':
          localStorage['characters'] = JSON.stringify(user[key]);
          break;
        case 'notifications':
          localStorage['notifications'] = JSON.stringify(user[key]);
          break;
      }
    });
  }

  public static restore(): void {
    let user: User = new User();
    Object.keys(localStorage).forEach(key => {
      switch(key) {
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

    CharacterService.user = user;
    this.updateRecipesForRealm();    
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
    lists.myRecipes = [];
    CharacterService.user = new User();
  }

  /**
   * Grouping the current recipes for a user
   */
  public static updateRecipesForRealm(): void {
    lists.myRecipes.length = 0;
    CharacterService.user.characters.forEach(character => {
      this.setRecipesForCharacter(character);
      lists.myRecipes = Array.from(new Set(lists.myRecipes));
    });
  }

  public static setRecipesForCharacter(character): void {
    if (character && character.professions &&
      CharacterService.user.realm.toLowerCase() === character.realm
        .replace(/[.*+?^${}()|[\]\\ ']/g, '-').toLowerCase()) {
      character.professions.primary.forEach(primary => {
        primary.recipes.forEach(recipe => {
          lists.myRecipes.push(recipe);
        });
      });
      character.professions.secondary.forEach(secondary => {
        secondary.recipes.forEach(recipe => {
          lists.myRecipes.push(recipe);
        });
      });
    }
  };
}