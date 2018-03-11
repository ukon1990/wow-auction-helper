import { AuctionItem } from './auction/auction-item';
import { SharedService } from '../services/shared.service';

export class Sorter {
  readonly auctionDuration = {
    'VERY_LONG': 4,
    'LONG': 3,
    'MEDIUM': 2,
    'SHORT': 1
  };

  keys: Key[] = [];

  addKey(key: string, divideByQuantity?: boolean): void {
    if (this.findKeyIndex(key) > -1) {
      this.getKey(key).desc = !this.getKey(key).desc;
    } else {
      this.keys = [];
      this.keys.push(
        new Key(key, true, divideByQuantity ? divideByQuantity : false));
    }
  }

  sort(arr: any[]): void {
    arr.sort((a, b) => {
      for (let i = this.keys.length - 1; i >= 0; i--) {
        if (this.getItemToSort(this.keys[i], a) === this.getItemToSort(this.keys[i], b)) {
          continue;
        }

        if (this.keys[i].desc) {
          if (this.isString(a, i)) {
            return this.getItemToSort(this.keys[i], b).localeCompare(this.getItemToSort(this.keys[i], a));
          } else {
            return this.getItemToSort(this.keys[i], a) < this.getItemToSort(this.keys[i], b) ? 1 : -1;
          }
        } else {
          if (this.isString(a, i)) {
            return this.getItemToSort(this.keys[i], a).localeCompare(this.getItemToSort(this.keys[i], b));
          } else {
            return this.getItemToSort(this.keys[i], a) > this.getItemToSort(this.keys[i], b) ? 1 : -1;
          }
        }
      }
      return 0;
    });
  }

  getItemToSort(key: Key, item: any): any {
    if (key.key === 'timeLeft') {
      return this.auctionDuration[item[key.key]];
    } else if (key.byPercent) {
      return item[key.key] ?
        item[key.key] : this.getAuctionItem(item) ?
          this.getAuctionItem(item)[key.key] / this.getAuctionItem(item)[key.percentOf] : false;
    } else {
      if (key.divideByQuantity) {
        return item[key.key] ?
          item[key.key] / item.quantity : this.getAuctionItem(item) ?
            this.getAuctionItem(item)[key.key] / this.getAuctionItem(item).quantity : false;
      } else {
        return item[key.key] ?
          item[key.key] : this.getAuctionItem(item) ?
            this.getAuctionItem(item)[key.key] : false;
      }
    }
  }

  private getAuctionItem(item: any): any {
    return SharedService.auctionItemsMap[item.item ? item.item : item.itemID];
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

export class Key {
  constructor(
    public key: string, public desc: boolean, public divideByQuantity: boolean,
    public byPercent?: boolean, public percentOf?: string
  ) { }
}
