import {AuctionV2} from '../../models/auction/auction-v2.model';
import {Auction} from '../../models/auction/auction';

export class AuctionTransformerUtil {
  static transform(auction: AuctionV2 | Auction) {

    // In case it is the "old" API format
    if ((auction as any).auc) {
      return (auction as any) as Auction;
    } else {
      const result: Auction = new Auction();
      auction = auction as AuctionV2;

      result.auc = auction.id;
      result.item = auction.item.id;
      result.bid = auction.bid || 0;
      result.buyout = (auction.unit_price || auction.buyout) * auction.quantity;
      result.quantity = auction.quantity;
      result.timeLeft = auction.time_left;
      result.context = auction.item.context;
      result.petSpeciesId = auction.item.pet_species_id;
      result.petBreedId = auction.item.pet_breed_id;
      result.petLevel = auction.item.pet_level;
      result.petQualityId = auction.item.pet_quality_id;
      if (auction.item.bonus_lists) {
        result.bonusLists = auction.item.bonus_lists.map(id => ({bonusListId: id}));
      }
      result.modifiers = auction.item.modifiers;
      return result;
    }
  }

  static transformAll({auctions}: any) {
    const list: Auction[] = [];
    for (let i = 0, length = auctions.length; i < length; i++) {
      const auction: Auction = this.transform(auctions[i]);
      list.push(auction);
    }
    return list;
  }
}
