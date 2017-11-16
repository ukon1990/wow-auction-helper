import { Notification } from "app/models/notification";
import { CharacterService } from "app/services/character.service";

export class User {
  region: string;
	realm: string;
	character?: string;
	characters: any[];
	apiWoWu?: string;
	apiTsm?: string;
	customPrices?: any;
	apiToUse: string;
	buyoutLimit: number = 200;
	crafters: any[];
	notifications: Notification = {
		isUpdateAvailable: true,
		isBelowVendorSell: true,
		isUndercutted: true,
		isWatchlist: true
  };
	watchlist?: {recipes: object, items: object, groups: any[]};
	isDarkMode?: boolean;

  /**
   * 
   * @param object JSON string exported from the application
   */
  public static import(object: string) {
    CharacterService.user = JSON.parse(object) as User;
    this.save(CharacterService.user);
  }

  private static save(user: User): void {
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
          localStorage['custom_prices'] = user[key];
          break;
        case 'apiToUse':
          localStorage['api_to_use'] = user[key];
          break;
        case 'buyoutLimit':
          localStorage['crafting_buyout_limit'] = user[key];
          break;
        case 'characters':
          localStorage['characters'] = user[key];
          break;
        case 'notifications':
          localStorage['notifications'] = user[key];
          break;
      }
    });
  }

  public static restore(): User {
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
    return user;
  }
}