import {SharedService} from '../../services/shared.service';
import {ProspectingAndMillingUtil} from '../prospect-milling.util';
import {CustomPrices} from '../../modules/crafting/models/custom-price';
import {CustomProcUtil} from '../../modules/crafting/utils/custom-proc.util';
import {NotificationSettings} from '../../models/user/notification';
import {Character} from '../../modules/character/models/character.model';
import {CharacterProfession} from '../../../../../api/src/character/model';
import {User} from '../../models/user/user';
import {Recipe} from '../../modules/crafting/models/recipe';
import {CraftingService} from '../../services/crafting.service';

export class UserUtil {
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
        case 'doNotReport':
          localStorage.setItem(key, JSON.stringify(user[key]));
          SharedService.user[key] = user[key];
          break;
        case 'faction':
        case 'ahTypeId':
        case 'gameVersion':
        case 'craftingStrategy':
          // Number values
          localStorage.setItem(key, '' + user[key]);
          SharedService.user[key] = +user[key];
          break;
        case 'region':
        case 'realm':
        case 'classicRealm':
        case 'character':
          localStorage[key] = user[key];
          SharedService.user[key] = user[key];
          break;
        case 'customPrices':
          localStorage['custom_prices'] = JSON.stringify(user[key]);
          SharedService.user.customPrices = user[key];
          break;
        case 'customProcs':
          localStorage['custom_procs'] = JSON.stringify(user[key]);
          SharedService.user.customProcs = user[key];
          break;
        case 'buyoutLimit':
          localStorage['crafting_buyout_limit'] = user[key];
          SharedService.user.buyoutLimit = user[key];
          break;
        case 'characters':
          this.setStringifiedValues(key, user);
          break;
        case 'notifications':
          this.setStringifiedValues(key, user);
          break;
        case 'useVendorPriceForCraftingIfAvailable':
        case 'isDarkMode':
          this.setStringifiedValues(key, user);
          break;
        case 'useIntermediateCrafting':
          localStorage['use_intermediate_crafting'] = JSON.stringify(user[key]);
          SharedService.user.useIntermediateCrafting = user[key];
          break;
        case ProspectingAndMillingUtil.TYPES.MILLING:
          ProspectingAndMillingUtil.mills = user[key];
          ProspectingAndMillingUtil.save();
          break;
        case ProspectingAndMillingUtil.TYPES.PROSPECTING:
          ProspectingAndMillingUtil.prospecting = user[key];
          ProspectingAndMillingUtil.save();
          break;
      }
    });

    if (user.realm && user.region) {
      SharedService.events.isUserSet.next(true);
    } else {
      SharedService.events.isUserSet.next(false);
    }
  }

  private static setStringifiedValues(key: string, user: User) {
    localStorage[key] = JSON.stringify(user[key]);
    SharedService.user[key] = user[key];
  }

  public static restore(): void {
    SharedService.user = UserUtil.getSettings();
    if (SharedService.user.realm && SharedService.user.region) {
      SharedService.events.isUserSet.next(true);
    }
  }

  public static delete(): void {
    Object.keys(localStorage)
      .forEach(k => delete localStorage[k]);
    // lists.myRecipes = [];
    SharedService.user = new User();
  }

  public static getSettings(isExport?: boolean): User {
    const user: User = new User();

    Object.keys(localStorage).forEach(key => {
      const entry = localStorage.getItem(key);
      if (!entry || entry === 'undefined') {
        return;
      }
      switch (key) {
        case 'gameVersion':
        case 'faction':
        case 'ahTypeId':
        case 'craftingStrategy':
          user[key] = +entry;
          break;
        case 'region':
        case 'realm':
        case 'classicRealm':
        case 'character':
          user[key] = entry;
          break;
        case 'custom_prices':
          const cp = JSON.parse(entry);
          if (cp instanceof Array) {
            user.customPrices = cp;
          } else {
            user.customPrices = CustomPrices.convertFromOldVersion(cp);
          }

          CustomPrices.createMap(user.customPrices);
          break;
        case 'custom_procs':
          user.customProcs = JSON.parse(entry);
          CustomProcUtil.createMap(user.customProcs);
          break;
        case 'crafting_buyout_limit':
          user.buyoutLimit = parseFloat(entry);
          break;
        case 'characters':
        case 'useIntermediateCrafting':
          user[key] = JSON.parse(entry);
          break;
        case 'notifications':
          user.notifications = new NotificationSettings(JSON.parse(entry));
          break;
        case 'watchlist':
          if (isExport) {
            user.watchlist = JSON.parse(entry);
          }
          break;
        case ProspectingAndMillingUtil.TYPES.MILLING:
          if (isExport) {
            user[ProspectingAndMillingUtil.TYPES.MILLING] = ProspectingAndMillingUtil.mills;
          }
          break;
        case ProspectingAndMillingUtil.TYPES.PROSPECTING:
          if (isExport) {
            user[ProspectingAndMillingUtil.TYPES.PROSPECTING] = ProspectingAndMillingUtil.prospecting;
          }
          break;
        default:
          try {
            user[key] = JSON.parse(entry);
          } catch (e) {
          }
          break;
      }
    });

    if (user.customProcs.length === 0) {
      user.customProcs = [];
    }
    return user;
  }

  public static slugifyString(realm: string): string {
    return realm ? realm.replace(/[']/g, '').replace(/[.*+?^${}()|[\]\\ ]/g, '-').toLowerCase() : realm;
  }
}
