import {Auction} from '../../auction/models/auction.model';
import {SharedService} from '../../../services/shared.service';
import {ItemClassGroup} from '../models/item-class-group.model';
import {itemClasses} from '../../../models/item/item-classes';
import {Seller} from '../models/seller.model';

export class SellerUtil {
  public static setData(auction: Auction): void {
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

  public static clear(): void {
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
