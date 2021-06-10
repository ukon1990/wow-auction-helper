import {Character, SettingsCharacter} from '../../character/models/character.model';
import {CustomPrice} from '../../crafting/models/custom-price';
import {customPricesDefault} from '../../crafting/models/default-custom-prices';
import {CustomProc} from '../../crafting/models/custom-proc.model';
import {BaseCraftingUtil} from '../../crafting/utils/base-crafting.util';
import {Theme} from '../../core/models/theme.model';
import {CartItem, CartRecipe} from '../../shopping-cart/models/shopping-cart-v2.model';
import {NotificationSettings} from '../../../models/user/notification';

export class UserSettings {
  id?: string;
  ahTypeId?: number;
  region?: string;
  realm?: string;
  faction?: number;
  locale?: string;
  characters: SettingsCharacter[] = [];
  customPrices: CustomPrice[] = customPricesDefault;
  customProcs: CustomProc[] = [];
  dashboards: any[]; // Just a version of DashboardV2 but with JSON.stringify
  // If buyout is 200% of MV, use MV instead. (asuming the item is overpriced)
  buyoutLimit = 200;
  shoppingCart: {recipes: CartRecipe[], items: CartItem[]} = {
    recipes: [],
    items: [],
  };
  useVendorPriceForCraftingIfAvailable = true;
  useIntermediateCrafting = true;
  craftingStrategy: number = BaseCraftingUtil.STRATEGY.NEEDED;
  theme: Theme;
  notifications: NotificationSettings;
  lastModified?: number;
}
