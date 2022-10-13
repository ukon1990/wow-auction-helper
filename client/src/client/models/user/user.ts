import {NotificationSettings} from './notification';
import {Character} from '../../modules/character/models/character.model';
import {CustomPrice} from '../../modules/crafting/models/custom-price';
import {customPricesDefault} from '../../modules/crafting/models/default-custom-prices';
import {CustomProc} from '../../modules/crafting/models/custom-proc.model';
import {BaseCraftingUtil} from '../../modules/crafting/utils/base-crafting.util';


export class User {
  faction: number;
  region: string;
  realm: string;
  ahId: number;
  character = '';
  characters: Array<Character> = new Array<Character>();
  customPrices: CustomPrice[] = customPricesDefault;
  customProcs: CustomProc[] = [];
  apiToUse = 'none';
  // If buyout is 200% of MV, use MV instead. (asuming the item is overpriced)
  buyoutLimit = 200;
  useVendorPriceForCraftingIfAvailable = true;
  useIntermediateCrafting = true;
  notifications: NotificationSettings = new NotificationSettings();
  isDarkMode = true;
  doNotReport = false;
  gameVersion = 0;
  ahTypeId = 0;
  classicRealm: string;
  craftingStrategy: number = BaseCraftingUtil.STRATEGY.NEEDED;
  locale: string;
}