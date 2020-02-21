import {AuctionV2} from '../models/auction/auction-v2.model';
import {Auction} from '../models/auction/auction';

export class AuctionTransformerUtil {
  static transform({auctions}: any) {
    const list: Auction[] = [];
    for (let i = 0, length = auctions.length; i < length; i++) {
      const auction: Auction = new Auction(),
        auc: AuctionV2 = auctions[i];

      auction.auc = auc.id;
      auction.item = auc.item.id;
      auction.bid = auc.bid || 0;
      auction.buyout = auc.unit_price || auc.buyout;
      auction.quantity = auc.quantity;
      auction.timeLeft = auc.time_left;
      auction.context = auc.item.context;
      auction.petSpeciesId = auc.item.pet_species_id;
      auction.petBreedId = auc.item.pet_breed_id;
      auction.petLevel = auc.item.pet_level;
      auction.petQualityId = auc.item.pet_quality_id;
      if (auc.item.bonus_lists) {
        auction.bonusLists = auc.item.bonus_lists.map(id => ({bonusListId: id}));
      }
      auction.modifiers = auc.item.modifiers;
      list.push(auction);
    }
    return list;
  }
}
