import { Auction } from './auction/auction';
import { SharedService } from '../services/shared.service';
import { itemClasses } from './item/item-classes';

export class Seller {

  name: string;
  realm: string;
  liquidity: number;
  volume: number;
  numOfAuctions = 1;
  auctions: Array<Auction> = new Array<Auction>();

  constructor(name: string, realm: string, liquidity: number, volume: number, auction: Auction) {
    this.name = name;
    this.realm = realm;
    this.liquidity = liquidity;
    this.volume = volume;
    this.auctions.push(auction);
  }


  public static organize(): void {
    let id;
    Object.keys(SharedService.sellersMap)
      .forEach(key => {
        delete SharedService.sellersMap[key];
      });
      Object.keys(SharedService.sellersByItemClassesMap)
      .forEach(key => {
        delete SharedService.sellersByItemClassesMap[key];
      });
    SharedService.sellers.length = 0;
    SharedService.sellersByItemClass.length = 0;

    SharedService.auctions.forEach(a => {
      if (!SharedService.items[a.item]) {
        console.log(a.item);
        return;
      }
      id = SharedService.items[a.item].itemClass;

      if (!SharedService.sellersMap[a.owner]) {
        SharedService.sellersMap[a.owner] = new Seller(a.owner, a.ownerRealm, a.buyout, a.quantity, a);
        SharedService.sellers.push(SharedService.sellersMap[a.owner]);
      } else {
        SharedService.sellersMap[a.owner].liquidity += a.buyout;
        SharedService.sellersMap[a.owner].volume += a.quantity;
        SharedService.sellersMap[a.owner].numOfAuctions++;
        SharedService.sellersMap[a.owner].auctions.push(a);
      }

      // If none exist
      if (!SharedService.sellersByItemClassesMap[id]) {
        SharedService.sellersByItemClassesMap[id] = new Map<string, ItemClassGroup>();
        SharedService.sellersByItemClassesMap[id] = new ItemClassGroup(a);
      } else {
        SharedService.sellersByItemClassesMap[id].add(a);
      }
    });

    itemClasses.classes.forEach(c => {
      if (SharedService.sellersByItemClassesMap[c.class]) {
        SharedService.sellersByItemClassesMap[c.class].name = c.name;
        SharedService.sellersByItemClass.push(SharedService.sellersByItemClassesMap[c.class]);
      }
    });
  }
}

/**
 * Bad pracise. but it will remain here until I come up with a better way of solving this without having to iterate over the auctions again
 */
export class ItemClassGroup {
  id: number;
  name = '';
  sellersMap = new Map<string, Seller>();
  sellers = new Array<Seller>();
  auctions = new Array<Auction>();

  constructor(auction: Auction) {
    this.id = SharedService.items[auction.item].itemClass;
    this.add(auction);
  }

  add(auction: Auction) {
    if (!this.sellersMap[auction.owner]) {
      this.sellersMap[auction.owner] = new Seller(auction.owner, auction.ownerRealm, auction.buyout, auction.quantity, auction);
      this.sellers.push(this.sellersMap[auction.owner]);
    } else {
      this.sellersMap[auction.owner].liquidity += auction.buyout;
      this.sellersMap[auction.owner].volume += auction.quantity;
      this.sellersMap[auction.owner].numOfAuctions++;
      this.sellersMap[auction.owner].auctions.push(auction);
    }
  }
}
