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

  public static setSellerData(auction: Auction): void {
    if (!SharedService.items[auction.item]) {
      return;
    }
    const id = SharedService.items[auction.item].itemClass;

    if (!SharedService.sellersMap[auction.owner]) {
      SharedService.sellersMap[auction.owner] = new Seller(auction.owner, auction.ownerRealm, auction.buyout, auction.quantity, auction);
      SharedService.sellers.push(SharedService.sellersMap[auction.owner]);
    } else {
      SharedService.sellersMap[auction.owner].liquidity += auction.buyout;
      SharedService.sellersMap[auction.owner].volume += auction.quantity;
      SharedService.sellersMap[auction.owner].numOfAuctions++;
      SharedService.sellersMap[auction.owner].auctions.push(auction);
    }

    // If none exist
    if (!SharedService.sellersByItemClassesMap[id]) {
      SharedService.sellersByItemClassesMap[id] = new Map<string, ItemClassGroup>();
      SharedService.sellersByItemClassesMap[id] = new ItemClassGroup(auction);
    } else {
      SharedService.sellersByItemClassesMap[id].add(auction);
    }
  }

  public static clearSellers(): void {
    Object.keys(SharedService.sellersMap).forEach(key => {
      delete SharedService.sellersMap[key];
    });
    Object.keys(SharedService.sellersByItemClassesMap).forEach(key => {
      delete SharedService.sellersByItemClassesMap[key];
    });

    SharedService.sellers.length = 0;
    SharedService.sellersByItemClass.length = 0;
  }

  public static setItemClasses(): void {
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
