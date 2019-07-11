import {SharedService} from '../services/shared.service';
import {itemClasses} from './item/item-classes';
import {Item} from './item/item';
import {TextUtil} from '@ukon1990/js-utilities/dist/utils/text.util';
import {Recipe} from '../modules/crafting/models/recipe';

export class Filters {
  public static isNameMatch(itemID: number, name: string): boolean {
    if (name === null || name.length === 0) {
      return true;
    }
    return TextUtil.contains(Filters.getItemName(itemID), name);
  }

  public static isBelowMarketValue(itemID: number, marketValue: number): boolean {
    if (Filters.isUsingAPI() && (marketValue === null || marketValue === 0)) {
      return true;
    } else if (Filters.isUsingAPI() && SharedService.auctionItemsMap[itemID].mktPrice === 0) {
      return false;
    } else if (Filters.isUsingAPI()) {
      return Math.round((
        SharedService.auctionItemsMap[itemID].buyout / SharedService.auctionItemsMap[itemID].mktPrice
      ) * 100) <= marketValue;
    }
    return true;
  }

  public static isBelowVendorPrice(itemID: number, onlyVendorSellable): boolean {
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

  public static isAboveItemLevel(id: number, minItemLevel: number): boolean {
    if (typeof minItemLevel !== 'number') {
      return true;
    }
    return (SharedService.items[id] as Item).itemLevel >= minItemLevel;
  }

  public static isSaleRateMatch(itemID: number, saleRate: number): boolean {
    if (!SharedService.auctionItemsMap[itemID]) {
      return false;
    }

    if (Filters.isUsingAPI() && saleRate && saleRate > 0) {
      return SharedService.auctionItemsMap[itemID].regionSaleRate >= saleRate / 100;
    }
    return true;
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

  public static isItemClassMatch(itemID: number, itemClass: number, itemSubClass: number): boolean {
    const classForId = SharedService.items[itemID] ? SharedService.items[itemID].itemClass : -1;

    if (isNaN(itemClass)) {
      itemClass = parseInt('' + itemClass, 10);
    }

    if (isNaN(itemSubClass)) {
      itemSubClass = parseInt('' + itemSubClass, 10);
    }

    if (itemClass === null || itemClass === -1) {
      return true;
    } else if (itemClasses.classes[itemClass] &&
      parseInt(classForId, 10) === itemClasses.classes[itemClass].class) {
      return Filters.isItemSubclassMatch(
        itemID, itemClasses.classes[itemClass], itemSubClass);
    }

    return false;
  }

  public static isItemSubclassMatch(itemID: number, subClasses: any, subClass: number): boolean {
    const itemSubClass = SharedService.items[itemID] ? SharedService.items[itemID].itemSubClass : -1;

    if (itemSubClass === null || itemSubClass === -1 ||
      itemSubClass === '-1' || itemSubClass === undefined) {
      return true;
    } else {
      if (!subClasses.subclasses[itemSubClass]) {
        return true;
      }
      return subClass > -1 ?
        subClasses.subclasses[itemSubClass].subclass === parseInt(itemSubClass, 10) : false;
    }
  }

  public static isUsingAPI(): boolean {
    return SharedService.user.apiToUse !== 'none';
  }

  /* istanbul ignore next */
  private static getItemName(itemID): string {
    return SharedService.auctionItemsMap[itemID] ?
      SharedService.auctionItemsMap[itemID].name : SharedService.items[itemID].name;
  }

  public static isExpansionMatch(itemID: number, expansionId: number): boolean {
    try {
      return expansionId === null ||
        expansionId === undefined ||
        expansionId === (SharedService.items[itemID] as Item).expansionId;
    } catch (error) {
      return false;
    }
  }

  static isProfessionMatch(itemID: number, profession: string) {
    const recipe: Recipe = SharedService.itemRecipeMap[itemID];
    if (!recipe || !recipe[0]) {
      return false;
    }

    return profession === null || profession === 'All' ||
      profession === recipe[0].profession || !recipe[0].profession && profession === 'none';
  }

  static isProfitMatch(recipe: Recipe, itemID: number, profit: number) {
    if (!recipe && SharedService.itemRecipeMap[itemID]) {
      recipe = SharedService.itemRecipeMap[itemID][0];
    }

    if (!recipe && !recipe[0]) {
      return false;
    }

    return profit === null || profit === 0 ||
      recipe[0].buyout > 0 && recipe[0].cost > 0 && profit <= recipe[0].roi / recipe[0].cost * 100;
  }
}
