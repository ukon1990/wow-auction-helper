import { AuctionItem } from './auction/auction-item';
import { SharedService } from '../services/shared.service';
import { itemClasses } from './item/item-classes';
import { FormGroup, FormControl, AbstractControl } from '@angular/forms/src/model';
import { Item } from './item/item';

export class Filters {
  public static isNameMatch(itemID: number, form: FormGroup): boolean {
    if (form.value.name === null || form.value.name.length === 0) {
      return true;
    }
    return Filters.getItemName(itemID).toLowerCase().indexOf(form.value.name.toLowerCase()) > -1;
  }

  public static isBelowMarketValue(itemID: number, form: FormGroup): boolean {
    if (Filters.isUsingAPI() && (form.value.mktPrice === null || form.value.mktPrice === 0)) {
      return true;
    } else if (Filters.isUsingAPI() && SharedService.auctionItemsMap[itemID].mktPrice === 0) {
      return false;
    } else if (Filters.isUsingAPI()) {
      return Math.round((
        SharedService.auctionItemsMap[itemID].buyout / SharedService.auctionItemsMap[itemID].mktPrice
        ) * 100) <= form.value.mktPrice;
    }
    return true;
  }

  public static isBelowVendorPrice(itemID: number, form: FormGroup): boolean {
    if (form.value.onlyVendorSellable) {
      return SharedService.auctionItemsMap[itemID].vendorSell > 0 &&
        SharedService.auctionItemsMap[itemID].buyout <= SharedService.auctionItemsMap[itemID].vendorSell &&
        SharedService.auctionItemsMap[itemID].bid <= SharedService.auctionItemsMap[itemID].vendorSell;
    }
    return true;
  }

  public static isItemAboveQuality(id: number, form: FormGroup): boolean {
    if (typeof form.getRawValue().minItemQuality !== 'number') {
      return true;
    }
    return (SharedService.items[id] as Item).quality >= form.getRawValue().minItemQuality;
  }

  public static isAboveItemLevel(id: number, form: FormGroup): boolean {
    if (typeof form.getRawValue().minItemLevel !== 'number') {
      return true;
    }
    return (SharedService.items[id] as Item).itemLevel >= form.getRawValue().minItemLevel;
  }

  public static isSaleRateMatch(itemID: number, form: FormGroup): boolean {
    if (Filters.isUsingAPI() && form.value.saleRate && form.value.saleRate > 0) {
      return SharedService.auctionItemsMap[itemID].regionSaleRate >= form.value.saleRate / 100;
    }
    return true;
  }

  public static isDailySoldMatch(itemID: number, form: FormGroup): boolean {
    if (Filters.isUsingAPI() && form.value.avgDailySold && form.value.avgDailySold > 0) {
      return SharedService.auctionItemsMap[itemID].avgDailySold >= form.value.avgDailySold;
    }
    return true;
  }

  public static isItemClassMatch(itemID: number, form: FormGroup): boolean {
    const itemClass = SharedService.items[itemID] ? SharedService.items[itemID].itemClass : -1;

    if (form.value.itemClass === null || form.value.itemClass === '-1' || form.value.itemClass === -1) {
      return true;
    } else if (itemClasses.classes[form.value.itemClass] &&
      parseInt(itemClass, 10) === itemClasses.classes[form.value.itemClass].class) {
      return Filters.isItemSubclassMatch(itemID, itemClasses.classes[form.value.itemClass], form);
    }

    return false;
  }

  public static isItemSubclassMatch(itemID: number, subClasses: any, form: FormGroup): boolean {
    const subClass = SharedService.items[itemID] ? SharedService.items[itemID].itemSubClass : -1;

    if (form.value.itemSubClass === null || form.value.itemSubClass === -1 ||
      form.value.itemSubClass === '-1' || form.value.itemSubClass === undefined) {
      return true;
    } else {
      if (!subClasses.subclasses[form.value.itemSubClass]) {
        form.controls['itemSubClass'].setValue('-1');
        return true;
      }
      return subClass > -1 ?
        subClasses.subclasses[form.value.itemSubClass].subclass === parseInt(subClass, 10) : false;
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

  public static isExpansionMatch(itemID: number, form: AbstractControl): boolean {
    try {
      return form.value === null ||
        form.value === undefined ||
        form.value === (SharedService.items[itemID] as Item).expansionId;
    } catch (error) {
      return false;
    }
  }
}
