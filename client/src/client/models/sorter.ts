import {AuctionsService} from '../services/auctions.service';
import {FormGroup} from '@angular/forms';

export class Key {
  constructor(
    public key: string, public desc: boolean, public divideByQuantity: boolean,
    public byPercent?: boolean, public percentOf?: string
  ) {
  }
}

export class Sorter {
  readonly auctionDuration = {
    'VERY_LONG': 4,
    'LONG': 3,
    'MEDIUM': 2,
    'SHORT': 1
  };

  keys: Key[] = [];

  /**
   * @param auctionService Is requiered if there is any need to get a auctionItem object from within the sorter
   */
  constructor(private auctionService?: AuctionsService) {
  }

  addKey(key: string, divideByQuantity: boolean = false, sortDesc: boolean = true): void {
    if (this.findKeyIndex(key) > -1) {
      this.getKey(key).divideByQuantity = divideByQuantity ? divideByQuantity : false;
      this.getKey(key).desc = !this.getKey(key).desc;
    } else {
      this.keys = [];
      this.keys.push(
        new Key(key, sortDesc, divideByQuantity ? divideByQuantity : false));
    }
  }

  sort(arr: any[], customSort?: Function): void {
    if (customSort) {
      customSort(arr);
      return;
    }
    arr.sort((a, b) => {
      for (let i = this.keys.length - 1; i >= 0; i--) {
        if (this.getItemToSort(this.keys[i], a) === this.getItemToSort(this.keys[i], b)) {
          continue;
        }

        if (!this.keys[i].desc) {
          if (this.isString(a, i)) {
            return this.getItemToSort(this.keys[i], b).localeCompare(this.getItemToSort(this.keys[i], a));
          } else {
            return this.getItemToSort(this.keys[i], a) - this.getItemToSort(this.keys[i], b);
          }
        } else {
          if (this.isString(a, i)) {
            return this.getItemToSort(this.keys[i], a).localeCompare(this.getItemToSort(this.keys[i], b));
          } else {
            return this.getItemToSort(this.keys[i], b) - this.getItemToSort(this.keys[i], a);
          }
        }
      }
      return 0;
    });
  }

  getItemToSort(key: Key, item: any): any {
    const isFormControl = item instanceof FormGroup;
    const value = isFormControl ? item.getRawValue()[key.key] : item[key.key];

    if (key.key === 'timeLeft') {
      return this.auctionDuration[item[key.key]];
    } else if (key.byPercent) {
      return value ?
        value : this.getAuctionItem(item) ?
          this.getAuctionItem(item)[key.key] / this.getAuctionItem(item)[key.percentOf] : false;
    } else {
      if (key.divideByQuantity) {
        return value ?
          value / item.quantity : this.getAuctionItem(item) ?
            this.getAuctionItem(item)[key.key] / this.getAuctionItem(item).quantity : false;
      } else {
        return value ?
          value : this.getAuctionItem(item) ?
            this.getAuctionItem(item)[key.key] : false;
      }
    }
  }

  private getAuctionItem(item: any): any {
    return this.auctionService ? this.auctionService.getById(
      item.item || item.itemID || item.id) : undefined;
  }

  private isString(object: any, index): boolean {
    return typeof this.getItemToSort(this.keys[index], object) === 'string';
  }

  removeKey(key: string): void {
    // Logic
  }

  findKeyIndex(key: string): number {
    for (let i = 0, x = this.keys.length; i < x; i++) {
      if (key === this.keys[i].key) {
        return i;
      }
    }
    return -1;
  }

  getKey(key: string): Key {
    return this.keys[this.findKeyIndex(key)];
  }
}