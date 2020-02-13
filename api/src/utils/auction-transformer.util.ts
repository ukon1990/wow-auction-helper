import {AuctionV2} from '../models/auction/auction-v2.model';

export class AuctionTransformerUtil {
  static transform({auctions}: any) {
    const keyMap = {
      unit_price: 1,
      buyout: 1,
      bid: 1
    };
    auctions.forEach((auc: AuctionV2) => {
      if (auc.buyout && auc.quantity && auc.quantity > keyMap.buyout) {
        keyMap.buyout = auc.quantity;
      }

      if (auc.unit_price && auc.quantity && auc.quantity > keyMap.unit_price) {
        keyMap.unit_price = auc.quantity;
      }

      if (auc.bid && auc.quantity && auc.quantity > keyMap.bid) {
        keyMap.bid = auc.quantity;
      }
    });
    return keyMap;
  }
}
