import {AuctionItem} from '../../auction/models/auction-item.model';
import {SharedService} from '../../../services/shared.service';
import {Item} from '../../../models/item/item';
import {TSM} from '../../auction/models/tsm.model';

export class VendorItem {
  id: number;
  price: number;
  unitPrice: number;
  currency: number;
  stock: number;
  stackSize: number;
}

export class DroppedItem {
  id: number;
  dropped: number;
  outOf: number;
  dropChance: number;

  static getScoredItem(dropped: DroppedItem) {
    const item: Item = SharedService.items[dropped.id],
      auctionItem: AuctionItem = SharedService.auctionItemsMap[dropped.id],
      tsmItem: TSM = SharedService.tsm[dropped.id],
      buyout = auctionItem ? auctionItem.buyout : 0,
      vendorValue = item ? item.sellPrice * dropped.dropChance : 0,
      buyoutValue = buyout * dropped.dropChance,
      saleRate = tsmItem ? tsmItem.RegionSaleRate : 0,
      mktValue = tsmItem ? tsmItem.MarketValue || tsmItem.RegionMarketAvg : 0,
      score = (vendorValue / buyoutValue) * 100;

    return {
      id: dropped.id,
      name: item ? item.name : '',
      dropChance: dropped.dropChance,
      vendorValue,
      sellPrice: item ? item.sellPrice : 0,
      buyoutValue,
      buyout,
      saleRate,
      mktValue,
      score
    };
  }

  private static getScore(vendorValue: number, buyoutValue: number, saleRate: number, mktValue: number, avgDailySold: number) {
    if (saleRate && mktValue) {
      let goldValue = vendorValue;
      if (vendorValue < buyoutValue) {
        goldValue = (buyoutValue / mktValue < 3 ? buyoutValue : mktValue) / 1000000;
      }
      return  goldValue * (avgDailySold * saleRate);
    }
    return 0;
  }
}

export class SkinnedItem {
  id: number;
  count: number;
  dropChance: number;
}

export class NPC {
  id: number;
  name: string;
  zoneId: number;
  coordinates: Coordinates[] = [];
  sells: VendorItem[] = [];
  drops: DroppedItem[] = [];
  skinning: SkinnedItem[] = [];
  expansionId?: number;
  isAlliance: boolean;
  isHorde: boolean;
  minLevel?: number;
  maxLevel?: number;
  tag: string;
  type: number;
  classification: number;
  avgGoldDrop: number;

  static calculateValueOfDrops(drops: DroppedItem[]) {
    let buyoutValue = 0, score = 0, vendorValue = 0;
    if (drops) {
      drops.forEach(item => {
       const scored = DroppedItem.getScoredItem(item);
        score += scored.score;
        buyoutValue = scored.buyoutValue;
        vendorValue = scored.vendorValue;
      });
    }

    return {
      vendorValue,
      buyoutValue,
      score
    };
  }

  static calculateVendorValue(sells: VendorItem[]) {
    let limitedSupplyCount = 0, roi = 0;
    if (sells) {
      sells.forEach(item => {
        if (item.stock > 0) {
          limitedSupplyCount++;
        }
        roi = this.calculateSellerVendorItemROI(item, roi).roi;
      });
    }

    return {
      limitedSupplyCount, roi
    };
  }

  static calculateSellerVendorItemROI(item: VendorItem, roi: number = 0) {
    const auctionItem: AuctionItem = SharedService.auctionItemsMap[item.id],
      tsm: TSM = SharedService.tsm[item.id];
    if (auctionItem && item.unitPrice < auctionItem.buyout) {
      roi += auctionItem.buyout - item.unitPrice;
    } else if (!auctionItem && tsm && item.unitPrice < tsm.RegionMarketAvg) {
      roi += tsm.RegionMarketAvg - item.unitPrice;
    }
    return {
      roi,
      buyout: auctionItem && auctionItem.buyout || 0
    };
  }
}
