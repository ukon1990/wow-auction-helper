import {SharedService} from '../services/shared.service';
import {Item, Pet} from '@shared/models';
import {TextUtil} from '@ukon1990/js-utilities/dist/utils/text.util';
import {Recipe} from '../modules/crafting/models/recipe';
import {EmptyUtil} from '@ukon1990/js-utilities/dist/utils/empty.util';
import {AuctionItem} from '../modules/auction/models/auction-item.model';
import {CraftingService} from '../services/crafting.service';
import {AuctionsService} from '../services/auctions.service';
import {ItemClassService} from '../modules/item/service/item-class.service';
import {ItemClass} from '../modules/item/models/item-class.model';
import {GameBuild} from '@shared/utils';


export class Filters {
  private static auctionService: AuctionsService;

  static init(auctionService: AuctionsService) {
    this.auctionService = auctionService;
  }

  public static isNameMatch(itemID: number, name: string, speciesId?: number, aiId?: string): boolean {
    if (TextUtil.isEmpty(name)) {
      return true;
    }
    const pet: Pet = SharedService.pets[speciesId];
    let nameForId = pet ? pet.name : Filters.getItemName(itemID);
    if (aiId && this.auctionService.getById(aiId)) {
      nameForId = this.auctionService.getById(aiId).name;
    }
    return TextUtil.contains(nameForId, name);
  }

  public static isBelowMarketValue(itemID: number, marketValuePercent: number): boolean {
    if (!marketValuePercent) {
      return true;
    }
    const auctionItem: AuctionItem = this.auctionService.getById(itemID);
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
      return this.auctionService.getById(itemID).vendorSell > 0 &&
        this.auctionService.getById(itemID).buyout <= this.auctionService.getById(itemID).vendorSell &&
        this.auctionService.getById(itemID).bid <= this.auctionService.getById(itemID).vendorSell;
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
    if (EmptyUtil.isNullOrUndefined(minItemLevel) || minItemLevel === 0) {
      return true;
    }
    const item: Item = SharedService.items[itemId];
    return item && item.itemLevel >= minItemLevel;
  }

  public static isSaleRateMatch(itemID: number, saleRate: number, requirePresence = true): boolean {
    if (EmptyUtil.isNullOrUndefined(saleRate) || saleRate === 0 || !Filters.isUsingAPI()) {
      return true;
    }
    const item: AuctionItem = this.auctionService.getById(itemID),
      minSaleRatePercent = saleRate / 100;
    if (!item && !requirePresence && !saleRate) {
      return true;
    }
    // Original param used: regionSaleRate
    return item && (
      item.past7DaysSaleRate || item.past14DaysSaleRate || item.past30DaysSaleRate || item.totalSaleRate
    ) >= minSaleRatePercent;
  }

  public static isDailySoldMatch(itemID: number, avgDailySold: number, requirePresence = true): boolean {
    if (EmptyUtil.isNullOrUndefined(avgDailySold) || avgDailySold === 0 || !Filters.isUsingAPI()) {
      return true;
    }

    const auctionItem: AuctionItem = this.auctionService.getById(itemID);
    if (!auctionItem && requirePresence) {
      return false;
    }

    if (auctionItem && Filters.isUsingAPI() && avgDailySold && avgDailySold > 0) {
      return auctionItem.avgDailySold >= avgDailySold;
    }
    return true;
  }

  public static isItemClassMatch(itemID: number, itemClassIndex: number, itemSubClassIndex: number): boolean {
    const classForId = SharedService.items[itemID] ? SharedService.items[itemID].itemClass : -1;
    if (EmptyUtil.isNullOrUndefined(itemClassIndex) || itemClassIndex === -1) {
      return true;
    }
    const iClass: ItemClass = ItemClassService.map.value.get(itemClassIndex);

    return !iClass || classForId === iClass.id &&
      this.isItemSubclassMatch(itemID, iClass.map, itemSubClassIndex);
  }

  private static isItemSubclassMatch(itemID: number, subClasses: Map<number, ItemClass>, itemSubClassIndex: number): boolean {
    const subClassForId = SharedService.items[itemID] ? SharedService.items[itemID].itemSubClass : -1;

    if (EmptyUtil.isNullOrUndefined(itemSubClassIndex) || itemSubClassIndex === -1) {
      return true;
    }
    const iSubClass = subClasses.get(itemSubClassIndex);

    return !iSubClass || subClassForId === iSubClass.id;
  }

  public static isUsingAPI(): boolean {
    return true; // SharedService.user.apiToUse !== 'none';
  }

  /* istanbul ignore next */
  private static getItemName(itemID): string {
    return SharedService.items[itemID] ?
      SharedService.items[itemID].name : '';
  }

  public static isExpansionMatch(itemID: number, expansionId: number, isClassic: boolean): boolean {
    const item: Item = SharedService.items[itemID] as Item;

    if (
      isClassic && item &&
      item.classicPhase <= GameBuild.latestClassicPhase &&
      item.expansionId === GameBuild.latestClassicExpansion
    ) {
      return false;
    }

    // If we are on classic, and the recipe is for an expansion after TBC
    if (item && isClassic && item.expansionId > 1) {
      return false;
    }

    if (EmptyUtil.isNullOrUndefined(expansionId) || expansionId === -1) {
      return true;
    }
    return item &&
      expansionId === item.expansionId;
  }

  static recipeIsProfessionMatch(id: number, professionId: number) {

    if (!professionId) {
      return true;
    }
    if (professionId === -1) {
      professionId = null;
    }

    const recipe: Recipe = CraftingService.map.value.get(id);

    if (!recipe) {
      return false;
    }

    return recipe.professionId === professionId ||
      !recipe.professionId && professionId === 0;
  }

  static isProfessionMatch(itemID: number, professionId: number) {
    const recipes: Recipe[] = CraftingService.itemRecipeMap[itemID];

    if (!professionId) {
      return true;
    }

    if (!recipes || !recipes[0]) {
      return false;
    }

    return recipes[0].professionId === professionId ||
      !recipes[0].professionId && professionId === 0;
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

  /**
   * Checks if the quantity available is greater than or equal to the given value
   * @param id - AuctionItem id
   * @param quantity - The minimum number of auctions
   * @param comparisonSetOne
   */
  static isQuantityAbove(id: string, quantity: number, auctionItem: AuctionItem) {
    if (EmptyUtil.isNullOrUndefined(quantity) || quantity === 0) {
      return true;
    }

    auctionItem = this.auctionService.getById(id);
    if (!auctionItem) {
      return false;
    }

    if (auctionItem && quantity && quantity > 0) {
      return auctionItem.quantityTotal >= quantity;
    }
    return true;
  }
}