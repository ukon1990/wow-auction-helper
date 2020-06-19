import {NotificationSettings} from './notification';
import {SharedService} from '../../services/shared.service';
import {Character} from '../../modules/character/models/character.model';
import {Watchlist} from '../../modules/dashboard/models/watchlist.model';
import {CustomPrice, CustomPrices} from '../../modules/crafting/models/custom-price';
import {customPricesDefault} from '../../modules/crafting/models/default-custom-prices';
import {CustomProc} from '../../modules/crafting/models/custom-proc.model';
import {ProspectingAndMillingUtil} from '../../utils/prospect-milling.util';
import {ShoppingCart} from '../../modules/shopping-cart/models/shopping-cart.model';
import {CustomProcUtil} from '../../modules/crafting/utils/custom-proc.util';
import {BaseCraftingUtil} from '../../modules/crafting/utils/base-crafting.util';
import {CharacterProfession} from '../../../../../api/src/character/model';


export class User {
  faction: number;
  region: string;
  realm: string;
  character = '';
  characters: Array<Character> = new Array<Character>();
  apiWoWu?: string;
  apiTsm?: string;
  customPrices: CustomPrice[] = customPricesDefault;
  customProcs: CustomProc[] = [];
  apiToUse = 'none';
  // If buyout is 200% of MV, use MV instead. (asuming the item is overpriced)
  buyoutLimit = 200;
  useVendorPriceForCraftingIfAvailable = true;
  useIntermediateCrafting = true;
  crafters: any[];
  notifications: NotificationSettings = new NotificationSettings();
  watchlist: Watchlist = new Watchlist();
  shoppingCart: ShoppingCart = new ShoppingCart();
  isDarkMode = true;
  doNotReport = false;
  gameVersion = 0;
  classicRealm: string;
  craftingStrategy: number = BaseCraftingUtil.STRATEGY.NEEDED;

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
      this.updateRecipesForRealm();
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
    SharedService.user = User.getSettings();
    if (SharedService.user.realm && SharedService.user.region) {
      this.updateRecipesForRealm();
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
      switch (key) {
        case 'gameVersion':
        case 'faction':
        case 'craftingStrategy':
          user[key] = +localStorage[key];
          break;
        case 'region':
        case 'realm':
        case 'classicRealm':
        case 'character':
          user[key] = localStorage[key];
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
        case 'custom_procs':
          user.customProcs = JSON.parse(localStorage[key]);

          CustomProcUtil.createMap(user.customProcs);
          break;
        case 'crafting_buyout_limit':
          user.buyoutLimit = parseFloat(localStorage[key]);
          break;
        case 'characters':
        case 'useIntermediateCrafting':
          user[key] = JSON.parse(localStorage[key]);
          break;
        case 'notifications':
          user.notifications = new NotificationSettings(JSON.parse(localStorage[key]));
          break;
        case 'watchlist':
          if (isExport) {
            user.watchlist = JSON.parse(localStorage[key]);
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
            user[key] = JSON.parse(localStorage[key]);
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

  /**
   * Grouping the current recipes for a user
   */
  public static updateRecipesForRealm(): void {
    SharedService.recipesForUser = new Map<number, Array<string>>();
    SharedService.user.characters.forEach(character => {
      this.setRecipesForCharacter(character);
    });
  }

  public static setRecipesForCharacter(character: Character): void {
    if (character && character.professions &&
      SharedService.user.realm.toLowerCase() === User.slugifyString(character.realm)) {
      character.professions.primaries.forEach(primary => {
        this.addKnownRecipes(primary, character);
      });
      character.professions.primaries.forEach(secondary => this.addKnownRecipes(secondary, character));
    }
  }

  private static addKnownRecipes(category: CharacterProfession, character: Character) {
    category.skillTiers.forEach(tier =>
      tier.recipes.forEach(recipe =>
        User.addRecipe(recipe, character.name, character.faction)));
  }

  private static addRecipe(id: number, characterName: string, faction: number): void {
    if (!SharedService.recipesForUser[id]) {
      SharedService.recipesForUser[id] = new Array<string>();
    }
    SharedService.recipesForUser[id].push(
      `${characterName} (${faction ? 'H' : 'A'})`);
  }

  public static slugifyString(realm: string): string {
    return realm.replace(/[']/g, '').replace(/[.*+?^${}()|[\]\\ ]/g, '-').toLowerCase();
  }
}
