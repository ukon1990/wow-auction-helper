import {SharedService} from '../services/shared.service';
import {itemClasses} from '../models/item/item-classes';
import {Item} from '../models/item/item';
import {TextUtil} from '@ukon1990/js-utilities/dist/utils/text.util';
import {Recipe} from '../modules/crafting/models/recipe';
import {EmptyUtil} from '@ukon1990/js-utilities/dist/utils/empty.util';
import {AuctionItem} from '../modules/auction/models/auction-item.model';
import {Pet} from '../modules/pet/models/pet';

export class Filters {
  public static isNameMatch(itemID: number, name: string, speciesId?: number): boolean {
    if (TextUtil.isEmpty(name)) {
      return true;
    }
    const pet: Pet = SharedService.pets[speciesId],
      nameForId = pet ? pet.name : Filters.getItemName(itemID);
    return TextUtil.contains(nameForId, name);
  }

  public static isBelowMarketValue(itemID: number, marketValuePercent: number): boolean {
    const auctionItem: AuctionItem = SharedService.auctionItemsMap[itemID];
    if (Filters.isUsingAPI() && auctionItem) {
      if (EmptyUtil.isNullOrUndefined(marketValuePercent) || marketValuePercent === 0) {
        return true;
      }

      if (!auctionItem.mktPrice) {
        return false;
      }
      const result = Math.round((auctionItem.buyout / auctionItem.mktPrice) * 100);
      return result <= marketValuePercent;
    }
    return !EmptyUtil.isNullOrUndefined(auctionItem);
  }

  public static isBelowSellToVendorPrice(itemID: number, onlyVendorSellable): boolean {
    if (onlyVendorSellable) {
      return SharedService.auctionItemsMap[itemID].vendorSell > 0 &&
        SharedService.auctionItemsMap[itemID].buyout <= SharedService.auctionItemsMap[itemID].vendorSell &&
        SharedService.auctionItemsMap[itemID].bid <= SharedService.auctionItemsMap[itemID].vendorSell;
    }
    return true;
  }

  public static isItemAboveQuality(id: number, minItemQuality: number): boolean {
    if (typeof minItemQuality !== 'number') {
      return true;
    }
    return (SharedService.items[id] as Item).quality >= minItemQuality;
  }

  public static isAboveItemLevel(itemId: number, minItemLevel: number): boolean {
    /* istanbul ignore next */
    if (EmptyUtil.isNullOrUndefined(minItemLevel)) {
      return true;
    }
    const item: Item = SharedService.items[itemId];
    return item && item.itemLevel >= minItemLevel;
  }

  public static isSaleRateMatch(itemID: number, saleRate: number): boolean {
    if (EmptyUtil.isNullOrUndefined(saleRate) || !Filters.isUsingAPI()) {
      return true;
    }
    const item: AuctionItem = SharedService.auctionItemsMap[itemID],
      minSaleRatePercent = saleRate / 100;
    return item && item.regionSaleRate >= minSaleRatePercent;
  }

  public static isDailySoldMatch(itemID: number, avgDailySold: number): boolean {
    if (!SharedService.auctionItemsMap[itemID]) {
      return false;
    }

    if (Filters.isUsingAPI() && avgDailySold && avgDailySold > 0) {
      return SharedService.auctionItemsMap[itemID].avgDailySold >= avgDailySold;
    }
    return true;
  }

  public static isItemClassMatch(itemID: number, itemClassIndex: number, itemSubClassIndex: number): boolean {
    const classForId = SharedService.items[itemID] ? SharedService.items[itemID].itemClass : -1;
    if (EmptyUtil.isNullOrUndefined(itemClassIndex) || itemClassIndex === -1) {
      return true;
    }
    const iClass = itemClasses.classes[itemClassIndex];

    return !iClass || classForId === iClass.class &&
      this.isItemSubclassMatch(itemID, iClass.subclasses, itemSubClassIndex);
  }

  private static isItemSubclassMatch(itemID: number, subClasses: any, itemSubClassIndex: number): boolean {
    const subClassForId = SharedService.items[itemID] ? SharedService.items[itemID].itemSubClass : -1;

    if (EmptyUtil.isNullOrUndefined(itemSubClassIndex) || itemSubClassIndex === -1) {
      return true;
    }
    const iSubClass = subClasses[itemSubClassIndex];

    return !iSubClass || subClassForId === iSubClass.subclass;
  }

  public static isUsingAPI(): boolean {
    return true; // SharedService.user.apiToUse !== 'none';
  }

  /* istanbul ignore next */
  private static getItemName(itemID): string {
    return SharedService.items[itemID] ?
      SharedService.items[itemID].name : '';
  }

  public static isExpansionMatch(itemID: number, expansionId: number): boolean {
    const item: Item = SharedService.items[itemID] as Item;
    if (EmptyUtil.isNullOrUndefined(expansionId) || expansionId === -1) {
      return true;
    }
    return item &&
      expansionId === item.expansionId;
  }

  static isProfessionMatch(itemID: number, profession: string) {
    const recipes: Recipe[] = SharedService.itemRecipeMap[itemID];

    if (EmptyUtil.isNullOrUndefined(profession) || profession === 'All') {
      return true;
    }

    if (!recipes || !recipes[0]) {
      return false;
    }

    return profession === recipes[0].profession ||
      !recipes[0].profession && profession === 'none';
  }

  static isProfitMatch(recipe: Recipe, itemID: number, profit: number) {
    if (!recipe && SharedService.itemRecipeMap[itemID]) {
      recipe = SharedService.itemRecipeMap[itemID][0];
    }

    if (EmptyUtil.isNullOrUndefined(recipe)) {
      return false;
    }

    return EmptyUtil.isNullOrUndefined(profit) || profit === 0 ||
      recipe.buyout > 0 && recipe.cost > 0 && profit <= recipe.roi / recipe.cost * 100;
  }

  static isXSmallerThanY(x: number, y: number) {
    return EmptyUtil.isNullOrUndefined(y) || x < y;
  }

  static isXSmallerThanOrEqualToY(x: number, y: number) {
    return EmptyUtil.isNullOrUndefined(y) || x <= y;
  }
}
