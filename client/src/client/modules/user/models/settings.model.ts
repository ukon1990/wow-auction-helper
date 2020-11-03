import { Character } from '../../character/models/character.model';
import {CustomPrice} from '../../crafting/models/custom-price';
import {customPricesDefault} from '../../crafting/models/default-custom-prices';
import {CustomProc} from '../../crafting/models/custom-proc.model';
import {BaseCraftingUtil} from '../../crafting/utils/base-crafting.util';
import {Theme} from '../../core/models/theme.model';

export class UserSettings {
  id?: string;
  region?: string;
  realm?: string;
  faction?: number;
  locale?: string;
  characters: Character[] = [];
  customPrices: CustomPrice[] = customPricesDefault;
  customProcs: CustomProc[] = [];
  // If buyout is 200% of MV, use MV instead. (asuming the item is overpriced)
  buyoutLimit = 200;
  useVendorPriceForCraftingIfAvailable = true;
  useIntermediateCrafting = true;
  craftingStrategy: number = BaseCraftingUtil.STRATEGY.NEEDED;
  theme: Theme;
}
