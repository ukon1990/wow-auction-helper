import { SharedService } from '../../services/shared.service';
import { Item } from '../item/item';

export class CustomPrices {
  public static add(item: Item): void {
    if (!SharedService.customPricesMap[item.id]) {
      const customPrice = new CustomPrice(item);
      SharedService.customPricesMap[item.id] = customPrice;
      SharedService.user.customPrices.push(customPrice);
      CustomPrices.save();
    }
  }

  public static remove(customPrice: CustomPrice, index: number): void {
    SharedService.user.customPrices.splice(index, 1);
    delete SharedService.customPricesMap[customPrice.itemID];
    CustomPrices.save();
  }

  public static createMap(customPrices: Array<CustomPrice>): void {
    customPrices.forEach(c =>
      SharedService.customPricesMap[c.itemID] = c);
  }

  public static convertFromOldVersion(customPrice: any): Array<CustomPrice> {
    const cp = new Array<CustomPrice>();
    Object.keys(customPrice).forEach(key => {
      cp.push({itemID: parseInt(key, 10), name: undefined, price: customPrice[key]});
    });
    return cp;
  }

  public static save(): void {
    localStorage['custom_prices'] = JSON.stringify(SharedService.user.customPrices);
  }
}

export class CustomPrice {
  itemID: number;
  name: string;
  price: number;

  constructor(item?: Item) {
    if (item) {
      this.itemID = item.id;
      this.name = item.name;
      this.price = 0;
    }
  }
}
